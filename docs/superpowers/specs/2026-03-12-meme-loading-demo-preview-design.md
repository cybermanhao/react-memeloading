# MemeLoading Demo Page Real-time Preview System

**Date**: 2026-03-12
**Author**: Claude Code
**Status**: Approved by user

## Overview

Add a real-time preview system to the existing MemeLoading demo page that shows immediate feedback when users adjust component parameters. This addresses the current workflow where users must click "Trigger Preview" to see changes.

## Problem Statement

The current demo page has excellent configuration controls but requires manual triggering to see effects. Users adjust sliders, pick colors, toggle modes, but can't see the impact until they click the preview button. This creates friction in exploring parameter combinations.

## Design Goals

1. **Instant Feedback**: Show parameter changes immediately
2. **Non-intrusive**: Small preview that doesn't dominate the interface
3. **Complementary**: Works alongside existing "Trigger Preview" for full-screen experience
4. **Performant**: Smooth updates without jank or excessive re-renders

## Solution: Mini Preview Window

A small (200×120px) preview window positioned in the configurator section that shows a live MemeLoading instance reflecting current parameters.

### Component Architecture

```typescript
interface MiniPreviewProps {
  config: Config;          // Same as main config
  isActive: boolean;       // Whether preview should be visible
  triggerPreview: () => void; // Function to trigger full preview
}
```

### Layout Changes

Current layout:
```
[ Controls Panel ] [ Code Preview ]
```

New layout:
```
[ Controls Panel ] [ Mini Preview ]
                  [ Code Preview ]
```

On mobile:
```
[ Controls Panel ]
[ Mini Preview ]
[ Code Preview ]
```

### Visual Design

**Dimensions**: 200×120px fixed size
**Border**: 1px solid #2a2a4a, border-radius: 8px
**Shadow**: 0 4px 12px rgba(0,0,0,0.25)
**Background**: Current `backgroundColor` parameter
**Text**: Scaled to fit window (font-size: 24px instead of 80px)
**Position**: Above code preview, aligned right in configurator grid

### Interaction Design

1. **Parameter Changes**: Mini preview updates instantly with 150ms debounce
2. **Hover Effects**: Slight scale-up (1.02) on hover
3. **Click Behavior**: Clicking triggers full-screen preview (same as main button)
4. **State Indication**: Border pulses subtly when parameters differ from last full preview
5. **Loading State**: Shows "_" cursor animation when active

### Technical Implementation

**New Components**:
- `MiniPreview.tsx` - Standalone preview component
- `usePreviewDebounce.ts` - Custom hook for debounced updates

**State Management**:
```typescript
const [miniPreviewActive, setMiniPreviewActive] = useState(true);
const [lastAppliedConfig, setLastAppliedConfig] = useState(config);
```

**Performance Optimizations**:
- `React.memo` on `MiniPreview` component
- Debounced updates for slider inputs
- `useMemo` for derived configuration values
- CSS transforms for animations (GPU accelerated)

### Integration Points

1. **Configurator Section**: Add mini preview above code block
2. **Controls**: All existing controls propagate to mini preview
3. **Main MemeLoading**: Unaffected, continues full-screen operation
4. **Responsive Design**: Stack vertically on mobile screens

### User Experience Flow

1. User loads page → Mini preview shows default configuration
2. User adjusts slider → Mini preview updates in real-time
3. User changes color → Mini preview background updates instantly
4. User toggles safemod → Text shows/hides in mini preview
5. User clicks mini preview → Triggers full-screen loading (2.5s)
6. User clicks "Trigger Preview" → Same as above

### Edge Cases

- **Very Fast Slider Movement**: Debounce prevents excessive updates
- **Invalid Colors**: Fallback to default rgba(0,0,0,0.88)
- **Empty Meme List**: Show placeholder text
- **Mobile Touch**: Ensure touch targets are adequate
- **Browser Performance**: Graceful degradation if animations stutter

### Success Metrics

- Reduced clicks to see parameter changes (from 2 to 0)
- Increased parameter exploration (more combos tried)
- No performance degradation in demo page
- Positive user feedback on GitHub Issues

## Implementation Plan

### Phase 1: Core Components
1. Create `MiniPreview` component with scaled styling
2. Implement debounced update hook
3. Integrate into existing configurator layout

### Phase 2: Enhanced Interactions
1. Add hover and click animations
2. Implement config diff detection (border pulse)
3. Add responsive design adjustments

### Phase 3: Polish & Testing
1. Performance profiling and optimization
2. Cross-browser testing
3. Mobile UX verification

## Files to Modify

- `example/index.tsx` - Main demo page integration
- `example/demo.css` - Additional styles for mini preview
- `src/MemeLoading.tsx` - Minor adjustments for external control

## Files to Create

- `example/components/MiniPreview.tsx` - Preview component
- `example/hooks/usePreviewDebounce.ts` - Debounce utility

## Dependencies

No new package dependencies required. Uses existing React hooks and CSS.

## Testing Strategy

- Manual testing of all parameter combinations
- Performance testing with Chrome DevTools
- Responsive testing across device sizes
- Cross-browser testing (Chrome, Firefox, Safari)

## Rollout Plan

1. Develop locally and test extensively
2. Push to `feature/mini-preview` branch
3. Test on GitHub Pages deployment
4. Merge to main after approval
5. Update README if needed

## Future Considerations

- URL parameter sharing for specific configurations
- Configuration presets/saving
- A/B testing different preview sizes
- Integration with meme selection (click meme to preview)

---

**Approval**: User approved design on 2026-03-12
**Next Step**: Create implementation plan with writing-plans skill