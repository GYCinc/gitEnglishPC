## 2024-05-22 - Debouncing LocalStorage for High-Frequency State
**Learning:** Synchronous `localStorage` writes during high-frequency events (like dragging/resizing) can consume significant frame budget (12%+ for 500 items just for serialization, plus I/O overhead).
**Action:** Always debounce persistence logic for state that updates at 60fps (e.g., drag positions).

## 2024-05-22 - Stabilizing Callbacks for Drag Performance
**Learning:** In drag-and-drop interfaces where parent state (e.g., list of items) updates on every frame, passing that state directly into `useCallback` dependencies causes the callback to recreate on every frame. If this callback is passed to children, it breaks `React.memo` optimizations, causing O(N) re-renders where N is the number of draggable items.
**Action:** Use the `useRef` pattern to hold the latest version of the state. Read from the ref inside the callback to keep the callback reference stable while accessing fresh data.

## 2024-05-22 - Ref-Based Event Handlers for Frequent Updates
**Learning:** For components receiving high-frequency prop updates (like a dragging block receiving its own position), recreating event handlers (e.g., `onDrag`) on every render forces child components (like `react-rnd`) to re-bind listeners or re-process props.
**Action:** Use a `useRef` updated via `useLayoutEffect` to store the latest state, and access this ref inside stable `useCallback` handlers. This keeps the handler function identity stable across renders.

## 2025-12-24 - Preventing Tree-Wide Re-renders via Ref-Stable Callbacks
**Learning:** When a root component passes configuration callbacks (like `addBlock`) to memoized children (like `Sidebar`), any change in the dependencies of that callback (like typing in a text input for `Theme`) forces the callback to recreate, which in turn forces the memoized children to re-render. This propagates updates unnecessarily.
**Action:** Use a `stateRef` in the root component to hold the current values of all dependencies. Read from `stateRef.current` inside the callback so the callback itself has zero dependencies (`[]`) and remains stable, preventing child re-renders.

## 2025-12-24 - Throttling Resize Events with requestAnimationFrame
**Learning:** Executing complex scale calculations (involving DOM reads/writes and state updates) synchronously on every `resize` event can cause layout thrashing and stuttering, especially as browsers may fire `resize` more frequently than the refresh rate.
**Action:** Wrap resize handlers in a `requestAnimationFrame` loop. This decouples the event frequency from the update frequency, ensuring calculations run at most once per frame, aligned with the browser's paint cycle.
