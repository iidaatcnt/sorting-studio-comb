'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Github,
  Info,
  Code2,
  Zap,
  Lightbulb,
  MoveHorizontal,
  Waves
} from 'lucide-react';

// --- Types ---
type SortState = 'compare' | 'swap' | 'gap_update' | 'init' | 'complete';

interface SortingStep {
  array: number[];
  indices: number[]; // Working indices i, i+gap
  gap: number;
  type: SortState;
  description: string;
  codeLine?: number;
}

// --- Constants ---
const ARRAY_SIZE = 14; // A bit more to show gap effect
const INITIAL_SPEED = 780;
const SHRINK_FACTOR = 1.3;

const CODE_PYTHON = [
  "def comb_sort(arr):",
  "    n = len(arr)",
  "    gap = n",
  "    swapped = True",
  "    while gap != 1 or swapped:",
  "        gap = int(gap / 1.3)",
  "        if gap < 1: gap = 1",
  "        swapped = False",
  "        for i in range(n - gap):",
  "            if arr[i] > arr[i + gap]:",
  "                arr[i], arr[i + gap] = arr[i + gap], arr[i]",
  "                swapped = True"
];

// --- Algorithm Logic ---
const generateSteps = (initialArray: number[]): SortingStep[] => {
  const steps: SortingStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  steps.push({
    array: [...arr],
    indices: [],
    gap: n,
    type: 'init',
    description: 'コムソートを開始します。バブルソートを大規模に改良した、効率的なソートです。',
    codeLine: 0
  });

  let gap = n;
  let swapped = true;

  while (gap !== 1 || swapped) {
    gap = Math.floor(gap / SHRINK_FACTOR);
    if (gap < 1) gap = 1;

    steps.push({
      array: [...arr],
      indices: [],
      gap: gap,
      type: 'gap_update',
      description: `ギャップを ${gap} に設定しました。この間隔で比較と入れ替えを行います。`,
      codeLine: 5
    });

    swapped = false;

    for (let i = 0; i < n - gap; i++) {
      steps.push({
        array: [...arr],
        indices: [i, i + gap],
        gap: gap,
        type: 'compare',
        description: `インデックス ${i} と ${i + gap} を比較します（間隔: ${gap}）。`,
        codeLine: 10
      });

      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        swapped = true;
        steps.push({
          array: [...arr],
          indices: [i, i + gap],
          gap: gap,
          type: 'swap',
          description: `大きい値を右側のグループへ移動させます。`,
          codeLine: 11
        });
      }
    }
  }

  steps.push({
    array: [...arr],
    indices: Array.from({ length: n }, (_, k) => k),
    gap: 1,
    type: 'complete',
    description: 'ギャップが1になり、すべての要素が正しく整列されました！',
    codeLine: 0
  });

  return steps;
};


// --- Main App ---
export default function CombSortStudio() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 80) + 15);
    const newSteps = generateSteps(newArray);
    setArray(newArray);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)), [steps.length]);
  const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1001 - speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep] || { array: [], indices: [], gap: 0, type: 'init', description: '' };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Waves className="text-slate-950 w-5 h-5" />
            </div>
            <h1 className="font-black italic tracking-tighter text-xl uppercase tracking-widest text-indigo-400">Comb_Sort_Studio</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] mono uppercase text-slate-500 font-black tracking-widest">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`} />
                {isPlaying ? 'Filtering' : 'Standby'}
              </div>
              <span className="opacity-20">|</span>
              <span>Gap Ratio: 1.3</span>
            </div>
            <a href="https://github.com/iidaatcnt/sorting-studio-comb" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          <div className="relative aspect-video lg:aspect-square max-h-[500px] bg-[#030712] rounded-[3rem] border border-white/5 p-16 flex items-end justify-center gap-2 overflow-hidden shadow-2xl">
            <div className="absolute top-8 left-12 flex items-center gap-3 mono text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] z-10">
              <MoveHorizontal size={14} className="text-indigo-400" />
              Adaptive Shrinkage // Comb Logic
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {step.array.map((val, idx) => {
                const isSelected = step.indices.includes(idx);

                let colorClass = "bg-slate-800/40";

                if (isSelected) {
                  if (step.type === 'compare') {
                    colorClass = "bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)]";
                  }
                  if (step.type === 'swap') {
                    colorClass = "bg-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]";
                  }
                }

                if (step.type === 'complete') {
                  colorClass = "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]";
                }

                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    style={{ height: `${val}%` }}
                    className={`flex-1 min-w-[15px] rounded-t-lg relative ${colorClass} transition-all duration-300`}
                  >
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 mono text-[9px] font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {val}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Gap Indication Arc */}
            {step.indices.length === 2 && (
              <div
                className="absolute bottom-10 h-0.5 border-t-2 border-dashed border-indigo-500/20 transition-all duration-500"
                style={{
                  left: `${(Math.min(...step.indices) / ARRAY_SIZE) * 100 + 3}%`,
                  width: `${(step.gap / ARRAY_SIZE) * 100 - 6}%`
                }}
              />
            )}

            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]" />
          </div>

          <div className="px-10 py-8 bg-slate-900/50 rounded-[2.5rem] border border-white/10 flex flex-col gap-8 shadow-inner">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex items-center gap-2">
                <button onClick={stepBackward} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"><StepBack size={20} /></button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center hover:bg-indigo-400 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
                >
                  {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                </button>
                <button onClick={stepForward} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"><StepForward size={20} /></button>
                <button onClick={reset} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400 ml-4"><RotateCcw size={20} /></button>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-between mono text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">
                  <span>Logic Speed</span>
                  <span className="text-indigo-400">{speed}ms</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input type="range" min="100" max="980" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="flex-1 appearance-none bg-slate-800 h-1.5 rounded-full accent-indigo-500 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-4">
              <div className="mt-1 p-2 bg-indigo-500/10 rounded-xl shrink-0">
                <Waves size={16} className="text-indigo-400" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Code & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="p-8 bg-zinc-900/80 border border-white/5 rounded-[3rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="text-amber-400 w-5 h-5" />
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Concept_Data</h2>
            </div>
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 mb-8">
              <h3 className="text-indigo-400 font-black mb-3 text-sm">Comb Sort</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                バブルソートを大規模に改良した手法。隣同士ではなく、最初は大きな間隔（ギャップ）で比較し、徐々にその間隔を縮めて（1.3で割る）ソートすることで、バブルソートの弱点を克服しています。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mono text-[9px] font-black uppercase tracking-tighter">
              <div className="p-4 bg-white/5 rounded-2xl text-center border border-white/5 hover:border-indigo-500/20 transition-colors">
                <span className="text-slate-600 block mb-1">Complexity</span>
                <span className="text-indigo-300">O(N log N) ~</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl text-center border border-white/5 hover:border-indigo-500/20 transition-colors">
                <span className="text-slate-600 block mb-1">Factor</span>
                <span className="text-white">1.3 (Shrink)</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-black border border-white/5 rounded-[3rem] flex-1 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-600 w-5 h-5" />
                <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-500">Exec_Kernel</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-indigo-500/50 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
            </div>

            <div className="flex-1 bg-zinc-950/30 p-8 rounded-3xl mono text-[10px] leading-loose overflow-auto border border-white/5 scrollbar-hide">
              {CODE_PYTHON.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-6 transition-all duration-300 ${step.codeLine === i ? 'text-indigo-400 bg-indigo-400/10 -mx-8 px-8 border-l-2 border-indigo-400 font-bold' : 'text-slate-800'}`}
                >
                  <span className="text-slate-900 tabular-nums w-4 select-none opacity-50">{i + 1}</span>
                  <pre className="whitespace-pre">{line}</pre>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center opacity-20">
              <span className="text-[8px] mono text-slate-500 uppercase tracking-[0.5em]">optimized_bubble_v3</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-16 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <Waves className="text-slate-900 w-8 h-8 opacity-20" />
          <p className="text-[8px] mono text-slate-700 uppercase tracking-[0.8em]">Interactive_Learning_Series // Informatics_I</p>
        </div>
      </footer>
    </div>
  );
}
