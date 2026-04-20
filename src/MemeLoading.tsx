import React, { useState, useEffect, useRef } from 'react';
import { defaultMemesSet } from './defaultMemesSet';
import type { MemeLoadingProps } from './types';
import './index.css';

const MemeLoading: React.FC<MemeLoadingProps> = ({
  loadingSignal,
  queueMode = false,
  trueFan = false,
  memes = defaultMemesSet,
  backgroundColor = '',
  textColor = '',
  minDuration = 0,
  safeMode = false,
  // 兼容旧版拼写
  safemod,
  boostDuration = 0.1,
}) => {
  // 兼容旧版 safemod
  const isSafeMode = safeMode || (safemod as boolean) || false;

  const [status, setStatus] = useState<'load' | 'boot' | 'off'>('off');
  const [currentMeme, setCurrentMeme] = useState('');
  const [memeIndex, setMemeIndex] = useState(0);
  const charIndexRef = useRef(0);
  const [show, setShow] = useState(false);
  const [blink, setBlink] = useState(true);

  const startTimeRef = useRef(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  // 支持队列/计数模式
  const isLoading = queueMode
    ? (typeof loadingSignal === 'number' ? loadingSignal > 0 : !!loadingSignal)
    : !!loadingSignal;

  // isLoading 变化：控制显示/隐藏
  useEffect(() => {
    if (isLoading) {
      setStatus('load');
      setShow(true);
      startTimeRef.current = Date.now();
      // 不重置 currentMeme/charIndex，动画不中断
    } else {
      setStatus('boot');
      const elapsed = Date.now() - startTimeRef.current;
      const remain = Math.max((minDuration || 0) * 1000 - elapsed, 0);
      window.setTimeout(() => {
        // 只有当前仍是 boot 或 off 状态才清理，防止快速切换时误清
        if (statusRef.current !== 'load') {
          setStatus('off');
          setShow(false);
          setCurrentMeme('');
          charIndexRef.current = 0;
        }
      }, 1000 + remain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, minDuration]);

  // 打字动画
  useEffect(() => {
    let interval: number;

    if (status === 'load') {
      let meme = memes[memeIndex];
      if (charIndexRef.current === 0) {
        const randomIndex = trueFan ? 28 : Math.floor(Math.random() * memes.length);
        meme = memes[randomIndex];
        setMemeIndex(randomIndex);
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
      const boost = isSafeMode ? 0.1 : Math.max(boostDuration, 0.1);
      const intervalTime = remainingChars > 0
        ? (boost * 1000) / remainingChars
        : boost * 1000;

      // 修复：boot 阶段从当前已打位置继续
      setCurrentMeme(meme.slice(0, charIndexRef.current));

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
  }, [status, memes, trueFan, memeIndex, boostDuration, isSafeMode]);

  // 光标闪烁（load 或 boot 阶段打字完成后）
  const targetMeme = memes[memeIndex] || '';
  const isDone = currentMeme.length === targetMeme.length;

  useEffect(() => {
    if (isDone && (status === 'load' || status === 'boot')) {
      const blinkTimer = window.setInterval(() => setBlink((b) => !b), 500);
      return () => clearInterval(blinkTimer);
    }
  }, [isDone, status]);

  const visibility = show ? 'visible' : 'hidden';
  const visibleMeme = isSafeMode
    ? ''
    : currentMeme + (isDone && (status === 'load' || status === 'boot') ? (blink ? '_' : ' ') : '_');

  return (
    <div
      className="meme-loading"
      style={{ visibility, backgroundColor }}
      role="status"
      aria-live="polite"
      aria-busy={show}
    >
      <div className="meme" style={{ color: textColor || undefined }}>{isSafeMode ? '' : visibleMeme}</div>
    </div>
  );
};

export default MemeLoading;
