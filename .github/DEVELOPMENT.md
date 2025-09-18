# Development Workflow Guide

## Team Claude Code Consistency

This guide ensures all developers using Claude Code follow the same patterns and maintain consistency across the project.

## Prerequisites

1. **Install dependencies**: `npm install`
2. **Verify setup**: `npm run type-check && npm run lint`

## Daily Workflow

### Starting Work

```bash
# Pull latest changes
git pull origin main

# Verify project health
npm run type-check && npm run lint

# Start development server
npm run dev
```

### Making Changes

1. **Before coding**: Review existing patterns in the codebase
2. **During coding**: Follow TypeScript strict mode and existing conventions
3. **Component creation**: Use existing components in `/src/components/ui/` first
4. **File placement**: Follow the established folder structure

### Before Committing

```bash
# Format and fix linting issues
npm run format && npm run lint:fix

# Run type checking
npm run type-check

# Verify build works
npm run build

# Run tests if applicable
npm test
```

## Claude Code Best Practices

### For Developers Using Claude Code

1. **Always reference CLAUDE.md** - Ensure Claude Code follows project-specific rules
2. **Use consistent commands** - Always run the same sequence of validation commands
3. **Follow patterns** - Point Claude Code to existing code patterns before creating new ones
4. **Validate changes** - Always run build and type-check after Claude Code makes changes

### Common Claude Code Instructions

When asking Claude Code to help:

```
Please review the existing code patterns in this project before making changes.
Always run npm run type-check && npm run lint:fix after making changes.
Follow the component structure defined in /src/components/ and /src/app/Components/.
Use TypeScript interfaces for all props and maintain existing naming conventions.
```

## Project Structure Standards

```
src/
├── app/                    # Next.js app router pages
│   ├── Components/         # App-specific components
│   ├── api/               # API routes
│   └── (routes)/          # Route groups
├── components/            # Reusable components
│   └── ui/               # UI primitives
├── lib/                  # Utility functions
```

## Code Review Checklist

Before merging any PR (including Claude Code generated code):

- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] Build succeeds (`npm run build`)
- [ ] Components follow existing patterns
- [ ] Props have TypeScript interfaces
- [ ] No console.log or debugger statements
- [ ] Accessibility guidelines followed
- [ ] Performance considerations addressed

## Troubleshooting

### Common Issues

1. **Type errors**: Run `npm run type-check` to see detailed errors
2. **Lint errors**: Run `npm run lint:fix` to auto-fix many issues
3. **Build failures**: Check for unused imports and type issues
4. **Formatting issues**: Run `npm run format` to standardize formatting

### Claude Code Specific Issues

If Claude Code produces inconsistent results:

1. **Check CLAUDE.md**: Ensure the configuration file is up to date
2. **Provide context**: Share existing code patterns with Claude Code
3. **Validate immediately**: Run type-check and lint after each change
4. **Use incremental approach**: Make smaller, focused changes

## Team Communication

### When to Update Standards

1. **New patterns emerge**: Document and share with team
2. **Tool updates**: Update CLAUDE.md and this guide
3. **Performance improvements**: Document best practices
4. **Accessibility updates**: Update component patterns

### Sharing Claude Code Learnings

1. **Document successful patterns** in CLAUDE.md
2. **Share common prompts** that work well for this project
3. **Report inconsistencies** when Claude Code behavior varies
4. **Update this guide** with new best practices

## Performance Guidelines

- Use Next.js Image component for images
- Implement proper loading states
- Use dynamic imports for heavy components
- Follow React performance best practices
- Monitor Core Web Vitals

## Security Guidelines

- No hardcoded secrets or API keys
- Validate all user inputs with Zod
- Use proper TypeScript typing for API responses
- Follow Next.js security best practices
- Implement proper error handling

---

_Last updated: [Current Date] | Ensure all team members follow these guidelines for consistency_
