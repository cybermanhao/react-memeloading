import React, { useState, useEffect, useRef } from 'react';
import { defaultMemesSet } from './defaultMemesSet';
import './index.css';

/**
 * MemeLoading 组件 - 趣味全局 loading 遮罩
 *
 * @param loadingSignal 是否显示 loading 遮罩
 * @param trueFan 彩蛋模式，true 时固定显示第 29 条 meme
 * @param memes 可自定义 meme 列表
 * @param backgroundColor 遮罩背景色
 * @param minDuration 最短显示时间（秒）
 * @param safemod 安全模式，true 时不显示字符且所有动画加速为 0.1 秒
 * @param boostDuration boot 阶段加速时间（秒）
 * @param queueMode true 时 loadingSignal 为计数值（>0 显示），false 时为 boolean
 * @param showTrack 是否显示任务进度轨道
 * @param tasks 任务列表，用于显示进度轨道
 */
export interface MemeLoadingProps {
  loadingSignal: boolean | number;
  trueFan?: boolean;
  memes?: string[];
  backgroundColor?: string;
  minDuration?: number;
  safemod?: boolean;
  boostDuration?: number;
  queueMode?: boolean;
  showTrack?: boolean;
  tasks?: { name: string; startTime?: number; duration?: number; progress: number; status: 'waiting' | 'running' | 'completed' }[];
}

export interface MemeTask {
  name: string;
  progress: number;
  status: 'waiting' | 'running' | 'completed';
}

const MemeLoading: React.FC<MemeLoadingProps> = ({
  loadingSignal,
  trueFan = false,
  memes = defaultMemesSet,
  backgroundColor = '',
  minDuration = 0,
  safemod = false,
  boostDuration = 0.1,
  queueMode = false,
  showTrack = false,
  tasks = [],
}) => {
  const [status, setStatus] = useState<'load' | 'boot' | 'off'>('off');
  const [currentMeme, setCurrentMeme] = useState('');
  const [memeIndex, setMemeIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [blink, setBlink] = useState(true);

  // Refs avoid stale closures and prevent charIndex from triggering effect re-runs
  const charIndexRef = useRef(0);
  const startTimeRef = useRef(0);

  const isLoading = queueMode
    ? (typeof loadingSignal === 'number' ? loadingSignal > 0 : !!loadingSignal)
    : !!loadingSignal;

  useEffect(() => {
    if (isLoading) {
      setStatus('load');
      setShow(true);
      startTimeRef.current = Date.now();
    } else {
      setStatus('boot');
      const elapsed = Date.now() - startTimeRef.current;
      const remain = Math.max(minDuration * 1000 - elapsed, 0);
      const animDuration = (safemod ? 0.1 : Math.max(boostDuration, 0.1)) * 1000;
      // Wait for whichever is longer: boot animation or minDuration remainder
      setTimeout(() => {
        setStatus('off');
        setShow(false);
        setCurrentMeme('');
        charIndexRef.current = 0;
      }, Math.max(animDuration, remain) + 50);
    }
  }, [isLoading, safemod, minDuration, boostDuration]);

  useEffect(() => {
    let interval: number;

    if (status === 'load') {
      let meme = memes[memeIndex];
      if (currentMeme.length === 0) {
        // Only pick a new meme when starting fresh
        const idx = trueFan ? 28 : Math.floor(Math.random() * memes.length);
        meme = memes[idx];
        charIndexRef.current = 0;
        setMemeIndex(idx);
      }
      interval = window.setInterval(() => {
        if (charIndexRef.current < meme.length) {
          charIndexRef.current++;
          setCurrentMeme(meme.slice(0, charIndexRef.current));
        } else {
          clearInterval(interval);
        }
      }, 300);
    } else if (status === 'boot') {
      const meme = memes[memeIndex] || '';
      const remainingChars = meme.length - charIndexRef.current;
      const boost = safemod ? 0.1 : Math.max(boostDuration, 0.1);
      const intervalTime = remainingChars > 0 ? (boost * 1000) / remainingChars : boost * 1000;
      interval = window.setInterval(() => {
        if (charIndexRef.current < meme.length) {
          charIndexRef.current++;
          setCurrentMeme(meme.slice(0, charIndexRef.current));
        } else {
          clearInterval(interval);
        }
      }, intervalTime);
    }

    return () => clearInterval(interval);
    // charIndex intentionally excluded — tracked via ref to avoid re-creating intervals on every tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, memes, trueFan, memeIndex, boostDuration, safemod]);

  const meme = memes[memeIndex] || '';
  const isDone = currentMeme.length === meme.length && meme.length > 0;

  useEffect(() => {
    if (isDone && status === 'load') {
      const blinkTimer = setInterval(() => setBlink(b => !b), 500);
      return () => clearInterval(blinkTimer);
    }
  }, [isDone, status]);

  const visibility = show ? 'visible' : 'hidden';
  const visibleMeme = safemod
    ? ''
    : currentMeme + (isDone && status === 'load' ? (blink ? '_' : ' ') : '_');

  // 队列结束后清空任务
  useEffect(() => {
    if (status === 'off' && showTrack) {
      // 延迟清空，等待动画完成
      const timeout = setTimeout(() => {
        // 可以通过外部控制清空，这里暂时不做自动清空
        // 因为外部可能需要保留任务记录
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [status, showTrack]);

  // 按时间排序任务
  const sortedTasks = tasks ? tasks.slice().sort((a, b) => (a.startTime || 0) - (b.startTime || 0)) : [];

  // 计算缩进层级（基于等待时间）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getIndentLevel = (task: any, index: number) => {
    if (index === 0) return 0;
    const prevTask = sortedTasks[index - 1];
    const prevEnd = (prevTask.startTime || 0) + (prevTask.duration || 1000);
    const myStart = task.startTime || Date.now();
    return Math.max(0, Math.floor((myStart - prevEnd) / 500));
  };

  return (
    <div className="meme-loading" style={{ visibility, backgroundColor }}>
      <div className="meme">{safemod ? '' : visibleMeme}</div>
      {showTrack && sortedTasks.length > 0 && (
        <div className="meme-gantt">
          {sortedTasks.map((task, i) => {
            const indent = getIndentLevel(task, i);
            return (
              <div
                key={i}
                className={`gantt-item ${task.status}`}
                style={{ paddingLeft: `${indent * 12 + 8}px` }}
              >
                <span className="gantt-time">
                  {new Date(task.startTime || Date.now()).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="gantt-name">{task.name}</span>
                <div className="gantt-bar">
                  {task.status === 'waiting' ? (
                    <span className="gantt-waiting">等待中...</span>
                  ) : (
                    <div
                      className="gantt-progress"
                      style={{ width: `${task.progress}%` }}
                    />
                  )}
                </div>
                <span className="gantt-percent">
                  {task.status === 'waiting' ? '' : `${task.progress}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemeLoading;
