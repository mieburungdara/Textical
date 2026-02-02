# Main Development Plan

## Feature summary
- Goal: Maintain a central plan for development tasks and automate status updates via Telegram.
- User-facing behavior: Real-time notifications on task completion.

## Global Instructions
- **Telegram Notification**: Every time a major task or a checklist item is completed, run `node server/notify.js "Message"` to notify the user.

## Checklist

### Infrastructure
- [x] Create `server/notify.js` for Telegram integration.
- [x] Verify Telegram notification connectivity.
- [ ] Integrate notification trigger into the workflow of future tasks.

### Active Tasks
- [ ] *Next task will be added here*

## Progress log
- 2026-01-30 - Created `server/notify.js` and successfully tested Telegram integration.
- 2026-01-30 - Initialized `PLAN.md` with global notification instructions.
