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

  return (
    <div className="meme-loading" style={{ visibility, backgroundColor }}>
      <div className="meme">{safemod ? '' : visibleMeme}</div>
    </div>
  );
};

export default MemeLoading;
