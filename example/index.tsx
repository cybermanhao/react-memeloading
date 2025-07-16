import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import MemeLoading, { defaultMemesSet } from '../src/index';
import '../src/index.css';
import './demo.css';

interface QueueTask {
  id: number;
  startTime: number;
  duration: number;
  progress: number;
  status: 'waiting' | 'running' | 'completed';
}

const App: React.FC = () => {
  // 核心参数
  const [minDuration, setMinDuration] = useState(1.5);
  const [boostDuration, setBoostDuration] = useState(0.15);
  const [queueMode, setQueueMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0.8)');
  
  // 其他参数
  const [safeMode, setSafeMode] = useState(false);
  const [trueFan, setTrueFan] = useState(false);
  
  // 基础模式状态
  const [loading, setLoading] = useState(false);
  
  // 队列模式状态和配置
  const [loadingCount, setLoadingCount] = useState(0);
  const [presetQueueCount, setPresetQueueCount] = useState(3);
  const [presetDelay, setPresetDelay] = useState(2000);
  const [timeOffset, setTimeOffset] = useState(500); // 任务间时间偏移
  const [tasks, setTasks] = useState<QueueTask[]>([]);
  const [nextTaskId, setNextTaskId] = useState(1);

  // 背景色预设
  const backgroundPresets = [
    { name: '白色半透明', value: 'rgba(255, 255, 255, 0.95)' },
    { name: '浅灰半透明', value: 'rgba(240, 240, 240, 0.92)' },
    { name: '淡蓝渐变', value: 'linear-gradient(135deg, rgba(180, 210, 255, 0.92), rgba(200, 180, 255, 0.92))' },
    { name: '龙女仆主题浅色', value: 'rgba(230, 232, 240, 0.93)' },
    { name: '粉色梦幻', value: 'rgba(255, 182, 193, 0.90)' },
  ];

  // 更新任务进度
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status === 'running') {
            const elapsed = Date.now() - task.startTime;
            const progress = Math.min((elapsed / task.duration) * 100, 100);
            const newStatus = progress >= 100 ? 'completed' : 'running';
            return { ...task, progress, status: newStatus };
          }
          return task;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 监听任务完成，减少loadingCount
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const runningTasks = tasks.filter(task => task.status === 'running');
    
    if (completedTasks.length > 0) {
      setLoadingCount(runningTasks.length);
      // 清理已完成的任务
      setTimeout(() => {
        setTasks(prev => prev.filter(task => task.status !== 'completed'));
      }, 1000);
    }
  }, [tasks]);

  // 基础模式测试（测试minDuration参数）
  const handleBasicTest = () => {
    setLoading(true);
    // 很快结束，测试minDuration效果
    setTimeout(() => setLoading(false), 500);
  };

  // 队列模式：添加单个任务
  const addSingleTask = () => {
    const newTask: QueueTask = {
      id: nextTaskId,
      startTime: Date.now(),
      duration: presetDelay,
      progress: 0,
      status: 'running'
    };
    
    setTasks(prev => [...prev, newTask]);
    setLoadingCount(prev => prev + 1);
    setNextTaskId(prev => prev + 1);
  };

  // 队列模式：开始预设队列
  const startPresetQueue = () => {
    const newTasks: QueueTask[] = [];
    
    for (let i = 0; i < presetQueueCount; i++) {
      const task: QueueTask = {
        id: nextTaskId + i,
        startTime: Date.now() + (i * timeOffset),
        duration: presetDelay,
        progress: 0,
        status: i === 0 ? 'running' : 'waiting'
      };
      newTasks.push(task);
    }
    
    setTasks(prev => [...prev, ...newTasks]);
    setLoadingCount(prev => prev + presetQueueCount);
    setNextTaskId(prev => prev + presetQueueCount);

    // 错开启动任务
    for (let i = 1; i < presetQueueCount; i++) {
      setTimeout(() => {
        setTasks(prev => 
          prev.map(task => 
            task.id === nextTaskId + i ? { ...task, status: 'running', startTime: Date.now() } : task
          )
        );
      }, i * timeOffset);
    }
  };

  // 清空队列
  const clearQueue = () => {
    setLoadingCount(0);
    setTasks([]);
  };


  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* 左侧控制面板 */}
      <div style={{ 
        flex: 1, 
        padding: '20px',
        maxWidth: '700px'
      }}>
        <h1>🐉 React MemeLoading 参数测试</h1>
        
        {/* 核心参数配置 */}
        <div className="demo-card">
          <h2>核心参数配置</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>minDuration (最短显示时间)</strong>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minDuration}
                  onChange={(e) => setMinDuration(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '5px' }}
                />
                <small style={{ color: '#666' }}>当前: {minDuration}秒</small>
              </label>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>boostDuration (加速时间)</strong>
                <input
                  type="number"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={boostDuration}
                  onChange={(e) => setBoostDuration(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '5px' }}
                />
                <small style={{ color: '#666' }}>当前: {boostDuration}秒</small>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>背景色选择</strong>
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {backgroundPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setBackgroundColor(preset.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: backgroundColor === preset.value ? '#007bff' : '#f8f9fa',
                    color: backgroundColor === preset.value ? 'white' : '#333',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="自定义背景色 (如: rgba(255,0,0,0.5))"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{ width: '100%', marginTop: '10px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <label>
              <input
                type="checkbox"
                checked={queueMode}
                onChange={(e) => setQueueMode(e.target.checked)}
              />
              启用队列模式
            </label>
            <label>
              <input
                type="checkbox"
                checked={safeMode}
                onChange={(e) => setSafeMode(e.target.checked)}
              />
              安全模式
            </label>
            <label>
              <input
                type="checkbox"
                checked={trueFan}
                onChange={(e) => setTrueFan(e.target.checked)}
              />
              彩蛋模式
            </label>
          </div>
        </div>

        {/* 基础模式测试 */}
        {!queueMode && (
          <div className="demo-card">
            <h2>基础模式测试</h2>
            <p>测试 minDuration 参数：点击按钮后loading会快速结束(0.5秒)，但会根据minDuration参数保持最短显示时间</p>
            <button onClick={handleBasicTest} disabled={loading}>
              {loading ? '加载中...' : '测试基础 Loading (测试minDuration效果)'}
            </button>
          </div>
        )}

        {/* 队列模式测试 */}
        {queueMode && (
          <div className="demo-card">
            <h2>队列模式测试</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <label>
                <strong>预设队列数量</strong>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={presetQueueCount}
                  onChange={(e) => setPresetQueueCount(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '5px' }}
                />
              </label>
              
              <label>
                <strong>任务持续时间(ms)</strong>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="500"
                  value={presetDelay}
                  onChange={(e) => setPresetDelay(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '5px' }}
                />
              </label>
              
              <label>
                <strong>时间偏移量(ms)</strong>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="100"
                  value={timeOffset}
                  onChange={(e) => setTimeOffset(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '5px' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={addSingleTask}>
                添加单个任务
              </button>
              <button onClick={startPresetQueue}>
                开始预设队列 ({presetQueueCount}个任务)
              </button>
              <button onClick={clearQueue} disabled={loadingCount === 0}>
                清空队列
              </button>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>当前队列状态: {loadingCount} 个任务运行中</strong>
            </div>

            {/* 任务进度显示 */}
            {tasks.length > 0 && (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <h3>任务进度</h3>
                {tasks.map(task => (
                  <div key={task.id} style={{ 
                    marginBottom: '10px', 
                    padding: '10px', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '4px',
                    backgroundColor: task.status === 'completed' ? '#d4edda' : 
                                   task.status === 'running' ? '#fff3cd' : '#e2e3e5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>任务 #{task.id}</span>
                      <span style={{ 
                        color: task.status === 'completed' ? '#155724' : 
                               task.status === 'running' ? '#856404' : '#6c757d'
                      }}>
                        {task.status === 'waiting' ? '等待中' : 
                         task.status === 'running' ? '运行中' : '已完成'}
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${task.progress}%`, 
                        height: '100%', 
                        backgroundColor: task.status === 'completed' ? '#28a745' : 
                                       task.status === 'running' ? '#ffc107' : '#6c757d',
                        transition: 'width 0.1s ease'
                      }} />
                    </div>
                    <small style={{ color: '#666' }}>
                      {Math.round(task.progress)}% - 持续时间: {task.duration}ms
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meme预览 */}
        <div className="demo-card">
          <h2>默认 Meme 预览 (共 {defaultMemesSet.length} 条)</h2>
          <div style={{ 
            maxHeight: '200px', 
            overflow: 'auto', 
            border: '1px solid #ddd', 
            padding: '10px',
            backgroundColor: '#f9f9f9',
            fontSize: '14px'
          }}>
            {defaultMemesSet.slice(0, 10).map((meme, index) => (
              <div key={index} style={{ margin: '2px 0' }}>
                {index + 1}. {meme}
              </div>
            ))}
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              ... 还有 {defaultMemesSet.length - 10} 条
            </div>
          </div>
        </div>

        {/* Loading组件 */}
        <MemeLoading
          loadingSignal={queueMode ? loadingCount : loading}
          queueMode={queueMode}
          safemod={safeMode}
          trueFan={trueFan}
          minDuration={minDuration}
          boostDuration={boostDuration}
          backgroundColor={backgroundColor}
          memes={defaultMemesSet}
        />
      </div>

      {/* 右侧装饰区域 */}
      <div style={{ 
        width: '300px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>
            小林家的龙女仆
          </h3>
          <div style={{
            width: '250px',
            height: '350px',
            backgroundColor: '#e9ecef',
            border: '2px dashed #adb5bd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            backgroundImage: 'url("./assets/maid.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              maxWidth: '200px'
            }}>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          width: '100%'
        }}>
          <h4 style={{ color: '#495057', margin: '0 0 10px 0' }}>
            ⚙️ 参数说明
          </h4>
          <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'left' }}>
            <p><strong>minDuration:</strong> 最短显示时间，防止闪烁</p>
            <p><strong>boostDuration:</strong> 文字动画加速时间</p>
            <p><strong>queueMode:</strong> 队列模式，支持多任务管理</p>
            <p><strong>时间偏移:</strong> 队列任务间的启动间隔</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
