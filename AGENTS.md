# AGENTS.md - Agent Coding Guidelines for Textical

This file contains guidelines for agentic coding agents operating in this repository.

---

## Project Overview

This repository contains **Textical**, a Godot-based RPG game with:
- **Server**: TypeScript/Node.js MCP server for AI editors
- **Client**: Godot 4.x game engine with GDScript
- **Protocol**: WebSocket-based MCP (Model Context Protocol)

**Key directories:**
- `godot/` - Godot 4.x game project (GDScript, scenes)
- `server/` - TypeScript MCP server (ESM modules)

---

## Build Commands

### Server (TypeScript)

```bash
cd server
npm run build              # Build TypeScript
npm run dev                # Development mode (watch + auto-rebuild)
npm run start              # Start MCP server
npm test                   # Run tests (skip runtime)
npm run test:all          # Run all tests including runtime
```

### Running a Single Test

```bash
# By tool name
node tests/tools.test.js --tool=create_node
node tests/tools.test.js --tool=list_nodes

# By category
node tests/tools.test.js --category=node
node tests/tools.test.js --category=script
node tests/tools.test.js --category=scene

# Verbose output
node tests/tools.test.js --verbose
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

## Telegram Reporting

When completing significant tasks:
```bash
node notify.js last_report.md
```

---

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
