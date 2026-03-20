import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Pyramid from './components/Pyramid';
import ProgressBar from './components/ProgressBar';
import { QUESTIONS, FREQUENCY_LEVELS, DIMENSION_LABELS, DIMENSION_DEFINITIONS } from './data';
import { AnalysisResult, DimensionResult, FrequencyLevel } from './types';
import { generateSoulAnalysis } from './services/geminiService';

// Application States
enum AppState {
  LANDING,
  ACCESS,
  QUIZ,
  ANALYZING,
  RESULT
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  
  // User Data
  const [userName, setUserName] = useState('');
  
  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]); // Array of selected option indices
  // Removed accumulatedDimensions and totalRawScore from state to allow dynamic recalculation

  // Result State
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // --- Handlers ---

  const handleStart = () => setAppState(AppState.ACCESS);

  const handleRestart = () => {
    setAppState(AppState.LANDING);
    setUserName('');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setAppState(AppState.QUIZ);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    // Immutable update of answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);

    // Navigate or Finish
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      // Small delay for visual feedback of selection before moving
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 200);
    } else {
      // Finished
      finishQuiz(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Helper for fallback descriptions
  const getFallbackDescription = (score: number) => {
    if (score >= 400) return "能量极佳，在此领域您拥有卓越的掌控力和天赋，请继续保持并引领他人。";
    if (score >= 300) return "状态良好，您能从容应对相关挑战，保持平衡即可稳步上升。";
    if (score >= 200) return "存在波动，某些潜在的限制性信念可能正在阻碍您的发挥，建议多加觉察。";
    return "能量较低，这可能是您目前的卡点所在，也是成长的最大机会，请给予自己更多耐心和疗愈。";
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    setAppState(AppState.ANALYZING);

    // 1. Calculate Scores on the fly based on finalAnswers
    let calculatedTotalScore = 0;
    const calculatedDims: Record<string, number> = {};

    finalAnswers.forEach((optIdx, qIdx) => {
        const question = QUESTIONS[qIdx];
        // Ensure the answer exists (in case of weird state, though strictly typed)
        if (question && question.options[optIdx]) {
            const selectedOption = question.options[optIdx];
            calculatedTotalScore += selectedOption.score;
            
            // Accumulate Dimensions
            Object.entries(selectedOption.dimensionScores).forEach(([key, val]) => {
                calculatedDims[key] = (calculatedDims[key] || 0) + val;
            });
        }
    });

    // 2. Determine Level
    const averageScore = calculatedTotalScore / QUESTIONS.length;
    
    let closestLevel = FREQUENCY_LEVELS[0];
    let minDiff = Infinity;
    
    FREQUENCY_LEVELS.forEach(lvl => {
      const diff = Math.abs(lvl.level - averageScore);
      if (diff < minDiff) {
        minDiff = diff;
        closestLevel = lvl;
      }
    });

    // 3. Normalize Dimensions
    const dimensionMaxScores: Record<string, number> = {};
    QUESTIONS.forEach(q => {
        const dimMaxInQ: Record<string, number> = {};
        q.options.forEach(opt => {
            Object.entries(opt.dimensionScores).forEach(([key, val]) => {
                dimMaxInQ[key] = Math.max(dimMaxInQ[key] || 0, val);
            });
        });
        Object.entries(dimMaxInQ).forEach(([key, val]) => {
            dimensionMaxScores[key] = (dimensionMaxScores[key] || 0) + val;
        });
    });

    const dimensionResults: DimensionResult[] = Object.keys(DIMENSION_LABELS).map(key => {
        const rawDimScore = calculatedDims[key] || 0;
        const maxScore = dimensionMaxScores[key] || 1; 
        
        const normalizedValue = Math.min(500, (rawDimScore / maxScore) * 500);

        return {
          key,
          label: DIMENSION_LABELS[key],
          value: normalizedValue,
          description: "" // Will be populated by AI or fallback
        };
    }).sort((a, b) => b.value - a.value); 

    // 4. AI Generation
    const aiData = await generateSoulAnalysis(closestLevel, dimensionResults);
    
    // Populate Dimension Descriptions
    dimensionResults.forEach(dim => {
        if (aiData?.dimensionInsights && aiData.dimensionInsights[dim.key]) {
            dim.description = aiData.dimensionInsights[dim.key];
        } else {
            dim.description = getFallbackDescription(dim.value);
        }
    });
    
    const defaultAnalysis = "成长的强劲引擎。您对新事物充满好奇，遇到困难首先想到的是“我能做什么”而不是“为什么是我”。这是一种非常积极、高效的能量，是世俗成就的坚实基础。您克服了内心的阻力，愿意承担责任并付诸行动。您是社会的建设者，通过行动来显化价值。";
    
    // Updated default advice to match the new "sharing" format (no labels)
    const defaultAdvice = `真正的进化并非仅仅是意识的向外扩张，而是将高频的认知锚定在低频的物质现实与身体感受中。

1. 设定“生理锚点”，每工作90分钟进行3分钟的深长呼吸，感受空气进入肺部的物理触感。
2. 每日记账并复盘：记录一笔具体支出，并思考该项支出带来的真实价值，增强与物质资源的联结。
3. 睡前进行“身体扫描”，从脚趾到头顶依次感知肌肉的张力，强制大脑从逻辑思维回归躯体感知。`;
    
    // Improved Fallback Logic
    const strongest = dimensionResults[0];
    const weakest = dimensionResults[dimensionResults.length - 1];
    
    const defaultStrongest = `您的核心优势是【${strongest.label}】（得分：${Math.round(strongest.value)}）。在我们的定义中，这代表了“${DIMENSION_DEFINITIONS[strongest.key]}”。您在这一领域表现出天然的直觉和掌控力，这意味着在日常生活中，您往往能更敏锐地捕捉到相关信息并做出正向反应。这是您与世界互动的最强支点。`;
    
    const defaultWeakest = `目前能量流失较明显的领域是【${weakest.label}】（得分：${Math.round(weakest.value)}）。这代表了“${DIMENSION_DEFINITIONS[weakest.key]}”。低分并不意味着能力不足，而往往反映了您在这一层面存在深层的限制性信念或无意识的抗拒。通过觉察这些信念，您可以释放被压抑的潜能。`;

    setResult({
      totalScore: averageScore,
      level: closestLevel,
      dimensions: dimensionResults,
      aiAnalysis: aiData?.analysis || defaultAnalysis,
      aiAdvice: aiData?.advice || defaultAdvice,
      strongestDimensionAnalysis: aiData?.strongestDimensionAnalysis || defaultStrongest,
      weakestDimensionAnalysis: aiData?.weakestDimensionAnalysis || defaultWeakest
    });

    setAppState(AppState.RESULT);
  };

  // --- Render Helpers ---

  const renderAnalysisText = (text: string | undefined, type: 'talent' | 'block') => {
    if (!text) return null;
    
    const labels = Object.values(DIMENSION_LABELS);
    let cleanText = text;
    
    labels.forEach(label => {
       cleanText = cleanText.replace(new RegExp(`['"‘“]${label}['"’”]?`, 'g'), label);
    });

    const regex = new RegExp(`(${labels.join('|')})`, 'g');
    const parts = cleanText.split(regex);

    const highlightClass = type === 'talent' 
        ? "bg-fuchsia-500/10 text-fuchsia-200 border-fuchsia-500/20" 
        : "bg-slate-500/10 text-slate-300 border-slate-500/20";

    return (
        <span>
            {parts.map((part, i) => {
                if (labels.includes(part)) {
                    return (
                        <span key={i} className={`inline-block px-1.5 mx-0.5 rounded text-xs font-bold border ${highlightClass}`}>
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </span>
    );
  };

  const getGlowColor = (colorClass: string) => {
    // Override standard colors for softer glow
    if (colorClass.includes('fuchsia') || colorClass.includes('purple') || colorClass.includes('pink')) return 'bg-pink-500';
    if (colorClass.includes('amber') || colorClass.includes('yellow')) return 'bg-amber-400';
    return 'bg-violet-400';
  };

  // --- Renderers ---

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-between h-full text-center p-6 md:justify-center md:p-8 animate-fadeIn relative z-10">
      
      {/* Top Branding Section */}
      <div className="flex flex-col items-center pt-4 md:pt-0">
        <div className="mb-2 uppercase tracking-[0.4em] text-purple-200/50 text-[10px] font-medium">Produced by</div>
        <div className="flex items-center justify-center mb-6 md:mb-12">
            <span className="text-2xl md:text-3xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 drop-shadow-[0_0_15px_rgba(244,114,182,0.4)]">觉醒实验室</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-serif mb-3 md:mb-6 text-white drop-shadow-xl tracking-wide">
            内在频率测试
        </h1>
        <h2 className="text-[10px] md:text-sm font-light tracking-[0.6em] text-purple-200/60 md:mb-16 border-b border-white/10 pb-4 px-8 md:px-12">
            INNER FREQUENCY TEST
        </h2>
      </div>

      {/* Main Start Button / Portal */}
      <div className="flex-grow flex items-center justify-center py-4">
          <div className="relative w-48 h-48 md:w-72 md:h-72 group cursor-pointer" onClick={handleStart}>
            <div className="absolute inset-0 border border-pink-400/20 rounded-full scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out"></div>
            <div className="absolute inset-0 border border-fuchsia-300/10 rounded-full scale-90 group-hover:scale-100 transition-transform duration-[1.5s] delay-100 ease-out"></div>
            
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-rose-500/10 rounded-full blur-3xl group-hover:opacity-100 transition-all duration-1000"></div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-[#2E1065] to-[#4C0519] shadow-[0_0_40px_rgba(236,72,153,0.3)] flex items-center justify-center group-hover:shadow-[0_0_80px_rgba(236,72,153,0.6)] transition-all duration-500 border border-white/10">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[0.5px] border-white/10 flex items-center justify-center relative backdrop-blur-sm">
                        <span className="font-serif text-xl md:text-2xl text-pink-50 tracking-widest group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">开启</span>
                        <div className="absolute w-full h-full rounded-full border-t border-pink-300/30 animate-spin-slow"></div>
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Footer Text */}
      <div className="pb-4 md:pb-0">
          <p className="text-purple-200/80 mb-1 font-light text-base md:text-lg">生命不是一场向外的追逐</p>
          <p className="text-white text-lg md:text-xl font-normal mb-6 md:mb-10 tracking-wide drop-shadow-md">而是一场向内的回归</p>

          <p className="text-[10px] md:text-xs text-purple-300/40 mb-4 md:mb-12 tracking-wider">基于原创频率模型 · 20道心灵问答 · 深度觉察状态</p>

          <div className="mt-2 text-[9px] text-purple-400/30 tracking-[0.2em]">© 2026 AWAKENING LAB</div>
      </div>
    </div>
  );

  const renderAccess = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 w-full max-w-md mx-auto animate-fadeIn relative z-10">
      <div className="text-xl md:text-2xl font-serif tracking-widest text-purple-100 mb-2">觉醒实验室</div>
      <div className="text-[9px] md:text-[10px] tracking-[0.4em] text-purple-300/50 mb-8 md:mb-12">AWAKENING LAB</div>

      <div className="relative w-24 h-24 md:w-36 md:h-36 mb-8 md:mb-10 flex items-center justify-center group">
        <div className="absolute inset-0 rounded-full border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.2)] animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 rounded-full border border-violet-400/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="w-20 h-20 md:w-28 md:h-28 bg-[#2e1065] rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center border border-white/10">
           <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500/10 to-transparent opacity-60"></div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-serif font-light text-white mb-2">专属通道</h2>
      <p className="text-purple-300/60 tracking-[0.3em] text-[10px] md:text-xs mb-8 md:mb-12">ACCESS VERIFICATION</p>

      <form onSubmit={handleAccessSubmit} className="w-full space-y-4 md:space-y-6">
        <input 
          type="text" 
          placeholder="请输入手机号 (绑定身份)" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full bg-[#1e1b4b]/40 border border-purple-500/20 rounded-full py-3 px-5 md:py-4 md:px-6 text-base text-center text-white placeholder-purple-300/30 focus:outline-none focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/20 transition-all backdrop-blur-md"
        />
        
        <button 
          type="submit"
          disabled={!userName}
          className="w-full py-3 md:py-4 bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-600 hover:to-purple-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-sm md:text-base font-medium tracking-widest rounded-full transition-all shadow-[0_4px_20px_rgba(192,38,211,0.3)] mt-6 md:mt-8"
        >
          立即开启
        </button>
      </form>
    </div>
  );

  const renderQuiz = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
    const currentAnswer = answers[currentQuestionIndex];

    return (
      <div className="flex flex-col h-full p-5 md:p-12 animate-fadeIn w-full relative z-10">
        {/* Header - More Compact on Mobile */}
        <div className="flex justify-between items-end border-b border-white/5 pb-3 mb-4 md:pb-4 md:mb-8 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
             <span className="text-xl md:text-2xl text-pink-300/50 font-serif">✦</span>
             <div>
                <h3 className="text-base md:text-lg font-serif text-white">内在频率测试</h3>
                <span className="text-[9px] md:text-[10px] tracking-widest text-purple-300/50 block">AWAKENING LAB</span>
             </div>
          </div>
          <div className="bg-white/5 border border-white/10 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-pink-200/80 font-mono text-[10px] md:text-xs">
            {String(currentQuestionIndex + 1).padStart(2, '0')} / {QUESTIONS.length}
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-[2px] bg-white/5 rounded-full mb-6 md:mb-12 shrink-0">
            <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(232,121,249,0.5)]" style={{width: `${progress}%`}}></div>
        </div>

        {/* Question - Flexible Height */}
        <div className="mb-6 flex-grow flex items-center md:mb-12 min-h-[60px]">
          <h2 className="text-lg md:text-2xl leading-relaxed font-light text-white flex items-start">
            <span className="font-serif text-xl md:text-3xl mr-2 md:mr-3 text-fuchsia-300/40 opacity-60 shrink-0 mt-0.5 md:mt-0">{currentQuestionIndex + 1}.</span> 
            <span>{question.text}</span>
          </h2>
        </div>

        {/* Options - Compact Spacing */}
        <div className="space-y-2 md:space-y-4 shrink-0">
          {question.options.map((opt, idx) => {
            const isSelected = currentAnswer === idx;
            return (
                <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`
                    w-full text-left p-3.5 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 group backdrop-blur-sm
                    ${isSelected 
                        ? 'bg-fuchsia-900/40 border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.2)]' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-pink-300/30'}
                `}
                >
                <span className={`text-sm md:text-lg font-light transition-colors leading-tight ${isSelected ? 'text-pink-50 font-normal' : 'text-slate-300 group-hover:text-white'}`}>
                    {opt.label}
                </span>
                </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-auto md:mt-8 pt-4 md:pt-0 h-10 shrink-0">
             <button 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`
                    px-4 py-1.5 md:px-5 md:py-2 rounded-full border text-xs md:text-sm transition-all flex items-center gap-2
                    ${currentQuestionIndex === 0 
                        ? 'border-transparent text-transparent cursor-default' 
                        : 'border-white/10 text-purple-300/60 hover:text-white hover:bg-white/5 hover:border-pink-300/30 cursor-pointer'}
                `}
             >
                <span>←</span> <span className="hidden md:inline">返回上一题</span><span className="md:hidden">返回</span>
             </button>
        </div>
      </div>
    );
  };

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fadeIn relative z-10">
        <div className="relative w-40 h-40 mb-10">
            <div className="absolute inset-0 border-[1px] border-pink-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-4 border-[1px] border-purple-500/30 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.9)] animate-pulse"></div>
            </div>
        </div>
        <h2 className="text-3xl font-serif text-white mb-3 tracking-wide">能量场分析中</h2>
        <p className="text-pink-300/40 text-xs tracking-[0.4em]">CALCULATING DIMENSIONS</p>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    const strongestDim = result.dimensions[0];
    const weakestDim = result.dimensions[result.dimensions.length - 1];

    // Circular Gauge Calculations
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    // Map max reasonable level to circle. 700 is highest in data, let's use 800 as "full" for visual breathing room.
    const progress = Math.min(100, (result.level.level / 800) * 100); 
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar animate-fadeIn relative z-10 scroll-smooth">
        
        {/* New Circular Hero Header */}
        <div className="w-full flex flex-col items-center justify-center pt-8 pb-2 relative shrink-0 z-20">
             
             {/* Title Top */}
             <div className="flex flex-col items-center gap-1 mb-8 opacity-80">
                 <div className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-pink-200/10 flex items-center gap-2 shadow-lg">
                    <span className="text-pink-300 text-xs">◈</span>
                    <span className="text-pink-100 text-[10px] tracking-[0.25em] font-medium">AWAKENING LAB</span>
                 </div>
                 <h2 className="text-2xl font-serif text-white mt-4 tracking-wider">内在频率测试</h2>
                 <p className="text-[9px] tracking-[0.4em] text-pink-300/50 uppercase">Inner Frequency Analysis</p>
             </div>

             {/* Circular Gauge */}
             <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mb-4">
                
                {/* Background decorative glow behind circle */}
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${getGlowColor(result.level.color)}`}></div>

                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                   {/* Defs for gradients */}
                   <defs>
                     <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       {/* Soft Pink to Purple Gradient */}
                       <stop offset="0%" stopColor="#e879f9" stopOpacity="0.8" />
                       <stop offset="100%" stopColor="#f472b6" stopOpacity="1" />
                     </linearGradient>
                   </defs>
                   
                   {/* Track */}
                   <circle cx="100" cy="100" r={radius} fill="none" stroke="#2e1065" strokeWidth="12" />
                   
                   {/* Progress */}
                   <circle 
                      cx="100" 
                      cy="100" 
                      r={radius} 
                      fill="none" 
                      stroke="url(#gaugeGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out" 
                      style={{ filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.5))' }}
                   />
                </svg>

                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                   <span className="text-6xl font-light text-white tracking-tighter drop-shadow-lg font-sans">
                     {result.level.level}
                   </span>
                   <span className="text-[9px] tracking-[0.3em] text-pink-200/50 mt-1 font-sans uppercase">
                     Energy Hz
                   </span>
                </div>
             </div>

             {/* Result Title */}
             <h1 className={`text-5xl font-serif mb-3 ${result.level.color} drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center relative z-10 tracking-widest`}>
                {result.level.name}
             </h1>

             {/* Description / Tags Pill */}
             <div className="px-8 py-2.5 rounded-full border border-pink-500/30 bg-purple-900/20 backdrop-blur-md text-sm text-pink-100 tracking-[0.2em] shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                {result.level.description.replace(/，/g, ' · ')}
             </div>
        </div>

        <div className="px-6 md:px-10 pb-12 w-full max-w-3xl mx-auto">
            
            {/* Pyramid Section */}
            <section className="flex justify-center -mt-4 mb-4 relative w-full">
                 <div className="w-[85%] md:w-full max-w-lg scale-90 md:scale-100 origin-top">
                    <Pyramid currentLevel={result.level.level} levels={FREQUENCY_LEVELS} />
                 </div>
            </section>

            {/* Analysis Card */}
            <section className="bg-[#2E1065]/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group mb-8 shadow-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-30"></div>
                
                <h3 className="font-serif text-2xl text-white mb-6 flex items-center">
                    <span className="text-pink-300 mr-3 text-sm">✦</span> 灵魂解读
                </h3>
                <p className="text-lg leading-loose text-pink-50/90 font-light mb-8 text-justify">
                    {result.aiAnalysis}
                </p>
                
                <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/10">
                    <h4 className="font-serif text-pink-200 mb-3 text-sm tracking-wider flex items-center">
                        <span className="text-pink-400 mr-2">◈</span> 九歌学长进化指引
                    </h4>
                    <div className="text-purple-100/90 leading-7 text-sm whitespace-pre-wrap font-light">
                        {result.aiAdvice}
                    </div>
                </div>
            </section>

            {/* Radar/Dimensions Section */}
            <section className="space-y-8">
                
                {/* Chart Area */}
                <div className="bg-[#2E1065]/40 p-8 rounded-[2rem] border border-white/5 shadow-lg">
                   <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                        <span className="text-xl">📊</span>
                        <h3 className="text-xl font-serif text-white">能量维度</h3>
                        <span className="text-purple-300/40 text-xs tracking-wider ml-auto">DIMENSIONS</span>
                    </div>

                    <div className="space-y-5">
                        {result.dimensions.map((dim) => (
                            <ProgressBar 
                                key={dim.key}
                                label={dim.label}
                                value={dim.value}
                                max={500}
                                showValue={true}
                                color={dim.value > 400 ? 'bg-gradient-to-r from-fuchsia-400 to-pink-400' : dim.value > 250 ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400' : 'bg-slate-600'}
                            />
                        ))}
                    </div>
                </div>

                {/* Cards Stack (Vertical) */}
                <div className="flex flex-col gap-6">
                    {/* Core Talent Card */}
                    <div className="bg-gradient-to-br from-[#4C1D95]/30 to-[#831843]/30 border border-white/5 rounded-2xl p-6 hover:border-pink-400/30 transition-colors">
                        <h4 className="font-serif text-white mb-4 flex items-center text-lg border-b border-white/5 pb-2">
                            <span className="text-fuchsia-300 mr-2 text-xl">◈</span> 
                            天赋 · {strongestDim.label}
                        </h4>
                        <p className="text-pink-50/80 text-sm leading-7 text-justify">
                            {renderAnalysisText(result.strongestDimensionAnalysis, 'talent')}
                        </p>
                    </div>
                    
                    {/* Ascension Block Card */}
                    <div className="bg-gradient-to-br from-[#4C1D95]/30 to-[#831843]/30 border border-white/5 rounded-2xl p-6 hover:border-pink-400/30 transition-colors">
                        <h4 className="font-serif text-white mb-4 flex items-center text-lg border-b border-white/5 pb-2">
                             <span className="text-rose-300 mr-2 text-xl">◈</span> 
                             卡点 · {weakestDim.label}
                        </h4>
                        <p className="text-pink-50/80 text-sm leading-7 text-justify">
                             {renderAnalysisText(result.weakestDimensionAnalysis, 'block')}
                        </p>
                    </div>

                    {/* Comprehensive Dimension Perspective Section */}
                    <div className="mt-8 mb-4 animate-fadeIn delay-300">
                        <h3 className="font-serif text-white mb-5 flex items-center text-lg pl-1">
                            【综合维度透视】
                        </h3>
                        <div className="space-y-3">
                            {result.dimensions.map((dim) => (
                                <div key={dim.key} className="bg-white/5 backdrop-blur-md border border-white/5 rounded-xl p-4 shadow-sm hover:border-pink-500/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-pink-300 text-sm">❖</span>
                                        <span className="text-pink-300 font-bold tracking-wide text-sm">{dim.label}</span>
                                        <span className="text-pink-300/60 text-sm font-mono">({Math.round(dim.value)})</span>
                                    </div>
                                    <p className="text-slate-300/80 text-sm leading-relaxed text-justify">
                                        {dim.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Encouraging Footer Text */}
                <div className="pt-12 pb-8 text-center animate-fadeIn delay-500 opacity-70 hover:opacity-100 transition-opacity duration-700">
                    <p className="font-serif text-pink-100 text-lg tracking-[0.15em] mb-3 drop-shadow-[0_0_10px_rgba(244,114,182,0.4)]">
                        能量非天定，事在人为
                    </p>
                    <p className="font-serif text-pink-300/50 text-xs tracking-[0.3em] uppercase">
                        人生似旅程，得失皆缘
                    </p>
                </div>

                {/* Footer Action */}
                <div className="w-full flex justify-center mt-4">
                    <div 
                        onClick={handleRestart}
                        className="glass-panel rounded-full px-8 py-3 cursor-pointer hover:bg-fuchsia-900/40 transition-colors flex items-center gap-3 border border-pink-400/30 shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                    >
                         <span className="text-xs text-pink-100 tracking-widest font-serif">RESTART JOURNEY</span>
                         <span className="text-pink-300">↺</span>
                    </div>
                </div>

            </section>

        </div>
      </div>
    );
  };

  return (
    <Layout>
      {appState === AppState.LANDING && renderLanding()}
      {appState === AppState.ACCESS && renderAccess()}
      {appState === AppState.QUIZ && renderQuiz()}
      {appState === AppState.ANALYZING && renderAnalyzing()}
      {appState === AppState.RESULT && renderResult()}
    </Layout>
  );
};

export default App;
