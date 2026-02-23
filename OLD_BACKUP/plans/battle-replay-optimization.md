# Battle Replay Optimization Plan: "The Dual-Stream Architecture" (V4.0 - Peak Performance)

## 1. Objective
Transform the current battle replay system from a heavy, redundant "Full Snapshot" model into a dual-stream architecture to achieve maximum performance and developer clarity.
- **Optimized Stream (`.bin`):** Targeted size < 15KB for a standard 100-tick battle. Encoded as a minified, bitmasked, linearized, and ZLIB-compressed binary blob.
- **Debug Stream (`.debug.json`):** Human-readable, descriptive JSON for deep logic analysis, including raw values and detailed action logs.

---

## 2. Server-Side Optimization Techniques (Node.js)

### T1: Value-Only Arrays (Schema-less JSON)
Instead of standard JSON objects `{"id": 1, "hp": 100}`, we use positional arrays `[1, 100]`.
- **Logic:** The client and server agree on a fixed index map.
- **Index Map:** `0: UnitID`, `1: Bitmask (See T8)`, `2...N: Variable Data based on mask`.
- **Savings:** Removes property names, quotes, and colons from every single unit entry in every tick.

### T2: Bit-Packed Position Encoding
Instead of `{x: 25, y: 10}`, we store a single integer.
- **Formula:** `packedValue = (y * 50) + x`.
- **Reconstruction (Client):** `x = packedValue % 50`, `y = Math.floor(packedValue / 50)`.
- **Savings:** Reduces coordinate storage from ~15 characters to 1-4 characters.

### T3: Delta-State Tracking (Smart Filtering)
The server maintains a `lastKnownState` buffer for every unit.
- **Logic:** In `commitTick()`, compare every unit property. If `pos`, `hp`, and `mp` are identical to the previous tick, the unit is excluded from that tick's payload.
- **Idle Handling:** If no units change state and no events occur, the entire tick is skipped.
- **Savings:** Reduces data by 70-90% during movement cooldowns or "waiting for turn" phases.

### T4: Log Message Templating
Instead of "Aldric hits Boar for 15 dmg", use an ID-based template system.
- **Header:** `templates: { 0: "{0} hits {1} for {2} damage", 1: "{0} is poisoned" }`.
- **Tick Log:** `[0, actorId, targetId, 15]`.
- **Savings:** Dramatically shrinks the `events` array by converting repetitive text into short number sequences.

### T5: Global String Interning (The Dictionary)
All unique strings are moved to a global dictionary header.
- **Header:** `strings: ["Aldric", "Wild Boar", "CRITICAL_HIT", "POISON_TICK"]`.
- **Usage:** Anywhere a string is needed, use its index (e.g., `strings[2]`).
- **Savings:** High savings for long names or status effect identifiers that appear multiple times.

### T6: Tick Merging (Visual Frame Consolidation)
The server simulation might run at 100Hz, but the client only needs 15-20Hz for smooth visual feedback.
- **Logic:** Group every 5 simulation ticks into 1 "Visual Snapshot".
- **Processing:** Events within those 5 ticks are aggregated. The `units` state recorded is the state at the end of the 5th tick.
- **Savings:** Reduces the length of the `ticks` array by 80%.

### T7: Relative Delta Statistics
Instead of logging the absolute new value of a stat, log the change relative to the previous tick.
- **Example:** HP drops from 5000 to 4995. Log `-5` instead of `4995`.
- **Logic:** Smaller numbers use fewer characters in JSON (e.g., `5` is 1 char, `4995` is 4 chars).
- **Exceptions:** On unit spawn or unexpected state jumps, force an absolute value sync.

### T8: Bitmask State Flags (Conditional Property Arrays)
To avoid fixed-size arrays containing many zeros or nulls, we use an integer bitmask at the second position of every unit update array to tell the client which properties follow.
- **Bitmask Definition:**
  - `1 (Bit 0)`: Position Changed (Include packed pos at next index)
  - `2 (Bit 1)`: HP Changed (Include delta HP at next available index)
  - `4 (Bit 2)`: MP Changed (Include delta MP at next available index)
  - `8 (Bit 3)`: AP Changed (Include current AP at next available index)
  - `16 (Bit 4)`: Status Effect Event (Include effect index)
- **Example:** A unit only loses HP. Instead of `[id, pos, -10, mp, ap]`, we send `[id, 2, -10]`.
- **Savings:** Eliminates redundant data placeholders entirely.

### T9: Implicit Targeting & Action Chaining
The client maintains a `persistentTargetMap`. If an event array is missing a target ID or provides a specific "reuse" marker (e.g., `-1`), the client automatically resolves the target from the unit's last known interaction.
- **Savings:** Removes the need to re-transmit the same target ID across sequential attack events.

### T10: Sparse Array Linearization (Flat-Stream Format)
This removes the overhead of JSON object keys and nested array structures by converting the entire replay into a single, massive flat array of numbers.
- **Data Structure:** A continuous sequence: `[HEADER..., STREAM_START, TICK_COUNT, TICK_ID, UNIT_COUNT, ...units, EVENT_COUNT, ...events]`.
- **Parsing Logic:** The client iterates through the array, using the `COUNT` values to know how many indexes to jump forward.
- **Savings:** Removes all curly braces `{}`, quotes `"`, and repetitive key names.

### T11: Binary ZLIB Post-Compression (The Final Squeeze)
After all logic-level optimizations are applied to the "Lean" JSON payload, the entire string/buffer is compressed into a binary format.
- **Server Implementation:** Use Node.js `zlib.deflateSync(jsonString)` to generate a compressed buffer.
- **File Output:** Save the result as `[battleId].bin`.
- **Client Implementation:** Godot uses `FileAccess.get_buffer()` to load the raw bytes and `PackedByteArray.decompress()` with the `COMPRESSION_ZLIB` mode to restore the original JSON structure.
- **Savings:** ZLIB is extremely efficient at compressing the repetitive numeric patterns found in our linearized stream, typically providing an additional 2x to 4x reduction in size.

---

## 4. Execution Roadmap

1. **[ ] Phase 1: The Core Encoder.** Update `battleLogger.js` to implement `lastKnownState` tracking and the `templates`/`strings` dictionaries.
2. **[ ] Phase 2: Bitmask & Linearization.** Implement the logic to generate the flat number stream and bitmasked unit updates.
3. **[ ] Phase 3: Dual Persistence & Compression.** Update `ReplayService.js` to save both `.bin` (compressed) and `.debug.json` (pretty-printed).
4. **[ ] Phase 4: The Stream Decoder.** Rewrite `CombatScreen.gd` to handle binary loading and the index-jumping parser.
5. **[ ] Phase 5: Validation.** Compare visual output of both streams to ensure 100% parity.