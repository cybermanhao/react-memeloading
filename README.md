# React MemeLoading

一个模仿《小林家的龙女仆》片头弹幕风格的趣味载入动画组件！🐉

让你的 loading 也能"龙女仆"起来，快乐开发，快乐等候！

## ✨ 特性

- 🎭 **弹幕风格动画** - 模仿《小林家的龙女仆》片头的打字机效果
- 🎨 **完全可定制** - 支持自定义 meme 列表、背景色、动画时间等
- 🔇 **安全模式** - 一键切换为纯遮罩，适合正式场合
- 🎁 **彩蛋模式** - trueFan 模式为真粉丝准备
- 📊 **队列支持** - 支持全局 loading 计数模式
- 💻 **TypeScript** - 完整的类型定义和智能提示
- ⚡ **轻量级** - 零依赖，体积小巧

## 📦 安装

```bash
npm install react-meme-loading
# 或
yarn add react-meme-loading
# 或
pnpm add react-meme-loading
```

## 🚀 快速开始

```tsx
import React, { useState } from 'react';
import MemeLoading from 'react-meme-loading';

function App() {
  const [loading, setLoading] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div>
      <button onClick={handleLoadingTest}>
        测试 MemeLoading
      </button>
      
      <MemeLoading
        loadingSignal={loading}
        minDuration={1.5}           // 最短显示时间1.5秒
        boostDuration={0.2}         // 结束加速动画0.2秒
        backgroundColor="rgba(0, 0, 0, 0.8)"
      />
    </div>
  );
}
```

## 📖 API 文档

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `loadingSignal` | `boolean \| number` | - | 是否显示 loading 遮罩（必需） |
| `queueMode` | `boolean` | `false` | 启用队列模式，loadingSignal 为 number |
| `trueFan` | `boolean` | `false` | 彩蛋模式，固定显示特定 meme |
| `memes` | `string[]` | `defaultMemesSet` | 自定义 meme 列表 |
| `backgroundColor` | `string` | `''` | 遮罩背景色 |
| `minDuration` | `number` | `0` | 最短显示时间（秒），防止闪烁 |
| `safemod` | `boolean` | `false` | 安全模式，不显示文字 |
| `boostDuration` | `number` | `0.1` | 结束/切换动画持续时间（秒） |

### 配置详解

#### `minDuration` - 最短显示时间
防止loading过快消失造成的闪烁效果：
```tsx
<MemeLoading
  loadingSignal={loading}
  minDuration={1.0}  // 至少显示1秒，即使loading很快结束
/>
```

#### `boostDuration` - 动画加速时间
控制文字打字效果的速度和结束动画：
```tsx
<MemeLoading
  loadingSignal={loading}
  boostDuration={0.2}  // 较慢的打字效果，更有观赏性
/>
```

#### 队列模式的间隔控制
在队列模式下，`minDuration` 和 `boostDuration` 控制任务切换的流畅度：
```tsx
<MemeLoading
  loadingSignal={taskCount}
  queueMode={true}
  minDuration={0.5}    // 每个任务至少显示0.5秒
  boostDuration={0.1}  // 快速切换到下一个任务
/>

### 队列模式示例

适合管理多个异步操作的全局 loading，支持间隔控制和数量选择：

```tsx
import React, { useState, useCallback } from 'react';
import MemeLoading from 'react-meme-loading';

function App() {
  const [loadingCount, setLoadingCount] = useState(0);

  // 添加单个loading任务
  const addLoading = useCallback(() => {
    setLoadingCount(count => count + 1);
  }, []);

  // 移除单个loading任务
  const removeLoading = useCallback(() => {
    setLoadingCount(count => Math.max(0, count - 1));
  }, []);

  // 批量添加多个loading任务
  const addMultipleLoading = useCallback((num: number) => {
    setLoadingCount(count => count + num);
  }, []);

  // 模拟异步操作
  const simulateAsyncOperation = useCallback((duration: number = 2000) => {
    addLoading();
    setTimeout(() => {
      removeLoading();
    }, duration);
  }, [addLoading, removeLoading]);

  // 模拟多个并发操作
  const simulateMultipleTasks = useCallback(() => {
    // 添加3个任务，每个任务在不同时间完成
    [1000, 2000, 3000].forEach((delay, index) => {
      addLoading();
      setTimeout(() => removeLoading(), delay);
    });
  }, [addLoading, removeLoading]);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => simulateAsyncOperation(1500)}>
          模拟异步操作 (1.5s)
        </button>
        <button onClick={() => simulateAsyncOperation(3000)}>
          模拟异步操作 (3s)
        </button>
        <button onClick={simulateMultipleTasks}>
          模拟3个并发任务
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={addLoading}>手动添加 (+1)</button>
        <button onClick={() => addMultipleLoading(3)}>批量添加 (+3)</button>
        <button onClick={removeLoading}>手动移除 (-1)</button>
        <button onClick={() => setLoadingCount(0)}>清空队列</button>
      </div>
      
      <p>当前 loading 数量: {loadingCount}</p>
      
      {/* 队列模式配置 */}
      <MemeLoading
        loadingSignal={loadingCount}
        queueMode={true}
        minDuration={0.8}           // 每个任务最短显示0.8秒
        boostDuration={0.15}        // 快速切换动画0.15秒
        backgroundColor="rgba(56, 60, 70, 0.9)"
      />
    </div>
  );
}
```

### 安全模式

适合正式场合，只显示纯色遮罩：

```tsx
<MemeLoading
  loadingSignal={loading}
  safemod={true}
  backgroundColor="rgba(255, 255, 255, 0.9)"
/>
```

### 自定义 Meme

```tsx
const customMemes = [
  '自定义加载文本 1',
  '自定义加载文本 2',
  'Loading...',
  '请稍候...'
];

<MemeLoading
  loadingSignal={loading}
  memes={customMemes}
/>
```

## 🎯 高级用法示例

### 全局 Loading 管理器

创建一个全局的loading管理系统：

```tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import MemeLoading from 'react-meme-loading';

// 创建Loading上下文
const LoadingContext = createContext({
  addLoading: () => {},
  removeLoading: () => {},
  loadingCount: 0
});

// Loading Provider组件
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const addLoading = useCallback(() => {
    setLoadingCount(count => count + 1);
  }, []);

  const removeLoading = useCallback(() => {
    setLoadingCount(count => Math.max(0, count - 1));
  }, []);

  return (
    <LoadingContext.Provider value={{ addLoading, removeLoading, loadingCount }}>
      {children}
      
      {/* 全局Loading组件 */}
      <MemeLoading
        loadingSignal={loadingCount}
        queueMode={true}
        minDuration={0.6}
        boostDuration={0.12}
        backgroundColor="rgba(0, 0, 0, 0.75)"
      />
    </LoadingContext.Provider>
  );
}

// 自定义Hook
export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }

  // 返回便捷的异步包装函数
  const withLoading = useCallback(async (asyncFn: () => Promise<any>) => {
    context.addLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      context.removeLoading();
    }
  }, [context]);

  return {
    ...context,
    withLoading
  };
}

// 使用示例
function MyComponent() {
  const { withLoading } = useLoading();

  const handleApiCall = async () => {
    await withLoading(async () => {
      // 自动管理loading状态
      const response = await fetch('/api/data');
      return response.json();
    });
  };

  return <button onClick={handleApiCall}>调用API</button>;
}
```

### 条件渲染与多种模式

```tsx
function App() {
  const [mode, setMode] = useState<'normal' | 'safe' | 'fan'>('normal');
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
        <option value="normal">普通模式</option>
        <option value="safe">安全模式</option>
        <option value="fan">粉丝模式</option>
      </select>

      <MemeLoading
        loadingSignal={loading}
        safemod={mode === 'safe'}
        trueFan={mode === 'fan'}
        minDuration={mode === 'fan' ? 2.0 : 1.0}  // 粉丝模式显示更久
        boostDuration={mode === 'safe' ? 0.05 : 0.15}  // 安全模式更快
        backgroundColor={
          mode === 'safe' ? 'rgba(255, 255, 255, 0.9)' :
          mode === 'fan' ? 'rgba(255, 20, 147, 0.8)' :
          'rgba(0, 0, 0, 0.8)'
        }
      />
    </div>
  );
}
```

## 🎨 样式定制

组件使用 CSS 类名 `.meme-loading` 和 `.meme-loading .meme`，你可以通过 CSS 进一步定制样式：

```css
.meme-loading {
  /* 自定义遮罩样式 */
  backdrop-filter: blur(5px);
}

.meme-loading .meme {
  /* 自定义文字样式 */
  font-family: 'Custom Font', monospace;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
```

## 🌟 默认 Meme 列表

组件内置了丰富的 meme 列表，包括：
- 编程梗：`"Hello, world!"`、`for (let i = 0; i < array.length; i++) { }`
- 数学/物理公式：`E=MC²`、`a² + b² = c²`
- 表情符号：`(^_^)`、`¯\\_(ツ)_/¯`、`ಠ_ಠ`
- 经典语录和彩蛋

你可以导入并使用默认列表：

```tsx
import MemeLoading, { defaultMemesSet } from 'react-meme-loading';

// 使用默认列表 + 自定义内容
const myMemes = [...defaultMemesSet, '我的自定义内容'];
```

## 🔧 开发

```bash
# 克隆项目
git clone https://github.com/yourusername/react-meme-loading.git

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test

# 预览example
cd example
npx vite
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**灵感来源于《小林家的龙女仆》，献给所有喜欢动漫的开发者们！** ❤️
