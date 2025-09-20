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
