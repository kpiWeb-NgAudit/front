# React Project Architecture

This project follows a standard React project architecture with the following directory structure:

## Directory Structure

### `/src` - Source code
- `/assets` - Static assets like images, fonts, etc.
- `/components` - Reusable UI components
- `/constants` - Constant values used throughout the application
- `/context` - React context providers for state management
- `/hooks` - Custom React hooks
- `/layouts` - Layout components that wrap pages
- `/pages` - Page components that represent routes
- `/routes` - Route definitions and configuration
- `/services` - API calls and other services
- `/store` - State management (Redux, MobX, etc.)
- `/styles` - Global styles and theme
- `/types` - TypeScript type definitions
- `/utils` - Utility functions

### `/public` - Public assets
- Static files that will be served directly

## Best Practices

### Components
- Keep components small and focused on a single responsibility
- Use functional components with hooks instead of class components
- Place component-specific styles in the same directory as the component

### State Management
- Use React Context for simple state management
- Consider Redux or MobX for more complex state management needs
- Keep state normalized to avoid duplication

### Styling
- Consider using CSS modules or styled-components for component-specific styles
- Keep global styles in the `/styles` directory

### API Calls
- Centralize API calls in the `/services` directory
- Use custom hooks to handle API state and loading

### Routing
- Define routes in the `/routes` directory
- Use React Router for navigation

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`