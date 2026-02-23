/**
 * Textical Web Client - Socket Module
 * Handles WebSocket/Socket.io real-time communication
 */
const Socket = {
    // Socket.io instance
    socket: null,
    
    // Connection state
    isConnected: false,
    isAuthenticated: false,
    
    // Event callbacks
    callbacks: {
        connect: [],
        disconnect: [],
        error: [],
        taskUpdate: [],
        battleUpdate: [],
        chatMessage: [],
        notification: [],
        playerUpdate: [],
        worldUpdate: []
    },
    
    /**
     * Initialize socket connection
     * @returns {Promise<void>}
     */
    async init() {
        return new Promise((resolve, reject) => {
            try {
                // Check if socket.io is loaded
                if (typeof io === 'undefined') {
                    console.warn('[Socket] Socket.io not loaded, using fallback');
                    this._useFallback();
                    resolve();
                    return;
                }
                
                // Create socket connection
                this.socket = io(CONFIG.SOCKET_URL, {
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000
                });
                
                // Setup event handlers
                this._setupEventHandlers();
                
                // Wait for connection
                this.socket.on('connect', () => {
                    this.isConnected = true;
                    console.log('[Socket] Connected');
                    resolve();
                });
                
                // Handle connection error
                this.socket.on('connect_error', (error) => {
                    console.error('[Socket] Connection error:', error);
                    if (!this.isConnected) {
                        reject(new Error('Failed to connect to server'));
                    }
                });
                
            } catch (error) {
                console.error('[Socket] Init failed:', error);
                this._useFallback();
                resolve();
            }
        });
    },
    
    /**
     * Setup socket event handlers
     */
    _setupEventHandlers() {
        if (!this.socket) return;
        
        // Connection events
        this.socket.on('connect', () => {
            this.isConnected = true;
            this._triggerCallbacks('connect');
        });
        
        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            this.isAuthenticated = false;
            console.log('[Socket] Disconnected:', reason);
            this._triggerCallbacks('disconnect', reason);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
            this._triggerCallbacks('error', { type: 'connection', error });
        });
        
        // Authentication events
        this.socket.on('authenticated', () => {
            this.isAuthenticated = true;
            console.log('[Socket] Authenticated');
        });
        
        this.socket.on('unauthorized', (error) => {
            this.isAuthenticated = false;
            console.error('[Socket] Unauthorized:', error);
            this._triggerCallbacks('error', { type: 'session_invalid', error });
        });
        
        // Game events
        this.socket.on(CONFIG.SOCKET_EVENTS.TASK_UPDATE, (data) => {
            console.log('[Socket] Task update:', data);
            this._triggerCallbacks('taskUpdate', data);
        });
        
        this.socket.on(CONFIG.SOCKET_EVENTS.BATTLE_UPDATE, (data) => {
            console.log('[Socket] Battle update:', data);
            this._triggerCallbacks('battleUpdate', data);
        });
        
        this.socket.on(CONFIG.SOCKET_EVENTS.PLAYER_UPDATE, (data) => {
            this._triggerCallbacks('playerUpdate', data);
        });
        
        this.socket.on(CONFIG.SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, (data) => {
            this._triggerCallbacks('chatMessage', data);
        });
        
        this.socket.on(CONFIG.SOCKET_EVENTS.NOTIFICATION, (data) => {
            this._triggerCallbacks('notification', data);
        });
        
        this.socket.on(CONFIG.SOCKET_EVENTS.WORLD_UPDATE, (data) => {
            this._triggerCallbacks('worldUpdate', data);
        });
    },
    
    /**
     * Use fallback mode (no real-time updates)
     */
    _useFallback() {
        console.log('[Socket] Using fallback mode (polling)');
        this.isConnected = true;
        this.isAuthenticated = true;
        
        // Setup polling for updates
        setInterval(() => {
            if (API.hasSession()) {
                this._pollUpdates();
            }
        }, 5000);
    },
    
    /**
     * Poll for updates (fallback mode)
     */
    async _pollUpdates() {
        try {
            // This could be replaced with actual polling endpoints
            // For now, we just check player status
        } catch (error) {
            console.warn('[Socket] Poll error:', error);
        }
    },
    
    /**
     * Authenticate socket connection
     * @param {number} userId 
     * @param {string} token 
     * @returns {Promise<void>}
     */
    async authenticate(userId, token) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                // Fallback mode - assume authenticated
                this.isAuthenticated = true;
                resolve();
                return;
            }
            
            // Listen for auth response
            this.socket.once('authenticated', () => {
                this.isAuthenticated = true;
                resolve();
            });
            
            this.socket.once('unauthorized', (error) => {
                this.isAuthenticated = false;
                reject(new Error(error.message || 'Authentication failed'));
            });
            
            // Send auth request
            this.socket.emit(CONFIG.SOCKET_EVENTS.AUTHENTICATE, {
                userId,
                token
            });
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.isAuthenticated) {
                    reject(new Error('Authentication timeout'));
                }
            }, 10000);
        });
    },
    
    /**
     * Disconnect socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.isAuthenticated = false;
    },
    
    /**
     * Reconnect socket
     */
    reconnect() {
        if (this.socket) {
            this.socket.connect();
        } else {
            this.init();
        }
    },
    
    /**
     * Check if connected
     * @returns {boolean}
     */
    checkConnection() {
        return this.isConnected && (!this.socket || this.socket.connected);
    },
    
    // ==========================================
    // Event Registration
    // ==========================================
    
    /**
     * Register callback for connect event
     * @param {Function} callback 
     */
    onConnect(callback) {
        this.callbacks.connect.push(callback);
    },
    
    /**
     * Register callback for disconnect event
     * @param {Function} callback 
     */
    onDisconnect(callback) {
        this.callbacks.disconnect.push(callback);
    },
    
    /**
     * Register callback for error event
     * @param {Function} callback 
     */
    onError(callback) {
        this.callbacks.error.push(callback);
    },
    
    /**
     * Register callback for task update event
     * @param {Function} callback 
     */
    onTaskUpdate(callback) {
        this.callbacks.taskUpdate.push(callback);
    },
    
    /**
     * Register callback for battle update event
     * @param {Function} callback 
     */
    onBattleUpdate(callback) {
        this.callbacks.battleUpdate.push(callback);
    },
    
    /**
     * Register callback for chat message event
     * @param {Function} callback 
     */
    onChatMessage(callback) {
        this.callbacks.chatMessage.push(callback);
    },
    
    /**
     * Register callback for notification event
     * @param {Function} callback 
     */
    onNotification(callback) {
        this.callbacks.notification.push(callback);
    },
    
    /**
     * Register callback for player update event
     * @param {Function} callback 
     */
    onPlayerUpdate(callback) {
        this.callbacks.playerUpdate.push(callback);
    },
    
    /**
     * Register callback for world update event
     * @param {Function} callback 
     */
    onWorldUpdate(callback) {
        this.callbacks.worldUpdate.push(callback);
    },
    
    /**
     * Trigger callbacks for an event
     * @param {string} event 
     * @param {*} data 
     */
    _triggerCallbacks(event, data) {
        const callbacks = this.callbacks[event];
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[Socket] Callback error (${event}):`, error);
                }
            });
        }
    },
    
    // ==========================================
    // Emit Methods
    // ==========================================
    
    /**
     * Send chat message
     * @param {string} channel 
     * @param {string} message 
     */
    sendChatMessage(channel, message) {
        if (this.socket && this.isAuthenticated) {
            this.socket.emit(CONFIG.SOCKET_EVENTS.CHAT_MESSAGE, {
                channel,
                message
            });
        }
    },
    
    /**
     * Request sync from server
     */
    requestSync() {
        if (this.socket && this.isAuthenticated) {
            this.socket.emit(CONFIG.SOCKET_EVENTS.REQUEST_SYNC);
        }
    },
    
    /**
     * Join a room/channel
     * @param {string} room 
     */
    joinRoom(room) {
        if (this.socket && this.isAuthenticated) {
            this.socket.emit('join', room);
        }
    },
    
    /**
     * Leave a room/channel
     * @param {string} room 
     */
    leaveRoom(room) {
        if (this.socket && this.isAuthenticated) {
            this.socket.emit('leave', room);
        }
    }
};
