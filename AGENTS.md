# Practice Genie Workspace Rules

Welcome to the Practice Genie repository. This document outlines the system workspace rules to help you (the user) and me (the agent) work together confidently, effectively, and with the right "vibe".

## 1. Project Context
**Practice Genie** is a React-based application for generating and managing educational exercises on an infinite whiteboard. It features:
- **Infinite Canvas**: Draggable, resizable blocks (`react-rnd`).
- **AI Integration**: Generates content using Mistral AI.
- **Interactive Exercises**: Fill-in-the-blanks, MCQs, etc.
- **Presentation Mode**: Full-screen "Live Mode" for classroom use.

## 2. Tech Stack
*   **Framework**: React 19 + Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State/Interactions**: `react-rnd` (for drag/drop), `React.memo` (performance).
*   **Package Manager**: `pnpm` (Preferred over npm).

## 3. Vibe Coding Guidelines (The "Non-Nerd" Rule Set)
We prioritize speed, clarity, and user experience.

### Architecture & Structure
*   **Keep it Flat**: Don't over-engineer folder structures. Putting components in `components/` and hooks in `hooks/` is perfect.
*   **Functional Components**: Use modern React functional components with hooks.
*   **No Class Components**: Unless absolutely necessary (which is almost never).

### Styling
*   **Tailwind All the Way**: Use Tailwind utility classes directly in your JSX. Avoid creating separate `.css` or `.module.css` files unless you have a very specific animation that Tailwind can't handle.
*   **Responsive**: Always think about how it looks on different screen sizes, but prioritize the desktop/tablet whiteboard experience.

### Performance (The "Smoothness" Rule)
*   **Draggable Stuff**: Anything that moves (like `ExerciseBlock`) MUST be optimized.
    *   Use `React.memo` to wrap these components.
    *   Use `useCallback` for functions passed to them.
    *   **Why?** Because re-rendering heavy components while dragging feels laggy and bad.
*   **Refs over State**: For high-frequency updates (like mouse coordinates during a drag), use `useRef` to store values without triggering re-renders, if visual updates aren't needed instantly.

### UX & "Vibe"
*   **Visual Feedback**: Buttons should feel clickable (hover states, active states).
*   **Loading States**: Always show a loading spinner or skeleton when fetching AI data.
*   **Error Handling**: If the AI fails, show a friendly error message, not a white screen.

## 4. Workflow & Verification
1.  **Start the App**:
    ```bash
    pnpm dev
    ```
2.  **Verify Visually**:
    *   Does it look good?
    *   Does it break the whiteboard dragging?
    *   Does the grid look right?
3.  **Clean Up**: Remove unused imports and `console.log` statements before finishing (unless they are `ActivityLogger` calls).

## 5. Critical System Constraints
*   **ActivityLogger**: You **MUST** use the `ActivityLogger` context for tracking user actions. This is core to the application's data strategy.
    *   Example: `logger?.logFocusItem(...)`
*   **Deployment**:
    *   The project is deployed on Vercel.
    *   `vercel.json` exists to handle SPA routing (rewrites).
    *   **Do not touch** `_microfrontends.json` unless specifically asked; it is disabled.
*   **Mistral AI**: The app expects an API key. If missing, it falls back to mock data (which is good for testing).

## 6. Agent Instructions
When you (the agent) are working here:
*   **Check `pnpm-lock.yaml`**: Ensure you respect the lockfile.
*   **Read `ExerciseBlock.tsx`**: It is the canonical example of a complex, well-optimized component in this codebase. Follow its patterns.
*   **Ask for Clarification**: If a "vibe" instruction is vague, ask what the user wants it to *look* or *feel* like.

---
*Happy Coding!*
