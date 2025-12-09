
import React, { useState, useEffect } from 'react';
import { UserData, FortuneResult, AppStep } from './types';
import { analyzeFortune } from './services/geminiService';
import { BaguaLoader } from './components/BaguaLoader';
import { Stars } from './components/Stars';
import { ProductCard } from './components/ProductCard';

function App() {
  const [step, setStep] = useState<AppStep>('input'); // Start directly at input
  
  // Date selection state
  const [dobYear, setDobYear] = useState<string>('1990');
  const [dobMonth, setDobMonth] = useState<string>('01');
  const [dobDay, setDobDay] = useState<string>('01');

  const [userData, setUserData] = useState<UserData>({ name: '', dob: '', gender: 'male' });
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [viewMode, setViewMode] = useState<'year' | number>('year'); // 'year' or month number 1-12
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("App mounted");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct final DOB string
    const fullDob = `${dobYear}-${dobMonth}-${dobDay}`;
    const finalUserData = { ...userData, dob: fullDob };

    setStep('analyzing');
    setError(null);

    try {
      const fortune = await analyzeFortune(finalUserData);
      setResult(fortune);
      setStep('result');
      setViewMode('year'); // Default to overview
    } catch (err) {
      console.error(err);
      // Show detailed error message if available
      setError(err instanceof Error ? err.message : "Analysis failed. Please check your network connection.");
      setStep('input');
    }
  };

  // Generate Year, Month, Day options
  const years = Array.from({ length: 96 }, (_, i) => (2025 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const renderInput = () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-serif text-center text-mystic-gold mb-8 drop-shadow-lg">
        玄学 2026
      </h1>
      
      <div className="bg-mystic-bg border border-mystic-gold/30 rounded-xl p-6 md:p-8 shadow-2xl">
        {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm text-center break-words">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          
         

         
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">姓名 (Name)</label>
            <input 
              type="text" 
              name="name"
              required
              value={userData.name}
              onChange={handleInputChange}
              className="w-full bg-mystic-deep border border-mystic-accent rounded p-3 text-white focus:outline-none focus:border-mystic-gold text-lg placeholder-gray-600"
              placeholder="请输入您的名字"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">出生日期 (西历)</label>
            <div className="grid grid-cols-3 gap-2">
              <select 
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                className="bg-mystic-deep border border-mystic-accent rounded p-3 text-white focus:outline-none focus:border-mystic-gold appearance-none"
              >
                {years.map(y => <option key={y} value={y}>{y}年</option>)}
              </select>
              <select 
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                className="bg-mystic-deep border border-mystic-accent rounded p-3 text-white focus:outline-none focus:border-mystic-gold appearance-none"
              >
                {months.map(m => <option key={m} value={m}>{m}月</option>)}
              </select>
              <select 
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                className="bg-mystic-deep border border-mystic-accent rounded p-3 text-white focus:outline-none focus:border-mystic-gold appearance-none"
              >
                {days.map(d => <option key={d} value={d}>{d}日</option>)}
              </select>
            </div>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">性别</label>
              <select 
                name="gender"
                value={userData.gender}
                onChange={handleInputChange}
                className="w-full bg-mystic-deep border border-mystic-accent rounded p-3 text-white focus:outline-none focus:border-mystic-gold"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>

          <button 
            type="submit"
            disabled={!userData.name}
            className="w-full bg-gradient-to-r from-mystic-gold to-mystic-amber text-mystic-deep font-bold py-4 rounded-lg shadow-lg transform transition hover:scale-[1.02] hover:shadow-mystic-gold/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wider"
          >
            开始测算 2026 运程
          </button>
        </form>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;
    
    // Determine content to display based on viewMode
    let contentNode;

    if (viewMode === 'year') {
        contentNode = (
            <div className="animate-fade-in">
                <div className="bg-mystic-bg border-2 border-mystic-gold p-8 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-mystic-gold text-9xl font-serif pointer-events-none select-none">2026</div>
                    <h3 className="text-3xl font-serif text-mystic-gold mb-6 border-b border-mystic-accent pb-4">
                        2026 丙午马年 · 全年运程概况
                    </h3>
                    <div className="text-gray-100 leading-8 text-lg whitespace-pre-line font-light tracking-wide">
                        {result.overview}
                    </div>
                </div>
            </div>
        );
    } else {
        const monthData = result.monthly.find(m => m.month === viewMode);
        if (monthData) {
            // Split date range for display
            // Assumes format like "2月17日 - 3月18日" or similar with a separator
            const dateParts = monthData.solarDateRange.split(/[-–~至]/).map(s => s.trim());
            const startDate = dateParts[0] || '';
            const endDate = dateParts[1] || '';

            contentNode = (
                <div className="animate-fade-in">
                     <div className="bg-mystic-deep border border-mystic-accent rounded-xl p-8 relative overflow-hidden shadow-2xl">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-9xl text-white pointer-events-none select-none">{monthData.month}</div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-white/10 pb-4">
                                <div>
                                    <div className="flex items-start gap-4 mb-2">
                                      <h3 className="text-4xl font-serif text-white whitespace-nowrap">
                                          农历{monthData.month}月
                                      </h3>
                                      {/* Date Range Badge - Split into two lines */}
                                      <div className="text-xs text-mystic-gold/90 font-mono border border-mystic-gold/30 px-3 py-1 rounded bg-mystic-bg/80 flex flex-col items-center justify-center leading-tight min-w-[90px] text-center">
                                        <span className="block w-full">{startDate}</span>
                                        <div className="h-px w-full bg-mystic-gold/20 my-0.5"></div>
                                        <span className="block w-full">{endDate}</span>
                                      </div>
                                    </div>
                                    <span className="text-xl text-mystic-gold font-serif tracking-widest block mt-2">
                                        【{monthData.title}】
                                    </span>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <Stars score={monthData.score} />
                                </div>
                            </div>
                            <div className="text-gray-200 leading-8 text-lg font-light tracking-wide whitespace-pre-line">
                                {monthData.content}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        <div className="flex justify-between items-center mb-8">
            <button onClick={() => setStep('input')} className="text-mystic-gold text-sm hover:underline flex items-center gap-1">
                <span>←</span> 重测八字
            </button>
        </div>

        {/* Navigation: Year Selection */}
        <div className="mb-4">
            <div className="flex justify-center">
                <button 
                    onClick={() => setViewMode('year')}
                    className={`px-8 py-3 rounded-t-lg text-lg font-serif transition-all duration-300 w-full md:w-auto border-t-2 border-x-2 ${
                        viewMode === 'year' 
                        ? 'bg-mystic-gold text-mystic-deep border-mystic-gold font-bold shadow-[0_-4px_20px_rgba(255,215,0,0.3)]' 
                        : 'bg-mystic-deep text-gray-400 border-transparent hover:text-mystic-gold hover:bg-mystic-accent/30'
                    }`}
                >
                    2026 全年总运
                </button>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-mystic-gold to-transparent opacity-50"></div>
        </div>

        {/* Navigation: Month Selection Grid (Wrapped) */}
        <div className="mb-8 bg-mystic-deep/30 p-4 rounded-lg border border-white/5">
            <div className="flex flex-wrap justify-center gap-3">
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        className={`min-w-[5.5rem] h-16 px-2 rounded-lg flex flex-col items-center justify-center text-sm font-serif transition-all duration-200 border whitespace-nowrap ${
                            viewMode === m 
                            ? 'bg-mystic-gold text-mystic-deep border-mystic-gold font-bold scale-105 shadow-lg' 
                            : 'bg-mystic-deep text-gray-400 border-mystic-accent hover:border-mystic-gold hover:text-white'
                        }`}
                    >
                        <span className="text-[10px] opacity-60">农历</span>
                        <span className="text-lg leading-none">{m}月</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="min-h-[300px] mb-16">
            {contentNode}
        </div>

        {/* Lucky Products Section */}
        <div className="border-t border-mystic-accent/30 pt-12">
            <h3 className="text-2xl font-serif text-center text-mystic-gold mb-10 flex items-center justify-center">
            <span className="h-px w-12 bg-mystic-gold mx-4 opacity-50"></span>
            大师解运方法
            <span className="h-px w-12 bg-mystic-gold mx-4 opacity-50"></span>
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
            {result.products.map((product, idx) => (
                <ProductCard key={idx} product={product} />
            ))}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-mystic-deep text-mystic-text font-sans selection:bg-mystic-gold selection:text-black">
      {/* Header Decorative Line */}
      <div className="h-1 w-full bg-gradient-to-r from-mystic-deep via-mystic-gold to-mystic-deep"></div>
      
      <main className="">
        {step === 'input' && renderInput()}
        {step === 'analyzing' && <div className="min-h-[60vh] flex items-center justify-center"><BaguaLoader /></div>}
        {step === 'result' && renderResults()}
      </main>

      <footer className="py-8 text-center text-gray-500 text-xs border-t border-mystic-accent/10 mt-auto">
        <p>© 2026 Mystic Fortune | Powered by Gemini 2.5 | 僅供娛樂參考</p>
      </footer>
    </div>
  );
}

export default App;
