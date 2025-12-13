## 2024-05-22 - Debouncing LocalStorage for High-Frequency State
**Learning:** Synchronous `localStorage` writes during high-frequency events (like dragging/resizing) can consume significant frame budget (12%+ for 500 items just for serialization, plus I/O overhead).
**Action:** Always debounce persistence logic for state that updates at 60fps (e.g., drag positions).

## 2024-05-22 - Stabilizing Callbacks for Drag Performance
**Learning:** In drag-and-drop interfaces where parent state (e.g., list of items) updates on every frame, passing that state directly into `useCallback` dependencies causes the callback to recreate on every frame. If this callback is passed to children, it breaks `React.memo` optimizations, causing O(N) re-renders where N is the number of draggable items.
**Action:** Use the `useRef` pattern to hold the latest version of the state. Read from the ref inside the callback to keep the callback reference stable while accessing fresh data.
