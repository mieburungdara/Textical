# Social Features Plan for Textical

## 🌟 Overview
This document outlines the plan for implementing social features in Textical, including:
- **Guild System** - Create and manage guilds with ranks, permissions, and shared goals
- **PvP System** - Player versus player arena with rankings and rewards
- **Chat System** - Real-time communication with global, guild, and private channels
- **Player Profiles** - Detailed player information, stats, and achievements

## 📋 Implementation Roadmap

### Phase 1: Database Design & Backend Foundation
1. Create guilds table with fields: id, name, tag, description, founder_id, creation_date, level, experience
2. Create guild_members table: id, guild_id, user_id, rank, join_date, contributed_experience
3. Create guild_ranks table: id, guild_id, name, permissions (JSONB for detailed control)
4. Create pvp_matches table: id, player1_id, player2_id, winner_id, date, duration, rewards
5. Create chat_messages table: id, channel_type, channel_id, user_id, message, timestamp
6. Create friend_relationships table: id, user1_id, user2_id, status, created_at

### Phase 2: Guild System
#### Features:
- **Guild Creation**: Players can create guilds with a name, tag, and description (costs gold)
- **Guild Management**: Founders and officers can invite/remove members, manage ranks
- **Guild Ranks**: Default ranks - Founder, Officer, Veteran, Member, Recruit
- **Permissions System**: Control access to guild features (chat, management, guild hall)
- **Guild Experience**: Members contribute XP through activities to level up the guild
- **Guild Level Benefits**: Unlock guild hall upgrades, guild quests, and rewards

#### Backend API Endpoints:
- `POST /api/guilds` - Create new guild
- `GET /api/guilds/:id` - Get guild details
- `PUT /api/guilds/:id` - Update guild settings
- `DELETE /api/guilds/:id` - Disband guild
- `POST /api/guilds/:id/invite` - Invite player to guild
- `POST /api/guilds/:id/join` - Join a guild (requires invitation)
- `POST /api/guilds/:id/leave` - Leave guild
- `PUT /api/guilds/:id/members/:user_id` - Update member rank
- `DELETE /api/guilds/:id/members/:user_id` - Kick member from guild

### Phase 3: PvP System
#### Features:
- **Arena**: 1v1 tactical battles against other players
- **Ranking System**: ELO-based ranking with tiers (Bronze, Silver, Gold, Platinum, Diamond)
- **Seasonal Rewards**: End-of-season rewards based on rank (gold, items, cosmetic rewards)
- **Matchmaking**: Algorithm matches players of similar rank and level
- **Spectator Mode**: Watch live PvP matches

#### Backend API Endpoints:
- `POST /api/pvp/matchmaking` - Queue for PvP match
- `GET /api/pvp/matches/:id` - Get match details
- `POST /api/pvp/matches/:id/join` - Join a match
- `POST /api/pvp/matches/:id/action` - Perform action in match
- `GET /api/pvp/rankings` - Get global rankings
- `GET /api/pvp/season` - Get current season details

### Phase 4: Chat System
#### Features:
- **Global Chat**: All players can communicate in a global channel
- **Guild Chat**: Only guild members can communicate
- **Private Messages**: Direct messaging between players
- **Notifications**: Visual and sound notifications for new messages
- **Message History**: Scroll through chat history

#### Backend Socket.io Events:
- `chat:global` - Send/receive global messages
- `chat:guild` - Send/receive guild messages
- `chat:private` - Send/receive private messages
- `chat:typing` - Show typing indicators

### Phase 5: Player Profiles
#### Features:
- **Profile Page**: Display player avatar, level, rank, stats
- **Achievements**: Track and display completed achievements
- **Friends List**: Add/remove friends, see online status
- **Recent Activity**: Show recent battles, quests, and achievements
- **Cosmetics**: Display equipped cosmetic items

#### Backend API Endpoints:
- `GET /api/profiles/:id` - Get player profile
- `PUT /api/profiles/:id` - Update profile settings
- `POST /api/profiles/:id/friends` - Send friend request
- `PUT /api/profiles/:id/friends/:friend_id` - Accept/decline friend request
- `DELETE /api/profiles/:id/friends/:friend_id` - Remove friend
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/:id` - Get achievement details

## 🎨 Frontend UI Design
1. **Guild UI**: Guild creation window, guild info panel, member management, guild hall interface
2. **PvP UI**: Arena queue screen, match interface, rankings page, season rewards display
3. **Chat UI**: Chat window with tabs for global/guild/private, message input, notification indicators
4. **Profile UI**: Profile page, friends list, achievements display, activity feed

## 🔧 Technical Implementation
- **Backend**: Node.js + Express + Prisma ORM
- **Real-time Communication**: Socket.io
- **Database**: SQLite/PostgreSQL (100% normalized schema)
- **Frontend**: Godot 4 with custom UI components

## 🚀 Development Timeline
1. **Phase 1**: 1-2 weeks - Database design and backend foundation
2. **Phase 2**: 2-3 weeks - Guild system implementation
3. **Phase 3**: 2-3 weeks - PvP system implementation
4. **Phase 4**: 1-2 weeks - Chat system implementation
5. **Phase 5**: 1-2 weeks - Player profiles implementation
6. **Testing & Balance**: 1-2 weeks - Testing and balancing

## 📊 Success Metrics
- Number of active guilds
- PvP match participation rate
- Chat activity (messages per hour)
- Friend relationships created

---

This plan will enhance the social aspect of Textical, creating a vibrant community of players collaborating in guilds, competing in PvP battles, and communicating through the chat system.

## 🌟 Overview
This document outlines the plan for implementing social features in Textical, including:
- **Guild System** - Create and manage guilds with ranks, permissions, and shared goals
- **PvP System** - Player versus player arena with rankings and rewards
- **Chat System** - Real-time communication with global, guild, and private channels
- **Player Profiles** - Detailed player information, stats, and achievements

## 📋 Implementation Roadmap

### Phase 1: Database Design & Backend Foundation
1. Create guilds table with fields: id, name, tag, description, founder_id, creation_date, level, experience
2. Create guild_members table: id, guild_id, user_id, rank, join_date, contributed_experience
3. Create guild_ranks table: id, guild_id, name, permissions (JSONB for detailed control)
4. Create pvp_matches table: id, player1_id, player2_id, winner_id, date, duration, rewards
5. Create chat_messages table: id, channel_type, channel_id, user_id, message, timestamp
6. Create friend_relationships table: id, user1_id, user2_id, status, created_at

### Phase 2: Guild System
#### Features:
- **Guild Creation**: Players can create guilds with a name, tag, and description (costs gold)
- **Guild Management**: Founders and officers can invite/remove members, manage ranks
- **Guild Ranks**: Default ranks - Founder, Officer, Veteran, Member, Recruit
- **Permissions System**: Control access to guild features (chat, management, guild hall)
- **Guild Experience**: Members contribute XP through activities to level up the guild
- **Guild Level Benefits**: Unlock guild hall upgrades, guild quests, and rewards

#### Backend API Endpoints:
- `POST /api/guilds` - Create new guild
- `GET /api/guilds/:id` - Get guild details
- `PUT /api/guilds/:id` - Update guild settings
- `DELETE /api/guilds/:id` - Disband guild
- `POST /api/guilds/:id/invite` - Invite player to guild
- `POST /api/guilds/:id/join` - Join a guild (requires invitation)
- `POST /api/guilds/:id/leave` - Leave guild
- `PUT /api/guilds/:id/members/:user_id` - Update member rank
- `DELETE /api/guilds/:id/members/:user_id` - Kick member from guild

### Phase 3: PvP System
#### Features:
- **Arena**: 1v1 tactical battles against other players
- **Ranking System**: ELO-based ranking with tiers (Bronze, Silver, Gold, Platinum, Diamond)
- **Seasonal Rewards**: End-of-season rewards based on rank (gold, items, cosmetic rewards)
- **Matchmaking**: Algorithm matches players of similar rank and level
- **Spectator Mode**: Watch live PvP matches

#### Backend API Endpoints:
- `POST /api/pvp/matchmaking` - Queue for PvP match
- `GET /api/pvp/matches/:id` - Get match details
- `POST /api/pvp/matches/:id/join` - Join a match
- `POST /api/pvp/matches/:id/action` - Perform action in match
- `GET /api/pvp/rankings` - Get global rankings
- `GET /api/pvp/season` - Get current season details

### Phase 4: Chat System
#### Features:
- **Global Chat**: All players can communicate in a global channel
- **Guild Chat**: Only guild members can communicate
- **Private Messages**: Direct messaging between players
- **Notifications**: Visual and sound notifications for new messages
- **Message History**: Scroll through chat history

#### Backend Socket.io Events:
- `chat:global` - Send/receive global messages
- `chat:guild` - Send/receive guild messages
- `chat:private` - Send/receive private messages
- `chat:typing` - Show typing indicators

### Phase 5: Player Profiles
#### Features:
- **Profile Page**: Display player avatar, level, rank, stats
- **Achievements**: Track and display completed achievements
- **Friends List**: Add/remove friends, see online status
- **Recent Activity**: Show recent battles, quests, and achievements
- **Cosmetics**: Display equipped cosmetic items

#### Backend API Endpoints:
- `GET /api/profiles/:id` - Get player profile
- `PUT /api/profiles/:id` - Update profile settings
- `POST /api/profiles/:id/friends` - Send friend request
- `PUT /api/profiles/:id/friends/:friend_id` - Accept/decline friend request
- `DELETE /api/profiles/:id/friends/:friend_id` - Remove friend
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/:id` - Get achievement details

## 🎨 Frontend UI Design
1. **Guild UI**: Guild creation window, guild info panel, member management, guild hall interface
2. **PvP UI**: Arena queue screen, match interface, rankings page, season rewards display
3. **Chat UI**: Chat window with tabs for global/guild/private, message input, notification indicators
4. **Profile UI**: Profile page, friends list, achievements display, activity feed

## 🔧 Technical Implementation
- **Backend**: Node.js + Express + Prisma ORM
- **Real-time Communication**: Socket.io
- **Database**: SQLite/PostgreSQL (100% normalized schema)
- **Frontend**: Godot 4 with custom UI components

## 🚀 Development Timeline
1. **Phase 1**: 1-2 weeks - Database design and backend foundation
2. **Phase 2**: 2-3 weeks - Guild system implementation
3. **Phase 3**: 2-3 weeks - PvP system implementation
4. **Phase 4**: 1-2 weeks - Chat system implementation
5. **Phase 5**: 1-2 weeks - Player profiles implementation
6. **Testing & Balance**: 1-2 weeks - Testing and balancing

## 📊 Success Metrics
- Number of active guilds
- PvP match participation rate
- Chat activity (messages per hour)
- Friend relationships created

---

This plan will enhance the social aspect of Textical, creating a vibrant community of players collaborating in guilds, competing in PvP battles, and communicating through the chat system.

