# MemeLoading Mini Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real-time mini preview window to MemeLoading demo page showing immediate feedback for parameter changes

**Architecture:** Create standalone MiniPreview component that renders scaled-down MemeLoading with current config, positioned above code preview in configurator. Uses debounced updates for smooth performance.

**Tech Stack:** React, TypeScript, Vite, CSS

---

## File Structure

**Create:**
- `example/components/MiniPreview.tsx` - Mini preview component
- `example/hooks/usePreviewDebounce.ts` - Custom debounce hook

**Modify:**
- `example/index.tsx:144-148` - Add MiniPreview to configurator layout
- `example/demo.css` - Add mini preview styles
- `example/index.tsx:70-80` - Add state management for preview

---

## Chunk 1: Core MiniPreview Component

### Task 1: Create MiniPreview component

**Files:**
- Create: `example/components/MiniPreview.tsx`

- [ ] **Step 1: Create component file with basic structure**

```bash
mkdir -p example/components
cat > example/components/MiniPreview.tsx << 'EOF'
import React from 'react';
import MemeLoading from '../../src/index';
import { Config } from '../index';

interface MiniPreviewProps {
  config: Config;
  isActive: boolean;
  onPreviewClick?: () => void;
}

const MiniPreview: React.FC<MiniPreviewProps> = ({
  config,
  isActive,
  onPreviewClick,
}) => {
  return (
    <div className="mini-preview" onClick={onPreviewClick}>
      <div className="mini-preview-inner">
        <MemeLoading
          loadingSignal={isActive}
          minDuration={config.minDuration}
          boostDuration={config.boostDuration}
          backgroundColor={config.backgroundColor}
          safemod={config.safemod}
          trueFan={config.trueFan}
        />
      </div>
    </div>
  );
};

export default MiniPreview;
EOF
```

- [ ] **Step 2: Verify file creation**

Run: `ls example/components/MiniPreview.tsx`
Expected: `example/components/MiniPreview.tsx`

- [ ] **Step 3: Check TypeScript compilation**

Run: `npx tsc --noEmit example/components/MiniPreview.tsx 2>&1 | head -20`
Expected: No errors or only module resolution warnings

### Task 2: Add debounce hook

**Files:**
- Create: `example/hooks/usePreviewDebounce.ts`

- [ ] **Step 1: Create hook file**

```bash
mkdir -p example/hooks
cat > example/hooks/usePreviewDebounce.ts << 'EOF'
import { useEffect, useState, useRef } from 'react';

export function usePreviewDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
EOF
```

- [ ] **Step 2: Verify hook creation**

Run: `ls example/hooks/usePreviewDebounce.ts`
Expected: `example/hooks/usePreviewDebounce.ts`

### Task 3: Update index.tsx to use MiniPreview

**Files:**
- Modify: `example/index.tsx`

- [ ] **Step 1: Add imports and state**

Find lines around 70-80 in index.tsx (after other imports):

```tsx
import MemeLoading, { defaultMemesSet } from '../src/index';
import '../src/index.css';
import './demo.css';
```

Add after these imports:

```tsx
import MiniPreview from './components/MiniPreview';
import { usePreviewDebounce } from './hooks/usePreviewDebounce';
```

- [ ] **Step 2: Add preview state**

Find the `App` component definition around line 15 and add state:

```tsx
const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Config>({
    minDuration: 1.5,
    boostDuration: 0.2,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    safemod: false,
    trueFan: false,
  });
  const [copied, setCopied] = useState(false);
  const [triggerMemeIndex, setTriggerMemeIndex] = useState<number | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [refreshingImage, setRefreshingImage] = useState(false);

  // Add this state for mini preview
  const [miniPreviewActive, setMiniPreviewActive] = useState(false);
  const [autoPreviewTimeout, setAutoPreviewTimeout] = useState<number | null>(null);
```

- [ ] **Step 3: Add debounced config**

Add after the state definitions:

```tsx
  // Debounced config for mini preview
  const debouncedConfig = usePreviewDebounce(config, 150);
```

- [ ] **Step 4: Add auto-preview trigger**

Add this function after other handlers (around line 85):

```tsx
  const triggerAutoPreview = useCallback(() => {
    if (autoPreviewTimeout) {
      window.clearTimeout(autoPreviewTimeout);
    }

    setMiniPreviewActive(true);
    const timeout = window.setTimeout(() => {
      setMiniPreviewActive(false);
    }, 1000);

    setAutoPreviewTimeout(timeout);

    return () => {
      if (autoPreviewTimeout) {
        window.clearTimeout(autoPreviewTimeout);
      }
    };
  }, [autoPreviewTimeout]);
```

- [ ] **Step 5: Update config setter to trigger preview**

Find the `set` function (around line 105) and modify:

```tsx
  const set = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig(c => ({ ...c, [key]: value }));
    triggerAutoPreview();
  };
```

- [ ] **Step 6: Add cleanup effect**

Add this effect after other effects:

```tsx
  // Cleanup auto-preview timeout
  useEffect(() => {
    return () => {
      if (autoPreviewTimeout) {
        window.clearTimeout(autoPreviewTimeout);
      }
    };
  }, [autoPreviewTimeout]);
```

---

## Chunk 2: Layout Integration

### Task 4: Add MiniPreview to configurator layout

**Files:**
- Modify: `example/index.tsx:144-230`

- [ ] **Step 1: Find configurator section**

Look for the configurator section starting around line 144:

```tsx
      {/* ── CONFIGURATOR ── */}
      <section className="section">
        <h2 className="section-title">配置</h2>
        <div className="configurator">
```

- [ ] **Step 2: Update grid layout**

Change the configurator div to use a 2-column grid:

```tsx
        <div className="configurator">
          {/* Controls */}
          <div className="controls">
            {/* ... existing controls ... */}
          </div>

          {/* Preview column */}
          <div className="preview-column">
            <MiniPreview
              config={debouncedConfig}
              isActive={miniPreviewActive}
              onPreviewClick={() => trigger(1000)}
            />

            {/* Code panel */}
            <div className="code-panel">
              <div className="code-header">
                <span className="code-title">代码</span>
                <button className="btn-copy" onClick={copyCode}>
                  {copied ? '已复制 ✓' : '复制'}
                </button>
              </div>
              <pre className="code-block"><code>{codeSnippet}</code></pre>
            </div>
          </div>
        </div>
```

### Task 5: Update CSS for new layout

**Files:**
- Modify: `example/demo.css`

- [ ] **Step 1: Add mini preview styles**

Find the end of the CSS file and add:

```css
/* ── Mini Preview ── */
.mini-preview {
  width: 200px;
  height: 120px;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  background: #0a0a1e;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.mini-preview:hover {
  transform: scale(1.02);
  border-color: #7c3aed55;
}

.mini-preview-inner {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.mini-preview .meme-loading {
  transform: scale(0.25);
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
  width: 400%;
  height: 400%;
}

.mini-preview .meme {
  font-size: 20px !important;
  line-height: 1.2;
}

/* Preview column layout */
.preview-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Update configurator grid */
.configurator {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

@media (max-width: 768px) {
  .configurator {
    grid-template-columns: 1fr;
  }

  .preview-column {
    order: -1;
    margin-bottom: 20px;
  }

  .mini-preview {
    width: 100%;
    max-width: 300px;
    height: 150px;
    margin: 0 auto 20px;
  }
}
```

- [ ] **Step 2: Update existing range row styles**

Find the `.range-row` style (around line 155) and update:

```css
.range-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.range-row input[type="range"] {
  flex: 1;
  accent-color: #7c3aed;
  cursor: pointer;
  transition: accent-color 0.2s;
}

.range-row input[type="range"]:active {
  accent-color: #a78bfa;
}
```

### Task 6: Add MemeLoading scaling support

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Make MemeLoading more flexible for scaling**

Update the CSS to support scaling:

```css
.meme-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(56, 60, 70, 0.2);
    z-index: 1000; /* 确保遮罩在最顶层 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    pointer-events: none;
}

.meme-loading.scalable {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: auto;
}

.meme-loading .meme {
    margin: auto;
    font-size: 80px;
    font-weight: 400;
    color: #ffffff;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    text-align: center;
    word-break: break-all;
    white-space: pre-wrap;
    user-select: none;
}
```

- [ ] **Step 2: Update MiniPreview to use scalable class**

Update `example/components/MiniPreview.tsx`:

```tsx
import React from 'react';
import MemeLoading from '../../src/index';
import { Config } from '../index';

interface MiniPreviewProps {
  config: Config;
  isActive: boolean;
  onPreviewClick?: () => void;
}

const MiniPreview: React.FC<MiniPreviewProps> = ({
  config,
  isActive,
  onPreviewClick,
}) => {
  return (
    <div className="mini-preview" onClick={onPreviewClick}>
      <div className="mini-preview-inner">
        <div className="meme-loading scalable" style={{
          backgroundColor: config.backgroundColor,
          visibility: isActive ? 'visible' : 'hidden'
        }}>
          <div className="meme">
            {config.safemod ? '' : 'Loading_'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPreview;
```

---

## Chunk 3: Polish and Testing

### Task 7: Add visual feedback for changes

**Files:**
- Modify: `example/index.tsx` and `example/demo.css`

- [ ] **Step 1: Add config diff detection**

Add this state and effect to track config changes:

```tsx
  const [lastAppliedConfig, setLastAppliedConfig] = useState(config);
  const [configChanged, setConfigChanged] = useState(false);

  useEffect(() => {
    const hasChanged =
      lastAppliedConfig.minDuration !== config.minDuration ||
      lastAppliedConfig.boostDuration !== config.boostDuration ||
      lastAppliedConfig.backgroundColor !== config.backgroundColor ||
      lastAppliedConfig.safemod !== config.safemod ||
      lastAppliedConfig.trueFan !== config.trueFan;

    setConfigChanged(hasChanged);
  }, [config, lastAppliedConfig]);
```

- [ ] **Step 2: Update trigger function to reset diff**

```tsx
  const trigger = useCallback((ms = 2500) => {
    if (loading) return;
    setLoading(true);
    setLastAppliedConfig(config);
    setConfigChanged(false);
    setTimeout(() => setLoading(false), ms);
  }, [loading, config]);
```

- [ ] **Step 3: Add visual indicator CSS**

```css
/* Config changed indicator */
.mini-preview.changed {
  border-color: #a78bfa;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { border-color: #a78bfa; }
  50% { border-color: #7c3aed; }
}
```

- [ ] **Step 4: Update MiniPreview props**

```tsx
<MiniPreview
  config={debouncedConfig}
  isActive={miniPreviewActive}
  onPreviewClick={() => trigger(1000)}
  hasChanges={configChanged}
/>
```

And update the component:

```tsx
interface MiniPreviewProps {
  config: Config;
  isActive: boolean;
  onPreviewClick?: () => void;
  hasChanges?: boolean;
}

const MiniPreview: React.FC<MiniPreviewProps> = ({
  config,
  isActive,
  onPreviewClick,
  hasChanges = false,
}) => {
  return (
    <div
      className={`mini-preview ${hasChanges ? 'changed' : ''}`}
      onClick={onPreviewClick}
    >
      {/* ... rest of component ... */}
    </div>
  );
};
```

### Task 8: Test the implementation

**Files:**
- Test: All modified files

- [ ] **Step 1: Start dev server**

Run: `npm run test:example`
Expected: Server starts on port 3002 without errors

- [ ] **Step 2: Test slider interaction**
1. Open browser to http://localhost:3002
2. Scroll to configurator section
3. Adjust minDuration slider - mini preview should show briefly
4. Adjust boostDuration slider - mini preview should show briefly
5. Change background color - mini preview background should update
6. Click mini preview - should trigger 1 second loading

- [ ] **Step 3: Test responsive design**
1. Resize browser window to mobile width
2. Verify layout stacks correctly
3. Verify mini preview is touch-friendly

- [ ] **Step 4: Test performance**
1. Rapidly move slider back and forth
2. Verify no excessive re-renders or jank
3. Verify debounce works (updates smooth, not jumpy)

### Task 9: Final commit

- [ ] **Step 1: Commit all changes**

```bash
git add .
git commit -m "feat: add real-time mini preview to demo page

- Create MiniPreview component for immediate parameter feedback
- Add debounced updates for smooth performance
- Add visual indicator for config changes
- Update layout with preview column above code
- Add responsive design for mobile
- Add hover and click interactions"
```

- [ ] **Step 2: Verify build**

```bash
npm run build
npm run build:example
```
Expected: Both builds complete without errors

---

## Success Criteria

1. Mini preview appears in configurator section
2. Slider adjustments trigger brief preview automatically
3. Color changes update preview background immediately
4. Clicking mini preview triggers 1-second loading
5. Responsive design works on mobile
6. No performance issues or excessive re-renders
7. Visual feedback for unsaved changes (border pulse)

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-12-meme-loading-mini-preview.md`. Ready to execute?**