import React, { useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { RotateCcw, Settings, History as HistoryIcon, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TARGET_OPTIONS = [33, 99, 100, '∞'];

function App() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('tasbih_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem('tasbih_target');
    return saved ? (saved === '∞' ? '∞' : parseInt(saved, 10)) : 33;
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tasbih_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Save count & target to localStorage
  useEffect(() => {
    localStorage.setItem('tasbih_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbih_target', target.toString());
  }, [target]);

  // Handle increment
  const increment = useCallback(async () => {
    setCount(prev => {
      const next = prev + 1;

      // Haptic Feedback
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });

      // Alert if target reached
      if (typeof target === 'number' && next === target) {
        Haptics.vibrate().catch(() => { });
      }

      return next;
    });
  }, [target]);

  // Handle reset
  const resetCount = () => {
    // Log previous session if count > 0
    if (count > 0) {
      const newEntry = {
        id: Date.now(),
        count,
        date: new Date().toISOString(),
        target
      };
      const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
      setHistory(updatedHistory);
      localStorage.setItem('tasbih_history', JSON.stringify(updatedHistory));
    }
    setCount(0);
    setShowResetConfirm(false);
    Haptics.notification({ type: 'SUCCESS' }).catch(() => { });
  };

  return (
    <div className="flex flex-col h-screen bg-dhikr-deep text-dhikr-sand select-none touch-none">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pt-12">
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full active:bg-white/10 transition-colors"
        >
          <Settings size={24} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest opacity-50">Target / Sasaran</span>
          <span className="text-lg font-medium">{target}</span>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="p-2 rounded-full active:bg-white/10 transition-colors"
        >
          <HistoryIcon size={24} />
        </button>
      </header>

      {/* Main Tap Area */}
      <main
        className="flex-1 flex flex-col items-center justify-center tap-area px-8"
        onClick={increment}
      >
        <motion.div
          key={count}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-8xl font-bold tracking-tighter"
        >
          {count}
        </motion.div>

        <div className="mt-8 text-[10px] uppercase tracking-[0.3em] opacity-30 text-center">
          Ketuk di mana saja<br />
          Tap anywhere to count
        </div>

        {/* Visual Progress Ring Buffer (Conceptual) */}
        {typeof target === 'number' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - Math.min(count / target, 1))}
                className="transition-all duration-300 ease-out"
              />
            </svg>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="p-12 flex justify-center">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 active:bg-white/20 transition-all font-medium text-sm"
        >
          <RotateCcw size={16} />
          Reset / Atur Ulang
        </button>
      </footer>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-xs text-center"
            >
              <h3 className="text-xl font-semibold mb-2">Reset Count?</h3>
              <p className="text-dhikr-sand/60 mb-8 text-sm">Ini akan mengakhiri sesi saat ini dan menyimpannya ke riwayat / This will end your current session and save it to history.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-medium text-sm"
                >
                  Batal / Cancel
                </button>
                <button
                  onClick={resetCount}
                  className="flex-1 py-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-400 font-medium text-sm"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-dhikr-deep flex flex-col"
          >
            <header className="flex items-center p-6 pt-12 text-dhikr-sand">
              <button onClick={() => setShowSettings(false)} className="p-2 -ml-2"><X size={24} /></button>
              <h2 className="text-xl font-semibold ml-4">Settings / Pengaturan</h2>
            </header>

            <div className="flex-1 p-6 space-y-12">
              <section>
                <h3 className="text-xs uppercase tracking-widest opacity-50 mb-6">Pilih Target / Select Target</h3>
                <div className="grid grid-cols-2 gap-4">
                  {TARGET_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setTarget(opt);
                        setShowSettings(false);
                        Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
                      }}
                      className={`py-6 rounded-3xl border transition-all text-xl font-medium ${target === opt
                          ? 'bg-white text-dhikr-deep border-white'
                          : 'bg-white/5 border-white/10 text-dhikr-sand'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-dhikr-deep flex flex-col"
          >
            <header className="flex items-center p-6 pt-12 text-dhikr-sand">
              <button onClick={() => setShowHistory(false)} className="p-2 -ml-2"><X size={24} /></button>
              <h2 className="text-xl font-semibold ml-4">History / Riwayat</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center text-dhikr-sand">
                  <HistoryIcon size={48} className="mb-4" />
                  <p className="text-sm">Belum ada riwayat.<br />No history yet.<br /><span className="text-xs opacity-50">Sesi disimpan saat Anda menekan Reset.</span></p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex justify-between items-center text-dhikr-sand">
                    <div>
                      <div className="text-2xl font-bold">{item.count}</div>
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] uppercase font-bold tracking-widest">
                      Target {item.target}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
