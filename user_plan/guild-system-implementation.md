# Guild System Implementation Plan

## Current Status
The guild system has a good foundation with:
- `Guild`, `GuildTemplate`, and `Territory` models in Prisma schema
- `GuildService.js` with basic createGuild, addExp, and joinGuild methods
- User model already has guildId and guildRole fields

## Missing Features
1. Guild invitations and management
2. Guild ranks and permissions system
3. Guild chat functionality
4. Guild hall and facilities
5. Guild quests and wars
6. Guild UI screens

## Implementation Steps

### Step 1: Enhance Guild Service
```javascript
// server/src/services/guildService.js
class GuildService {
    // Existing methods...
    
    async inviteToGuild(guildId, inviterId, inviteeId) {
        // Validate permissions
        // Check if invitee is already in a guild
        // Send invitation
    }
    
    async acceptInvite(inviteId, userId) {
        // Check invitation validity
        // Join guild
    }
    
    async declineInvite(inviteId, userId) {
        // Cancel invitation
    }
    
    async kickMember(guildId, kickerId, memberId) {
        // Validate permissions
        // Remove member from guild
    }
    
    async promoteMember(guildId, promoterId, memberId, newRank) {
        // Validate permissions
        // Update member rank
    }
    
    async updateGuildSettings(guildId, userId, settings) {
        // Validate permissions
        // Update guild settings
    }
    
    async getGuildMembers(guildId) {
        // Get all guild members with details
    }
    
    async leaveGuild(userId) {
        // Remove user from guild
    }
    
    async disbandGuild(guildId, userId) {
        // Validate permissions
        // Disband guild
    }
}
```

### Step 2: Create Guild Controller
```javascript
// server/src/controllers/GuildController.js
class GuildController extends BaseController {
    async createGuild(req, res) {
        // Handle guild creation
    }
    
    async joinGuild(req, res) {
        // Handle joining a guild
    }
    
    async inviteToGuild(req, res) {
        // Handle sending an invitation
    }
    
    async acceptInvite(req, res) {
        // Handle accepting an invitation
    }
    
    async declineInvite(req, res) {
        // Handle declining an invitation
    }
    
    async kickMember(req, res) {
        // Handle kicking a member
    }
    
    async promoteMember(req, res) {
        // Handle promoting a member
    }
    
    async updateGuildSettings(req, res) {
        // Handle updating guild settings
    }
    
    async getGuildMembers(req, res) {
        // Handle getting guild members
    }
    
    async leaveGuild(req, res) {
        // Handle leaving a guild
    }
    
    async disbandGuild(req, res) {
        // Handle disbanding a guild
    }
}
```

### Step 3: Create Guild Handler (Client)
```gdscript
# client/src/network/GuildHandler.gd
extends BaseNetworkHandler
class_name GuildHandler

func create_guild(user_id: int, template_id: int, name: String, description: String):
	_request("/guilds/create", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"templateId": template_id,
		"name": name,
		"description": description
	})

func join_guild(user_id: int, guild_id: int):
	_request("/guilds/join", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id
	})

func invite_to_guild(user_id: int, guild_id: int, invitee_id: int):
	_request("/guilds/invite", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id,
		"inviteeId": invitee_id
	})

func accept_invite(user_id: int, invite_id: int):
	_request("/guilds/accept-invite", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"inviteId": invite_id
	})

func decline_invite(user_id: int, invite_id: int):
	_request("/guilds/decline-invite", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"inviteId": invite_id
	})

func kick_member(user_id: int, guild_id: int, member_id: int):
	_request("/guilds/kick", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id,
		"memberId": member_id
	})

func promote_member(user_id: int, guild_id: int, member_id: int, new_rank: String):
	_request("/guilds/promote", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id,
		"memberId": member_id,
		"newRank": new_rank
	})

func update_guild_settings(user_id: int, guild_id: int, settings: Dictionary):
	_request("/guilds/update", HTTPClient.METHOD_PUT, {
		"userId": user_id,
		"guildId": guild_id,
		"settings": settings
	})

func get_guild_members(guild_id: int):
	_request("/guilds/" + str(guild_id) + "/members", HTTPClient.METHOD_GET)

func leave_guild(user_id: int):
	_request("/guilds/leave", HTTPClient.METHOD_POST, {"userId": user_id})

func disband_guild(user_id: int, guild_id: int):
	_request("/guilds/disband", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id
	})

func get_guild_details(guild_id: int):
	_request("/guilds/" + str(guild_id), HTTPClient.METHOD_GET)
```

### Step 4: Update Prisma Schema
Add guild invitation and rank management models:

```prisma
// server/prisma/schema.prisma
model GuildInvitation {
  id          Int      @id @default(autoincrement())
  guildId     Int
  guild       Guild    @relation(fields: [guildId], references: [id])
  inviterId   Int
  inviter     User     @relation("InviterRelation", fields: [inviterId], references: [id])
  inviteeId   Int
  invitee     User     @relation("InviteeRelation", fields: [inviteeId], references: [id])
  status      String   @default("PENDING") // PENDING, ACCEPTED, DECLINED
  createdAt   DateTime @default(now())
  expiresAt   DateTime @default(now() + interval '7 days')
  
  @@unique([guildId, inviteeId])
}

model GuildRank {
  id          Int      @id @default(autoincrement())
  guildId     Int
  guild       Guild    @relation(fields: [guildId], references: [id])
  name        String
  permissions Json     @default("{}")
  order       Int      @default(0) // Higher number = higher rank
  
  @@unique([guildId, name])
}
```

### Step 5: Create Guild UI Screens
1. **Guild Creation Screen**: Form to create a new guild
2. **Guild List Screen**: List of available guilds to join
3. **Guild Info Screen**: Display guild details, members, and settings
4. **Guild Management Screen**: For managing members, invitations, and ranks
5. **Guild Hall Screen**: Display guild facilities and perks

### Step 6: Add Guild Chat
Implement real-time chat using Socket.io:

```javascript
// server/src/services/socketService.js
io.on('connection', (socket) => {
    // Existing socket handlers...
    
    socket.on('guild:join', (guildId) => {
        socket.join(`guild:${guildId}`);
    });
    
    socket.on('guild:leave', (guildId) => {
        socket.leave(`guild:${guildId}`);
    });
    
    socket.on('guild:message', (data) => {
        const { guildId, userId, message } = data;
        io.to(`guild:${guildId}`).emit('guild:message', {
            userId,
            message,
            timestamp: new Date()
        });
    });
});
```

### Step 7: Implement Guild Facilities and Perks
Enhance guild system with facilities and perks:

```javascript
// server/src/services/guildService.js
async upgradeFacility(guildId, userId, facilityId) {
    // Check permissions
    // Check resources
    // Upgrade facility
    // Apply perk
}

async researchPerk(guildId, userId, perkId) {
    // Check permissions
    // Check resources
    // Research perk
    // Apply bonus
}
```

### Step 8: Test and Balance
1. Test all guild-related endpoints
2. Test guild chat functionality
3. Balance guild creation requirements and level progression
4. Test invitation and rank management
5. Balance guild facilities and perks

---

This implementation plan provides a comprehensive guide for enhancing the guild system in Textical. The changes will create a vibrant social environment where players can form communities, communicate in real-time, and work together to achieve common goals.

## Current Status
The guild system has a good foundation with:
- `Guild`, `GuildTemplate`, and `Territory` models in Prisma schema
- `GuildService.js` with basic createGuild, addExp, and joinGuild methods
- User model already has guildId and guildRole fields

## Missing Features
1. Guild invitations and management
2. Guild ranks and permissions system
3. Guild chat functionality
4. Guild hall and facilities
5. Guild quests and wars
6. Guild UI screens

## Implementation Steps

### Step 1: Enhance Guild Service
```javascript
// server/src/services/guildService.js
class GuildService {
    // Existing methods...
    
    async inviteToGuild(guildId, inviterId, inviteeId) {
        // Validate permissions
        // Check if invitee is already in a guild
        // Send invitation
    }
    
    async acceptInvite(inviteId, userId) {
        // Check invitation validity
        // Join guild
    }
    
    async declineInvite(inviteId, userId) {
        // Cancel invitation
    }
    
    async kickMember(guildId, kickerId, memberId) {
        // Validate permissions
        // Remove member from guild
    }
    
    async promoteMember(guildId, promoterId, memberId, newRank) {
        // Validate permissions
        // Update member rank
    }
    
    async updateGuildSettings(guildId, userId, settings) {
        // Validate permissions
        // Update guild settings
    }
    
    async getGuildMembers(guildId) {
        // Get all guild members with details
    }
    
    async leaveGuild(userId) {
        // Remove user from guild
    }
    
    async disbandGuild(guildId, userId) {
        // Validate permissions
        // Disband guild
    }
}
```

### Step 2: Create Guild Controller
```javascript
// server/src/controllers/GuildController.js
class GuildController extends BaseController {
    async createGuild(req, res) {
        // Handle guild creation
    }
    
    async joinGuild(req, res) {
        // Handle joining a guild
    }
    
    async inviteToGuild(req, res) {
        // Handle sending an invitation
    }
    
    async acceptInvite(req, res) {
        // Handle accepting an invitation
    }
    
    async declineInvite(req, res) {
        // Handle declining an invitation
    }
    
    async kickMember(req, res) {
        // Handle kicking a member
    }
    
    async promoteMember(req, res) {
        // Handle promoting a member
    }
    
    async updateGuildSettings(req, res) {
        // Handle updating guild settings
    }
    
    async getGuildMembers(req, res) {
        // Handle getting guild members
    }
    
    async leaveGuild(req, res) {
        // Handle leaving a guild
    }
    
    async disbandGuild(req, res) {
        // Handle disbanding a guild
    }
}
```

### Step 3: Create Guild Handler (Client)
```gdscript
# client/src/network/GuildHandler.gd
extends BaseNetworkHandler
class_name GuildHandler

func create_guild(user_id: int, template_id: int, name: String, description: String):
	_request("/guilds/create", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"templateId": template_id,
		"name": name,
		"description": description
	})

func join_guild(user_id: int, guild_id: int):
	_request("/guilds/join", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id
	})

func invite_to_guild(user_id: int, guild_id: int, invitee_id: int):
	_request("/guilds/invite", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id,
		"inviteeId": invitee_id
	})

func accept_invite(user_id: int, invite_id: int):
	_request("/guilds/accept-invite", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"inviteId": invite_id
	})

func decline_invite(user_id: int, invite_id: int):
	_request("/guilds/decline-invite", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"inviteId": invite_id
	})

func kick_member(user_id: int, guild_id: int, member_id: int):
	_request("/guilds/kick", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id,
		"memberId": member_id
	})

func promote_member(user_id: int, guild_id: int, member_id: int, new_rank: String):
	_request("/guilds/promote", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id,
		"memberId": member_id,
		"newRank": new_rank
	})

func update_guild_settings(user_id: int, guild_id: int, settings: Dictionary):
	_request("/guilds/update", HTTPClient.METHOD_PUT, {
		"userId": user_id,
		"guildId": guild_id,
		"settings": settings
	})

func get_guild_members(guild_id: int):
	_request("/guilds/" + str(guild_id) + "/members", HTTPClient.METHOD_GET)

func leave_guild(user_id: int):
	_request("/guilds/leave", HTTPClient.METHOD_POST, {"userId": user_id})

func disband_guild(user_id: int, guild_id: int):
	_request("/guilds/disband", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"guildId": guild_id
	})

func get_guild_details(guild_id: int):
	_request("/guilds/" + str(guild_id), HTTPClient.METHOD_GET)
```

### Step 4: Update Prisma Schema
Add guild invitation and rank management models:

```prisma
// server/prisma/schema.prisma
model GuildInvitation {
  id          Int      @id @default(autoincrement())
  guildId     Int
  guild       Guild    @relation(fields: [guildId], references: [id])
  inviterId   Int
  inviter     User     @relation("InviterRelation", fields: [inviterId], references: [id])
  inviteeId   Int
  invitee     User     @relation("InviteeRelation", fields: [inviteeId], references: [id])
  status      String   @default("PENDING") // PENDING, ACCEPTED, DECLINED
  createdAt   DateTime @default(now())
  expiresAt   DateTime @default(now() + interval '7 days')
  
  @@unique([guildId, inviteeId])
}

model GuildRank {
  id          Int      @id @default(autoincrement())
  guildId     Int
  guild       Guild    @relation(fields: [guildId], references: [id])
  name        String
  permissions Json     @default("{}")
  order       Int      @default(0) // Higher number = higher rank
  
  @@unique([guildId, name])
}
```

### Step 5: Create Guild UI Screens
1. **Guild Creation Screen**: Form to create a new guild
2. **Guild List Screen**: List of available guilds to join
3. **Guild Info Screen**: Display guild details, members, and settings
4. **Guild Management Screen**: For managing members, invitations, and ranks
5. **Guild Hall Screen**: Display guild facilities and perks

### Step 6: Add Guild Chat
Implement real-time chat using Socket.io:

```javascript
// server/src/services/socketService.js
io.on('connection', (socket) => {
    // Existing socket handlers...
    
    socket.on('guild:join', (guildId) => {
        socket.join(`guild:${guildId}`);
    });
    
    socket.on('guild:leave', (guildId) => {
        socket.leave(`guild:${guildId}`);
    });
    
    socket.on('guild:message', (data) => {
        const { guildId, userId, message } = data;
        io.to(`guild:${guildId}`).emit('guild:message', {
            userId,
            message,
            timestamp: new Date()
        });
    });
});
```

### Step 7: Implement Guild Facilities and Perks
Enhance guild system with facilities and perks:

```javascript
// server/src/services/guildService.js
async upgradeFacility(guildId, userId, facilityId) {
    // Check permissions
    // Check resources
    // Upgrade facility
    // Apply perk
}

async researchPerk(guildId, userId, perkId) {
    // Check permissions
    // Check resources
    // Research perk
    // Apply bonus
}
```

### Step 8: Test and Balance
1. Test all guild-related endpoints
2. Test guild chat functionality
3. Balance guild creation requirements and level progression
4. Test invitation and rank management
5. Balance guild facilities and perks

---

This implementation plan provides a comprehensive guide for enhancing the guild system in Textical. The changes will create a vibrant social environment where players can form communities, communicate in real-time, and work together to achieve common goals.

