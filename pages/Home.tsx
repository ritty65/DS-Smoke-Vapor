import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Flame, Zap, CheckCircle, Plus, Heart, Share2, Star, Play, X, Smartphone, ChevronRight, ChevronLeft, Leaf, Wind, Droplets, Sparkles, Copy } from 'lucide-react';
import { TiltCard } from '../components';
import { DEFAULT_DISCOUNT_CODE, DEFAULT_DISCOUNT_PERCENT } from '../config/rewards';
import { FLOWER_STRAINS } from '../data/flowerStrains';

// --- VIDEO CONFIGURATION ---
const BACKGROUND_VIDEO_ID = "qC0vDKVPCdA"; // Abstract Purple Smoke Loop
const PROMO_VIDEO_ID = "m5pP9Sd3pHY";      // Promo Video
const SHORT_VIDEO_ID = "rUMTeaVu18w";      // Short Video

// --- Video Modal ---
const VideoModal = ({ isOpen, onClose, videoId }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 p-4" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 cursor-pointer"
      >
        <X size={40} />
      </button>
      <div 
        className="w-full max-w-6xl aspect-video relative shadow-[0_0_50px_rgba(147,51,234,0.3)] rounded-2xl overflow-hidden border border-white/10 bg-black"
        onClick={e => e.stopPropagation()}
      >
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`} 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
          className="w-full h-full object-contain"
        ></iframe>
      </div>
    </div>
  );
};

const PlayToWinModal = ({ isOpen, onClose }) => {
  const VIEWBOX = { width: 320, height: 180 };
  const TARGET_RADIUS = 16;
  const PLAYER_RADIUS = 18;
  const TARGET_PADDING = 18;
  const OVERLAP_THRESHOLD = 20;
  const MAX_TRIES = 3;
  const ATTEMPT_STORAGE_KEY = 'playToWinAttempts';
  const ATTEMPT_DATE_KEY = 'playToWinAttemptsDate';
  const ATTEMPT_SESSION_KEY = 'playToWinSessionId';
  const ATTEMPT_SYNC_ENDPOINT = '';
  const playAreaRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);
  const velocityRef = useRef({ x: 60, y: 45 });
  const attemptsUsedRef = useRef(0);
  const hasStartedRef = useRef(false);
  const startTimeRef = useRef(null);
  const deviceTypeRef = useRef('unknown');
  const [targetPosition, setTargetPosition] = useState({ x: 96, y: 90 });
  const [playerPosition, setPlayerPosition] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Tap or press space to play');
  const [triesLeft, setTriesLeft] = useState(MAX_TRIES);
  const [isLocked, setIsLocked] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRewardVisible, setIsRewardVisible] = useState(false);
  const [rewardCode, setRewardCode] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy code');
  const panelRef = useRef(null);
  const confettiTimerRef = useRef(null);
  const getTodayStamp = () => new Date().toISOString().slice(0, 10);
  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = window.navigator?.userAgent ?? '';
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };
  const trackAnalyticsEvent = (eventName, metadata) => {
    if (typeof window === 'undefined') return;
    const analyticsWindow = window;
    if (typeof analyticsWindow.gtag === 'function') {
      analyticsWindow.gtag('event', eventName, metadata);
    }
    if (Array.isArray(analyticsWindow.dataLayer)) {
      analyticsWindow.dataLayer.push({ event: eventName, ...metadata });
    }
  };
  const resetSessionTracking = () => {
    attemptsUsedRef.current = 0;
    hasStartedRef.current = false;
    startTimeRef.current = null;
  };
  const getSessionId = () => {
    if (typeof window === 'undefined') return 'anonymous';
    const existing = window.localStorage.getItem(ATTEMPT_SESSION_KEY);
    if (existing) return existing;
    const generated = window.crypto?.randomUUID?.() ?? `session-${Date.now()}-${Math.random()}`;
    window.localStorage.setItem(ATTEMPT_SESSION_KEY, generated);
    return generated;
  };
  const persistAttempts = (nextTries) => {
    if (typeof window === 'undefined') return;
    const today = getTodayStamp();
    window.localStorage.setItem(ATTEMPT_STORAGE_KEY, String(nextTries));
    window.localStorage.setItem(ATTEMPT_DATE_KEY, today);
  };
  const syncAttempts = async (nextTries) => {
    if (!ATTEMPT_SYNC_ENDPOINT || typeof window === 'undefined') return;
    try {
      await fetch(ATTEMPT_SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          triesLeft: nextTries,
          date: getTodayStamp(),
        }),
      });
    } catch (error) {
      console.warn('Attempt sync failed', error);
    }
  };
  const resetGameState = (nextTries = MAX_TRIES, locked = false) => {
    setTriesLeft(nextTries);
    setIsLocked(locked);
    setIsSuccess(false);
    setIsRewardVisible(false);
    setRewardCode('');
    setCopyStatus('Copy code');
    setStatusMessage(locked ? 'Try again tomorrow.' : 'Tap or press space to play');
    setPlayerPosition(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    resetSessionTracking();
    deviceTypeRef.current = getDeviceType();
    trackAnalyticsEvent('game_opened', {
      attempts_used: attemptsUsedRef.current,
      time_to_win: null,
      device_type: deviceTypeRef.current,
    });
    if (typeof window !== 'undefined') {
      const today = getTodayStamp();
      const storedDate = window.localStorage.getItem(ATTEMPT_DATE_KEY);
      const storedTries = Number(window.localStorage.getItem(ATTEMPT_STORAGE_KEY));
      if (storedDate !== today || Number.isNaN(storedTries)) {
        resetGameState(MAX_TRIES, false);
        persistAttempts(MAX_TRIES);
      } else {
        const normalizedTries = Math.max(0, Math.min(MAX_TRIES, storedTries));
        resetGameState(normalizedTries, normalizedTries <= 0);
      }
    }
    const focusable = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && focusable?.length) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    first?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const animate = (timestamp) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }
      const delta = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;
      setTargetPosition((prev) => {
        let nextX = prev.x + velocityRef.current.x * delta;
        let nextY = prev.y + velocityRef.current.y * delta;
        const minX = TARGET_PADDING;
        const maxX = VIEWBOX.width - TARGET_PADDING;
        const minY = TARGET_PADDING;
        const maxY = VIEWBOX.height - TARGET_PADDING;
        if (nextX <= minX || nextX >= maxX) {
          velocityRef.current.x *= -1;
          nextX = Math.min(Math.max(nextX, minX), maxX);
        }
        if (nextY <= minY || nextY >= maxY) {
          velocityRef.current.y *= -1;
          nextY = Math.min(Math.max(nextY, minY), maxY);
        }
        return { x: nextX, y: nextY };
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastFrameRef.current = 0;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleActionKey = (event) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      if (isLocked) return;
      handlePlayAction();
    };
    document.addEventListener('keydown', handleActionKey);
    return () => {
      document.removeEventListener('keydown', handleActionKey);
    };
  }, [isOpen, isLocked, targetPosition, triesLeft]);

  useEffect(() => {
    if (!isOpen) return;
    persistAttempts(triesLeft);
    syncAttempts(triesLeft);
  }, [isOpen, triesLeft]);

  const resetGame = () => {
    if (isLocked) return;
    resetSessionTracking();
    resetGameState(MAX_TRIES, false);
  };

  const fetchRewardCode = async () => {
    try {
      const response = await fetch('/api/discounts/reward', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to fetch reward');
      }
      const data = await response.json();
      if (data?.code) {
        return data.code;
      }
    } catch (error) {
      console.error('Reward code fallback used', error);
    }
    return DEFAULT_DISCOUNT_CODE;
  };

  const handleCopyCode = async () => {
    if (!rewardCode) return;
    try {
      await navigator.clipboard.writeText(rewardCode);
      setCopyStatus('Copied!');
    } catch (error) {
      console.error('Copy failed', error);
      setCopyStatus('Copy failed');
    }
    window.setTimeout(() => setCopyStatus('Copy code'), 2000);
  };

  const handlePlayAction = (positionOverride) => {
    if (isLocked) return;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startTimeRef.current = Date.now();
    }
    attemptsUsedRef.current += 1;
    if (attemptsUsedRef.current === 1) {
      trackAnalyticsEvent('game_started', {
        attempts_used: attemptsUsedRef.current,
        time_to_win: null,
        device_type: deviceTypeRef.current,
      });
    }
    const playerPos = positionOverride ?? { x: VIEWBOX.width / 2, y: VIEWBOX.height / 2 };
    setPlayerPosition(playerPos);
    const dx = playerPos.x - targetPosition.x;
    const dy = playerPos.y - targetPosition.y;
    const distance = Math.hypot(dx, dy);
    const isHit = distance <= OVERLAP_THRESHOLD;
    if (isHit) {
      setIsSuccess(true);
      setStatusMessage('Bullseye! You nailed it.');
      const timeToWinSeconds = startTimeRef.current
        ? Number(((Date.now() - startTimeRef.current) / 1000).toFixed(2))
        : null;
      trackAnalyticsEvent('game_win', {
        attempts_used: attemptsUsedRef.current,
        time_to_win: timeToWinSeconds,
        device_type: deviceTypeRef.current,
      });
      fetchRewardCode().then((code) => {
        setRewardCode(code);
        setIsRewardVisible(true);
      });
      if (confettiTimerRef.current) {
        window.clearTimeout(confettiTimerRef.current);
      }
      confettiTimerRef.current = window.setTimeout(() => {
        setIsRewardVisible(false);
      }, 9000);
      return;
    }
    const updatedTries = triesLeft - 1;
    setTriesLeft(updatedTries);
    if (updatedTries <= 0) {
      setIsLocked(true);
      setStatusMessage('Try again tomorrow.');
      trackAnalyticsEvent('game_loss', {
        attempts_used: attemptsUsedRef.current,
        time_to_win: null,
        device_type: deviceTypeRef.current,
      });
    } else {
      setStatusMessage('Missed! Try again.');
    }
  };

  const handleCanvasClick = (event) => {
    if (isLocked) return;
    const bounds = playAreaRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const clickX = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
    const clickY = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
    handlePlayAction({ x: clickX, y: clickY });
  };

  useEffect(() => () => {
    if (confettiTimerRef.current) {
      window.clearTimeout(confettiTimerRef.current);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm" role="presentation">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="play-to-win-title"
        aria-describedby="play-to-win-description"
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#09090b] border-l border-white/10 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-in slide-in-from-right-12 duration-300"
        ref={panelRef}
      >
        <div className="flex h-full flex-col p-8 gap-6 overflow-y-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-green-400 mb-2">Play to Win</p>
              <h2 id="play-to-win-title" className="text-3xl md:text-4xl font-black brand-font text-white">
                Play to Win 20% Off
              </h2>
              <p id="play-to-win-description" className="text-sm text-gray-400 mt-2 max-w-sm">
                Spin up the mini challenge, hit start, and see if you score a 20% off reward.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
              aria-label="Close play to win panel"
            >
              <X size={20} />
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-400 mb-3">
              <span>Play Area</span>
              <span className={`${isLocked ? 'text-red-400' : 'text-green-400'} font-bold`}>
                Tries left: {triesLeft}
              </span>
            </div>
            <svg
              viewBox="0 0 320 180"
              className={`w-full h-48 rounded-xl bg-gradient-to-br from-green-500/10 via-purple-500/10 to-transparent border border-white/10 ${isLocked ? 'opacity-60' : 'cursor-crosshair'}`}
              role="img"
              aria-label="Mini game canvas with targets"
              onClick={handleCanvasClick}
              ref={playAreaRef}
            >
              <defs>
                <linearGradient id="play-glow" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>
                <radialGradient id="target-ring" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              <rect x="16" y="16" width="288" height="148" rx="18" fill="rgba(0,0,0,0.4)" />
              <circle
                cx={targetPosition.x}
                cy={targetPosition.y}
                r={TARGET_RADIUS + 8}
                fill="url(#play-glow)"
                opacity="0.35"
              />
              <circle
                cx={targetPosition.x}
                cy={targetPosition.y}
                r={TARGET_RADIUS}
                fill="none"
                stroke="url(#target-ring)"
                strokeWidth="3"
              />
              {playerPosition && (
                <circle
                  cx={playerPosition.x}
                  cy={playerPosition.y}
                  r={PLAYER_RADIUS}
                  fill="none"
                  stroke={isSuccess ? '#22c55e' : '#f97316'}
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
              )}
              <text x="160" y="92" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
                {statusMessage}
              </text>
            </svg>
          </div>

          {isSuccess && isRewardVisible && (
            <div className="relative overflow-hidden rounded-2xl border border-green-400/30 bg-green-500/10 p-5">
              <div className="pointer-events-none absolute inset-0">
                <div className="confetti-layer"></div>
                <div className="confetti-layer confetti-delay"></div>
              </div>
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center gap-3 text-green-200">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-green-300">Reward unlocked</p>
                    <h3 className="text-2xl font-black text-white">{DEFAULT_DISCOUNT_PERCENT}% off code</h3>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-lg font-mono text-white">
                    <span>{rewardCode}</span>
                    <span className="text-xs uppercase tracking-widest text-green-300">One-time</span>
                  </div>
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-white font-semibold hover:bg-white/20 transition-colors"
                    onClick={handleCopyCode}
                  >
                    <Copy size={16} />
                    {copyStatus}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3">
            <button
              className="w-full px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={resetGame}
              disabled={isLocked}
            >
              {isLocked ? 'Locked' : 'Reset'}
            </button>
            <button
              className="w-full px-6 py-3 rounded-xl border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors"
              onClick={onClose}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- FLOWER CAROUSEL COMPONENT ---
const FlowerShowcase = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FLOWER_STRAINS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const current = FLOWER_STRAINS[activeIndex];
  const next = FLOWER_STRAINS[(activeIndex + 1) % FLOWER_STRAINS.length];

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % FLOWER_STRAINS.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + FLOWER_STRAINS.length) % FLOWER_STRAINS.length);

  // Helper to determine type color
  const getTypeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'sativa': return 'text-orange-400 border-orange-400/30 bg-orange-500/10';
      case 'indica': return 'text-purple-400 border-purple-400/30 bg-purple-500/10';
      default: return 'text-green-400 border-green-400/30 bg-green-500/10';
    }
  };

  return (
    <div className="py-24 relative overflow-hidden bg-black/60 border-y border-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-green-900/10 animate-pulse duration-[5000ms]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
          <div>
             <h2 className="text-4xl md:text-6xl font-black brand-font text-white mb-2">
               TOP SHELF <span className="text-green-500">FLOWER</span>
             </h2>
             <p className="text-gray-400">Premium Indoor & Exotic Strains. Fresh Drops Weekly.</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button onClick={handlePrev} className="p-3 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/50 transition-all group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button onClick={handleNext} className="p-3 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/50 transition-all group">
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Main Display */}
        <div 
          className="relative bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Content Layout */}
          <div className="grid md:grid-cols-2 min-h-[500px]">
            
            {/* Left: Image Area */}
            <div className="relative h-[300px] md:h-auto overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-[#0a0a0a] z-10 hidden md:block"></div>
               <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-[#0a0a0a] z-10 md:hidden"></div>
               
               {/* Animated Key Image */}
               <div className="absolute inset-0">
                 <img 
                   key={activeIndex}
                   src={current.image} 
                   alt={current.imageAlt} 
                   width={current.imageWidth}
                   height={current.imageHeight}
                   loading={current.imageLoading}
                   sizes={current.imageSizes}
                   className="w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000"
                 />
               </div>
               
               {/* Quick Overlay Info for Image */}
               <div className="absolute top-6 left-6 z-20">
                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md ${getTypeColor(current.type)} font-bold text-xs tracking-widest uppercase mb-2`}>
                   <Leaf size={12} /> {current.type}
                 </div>
               </div>
            </div>

            {/* Right: Info Area */}
            <div className="relative p-8 md:p-12 flex flex-col justify-center">
               {/* Background Glow */}
               <div className="absolute top-1/2 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none"></div>

               <div key={activeIndex} className="animate-in slide-in-from-bottom-8 fade-in duration-500">
                  <div className="flex items-start justify-between mb-4">
                     <h3 className="text-4xl md:text-6xl font-black brand-font text-white leading-none">
                       {current.name.toUpperCase()}
                     </h3>
                     <div className="text-right">
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Potency</p>
                       <div className="text-3xl font-mono font-bold text-green-400">{current.thca}</div>
                       <span className="text-[10px] text-gray-500">THCa</span>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                     <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-sm text-gray-300">
                       <Droplets size={16} className="text-purple-400" /> 
                       {current.flavor}
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-sm text-gray-300">
                       <Wind size={16} className="text-blue-400" /> 
                       Top Terpenes
                     </div>
                  </div>

                  <p className="text-lg text-gray-400 leading-relaxed mb-10 border-l-2 border-white/10 pl-6">
                    {current.desc}
                  </p>

                  <div className="flex gap-4">
                     <button 
                        onClick={() => onNavigate('shop')}
                        className="flex-1 md:flex-none px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                     >
                       VIEW STRAIN <ArrowRight size={20} />
                     </button>
                     <button 
                        onClick={() => onNavigate('shop')}
                        className="flex-1 md:flex-none px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
                     >
                       SEE FULL MENU
                     </button>
                  </div>
               </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
             <div 
               key={activeIndex} 
               className="h-full bg-green-500 animate-[width_5s_linear]" 
               style={{ width: '100%' }}
             ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HERO COMPONENT ---
const Hero = ({ onNavigate, onWatchVideo, onPlay }) => (
  <div className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center justify-center bg-black">
    
    {/* YouTube Background */}
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
       {/* Fallback Image */}
       <div className="absolute inset-0 bg-[url('/assets/backgrounds/flower-room.svg')] bg-cover bg-center opacity-40"></div>
       
       {/* Overlays */}
       <div className="absolute inset-0 bg-black/50 z-10 mix-blend-overlay"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/80 z-10"></div>
       <div className="absolute inset-0 bg-purple-900/20 mix-blend-screen z-10"></div>
       
       {/* Iframe Scaling Hack */}
       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] md:w-[200%] md:h-[200%] pointer-events-none opacity-60 grayscale-[30%] contrast-125">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${BACKGROUND_VIDEO_ID}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`} 
            title="Background Video"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full object-cover"
          ></iframe>
       </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1 mb-8 border border-green-500/50 rounded-full bg-black/60 backdrop-blur-md animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.3)]">
         <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
         <span className="text-green-400 font-bold tracking-widest text-xs md:text-sm uppercase">Open 7 Days • 10AM - 10PM</span>
      </div>
      
      {/* ANIMATED HERO TITLE */}
      <h1 className="text-6xl md:text-9xl font-black mb-8 brand-font tracking-tighter leading-none relative inline-block">
        <div className="text-smoke-wrapper relative block">
          {/* Smoke Layers (Behind) - These use the CSS defined in index.html */}
          <span className="smoke-layer animate-smoke-1 absolute inset-0 select-none text-transparent" style={{ WebkitTextStroke: '2px rgba(168, 85, 247, 0.4)' }}>DS SMOKE & VAPOR</span>
          <span className="smoke-layer animate-smoke-2 absolute inset-0 select-none text-transparent" style={{ WebkitTextStroke: '2px rgba(34, 197, 94, 0.4)' }}>DS SMOKE & VAPOR</span>
          <span className="smoke-layer animate-smoke-3 absolute inset-0 select-none text-transparent blur-sm text-white/10">DS SMOKE & VAPOR</span>
          
          {/* Main Visible Text with Vapor Gradient */}
          <span className="relative z-10 animate-vapor-text block">
            DS SMOKE
          </span>
          <span className="relative z-10 animate-vapor-text block bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            & VAPOR
          </span>
        </div>
      </h1>
      
      <p className="mt-8 max-w-2xl mx-auto text-xl md:text-2xl text-gray-100 font-light mb-12 leading-relaxed drop-shadow-lg bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/5">
        Houston's Premier Lifestyle Destination.<br/>
        <span className="text-green-400 font-bold">3929 Old Spanish Trail</span>
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
        <button 
          onClick={() => onNavigate('shop')}
          className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black text-lg rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          SHOP NOW <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onPlay}
          className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-green-500/10 border border-green-500/60 text-green-200 font-bold text-lg rounded-full hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 flex items-center justify-center gap-3 group hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
          aria-haspopup="dialog"
        >
          <Play size={20} className="text-green-300" />
          PLAY TO WIN 20% OFF
        </button>
        
        <button 
          onClick={() => onWatchVideo(PROMO_VIDEO_ID)}
          className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-black/40 backdrop-blur-md border border-purple-500/50 text-white font-bold text-lg rounded-full hover:bg-purple-600/20 hover:border-purple-500 transition-all duration-300 flex items-center justify-center gap-3 group hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          <Play size={20} fill="currentColor" />
          WATCH PROMO
        </button>

        <button 
          onClick={() => onWatchVideo(SHORT_VIDEO_ID)}
          className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/20 hover:border-white transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          <Smartphone size={20} />
          WATCH SHORT
        </button>
      </div>
    </div>
  </div>
);

const Features = () => (
  <div className="py-20 bg-black/50 backdrop-blur-sm border-y border-white/5 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <FeatureCard icon={<Flame className="w-8 h-8 text-orange-500" />} title="Top Shelf Only" desc="We don't sell junk. Only the best brands and artisan glass pieces make the cut." />
        <FeatureCard icon={<Zap className="w-8 h-8 text-yellow-400" />} title="Killer Prices" desc="Houston's most competitive prices. Found it cheaper? Let's talk." />
        <FeatureCard icon={<CheckCircle className="w-8 h-8 text-green-400" />} title="The Real Deal" desc="100% authentic products. No fakes, no clones, just the genuine article." />
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl glass-panel hover:bg-white/5 transition-all duration-300 hover:border-purple-500/50 group">
    <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 brand-font group-hover:text-purple-300 transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const CategoryPreview = ({ onNavigate }) => {
  const products = [
    { name: "Disposable Vapes", color: "from-blue-600 to-cyan-500", icon: "💨", sub: "20+ Brands In Stock" },
    { name: "Heady Glass", color: "from-purple-600 to-pink-500", icon: "🧊", sub: "Rigs, Bongs, & Pipes" },
    { name: "Hookah Lounge", color: "from-red-600 to-orange-500", icon: "🔥", sub: "Premium Shisha & Coals" },
    { name: "CBD & Delta", color: "from-green-600 to-emerald-500", icon: "🌿", sub: "Flower, Edibles, & Vapes" },
    { name: "Rolling Gear", color: "from-yellow-500 to-amber-500", icon: "✨", sub: "Papers, Trays, & Wraps" },
    { name: "Kratom & More", color: "from-indigo-600 to-violet-500", icon: "🍵", sub: "Powders, Shots, & Caps" }
  ];

  return (
    <div className="py-24 relative bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black brand-font mb-4 text-white">THE STASH</h2>
          <div className="h-1 w-24 bg-green-500 mx-auto rounded-full shadow-[0_0_10px_#22c55e]"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, idx) => (
            <TiltCard key={idx} className="h-64 cursor-pointer" onClick={() => onNavigate('shop')}>
              <div className="relative h-full rounded-3xl overflow-hidden border border-white/10 bg-gray-900/40 backdrop-blur-md shadow-2xl group">
                <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                  <span className="text-6xl mb-4 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{product.icon}</span>
                  <h3 className="text-2xl font-bold brand-font mb-1">{product.name}</h3>
                  <p className="text-green-400 font-bold text-sm tracking-wider">{product.sub}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendingPreview = ({ onAddToCart, onNavigate }) => {
  const [addedItems, setAddedItems] = useState({});
  const handleAdd = (item) => {
    onAddToCart(item);
    setAddedItems(prev => ({ ...prev, [item.name]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.name]: false })), 1500);
  };
  const items = [
    { name: "GeekBar Pulse 15k", price: "$24.99", desc: "Flavor: F**king Fab", tag: "BEST SELLER", color: "bg-pink-500", brand: "GeekBar" },
    { name: "Tyson 2.0 Round 2", price: "$22.99", desc: "Flavor: Frozen Grape", tag: "NEW", color: "bg-purple-600", brand: "Tyson" },
    { name: "Stündenglass Kompact", price: "$599.00", desc: "Gravity Infuser", tag: "PREMIUM", color: "bg-gray-800", brand: "Stündenglass" },
    { name: "Ooze Duplex 2", price: "$49.99", desc: "Dual Flex Battery", tag: "STAFF PICK", color: "bg-yellow-500", brand: "Ooze" },
  ];

  return (
    <div className="py-24 relative">
       <div className="absolute inset-0 bg-purple-900/5 -skew-y-3"></div>
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-12">
           <div>
            <h2 className="text-3xl md:text-5xl font-black brand-font mb-2">TRENDING HEAT</h2>
            <p className="text-gray-400">Fresh drops and customer favorites.</p>
           </div>
           <button onClick={() => onNavigate('shop')} className="hidden md:flex items-center gap-2 text-green-400 font-bold hover:text-white transition-colors cursor-pointer">
             VIEW ALL <ArrowRight size={16} />
           </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
             <div key={i} className="glass-panel rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-colors">
                <div className={`h-48 ${item.color} bg-opacity-20 relative flex items-center justify-center overflow-hidden cursor-pointer`} onClick={() => onNavigate('shop')}>
                   <div className={`absolute inset-0 ${item.color} opacity-20`}></div>
                   <span className="text-6xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">📦</span>
                   <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold tracking-widest border border-white/10">{item.tag}</div>
                </div>
                <div className="p-4">
                   <h3 className="font-bold text-lg leading-tight mb-1 truncate cursor-pointer hover:text-purple-400" onClick={() => onNavigate('shop')}>{item.name}</h3>
                   <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-green-400 font-bold text-lg">{item.price}</span>
                      <button onClick={() => handleAdd(item)} className={`cursor-pointer p-2 rounded-lg transition-colors ${addedItems[item.name] ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-purple-600'}`}>
                        {addedItems[item.name] ? <CheckCircle size={18} /> : <Plus size={18} />}
                      </button>
                   </div>
                </div>
             </div>
          ))}
        </div>
        <div className="mt-12 text-center md:hidden">
          <button onClick={() => onNavigate('shop')} className="inline-flex items-center gap-2 text-green-400 font-bold hover:text-white transition-colors cursor-pointer">
             VIEW ALL PRODUCTS <ArrowRight size={16} />
           </button>
        </div>
       </div>
    </div>
  );
};

const Testimonials = () => (
  <div className="py-20 bg-gradient-to-b from-transparent to-purple-900/10 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl md:text-5xl font-black brand-font mb-12 text-center">VIBE CHECK <span className="text-purple-500">Passed</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[{ name: "Alex R.", text: "DS Smoke is the only spot I go to. Staff actually knows what they're talking about.", stars: 5 }, { name: "Sarah M.", text: "Huge selection of disposables. The store looks amazing inside too.", stars: 5 }, { name: "Marcus D.", text: "Legit products. I was looking for a specific piece and they helped me order it.", stars: 5 }].map((review, i) => (
          <div key={i} className="glass-panel p-8 rounded-2xl relative border-t-4 border-green-500">
            <div className="flex gap-1 mb-4">{[...Array(review.stars)].map((_, s) => <Star key={s} size={16} className="fill-green-400 text-green-400" />)}</div>
            <p className="text-gray-300 mb-6 italic">"{review.text}"</p>
            <div className="font-bold text-white brand-font">- {review.name}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const HomePage = ({ onNavigate, onAddToCart }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isPlayOpen, setIsPlayOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Hero 
        onNavigate={onNavigate} 
        onWatchVideo={(id) => setActiveVideo(id)} 
        onPlay={() => setIsPlayOpen(true)}
      />
      <VideoModal 
        isOpen={!!activeVideo} 
        onClose={() => setActiveVideo(null)} 
        videoId={activeVideo} 
      />
      <PlayToWinModal isOpen={isPlayOpen} onClose={() => setIsPlayOpen(false)} />
      <Features />
      <CategoryPreview onNavigate={onNavigate} />
      <FlowerShowcase onNavigate={onNavigate} />
      <TrendingPreview onAddToCart={onAddToCart} onNavigate={onNavigate} />
      <Testimonials />
    </>
  );
};
