## 2024-05-22 - Radial Menu Accessibility
**Learning:** Icon-only floating action buttons (FAB) are often overlooked in accessibility audits. Adding `aria-label` is crucial, but making the main toggle button communicate state (`aria-expanded`) provides a much better experience for screen reader users.
**Action:** Always check `aria-expanded` and dynamic labels for menu toggles.
