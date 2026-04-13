## Development Roadmap

### Current Status
The app already supports:
- Save GoLogin token locally
- Load folders
- Create folders
- Create profiles
- Load profiles
- Run profile
- Stop profile
- Open browser window
- Move profile to another folder
- Rename profile

---

## Next Plan

### Phase 1 — Clean up the codebase
Goal: make the project easier to maintain and expand.

Tasks:
- Split `renderer.js` into smaller files:
  - `api.js`
  - `folders.js`
  - `profiles.js`
  - `browser.js`
  - `ui.js`
- Standardize function names and file structure
- Reduce repeated code
- Prepare the codebase for future features

---

### Phase 2 — Add Run Mode
Goal: support both Cloud run and Local run.

Tasks:
- Add `Run Mode` selector:
  - Cloud
  - Local
- Keep current Cloud run working
- Research and implement Local run flow
- Show current mode clearly in UI

---

### Phase 3 — Queue System
Goal: manage multiple profiles more efficiently.

Tasks:
- Add profile job queue
- Add status:
  - queued
  - running
  - stopped
  - failed
  - completed
- Set max concurrent running profiles
- Prevent invalid duplicate runs

---

### Phase 4 — Folder & Profile Management Improvements
Goal: complete the core management features.

Tasks:
- Rename folder
- Delete folder
- Delete profile
- Clone profile
- Bulk move profiles to folder
- Bulk rename / bulk actions

---

### Phase 5 — Proxy Management
Goal: prepare profiles for scaled usage.

Tasks:
- Load proxy list
- Add proxy
- Assign proxy to profile
- Bulk assign proxies
- Show proxy status in profile list

---

### Phase 6 — Better UI/UX
Goal: make the app easier for daily use.

Tasks:
- Cleaner layout
- Better loading states
- Better error messages
- Search profiles
- Filter by folder
- Better action buttons
- Notification/toast messages

---

### Phase 7 — Local Data & Settings
Goal: make the app feel like a real desktop tool.

Tasks:
- Save settings locally
- Save run mode
- Save last selected folder
- Save app preferences
- Improve token handling

---

### Phase 8 — Automation Foundation
Goal: prepare for future automation tasks.

Tasks:
- Define automation task structure
- Add simple task templates
- Add logs for each run
- Add retry / timeout handling
- Prepare integration with browser automation tools later

---

### Long-Term Goal
Build a desktop app for managing and running multiple GoLogin profiles efficiently, with support for:
- profile management
- folder management
- proxy management
- local/cloud run modes
- queue system
- future automation workflows
