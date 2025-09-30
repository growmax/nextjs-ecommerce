# Project Development Guidelines

## User Experience (UX) Best Practices

Always to be follow the .claude\instructions.md this file given rules.

### Form Interactions

- **Auto-focus primary input fields**: Always auto-focus the main input field on forms (e.g., email on login, search on search pages) to reduce user friction
- **Provide edit/change options**: When users progress through multi-step forms, always provide a way to go back and edit previous inputs
- **Clear visual feedback**: Show loading states, success/error messages, and form validation clearly
- **Accessible touch targets**: Ensure buttons and interactive elements meet minimum touch target sizes (44px minimum)

### Navigation & Flow

- **Progressive disclosure**: Break complex forms into logical steps
- **Clear progress indicators**: Show users where they are in multi-step processes
- **Intuitive back navigation**: Allow users to easily return to previous steps

### Performance & Accessibility

- **Fast load times**: Optimize for performance on all devices
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Screen reader support**: Use proper ARIA labels and semantic HTML
- **Mobile-first design**: Design for mobile devices first, then enhance for larger screens

## Code Standards

### React Best Practices

- Use TypeScript for type safety
- Implement proper error boundaries
- Use React hooks appropriately (useEffect for side effects, useRef for DOM access)
- Follow the principle of single responsibility for components

### Client-Side Components

- **ALWAYS use `next/dynamic` with `ssr: false`** for purely client-side components
- **Follow existing patterns** - Match the exact implementation used in dashboard page
- **DO NOT OVERENGINEER** - Keep components simple and focused on the specific request
- **Don't assume requirements** - Stick to what was specifically requested
- **Use consistent patterns** - If a pattern exists (like dashboard), replicate it exactly

### Implementation Guidelines

- **NEVER overengineer solutions** - Implement only what is explicitly requested
- **DO NOT ASSUME AND ADD EXTRA CODE** - Only implement the specific functionality asked for
- **Ask before adding features** - Don't assume additional functionality is needed
- **Keep it simple** - Simple, working code is better than complex, feature-rich code
- **Match existing patterns** - If similar functionality exists, copy the exact approach
- **Avoid premature optimization** - Don't add complexity without explicit need
- **Stick to requirements** - When user asks for a specific API method, only add that method

Example:

```typescript
import dynamic from "next/dynamic";

const ClientComponent = dynamic(() => import("./ClientComponent"), {
  ssr: false,
});
```

### Authentication & Security

- Never expose sensitive data in client-side code
- Use proper JWT token handling
- Implement proper session management
- Follow OWASP security guidelines

## Development Workflow

- Test user flows thoroughly
- Consider edge cases and error states
- Implement proper loading and error handling
- Use semantic HTML and proper accessibility practices
