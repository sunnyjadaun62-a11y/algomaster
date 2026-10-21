import React, { useState } from 'react';
import {
  GraduationCap,
  Layers,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Info,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

interface ChartReadingAcademyProps {
  onToggleEma9?: (val: boolean) => void;
  onToggleEma21?: (val: boolean) => void;
  onToggleSmc?: (val: boolean) => void;
}

export const ChartReadingAcademy: React.FC<ChartReadingAcademyProps> = () => {
  const [activeLesson, setActiveLesson] = useState<
    'ema' | 'orderblock' | 'liquidity' | 'choch' | 'fvg' | 'candlestick'
  >('ema');
  const [showHinglish, setShowHinglish] = useState(true);

  const lessons = [
    {
      id: 'ema',
      name: 'EMA 9 & EMA 21 Ribbon',
      badge: 'Trend & Momentum',
      color: 'sky',
    },
    {
      id: 'orderblock',
      name: 'Order Block (OB)',
      badge: 'Smart Money Buy/Sell Zone',
      color: 'emerald',
    },
    {
      id: 'liquidity',
      name: 'Liquidity Sweep (Stop Hunt)',
      badge: 'Retail Trap Warning',
      color: 'rose',
    },
    {
      id: 'choch',
      name: 'CHoCH (Change of Character)',
      badge: 'Trend Reversal Signal',
      color: 'purple',
    },
    {
      id: 'fvg',
      name: 'Fair Value Gap (FVG)',
      badge: 'Imbalance Magnet',
      color: 'amber',
    },
    {
      id: 'candlestick',
      name: 'Wick vs Body Reading',
      badge: 'Price Action Foundation',
      color: 'teal',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-slate-900 text-lg">
                Beginner Chart Reading Academy & Smart Money Concepts (SMC)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                ZERO JARGON • VISUAL LEARNING
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chart ko blank screen ki tarah dekhna band karein. Seekhein EMA aur Institutional footprints ko kaise read kiya jata hai.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHinglish(!showHinglish)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <span>🇮🇳 Hinglish Explanation:</span>
          <span className="font-bold text-indigo-600">{showHinglish ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Lesson Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => setActiveLesson(lesson.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeLesson === lesson.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>{lesson.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeLesson === lesson.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {lesson.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Lesson Detailed Content Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        {/* LESSON 1: EMA 9 & 21 */}
        {activeLesson === 'ema' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>EMA 9 (Sky Blue) & EMA 21 (Amber Orange): Chart Ka Compass</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">Fast vs Slow Moving Averages</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  What is it & Why do we use it?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  <strong>EMA 9</strong> (Fast Average) pichle 9 candles ke price ko heavy weight deta hai. <strong>EMA 21</strong> (Slow Average) pichle 21 candles ka base trend dikhata hai.
                </p>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  <li><strong>Golden Cross (Bullish):</strong> Jab Blue line (EMA 9) Orange line (EMA 21) ke upar cut karti hai &rarr; Aggressive Buyers are in control.</li>
                  <li><strong>Death Cross (Bearish):</strong> Jab Blue line Orange line ke neeche cut karti hai &rarr; Aggressive Sellers are in control.</li>
                  <li><strong>Tangled (Sideways):</strong> Dono lines ek doosre me chipki hui hain &rarr; Market chop hai, trade mat lo!</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Live Chart Par Kaise Dekhein?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Chart par dekho: Blue line price ke kitne paas hai. Agar price Blue line se bohot door bhaag gayi hai to use 'Overextended' kehte hain — price wapas rubber-band ki tarah EMA ko touch karne aati hai (Mean Reversion).
                </p>
                {showHinglish && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-indigo-950 font-medium leading-relaxed">
                    🇮🇳 <strong>Aasan Rule:</strong> Blue line upar hai to sirf BUY socho, Blue line neeche hai to sirf SELL socho. Agar dono lines aapas me twisted hain to screen band karke chai piyo!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LESSON 2: ORDER BLOCK */}
        {activeLesson === 'orderblock' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Order Block (OB): Big Banks & Institutions Ke Footprints</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">Smart Money Concept</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Order Block Kya Hota Hai?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Banks aur Hedge Funds ke paas $100 Million se zyada ka capital hota hai. Wo market price par ek click me buy nahi kar sakte kyunki price achanak blast ho jayegi (Slippage).
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Isliye wo ek specific candle me apne massive buy limit orders chor dete hain. Jab market wahan wapas aati hai to wo orders trigger hote hain aur market tezi se bounce karti hai!
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Chart Par Kaise Pehchanein?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Bullish Order Block:</strong> Ek bohot badi green expansion candle banne se theek pehle wali aakhri RED candle hi Order Block hoti hai! Humne chart par use green dotted box se mark kiya hai.
                </p>
                {showHinglish && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                    🇮🇳 <strong>Aasan Rule:</strong> Jab price dobara is green zone (Order Block) me dip karegi, to wahan se bounce aane ka 70-80% chance hota hai. Yahi exact point hota hai jahan bot entry lene ki tayyari karta hai!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LESSON 3: LIQUIDITY SWEEP */}
        {activeLesson === 'liquidity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-base">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Liquidity Sweep (Stop Hunt): Retail Traders Ka Trap</span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded">Retail Trap Alert</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Aapka Stop Loss Kyu Hit Hota Hai?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Kya aapke sath kabhi hua hai ki aapne BUY kiya, price ne aapka Stop Loss touch kiya, aur theek wahi se price rocket ban kar upar bhaag gayi?
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Isise <strong>Liquidity Sweep (Stop Hunt)</strong> kehte hain! Institutions ko badi quantity buy karne ke liye sellers ki zarurat hoti hai. Wo price ko retail support ke neeche wick mar kar retail ke stop-losses kha jate hain, fir market reverse hoti hai.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Bot Isse Kaise Bachta Hai?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Bot tab tak trade nahi leta jab tak Asian Range ya key swing high/low ki liquidity sweep na ho jaye!
                </p>
                {showHinglish && (
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-950 font-medium leading-relaxed">
                    🇮🇳 <strong>Aasan Rule:</strong> Support ya Resistance toot te hi andhadhun mat kudo! Intezar karo ki wick ban kar price wapas range ke andar close de — ye pakka saboot hota hai ki trap complete ho chuka hai.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LESSON 4: CHoCH (CHANGE OF CHARACTER) */}
        {activeLesson === 'choch' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-base">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span>Change of Character (CHoCH): Trend Badal Gaya Hai!</span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded">Structure Shift</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-600" />
                  CHoCH Kya Hai?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Market lower highs aur lower lows bana rahi thi (downtrend). Achanak ek candle ne previous swing high ko body ke sath tod diya! Is first structural break ko <strong>Change of Character (CHoCH)</strong> kehte hain.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-600" />
                  Trade Strategy
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  CHoCH bante hi direct buy nahi karna chahiye! CHoCH ke baad market retest karne aati hai apne Order Block par — wahan se high-probability trade banti hai.
                </p>
                {showHinglish && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-purple-950 font-medium leading-relaxed">
                    🇮🇳 <strong>Aasan Rule:</strong> CHoCH matlab car ne reverse gear laga diya hai! Ab purani direction bhool jao aur nayi direction ke retest ka intezar karo.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LESSON 5: FAIR VALUE GAP */}
        {activeLesson === 'fvg' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Fair Value Gap (FVG): Price Ka Chhuta Hua Magnet</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">Liquidity Imbalance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  FVG Kyu Banta Hai?
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Jab koi achanak badi news ya institutional buying aati hai, to 3 candles ke sequence me Candle 1 ke High aur Candle 3 ke Low ke beech ek empty space reh jati hai jahan koi opposite trade nahi hua.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  Magnet Ki Tarah Kaam Karta Hai
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Market efficient rehna chahti hai. Isliye price 90% times wapas us gap ko fill karne aati hai aur wahan se sharp reaction deti hai.
                </p>
                {showHinglish && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 font-medium leading-relaxed">
                    🇮🇳 <strong>Aasan Rule:</strong> FVG ek khule hue gaddhe (imbalance) ki tarah hai. Price use bharne aayegi, aur jaise hi bharegi, aap trade execute kar sakte hain.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LESSON 6: WICK VS BODY */}
        {activeLesson === 'candlestick' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-base">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                <span>Wick vs Body: Candle Ki Asli Bhasha Seekhein</span>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded">Price Action Core</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal-600" />
                  Body = Conviction (Taqat)
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Candle ki solid body ye dikhati hai ki buyers ya sellers me asli dum kitna tha. Badi green body = buyers are fully in control. Badi red body = sellers are in control.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-teal-600" />
                  Wick = Rejection (Inkaar)
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Lambi wick (shadow) ka matlab hai price wahan tak gayi to thi, lekin wahan baithe institutions ne use thappad mar ke wapas bhej diya!
                </p>
                {showHinglish && (
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-teal-950 font-medium leading-relaxed">
                    🇮🇳 <strong>Aasan Rule:</strong> Neeche lambi wick = buyers ne market ko girne se mana kar diya. Upar lambi wick = sellers ne market ko chadne se mana kar diya. Wick ko hamesha rejection samjho!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
