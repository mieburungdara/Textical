# Guild System Implementation Plan - TODO List

## Overview
TODO list step-by-step untuk implementasi sistem guild core (management, treasury, facilities). Setiap fase dapat dikerjakan satu per satu oleh agent berbeda.

---

## Phase 1: Database Foundation

- [ ] Add GuildInvite model for invite system
- [ ] Add GuildMemberRole field to User model
- [ ] Add GuildHistory model for event tracking
- [ ] Run Prisma migration

**File yang dimodifikasi:**
- `server/prisma/schema.prisma`

**CMD untuk migration:**
```bash
cd server && npx prisma migrate dev --name guild_core_system
```

---

## Phase 2: Backend Services

- [ ] Enhance guildService.js - leaveGuild, kickMember, promoteMember, demoteMember
- [ ] Enhance guildService.js - transferLeadership, updateGuildSettings
- [ ] Enhance guildService.js - depositTreasury, withdrawTreasury
- [ ] Enhance guildService.js - buildFacility, upgradeFacility
- [ ] Enhance guildService.js - createInvite, acceptInvite, cancelInvite
- [ ] Enhance guildService.js - getGuildInfo, getMyGuild, searchGuilds, disbandGuild

**File yang dimodifikasi:**
- `server/src/services/guildService.js`

---

## Phase 3: Backend Handlers & Socket Integration

- [ ] Enhance guildRepository.js - Add all query methods
- [ ] Enhance guildHandler.js - Add all RPC methods
- [ ] Register guild handlers in socketService.js
- [ ] Add guild API endpoints for REST access

**File yang dimodifikasi:**
- `server/src/repositories/guildRepository.js`
- `server/src/handlers/guildHandler.js`
- `server/src/services/socketService.js`
- `server/src/routes/api.js`

---

## Phase 4: Client Network Layer

- [ ] Create GuildHandler.gd for client-side network communication
- [ ] Integrate guild data into game_state.gd
- [ ] Add guild event handlers to SocketHandler.gd

**File baru:**
- `client/src/network/GuildHandler.gd`

**File yang dimodifikasi:**
- `client/src/autoload/game_state.gd`
- `client/src/network/SocketHandler.gd`

---

## Phase 5: Client UI Components

- [ ] Create GuildScreen.tscn and GuildScreen.gd (main interface)
- [ ] Create GuildMemberPanel.tscn and GuildMemberPanel.gd
- [ ] Create GuildFacilitiesPanel.tscn and GuildFacilitiesPanel.gd
- [ ] Create GuildTreasuryPanel.tscn and GuildTreasuryPanel.gd
- [ ] Add guild button to BottomHUD navigation

**File baru:**
- `client/src/ui/GuildScreen.tscn`
- `client/src/ui/GuildScreen.gd`
- `client/src/ui/GuildMemberPanel.tscn`
- `client/src/ui/GuildMemberPanel.gd`
- `client/src/ui/GuildFacilitiesPanel.tscn`
- `client/src/ui/GuildFacilitiesPanel.gd`
- `client/src/ui/GuildTreasuryPanel.tscn`
- `client/src/ui/GuildTreasuryPanel.gd`

**File yang dimodifikasi:**
- `client/src/ui/BottomHUD.gd`
- `client/src/ui/BottomHUD.tscn`

---

## Phase 6: Integration & Testing

- [ ] Test guild creation and member management flow
- [ ] Test treasury deposit/withdraw functionality
- [ ] Test facility build/upgrade functionality
- [ ] Update API.md documentation

**File yang dimodifikasi:**
- `docs/API.md`

---

## Socket Events Reference

### Client → Server (RPC)
| Event | Payload | Description |
|-------|---------|-------------|
| `guild:create` | name, description, templateId | Create new guild |
| `guild:leave` | {} | Leave current guild |
| `guild:kick` | targetUserId | Kick member (OFFICER+) |
| `guild:promote` | targetUserId, newRole | Promote member (OFFICER+) |
| `guild:demote` | targetUserId | Demote member (OFFICER+) |
| `guild:transfer_leadership` | targetUserId | Transfer master role (MASTER) |
| `guild:update_settings` | settings | Update guild settings (MASTER) |
| `guild:deposit_treasury` | amount | Deposit gold to treasury |
| `guild:withdraw_treasury` | amount | Withdraw from treasury (OFFICER+) |
| `guild:build_facility` | templateId | Build facility |
| `guild:upgrade_facility` | facilityId | Upgrade facility |
| `guild:create_invite` | {} | Create invite code |
| `guild:accept_invite` | inviteCode | Join via invite code |
| `guild:cancel_invite` | inviteId | Cancel invite |
| `guild:get_info` | guildId | Get guild info |
| `guild:search` | query | Search guilds |
| `guild:disband` | {} | Disband guild (MASTER) |

### Server → Client (Events)
| Event | Payload | Description |
|-------|---------|-------------|
| `guild:created` | guild data | Guild created successfully |
| `guild:left` | message | Left guild |
| `guild:member_kicked` | targetUserId | Member was kicked |
| `guild:member_promoted` | userId, newRole | Member promoted |
| `guild:member_demoted` | userId, newRole | Member demoted |
| `guild:leadership_transferred` | newMasterId | New guild master |
| `guild:settings_updated` | settings | Settings updated |
| `guild:treasury_updated` | gold, silver | Treasury updated |
| `guild:facility_built` | facility data | Facility built |
| `guild:facility_upgraded` | facility data | Facility upgraded |
| `guild:invite_created` | inviteCode, expiresAt | Invite created |
| `guild:invite_accepted` | user data | User joined via invite |
| `guild:info` | full guild data | Guild information |
| `guild:search_results` | guilds array | Search results |
| `guild:disbanded` | message | Guild disbanded |
| `guild:updated` | full guild data | Full guild sync |

---

## Cara Menggunakan TODO List

1. Agent memulai dari Phase 1 dan dikerjakan berurutan
2. Setiap checkbox `[ ]` dapat diubah menjadi `[x]` saat selesai
3. Jika agent berbeda mengerjakan fase berbeda, koordinasi melalui checkbox
4. Plan lengkap ada di: `plans/guild-system-plan.md`

---

## Dependencies antar Fase

```
Phase 1 (Database) → Phase 2 (Services) → Phase 3 (Handlers)
       ↓                                           ↓
                                               Phase 4 (Client Network)
                                                       ↓
                                               Phase 5 (UI Components)
                                                       ↓
                                               Phase 6 (Testing)
```

**Note:** Phase 1-3 harus selesai sebelum Phase 4 dapat dimulai.
Phase 4 harus selesai sebelum Phase 5 dapat dimulai.
Phase 5 harus selesai sebelum Phase 6 dapat dimulai.
