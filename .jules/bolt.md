## 2024-05-22 - Debouncing LocalStorage for High-Frequency State
**Learning:** Synchronous `localStorage` writes during high-frequency events (like dragging/resizing) can consume significant frame budget (12%+ for 500 items just for serialization, plus I/O overhead).
**Action:** Always debounce persistence logic for state that updates at 60fps (e.g., drag positions).
