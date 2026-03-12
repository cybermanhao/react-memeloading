import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import MemeLoading, { defaultMemesSet } from '../src/index';
import '../src/index.css';
import './demo.css';
import MiniPreview from './components/MiniPreview';
import { usePreviewDebounce } from './hooks/usePreviewDebounce';

interface Config {
  minDuration: number;
  boostDuration: number;
  backgroundColor: string;
  safemod: boolean;
  trueFan: boolean;
}

const DEFAULTS: Config = {
  minDuration: 0,
  boostDuration: 0.1,
  backgroundColor: '',
  safemod: false,
  trueFan: false,
};

const BG_PRESETS = [
  { label: '暗黑', value: 'rgba(0, 0, 0, 0.88)' },
  { label: '深紫', value: 'rgba(15, 10, 40, 0.92)' },
  { label: '半透明', value: 'rgba(56, 60, 70, 0.82)' },
  { label: '白色', value: 'rgba(255, 255, 255, 0.95)' },
];

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
  const [lastAppliedConfig, setLastAppliedConfig] = useState(config);
  const [configChanged, setConfigChanged] = useState(false);

  const fetchHeroImage = useCallback(() => {
    setRefreshingImage(true);
    fetch('https://api.waifu.pics/sfw/waifu')
      .then(r => r.json())
      .then(data => setHeroImage(data.url))
      .catch(() => {})
      .finally(() => setRefreshingImage(false));
  }, []);

  // Debounced config for mini preview
  const debouncedConfig = usePreviewDebounce(config, 150);

  useEffect(() => {
    fetchHeroImage();
  }, [fetchHeroImage]);

  const trigger = useCallback((ms = 2500) => {
    if (loading) return;
    setLoading(true);
    setLastAppliedConfig(config);
    setConfigChanged(false);
    setTimeout(() => setLoading(false), ms);
  }, [loading, config]);

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

  const triggerSpecific = useCallback((index: number) => {
    if (loading) return;
    setTriggerMemeIndex(index);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setTriggerMemeIndex(null), 2000);
    }, 3000);
  }, [loading]);

  const set = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig(c => ({ ...c, [key]: value }));
    triggerAutoPreview();
  };

  // Only include props that differ from defaults in the snippet
  const codeSnippet = useMemo(() => {
    const lines: string[] = ['  loadingSignal={loading}'];
    if (config.minDuration !== DEFAULTS.minDuration)
      lines.push(`  minDuration={${config.minDuration}}`);
    if (config.boostDuration !== DEFAULTS.boostDuration)
      lines.push(`  boostDuration={${config.boostDuration}}`);
    if (config.backgroundColor !== DEFAULTS.backgroundColor)
      lines.push(`  backgroundColor="${config.backgroundColor}"`);
    if (config.safemod) lines.push('  safemod');
    if (config.trueFan) lines.push('  trueFan');
    return `<MemeLoading\n${lines.join('\n')}\n/>`;
  }, [config]);

  // Cleanup auto-preview timeout
  useEffect(() => {
    return () => {
      if (autoPreviewTimeout) {
        window.clearTimeout(autoPreviewTimeout);
      }
    };
  }, [autoPreviewTimeout]);

  // Detect config changes
  useEffect(() => {
    const hasChanged =
      lastAppliedConfig.minDuration !== config.minDuration ||
      lastAppliedConfig.boostDuration !== config.boostDuration ||
      lastAppliedConfig.backgroundColor !== config.backgroundColor ||
      lastAppliedConfig.safemod !== config.safemod ||
      lastAppliedConfig.trueFan !== config.trueFan;
    setConfigChanged(hasChanged);
  }, [config, lastAppliedConfig]);

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeMemes = useMemo(
    () => triggerMemeIndex !== null ? [defaultMemesSet[triggerMemeIndex]] : defaultMemesSet,
    [triggerMemeIndex]
  );

  return (
    <div className="page">

      {/* ── HERO ── */}
      <section
        className="hero"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(to bottom, rgba(8,8,20,0.55) 0%, rgba(8,8,20,0.85) 100%), url(${heroImage})`
            : undefined,
        }}
      >
        <div className="hero-inner">
          <div className="hero-badge">React Component</div>
          <h1 className="hero-title">
            <span className="hero-brace">{'{'}</span>
            MemeLoading
            <span className="hero-brace">{'}'}</span>
          </h1>
          <p className="hero-sub">
            模仿《小林家的龙女仆》片头弹幕风格的趣味载入动画
          </p>
          <p className="hero-desc">让你的 loading 不再只是旋转的圆圈</p>
          <div className="hero-actions">
            <button className="btn-hero" onClick={() => trigger(2500)} disabled={loading}>
              {loading ? '加载中...' : '触发 Loading →'}
            </button>
            <button
              className="btn-ghost"
              onClick={fetchHeroImage}
              disabled={refreshingImage}
              title="换一张图"
            >
              {refreshingImage ? '...' : '↻'}
            </button>
          </div>
          <div className="hero-install">
            <code>npm install react-meme-loading</code>
          </div>
        </div>
      </section>

      {/* ── CONFIGURATOR ── */}
      <section className="section">
        <h2 className="section-title">配置</h2>
        <div className="configurator">

          {/* Controls */}
          <div className="controls">
            <div className="control-group">
              <label className="control-label">
                minDuration
                <span className="control-hint">最短显示时间（秒）</span>
              </label>
              <div className="range-row">
                <input
                  type="range" min="0" max="5" step="0.1"
                  value={config.minDuration}
                  onChange={e => set('minDuration', parseFloat(e.target.value))}
                />
                <span className="range-val">{config.minDuration}s</span>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">
                boostDuration
                <span className="control-hint">退出加速动画时间（秒）</span>
              </label>
              <div className="range-row">
                <input
                  type="range" min="0.05" max="1" step="0.05"
                  value={config.boostDuration}
                  onChange={e => set('boostDuration', parseFloat(e.target.value))}
                />
                <span className="range-val">{config.boostDuration}s</span>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">
                backgroundColor
                <span className="control-hint">遮罩背景色</span>
              </label>
              <div className="color-presets">
                {BG_PRESETS.map(p => (
                  <button
                    key={p.label}
                    className={`btn-preset ${config.backgroundColor === p.value ? 'active' : ''}`}
                    onClick={() => set('backgroundColor', p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="text-input"
                value={config.backgroundColor}
                onChange={e => set('backgroundColor', e.target.value)}
                placeholder="自定义，如 rgba(0,0,0,0.8)"
              />
            </div>

            <div className="toggle-row">
              {([
                ['safemod', '安全模式', '不显示文字，纯遮罩'],
                ['trueFan', '彩蛋模式', '固定显示特定 meme'],
              ] as const).map(([key, label, hint]) => (
                <label key={key} className="toggle">
                  <input
                    type="checkbox"
                    checked={config[key]}
                    onChange={e => set(key, e.target.checked)}
                  />
                  <span>
                    {label}
                    <span className="control-hint">{hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <button
              className="btn-trigger"
              onClick={() => trigger(2500)}
              disabled={loading}
            >
              {loading ? '加载中...' : '触发预览'}
            </button>
          </div>

          {/* Preview column */}
          <div className="preview-column">
            <MiniPreview
              config={debouncedConfig}
              isActive={miniPreviewActive}
              onPreviewClick={() => trigger(1000)}
              hasChanges={configChanged}
            />

            {/* Code preview */}
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
      </section>

      {/* ── MEME WALL ── */}
      <section className="section">
        <h2 className="section-title">
          默认 Meme 列表
          <span className="section-count">{defaultMemesSet.length} 条</span>
        </h2>
        <p className="section-desc">点击任意一条，立即预览效果</p>
        <div className="meme-grid">
          {defaultMemesSet.map((meme, i) => (
            <button
              key={i}
              className={`meme-card ${loading ? 'disabled' : ''}`}
              onClick={() => triggerSpecific(i)}
              disabled={loading}
            >
              <span className="meme-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="meme-text">{meme}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>灵感来源于《小林家的龙女仆》，献给所有喜欢动漫的开发者们 ❤️</p>
        <a
          href="https://github.com/cybermanhao/react-memeloading"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub →
        </a>
      </footer>

      <MemeLoading
        loadingSignal={loading}
        {...config}
        memes={activeMemes}
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
