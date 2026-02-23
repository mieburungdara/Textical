# PROJEK AUDIT REPORT - Textical Game

**Tanggal Audit:** 2026-02-16  
**Tujuan:** Identifikasi file usang untuk optimisasi AI/agent processing

---

## RINGKASAN

| Kategori | Jumlah |
|----------|--------|
| Temporary/Test Scripts | ~80 |
| Report Files (Obsolete) | ~15 |
| Debug Scripts | ~10 |
| **TOTAL** | **~105+** |

---

## KATEGORI 1: TEMPORARY SCRIPTS (HAPUS)

### 1.1 Root Level - temp_*.js (6 files)
- temp_check_all_heroes.js
- temp_check_db.js
- temp_check_hero_2.js
- temp_check_heroes.js
- temp_check_users.js
- temp_find_lyra.js

### 1.2 Root Level - Test Scripts (13 files)
- test_db_connection.js
- test_db.js
- test_logger.js
- test_notifier.js
- test_formatter.py
- test_formatter_fix.py
- test_formatter_comprehensive.py
- test_mcp_basic.py
- test_mcp_server.py
- browser_test_script.js
- create_test_hero.js
- simulate_horde.js
- analyze_replay.py

### 1.3 Server Level - Test Scripts (18 files)
- api_test.js
- battle_test.js
- formation_test.js
- gathering_test.js
- test_boss_logic.js
- test_bt_debugging.js
- test_bt_execution_fixed.js
- test_bt_execution.js
- test_bt_manager.js
- test_clients.js
- test_daily_scheduler.js
- test_dark_element.js
- test_fetch_heroes.js
- test_get_heroes.js
- test_hero_api.js
- test_login.json
- test_output.txt
- market_test.js
- vitality_test.js

### 1.4 Server Level - Verify/Check Scripts (19 files)
- check_heroes.js
- check_items.js
- check_monster_6004.js
- check_test_ids.js
- verify_danger_rewards.js
- verify_grid.js
- verify_guild_ownership.js
- verify_map.js
- verify_npc_optimization.js
- verify_property.js
- verify_pvp_system.js
- verify_realtime_map.js
- verify_tax_distribution.js
- verify_treasure_discovery.js
- verify_visuals.js
- logic_check.js
- db_check.js
- db_diag.js
- debug_seeder.js

### 1.5 Server Level - Debug/Utility Scripts (22 files)
- deep_discover.js
- discover_deps.js
- clean_world_json.js
- sync_db_to_json.js
- migrate_to_assets.js
- fix_monster_ids.js
- overhaul_monster_ids.js
- upgrade_monsters.js
- clear_rate_limit.js
- bridge_audit.js
- execute_deletion.js
- add_skill.js
- add_skill_final.js
- auto_seed_users.js
- create_web_test_user.js

---

## KATEGORI 2: REPORT FILES (OBSOLETE)

### 2.1 Root Level Reports (8 files)
- report.txt
- deletion_report.txt
- report_srp_extended.txt
- report_travel_analysis.txt
- telegram_msg_npc.txt
- telegram_notification_winston.txt
- telegram_notification.txt
- last_report.txt

### 2.2 Server Level Reports (8 files)
- output.log
- seeder_error.log
- spirit_duration_report.txt
- spirit_report.txt
- spirit_sync_report.txt
- telegram_report_inconsistency.txt
- telegram_report.txt
- foreign_key_issues.md

### 2.3 Other Files (1 file)
- bash.exe.stackdump

---

## KATEGORI 3: DUPLICATE/DEPRECATED

### 3.1 Duplicate Documentation
- docs/STAT_SYSTEM.md vs docs/STAT_SYSTEM_12LAYER.md

### 3.2 Concept Drafts
- docs/konsep/FUTURISTIC_IDEAS.md
- docs/konsep/PROGRESSION_JOBS.md
- docs/konsep/TECHNICAL_INFRA.md

### 3.3 Test Artifacts
- client/reports/report_1/

---

## FILES YANG TETAP DIBUTUHKAN

- package.json
- server/package.json
- README.md
- TODO.md
- jest.config.js
- server/jest.config.js
- notify.js
- opencode.json
- install.sh

---

## REKOMENDASI TINDAK LANJUT

### Priority 1 - HIGH (Hapus Segera)
- Semua temp_*.js files
- Semua test_*.js / test_*.py files
- Semua .log files
- bash.exe.stackdump

### Priority 2 - MEDIUM (Review then Delete)
- Server verify/check scripts
- Report .txt files

### Priority 3 - LOW (Cleanup Later)
- Review duplicate documentation
- Review completed plans

---

## ESTIMASI IMPROVEMENT

| Metric | Sebelum | Sesudah |
|--------|---------|---------|
| Total Files | ~200 | ~80 |
| Reduction | - | ~60% |
| AI Processing | Baseline | -30-50% |
