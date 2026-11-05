/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  X, 
  ArrowUpRight, 
  Download, 
  Sparkles, 
  Layers, 
  Compass, 
  Terminal, 
  Copy, 
  Check, 
  RotateCw, 
  ExternalLink, 
  Sliders,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Linkedin,
  Github,
  GraduationCap,
  Briefcase,
  Award,
  Printer,
  UserCheck,
  Building2,
  Globe
} from 'lucide-react';

// Character set of 46 characters (leading space included)
const CHAR_SET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:/+!?-&";
const CHAR_COUNT = CHAR_SET.length;

interface Scene {
  drumText: string;
  captionRaw: string; // e.g. "Hi, I'm Fahim, a *UX designer*."
}

function getFormattedDate(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear()).slice(-2);
  return `${d}.${m}.${y}`;
}

const SCENES: Scene[] = [
  {
    drumText: "PORTFOLIO",
    captionRaw: "Hi, I'm Fahim, a *UX designer*.",
  },
  {
    drumText: getFormattedDate(),
    captionRaw: "Today is a good day to *build* something.",
  },
  {
    drumText: "UX + UI",
    captionRaw: "I shape how products *feel*, not just how they look.",
  },
  {
    drumText: "RESEARCH",
    captionRaw: "I start with *people*, not pixels.",
  },
  {
    drumText: "FLOWS",
    captionRaw: "Untangling the messy *middle* of every journey.",
  },
  {
    drumText: "SYSTEMS",
    captionRaw: "Design systems that *scale* with your team.",
  },
  {
    drumText: "SHIP IT!",
    captionRaw: "Then I make sure it *ships*.",
  },
  {
    drumText: "HIRE ME?",
    captionRaw: "Open to new projects, *let's talk*.",
  },
];

// Helper to center text across 9 drums
function centerText(str: string): string {
  const clean = str.toUpperCase().slice(0, 9);
  const len = clean.length;
  if (len >= 9) return clean;
  const padLeft = Math.floor((9 - len) / 2);
  const padRight = 9 - len - padLeft;
  return " ".repeat(padLeft) + clean + " ".repeat(padRight);
}

// Smooth cushioned mechanical easing (fluid glide, gentle inertia, zero jerk)
function easeOutBack(t: number, c = 0.35): number {
  const t1 = t - 1;
  return 1 + (c + 1) * t1 * t1 * t1 + c * t1 * t1;
}

// Stagger orders for 9 drums
type StaggerType = 'left-right' | 'right-left' | 'center-out';
const STAGGER_ORDERS: Record<StaggerType, number[]> = {
  'left-right': [0, 1, 2, 3, 4, 5, 6, 7, 8],
  'right-left': [8, 7, 6, 5, 4, 3, 2, 1, 0],
  'center-out': [4, 3, 5, 2, 6, 1, 7, 0, 8],
};

interface DrumState {
  currentPos: number; // continuously increasing float
  targetPos: number;
  startPos: number;
  startTime: number;
  duration: number;
  isAnimating: boolean;
  flickOffset: number; // for interactive drum hover flick
  flickStartTime: number;
  flickDuration: number;
}

// Web Audio sound generator for tactile relay click
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled = false;

  constructor(initialEnabled: boolean) {
    this.enabled = initialEnabled;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public playClick(pitchMultiplier = 1) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * 0.022); // 22ms
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Noise burst with exponential decay
      for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (length * 0.28));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = (1500 + Math.random() * 400) * pitchMultiplier;
      filter.Q.value = 4.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.022);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio context may be restricted before user gesture
    }
  }

  // Smooth mechanical card slide whoosh
  public playCardEject() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const now = this.ctx.currentTime;
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.14), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
      filter.Q.value = 3.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {
      // Audio context error
    }
  }

  // Magnetic snap & desk landing vibration tactile audio + haptics
  public playMagneticSnap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const now = this.ctx.currentTime;

      // Haptic feedback pulse for mobile/touch devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([16, 28, 12]);
        } catch {
          // Ignore
        }
      }

      // 1. Heavy desk landing impact thud (damped low sine wave)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(175, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      oscGain.gain.setValueAtTime(0.19, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);

      // 2. High-frequency magnetic metallic snap latch
      const snapLen = Math.floor(this.ctx.sampleRate * 0.032);
      const snapBuf = this.ctx.createBuffer(1, snapLen, this.ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapLen; i++) {
        const decay = Math.exp(-i / (snapLen * 0.2));
        snapData[i] = (Math.random() * 2 - 1) * decay;
      }
      const snapSrc = this.ctx.createBufferSource();
      snapSrc.buffer = snapBuf;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.value = 3200;
      snapFilter.Q.value = 7.0;

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.24, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

      snapSrc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapSrc.start(now);

      // 3. Subtle desk settling vibration rattle (2 micro-settling clicks 30ms & 62ms later)
      [0.030, 0.062].forEach((delay, idx) => {
        const microLen = Math.floor(this.ctx!.sampleRate * 0.012);
        const microBuf = this.ctx!.createBuffer(1, microLen, this.ctx!.sampleRate);
        const microData = microBuf.getChannelData(0);
        for (let i = 0; i < microLen; i++) {
          microData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (microLen * 0.25));
        }
        const microSrc = this.ctx!.createBufferSource();
        microSrc.buffer = microBuf;
        const microFilter = this.ctx!.createBiquadFilter();
        microFilter.type = 'highpass';
        microFilter.frequency.value = 2500 + idx * 700;
        const microGain = this.ctx!.createGain();
        microGain.gain.setValueAtTime(0.06 / (idx + 1), now + delay);
        microGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.012);
        microSrc.connect(microFilter);
        microFilter.connect(microGain);
        microGain.connect(this.ctx!.destination);
        microSrc.start(now + delay);
      });
    } catch {
      // Audio context error
    }
  }
}

export default function App() {
  // Persistence states
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return (localStorage.getItem('fahim_sound') || localStorage.getItem('debbie_sound')) === 'true';
  });
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(() => {
    const saved = localStorage.getItem('fahim_scene') || localStorage.getItem('debbie_scene');
    return saved !== null ? Number(saved) % SCENES.length : 0;
  });

  const [activeModal, setActiveModal] = useState<'work' | 'about' | 'process' | 'playground' | 'talk' | 'cv' | null>(null);
  const [customDrumInput, setCustomDrumInput] = useState<string>('INVENT UX');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isPullPressed, setIsPullPressed] = useState(false);
  const [cardEjectState, setCardEjectState] = useState<'idle' | 'ejecting' | 'returning'>('idle');
  // Custom Cursor DOM Refs (Instant 0ms hardware mouse tracking, zero React delay)
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorVisibleRef = useRef<boolean>(false);
  const cursorExpandedRef = useRef<boolean>(false);
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [cursorExpanded, setCursorExpanded] = useState(false);

  // Mouse Glow & 3D Tilt
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [radialLight, setRadialLight] = useState({ x: 50, y: 50 });

  // Refs for 9 drums DOM & engine
  const drumContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const drumCylinderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const drumOverlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const drumsFacesRefs = useRef<(HTMLDivElement[])[]>([]);
  const drumsState = useRef<DrumState[]>([]);
  const soundFX = useRef<SoundFX>(new SoundFX(soundEnabled));
  const rafId = useRef<number | null>(null);
  const autoCycleTimer = useRef<NodeJS.Timeout | null>(null);
  const lastWheelTime = useRef<number>(0);
  const [faceHeight, setFaceHeight] = useState<number>(75);
  const faceHeightRef = useRef<number>(75);
  const reducedMotionRef = useRef<boolean>(false);

  // 50ms vertical spring animation for drum cells when they stop rotating (simulates mechanical settle-in)
  const triggerDrumSettle = useCallback((drumIdx: number) => {
    if (reducedMotionRef.current) return;
    const cylinderEl = drumCylinderRefs.current[drumIdx];
    if (cylinderEl) {
      cylinderEl.classList.remove('animate-drum-settle');
      void cylinderEl.offsetWidth; // force reflow
      cylinderEl.classList.add('animate-drum-settle');
      cylinderEl.addEventListener(
        'animationend',
        () => {
          cylinderEl.classList.remove('animate-drum-settle');
        },
        { once: true }
      );
    }
    const overlayEl = drumOverlayRefs.current[drumIdx];
    if (overlayEl) {
      overlayEl.classList.remove('animate-drum-settle');
      void overlayEl.offsetWidth; // force reflow
      overlayEl.classList.add('animate-drum-settle');
      overlayEl.addEventListener(
        'animationend',
        () => {
          overlayEl.classList.remove('animate-drum-settle');
        },
        { once: true }
      );
    }
  }, []);

  const triggerDrumSettleRef = useRef(triggerDrumSettle);
  useEffect(() => {
    triggerDrumSettleRef.current = triggerDrumSettle;
  }, [triggerDrumSettle]);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const cycleStartTimeRef = useRef<number>(performance.now());
  const CYCLE_DURATION = 3000; // Exact 3.0s interval as requested

  // Live clock drums refs & state (6 digits: HHMMSS)
  const clockDrumContainers = useRef<(HTMLDivElement | null)[]>([]);
  const clockDrumFaces = useRef<(HTMLDivElement[])[]>([]);
  const clockDrumStates = useRef<DrumState[]>([]);
  const lastClockTime = useRef<string>('');

  // Sync sound setting
  useEffect(() => {
    soundFX.current.enabled = soundEnabled;
    localStorage.setItem('fahim_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Reduced motion detection
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = media.matches;
    const listener = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Update Face Height measurement to make drums prominent and eye-catchy while fitting in 1 page
  const updateFaceHeight = useCallback(() => {
    const w = window.innerWidth;
    const hH = window.innerHeight;
    // Single page height budget
    const maxByH = Math.max((hH - 220) / 1.62, 38);
    // Width budget to guarantee no horizontal overflow on mobile or desktop
    const maxByW = Math.max((w - 32) / 12.2, 36);
    const clampedH = Math.min(Math.max(Math.min(maxByW, maxByH), 38), 92);
    faceHeightRef.current = clampedH;
    setFaceHeight(clampedH);
  }, []);

  useEffect(() => {
    updateFaceHeight();
    window.addEventListener('resize', updateFaceHeight);
    return () => window.removeEventListener('resize', updateFaceHeight);
  }, [updateFaceHeight]);

  // Initialize drums state
  useEffect(() => {
    // 9 hero drums
    drumsState.current = Array.from({ length: 9 }, () => ({
      currentPos: 0,
      targetPos: 0,
      startPos: 0,
      startTime: 0,
      duration: 1000,
      isAnimating: false,
      flickOffset: 0,
      flickStartTime: 0,
      flickDuration: 300,
    }));

    // 6 clock drums (HHMMSS)
    clockDrumStates.current = Array.from({ length: 6 }, () => ({
      currentPos: 0,
      targetPos: 0,
      startPos: 0,
      startTime: 0,
      duration: 350,
      isAnimating: false,
      flickOffset: 0,
      flickStartTime: 0,
      flickDuration: 200,
    }));
  }, []);

  // Calculate forward roll delta (never roll backwards)
  const getForwardTargetPos = useCallback((currentPos: number, targetChar: string, extraTurns = 0) => {
    const targetIdx = CHAR_SET.indexOf(targetChar.toUpperCase());
    const validIdx = targetIdx >= 0 ? targetIdx : 0;
    const currentBase = Math.floor(currentPos);
    const curMod = ((currentBase % CHAR_COUNT) + CHAR_COUNT) % CHAR_COUNT;
    let forwardStep = validIdx - curMod;
    if (forwardStep < 0) {
      forwardStep += CHAR_COUNT;
    }
    if (forwardStep === 0 && extraTurns === 0) {
      // Stay on same
      return currentBase;
    }
    return currentBase + forwardStep + (extraTurns * CHAR_COUNT);
  }, []);

  // Roll drums to a target string with optional stagger & extra drama turns
  const rollHeroDrums = useCallback((
    targetStr: string, 
    staggerType: StaggerType = 'left-right', 
    extraRotation = 0,
    forceRandomTurns = false,
    staggerInterval = 32
  ) => {
    const centered = centerText(targetStr);
    const now = performance.now();
    const staggerOrder = STAGGER_ORDERS[staggerType];
    const isReduced = reducedMotionRef.current;

    drumsState.current.forEach((d, idx) => {
      drumCylinderRefs.current[idx]?.classList.remove('animate-drum-settle');
      drumOverlayRefs.current[idx]?.classList.remove('animate-drum-settle');
      const orderIdx = staggerOrder.indexOf(idx);
      const delay = orderIdx * staggerInterval; // silky 32ms stagger
      const char = centered[idx] || ' ';
      const addedTurns = forceRandomTurns ? Math.floor(1 + Math.random() * 2) : extraRotation;
      const targetPos = getForwardTargetPos(d.currentPos, char, addedTurns);
      const dist = Math.abs(targetPos - d.currentPos);
      
      // Fluid duration: 920ms base + 12ms per char diff (max 1280ms) for silky glide
      // Leaves ~1.5s completely stationary at the end of each 3-second cycle
      const dur = isReduced ? 10 : Math.min(920 + dist * 12, 1280);

      d.startPos = d.currentPos;
      d.targetPos = targetPos;
      d.startTime = now + delay;
      d.duration = dur;
      d.isAnimating = true;
    });

    cycleStartTimeRef.current = performance.now();
  }, [getForwardTargetPos]);

  // Main Render Loop for projected cylinders
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const now = performance.now();
      const faceHeight = faceHeightRef.current;
      const degToRad = Math.PI / 180;
      // Cylinder radius formula: R = h / (2 * sin(17°))
      const R = faceHeight / (2 * Math.sin(17 * degToRad));

      // 1. Update & Render Hero Drums
      drumsState.current.forEach((drum, drumIdx) => {
        if (drum.isAnimating) {
          if (now >= drum.startTime) {
            const elapsed = now - drum.startTime;
            const progress = Math.min(elapsed / drum.duration, 1);
            if (progress >= 1) {
              drum.currentPos = drum.targetPos;
              drum.isAnimating = false;
              soundFX.current.playClick(1 + drumIdx * 0.03);
              triggerDrumSettleRef.current(drumIdx);
            } else {
              const eased = easeOutBack(progress, 0.35);
              drum.currentPos = drum.startPos + (drum.targetPos - drum.startPos) * eased;
            }
          }
        }

        // Drum hover flick handling
        let effectivePos = drum.currentPos;
        if (drum.flickOffset !== 0) {
          const flickElapsed = now - drum.flickStartTime;
          const flickProgress = Math.min(flickElapsed / drum.flickDuration, 1);
          if (flickProgress >= 1) {
            drum.flickOffset = 0;
            triggerDrumSettleRef.current(drumIdx);
          } else {
            // Spring back sin wave
            const flickVal = drum.flickOffset * Math.sin((1 - flickProgress) * Math.PI);
            effectivePos += flickVal;
          }
        }

        const baseIndex = Math.floor(effectivePos);
        const frac = effectivePos - baseIndex;
        const faces = drumsFacesRefs.current[drumIdx] || [];

        // 6 faces per drum, offset o from -2 to +3
        faces.forEach((faceEl, faceIdx) => {
          if (!faceEl) return;
          const offset = faceIdx - 2; // offsets: -2, -1, 0, 1, 2, 3
          const charIdx = ((baseIndex + offset) % CHAR_COUNT + CHAR_COUNT) % CHAR_COUNT;
          const angleDeg = (offset - frac) * 34;

          if (Math.abs(angleDeg) >= 88) {
            faceEl.style.opacity = '0';
            faceEl.style.pointerEvents = 'none';
          } else {
            faceEl.style.opacity = '1';
            faceEl.style.pointerEvents = 'auto';
            const char = CHAR_SET[charIdx];
            if (faceEl.dataset.char !== char) {
              faceEl.textContent = char;
              faceEl.dataset.char = char;
            }
            const angleRad = angleDeg * degToRad;
            const transY = R * Math.sin(angleRad);
            const scY = Math.cos(angleRad);
            faceEl.style.transform = `translate3d(0, ${transY.toFixed(2)}px, 0) scaleY(${scY.toFixed(3)})`;
          }
        });
      });

      // 2. Update & Render Mini Clock Drums
      const clockFaceH = 20;
      const clockR = clockFaceH / (2 * Math.sin(17 * degToRad));
      clockDrumStates.current.forEach((clockDrum, cIdx) => {
        if (clockDrum.isAnimating) {
          if (now >= clockDrum.startTime) {
            const elapsed = now - clockDrum.startTime;
            const p = Math.min(elapsed / clockDrum.duration, 1);
            if (p >= 1) {
              clockDrum.currentPos = clockDrum.targetPos;
              clockDrum.isAnimating = false;
            } else {
              const eased = easeOutBack(p, 1.2);
              clockDrum.currentPos = clockDrum.startPos + (clockDrum.targetPos - clockDrum.startPos) * eased;
            }
          }
        }

        const baseIndex = Math.floor(clockDrum.currentPos);
        const frac = clockDrum.currentPos - baseIndex;
        const faces = clockDrumFaces.current[cIdx] || [];

        faces.forEach((faceEl, faceIdx) => {
          if (!faceEl) return;
          const offset = faceIdx - 2;
          const digit = ((baseIndex + offset) % 10 + 10) % 10;
          const angleDeg = (offset - frac) * 34;

          if (Math.abs(angleDeg) >= 90) {
            faceEl.style.display = 'none';
          } else {
            faceEl.style.display = 'flex';
            faceEl.textContent = String(digit);
            const angleRad = angleDeg * degToRad;
            const transY = clockR * Math.sin(angleRad);
            const scY = Math.cos(angleRad);
            faceEl.style.transform = `translate3d(0, ${transY.toFixed(2)}px, 0) scaleY(${scY.toFixed(3)})`;
          }
        });
      });

      // 3. Update Progress Bar (always updates every 3.0s)
      if (progressFillRef.current) {
        const cycleElapsed = (now - cycleStartTimeRef.current) % CYCLE_DURATION;
        const pct = Math.min((cycleElapsed / CYCLE_DURATION) * 100, 100);
        progressFillRef.current.style.width = `${pct}%`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    rafId.current = animId;

    return () => cancelAnimationFrame(animId);
  }, []);

  // Initial load spin sequence: scramble then 2 full turns onto scene 1
  useEffect(() => {
    // Scramble to random characters
    drumsState.current.forEach((d) => {
      d.currentPos = Math.floor(Math.random() * CHAR_COUNT);
    });

    const timer = setTimeout(() => {
      rollHeroDrums(SCENES[currentSceneIndex].drumText, 'left-right', 2);
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-Cycle Scene continuously every 3.0s (never stops on cursor hover or screen interactions)
  useEffect(() => {
    const runCycle = () => {
      setCurrentSceneIndex((prev) => {
        const next = (prev + 1) % SCENES.length;
        localStorage.setItem('fahim_scene', String(next));
        
        // Alternate stagger order
        const staggers: StaggerType[] = ['left-right', 'right-left', 'center-out'];
        const stagger = staggers[next % staggers.length];
        
        rollHeroDrums(SCENES[next].drumText, stagger, 0);
        return next;
      });
    };

    const interval = setInterval(runCycle, CYCLE_DURATION);
    autoCycleTimer.current = interval;
    return () => clearInterval(interval);
  }, [rollHeroDrums]);

  // Live Clock Tick Generator
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hh}${mm}${ss}`;

      if (timeStr !== lastClockTime.current && clockDrumStates.current.length === 6) {
        lastClockTime.current = timeStr;
        const nowMs = performance.now();

        for (let i = 0; i < 6; i++) {
          const targetDigit = parseInt(timeStr[i], 10);
          const drum = clockDrumStates.current[i];
          const curBase = Math.floor(drum.currentPos);
          const curMod = ((curBase % 10) + 10) % 10;
          let diff = targetDigit - curMod;
          if (diff < 0) diff += 10;

          if (diff > 0) {
            drum.startPos = drum.currentPos;
            drum.targetPos = curBase + diff;
            drum.startTime = nowMs;
            drum.duration = 280;
            drum.isAnimating = true;
          }
        }
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scene switch trigger (resets cycle timer so rhythm continues uninterrupted)
  const goToScene = useCallback((index: number, extraRotation = 0) => {
    setCurrentSceneIndex(index);
    localStorage.setItem('fahim_scene', String(index));
    const staggers: StaggerType[] = ['left-right', 'right-left', 'center-out'];
    const stagger = staggers[index % staggers.length];
    rollHeroDrums(SCENES[index].drumText, stagger, extraRotation);

    if (autoCycleTimer.current) {
      clearInterval(autoCycleTimer.current);
      autoCycleTimer.current = setInterval(() => {
        setCurrentSceneIndex((prev) => {
          const next = (prev + 1) % SCENES.length;
          localStorage.setItem('fahim_scene', String(next));
          const stag: StaggerType[] = ['left-right', 'right-left', 'center-out'];
          rollHeroDrums(SCENES[next].drumText, stag[next % stag.length], 0);
          return next;
        });
      }, CYCLE_DURATION);
    }
  }, [rollHeroDrums]);

  // Click on Counter: Next Scene with extra spin
  const handleCounterClick = useCallback(() => {
    soundFX.current.playClick(1.2);
    const nextIdx = (currentSceneIndex + 1) % SCENES.length;
    goToScene(nextIdx, 1);
  }, [currentSceneIndex, goToScene]);

  // Mouse Wheel over Counter: throttle 650ms
  const handleCounterWheel = useCallback((e: React.WheelEvent) => {
    const now = performance.now();
    if (now - lastWheelTime.current < 650) return;
    lastWheelTime.current = now;

    if (e.deltaY > 0) {
      // Forward
      const nextIdx = (currentSceneIndex + 1) % SCENES.length;
      goToScene(nextIdx, 0);
    } else if (e.deltaY < 0) {
      // Prev
      const prevIdx = (currentSceneIndex - 1 + SCENES.length) % SCENES.length;
      goToScene(prevIdx, 0);
    }
  }, [currentSceneIndex, goToScene]);

  // Knob Pull Click
  const handlePullKnobClick = useCallback(() => {
    soundFX.current.playClick(0.85);
    setIsPullPressed(true);
    setTimeout(() => setIsPullPressed(false), 240);

    // Pick a random different scene
    let randomScene = Math.floor(Math.random() * SCENES.length);
    if (randomScene === currentSceneIndex) {
      randomScene = (randomScene + 1) % SCENES.length;
    }
    setCurrentSceneIndex(randomScene);
    localStorage.setItem('fahim_scene', String(randomScene));

    rollHeroDrums(SCENES[randomScene].drumText, 'center-out', 0, true, 100);

    if (autoCycleTimer.current) {
      clearInterval(autoCycleTimer.current);
      autoCycleTimer.current = setInterval(() => {
        setCurrentSceneIndex((prev) => {
          const next = (prev + 1) % SCENES.length;
          localStorage.setItem('fahim_scene', String(next));
          const stag: StaggerType[] = ['left-right', 'right-left', 'center-out'];
          rollHeroDrums(SCENES[next].drumText, stag[next % stag.length], 0);
          return next;
        });
      }, CYCLE_DURATION);
    }
  }, [currentSceneIndex, rollHeroDrums]);

  // Drum Hover Flick
  const handleDrumHover = useCallback((idx: number) => {
    const drum = drumsState.current[idx];
    if (drum && !drum.isAnimating) {
      drum.flickOffset = 0.3; // rolls 0.3 of a step
      drum.flickStartTime = performance.now();
      drum.flickDuration = 320;
      soundFX.current.playClick(1.4);
    }
  }, []);

  // Card slot click handler: Ejection path, magnetic snap & desk landing vibration
  const handleCardClick = useCallback(() => {
    if (cardEjectState !== 'idle') return;

    soundFX.current.playCardEject();
    setCardEjectState('ejecting');

    // 1. Magnetic snap & desk landing impact fires at t = 360ms when card reaches end of ejection path
    setTimeout(() => {
      soundFX.current.playMagneticSnap();
    }, 360);

    // 2. Open CV modal after the full magnetic snap & landing vibration finishes settling (t = 680ms)
    setTimeout(() => {
      setActiveModal('cv');
    }, 680);
  }, [cardEjectState]);

  // Modal close handler with card docking return animation
  const handleCloseModal = useCallback(() => {
    soundFX.current.playClick(0.9);
    setActiveModal(null);
    if (cardEjectState !== 'idle') {
      setCardEjectState('returning');
      setTimeout(() => {
        setCardEjectState('idle');
      }, 350);
    }
  }, [cardEjectState]);

  // Custom Cursor Mouse Listener & 3D Tilt (Instant 0ms hardware mouse tracking)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Instant cursor update directly on DOM (0ms lag, zero React state re-render)
      if (cursorRef.current) {
        const offset = cursorExpandedRef.current ? 37 : 5;
        cursorRef.current.style.transform = `translate3d(${e.clientX - offset}px, ${e.clientY - offset}px, 0)`;
        if (!cursorVisibleRef.current) {
          cursorVisibleRef.current = true;
          cursorRef.current.style.opacity = '1';
        }
      }

      // 2. Calculate 3D tilt (±3.8°)
      const w = window.innerWidth;
      const h = window.innerHeight;
      const xRatio = (e.clientX - w / 2) / (w / 2);
      const yRatio = (e.clientY - h / 2) / (h / 2);
      setMouseTilt({
        x: Number((xRatio * 3.8).toFixed(2)),
        y: Number((-yRatio * 3.8).toFixed(2)),
      });

      // 3. Mouse Light Position
      setRadialLight({
        x: Math.round((e.clientX / w) * 100),
        y: Math.round((e.clientY / h) * 100),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cursor Hover helper
  const attachCursor = useCallback((label: string) => ({
    onMouseEnter: () => {
      cursorExpandedRef.current = true;
      setCursorLabel(label);
      setCursorExpanded(true);
    },
    onMouseLeave: () => {
      cursorExpandedRef.current = false;
      setCursorLabel('');
      setCursorExpanded(false);
    },
  }), []);

  // Split caption for slide-up mask animation
  const parsedCaption = useMemo(() => {
    const scene = SCENES[currentSceneIndex];
    const raw = scene.captionRaw;
    // Extract tokens with asterisks
    const regex = /(\*[^*]+\*|\S+)/g;
    const tokens = raw.match(regex) || [];
    return tokens.map((token, i) => {
      const isItalic = token.startsWith('*') && token.endsWith('*');
      const text = isItalic ? token.slice(1, -1) : token;
      return { text, isItalic, index: i };
    });
  }, [currentSceneIndex]);

  // Copy email helper
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('fahimfahim27122003@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const currentScene = SCENES[currentSceneIndex];

  return (
    <div 
      className="relative h-screen h-dvh max-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#e3170a] text-[#0d0d0d] font-mono-jb"
      style={{
        background: `radial-gradient(circle 750px at ${radialLight.x}% ${radialLight.y}%, #ff2a17 0%, #e3170a 60%, #b80f05 100%)`,
      }}
    >
      {/* Screen reader title */}
      <h1 className="sr-only">Fahim, UX Designer — Industrial Odometer Portfolio</h1>

      {/* Static Film Grain Overlay (SVG feTurbulence noise, mix-blend-multiply, static not animated) */}
      <svg 
        className="pointer-events-none fixed inset-0 w-full h-full opacity-10 mix-blend-multiply z-30" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="staticNoiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#staticNoiseFilter)" />
      </svg>

      {/* Dark Vignette at bottom */}
      <div 
        className="pointer-events-none fixed inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/25 via-black/10 to-transparent z-10" 
        aria-hidden="true" 
      />

      {/* CUSTOM CURSOR (Instant hardware tracking, hidden on mobile / touch) */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 hidden md:flex items-center justify-center rounded-full border border-black/40 will-change-transform opacity-0 ${
          cursorExpanded 
            ? 'w-[74px] h-[74px] bg-[#0d0d0d] shadow-2xl scale-100' 
            : 'w-2.5 h-2.5 bg-[#0d0d0d]'
        }`}
        style={{
          transition: 'width 0.12s ease-out, height 0.12s ease-out, background-color 0.12s ease-out',
        }}
        aria-hidden="true"
      >
        {cursorExpanded && (
          <span className="text-[11px] font-mono tracking-widest text-[#ff2a17] font-bold uppercase select-none">
            {cursorLabel}
          </span>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. FIXED NAV BAR (3-Column Grid)                          */}
      {/* ========================================================= */}
      <header className="w-full h-12 md:h-14 px-4 sm:px-6 md:px-10 flex items-center justify-between border-b border-black/10 backdrop-blur-xs shrink-0 z-40 select-none animate-[navSlideDown_0.6s_cubic-bezier(0.22,1.28,0.42,1)]">
        
        {/* Left: Logo fahim® in Archivo 900 */}
        <div className="flex items-center">
          <button 
            onClick={() => goToScene(0, 1)}
            className="group flex items-center text-black font-archivo text-2xl md:text-3xl tracking-tighter uppercase focus:outline-hidden cursor-pointer"
            {...attachCursor('HELLO')}
          >
            <span>fahim</span>
            <sup className="text-xs font-normal ml-0.5 tracking-normal opacity-90">®</sup>
          </button>
        </div>

        {/* Centre: Nav links with mechanical roll-up hover effect */}
        <nav className="hidden md:flex items-center justify-center gap-7">
          {[
            { id: 'work', label: 'Work', sup: '01' },
            { id: 'about', label: 'About', sup: null },
            { id: 'process', label: 'Process', sup: null },
            { id: 'playground', label: 'Playground', sup: null },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModal(item.id as typeof activeModal)}
              className="relative h-5 overflow-hidden text-xs font-mono tracking-widest uppercase text-black font-semibold cursor-pointer focus:outline-hidden"
              {...attachCursor('OPEN')}
            >
              {/* Rolling text effect */}
              <div className="transition-transform duration-300 ease-[cubic-bezier(0.22,1.28,0.42,1)] hover:-translate-y-5">
                <div className="h-5 flex items-center gap-0.5">
                  <span>{item.label}</span>
                  {item.sup && <sup className="text-[9px] font-mono opacity-70">{item.sup}</sup>}
                </div>
                <div className="h-5 flex items-center gap-0.5 text-[#fff6ee] bg-[#0d0d0d] px-1 rounded-xs">
                  <span>{item.label}</span>
                  {item.sup && <sup className="text-[9px] font-mono text-[#ff2a17]">{item.sup}</sup>}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Right: Live Clock, Sound Toggle & "Let's talk" Pill */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-4 md:gap-5">
          
          {/* Live Mechanical Odometer Clock (Completely Transparent) */}
          <div 
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-transparent border-0 shadow-none ring-0 select-none"
            title="Live Station Clock (HH:MM:SS)"
          >
            {/* Hour drums */}
            <div className="flex gap-0.5 bg-transparent">
              {[0, 1].map((idx) => (
                <div 
                  key={`clock-${idx}`}
                  ref={(el) => { clockDrumContainers.current[idx] = el; }}
                  className="relative w-3 h-5 overflow-hidden bg-transparent border-0 shadow-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
                >
                  <div className="relative w-full h-full flex items-center justify-center font-mono text-xs font-bold text-[#fff6ee] bg-transparent">
                    {[-2, -1, 0, 1, 2, 3].map((fIdx, arrIdx) => (
                      <div
                        key={fIdx}
                        ref={(el) => {
                          if (!clockDrumFaces.current[idx]) clockDrumFaces.current[idx] = [];
                          if (el) clockDrumFaces.current[idx][arrIdx] = el;
                        }}
                        className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#fff6ee] bg-transparent"
                      >
                        0
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <span className="text-[#fff6ee] text-xs font-mono font-bold mx-0.5 opacity-80 bg-transparent">:</span>

            {/* Minute drums */}
            <div className="flex gap-0.5 bg-transparent">
              {[2, 3].map((idx) => (
                <div 
                  key={`clock-${idx}`}
                  ref={(el) => { clockDrumContainers.current[idx] = el; }}
                  className="relative w-3 h-5 overflow-hidden bg-transparent border-0 shadow-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
                >
                  <div className="relative w-full h-full flex items-center justify-center font-mono text-xs font-bold text-[#fff6ee] bg-transparent">
                    {[-2, -1, 0, 1, 2, 3].map((fIdx, arrIdx) => (
                      <div
                        key={fIdx}
                        ref={(el) => {
                          if (!clockDrumFaces.current[idx]) clockDrumFaces.current[idx] = [];
                          if (el) clockDrumFaces.current[idx][arrIdx] = el;
                        }}
                        className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#fff6ee] bg-transparent"
                      >
                        0
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <span className="text-[#fff6ee] text-xs font-mono font-bold mx-0.5 opacity-80 bg-transparent">:</span>

            {/* Second drums */}
            <div className="flex gap-0.5 bg-transparent">
              {[4, 5].map((idx) => (
                <div 
                  key={`clock-${idx}`}
                  ref={(el) => { clockDrumContainers.current[idx] = el; }}
                  className="relative w-3 h-5 overflow-hidden bg-transparent border-0 shadow-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
                >
                  <div className="relative w-full h-full flex items-center justify-center font-mono text-xs font-bold text-[#fff6ee] bg-transparent">
                    {[-2, -1, 0, 1, 2, 3].map((fIdx, arrIdx) => (
                      <div
                        key={fIdx}
                        ref={(el) => {
                          if (!clockDrumFaces.current[idx]) clockDrumFaces.current[idx] = [];
                          if (el) clockDrumFaces.current[idx][arrIdx] = el;
                        }}
                        className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#fff6ee] bg-transparent"
                      >
                        0
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sound Toggle with 3 animated equalizer bars */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                soundFX.current.enabled = true;
                soundFX.current.playClick(1.5);
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/10 hover:bg-black/20 border border-black/20 transition-all text-xs font-mono uppercase text-black font-semibold cursor-pointer"
            {...attachCursor('SOUND')}
            aria-label="Toggle mechanical sound effects"
          >
            {soundEnabled ? (
              <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                <span className="w-0.5 bg-black animate-pulse h-2" style={{ animationDuration: '0.4s' }} />
                <span className="w-0.5 bg-black animate-pulse h-3.5" style={{ animationDuration: '0.6s' }} />
                <span className="w-0.5 bg-black animate-pulse h-2.5" style={{ animationDuration: '0.5s' }} />
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-60" />
            )}
            <span className="text-[10px] tracking-wider">{soundEnabled ? 'ON' : 'MUTE'}</span>
          </button>

          {/* Black Pill Button: "Let's talk" with pulsing green available dot */}
          <button
            onClick={() => setActiveModal('talk')}
            className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0d0d0d] text-[#fff6ee] text-[11px] sm:text-xs font-mono font-medium tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:bg-[#fff6ee] hover:text-[#0d0d0d] shadow-lg shadow-black/20 cursor-pointer"
            {...attachCursor('HELLO')}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Let's talk</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. THE MACHINE (Centred Hero)                             */}
      {/* ========================================================= */}
      <main 
        className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 select-none my-auto overflow-hidden shrink-0"
      >
        <div 
          className="relative flex flex-col items-center justify-center transition-transform duration-150 ease-out max-w-full my-auto"
          style={{
            transform: reducedMotionRef.current 
              ? 'none' 
              : `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`,
          }}
        >

          {/* THE COUNTER ASSEMBLY (Window + Card Slot on right, lengthy, minimal slick bezel, almost borderless) */}
          <div className="flex items-stretch gap-1.5 sm:gap-2.5 md:gap-3 max-w-full justify-center">
            
            {/* The Recessed Window holding 9 Drums - Almost borderless, minimum slick bezel */}
            <div
              role="button"
              tabIndex={0}
              aria-label={`Odometer counter currently displaying ${currentScene.drumText}. Click to spin to next statement.`}
              onClick={handleCounterClick}
              onWheel={handleCounterWheel}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCounterClick();
                }
              }}
              style={{
                height: `${Math.round(1.62 * faceHeight + 6)}px`,
              }}
              className="relative p-0.5 sm:p-1 bg-[#0d0d0d] rounded-md sm:rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-black/30 flex items-center cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-black shrink-0"
              {...attachCursor('SPIN')}
            >
              {/* 9 Drums Container - Flush almost borderless inner chamber */}
              <div className="relative flex items-center bg-[#050505] p-0.5 rounded-xs shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] overflow-hidden h-full">
                {Array.from({ length: 9 }).map((_, drumIdx) => (
                  <div
                    key={`drum-${drumIdx}`}
                    ref={(el) => { drumContainerRefs.current[drumIdx] = el; }}
                    onMouseEnter={() => handleDrumHover(drumIdx)}
                    className="relative overflow-hidden bg-[#f3f1ec] border-r last:border-r-0 border-black/75 transition-shadow duration-200"
                    style={{
                      // Each drum is lengthy at 0.96 x face-height wide and 1.62 x face-height tall
                      width: `${(0.96 * faceHeight).toFixed(1)}px`,
                      height: `${(1.62 * faceHeight).toFixed(1)}px`,
                    }}
                  >
                    {/* Mechanical Drum Core Cylinder (50ms vertical spring animation for mechanical settle-in) */}
                    <div
                      ref={(el) => { drumCylinderRefs.current[drumIdx] = el; }}
                      className="relative w-full h-full will-change-transform"
                    >
                      {/* Dark curved drum shading overlay */}
                      <div 
                        ref={(el) => { drumOverlayRefs.current[drumIdx] = el; }}
                        className="absolute inset-0 drum-shading-overlay pointer-events-none z-20" 
                      />

                      {/* Projected Faces container */}
                      <div className="relative w-full h-full flex items-center justify-center font-archivo font-black text-[#0d0d0d]">
                        {[-2, -1, 0, 1, 2, 3].map((offset, faceArrIdx) => (
                          <div
                            key={`face-${drumIdx}-${offset}`}
                            ref={(el) => {
                              if (!drumsFacesRefs.current[drumIdx]) {
                                drumsFacesRefs.current[drumIdx] = [];
                              }
                              if (el) drumsFacesRefs.current[drumIdx][faceArrIdx] = el;
                            }}
                            className="absolute inset-x-0 flex items-center justify-center select-none font-archivo font-black uppercase text-[#0d0d0d] will-change-transform transform-gpu backface-hidden"
                            style={{
                              height: `${faceHeight.toFixed(1)}px`,
                              top: `calc(50% - ${(faceHeight / 2).toFixed(1)}px)`,
                              fontSize: `${(0.94 * faceHeight).toFixed(1)}px`,
                              lineHeight: 1,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            &nbsp;
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Black CARD SLOT: EXACT SAME LENGTH/HEIGHT, LENGTHY & ALMOST BORDERLESS */}
            <div 
              style={{
                height: `${Math.round(1.62 * faceHeight + 6)}px`,
              }}
              className="flex flex-col items-center justify-between relative w-30 sm:w-38 md:w-46 bg-[#0d0d0d] rounded-md sm:rounded-lg border border-black/30 shadow-[0_8px_24px_rgba(0,0,0,0.4)] p-0.5 sm:p-1 shrink-0 z-20"
              {...attachCursor('CV ↗')}
            >
              {/* Recessed chamber matching drum frame */}
              <div className="relative flex flex-col justify-between w-full h-full bg-[#050505] p-0.5 sm:p-1 rounded-xs shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] overflow-visible">
                {/* Mouth slot at top */}
                <div className="w-full h-1 sm:h-1.5 bg-[#000] rounded-xs shadow-inner shrink-0 border border-black/60 mb-0.5" />

                {/* Empty slot contact pins visible when card is ejected */}
                <div className={`absolute inset-x-2 top-3 bottom-5 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
                  cardEjectState !== 'idle' ? 'opacity-80' : 'opacity-0'
                }`}>
                  <div className="flex gap-1.5 mb-1">
                    <span className="w-1.5 h-3 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-xs shadow-[0_0_4px_rgba(234,179,8,0.5)]" />
                    <span className="w-1.5 h-3 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-xs shadow-[0_0_4px_rgba(234,179,8,0.5)]" />
                    <span className="w-1.5 h-3 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-xs shadow-[0_0_4px_rgba(234,179,8,0.5)]" />
                  </div>
                  <span className="text-[6.5px] font-mono tracking-widest text-[#fff6ee]/50 uppercase font-bold">
                    SLOT EJECTED
                  </span>
                </div>

                {/* Desk Landing Contact Shadow on Desk Surface */}
                {cardEjectState !== 'idle' && (
                  <div 
                    className="absolute pointer-events-none left-1/2 -translate-x-1/2 w-[92%] h-12 rounded-full z-10 transition-opacity duration-300"
                    style={{
                      top: 'calc(100% + 46px)',
                      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, transparent 75%)',
                      filter: 'blur(4px)',
                    }}
                  />
                )}

                {/* Desk Landing Magnetic Impact Ring */}
                {cardEjectState === 'ejecting' && (
                  <div 
                    className="absolute pointer-events-none left-1/2 -translate-x-1/2 w-full h-14 rounded-lg border border-yellow-500/50 animate-[deskSnapImpactRipple_0.6s_ease-out_forwards] z-10"
                    style={{
                      top: 'calc(100% + 44px)',
                    }}
                  />
                )}

                {/* The Bank-Style Card inserted into slot */}
                <button
                  onClick={handleCardClick}
                  className={`relative w-full flex-1 rounded-xs bg-gradient-to-br from-[#e3170a] to-[#990a00] border border-black/30 p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden shadow-xs cursor-pointer ${
                    cardEjectState === 'ejecting'
                      ? 'animate-[magneticCardEject_0.65s_cubic-bezier(0.2,0.8,0.2,1)_forwards] z-30'
                      : cardEjectState === 'returning'
                      ? 'animate-[cardReturnToSlot_0.35s_cubic-bezier(0.25,1,0.5,1)_forwards] z-30'
                      : 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200'
                  }`}
                  title="Click to eject & view Fahim's Civil Engineering CV"
                >
                  {/* Gold microchip & CAD insignia */}
                  <div className="flex items-center justify-between">
                    <div className="w-4 sm:w-5 md:w-6 h-2.5 sm:h-3 md:h-3.5 bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#aa8012] rounded-xs border border-yellow-700/60 shadow-xs flex items-center justify-center">
                      <div className="w-full h-[1px] bg-yellow-900/40" />
                    </div>
                    <span className="font-archivo font-black italic text-black/90 text-[9px] sm:text-[10px] md:text-xs tracking-tighter inline-block rotate-90 origin-center">
                      CAD
                    </span>
                  </div>

                  {/* Card Mono Text */}
                  <div className="mt-auto pt-0.5 text-left">
                    <div className="text-[8px] sm:text-[9px] md:text-[10px] font-mono font-bold leading-tight text-white/95 uppercase tracking-tight">
                      FAHIM<br />
                      CIVIL & 3D
                    </div>
                    <div className="text-[6px] sm:text-[7px] md:text-[8px] font-mono text-white/60 tracking-wider uppercase mt-0.5">
                      ID: 27122003
                    </div>
                  </div>
                </button>

                {/* SLOT A plate engraved at bottom */}
                <div className="shrink-0 flex items-center justify-center py-0.5">
                  <span className="text-[7.5px] sm:text-[8.5px] md:text-[9px] font-mono text-[#fff6ee]/90 tracking-widest uppercase font-bold">
                    SLOT A
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Glossy Black KNOB (PULL) */}
          <div className="mt-2 md:mt-2.5 flex flex-col items-center">
            <button
              onClick={handlePullKnobClick}
              className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-[#2a2a2a] via-[#0d0d0d] to-[#000] border-2 border-black/80 shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.25)] flex items-center justify-center cursor-pointer transition-all duration-150 ${
                isPullPressed ? 'scale-90 shadow-inner' : 'hover:scale-105 active:scale-95'
              }`}
              style={{
                boxShadow: `${-mouseTilt.x * 1.5}px ${-mouseTilt.y * 1.5 + 8}px 20px rgba(0,0,0,0.55)`,
              }}
              {...attachCursor('PULL')}
              aria-label="Pull mechanical knob to scramble and roll to a surprise scene"
            >
              {/* Knurled grip ridges */}
              <div className="absolute inset-1 rounded-full border border-dashed border-white/20 pointer-events-none" />
              {/* Specular center reflection */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-t from-white/10 to-white/40 blur-[1px] pointer-events-none" />
            </button>
            <span className="mt-1 text-[8.5px] md:text-[9.5px] font-mono tracking-[0.25em] text-[#fff6ee]/80 font-bold uppercase">
              PULL
            </span>
          </div>

          {/* 4. BIG CAPTION in Instrument Serif (Slide-up mask staggered words) */}
          <div 
            className="mt-2.5 md:mt-3 px-4 text-center max-w-2xl"
            aria-live="polite"
          >
            <p className="font-instrument text-2xl sm:text-3xl md:text-4xl lg:text-[2.6vw] leading-tight text-[#fff6ee] tracking-tight">
              {parsedCaption.map((token, i) => (
                <span key={`${currentSceneIndex}-${i}`} className="inline-block overflow-hidden mr-[0.25em]">
                  <span 
                    className={`inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1.28,0.42,1)] ${
                      token.isItalic ? 'italic font-normal text-[#0d0d0d]' : 'text-[#fff6ee]'
                    }`}
                    style={{
                      transform: 'translateY(0%)',
                      animation: `slideUp 0.5s cubic-bezier(0.22, 1.28, 0.42, 1) ${i * 35}ms backwards`,
                    }}
                  >
                    {token.text}
                  </span>
                </span>
              ))}
            </p>
          </div>

        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. BOTTOM RAIL (Fixed 3-Column Footer, 1-Page Layout)     */}
      {/* ========================================================= */}
      <footer className="w-full px-4 sm:px-6 md:px-10 py-2 md:py-2.5 flex items-center justify-between border-t border-black/10 text-[10px] md:text-xs font-mono uppercase text-[#0d0d0d] font-semibold shrink-0 z-20 animate-[railSlideUp_0.6s_cubic-bezier(0.22,1.28,0.42,1)_0.15s_backwards]">
        
        {/* Left: Role & Disciplines */}
        <div className="text-left tracking-wider truncate max-w-[280px] sm:max-w-none">
          Civil Engineering · AutoCAD 2D/3D · Operations
        </div>

        {/* Centre: 8 Thin Progress Segments */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          {SCENES.map((_, sIdx) => {
            const isCurrent = sIdx === currentSceneIndex;
            const isPast = sIdx < currentSceneIndex;
            return (
              <button
                key={`seg-${sIdx}`}
                onClick={() => goToScene(sIdx, 0)}
                className="relative h-1.5 w-5 sm:w-7 bg-black/20 rounded-full overflow-hidden transition-all hover:h-2 cursor-pointer"
                title={`Jump to Scene 00${sIdx + 1}: ${SCENES[sIdx].drumText}`}
                {...attachCursor(`0${sIdx + 1}`)}
              >
                {isPast && <div className="absolute inset-0 bg-[#0d0d0d]" />}
                {isCurrent && (
                  <div 
                    ref={progressFillRef}
                    className="absolute inset-y-0 left-0 bg-[#0d0d0d]"
                    style={{ width: '0%' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Spacer to maintain 3-column balance */}
        <div className="flex items-center justify-end" />
      </footer>

      {/* ========================================================= */}
      {/* 4. MODALS & DRAWERS (Work, About, Process, Playground, etc)*/}
      {/* ========================================================= */}

      {/* WORK MODAL (Odometer Design System) */}
      {activeModal === 'work' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#f3f1ec] text-[#0d0d0d] rounded-xl shadow-2xl flex flex-col overflow-hidden border-2 border-black">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-white">
              <div className="flex items-center gap-3">
                <span className="font-archivo text-xl uppercase tracking-tight font-black">Featured Work</span>
                <span className="px-2 py-0.5 bg-black text-[#f3f1ec] font-mono text-xs rounded-xs font-bold">01 SYSTEM</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer"
                {...attachCursor('CLOSE')}
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="p-6 bg-white border border-black/20 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-[#e3170a] text-white font-mono text-xs font-black rounded-xs">
                      SPEC 01
                    </span>
                    <h3 className="font-archivo text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                      Odometer Design System
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-black/60 uppercase font-bold tracking-wider">
                    Design Systems · Motion Physics
                  </span>
                </div>

                <div className="p-3 bg-black/5 border-l-4 border-[#e3170a] rounded-r mb-4">
                  <span className="text-[#e3170a] font-mono text-xs font-bold block mb-1 uppercase tracking-wide">
                    Adoption & Metrics
                  </span>
                  <p className="font-mono text-xs text-black/90 font-medium">
                    Adopted across 8 engineering squads · 120fps Cylinder Projection · 0ms Hardware Inertia
                  </p>
                </div>

                <p className="font-mono text-xs text-black/80 leading-relaxed mb-4">
                  A production-grade mechanical motion grammar for data-dense dashboards and skeuomorphic tactile interfaces. Implements projected cylindrical drum trigonometry (R = h / (2 · sin 17°)), cubic mechanical overshoot easing (c = 0.35), and paper-drum specular highlights without browser cylinder slice artifacts.
                </p>

                {/* Technical Architecture Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 font-mono text-xs">
                  <div className="p-3 bg-[#f3f1ec] border border-black/15 rounded">
                    <span className="text-[10px] text-black/50 uppercase block font-bold">Mathematical Kinematics</span>
                    <span className="font-bold text-black text-[11px]">R = h / (2·sin 17°)</span>
                    <p className="text-[10px] text-black/70 mt-1">6-face projected viewport with real-time trigonometric scaleY / translateY transformation.</p>
                  </div>
                  <div className="p-3 bg-[#f3f1ec] border border-black/15 rounded">
                    <span className="text-[10px] text-black/50 uppercase block font-bold">Mechanical Physics</span>
                    <span className="font-bold text-black text-[11px]">Back-Out Overshoot (c = 0.35)</span>
                    <p className="text-[10px] text-black/70 mt-1">Tactile settling inertia with continuous 3.0s auto-cycling and Web Audio bandpass click feedback.</p>
                  </div>
                  <div className="p-3 bg-[#f3f1ec] border border-black/15 rounded">
                    <span className="text-[10px] text-black/50 uppercase block font-bold">Optical Simulation</span>
                    <span className="font-bold text-black text-[11px]">Multi-Stop Curvature Shading</span>
                    <p className="text-[10px] text-black/70 mt-1">Simulates painted metal machine panel depth with radial light tracking and static noise overlay.</p>
                  </div>
                  <div className="p-3 bg-[#f3f1ec] border border-black/15 rounded">
                    <span className="text-[10px] text-black/50 uppercase block font-bold">Component Tokens</span>
                    <span className="font-bold text-black text-[11px]">9-Drum Recessed Assembly</span>
                    <p className="text-[10px] text-black/70 mt-1">Includes Slot A card ejector, knurled pull knob, scene LED indicator, and status rail.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/15">
                  <span className="text-xs font-mono font-bold text-black/60">
                    Live Component Active in Hero
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFX.current.playClick(1.2);
                        setActiveModal(null);
                        goToScene(0, 2);
                      }}
                      className="px-4 py-2 bg-black text-[#fff6ee] rounded hover:bg-[#e3170a] transition-colors font-mono text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Trigger System Roll</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-2xl bg-[#f3f1ec] text-[#0d0d0d] rounded-xl shadow-2xl p-6 sm:p-8 border-2 border-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
              <h2 className="font-archivo text-2xl font-black uppercase tracking-tight">About Fahim</h2>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer"
                {...attachCursor('CLOSE')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs leading-relaxed text-black/80">
              <p className="font-instrument text-2xl text-black leading-snug">
                "Engineering is the art of turning spatial models and blueprints into resilient physical reality."
              </p>
              <p>
                Hi, I'm <strong className="text-black">Ashiq Billah Fahim</strong>. I am a civil engineering professional with a strong foundation in AutoCAD 2D/3D modeling, engineering project development, and field infrastructure operations.
              </p>
              <p>
                My background spans hands-on technical instruction at Novel Polytechnic Institute, leading large-scale connectivity rollouts across Rajshahi with Asia Pacific Communications LTD, and international customer communications with Genex Infosys Limited. I bring precision drafting, teamwork, and proactive execution to every project.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/20 text-black">
                <div>
                  <h4 className="font-archivo uppercase font-bold text-xs mb-1">Core Competencies</h4>
                  <ul className="space-y-1 list-disc list-inside text-[11px]">
                    <li>AutoCAD 2D / 3D Modeling</li>
                    <li>Civil Structural Drafting</li>
                    <li>Technical Instruction & Training</li>
                    <li>Field Project Operations & Telecom</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-archivo uppercase font-bold text-xs mb-1">Credentials</h4>
                  <ul className="space-y-1 list-disc list-inside text-[11px]">
                    <li>Diploma in Civil Engineering (JPI)</li>
                    <li>IELTS Certified English Speaker</li>
                    <li>Industrial Attachment (Rashid Eng.)</li>
                    <li>Member, Jhenidah Red Crescent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROCESS MODAL */}
      {activeModal === 'process' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-3xl bg-[#f3f1ec] text-[#0d0d0d] rounded-xl shadow-2xl p-6 sm:p-8 border-2 border-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
              <h2 className="font-archivo text-2xl font-black uppercase tracking-tight">UX Engineering Process</h2>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer"
                {...attachCursor('CLOSE')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {[
                {
                  step: 'PHASE 01',
                  name: 'Analog Field Research',
                  icon: Compass,
                  desc: 'Shadowing operators in physical workstations, noting friction points, ambient noise levels, glove constraints, and cognitive overload.',
                },
                {
                  step: 'PHASE 02',
                  name: 'Mental Models & State Machines',
                  icon: Layers,
                  desc: 'Mapping rigorous deterministic state transitions with zero undefined intermediate states. Every button has explicit spring latency.',
                },
                {
                  step: 'PHASE 03',
                  name: 'Kinematic Prototyping',
                  icon: Sliders,
                  desc: 'Custom code prototypes built in vanilla JS, Web Audio, and WebGL to test mass, damping ratios, friction coefficients, and sound clicks.',
                },
                {
                  step: 'PHASE 04',
                  name: 'Ergonomic Verification',
                  icon: Terminal,
                  desc: 'High-speed camera tracking, touch target heatmaps, and Fitts’ Law latency auditing on target hardware devices before deployment.',
                },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.step} className="p-4 bg-white border border-black/20 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[#e3170a] font-bold">{p.step}</span>
                      <Icon className="w-4 h-4 text-black/60" />
                    </div>
                    <h4 className="font-archivo text-sm font-bold uppercase mb-1">{p.name}</h4>
                    <p className="text-[11px] text-black/70 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PLAYGROUND MODAL (Custom Drum Writer & Controls) */}
      {activeModal === 'playground' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-xl bg-[#f3f1ec] text-[#0d0d0d] rounded-xl shadow-2xl p-6 border-2 border-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e3170a]" />
                <h2 className="font-archivo text-xl font-black uppercase tracking-tight">Odometer Playground</h2>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer"
                {...attachCursor('CLOSE')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <p className="text-black/80">
                Test the projected cylinder engine by feeding any custom phrase into the 9 physical drums:
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">
                  Custom Drum Text (Max 9 Chars)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    value={customDrumInput}
                    onChange={(e) => setCustomDrumInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-white border border-black rounded-md font-mono text-sm tracking-widest uppercase focus:outline-hidden focus:ring-2 focus:ring-[#e3170a]"
                    placeholder="ENTER TEXT"
                  />
                  <button
                    onClick={() => {
                      rollHeroDrums(customDrumInput || 'EMPTY', 'center-out', 1);
                      setActiveModal(null);
                    }}
                    className="px-4 py-2 bg-[#0d0d0d] text-[#fff6ee] rounded-md font-bold uppercase hover:bg-[#e3170a] transition-colors cursor-pointer"
                  >
                    Roll Drums
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-black/20 flex flex-wrap gap-2">
                {['DISRUPT', 'HARDWARE', 'CLICK IT', '100% REAL', 'AESTHETIC'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setCustomDrumInput(preset);
                      rollHeroDrums(preset, 'left-right', 1);
                      setActiveModal(null);
                    }}
                    className="px-2.5 py-1 bg-white border border-black/30 rounded text-[11px] hover:border-black transition-colors cursor-pointer"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT "LET'S TALK" MODAL */}
      {activeModal === 'talk' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-lg bg-[#f3f1ec] text-[#0d0d0d] rounded-xl shadow-2xl p-6 sm:p-8 border-2 border-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-archivo text-xl font-black uppercase tracking-tight">Contact Ashiq Billah Fahim</h2>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer"
                {...attachCursor('CLOSE')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <p className="text-black/80 leading-relaxed">
                Civil engineering professional specializing in AutoCAD 2D/3D, 3D spatial modeling, and technical project operations. Open to engineering, operations, and technical coordination roles.
              </p>

              {/* Direct email box */}
              <div className="p-3 bg-white border border-black rounded-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-black/50 uppercase block">Email Address</span>
                  <span className="font-bold text-xs sm:text-sm tracking-tight break-all">fahimfahim27122003@gmail.com</span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-2 bg-black text-[#fff6ee] hover:bg-[#e3170a] rounded transition-colors cursor-pointer shrink-0 ml-2"
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-white border border-black/20 rounded flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#e3170a] shrink-0" />
                  <div>
                    <span className="text-[9px] text-black/50 uppercase block">Phone / WhatsApp</span>
                    <a href="tel:+8801630989302" className="font-bold hover:underline">+8801630989302</a>
                  </div>
                </div>
                <div className="p-2.5 bg-white border border-black/20 rounded flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#e3170a] shrink-0" />
                  <div>
                    <span className="text-[9px] text-black/50 uppercase block">Location</span>
                    <span className="font-bold">Jhenidah, Dhaka, BD</span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://linkedin.com/in/fa-him-7b563224a"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white border border-black/30 rounded flex items-center justify-center gap-1.5 font-bold hover:border-black hover:bg-black/5 transition-all text-black"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <a
                  href="https://github.com/Starks666"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white border border-black/30 rounded flex items-center justify-center gap-1.5 font-bold hover:border-black hover:bg-black/5 transition-all text-black"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>

              <button
                onClick={() => {
                  window.location.href = 'mailto:fahimfahim27122003@gmail.com?subject=Project%20or%20Job%20Inquiry%20for%20Ashiq%20Billah%20Fahim';
                }}
                className="w-full py-3 bg-[#0d0d0d] text-[#fff6ee] rounded-md font-bold uppercase tracking-wider hover:bg-[#e3170a] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Send Direct Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV / RESUME DRAWER */}
      {activeModal === 'cv' && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        >
          <div className="relative w-full max-w-3xl bg-[#f3f1ec] text-[#0d0d0d] rounded-xl shadow-2xl p-5 sm:p-8 border-2 border-black max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
            
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-4 mb-5 gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#e3170a] font-bold tracking-widest block uppercase">
                  CIVIL ENGINEERING · AUTOCAD 2D/3D · 3D MODELING
                </span>
                <h2 className="font-archivo text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  Ashiq Billah Fahim
                </h2>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    soundFX.current.playClick(1.2);
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-[#fff6ee] rounded hover:bg-[#e3170a] transition-colors text-xs font-mono font-bold uppercase cursor-pointer"
                  title="Print or Save CV as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button 
                  onClick={handleCloseModal} 
                  className="p-1 hover:bg-black/10 rounded-full cursor-pointer"
                  {...attachCursor('CLOSE')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Contact Header Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-white border border-black/20 rounded-md text-[11px] font-mono mb-5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#e3170a] shrink-0" />
                <a href="mailto:fahimfahim27122003@gmail.com" className="truncate hover:underline" title="fahimfahim27122003@gmail.com">
                  fahimfahim27122003@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#e3170a] shrink-0" />
                <a href="tel:+8801630989302" className="hover:underline font-bold">
                  +8801630989302
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#e3170a] shrink-0" />
                <span>Jhenidah, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#e3170a] shrink-0" />
                <span>DOB: 27/12/2003</span>
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                <a href="https://linkedin.com/in/fa-him-7b563224a" target="_blank" rel="noreferrer" className="truncate hover:underline">
                  linkedin.com/in/fa-him
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-black shrink-0" />
                <a href="https://github.com/Starks666" target="_blank" rel="noreferrer" className="truncate hover:underline">
                  github.com/Starks666
                </a>
              </div>
            </div>

            <div className="space-y-6 font-mono text-xs">
              
              {/* Summary */}
              <div className="p-3.5 bg-black/5 border-l-3 border-[#e3170a] rounded-r">
                <h3 className="font-archivo text-xs font-black uppercase text-[#e3170a] mb-1">Professional Summary</h3>
                <p className="text-black/85 leading-relaxed text-[11px]">
                  Civil engineering professional with experience in engineering instruction and project operations, supported by AutoCAD 2D/3D, 3D modeling, and engineering project development training. Experienced in team coordination, technical communication, student preparation, and field project activities.
                </p>
              </div>

              {/* Professional Experience */}
              <div>
                <div className="flex items-center gap-2 border-b border-black/20 pb-1.5 mb-3">
                  <Briefcase className="w-4 h-4 text-[#e3170a]" />
                  <h3 className="font-archivo text-sm font-black uppercase text-black">Professional Experience</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Role 1 */}
                  <div className="p-3.5 bg-white border border-black/15 rounded-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div>
                        <span className="font-archivo font-bold text-sm text-black">Genex Infosys Limited</span>
                        <span className="text-black/60 mx-1.5">·</span>
                        <span className="font-bold text-[#e3170a]">Call Center Executive</span>
                      </div>
                      <span className="text-[10px] font-bold text-black/70 bg-black/5 px-2 py-0.5 rounded">
                        01/2026 – 06/2026 | Dhaka, Bangladesh
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-black/80">
                      <li>Made outbound calls to customers in the USA for an active roofing and Solar campaign.</li>
                      <li>Worked toward high sales targets, campaign goals, and quality assurance benchmarks.</li>
                      <li>Led a team and supported overall team communication and performance.</li>
                      <li>Managed cross-time-zone communication and time effectively in a fast-paced work environment.</li>
                    </ul>
                  </div>

                  {/* Role 2 */}
                  <div className="p-3.5 bg-white border border-black/15 rounded-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div>
                        <span className="font-archivo font-bold text-sm text-black">Asia Pacific Communications LTD</span>
                        <span className="text-black/60 mx-1.5">·</span>
                        <span className="font-bold text-[#e3170a]">Network Engineer</span>
                      </div>
                      <span className="text-[10px] font-bold text-black/70 bg-black/5 px-2 py-0.5 rounded">
                        01/2025 – 12/2025 | Puthia, Rajshahi, BD
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-black/80">
                      <li>Led an operations team for the EDC project across Puthia and Baghmara, Rajshahi.</li>
                      <li>Coordinated field project operations, preventive care, and maintenance to keep project activities running smoothly.</li>
                      <li>Successfully led teams to install and commission WiFi connectivity at government schools, colleges, hospitals, and public institutions.</li>
                      <li>Applied rigorous teamwork, coordination, and time management to support rapid on-time project completion.</li>
                    </ul>
                  </div>

                  {/* Role 3 */}
                  <div className="p-3.5 bg-white border border-black/15 rounded-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div>
                        <span className="font-archivo font-bold text-sm text-black">Novel Polytechnic Institute</span>
                        <span className="text-black/60 mx-1.5">·</span>
                        <span className="font-bold text-[#e3170a]">Civil Instructor</span>
                      </div>
                      <span className="text-[10px] font-bold text-black/70 bg-black/5 px-2 py-0.5 rounded">
                        01/2024 – 12/2024 | Jhenidah, Dhaka, BD
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-black/80">
                      <li>Taught civil engineering courses to students enrolled in the Diploma in Civil Engineering program.</li>
                      <li>Supported continuous instructional improvement and guided students through practical drafting techniques.</li>
                      <li>Prepared students thoroughly for academic examinations and board assessments.</li>
                      <li>Applied real-world civil-engineering principles and structural drafting in an instructional setting.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center gap-2 border-b border-black/20 pb-1.5 mb-3">
                  <GraduationCap className="w-4 h-4 text-[#e3170a]" />
                  <h3 className="font-archivo text-sm font-black uppercase text-black">Education</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-black/15 rounded-md">
                    <span className="text-[10px] text-[#e3170a] font-bold block">07/2019 – 12/2023</span>
                    <h4 className="font-archivo text-sm font-bold uppercase text-black">Civil Engineering</h4>
                    <span className="text-[11px] text-black/80 font-medium block">Jhenidah Polytechnic Institute</span>
                    <span className="text-[10px] text-black/50">Jhenidah, Dhaka, Bangladesh</span>
                  </div>

                  <div className="p-3 bg-white border border-black/15 rounded-md">
                    <span className="text-[10px] text-[#e3170a] font-bold block">01/2016 – 05/2018</span>
                    <h4 className="font-archivo text-sm font-bold uppercase text-black">Secondary School Certificate (SSC)</h4>
                    <span className="text-[11px] text-black/80 font-medium block">Jhenidah Govt. Boys School</span>
                    <span className="text-[10px] text-black/50">Jhenidah, Dhaka, Bangladesh</span>
                  </div>
                </div>
              </div>

              {/* Skills & Courses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Skills & Training */}
                <div>
                  <div className="flex items-center gap-2 border-b border-black/20 pb-1.5 mb-2.5">
                    <Award className="w-4 h-4 text-[#e3170a]" />
                    <h3 className="font-archivo text-sm font-black uppercase text-black">Key Skills & Training</h3>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-white border border-black/15 rounded">
                      <span className="font-bold block text-black">AutoCAD 2D / 3D Modeling</span>
                      <span className="text-black/60">Rashid Engineering & Architecture LTD (2023)</span>
                    </div>
                    <div className="p-2.5 bg-white border border-black/15 rounded">
                      <span className="font-bold block text-black">Industrial Attachment</span>
                      <span className="text-black/60">Engineering Project Development (2023)</span>
                    </div>
                    <div className="p-2.5 bg-white border border-black/15 rounded">
                      <span className="font-bold block text-black">Computer Operator</span>
                      <span className="text-black/60">Multimedia Training Academy (2024)</span>
                    </div>
                    <div className="p-2.5 bg-white border border-black/15 rounded">
                      <span className="font-bold block text-black">English Proficiency: IELTS</span>
                      <span className="text-black/60">IDP Jessore (2024)</span>
                    </div>
                  </div>
                </div>

                {/* Courses & Certifications */}
                <div>
                  <div className="flex items-center gap-2 border-b border-black/20 pb-1.5 mb-2.5">
                    <Terminal className="w-4 h-4 text-[#e3170a]" />
                    <h3 className="font-archivo text-sm font-black uppercase text-black">Certified Courses</h3>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-white border border-black/15 rounded">
                      <div className="flex justify-between font-bold text-black">
                        <span>Computer Operator</span>
                        <span className="text-[#e3170a]">07/2024 – 12/2024</span>
                      </div>
                      <span className="text-black/60">Multimedia Training Academy · Offline in-person</span>
                    </div>
                    <div className="p-2.5 bg-white border border-black/15 rounded">
                      <div className="flex justify-between font-bold text-black">
                        <span>AutoCAD 2D/3D</span>
                        <span className="text-[#e3170a]">07/2023 – 12/2023</span>
                      </div>
                      <span className="text-black/60">Rashid Engineering & Architecture LTD · Online</span>
                    </div>
                    <div className="p-2.5 bg-white border border-black/15 rounded">
                      <div className="flex justify-between font-bold text-black">
                        <span>NSDA Driving Level 3</span>
                        <span className="text-[#e3170a]">08/2025 – 11/2025</span>
                      </div>
                      <span className="text-black/60">Technical Training Center, Jhenidah</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Languages & Organisations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Languages */}
                <div className="p-3 bg-white border border-black/15 rounded-md">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Globe className="w-3.5 h-3.5 text-[#e3170a]" />
                    <h4 className="font-archivo text-xs font-bold uppercase text-black">Languages</h4>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <div>
                      <span className="font-bold block">Bangla</span>
                      <span className="text-black/60">Native</span>
                    </div>
                    <div>
                      <span className="font-bold block">English</span>
                      <span className="text-black/60">IELTS / Professional</span>
                    </div>
                  </div>
                </div>

                {/* Organisations */}
                <div className="p-3 bg-white border border-black/15 rounded-md">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-[#e3170a]" />
                    <h4 className="font-archivo text-xs font-bold uppercase text-black">Organisations</h4>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="font-bold">Social Micro Finance</span>
                      <span className="text-black/60"> — International Trader (01/2025 – 07/2025)</span>
                    </div>
                    <div>
                      <span className="font-bold">Jhenidah Red Crescent</span>
                      <span className="text-black/60"> — Member (01/2025)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* References */}
              <div>
                <div className="flex items-center gap-2 border-b border-black/20 pb-1.5 mb-3">
                  <UserCheck className="w-4 h-4 text-[#e3170a]" />
                  <h3 className="font-archivo text-sm font-black uppercase text-black">References</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-white border border-black/15 rounded text-[10px]">
                    <span className="font-bold block text-black">Engr. MD. Mizanur Rahman</span>
                    <span className="text-black/70 block">Principal</span>
                    <span className="text-black/50">Jhenidah Polytechnic Institute</span>
                  </div>
                  <div className="p-2.5 bg-white border border-black/15 rounded text-[10px]">
                    <span className="font-bold block text-black">Md. Ershad Ali</span>
                    <span className="text-black/70 block">Area Manager</span>
                    <span className="text-black/50 block">ICC Communications LTD</span>
                    <span className="font-mono text-[#e3170a] font-bold block mt-1">+8801322907141</span>
                  </div>
                  <div className="p-2.5 bg-white border border-black/15 rounded text-[10px]">
                    <span className="font-bold block text-black">Nazmul Alam Rigan</span>
                    <span className="text-black/70 block">Owner</span>
                    <span className="text-black/50 block">Multimedia Training Academy</span>
                    <span className="font-mono text-[#e3170a] font-bold block mt-1">01717171166</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global Slide-Up Keyframes Style */}
      <style>{`
        @keyframes navSlideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        @keyframes railSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(110%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(-80%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        @keyframes fall {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(240%);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, main, svg {
            display: none !important;
          }
          .fixed.inset-0 {
            position: static !important;
            background: #ffffff !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
