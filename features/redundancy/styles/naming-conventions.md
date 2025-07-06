# CSS Naming Conventions for 2N+1 Redundancy Feature

## Prefix Strategy
All CSS classes must use the `rdx-` prefix to ensure complete isolation from core application styles.

## Naming Structure
```
rdx-{component}-{element}--{modifier}
```

## Component Classes

### Base Components
- `.rdx-overlay` - Main overlay container
- `.rdx-backdrop` - Semi-transparent backdrop
- `.rdx-button` - Trigger button
- `.rdx-panel` - Info panel container

### Layout
- `.rdx-container` - General container
- `.rdx-wrapper` - Wrapper elements
- `.rdx-grid` - Grid layouts
- `.rdx-flex` - Flex layouts

### Visual Elements
- `.rdx-line` - Power line elements
- `.rdx-line--active` - Active power lines
- `.rdx-line--standby` - Standby power lines
- `.rdx-marker` - Substation markers
- `.rdx-marker--active` - Active substation
- `.rdx-marker--standby` - Standby substation
- `.rdx-glow` - Glow effects

### States
- `.rdx-visible` - Visible state
- `.rdx-hidden` - Hidden state
- `.rdx-animating` - Animation in progress
- `.rdx-loading` - Loading state
- `.rdx-error` - Error state

### Animations
- `.rdx-fade-in` - Fade in animation
- `.rdx-fade-out` - Fade out animation
- `.rdx-slide-in` - Slide in animation
- `.rdx-pulse` - Pulse animation
- `.rdx-glow-breathe` - Breathing glow effect

### Typography
- `.rdx-text` - Base text
- `.rdx-title` - Titles
- `.rdx-label` - Labels
- `.rdx-caption` - Captions
- `.rdx-stat` - Statistics display

### Responsive
- `.rdx-mobile` - Mobile-specific styles
- `.rdx-tablet` - Tablet-specific styles
- `.rdx-desktop` - Desktop-specific styles

### Accessibility
- `.rdx-sr-only` - Screen reader only
- `.rdx-focus` - Focus indicators
- `.rdx-high-contrast` - High contrast mode

## Examples

```css
/* Main overlay */
.rdx-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: var(--rdx-z-overlay);
}

/* Active power line with glow */
.rdx-line--active {
  stroke: var(--rdx-color-active);
  filter: url(#rdx-glow-filter);
}

/* Info panel slide-in animation */
.rdx-panel.rdx-slide-in {
  animation: rdx-slide-in-right var(--rdx-duration-panel) ease-out;
}
```

## CSS Custom Properties
All values should use CSS custom properties with `--rdx-` prefix:

```css
:root {
  /* Colors */
  --rdx-color-active: #ef4444;
  --rdx-color-standby: #fbbf24;
  --rdx-color-connection: #8b5cf6;
  
  /* Z-index */
  --rdx-z-backdrop: 999;
  --rdx-z-overlay: 1000;
  --rdx-z-panel: 1001;
  
  /* Animation */
  --rdx-duration-fade: 1000ms;
  --rdx-duration-panel: 1000ms;
  --rdx-easing-default: ease-in-out;
}
```

## Guidelines

1. **Always use rdx- prefix** - No exceptions
2. **Follow BEM methodology** - Block__Element--Modifier
3. **Use CSS custom properties** - For all configurable values
4. **Group related styles** - Keep component styles together
5. **Document complex selectors** - Add comments for clarity
6. **Test isolation** - Ensure no conflicts with core app styles