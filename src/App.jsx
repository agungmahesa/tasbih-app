import React, { useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'framer-motion';

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

const goldBtn = {
  background: `linear-gradient(150deg, ${C.gold} 0%, ${C.goldDark} 60%, #7a5800 100%)`,
  boxShadow:  '0 10px 30px rgba(233,195,73,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
};

const ghostBtn = {
  background: 'rgba(255,255,255,0.055)',
  borderRadius: '20px',
  boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.06)',
};

const TARGET_OPTIONS = [33, 99, 100, '∞'];

// ── 10 Dzikir Data ────────────────────────────────────────────────────────────
const DZIKIR_LIST = [
  {
    id: 1,
    name: 'Subhanallah',
    arabic: 'سُبْحَانَ اللّٰهِ',
    latin: 'Subḥānallāh',
    meaning: 'Maha Suci Allah',
    target: 33,
  },
  {
    id: 2,
    name: 'Alhamdulillah',
    arabic: 'اَلْحَمْدُ لِلّٰهِ',
    latin: 'Alḥamdulillāh',
    meaning: 'Segala puji bagi Allah',
    target: 33,
  },
  {
    id: 3,
    name: 'Allahu Akbar',
    arabic: 'اَللّٰهُ أَكْبَرُ',
    latin: 'Allāhu Akbar',
    meaning: 'Allah Maha Besar',
    target: 33,
  },
  {
    id: 4,
    name: 'Laa Ilaha Illallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    latin: 'Lā ilāha illallāh',
    meaning: 'Tiada Tuhan selain Allah',
    target: 100,
  },
  {
    id: 5,
    name: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    latin: 'Astaghfirullāh',
    meaning: 'Aku memohon ampunan kepada Allah',
    target: 100,
  },
  {
    id: 6,
    name: 'Hauqalah',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ',
    latin: 'Lā ḥawla wa lā quwwata illā billāh',
    meaning: 'Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah',
    target: 33,
  },
  {
    id: 7,
    name: 'Shalawat Ibrahimiyah',
    arabic: 'اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    latin: 'Allāhumma ṣalli ʿalā Muḥammad wa ʿalā āli Muḥammad',
    meaning: 'Ya Allah, limpahkanlah shalawat kepada Muhammad dan keluarga Muhammad',
    target: 33,
  },
  {
    id: 8,
    name: 'Tahlil Panjang',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    latin: 'Lā ilāha illallāhu waḥdahū lā syarīka lah',
    meaning: 'Tiada Tuhan selain Allah, Yang Maha Esa, tiada sekutu bagi-Nya',
    target: 33,
  },
  {
    id: 9,
    name: 'Basmalah',
    arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
    latin: 'Bismillāhir raḥmānir raḥīm',
    meaning: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang',
    target: 99,
  },
  {
    id: 10,
    name: 'Istirja\'',
    arabic: 'إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    latin: 'Innā lillāhi wa innā ilayhi rājiʿūn',
    meaning: 'Sesungguhnya kami milik Allah dan kepada-Nya kami kembali',
    target: 33,
  },
];

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [count, setCount] = useState(() => {
    const s = localStorage.getItem('tasbih_count');
    return s ? parseInt(s, 10) : 0;
  });
  const [target, setTarget] = useState(() => {
    const s = localStorage.getItem('tasbih_target');
    return s ? (s === '∞' ? '∞' : parseInt(s, 10)) : 33;
  });
  const [selectedDzikir, setSelectedDzikir] = useState(() => {
    const s = localStorage.getItem('tasbih_dzikir');
    return s ? JSON.parse(s) : DZIKIR_LIST[0];
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettings,     setShowSettings]     = useState(false);
  const [showDzikir,       setShowDzikir]       = useState(false);

  useEffect(() => { localStorage.setItem('tasbih_count',  count.toString()); }, [count]);
  useEffect(() => { localStorage.setItem('tasbih_target', target.toString()); }, [target]);
  useEffect(() => { localStorage.setItem('tasbih_dzikir', JSON.stringify(selectedDzikir)); }, [selectedDzikir]);

  const increment = useCallback(() => {
    setCount(prev => {
      const next = prev + 1;
      if (typeof target === 'number' && next === target) {
        // Triple Heavy pulse to signal target reached — clearly different from normal tap
        Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}), 120);
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}), 240);
      } else {
        // Normal dzikir tap — light crisp vibration
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
      return next;
    });
  }, [target]);

  const resetCount = () => {
    setCount(0);
    setShowResetConfirm(false);
    Haptics.notification({ type: 'SUCCESS' }).catch(() => {});
  };

  const selectDzikir = (dzikir) => {
    setSelectedDzikir(dzikir);
    setTarget(dzikir.target);
    setCount(0);
    setShowDzikir(false);
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  };

  const progress      = typeof target === 'number' ? Math.min(count / target, 1) : 0;
  const R             = 46;
  const circumference = 2 * Math.PI * R;
  const pct           = typeof target === 'number' ? Math.round((count / target) * 100) : 0;

  return (
    <div
      style={{ background: C.bg, color: C.text, fontFamily: "'Manrope',sans-serif" }}
      className="h-[100dvh] w-full flex flex-col overflow-hidden select-none"
    >

      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 44px)', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', flexShrink: 0 }}>
        {/* Menu — Pilih Dzikir (no background, just icon) */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowDzikir(true); }}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, background: 'none', border: 'none', cursor: 'pointer' }}
          className="active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu_book</span>
        </button>

        <h1 style={{ fontFamily: "'Noto Serif',serif", color: C.gold, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Tasbih <span style={{ color: C.teal, fontWeight: 300, fontStyle: 'italic' }}>Digi</span>
        </h1>

        {/* Settings — no background */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, background: 'none', border: 'none', cursor: 'pointer' }}
          className="active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>settings</span>
        </button>
      </header>

      {/* ══ MAIN COUNTER ══════════════════════════════════════════════════════ */}
      <main
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px', minHeight: 0 }}
        onClick={increment}
      >
        {/* Selected Dzikir Display */}
        <div style={{ textAlign: 'center', marginBottom: 16, padding: '0 8px' }}>
          <div style={{ fontSize: 22, lineHeight: 1.5, color: C.gold, fontFamily: 'serif', marginBottom: 6, direction: 'rtl' }}>
            {selectedDzikir.arabic}
          </div>
          <div style={{ fontSize: 12, color: C.teal, opacity: 0.75, fontStyle: 'italic', marginBottom: 4 }}>
            {selectedDzikir.latin}
          </div>
          <div style={{ fontSize: 11, color: C.text, opacity: 0.5, letterSpacing: '0.03em' }}>
            {selectedDzikir.meaning}
          </div>
        </div>

        {/* Hint */}
        <p style={{ fontSize: 9, letterSpacing: '0.3em', color: C.teal, opacity: 0.35, textTransform: 'uppercase', marginBottom: 12 }}>
          Ketuk layar untuk tambah
        </p>

        {/* Ring + Number */}
        <div
          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'min(65vw, 230px)', height: 'min(65vw, 230px)' }}
        >
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle
              cx="50" cy="50" r={R} fill="none"
              stroke={C.gold} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ filter: 'drop-shadow(0 0 8px rgba(233,195,73,0.55))', transition: 'stroke-dashoffset 0.35s ease' }}
            />
          </svg>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.span
              key={count}
              initial={{ scale: 0.82, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.12 }}
              style={{
                fontFamily: "'Noto Serif',serif",
                fontSize: 'min(20vw, 76px)',
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
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '8px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: C.teal, opacity: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>Target</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{target}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '8px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: C.teal, opacity: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>Progres</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{pct}%</div>
          </div>
        </div>
      </main>

      {/* ══ ACTION BUTTONS ════════════════════════════════════════════════════ */}
      <section style={{ flexShrink: 0, padding: '0 16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 10, maxWidth: 360, margin: '0 auto', alignItems: 'end' }}>

          {/* Ulangi */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowResetConfirm(true); }}
            style={{ ...ghostBtn, height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: 'none' }}
            className="active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.teal }}>refresh</span>
            <span style={{ fontSize: 9, letterSpacing: '0.2em', color: C.teal, opacity: 0.65, fontWeight: 700, textTransform: 'uppercase' }}>Ulangi</span>
          </button>

          {/* Simpan */}
          <button
            onClick={(e) => { e.stopPropagation(); Haptics.notification({ type: 'SUCCESS' }).catch(() => {}); }}
            style={{ ...goldBtn, borderRadius: '24px', height: 92, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: 'none' }}
            className="active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 26, color: C.goldText, fontVariationSettings: "'FILL' 1" }}>bookmark</span>
            <span style={{ fontSize: 10, letterSpacing: '0.2em', color: C.goldText, fontWeight: 800, textTransform: 'uppercase' }}>Simpan</span>
          </button>

          {/* Dzikir (replaced Riwayat) */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowDzikir(true); }}
            style={{ ...ghostBtn, height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: 'none' }}
            className="active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.teal }}>menu_book</span>
            <span style={{ fontSize: 9, letterSpacing: '0.2em', color: C.teal, opacity: 0.65, fontWeight: 700, textTransform: 'uppercase' }}>Dzikir</span>
          </button>
        </div>
      </section>

      {/* ════ MODALS ════════════════════════════════════════════════════════════ */}

      {/* ── 1. Reset Confirm ────────────────────────────────────────────────── */}
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
              background: 'rgba(0,8,7,0.93)',
              backdropFilter: 'blur(20px)',
            }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              key="reset-modal"
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 320,
                background: C.surface,
                borderRadius: 32,
                padding: '36px 28px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.75)',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(233,195,73,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 30, color: C.gold, lineHeight: 1 }}>restart_alt</span>
              </div>

              <h3 style={{ fontFamily: "'Noto Serif',serif", color: C.gold, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                Mulai Baru?
              </h3>
              <p style={{ color: C.teal, opacity: 0.65, fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                Hitungan Anda akan direset ke nol. Pilih dzikir baru atau lanjutkan yang sama.
              </p>

              {/* Bigger buttons for mobile */}
              <button
                onClick={resetCount}
                style={{ ...goldBtn, width: '100%', padding: '20px 0', borderRadius: 20, color: C.goldText, fontWeight: 800, fontSize: 15, letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginBottom: 12 }}
                className="active:scale-95 transition-transform"
              >
                ✓ &nbsp;Selesai &amp; Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{ width: '100%', padding: '18px 0', background: 'rgba(255,255,255,0.06)', borderRadius: 18, color: C.teal, fontWeight: 600, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
                className="active:scale-95 transition-transform"
              >
                Batal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Pilih Dzikir ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDzikir && (
          <motion.div
            key="dzikir"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', inset: 0, zIndex: 8000, background: C.bg, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px', flexShrink: 0 }}>
              <button
                onClick={() => setShowDzikir(false)}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, background: 'none', border: 'none', cursor: 'pointer' }}
                className="active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
              </button>
              <span style={{ marginLeft: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 13, color: C.gold }}>
                Pilih Dzikir
              </span>
            </header>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DZIKIR_LIST.map(dzikir => {
                const active = selectedDzikir.id === dzikir.id;
                return (
                  <button
                    key={dzikir.id}
                    onClick={() => selectDzikir(dzikir)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '16px 18px',
                      borderRadius: 20,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: active
                        ? 'rgba(233,195,73,0.1)'
                        : 'rgba(255,255,255,0.04)',
                      boxShadow: active
                        ? 'inset 0 0 0 1.5px rgba(233,195,73,0.35)'
                        : 'none',
                      transition: 'all 0.2s',
                    }}
                    className="active:scale-[0.98] transition-transform"
                  >
                    {/* Arabic */}
                    <div style={{ fontSize: 20, color: active ? C.gold : C.text, fontFamily: 'serif', direction: 'rtl', width: '100%', marginBottom: 6, lineHeight: 1.6 }}>
                      {dzikir.arabic}
                    </div>
                    {/* Latin */}
                    <div style={{ fontSize: 12, color: C.teal, opacity: 0.8, fontStyle: 'italic', marginBottom: 4 }}>
                      {dzikir.latin}
                    </div>
                    {/* Meaning + target */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ fontSize: 11, color: C.text, opacity: 0.5 }}>{dzikir.meaning}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: active ? C.gold : C.teal, background: active ? 'rgba(233,195,73,0.15)' : 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 20, letterSpacing: '0.1em', flexShrink: 0, marginLeft: 8 }}>
                        {dzikir.target}×
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Settings ─────────────────────────────────────────────────────── */}
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
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px', flexShrink: 0 }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, background: 'none', border: 'none', cursor: 'pointer' }}
                className="active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
              </button>
              <span style={{ marginLeft: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 13, color: C.gold }}>Pengaturan</span>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 32px' }}>
              <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.teal, opacity: 0.45, marginBottom: 16 }}>
                Pilih Target Hitungan
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {TARGET_OPTIONS.map(opt => {
                  const active = target === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => { setTarget(opt); setShowSettings(false); Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); }}
                      style={{
                        padding: '22px 0',
                        borderRadius: 18,
                        fontSize: 24,
                        fontWeight: 700,
                        fontFamily: "'Noto Serif',serif",
                        border: 'none',
                        cursor: 'pointer',
                        ...(active
                          ? { ...goldBtn, color: C.goldText }
                          : { ...ghostBtn, color: C.text }),
                      }}
                      className="active:scale-95 transition-all"
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

    </div>
  );
}

export default App;
