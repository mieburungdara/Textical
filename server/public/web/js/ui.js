/**
 * Textical Web Client - UI Module
 * Handles all UI rendering and updates
 */
const UI = {
    // DOM element cache
    elements: {},

    /**
     * Initialize UI
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupSocketCallbacks();
    },

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        // Screens
        this.elements.loadingScreen = document.getElementById('loading-screen');
        this.elements.loginScreen = document.getElementById('login-screen');
        this.elements.gameScreen = document.getElementById('game-screen');

        // Loading
        this.elements.loadingProgress = document.getElementById('loading-progress');
        this.elements.loadingText = document.getElementById('loading-text');

        // Login
        this.elements.loginForm = document.getElementById('login-form');
        this.elements.loginError = document.getElementById('login-error');

        // Top HUD
        this.elements.playerName = document.getElementById('player-name');
        this.elements.playerGold = document.getElementById('player-gold');
        this.elements.playerSilver = document.getElementById('player-silver');
        this.elements.playerEnergy = document.getElementById('player-energy');
        this.elements.playerLocation = document.getElementById('player-location');
        this.elements.gameTime = document.getElementById('game-time');

        // Panels
        this.elements.panelContainer = document.getElementById('panel-container');
        this.elements.sideNav = document.getElementById('side-nav');

        // Heroes
        this.elements.heroesList = document.getElementById('heroes-list');

        // Inventory
        this.elements.inventoryGrid = document.getElementById('inventory-grid');

        // Quests
        this.elements.questsList = document.getElementById('quests-list');

        // Map
        this.elements.worldMap = document.getElementById('world-map');
        this.elements.regionInfo = document.getElementById('region-info');

        // Market
        this.elements.marketListings = document.getElementById('market-listings');

        // Tavern
        this.elements.tavernStatus = document.getElementById('tavern-status');
        this.elements.energyRecovery = document.getElementById('energy-recovery');
        this.elements.btnEnterTavern = document.getElementById('btn-enter-tavern');
        this.elements.btnExitTavern = document.getElementById('btn-exit-tavern');
        this.elements.mercenariesList = document.getElementById('mercenaries-list');

        // Crafting
        this.elements.recipesList = document.getElementById('recipes-list');

        // Task
        this.elements.currentTask = document.getElementById('current-task');
        this.elements.taskProgressContainer = document.getElementById('task-progress-container');
        this.elements.taskProgress = document.getElementById('task-progress');

        // Log
        this.elements.logEvents = document.getElementById('log-events');
        this.elements.chatMessages = document.getElementById('chat-messages');
        this.elements.chatInput = document.getElementById('chat-input');

        // Modals
        this.elements.battleModal = document.getElementById('battle-modal');
        this.elements.heroModal = document.getElementById('hero-modal');
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Login form
        this.elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            this._handleLogin(username, password);
        });

        // Logout button
        document.getElementById('btn-logout').addEventListener('click', () => {
            this._handleLogout();
        });

        // Navigation
        this.elements.sideNav.addEventListener('click', (e) => {
            const btn = e.target.closest('.nav-btn');
            if (btn) {
                const panel = btn.dataset.panel;
                this.switchPanel(panel);
            }
        });

        // Town actions
        document.querySelector('.town-actions')?.addEventListener('click', (e) => {
            const card = e.target.closest('.action-card');
            if (card) {
                const action = card.dataset.action;
                this.switchPanel(action);
            }
        });

        // Tavern buttons
        this.elements.btnEnterTavern?.addEventListener('click', () => this._handleEnterTavern());
        this.elements.btnExitTavern?.addEventListener('click', () => this._handleExitTavern());

        // Battle button
        document.getElementById('btn-battle')?.addEventListener('click', () => this._handleBattle());

        // Gather button
        document.getElementById('btn-gather')?.addEventListener('click', () => this._handleGather());

        // Chat
        document.getElementById('btn-send-chat')?.addEventListener('click', () => this._handleChatSend());
        this.elements.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this._handleChatSend();
        });

        // Log tabs
        document.getElementById('log-tabs')?.addEventListener('click', (e) => {
            const tab = e.target.closest('.log-tab');
            if (tab) {
                const logType = tab.dataset.log;
                this._switchLogTab(logType);
            }
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        // Close battle modal
        document.getElementById('btn-close-battle')?.addEventListener('click', () => {
            this.elements.battleModal.classList.add('hidden');
        });
    },

    /**
     * Setup socket callbacks
     */
    setupSocketCallbacks() {
        Socket.onConnect(() => {
            this.updateLoadingProgress(50, 'Connected to server');
        });

        Socket.onDisconnect((reason) => {
            this.addLogEntry('Disconnected from server: ' + reason, 'error');
        });

        Socket.onError((error) => {
            if (error.type === 'session_invalid') {
                this.showScreen('login');
                this.showLoginError('Session expired. Please login again.');
            }
        });

        Socket.onTaskUpdate((data) => {
            this.updateTaskDisplay(data);
            if (data.type === 'completed') {
                this.addLogEntry(`Task completed: ${data.taskType}`, 'success');
                // Refresh data
                Game.loadPlayerData().then(() => this.refreshAll());
            }
        });

        Socket.onBattleUpdate((data) => {
            if (data.type === 'result') {
                this.showBattleResult(data);
            }
        });

        Socket.onChatMessage((data) => {
            this.addChatMessage(data);
        });

        Socket.onNotification((data) => {
            this.addLogEntry(data.message, data.type || 'info');
        });

        Socket.onPlayerUpdate((data) => {
            if (data.energy) {
                Game.player.energy = data.energy.current;
                this.updatePlayerHUD();
            }
            if (data.inventory) {
                Game.inventory = data.inventory;
                this.renderInventory();
            }
        });
    },

    // ==========================================
    // Screen Management
    // ==========================================

    showScreen(screenName) {
        this.elements.loadingScreen.classList.remove('active');
        this.elements.loginScreen.classList.remove('active');
        this.elements.gameScreen.classList.remove('active');

        switch (screenName) {
            case 'loading':
                this.elements.loadingScreen.classList.add('active');
                break;
            case 'login':
                this.elements.loginScreen.classList.add('active');
                break;
            case 'game':
                this.elements.gameScreen.classList.add('active');
                break;
        }
    },

    updateLoadingProgress(percent, text) {
        this.elements.loadingProgress.style.width = percent + '%';
        if (text) {
            this.elements.loadingText.textContent = text;
        }
    },

    showLoginError(message) {
        this.elements.loginError.textContent = message;
    },

    // ==========================================
    // Panel Management
    // ==========================================

    switchPanel(panelName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.panel === panelName);
        });

        // Update panels
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `panel-${panelName}`);
        });

        Game.setPanel(panelName);

        // Load panel-specific data
        this._loadPanelData(panelName);
    },

    _loadPanelData(panelName) {
        switch (panelName) {
            case 'heroes':
                this.renderHeroes();
                break;
            case 'inventory':
                this.renderInventory();
                break;
            case 'quests':
                this.renderQuests();
                break;
            case 'map':
                this.renderMap();
                break;
            case 'market':
                this.renderMarket();
                break;
            case 'tavern':
                this.renderTavern();
                break;
            case 'crafting':
                this.renderCrafting();
                break;
        }
    },

    // ==========================================
    // HUD Updates
    // ==========================================

    updatePlayerHUD() {
        this.elements.playerName.textContent = Game.player.displayName || Game.player.username;
        this.elements.playerGold.textContent = Game.player.gold || 0;
        this.elements.playerSilver.textContent = Game.player.silver || 0;
        this.elements.playerEnergy.textContent = Game.player.energy || 0;
        this.elements.playerLocation.textContent = Game.getCurrentLocationName();
        
        if (Game.worldState) {
            this.elements.gameTime.textContent = Game.formatGameTime(
                Game.worldState.day,
                Game.worldState.hour
            );
        }
    },

    updateTaskDisplay(data) {
        if (data.type === 'started' || (data.type === 'progress' && Game.currentTask)) {
            this.elements.currentTask.textContent = data.taskType || Game.currentTask?.type || 'Busy';
            this.elements.taskProgressContainer.classList.remove('hidden');
            
            if (data.progress) {
                this.elements.taskProgress.style.width = data.progress + '%';
            }
        } else if (data.type === 'completed' || data.type === 'cancelled') {
            this.elements.currentTask.textContent = 'Idle';
            this.elements.taskProgressContainer.classList.add('hidden');
            this.elements.taskProgress.style.width = '0%';
        }
    },

    // ==========================================
    // Render Methods
    // ==========================================

    renderHeroes() {
        const container = this.elements.heroesList;
        container.innerHTML = '';

        if (Game.heroes.length === 0) {
            container.innerHTML = '<p class="no-data">No heroes yet. Visit the tavern to recruit!</p>';
            return;
        }

        Game.heroes.forEach(hero => {
            const card = document.createElement('div');
            card.className = 'hero-card';
            
            // Get stats from various possible field names
            const hp = hero.currentHp || hero.hpBase || hero.hp_base || hero.maxHp || 100;
            const maxHp = hero.maxHp || hero.max_hp || hero.hpBase || hero.hp_base || 100;
            const atk = hero.attack || hero.atk || hero.damageBase || hero.damage_base || 10;
            const def = hero.defense || hero.def || hero.defenseBase || hero.defense_base || 5;
            const spd = hero.speed || hero.spd || hero.speedBase || hero.speed_base || 5;
            const className = hero.combatClass?.name || hero.className || 'Adventurer';
            const level = hero.classLevel || hero.level || hero.class_level || 1;
            
            card.innerHTML = `
                <div class="hero-name">${hero.name || 'Unknown Hero'}</div>
                <div class="hero-class">${className} Lv.${level}</div>
                <div class="hero-race">${hero.race || 'Human'}</div>
                <div class="hero-stats">
                    <div class="stat"><span>HP</span><span class="stat-value">${hp}/${maxHp}</span></div>
                    <div class="stat"><span>ATK</span><span class="stat-value">${atk}</span></div>
                    <div class="stat"><span>DEF</span><span class="stat-value">${def}</span></div>
                    <div class="stat"><span>SPD</span><span class="stat-value">${spd}</span></div>
                </div>
                <div class="hero-id" style="font-size: 10px; color: #666;">ID: ${hero.id}</div>
            `;
            card.addEventListener('click', () => this.showHeroDetail(hero.id));
            container.appendChild(card);
        });
    },

    renderInventory() {
        const container = this.elements.inventoryGrid;
        container.innerHTML = '';

        // Create 40 slots
        for (let i = 0; i < 40; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            const item = Game.inventory[i];
            if (item) {
                slot.innerHTML = `
                    <span class="item-icon">${CONFIG.ITEM_TYPES[item.type] || '📦'}</span>
                    ${item.quantity > 1 ? `<span class="item-count">${item.quantity}</span>` : ''}
                `;
                slot.title = item.name || `Item #${item.templateId}`;
                slot.addEventListener('click', () => this._handleItemClick(item));
            } else {
                slot.classList.add('empty');
            }
            
            container.appendChild(slot);
        }
    },

    renderQuests() {
        const container = this.elements.questsList;
        container.innerHTML = '';

        if (Game.quests.length === 0) {
            container.innerHTML = '<p class="no-data">No active quests.</p>';
            return;
        }

        Game.quests.forEach(quest => {
            const item = document.createElement('div');
            item.className = 'quest-item';
            item.innerHTML = `
                <h4>${quest.name || `Quest #${quest.id}`}</h4>
                <p>${quest.description || 'No description available.'}</p>
                <div class="quest-rewards">Rewards: ${quest.expReward || 0} XP, ${quest.goldReward || 0} Gold</div>
            `;
            container.appendChild(item);
        });
    },

    renderMap() {
        const container = this.elements.worldMap;
        container.innerHTML = '';

        Game.regions.forEach(region => {
            const cell = document.createElement('div');
            cell.className = `map-cell ${region.zoneType || 'GREEN'}`;
            cell.textContent = region.name;
            cell.title = `${region.name}\nType: ${region.zoneType}\nLevel: ${region.zoneLevel || 1}`;
            
            if (region.id === Game.player.currentRegion) {
                cell.classList.add('current');
            }
            
            cell.addEventListener('click', () => this._handleRegionClick(region));
            container.appendChild(cell);
        });
    },

    renderMarket() {
        const container = this.elements.marketListings;
        container.innerHTML = '<p class="no-data">Loading market...</p>';

        API.getMarketListings().then(data => {
            container.innerHTML = '';
            
            if (!data.listings || data.listings.length === 0) {
                container.innerHTML = '<p class="no-data">No items for sale.</p>';
                return;
            }

            data.listings.forEach(listing => {
                const item = document.createElement('div');
                item.className = 'market-item';
                item.innerHTML = `
                    <div class="item-info">
                        <h4>${listing.itemName || `Item #${listing.templateId}`}</h4>
                        <p>Seller: ${listing.sellerName || 'Unknown'}</p>
                    </div>
                    <div class="item-price">${listing.price} Gold</div>
                `;
                item.addEventListener('click', () => this._handleBuyItem(listing));
                container.appendChild(item);
            });
        }).catch(err => {
            container.innerHTML = '<p class="no-data">Failed to load market.</p>';
        });
    },

    renderTavern() {
        // Update status
        this.elements.tavernStatus.textContent = Game.player.isInTavern ? 'Inside Tavern' : 'Outside';
        this.elements.energyRecovery.textContent = Game.player.isInTavern ? '5' : '0';
        
        // Update buttons
        this.elements.btnEnterTavern.disabled = Game.player.isInTavern;
        this.elements.btnExitTavern.disabled = !Game.player.isInTavern;

        // Load mercenaries
        const container = this.elements.mercenariesList;
        container.innerHTML = '<p class="no-data">Loading mercenaries...</p>';

        API.getMercenaries().then(data => {
            container.innerHTML = '';
            
            if (!data.mercenaries || data.mercenaries.length === 0) {
                container.innerHTML = '<p class="no-data">No mercenaries available.</p>';
                return;
            }

            data.mercenaries.forEach(merc => {
                const card = document.createElement('div');
                card.className = 'hero-card';
                card.innerHTML = `
                    <div class="hero-name">${merc.name}</div>
                    <div class="hero-class">${merc.class || 'Mercenary'}</div>
                    <div class="hero-stats">
                        <div class="stat"><span>HP</span><span class="stat-value">${merc.hp || 100}</span></div>
                        <div class="stat"><span>Cost</span><span class="stat-value">${merc.cost || 100}g</span></div>
                    </div>
                `;
                card.addEventListener('click', () => this._handleRecruit(merc));
                container.appendChild(card);
            });
        }).catch(err => {
            container.innerHTML = '<p class="no-data">Failed to load mercenaries.</p>';
        });
    },

    renderCrafting() {
        const container = this.elements.recipesList;
        container.innerHTML = '';

        if (Game.recipes.length === 0) {
            container.innerHTML = '<p class="no-data">No recipes learned.</p>';
            return;
        }

        Game.recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <h4>${recipe.name || `Recipe #${recipe.id}`}</h4>
                <div class="materials">${recipe.materials || 'Materials needed'}</div>
                <button class="btn-secondary" onclick="UI._handleCraft(${recipe.id})">Craft</button>
            `;
            container.appendChild(card);
        });
    },

    // ==========================================
    // Modal Methods
    // ==========================================

    showHeroDetail(heroId) {
        const hero = Game.getHero(heroId);
        if (!hero) return;

        // Helper for safe value access with default
        const getVal = (field, def = 0) => hero[field] ?? hero[camelToSnake(field)] ?? def;
        const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        
        // Helper for percentage display
        const pct = (val) => val ? `${(val * 100).toFixed(1)}%` : '0%';
        const num = (val) => val ?? 0;

        // Basic Info
        const race = hero.race || 'Unknown';
        const className = hero.combatClass?.name || hero.class?.name || 'Adventurer';
        const unitLevel = getVal('unitLevel', 1);
        const classLevel = getVal('classLevel', 1);
        const unitXp = getVal('unitXp', 0);
        const classXp = getVal('classXp', 0);
        const generation = getVal('generation', 1);
        const isMain = hero.isMain ? '⭐ Main Hero' : '';

        // Core Attributes
        const str = getVal('str', 10);
        const dex = getVal('dex', 10);
        const int = getVal('int', 10);
        const vit = getVal('vit', 10);
        const luk = getVal('luk', 5);

        // Base Combat Stats
        const hpBase = getVal('hp_base', 100);
        const damageBase = getVal('damage_base', 10);
        const defenseBase = getVal('defense_base', 0);
        const speedBase = getVal('speed_base', 5);
        const rangeBase = getVal('range_base', 1);

        // Critical & Dodge
        const critChance = getVal('crit_chance', 0.05);
        const critDamage = getVal('crit_damage', 1.5);
        const dodgeChance = getVal('dodge_chance', 0.05);
        const blockChance = getVal('block_chance', 0);
        const parryChance = getVal('parry_chance', 0);

        // Elemental Damage
        const fireDmg = getVal('fire_damage', 0);
        const waterDmg = getVal('water_damage', 0);
        const earthDmg = getVal('earth_damage', 0);
        const windDmg = getVal('wind_damage', 0);
        const lightDmg = getVal('light_damage', 0);
        const darkDmg = getVal('dark_damage', 0);

        // Regeneration
        const hpRegen = getVal('hp_regen', 0);
        const manaRegen = getVal('mana_regen', 2);

        // Accuracy & Penetration
        const accuracy = getVal('accuracy_base', 100);
        const armorPen = getVal('armor_penetration', 0);

        // Power & Tenacity
        const skillPower = getVal('skill_power_base', 10);
        const tenacity = getVal('tenacity_base', 0);
        const blockPower = getVal('block_power_base', 0.5);
        const initiative = getVal('initiative_base', 0);

        // Lifesteal & Vamp
        const lifesteal = getVal('lifesteal_base', 0);
        const spellVamp = getVal('spell_vamp', 0);

        // Speed & Cooldown
        const cooldownReduction = getVal('cooldown_reduction', 0);
        const moveSpeed = getVal('move_speed', 100);
        const attackSpeed = getVal('attack_speed', 1.0);

        // Build equipment section
        let equipmentHtml = '';
        if (hero.equipment && hero.equipment.length > 0) {
            equipmentHtml = `
                <div class="hero-section">
                    <h4>⚔️ Equipment</h4>
                    <div class="equipment-grid">
                        ${hero.equipment.map(eq => {
                            const itemName = eq.item?.name || eq.itemName || `Item #${eq.itemInstanceId || eq.templateId}`;
                            const slot = eq.slotKey || eq.slot || 'Unknown';
                            return `
                                <div class="equipment-slot">
                                    <span class="slot-name">${slot.replace('_', ' ')}</span>
                                    <span class="item-name">${itemName}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Build skills section
        let skillsHtml = '';
        if (hero.skills && hero.skills.length > 0) {
            skillsHtml = `
                <div class="hero-section">
                    <h4>✨ Skills</h4>
                    <div class="skills-list">
                        ${hero.skills.map(hs => {
                            const skill = hs.skill || hs;
                            const skillName = skill.name || `Skill #${skill.id || hs.skillId}`;
                            const skillType = skill.type || skill.category || 'Active';
                            const manaCost = skill.manaCost || skill.mana_cost || 0;
                            return `
                                <div class="skill-item">
                                    <span class="skill-name">${skillName}</span>
                                    <span class="skill-type">${skillType}</span>
                                    ${manaCost > 0 ? `<span class="skill-cost">${manaCost} MP</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Build traits section if available
        let traitsHtml = '';
        if (hero.traits && hero.traits.length > 0) {
            traitsHtml = `
                <div class="hero-section">
                    <h4>🌟 Traits</h4>
                    <div class="traits-list">
                        ${hero.traits.map(trait => {
                            const traitName = trait.name || trait.trait?.name || `Trait`;
                            return `<span class="trait-badge">${traitName}</span>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Check if any elemental damage exists
        const hasElemental = fireDmg || waterDmg || earthDmg || windDmg || lightDmg || darkDmg;

        const container = document.getElementById('hero-detail');
        container.innerHTML = `
            <div class="hero-header">
                <h2>${hero.name} ${isMain}</h2>
                <div class="hero-subtitle">
                    <span class="hero-race">${race}</span>
                    <span class="hero-class">${className}</span>
                </div>
                <div class="hero-meta">
                    <span class="hero-id">ID: ${hero.id} | Gen: ${generation}</span>
                </div>
            </div>
            
            <!-- Level Section -->
            <div class="hero-section">
                <h4>📈 Levels & Experience</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">Unit Level</span><span class="stat-value">${unitLevel}</span></div>
                    <div class="stat-item"><span class="stat-label">Unit XP</span><span class="stat-value">${unitXp}</span></div>
                    <div class="stat-item"><span class="stat-label">Class Level</span><span class="stat-value">${classLevel}</span></div>
                    <div class="stat-item"><span class="stat-label">Class XP</span><span class="stat-value">${classXp}</span></div>
                </div>
            </div>

            <!-- Core Attributes -->
            <div class="hero-section">
                <h4>💪 Core Attributes</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">STR</span><span class="stat-value">${str}</span></div>
                    <div class="stat-item"><span class="stat-label">DEX</span><span class="stat-value">${dex}</span></div>
                    <div class="stat-item"><span class="stat-label">INT</span><span class="stat-value">${int}</span></div>
                    <div class="stat-item"><span class="stat-label">VIT</span><span class="stat-value">${vit}</span></div>
                    <div class="stat-item"><span class="stat-label">LUK</span><span class="stat-value">${luk}</span></div>
                </div>
            </div>

            <!-- Base Combat Stats -->
            <div class="hero-section">
                <h4>⚔️ Combat Stats</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">Max HP</span><span class="stat-value">${hpBase}</span></div>
                    <div class="stat-item"><span class="stat-label">Damage</span><span class="stat-value">${damageBase}</span></div>
                    <div class="stat-item"><span class="stat-label">Defense</span><span class="stat-value">${defenseBase}</span></div>
                    <div class="stat-item"><span class="stat-label">Speed</span><span class="stat-value">${speedBase}</span></div>
                    <div class="stat-item"><span class="stat-label">Range</span><span class="stat-value">${rangeBase}</span></div>
                </div>
            </div>

            <!-- Critical & Dodge -->
            <div class="hero-section">
                <h4>🎯 Critical & Evasion</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">Crit Chance</span><span class="stat-value">${pct(critChance)}</span></div>
                    <div class="stat-item"><span class="stat-label">Crit Damage</span><span class="stat-value">${pct(critDamage)}</span></div>
                    <div class="stat-item"><span class="stat-label">Dodge</span><span class="stat-value">${pct(dodgeChance)}</span></div>
                    <div class="stat-item"><span class="stat-label">Block</span><span class="stat-value">${pct(blockChance)}</span></div>
                    <div class="stat-item"><span class="stat-label">Parry</span><span class="stat-value">${pct(parryChance)}</span></div>
                </div>
            </div>

            ${hasElemental ? `
            <!-- Elemental Damage -->
            <div class="hero-section">
                <h4>🔥 Elemental Damage</h4>
                <div class="stats-grid">
                    <div class="stat-item elemental-fire"><span class="stat-label">🔥 Fire</span><span class="stat-value">${fireDmg}</span></div>
                    <div class="stat-item elemental-water"><span class="stat-label">💧 Water</span><span class="stat-value">${waterDmg}</span></div>
                    <div class="stat-item elemental-earth"><span class="stat-label">🌍 Earth</span><span class="stat-value">${earthDmg}</span></div>
                    <div class="stat-item elemental-wind"><span class="stat-label">💨 Wind</span><span class="stat-value">${windDmg}</span></div>
                    <div class="stat-item elemental-light"><span class="stat-label">✨ Light</span><span class="stat-value">${lightDmg}</span></div>
                    <div class="stat-item elemental-dark"><span class="stat-label">🌑 Dark</span><span class="stat-value">${darkDmg}</span></div>
                </div>
            </div>
            ` : ''}

            <!-- Regeneration -->
            <div class="hero-section">
                <h4>💚 Regeneration</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">HP Regen</span><span class="stat-value">${hpRegen}/tick</span></div>
                    <div class="stat-item"><span class="stat-label">Mana Regen</span><span class="stat-value">${manaRegen}/tick</span></div>
                </div>
            </div>

            <!-- Accuracy & Penetration -->
            <div class="hero-section">
                <h4>🎯 Accuracy & Penetration</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">Accuracy</span><span class="stat-value">${accuracy}</span></div>
                    <div class="stat-item"><span class="stat-label">Armor Pen</span><span class="stat-value">${armorPen}</span></div>
                </div>
            </div>

            <!-- Power & Tenacity -->
            <div class="hero-section">
                <h4>⚡ Power & Resistance</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">Skill Power</span><span class="stat-value">${skillPower}</span></div>
                    <div class="stat-item"><span class="stat-label">Tenacity</span><span class="stat-value">${pct(tenacity)}</span></div>
                    <div class="stat-item"><span class="stat-label">Block Power</span><span class="stat-value">${pct(blockPower)}</span></div>
                    <div class="stat-item"><span class="stat-label">Initiative</span><span class="stat-value">${initiative}</span></div>
                </div>
            </div>

            <!-- Lifesteal & Vamp -->
            <div class="hero-section">
                <h4>🩸 Lifesteal</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">Lifesteal</span><span class="stat-value">${pct(lifesteal)}</span></div>
                    <div class="stat-item"><span class="stat-label">Spell Vamp</span><span class="stat-value">${pct(spellVamp)}</span></div>
                </div>
            </div>

            <!-- Speed & Cooldown -->
            <div class="hero-section">
                <h4>🏃 Speed & Cooldown</h4>
                <div class="stats-grid">
                    <div class="stat-item"><span class="stat-label">Move Speed</span><span class="stat-value">${moveSpeed}</span></div>
                    <div class="stat-item"><span class="stat-label">Attack Speed</span><span class="stat-value">${attackSpeed.toFixed(2)}</span></div>
                    <div class="stat-item"><span class="stat-label">CDR</span><span class="stat-value">${pct(cooldownReduction)}</span></div>
                </div>
            </div>
            
            ${equipmentHtml}
            ${skillsHtml}
            ${traitsHtml}
        `;

        this.elements.heroModal.classList.remove('hidden');
    },

    showBattleResult(data) {
        const resultText = document.getElementById('battle-result-text');
        const rewards = document.getElementById('battle-rewards');
        
        resultText.textContent = data.winner === 0 ? 'Victory!' : 'Defeat';
        resultText.style.color = data.winner === 0 ? '#4caf50' : '#f44336';
        
        rewards.innerHTML = `
            <p>Experience: ${data.expGained || 0}</p>
            <p>Gold: ${data.goldGained || 0}</p>
            ${data.loot ? `<p>Loot: ${data.loot.length} items</p>` : ''}
        `;

        document.getElementById('battle-result').classList.remove('hidden');
        this.elements.battleModal.classList.remove('hidden');
    },

    // ==========================================
    // Log Methods
    // ==========================================

    addLogEntry(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        this.elements.logEvents.insertBefore(entry, this.elements.logEvents.firstChild);
        
        // Keep only last 100 entries
        while (this.elements.logEvents.children.length > 100) {
            this.elements.logEvents.removeChild(this.elements.logEvents.lastChild);
        }
    },

    addChatMessage(data) {
        const msg = document.createElement('div');
        msg.className = 'chat-message';
        msg.innerHTML = `<span class="sender">${data.sender || 'System'}:</span> ${data.message}`;
        
        this.elements.chatMessages.appendChild(msg);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    },

    _switchLogTab(logType) {
        document.querySelectorAll('.log-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.log === logType);
        });
        
        document.querySelectorAll('.log-area').forEach(area => {
            area.classList.toggle('active', area.id === `log-${logType}`);
        });
    },

    // ==========================================
    // Event Handlers
    // ==========================================

    async _handleLogin(username, password) {
        try {
            this.showLoginError('');
            this.showScreen('loading');
            this.updateLoadingProgress(10, 'Connecting...');

            // Login via API
            const result = await API.login(username, password);
            this.updateLoadingProgress(30, 'Logged in. Connecting socket...');

            // Initialize socket
            await Socket.init();
            this.updateLoadingProgress(50, 'Socket connected. Authenticating...');

            // Authenticate socket
            await Socket.authenticate(API.userId, API.sessionToken);
            this.updateLoadingProgress(70, 'Loading game data...');

            // Load game data
            await Game.init();
            this.updateLoadingProgress(90, 'Rendering...');

            // Show game screen
            this.refreshAll();
            this.showScreen('game');
            this.updateLoadingProgress(100, 'Ready!');

        } catch (error) {
            this.showScreen('login');
            this.showLoginError(error.message || 'Login failed');
        }
    },

    async _handleLogout() {
        await API.logout();
        Socket.disconnect();
        this.showScreen('login');
    },

    async _handleEnterTavern() {
        try {
            await API.enterTavern();
            Game.player.isInTavern = true;
            this.renderTavern();
            this.updatePlayerHUD();
            this.addLogEntry('Entered the tavern. Resting...', 'info');
        } catch (error) {
            this.addLogEntry('Failed to enter tavern: ' + error.message, 'error');
        }
    },

    async _handleExitTavern() {
        try {
            await API.exitTavern();
            Game.player.isInTavern = false;
            this.renderTavern();
            this.updatePlayerHUD();
            this.addLogEntry('Left the tavern.', 'info');
        } catch (error) {
            this.addLogEntry('Failed to exit tavern: ' + error.message, 'error');
        }
    },

    async _handleBattle() {
        if (!Game.canPerformAction()) {
            this.addLogEntry('Cannot start battle right now.', 'warning');
            return;
        }

        // For now, just show a message
        this.addLogEntry('Battle system coming soon!', 'info');
    },

    async _handleGather() {
        if (!Game.canPerformAction()) {
            this.addLogEntry('Cannot gather right now.', 'warning');
            return;
        }

        this.addLogEntry('Gathering system coming soon!', 'info');
    },

    _handleChatSend() {
        const message = this.elements.chatInput.value.trim();
        if (!message) return;

        Socket.sendChatMessage('global', message);
        this.elements.chatInput.value = '';
    },

    _handleRegionClick(region) {
        Game.selectRegion(region.id);
        
        this.elements.regionInfo.innerHTML = `
            <h3>${region.name}</h3>
            <p><strong>Type:</strong> ${region.zoneType}</p>
            <p><strong>Level:</strong> ${region.zoneLevel || 1}</p>
            <p>${region.description || 'No description available.'}</p>
            ${region.id !== Game.player.currentRegion ? 
                `<button class="btn-primary" onclick="UI._handleTravel(${region.id})">Travel Here</button>` : 
                '<p class="current-location">You are here</p>'
            }
        `;
    },

    async _handleTravel(regionId) {
        try {
            this.addLogEntry('Starting travel...', 'info');
            await API.travel(regionId);
            Game.player.currentRegion = regionId;
            await Game.loadRegionDetails(regionId);
            this.renderMap();
            this.updatePlayerHUD();
            this.addLogEntry('Travel started!', 'success');
        } catch (error) {
            this.addLogEntry('Travel failed: ' + error.message, 'error');
        }
    },

    _handleItemClick(item) {
        // Show item details in modal
        if (!item) return;
        
        // Store selected item for action buttons
        this._selectedItem = item;
        
        // Get item details
        const name = item.name || `Item #${item.templateId}`;
        const type = item.type || 'Unknown';
        const rarity = item.rarity || 'COMMON';
        const quality = item.quality || 0;
        const quantity = item.quantity || 1;
        const durability = item.durability !== undefined ? item.durability : -1;
        const maxDurability = item.maxDurability || 100;
        const description = item.description || 'No description available.';
        const icon = item.icon || '📦';
        const effects = item.effects || [];
        
        // Get rarity color
        const rarityColors = {
            'COMMON': '#9d9d9d',
            'UNCOMMON': '#1eff00',
            'RARE': '#0070dd',
            'EPIC': '#a335ee',
            'LEGENDARY': '#ff8000',
            'MYTHIC': '#e6cc80'
        };
        const rarityColor = rarityColors[rarity] || rarityColors['COMMON'];
        
        // Build stats HTML
        let statsHtml = `
            <div class="item-detail-stat">
                <span class="item-detail-stat-label">Quantity</span>
                <span class="item-detail-stat-value">${quantity}</span>
            </div>
        `;
        
        if (durability >= 0) {
            const durabilityPercent = Math.max(0, Math.min(100, (durability / maxDurability) * 100));
            const durabilityColor = durabilityPercent > 50 ? '#1eff00' : durabilityPercent > 25 ? '#ff8000' : '#ff0000';
            statsHtml += `
                <div class="item-detail-stat">
                    <span class="item-detail-stat-label">Durability</span>
                    <span class="item-detail-stat-value">${durability}/${maxDurability}</span>
                </div>
                <div class="item-detail-quality-bar">
                    <label>Durability</label>
                    <div class="quality-bar-container">
                        <div class="quality-bar-fill" style="width: ${durabilityPercent}%; background: ${durabilityColor};"></div>
                    </div>
                </div>
            `;
        }
        
        // Add quality bar
        const qualityPercent = Math.max(0, Math.min(100, quality));
        const qualityColor = qualityPercent > 80 ? '#ff8000' : qualityPercent > 60 ? '#a335ee' : qualityPercent > 40 ? '#0070dd' : '#9d9d9d';
        statsHtml += `
            <div class="item-detail-stat">
                <span class="item-detail-stat-label">Quality</span>
                <span class="item-detail-stat-value">${quality}/100</span>
            </div>
            <div class="item-detail-quality-bar">
                <label>Quality</label>
                <div class="quality-bar-container">
                    <div class="quality-bar-fill" style="width: ${qualityPercent}%; background: ${qualityColor};"></div>
                </div>
            </div>
        `;
        
        // Add effects if any
        if (effects.length > 0) {
            const effectsList = effects.map(e => `<div class="item-detail-stat"><span class="item-detail-stat-label">${e.type || 'Effect'}</span><span class="item-detail-stat-value">+${e.value || 0}</span></div>`).join('');
            statsHtml += effectsList;
        }
        
        // Build the modal content
        const modalContent = `
            <div class="item-detail-header">
                <div class="item-detail-icon">${icon}</div>
                <div class="item-detail-title">
                    <h3 style="color: ${rarityColor};">${name}</h3>
                    <div class="item-detail-type">${rarity} ${type}</div>
                </div>
            </div>
            <div class="item-detail-stats">
                ${statsHtml}
            </div>
            <div class="item-detail-description">
                ${description}
            </div>
        `;
        
        // Update modal content
        document.getElementById('item-detail').innerHTML = modalContent;
        
        // Update modal title
        document.getElementById('item-detail-name').textContent = name;
        
        // Show modal
        document.getElementById('item-modal').classList.remove('hidden');
        
        // Setup button handlers
        const useBtn = document.getElementById('btn-use-item');
        const discardBtn = document.getElementById('btn-discard-item');
        
        // Update button visibility based on item type
        const consumableTypes = ['POTION', 'FOOD', 'SCROLL', 'BOOK'];
        const isConsumable = consumableTypes.includes(type.toUpperCase());
        
        useBtn.style.display = isConsumable ? 'block' : 'none';
        if (isConsumable) {
            useBtn.onclick = () => this._useItem(item);
        }
        
        discardBtn.onclick = () => this._discardItem(item);
    },
    
    _useItem(item) {
        this.addLogEntry(`Using item: ${item.name || `#${item.templateId}`}`, 'info');
        // TODO: Implement actual use item logic
        this._closeItemModal();
    },
    
    _discardItem(item) {
        if (confirm(`Discard ${item.name || `#${item.templateId}`}?`)) {
            this.addLogEntry(`Discarded item: ${item.name || `#${item.templateId}`}`, 'info');
            // TODO: Implement actual discard logic
            this._closeItemModal();
        }
    },
    
    _closeItemModal() {
        document.getElementById('item-modal').classList.add('hidden');
        this._selectedItem = null;
    },

    _handleBuyItem(listing) {
        this.addLogEntry(`Buy system coming soon! Item: ${listing.itemName}`, 'info');
    },

    _handleRecruit(merc) {
        this.addLogEntry(`Recruit system coming soon! Mercenary: ${merc.name}`, 'info');
    },

    _handleCraft(recipeId) {
        this.addLogEntry(`Crafting system coming soon! Recipe: #${recipeId}`, 'info');
    },

    /**
     * Refresh all UI components
     */
    refreshAll() {
        this.updatePlayerHUD();
        this.updateTaskDisplay({ type: Game.currentTask ? 'started' : 'idle' });
        this.renderHeroes();
        this.renderInventory();
        this.renderQuests();
        this.renderMap();
    }
};
