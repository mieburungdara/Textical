/**
 * Textical Web Client - Main Entry Point
 * Initializes and starts the application
 */
(function() {
    'use strict';

    // Application state
    let isInitialized = false;

    /**
     * Initialize the application
     */
    async function init() {
        if (isInitialized) return;
        isInitialized = true;

        console.log('[Main] Initializing Textical Web Client...');

        try {
            // Initialize UI FIRST (cache elements, bind events)
            UI.init();
            
            // NOW show loading screen (elements are cached)
            UI.showScreen('loading');
            UI.updateLoadingProgress(5, 'Initializing...');
            UI.updateLoadingProgress(10, 'UI initialized');

            // Check for existing session
            const hasSession = API.hasSession();
            
            if (hasSession) {
                UI.updateLoadingProgress(20, 'Restoring session...');
                
                try {
                    // Try to restore session
                    await restoreSession();
                } catch (error) {
                    console.warn('[Main] Session restore failed:', error);
                    // Clear invalid session
                    API.clearSession();
                    UI.showScreen('login');
                }
            } else {
                UI.updateLoadingProgress(100, 'Ready');
                UI.showScreen('login');
            }

            console.log('[Main] Initialization complete');

        } catch (error) {
            console.error('[Main] Initialization failed:', error);
            UI.showScreen('login');
            UI.showLoginError('Failed to initialize. Please refresh the page.');
        }
    }

    /**
     * Restore existing session
     */
    async function restoreSession() {
        UI.updateLoadingProgress(30, 'Connecting to server...');

        // Initialize socket
        await Socket.init();
        UI.updateLoadingProgress(50, 'Authenticating...');

        // Authenticate with socket
        await Socket.authenticate(API.userId, API.sessionToken);
        UI.updateLoadingProgress(70, 'Loading game data...');

        // Load game data
        await Game.init();
        UI.updateLoadingProgress(90, 'Rendering...');

        // Show game screen
        UI.refreshAll();
        UI.showScreen('game');
        UI.updateLoadingProgress(100, 'Ready!');

        UI.addLogEntry('Session restored. Welcome back!', 'success');
    }

    /**
     * Handle page visibility changes
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            console.log('[Main] Page hidden');
            // Could pause certain updates here
        } else {
            console.log('[Main] Page visible');
            // Could refresh data here
            if (API.hasSession() && Socket.isConnected) {
                // Request sync
                Socket.requestSync();
            }
        }
    }

    /**
     * Handle before unload
     */
    function handleBeforeUnload(e) {
        if (Game.currentTask && Game.currentTask.status === 'RUNNING') {
            e.preventDefault();
            e.returnValue = 'You have an active task. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Handle online/offline status
     */
    function handleOnlineStatus() {
        if (navigator.onLine) {
            UI.addLogEntry('Connection restored.', 'success');
            // Try to reconnect socket if needed
            if (API.hasSession() && !Socket.isConnected) {
                Socket.reconnect();
            }
        } else {
            UI.addLogEntry('Connection lost. Please check your internet.', 'error');
        }
    }

    /**
     * Register service worker for offline support (optional)
     */
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('[Main] ServiceWorker registered:', registration.scope);
            } catch (error) {
                console.warn('[Main] ServiceWorker registration failed:', error);
            }
        }
    }

    /**
     * Setup global error handler
     */
    function setupErrorHandler() {
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('[Main] Global error:', message, source, lineno, colno, error);
            UI.addLogEntry('An error occurred. Please check console.', 'error');
            return false;
        };

        window.onunhandledrejection = function(event) {
            console.error('[Main] Unhandled rejection:', event.reason);
            UI.addLogEntry('An unexpected error occurred.', 'error');
        };
    }

    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle if not in input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Escape - close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }

            // Number keys for panel switching
            if (e.key >= '1' && e.key <= '8') {
                const panels = ['town', 'heroes', 'inventory', 'quests', 'map', 'market', 'tavern', 'crafting'];
                const index = parseInt(e.key) - 1;
                if (panels[index]) {
                    UI.switchPanel(panels[index]);
                }
            }

            // Enter for chat focus
            if (e.key === 'Enter' && !e.ctrlKey && !e.altKey) {
                UI.elements.chatInput?.focus();
            }
        });
    }

    /**
     * Setup periodic updates
     */
    function setupPeriodicUpdates() {
        // Update task progress every second
        setInterval(() => {
            if (Game.currentTask && Game.currentTask.status === 'RUNNING') {
                const progress = Game.getTaskProgress();
                UI.elements.taskProgress.style.width = progress + '%';
                
                if (progress >= 100) {
                    UI.elements.currentTask.textContent = 'Completing...';
                }
            }
        }, 1000);

        // Refresh player data every 30 seconds
        setInterval(async () => {
            if (API.hasSession() && Socket.isConnected) {
                try {
                    const profile = await API.getUserProfile();
                    Game.updatePlayer(profile);
                    UI.updatePlayerHUD();
                } catch (error) {
                    console.warn('[Main] Failed to refresh player data:', error);
                }
            }
        }, 30000);
    }

    // ==========================================
    // Event Listeners
    // ==========================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Before unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Online/offline
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Setup handlers after init
    document.addEventListener('DOMContentLoaded', () => {
        setupErrorHandler();
        setupKeyboardShortcuts();
        setupPeriodicUpdates();
        // registerServiceWorker(); // Uncomment if you create a service worker
    });

    // ==========================================
    // Expose for debugging
    // ==========================================
    window.Textical = {
        API,
        Socket,
        Game,
        UI,
        CONFIG,
        debug: {
            getState: () => Game.serialize(),
            getSocket: () => Socket.socket,
            reconnect: () => Socket.reconnect(),
            clearSession: () => API.clearSession()
        }
    };

    console.log('[Main] Textical Web Client loaded');
    console.log('[Main] Access window.Textical for debugging');

})();
