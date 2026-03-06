# AGENTS.md - Agent Coding Guidelines for Textical

This file contains guidelines for agentic coding agents operating in this repository.

---

## Project Overview

This repository contains **Textical**, a Godot-based RPG game with:
- **Client**: Godot 4.x game project (GDScript, scenes) in `godot/`
- **Game Server**: TypeScript/Node.js server handling combat simulation, player data, and multiplayer in `server/`
- **MCP Server**: TypeScript MCP server for AI editors (Claude, Cursor) in `godot_mcp/`
- **Protocol**: WebSocket-based MCP (Model Context Protocol)

**Key directories:**
- `godot/` - Godot 4.x game project with MCP plugin in addons/godot_mcp/
- `server/` - Game server for combat simulation and player data
- `godot_mcp/` - MCP server for AI integration

---

## Build Commands

### Game Server (TypeScript)
```bash
cd server
npm install                  # Install dependencies
npm run build                # Build TypeScript
npm run dev                  # Development mode (watch + auto-rebuild)
npm start                    # Start server (port 3000)
npm test                     # Run combat tests
npm run db:migrate           # Run database migrations
npm run db:seed              # Seed initial data
```

### MCP Server (TypeScript)
```bash
cd godot_mcp
npm run build              # Build TypeScript
npm run dev                # Development mode (watch + auto-rebuild)
npm run start              # Start MCP server
npm test                   # Run tests (skip runtime)
npm run test:all          # Run all tests including runtime
```

### Running a Single Test

```bash
# By tool name
cd godot_mcp && node tests/tools.test.js --tool=create_node

# Combat simulation tests
cd server && npm test
```

**Prerequisites:** Godot editor running with MCP plugin enabled, WebSocket on port 9080, run `npm run build` first.

---

## Code Style Guidelines

### TypeScript (Server)

**Imports:** Use ESM with `.js` extensions. Always include file extensions.
```typescript
import { z } from 'zod';
import { FastMCP } from 'fastmcp';
import { getGodotConnection } from '../utils/godot_connection.js';
```

**Types:** Use interfaces for parameters, Zod for runtime validation.

**Naming:**
- Files: kebab-case (`node_tools.ts`)
- Classes: PascalCase (`GodotConnection`)
- Functions: camelCase (`getGodotConnection`)
- Interfaces: PascalCase with `Params` suffix (`CreateNodeParams`)

**Formatting:** 2 spaces indentation, 100 char max line length, JSDoc for public APIs.

### GDScript (Godot Plugin)

```gdscript
@tool
extends EditorPlugin

const MY_CONSTANT := 42
var my_variable: int = 0

func _ready() -> void:
    pass

func my_function(param: String) -> void:
    pass
```

**Naming:**
- Files: snake_case (`mcp_server.gd`)
- Classes/Nodes: PascalCase (`MCPWebSocketServer`)
- Variables/Functions: snake_case
- Constants: SCREAMING_SNAKE_CASE
- Signals: snake_case with past tense (`client_connected`)

**Type Annotations:** Always use type annotations (`var count: int = 0`).

---

## Error Handling

### JavaScript/TypeScript
```javascript
// ✅ CORRECT
} catch (error) {
    logger.error('[FunctionName] Error', { error: error.message, stack: error.stack });
    throw error;
}

// ❌ FORBIDDEN
catch (e) {}
catch (e) { return; }
catch (e) { return null; }
```

### GDScript
```gdscript
# ✅ CORRECT
func my_function():
    push_error("[my_function] Error: " + str(error))
    return null

# ❌ FORBIDDEN
except: pass
except: return
except: print("Error")
```

---

## Architecture Principles

- **SRP:** One file = one concern. Refactor if >300 lines with multiple domains.
- **DRY:** Extract common logic into helper functions. Avoid copy-paste.
- **Documentation First:** Read `/docs/` before implementing.

---

## Logging Standards

**JavaScript:** Use Winston logger (not `console.log`). Include metadata.
```javascript
logger.info('[Service.method] Operation started', { userId: user.id });
```

**GDScript:** Use `print()`, `push_warning()`, `push_error()`.

---

## Tick-Based Combat System

Use **tick-based** system (not real-time) for combat logic. Use game tick counters, not `Date.now()`. Exception: energy regen, NPC wanderers, world events.

---

## Game Server Features

### Server Responsibilities
- **Combat Simulation**: Handles turn-based combat using tick-based system
- **Player Data**: Manages player accounts, inventory, quests, and progression
- **Multiplayer**: Socket.IO for real-time communication
- **Database**: Prisma ORM with SQLite
- **Authentication**: Player session management

### Database Models
```
- Player (id, name, classType, level, experience, gold)
- Inventory (playerId, itemId, quantity)
- QuestProgress (playerId, questId, status, progress)
- CombatLog (playerId, enemyTeam, playerTeam, result, logs)
```

### API Endpoints
- `/api/status` - Server status and player count
- `/api/players` - Player management
- `/api/combat` - Combat simulation
- WebSocket events for real-time communication

---

## Telegram Reporting

When completing significant tasks:
```bash
node notify.js last_report.md
```

---

## File Paths Reference

- MCP Server TypeScript: `godot_mcp/src/`
- MCP Server tests: `godot_mcp/tests/`
- Godot plugin: `godot/addons/godot_mcp/`
- Godot project: `godot/`
- Game server TypeScript: `server/src/`
- Game server tests: `server/tests/`

## Additional Rules

Located in `.kilocode/rules/`:
- `winston_logging_rule.md` - Logging and error handling
- `single_responsibility.md` - SRP principle
- `dry_principle.md` - DRY principle
- `documentation_governance.md` - Documentation rules
- `tick_based_combat.md` - Combat system rules
- `game_data_management.md` - JSON vs Database rules

---

*Last updated: March 2026*
