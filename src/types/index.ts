export interface MemeLoadingProps {
  /** 是否显示 loading 遮罩，或队列计数 */
  loadingSignal: boolean | number;
  /** 彩蛋模式，true 时固定显示第 29 条 meme */
  trueFan?: boolean;
  /** 可自定义 meme 列表 */
  memes?: string[];
  /** 遮罩背景色 */
  backgroundColor?: string;
  /** 最短显示时间（秒），safemod=true 时强制为 0.1 */
  minDuration?: number;
  /** 安全模式，true 时不显示字符且所有动画加速为 0.1 秒 */
  safeMode?: boolean;
  /** 兼容旧版拼写 */
  safemod?: boolean;
  /** boot 阶段加速时间（秒），safemod=true 时强制为 0.1 */
  boostDuration?: number;
  /**
   * 是否启用队列/计数模式
   * true: loadingSignal 为计数/队列（number），>0 显示
   * false: loadingSignal 为 boolean
   */
  queueMode?: boolean;
}
