# Guild System Execution Plan - Detailed Implementation

## Current Status Summary

### Phase 1: Database Foundation - Status: ✅ EXISTS PARTIALLY
| Component | Status | Notes |
|-----------|--------|-------|
| Guild model | ✅ Exists | Lines 890-909 in schema.prisma |
| GuildTemplate | ✅ Exists | Lines 941-945 |
| GuildFacility | ✅ Exists | Lines 963-972 |
| GuildFacilityTemplate | ✅ Exists | Lines 947-961 |
| GuildPerk | ✅ Exists | Lines 974-980 |
| GuildInvite | ❌ Missing | Needs to be added |
| GuildHistory | ❌ Missing | Needs to be added |
| GuildMemberRole field | ❌ Missing | Needs to be added to User |

### Phase 2: Backend Services - Status: ✅ EXISTS PARTIALLY
| Method | Status | Notes |
|--------|--------|-------|
| createGuild | ✅ Exists | Basic implementation |
| joinGuild | ✅ Exists | Basic implementation |
| leaveGuild | ❌ Missing | Needs implementation |
| kickMember | ❌ Missing | Needs implementation |
| promoteMember | ❌ Missing | Needs implementation |
| demoteMember | ❌ Missing | Needs implementation |
| transferLeadership | ❌ Missing | Needs implementation |
| updateGuildSettings | ❌ Missing | Needs implementation |
| depositTreasury | ❌ Missing | Needs implementation |
| withdrawTreasury | ❌ Missing | Needs implementation |
| buildFacility | ❌ Missing | Needs implementation |
| upgradeFacility | ❌ Missing | Needs implementation |
| createInvite | ❌ Missing | Needs implementation |
| acceptInvite | ❌ Missing | Needs implementation |
| cancelInvite | ❌ Missing | Needs implementation |
| getGuildInfo | ❌ Missing | Needs implementation |
| getMyGuild | ❌ Missing | Needs implementation |
| searchGuilds | ❌ Missing | Needs implementation |
| disbandGuild | ❌ Missing | Needs implementation |

### Phase 3: Backend Handlers - Status: ✅ EXISTS PARTIALLY
| Handler | Status | Notes |
|---------|--------|-------|
| handleCreateGuild | ✅ Exists | Basic implementation |
| handleJoinGuild | ✅ Exists | Basic implementation |
| Other RPC handlers | ❌ Missing | 15+ methods needed |

---

## Execution Plan

### Phase 1: Database Foundation

#### Step 1.1: Add GuildInvite Model
```prisma
model GuildInvite {
  id              Int      @id @default(autoincrement())
  guildId         Int
  guild           Guild    @relation(fields: [guildId], references: [id])
  invitedUserId   Int?
  invitedUser     User?    @relation("InvitedUserRelation", fields: [invitedUserId], references: [id])
  invitedBy       Int
  inviter         User     @relation("InviterRelation", fields: [invitedBy], references: [id])
  inviteCode      String   @unique
  status          String   @default("PENDING") // PENDING, ACCEPTED, EXPIRED, CANCELLED
  expiresAt       DateTime
  createdAt       DateTime @default(now())

  @@index([guildId])
  @@index([inviteCode])
}
```

#### Step 1.2: Add GuildMemberRole to User Model
Add field to User model (line ~36):
```prisma
guildRole        String?  // MASTER, OFFICER, MEMBER, RECRUIT
```

#### Step 1.3: Add GuildHistory Model
```prisma
model GuildHistory {
  id              Int      @id @default(autoincrement())
  guildId         Int
  guild           Guild    @relation(fields: [guildId], references: [id])
  eventType       String   // MEMBER_JOINED, MEMBER_LEFT, KICKED, PROMOTED, DEMOTED, TRANSFERRED, FACILITY_BUILT, UPGRADED, TREASURY_DEPOSIT, TREASURY_WITHDRAW
  userId          Int?
  user            User?    @relation(fields: [userId], references: [id])
  targetUserId    Int?
  targetUser      User?    @relation("TargetUserRelation", fields: [targetUserId], references: [id])
  description     String
  metadata        String   @default("{}") // JSON for additional data
  createdAt       DateTime @default(now())

  @@index([guildId])
  @@index([createdAt])
}
```

#### Step 1.4: Run Prisma Migration
```bash
cd server && npx prisma migrate dev --name guild_core_system
```

---

### Phase 2: Backend Services Enhancement

#### Step 2.1: leaveGuild(user)
```javascript
async leaveGuild(user) {
  if (!user.guildId) throw new Error("Not in a guild");
  if (user.guildRole === "MASTER") throw new Error("Transfer leadership first");
  
  await userRepository.update(user.id, { guildId: null, guildRole: null });
  await this.addHistory(user.guildId, "MEMBER_LEFT", user.id, null, `${user.username} left the guild`);
  return true;
}
```

#### Step 2.2: kickMember(requesterUser, targetUserId)
```javascript
async kickMember(requester, targetUserId) {
  const targetUser = await userRepository.findById(targetUserId);
  if (!targetUser || targetUser.guildId !== requester.guildId) {
    throw new Error("User not in your guild");
  }
  if (targetUser.guildRole === "MASTER") throw new Error("Cannot kick master");
  if (["OFFICER", "MASTER"].includes(requester.guildRole) === false) {
    throw new Error("No permission to kick");
  }
  
  await userRepository.update(targetUserId, { guildId: null, guildRole: null });
  await this.addHistory(requester.guildId, "KICKED", requester.id, targetUserId, 
    `${requester.username} kicked ${targetUser.username}`);
  return true;
}
```

#### Step 2.3: promoteMember(requesterUser, targetUserId, newRole)
```javascript
async promoteMember(requester, targetUserId, newRole) {
  // Validation and promotion logic
}
```

#### Step 2.4: demoteMember(requesterUser, targetUserId)
```javascript
async demoteMember(requester, targetUserId) {
  // Validation and demotion logic
}
```

#### Step 2.5: transferLeadership(requesterUser, targetUserId)
```javascript
async transferLeadership(requester, targetUserId) {
  if (requester.guildRole !== "MASTER") throw new Error("Only master can transfer");
  // Transfer logic
}
```

#### Step 2.6: updateGuildSettings(requesterUser, settings)
```javascript
async updateGuildSettings(requester, settings) {
  if (requester.guildRole !== "MASTER") throw new Error("Only master can update settings");
  // Update logic
}
```

#### Step 2.7: depositTreasury(user, amount)
```javascript
async depositTreasury(user, amount) {
  if (!user.guildId) throw new Error("Not in a guild");
  if (user.gold < amount) throw new Error("Insufficient gold");
  
  await userRepository.updateGold(user.id, user.gold - amount);
  const guild = await guildRepository.update(user.guildId, {
    treasury: { increment: amount }
  });
  await this.addHistory(user.guildId, "TREASURY_DEPOSIT", user.id, null, 
    `Deposited ${amount} gold`);
  return guild;
}
```

#### Step 2.8: withdrawTreasury(requesterUser, amount)
```javascript
async withdrawTreasury(requester, amount) {
  if (!["MASTER", "OFFICER"].includes(requester.guildRole)) {
    throw new Error("No permission");
  }
  // Withdrawal logic
}
```

#### Step 2.9: buildFacility(user, templateId)
```javascript
async buildFacility(user, templateId) {
  if (!user.guildId) throw new Error("Not in a guild");
  // Build facility logic
}
```

#### Step 2.10: upgradeFacility(user, facilityId)
```javascript
async upgradeFacility(user, facilityId) {
  // Upgrade facility logic
}
```

#### Step 2.11: createInvite(user)
```javascript
async createInvite(user) {
  if (!["MASTER", "OFFICER"].includes(user.guildRole)) {
    throw new Error("No permission to create invite");
  }
  // Generate invite code and save
}
```

#### Step 2.12: acceptInvite(user, inviteCode)
```javascript
async acceptInvite(user, inviteCode) {
  // Validate and accept invite
}
```

#### Step 2.13: cancelInvite(user, inviteId)
```javascript
async cancelInvite(user, inviteId) {
  // Cancel invite logic
}
```

#### Step 2.14: getGuildInfo(guildId)
```javascript
async getGuildInfo(guildId) {
  return await guildRepository.findById(guildId);
}
```

#### Step 2.15: getMyGuild(user)
```javascript
async getMyGuild(user) {
  if (!user.guildId) return null;
  return await guildRepository.findById(user.guildId);
}
```

#### Step 2.16: searchGuilds(query, page, limit)
```javascript
async searchGuilds(query, page = 1, limit = 10) {
  return await guildRepository.search(query, page, limit);
}
```

#### Step 2.17: disbandGuild(user)
```javascript
async disbandGuild(user) {
  if (user.guildRole !== "MASTER") throw new Error("Only master can disband");
  // Disband logic
}
```

---

### Phase 3: Backend Handlers & Socket Integration

#### Step 3.1: Enhance guildRepository.js
Add query methods:
- `findByMember(userId)`
- `search(query, page, limit)`
- `countMembers(guildId)`
- `getFacilities(guildId)`
- `getHistory(guildId, limit)`
- `findInviteByCode(code)`

#### Step 3.2: Enhance guildHandler.js
Add RPC handlers:
- `handleLeaveGuild(ws, request)`
- `handleKickMember(ws, request)`
- `handlePromoteMember(ws, request)`
- `handleDemoteMember(ws, request)`
- `handleTransferLeadership(ws, request)`
- `handleUpdateSettings(ws, request)`
- `handleDepositTreasury(ws, request)`
- `handleWithdrawTreasury(ws, request)`
- `handleBuildFacility(ws, request)`
- `handleUpgradeFacility(ws, request)`
- `handleCreateInvite(ws, request)`
- `handleAcceptInvite(ws, request)`
- `handleCancelInvite(ws, request)`
- `handleGetGuildInfo(ws, request)`
- `handleSearchGuilds(ws, request)`
- `handleDisbandGuild(ws, request)`

#### Step 3.3: Register in socketService.js
```javascript
// Register guild handlers
guildHandlers = require('../handlers/guildHandler');
socketHandlers['guild:create'] = guildHandlers.handleCreateGuild.bind(guildHandlers);
socketHandlers['guild:leave'] = guildHandlers.handleLeaveGuild.bind(guildHandlers);
// ... register all handlers
```

#### Step 3.4: Add REST API endpoints
Add to `server/src/routes/api.js`:
- `POST /api/guilds` - Create guild
- `GET /api/guilds/:id` - Get guild info
- `GET /api/guilds/search` - Search guilds
- `POST /api/guilds/:id/join` - Join via invite
- `POST /api/guilds/leave` - Leave guild

---

### Phase 4: Client Network Layer

#### Step 4.1: Create GuildHandler.gd
```gdscript
extends Node

signal guild_info_received(guild_data)
signal guild_created(guild_data)
signal guild_left()
signal member_kicked(user_id)
signal member_promoted(user_id, new_role)
signal treasury_updated(gold, silver)
signal facility_built(facility_data)

func create_guild(template_id: int, name: String, description: String):
    pass

func leave_guild():
    pass

func kick_member(target_user_id: int):
    pass

func promote_member(target_user_id: int, new_role: String):
    pass

func demote_member(target_user_id: int):
    pass

func transfer_leadership(target_user_id: int):
    pass

func update_guild_settings(settings: Dictionary):
    pass

func deposit_treasury(amount: int):
    pass

func withdraw_treasury(amount: int):
    pass

func build_facility(template_id: int):
    pass

func upgrade_facility(facility_id: int):
    pass

func create_invite():
    pass

func accept_invite(invite_code: String):
    pass

func cancel_invite(invite_id: int):
    pass

func get_guild_info(guild_id: int):
    pass

func search_guilds(query: String):
    pass

func disband_guild():
    pass

func _on_socket_event(event_type: String, data: Dictionary):
    match event_type:
        "guild:created":
            emit_signal("guild_created", data)
        "guild:left":
            emit_signal("guild_left")
        # ... handle all events
```

#### Step 4.2: Integrate with game_state.gd
```gdscript
var current_guild: Dictionary = {}
var guild_role: String = ""

func update_guild_data(guild_data: Dictionary):
    current_guild = guild_data
    guild_role = guild_data.get("role", "")

func clear_guild_data():
    current_guild = {}
    guild_role = ""
```

#### Step 4.3: Add handlers to SocketHandler.gd
```gdscript
func _on_guild_event(event_type: String, data: Dictionary):
    game_state.update_guild_data(data)
    guild_handler.emit_signal("guild_info_received", data)
```

---

### Phase 5: Client UI Components

#### Step 5.1: Create GuildScreen.tscn/.gd
Main interface with tabs for:
- Overview panel
- Members panel
- Facilities panel
- Treasury panel

#### Step 5.2: Create GuildMemberPanel.tscn/.gd
Display and manage guild members with:
- List of members with roles
- Kick button (for officers+)
- Promote/Demote buttons (for officers+)
- Transfer leadership (master only)

#### Step 5.3: Create GuildFacilitiesPanel.tscn/.gd
Display guild facilities:
- List of built facilities
- Build new facility button
- Upgrade facility button
- Show facility effects

#### Step 5.4: Create GuildTreasuryPanel.tscn/.gd
Display and manage treasury:
- Show current gold/silver
- Deposit button
- Withdraw button (officers+)
- Transaction history

#### Step 5.5: Add guild button to BottomHUD
Add guild icon button to navigation bar with:
- Guild logo/icon
- Notification indicator (if invite pending)
- Click to open GuildScreen

---

### Phase 6: Integration & Testing

#### Step 6.1: Test Guild Creation Flow
1. Create new guild from template
2. Verify user becomes MASTER
3. Verify guild appears in search

#### Step 6.2: Test Member Management
1. Create invite code
2. Second user accepts invite
3. Test promote/demote
4. Test kick member
5. Test leave guild

#### Step 6.3: Test Treasury System
1. Test deposit gold
2. Test withdraw (member - should fail)
3. Test withdraw (officer - should succeed)
4. Verify balance updates

#### Step 6.4: Test Facility System
1. Test build facility
2. Test upgrade facility
3. Verify effects apply

#### Step 6.5: Update API.md
Document all guild API endpoints and socket events

---

## Dependencies Graph

```
Phase 1 (Database)
    ↓
Phase 2 (Services)
    ↓
Phase 3 (Handlers)
    ↓
Phase 4 (Client Network)
    ↓
Phase 5 (UI Components)
    ↓
Phase 6 (Testing)
```

**Critical Path:** Phase 1-3 must complete before Phase 4 can start. Phase 4 must complete before Phase 5. Phase 5 must complete before Phase 6.

---

## Estimated Complexity

| Phase | Complexity | Key Risks |
|-------|------------|-----------|
| Phase 1 | Low | Migration conflicts |
| Phase 2 | Medium | Business logic validation |
| Phase 3 | Low | Socket event naming consistency |
| Phase 4 | Medium | Client-server sync |
| Phase 5 | Medium | UI/UX design |
| Phase 6 | Low | Integration issues |

---

## Next Steps

1. Start Phase 1 by modifying `server/prisma/schema.prisma`
2. Run migration to update database
3. Proceed to Phase 2: Enhance `guildService.js`
4. Continue sequentially through phases
