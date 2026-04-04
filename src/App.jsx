import React, { useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TARGET_OPTIONS = [33, 99, 100, '∞'];

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#00110f',
  surface:  '#011a18',
  gold:     '#e9c349',
  goldDark: '#b8921a',
  goldText: '#1a0f00',
  teal:     '#95d3ba',
  text:     '#e8f5f3',
};

// ── Shared Styles ─────────────────────────────────────────────────────────────
const ghostBtn = {
  background: 'rgba(255,255,255,0.055)',
  borderRadius: '20px',
  boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.06)',
};

const goldBtn = {
  background: `linear-gradient(150deg, ${C.gold} 0%, ${C.goldDark} 60%, #7a5800 100%)`,
  boxShadow:  '0 10px 30px rgba(233,195,73,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
};

function App() {
  const [count, setCount] = useState(() => {
    const s = localStorage.getItem('tasbih_count');
    return s ? parseInt(s, 10) : 0;
  });
  const [target, setTarget] = useState(() => {
    const s = localStorage.getItem('tasbih_target');
    return s ? (s === '∞' ? '∞' : parseInt(s, 10)) : 33;
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettings,     setShowSettings]     = useState(false);
  const [showHistory,      setShowHistory]      = useState(false);
  const [history, setHistory] = useState(() => {
    const s = localStorage.getItem('tasbih_history');
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => { localStorage.setItem('tasbih_count',   count.toString()); }, [count]);
  useEffect(() => { localStorage.setItem('tasbih_target', target.toString()); }, [target]);

  const increment = useCallback(() => {
    setCount(prev => {
      const next = prev + 1;
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      if (typeof target === 'number' && next === target)
        Haptics.vibrate().catch(() => {});
      return next;
    });
  }, [target]);

  const resetCount = () => {
    if (count > 0) {
      const entry = { id: Date.now(), count, date: new Date().toISOString(), target };
      const h = [entry, ...history].slice(0, 50);
      setHistory(h);
      localStorage.setItem('tasbih_history', JSON.stringify(h));
    }
    setCount(0);
    setShowResetConfirm(false);
    Haptics.notification({ type: 'SUCCESS' }).catch(() => {});
  };

  const progress     = typeof target === 'number' ? Math.min(count / target, 1) : 0;
  const R            = 46;
  const circumference = 2 * Math.PI * R;
  const pct          = typeof target === 'number' ? Math.round((count / target) * 100) : 0;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ background: C.bg, color: C.text, fontFamily: "'Manrope',sans-serif" }}
      className="h-[100dvh] w-full flex flex-col overflow-hidden select-none"
    >

      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <header className="flex-none flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
          className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform"
          style={{ color: C.teal }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu</span>
        </button>

        <h1 style={{ fontFamily: "'Noto Serif',serif", color: C.gold, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Tasbih <span style={{ color: C.teal, fontWeight: 300, fontStyle: 'italic' }}>Digi</span>
        </h1>

        <button
          onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
          className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform"
          style={{ color: C.teal }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>settings</span>
        </button>
      </header>

      {/* ══ MAIN COUNTER ══════════════════════════════════════════════════════ */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4"
        style={{ minHeight: 0 }}
        onClick={increment}
      >
        {/* Hint */}
        <p style={{ fontSize: 10, letterSpacing: '0.3em', color: C.teal, opacity: 0.45 }}
           className="uppercase mb-5">
          {count > 0 ? 'Ketuk untuk tambah' : 'Ketuk layar untuk mulai'}
        </p>

        {/* Ring + Number */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 'min(72vw, 260px)', height: 'min(72vw, 260px)' }}
        >
          <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle
              cx="50" cy="50" r={R} fill="none"
              stroke={C.gold} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ filter: 'drop-shadow(0 0 8px rgba(233,195,73,0.55))', transition: 'stroke-dashoffset 0.35s ease' }}
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center">
            <motion.span
              key={count}
              initial={{ scale: 0.82, opacity: 0.5 }}
              animate={{ scale: 1,    opacity: 1 }}
              transition={{ duration: 0.12 }}
              style={{
                fontFamily: "'Noto Serif',serif",
                fontSize: 'min(22vw, 84px)',
                fontWeight: 700,
                lineHeight: 1,
                color: C.gold,
                textShadow: '0 0 40px rgba(233,195,73,0.45)',
              }}
            >
              {count}
            </motion.span>
            <span style={{ fontSize: 11, color: C.teal, opacity: 0.55, marginTop: 6, letterSpacing: '0.1em' }}>
              dari {target}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '10px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: C.teal, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Target</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{target}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '10px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: C.teal, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Progres</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{pct}%</div>
          </div>
        </div>
      </main>

      {/* ══ ACTION BUTTONS ════════════════════════════════════════════════════ */}
      <section className="flex-none px-4 pb-5">
        <div className="grid grid-cols-3 gap-3 items-end max-w-sm mx-auto">

          {/* Ulangi */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowResetConfirm(true); }}
            className="flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ ...ghostBtn, height: 76 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.teal }}>refresh</span>
            <span style={{ fontSize: 9, letterSpacing: '0.2em', color: C.teal, opacity: 0.65, fontWeight: 700 }} className="uppercase">Ulangi</span>
          </button>

          {/* Simpan — hero button */}
          <button
            onClick={(e) => { e.stopPropagation(); Haptics.notification({ type: 'SUCCESS' }).catch(() => {}); }}
            className="flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ ...goldBtn, borderRadius: '26px', height: 96 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 26, color: C.goldText, fontVariationSettings: "'FILL' 1" }}>bookmark</span>
            <span style={{ fontSize: 10, letterSpacing: '0.2em', color: C.goldText, fontWeight: 800 }} className="uppercase">Simpan</span>
          </button>

          {/* Riwayat */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
            className="flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ ...ghostBtn, height: 76 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.teal }}>history</span>
            <span style={{ fontSize: 9, letterSpacing: '0.2em', color: C.teal, opacity: 0.65, fontWeight: 700 }} className="uppercase">Riwayat</span>
          </button>
        </div>
      </section>

      {/* ══ MODALS ════════════════════════════════════════════════════════════ */}

      {/* ── 1. Reset Confirm ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            key="reset-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
              background: 'rgba(0,8,7,0.92)',
              backdropFilter: 'blur(18px)',
            }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              key="reset-modal"
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1,    opacity: 1, y: 0 }}
              exit={{ scale: 0.88,    opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 300,
                background: C.surface,
                borderRadius: 32,
                padding: '32px 24px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(233,195,73,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: C.gold, lineHeight: 1 }}>restart_alt</span>
              </div>

              <h3 style={{ fontFamily: "'Noto Serif',serif", color: C.gold, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
                Mulai Baru?
              </h3>
              <p style={{ color: C.teal, opacity: 0.65, fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
                Hitungan akan disimpan otomatis ke riwayat zikir Anda.
              </p>

              <button
                onClick={resetCount}
                className="w-full py-4 mb-3 font-black text-sm tracking-widest uppercase active:scale-95 transition-transform"
                style={{ ...goldBtn, borderRadius: 18, color: C.goldText }}
              >
                Selesai & Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full py-3 text-xs tracking-widest uppercase active:scale-95 transition-transform"
                style={{ color: C.teal, opacity: 0.6, fontWeight: 600, background: 'none', border: 'none' }}
              >
                Batal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Settings ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            key="settings"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', inset: 0, zIndex: 8000, background: C.bg, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px' }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, flexShrink: 0 }}
                className="active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>
              <span style={{ marginLeft: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 13, color: C.gold }}>Pengaturan</span>
            </header>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 24px' }}>
              <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.teal, opacity: 0.45, marginBottom: 16 }}>Pilih Target Zikir</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {TARGET_OPTIONS.map(opt => {
                  const active = target === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => { setTarget(opt); setShowSettings(false); Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); }}
                      className="active:scale-95 transition-all"
                      style={{
                        padding: '20px 0',
                        borderRadius: 18,
                        fontSize: 22,
                        fontWeight: 700,
                        fontFamily: "'Noto Serif',serif",
                        ...(active
                          ? { ...goldBtn, color: C.goldText }
                          : { ...ghostBtn, color: C.text }),
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. History ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            key="history"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', inset: 0, zIndex: 8000, background: C.bg, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px' }}>
              <button
                onClick={() => setShowHistory(false)}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, flexShrink: 0 }}
                className="active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>
              <span style={{ marginLeft: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 13, color: C.gold }}>Riwayat Zikir</span>
            </header>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: C.teal, opacity: 0.35 }}>
                  <HistoryIcon size={40} />
                  <p style={{ fontSize: 14, textAlign: 'center' }}>Belum ada riwayat zikir.<br />Zikir dulu yuk! 🤲</p>
                </div>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: C.gold, fontFamily: "'Noto Serif',serif" }}>{item.count}</div>
                      <div style={{ fontSize: 10, color: C.teal, opacity: 0.5, marginTop: 3 }}>
                        {new Date(item.date).toLocaleDateString('id-ID')} · {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.gold, background: 'rgba(233,195,73,0.1)', padding: '5px 12px', borderRadius: 20 }}>
                      {item.target}x
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
