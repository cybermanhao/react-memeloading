import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import MemeLoading, { defaultMemesSet } from '../src/index';
import '../src/index.css';
import './demo.css';
import MiniPreview from './components/MiniPreview';
import { usePreviewDebounce } from './hooks/usePreviewDebounce';
import { useLoadingQueue } from '../src/hooks/useLoadingQueue';

interface Config {
  minDuration: number;
  boostDuration: number;
  backgroundColor: string;
  safemod: boolean;
  trueFan: boolean;
  showTrack: boolean;
}

const DEFAULTS: Config = {
  minDuration: 0,
  boostDuration: 0.1,
  backgroundColor: '',
  safemod: false,
  trueFan: false,
  showTrack: false,
};

const BG_PRESETS = [
  { label: '暗黑', value: 'rgba(0, 0, 0, 0.88)' },
  { label: '深紫', value: 'rgba(15, 10, 40, 0.92)' },
  { label: '半透明', value: 'rgba(56, 60, 70, 0.82)' },
  { label: '白色', value: 'rgba(255, 255, 255, 0.95)' },
];

// Queue Mode Demo Component
interface Task {
  id: number;
  name: string;
  startTime: number;
  duration: number;
  delay: number;
  status: 'waiting' | 'running' | 'completed';
  progress?: number;
  addedTime: number;
}

interface QueueDemoProps {
  onCountChange: (count: number) => void;
  onTasksChange: (tasks: { name: string; progress: number; status: 'waiting' | 'running' | 'completed' }[]) => void;
  onShowTrackChange: (show: boolean) => void;
}

const QueueDemo: React.FC<QueueDemoProps> = ({ onCountChange, onTasksChange, onShowTrackChange }) => {
  const [showTrack, setShowTrack] = useState(true);

  // 同步轨道开关状态到父组件
  const handleShowTrackChange = (show: boolean) => {
    setShowTrack(show);
    onShowTrackChange(show);
  };
  const { add, remove, withLoading, count } = useLoadingQueue(() => {
    // 队列完成后延迟清空任务列表
    setTimeout(() => setTasks([]), 500);
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextTaskId, setNextTaskId] = useState(1);
  const [nextDelay, setNextDelay] = useState(0);
  const [nextDuration, setNextDuration] = useState(1500);
  const [activeTab, setActiveTab] = useState<'preset' | 'settings'>('preset');

  // 同步计数到父组件
  useEffect(() => {
    onCountChange(count);
  }, [count, onCountChange]);

  // 实时更新 running 任务的进度
  useEffect(() => {
    const runningTasks = tasks.filter(t => t.status === 'running');
    if (runningTasks.length === 0) return;

    const interval = setInterval(() => {
      setTasks(prev => prev.map(t => {
        if (t.status !== 'running') return t;
        const elapsed = Date.now() - t.startTime;
        const progress = Math.min((elapsed / t.duration) * 100, 99);
        return { ...t, progress: Math.round(progress) };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [tasks]);

  // 同步任务到父组件
  useEffect(() => {
    const trackTasks = tasks.map(t => ({
      name: t.name,
      startTime: t.startTime || t.addedTime,
      progress: t.status === 'waiting' ? 0 : t.status === 'completed' ? 100 : (t.progress || 50),
      status: t.status,
      duration: t.duration,
    }));
    onTasksChange(trackTasks);
  }, [tasks, onTasksChange]);

  // 模拟异步请求
  const simulateRequest = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

  // 方式1: 手动管理
  const handleManualAdd = () => {
    const taskId = nextTaskId;
    setNextTaskId(id => id + 1);

    setTasks(prev => [...prev, {
      id: taskId,
      name: `任务 #${taskId}`,
      startTime: Date.now(),
      duration: 2000,
      addedTime: Date.now(),
      status: 'running'
    }]);

    add();
    simulateRequest(2000).then(() => {
      remove();
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      ));
    });
  };

  // 方式2: 使用 withLoading 自动管理
  const handleAuto = async () => {
    const taskId = nextTaskId;
    setNextTaskId(id => id + 1);

    setTasks(prev => [...prev, {
      id: taskId,
      name: `自动任务 #${taskId}`,
      startTime: Date.now(),
      duration: 1500,
      status: 'running'
    }]);

    await withLoading(async () => {
      await simulateRequest(1500);
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      ));
    });
  };

  // 方式3: 串行多个请求
  const handleSerial = async () => {
    for (let i = 0; i < 3; i++) {
      const taskId = nextTaskId + i;
      const durations = [800, 1200, 1600];

      setTasks(prev => [...prev, {
        id: taskId,
        name: `串行任务 #${taskId}`,
        startTime: Date.now(),
        duration: durations[i],
        status: 'running' as const
      }]);

      await withLoading(async () => {
        await simulateRequest(durations[i]);
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'completed' as const } : t
        ));
      });
    }
    setNextTaskId(id => id + 3);
  };

  // 清除历史
  const handleClear = () => {
    setTasks([]);
  };

  // 添加延迟任务
  const handleAddDelayed = () => {
    const taskId = nextTaskId;
    const delay = nextDelay;
    const duration = nextDuration;

    setNextTaskId(id => id + 1);
    setTasks(prev => [...prev, {
      id: taskId,
      name: `延迟任务 #${taskId}`,
      startTime: Date.now() + delay,
      duration,
      delay,
      status: 'waiting'
    }]);

    // 延迟后开始执行
    setTimeout(() => {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'running' as const } : t
      ));

      add();
      simulateRequest(duration).then(() => {
        remove();
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'completed' as const } : t
        ));
      });
    }, delay);
  };

  return (
    <div className="queue-demo">
      {/* Hook 使用说明 + 轨道开关 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '12px 16px', background: 'rgba(124,58,237,0.08)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.15)' }}>
        <div>
          <code style={{ fontSize: 12, color: '#a78bfa' }}>
            const {'{ add, remove, count, withLoading }'} = useLoadingQueue()
          </code>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#6666aa' }}>
            add() / remove() 手动管理 · withLoading(fn) 自动包装异步函数 · onComplete 队列清空回调
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={showTrack}
            onChange={e => handleShowTrackChange(e.target.checked)}
            style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
          />
          <span style={{ fontSize: 12, color: showTrack ? '#a78bfa' : '#6666aa' }}>
            进度轨道
          </span>
        </label>
      </div>

      {/* Tab 导航 */}
      <div className="queue-tabs">
        <button
          className={`tab-btn ${activeTab === 'preset' ? 'active' : ''}`}
          onClick={() => setActiveTab('preset')}
        >
          预设队列
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          参数设置
        </button>
      </div>

      {/* Tab 内容 */}
      {activeTab === 'preset' && (
        <div className="tab-content">
          <div className="queue-actions">
            <button className="btn-queue" onClick={handleManualAdd}>
              手动 add + remove
            </button>
            <button className="btn-queue" onClick={handleAuto}>
              withLoading 自动
            </button>
            <button className="btn-queue" onClick={handleSerial}>
              串行 3 个任务
            </button>
            <button className="btn-queue btn-random" onClick={() => {
              const delays = [0, 300, 600, 900];
              const durations = [1000, 1500, 2000];
              for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                  const taskId = nextTaskId + i;
                  const delay = delays[i];
                  const duration = durations[Math.floor(Math.random() * durations.length)];
                  setTasks(prev => [...prev, {
                    id: taskId,
                    name: `随机任务 #${taskId}`,
                    startTime: Date.now() + delay,
                    duration,
                    delay,
                    status: 'waiting'
                  }]);
                  setTimeout(() => {
                    setTasks(prev => prev.map(t =>
                      t.id === taskId ? { ...t, status: 'running' as const } : t
                    ));
                    add();
                    simulateRequest(duration).then(() => {
                      remove();
                      setTasks(prev => prev.map(t =>
                        t.id === taskId ? { ...t, status: 'completed' as const } : t
                      ));
                    });
                  }, delay);
                }, i * 100);
              }
              setNextTaskId(id => id + 4);
            }}>
            随机队列 (间隔0.3s)
            </button>
            <button className="btn-queue btn-clear" onClick={handleClear}>
              清除
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="tab-content">
          <div className="delayed-config">
            <span className="config-label">自定义任务：</span>
            <label className="config-input">
              延迟
              <input
                type="number"
                min="0"
                max="5000"
                step="100"
                value={nextDelay}
                onChange={e => setNextDelay(Number(e.target.value))}
              />
              ms
            </label>
            <label className="config-input">
              持续
              <input
                type="number"
                min="500"
                max="5000"
                step="100"
                value={nextDuration}
                onChange={e => setNextDuration(Number(e.target.value))}
              />
              ms
            </label>
            <button className="btn-queue btn-add" onClick={handleAddDelayed}>
              开始演示
            </button>
          </div>
        </div>
      )}

      <div className="queue-status">
        当前队列计数: <strong>{count}</strong>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [queueTasks, setQueueTasks] = useState<{ name: string; progress: number; status: 'waiting' | 'running' | 'completed' }[]>([]);
  const [showTrack, setShowTrack] = useState(true); // 演示页默认开启轨道
  const [config, setConfig] = useState<Config>({
    minDuration: 1.5,
    boostDuration: 0.2,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    safemod: false,
    trueFan: false,
    showTrack: true,
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
    if (config.showTrack) lines.push('  showTrack');
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
                ['showTrack', '进度轨道', '显示任务进度条（队列模式）'],
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

      {/* ── QUEUE MODE DEMO ── */}
      <section className="section">
        <h2 className="section-title">队列模式</h2>
        <p className="section-desc">使用 useLoadingQueue hook 管理多个并发请求</p>

        <QueueDemo onCountChange={setQueueCount} onTasksChange={setQueueTasks} onShowTrackChange={setShowTrack} />
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
        loadingSignal={queueCount > 0 ? queueCount : loading}
        queueMode={queueCount > 0}
        {...config}
        tasks={config.showTrack ? queueTasks : []}
        memes={activeMemes}
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
