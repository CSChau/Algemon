import { useState, useRef, useEffect } from "react";
import { AlgemonSVG } from "../components/AlgemonSVG";
import MathText from "../components/MathText";
import {
  AlgemonType, TopicKey, MCQuestion, SAQuestion,
  ELEMENTAL_ALGEMON_TYPES, TOPIC_KEYS, TYPE_COLOR, TYPE_EMOJI, TYPE_TOPIC,
  WILD_ENEMY, GYM_DATA, ALGE_DB, ELITE_FOUR, STUDY_GUIDE, SPECIES_LIST,
  EVOLUTION_DATA, getEvolutionStage, getSpeciesId,
  PLAYER_MAX_HP, ENEMY_MAX_HP, BASE_DAMAGE,
  calcPlayerDmg, calcFoeDmg,
  CATCH_MODIFIER, XP_PER_CORRECT_WILD, XP_PER_CORRECT_GYM, XP_PER_CORRECT_ELITE,
  MAX_LEVEL, HINT_MIN_LEVEL, HINT_TOOL_COST, ALGEBALL_COST, POTION_COST, POTION_HEAL,
  WILD_WIN_COINS, GYM_WIN_COINS, ELITE_WIN_COINS,
  xpToLevel, xpToNextLevel, xpForLevelStart, xpRequiredForLevel, pickRandom, normalizeAns, QUESTION_BANK,
  DOUBLE_STAR_SPECIES_ID, DOUBLE_STAR_SPAWN_RATE, DOUBLE_STAR_BATTLE_QUOTE,
} from "../data/gameData";

// ══════════════════════════════════════════════════════════════
// INTERFACES
// ══════════════════════════════════════════════════════════════
interface PartyMember {
  baseType: AlgemonType;  // permanent type — name/emoji computed from this member's level
  color:    string;
  xp:       number;       // this individual Algemon's total XP
}

interface ShuffledQ {
  text:    string;
  options: string[];   // randomised every new question
  correct: number;     // new index of the correct answer after shuffle
  hint?:   string;     // per-question hint from QUESTION_BANK (optional)
}

interface WrongAttempt {
  mode: "mc" | "sa";
  topic: string;
  question: string;
  correctAnswer: string;
  solution: string;
}

interface PlayerStats {
  name:             string;
  activeIndex:      number;
  party:            PartyMember[];   // XP lives on each member; no global xp (max 6)
  box:              PartyMember[];   // Alge-Box PC storage — unlimited
  algecoins:        number;
  gymBeaten:        boolean[];
  eliteFourBeaten:  boolean[];
  inventory:        { hints: number; algaballs: number; potions: number };
  totalQuestions:   number;
  totalCorrect:     number;
  caughtSpecies:    string[];
  usedQuestions:    Record<string, number[]>;  // topic → used indices (anti-repeat)
  dseScholar:       boolean;  // defeated or caught Double-Star (hidden legendary)
  wrongAttempts:    WrongAttempt[];
}

interface BattleCtx {
  mode:        "wild" | "gym" | "elite";
  gymId?:      number;
  eliteId?:    number;
  topic:       TopicKey;
  speciesId:   string;
  enemyName:   string;
  enemyColor:  string;
  enemyEmoji:  string;
  enemyType:   AlgemonType;
  enemyStage:  0 | 1 | 2;
  foeLv?:      number;   // undefined = use player level (wild battles)
  xpReward:    number;   // per correct answer
  coinReward:  number;
  badgeReward: boolean;
  catchType:   AlgemonType;
  openingQuote?:    string;
  grantsDseScholar?: boolean;
}

interface BattleResult {
  won: boolean; caught: boolean; xpGained: number;
  coinsGained: number; badgeEarned: boolean;
  gymId?: number; eliteId?: number; newLv?: number;
  speciesName?: string; sentToBox?: boolean;
  dseScholarUnlocked?: boolean;
}

interface PendingEvolution {
  toStage:   0 | 1 | 2;
  newLevel:  number;
  evolutions: { from: string; to: string; emoji: string; type: AlgemonType }[];
}

type Screen = "intro" | "start" | "hub" | "gymSelect" | "gymCutscene" | "algeBox" | "shop" | "changeAlgemon"
            | "status" | "mistakes" | "library" | "evolution" | "battle" | "result";

// ══════════════════════════════════════════════════════════════
// PALETTE & STYLES
// ══════════════════════════════════════════════════════════════
const P = {
  bg: "#8bac0f", darkBg: "#306230", panel: "#9bbc0f", border: "#1a2e1a",
  light: "#e0f0c0", white: "#f5f5dc", logBg: "#0f380f", logText: "#9bbc0f",
  gold: "#fdd835", red: "#c62828", green: "#2e7d32", blue: "#1565c0",
};
const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };
const btnBase: React.CSSProperties = {
  ...mono, fontWeight: "bold", cursor: "pointer",
  border: `3px solid ${P.border}`, borderRadius: 4,
  boxShadow: `3px 3px 0 ${P.border}`, transition: "transform .07s",
};
const btnDark:     React.CSSProperties = { ...btnBase, background: P.darkBg, color: "#fff" };
const btnLight:    React.CSSProperties = { ...btnBase, background: P.light,  color: P.border };
const btnDisabled: React.CSSProperties = { ...btnBase, background: "#777", color: "#bbb", cursor: "not-allowed", boxShadow: "none" };

// ── Helpers: evolution-aware member display ───────────────────
function getStage(lv: number): 0 | 1 | 2 { return getEvolutionStage(lv); }
function memberName(p: PartyMember, lv: number): string  { return EVOLUTION_DATA[p.baseType].stages[getStage(lv)].name; }
function memberEmoji(p: PartyMember, lv: number): string { return EVOLUTION_DATA[p.baseType].stages[getStage(lv)].emoji; }
function memberDefBonus(p: PartyMember, lv: number): number { return EVOLUTION_DATA[p.baseType].stages[getStage(lv)].defenseBonus; }

function shuffleQuestion(q: MCQuestion): ShuffledQ {
  const correctText = q.options[q.correct];
  const shuffled    = [...q.options].sort(() => Math.random() - 0.5);
  return { text: q.text, options: shuffled, correct: shuffled.indexOf(correctText), hint: q.hint };
}

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: P.panel, border: `4px solid ${P.border}`, borderRadius: 8, padding: 18, width: "100%", maxWidth: 510, boxShadow: `6px 6px 0 ${P.border}`, ...style }}>
      {children}
    </div>
  );
}

function HpBar({ hp, maxHp, label }: { hp: number; maxHp: number; label: string }) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  const col  = pct > 50 ? "#3dbb3d" : pct > 25 ? "#e0b800" : "#cc2200";
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.light, marginBottom: 2 }}>
        <span>{label}</span><span>{Math.max(0, hp)}/{maxHp}</span>
      </div>
      <div style={{ width: "100%", height: 11, background: "#4a6141", borderRadius: 3, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, transition: "width .4s" }} />
      </div>
    </div>
  );
}

function XpBar({ xp, label }: { xp: number; label?: string }) {
  const lv  = xpToLevel(xp);
  const start = xpForLevelStart(lv);
  const need = xpRequiredForLevel(lv);
  const pct = lv >= 30 ? 100 : ((xp - start) / need) * 100;
  const hintFree = lv >= HINT_MIN_LEVEL;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.light, marginBottom: 1 }}>
        <span>{label && <span style={{ color: "#a0d878" }}>{label} </span>}LV {lv}  XP {xp}</span>
        <span style={{ color: hintFree ? P.gold : P.light }}>
          {lv >= 30 ? "MAX" : `→${xpToNextLevel(xp)} XP`}
          {hintFree && "  ★HINT FREE"}
        </span>
      </div>
      <div style={{ width: "100%", height: 7, background: "#4a6141", borderRadius: 2, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#90caf9", transition: "width .4s" }} />
      </div>
    </div>
  );
}


function BattleLog({ entries }: { entries: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [entries]);
  return (
    <div ref={ref} style={{ background: P.logBg, border: `3px solid ${P.border}`, borderRadius: 4, padding: "5px 9px", height: 65, overflowY: "auto", ...mono, fontSize: 10, color: P.logText, lineHeight: 1.55 }}>
      {entries.map((e, i) => (
        <div key={i}>
          {e.includes("$") ? <MathText>{"▸ " + e}</MathText> : <>▸ {e}</>}
        </div>
      ))}
    </div>
  );
}

function StatBadge({ label, value, color = P.gold }: { label: string; value: string | number; color?: string }) {
  return (
    <span style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 3, padding: "1px 7px", fontSize: 11, color, ...mono, fontWeight: "bold", marginRight: 4, marginBottom: 3, display: "inline-block" }}>
      {label}: {value}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ══════════════════════════════════════════════════════════════
export default function Game() {

  const [stats,  setStats]  = useState<PlayerStats | null>(null);
  const [screen, setScreen] = useState<Screen>("intro");

  // Battle state
  const [ctx,         setCtx]         = useState<BattleCtx | null>(null);
  const [playerHp,    setPlayerHp]    = useState(PLAYER_MAX_HP);
  const [enemyHp,     setEnemyHp]     = useState(ENEMY_MAX_HP);
  const [shQ,         setShQ]         = useState<ShuffledQ | null>(null);
  const [answered,    setAnswered]    = useState(false);
  const [catchMode,   setCatchMode]   = useState(false);
  const [catchQ,      setCatchQ]      = useState<SAQuestion | null>(null);
  const [catchInput,  setCatchInput]  = useState("");
  const [catchDone,   setCatchDone]   = useState(false);
  const [showHint,    setShowHint]    = useState(false);
  const [showBag,     setShowBag]     = useState(false);
  const [log,         setLog]         = useState<string[]>([]);
  const [battleCorrect, setBattleCorrect] = useState(0);
  const [lastResult,  setLastResult]  = useState<BattleResult | null>(null);
  const [pendingEvolution, setPendingEvolution] = useState<PendingEvolution | null>(null);

  // Start form
  const [startName, setStartName] = useState("");
  const [nameError, setNameError] = useState("");
  const [startType, setStartType] = useState<AlgemonType | null>(null);
  // Save code
  const [saveCodeInput, setSaveCodeInput] = useState("");
  const [saveCodeError, setSaveCodeError] = useState("");
  // Audio
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const musicStepRef = useRef(0);
  // Gym cutscene
  const [pendingGymId, setPendingGymId] = useState<number | null>(null);
  // Library
  const [libOpen, setLibOpen] = useState<number | null>(null);
  // Alge-Box swap selection
  const [swapSrc, setSwapSrc] = useState<{ kind: "box" | "party"; idx: number } | null>(null);

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-40), msg]);
  const pushWrongAttempt = (entry: WrongAttempt) => {
    setStats(s => s ? { ...s, wrongAttempts: [...s.wrongAttempts, entry].slice(-80) } : s);
  };
  const ensureAudio = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };
  const playTone = (freq: number, durationMs: number, type: OscillatorType, volume = 0.05) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.02);
  };
  const playSfx = (kind: "start" | "correct" | "wrong" | "catch" | "miss" | "throw") => {
    if (!sfxEnabled) return;
    if (kind === "start") { playTone(523.25, 90, "triangle", 0.03); return; }
    if (kind === "correct") { playTone(659.25, 90, "square", 0.04); playTone(783.99, 110, "square", 0.03); return; }
    if (kind === "wrong") { playTone(220, 130, "sawtooth", 0.035); return; }
    if (kind === "catch") { playTone(784, 90, "triangle", 0.04); playTone(988, 120, "triangle", 0.03); return; }
    if (kind === "miss") { playTone(196, 130, "sawtooth", 0.03); return; }
    playTone(392, 70, "square", 0.025);
  };
  const stopMusic = () => {
    if (musicTimerRef.current !== null) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  };
  const startMusic = () => {
    stopMusic();
    // Happier looped motif.
    const melody = [392.0, 440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 523.25];
    musicStepRef.current = 0;
    musicTimerRef.current = window.setInterval(() => {
      if (!musicEnabled) return;
      const f = melody[musicStepRef.current % melody.length];
      playTone(f, 420, "triangle", 0.018);
      playTone(f / 2, 420, "sine", 0.01);
      musicStepRef.current++;
    }, 560);
  };

  const active = (s: PlayerStats) => s.party[s.activeIndex];

  // ── Save / Load (v6 — full state via btoa/JSON) ─────────────
  function buildSaveCode(s: PlayerStats): string {
    const fixM = (m: PartyMember) => [m.baseType, m.xp] as [string, number];
    const data = {
      v: 6,
      nm:  s.name,
      ai:  s.activeIndex,
      p:   s.party.map(fixM),
      b:   s.box.map(fixM),
      ac:  s.algecoins,
      gym: s.gymBeaten,
      e4:  s.eliteFourBeaten,
      inv: [s.inventory.hints, s.inventory.algaballs, s.inventory.potions],
      tq:  s.totalQuestions,
      tc:  s.totalCorrect,
      cs:  s.caughtSpecies,
      uq:  s.usedQuestions,
      ...(s.dseScholar ? { ds: true } : {}),
      ...(s.wrongAttempts.length > 0 ? { wa: s.wrongAttempts } : {}),
    };
    return `WSCSS-V6-${btoa(JSON.stringify(data))}`;
  }

  function parseSaveCode(code: string, trainerName: string): PlayerStats | null {
    const fixMember = ([t, xp]: [string, number]): PartyMember => ({
      baseType: t as AlgemonType,
      color: TYPE_COLOR[t as AlgemonType] ?? "#888",
      xp: Math.max(0, Math.min(Number(xp), xpForLevelStart(MAX_LEVEL))),
    });
    try {
      const trimmed = code.trim();

      // ── V6 format: WSCSS-V6-<base64> ───────────────────────
      if (trimmed.startsWith("WSCSS-V6-")) {
        const raw  = atob(trimmed.slice(9));
        const d    = JSON.parse(raw);
        if (d.v !== 6 || !Array.isArray(d.p) || d.p.length === 0) return null;
        const party = (d.p as [string, number][]).map(fixMember);
        const ai    = Math.min(Math.max(0, d.ai ?? 0), party.length - 1);
        return {
          name:            d.nm || trainerName.trim() || "Trainer",
          activeIndex:     ai,
          party,
          box:             (d.b as [string, number][] ?? []).map(fixMember),
          algecoins:       Math.max(0, Math.min(d.ac ?? 0, 999999)),
          gymBeaten:       (d.gym ?? Array(8).fill(false)).slice(0, 8) as boolean[],
          eliteFourBeaten: (d.e4  ?? Array(4).fill(false)).slice(0, 4) as boolean[],
          inventory: {
            hints:     d.inv?.[0] ?? 0,
            algaballs: d.inv?.[1] ?? 0,
            potions:   d.inv?.[2] ?? 0,
          },
          totalQuestions: d.tq ?? 0,
          totalCorrect:   d.tc ?? 0,
          caughtSpecies:  d.cs ?? [],
          usedQuestions:  d.uq ?? {},
          dseScholar:     d.ds === true,
          wrongAttempts:  (d.wa ?? []).slice(0, 80),
        };
      }

      // ── Legacy V5 format: WSCSS-ALGE5-TYPE-LVn-nXP-nGYM-nE4-nAC ──
      const parts = trimmed.toUpperCase().split("-");
      if (parts.length < 8 || parts[0] !== "WSCSS" || parts[1] !== "ALGE5") return null;
      const typeMap: Partial<Record<string, AlgemonType>> = {
        FIRE: "Fire", WATE: "Water", GRAS: "Grass", ICE: "Ice",
        FLYI: "Flying", GROU: "Ground", FIGH: "Fighting", ELEC: "Electric",
      };
      const baseType = typeMap[parts[2]];
      if (!baseType) return null;
      const xp     = parseInt(parts[4].replace("XP", ""), 10);
      const gymCnt = parseInt(parts[5].replace("GYM", ""), 10);
      const e4Cnt  = parseInt(parts[6].replace("E4", ""), 10);
      const coins  = parseInt(parts[7].replace("AC", ""), 10);
      if ([xp, gymCnt, e4Cnt, coins].some(isNaN)) return null;
      return {
        name: trainerName.trim() || "Trainer",
        activeIndex: 0,
        party: [fixMember([baseType, xp])],
        box: [],
        algecoins: Math.max(0, Math.min(coins, 999999)),
        gymBeaten:        Array(8).fill(false).map((_, i) => i < Math.min(gymCnt, 8)) as boolean[],
        eliteFourBeaten:  Array(4).fill(false).map((_, i) => i < Math.min(e4Cnt, 4)) as boolean[],
        inventory:        { hints: 0, algaballs: 0, potions: 0 },
        totalQuestions:   0, totalCorrect: 0,
        caughtSpecies:    [getSpeciesId(baseType, 0)],
        usedQuestions:    {},
        dseScholar:       false,
        wrongAttempts:    [],
      };
    } catch { return null; }
  }

  // Gym cutscene auto-start timer
  useEffect(() => {
    if (screen !== "gymCutscene" || pendingGymId === null) return;
    const id = pendingGymId;
    const timer = setTimeout(() => {
      setPendingGymId(null);
      startGymBattle(id);
    }, 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, pendingGymId]);

  // Intro splash: continue on any key or touch.
  useEffect(() => {
    if (screen !== "intro") return;
    const goStart = () => setScreen("start");
    const onKey = () => goStart();
    const onTouch = () => goStart();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onTouch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onTouch);
    };
  }, [screen]);

  useEffect(() => {
    if (musicEnabled) startMusic();
    else stopMusic();
    return () => stopMusic();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled]);

  // ── Anti-repeat question picker ──────────────────────────────
  function pickQuestion(c: BattleCtx): MCQuestion {
    if (c.mode === "elite") return pickRandom(ELITE_FOUR[c.eliteId!].questions);
    const bankMc = QUESTION_BANK[c.topic].mc;
    if (bankMc.length === 0) {
      // Fallback to ALGE_DB built-ins
      const easy = ALGE_DB[c.topic].easy;
      const hard = ALGE_DB[c.topic].hard;
      const pool = c.mode === "wild" ? (easy.length > 0 ? easy : hard) : hard;
      return pickRandom(pool);
    }
    // Find un-used indices for this topic
    const used   = stats?.usedQuestions?.[c.topic] ?? [];
    const unused = bankMc.map((_, i) => i).filter(i => !used.includes(i));
    let idx: number;
    if (unused.length === 0) {
      // All exhausted → reset tracker and start fresh cycle
      setStats(s => s ? { ...s, usedQuestions: { ...s.usedQuestions, [c.topic]: [] } } : s);
      idx = Math.floor(Math.random() * bankMc.length);
    } else {
      idx = unused[Math.floor(Math.random() * unused.length)];
      setStats(s => s ? {
        ...s,
        usedQuestions: {
          ...s.usedQuestions,
          [c.topic]: [...(s.usedQuestions?.[c.topic] ?? []), idx],
        },
      } : s);
    }
    return bankMc[idx];
  }

  // ── Launch a battle ─────────────────────────────────────────
  function launchBattle(bc: BattleCtx, currentStats: PlayerStats) {
    const act = active(currentStats);
    const lv  = xpToLevel(act.xp);
    const topicLabel = bc.mode === "elite"
      ? `Mixed Topics — ${ELITE_FOUR[bc.eliteId!].name}`
      : ALGE_DB[bc.topic].topicName;
    const foeLv = bc.foeLv ?? lv;
    setCtx(bc);
    setPlayerHp(PLAYER_MAX_HP);
    setEnemyHp(ENEMY_MAX_HP);
    setShQ(shuffleQuestion(pickQuestion(bc)));
    setAnswered(false); setCatchMode(false); setCatchQ(null);
    setCatchInput(""); setCatchDone(false);
    setShowHint(false); setShowBag(false);
    setBattleCorrect(0);
    setLog([
      `${bc.enemyName} (Lv ${foeLv}) appeared!`,
      ...(bc.openingQuote ? [bc.openingQuote] : []),
      `Topic: ${topicLabel}`,
      `${currentStats.name}'s ${memberName(act, lv)} (Lv ${lv}) steps forward!`,
    ]);
    playSfx("start");
    setScreen("battle");
  }

  function startWildBattle() {
    if (!stats) return;
    const act    = active(stats);
    const actLv  = xpToLevel(act.xp);
    const accPct = stats.totalQuestions > 0 ? (stats.totalCorrect / stats.totalQuestions) * 100 : 0;
    // Foe is 1–3 levels below the active Algemon (min level 1)
    const foeLv  = Math.max(1, actLv - 1 - Math.floor(Math.random() * 3));
    const eightGymsDone = stats.gymBeaten.every(Boolean);
    if (eightGymsDone && accPct >= 95 && Math.random() < DOUBLE_STAR_SPAWN_RATE) {
      const topic = TOPIC_KEYS[Math.floor(Math.random() * TOPIC_KEYS.length)];
      const legendLv = Math.min(MAX_LEVEL, actLv + 5);
      launchBattle({
        mode: "wild",
        topic,
        speciesId: DOUBLE_STAR_SPECIES_ID,
        enemyName: "Double-Star",
        enemyColor: TYPE_COLOR.Legendary,
        enemyEmoji: TYPE_EMOJI.Legendary,
        enemyType: "Legendary",
        enemyStage: 2,
        foeLv: legendLv,
        xpReward: XP_PER_CORRECT_WILD,
        coinReward: WILD_WIN_COINS,
        badgeReward: false,
        catchType: "Legendary",
        openingQuote: DOUBLE_STAR_BATTLE_QUOTE,
        grantsDseScholar: true,
      }, stats);
      return;
    }
    // Topic = next gym's type if gyms < 8; otherwise random from all 8 element types
    const gymsBeaten = stats.gymBeaten.filter(Boolean).length;
    let wildType: AlgemonType;
    if (gymsBeaten >= 8) {
      wildType = ELEMENTAL_ALGEMON_TYPES[Math.floor(Math.random() * ELEMENTAL_ALGEMON_TYPES.length)];
    } else {
      wildType = GYM_DATA[gymsBeaten].catchType;
    }
    const topic = TYPE_TOPIC[wildType];
    const enemy = WILD_ENEMY[wildType];
    launchBattle({
      mode: "wild", topic, speciesId: enemy.speciesId,
      enemyName: enemy.name, enemyColor: enemy.color, enemyEmoji: enemy.emoji,
      enemyType: enemy.catchType, enemyStage: 0,
      foeLv,
      xpReward: XP_PER_CORRECT_WILD, coinReward: WILD_WIN_COINS, badgeReward: false, catchType: enemy.catchType,
    }, stats);
  }

  function startGymBattle(gymId: number) {
    if (!stats) return;
    const gym = GYM_DATA[gymId];
    launchBattle({
      mode: "gym", gymId, topic: gym.topic, speciesId: gym.speciesId,
      enemyName: gym.enemyName, enemyColor: gym.enemyColor, enemyEmoji: gym.enemyEmoji,
      enemyType: gym.catchType, enemyStage: 2,
      foeLv: gym.foeLevel, xpReward: XP_PER_CORRECT_GYM,
      coinReward: GYM_WIN_COINS, badgeReward: true, catchType: gym.catchType,
    }, stats);
  }

  function startEliteBattle(eliteId: number) {
    if (!stats) return;
    const elite = ELITE_FOUR[eliteId];
    const highestLv = Math.max(...stats.party.map((p) => xpToLevel(p.xp)));
    const dynamicEliteLv = highestLv + eliteId + 1;
    launchBattle({
      mode: "elite", eliteId, topic: "factorization", speciesId: elite.speciesId,
      enemyName: elite.enemyName, enemyColor: elite.enemyColor, enemyEmoji: elite.enemyEmoji,
      enemyType: elite.catchType, enemyStage: 2,
      foeLv: dynamicEliteLv, xpReward: XP_PER_CORRECT_ELITE,
      coinReward: ELITE_WIN_COINS, badgeReward: false, catchType: elite.catchType,
    }, stats);
  }

  // ── Next question ────────────────────────────────────────────
  function nextQuestion() {
    if (!ctx) return;
    setShQ(shuffleQuestion(pickQuestion(ctx)));
    setAnswered(false); setCatchMode(false); setCatchQ(null);
    setCatchInput(""); setCatchDone(false); setShowHint(false); setShowBag(false);
  }

  // ── Apply victory ────────────────────────────────────────────
  function applyVictory(caught: boolean, correctCount: number, st: PlayerStats, curEnemyHp: number) {
    if (!ctx) return;
    const xpGain    = caught ? correctCount * ctx.xpReward * 2 : correctCount * ctx.xpReward;
    const activeIdx = st.activeIndex;
    const prevXp    = st.party[activeIdx].xp;
    const newXp     = prevXp + xpGain;
    const prevLv    = xpToLevel(prevXp);
    const newLv     = xpToLevel(newXp);
    const newCoins  = st.algecoins + (caught ? 0 : ctx.coinReward);
    const newGym    = [...st.gymBeaten];
    const newElite  = [...st.eliteFourBeaten];
    if (!caught && ctx.badgeReward && ctx.gymId !== undefined) newGym[ctx.gymId] = true;
    if (!caught && ctx.mode === "elite" && ctx.eliteId !== undefined) newElite[ctx.eliteId] = true;

    // Species collection
    let newSpecies = [...st.caughtSpecies];
    if (caught && ctx.speciesId && !newSpecies.includes(ctx.speciesId)) newSpecies.push(ctx.speciesId);

    // Update only the active member's XP; add caught Algemon to party or box
    let newParty = st.party.map((m, i) =>
      i === activeIdx ? { ...m, xp: newXp } : m
    );
    let newBox = [...st.box];
    const caughtLv = Math.min(10, Math.max(1, ctx.foeLv ?? lv));
    const caughtMember: PartyMember = {
      baseType: ctx.catchType,
      color: TYPE_COLOR[ctx.catchType],
      xp: xpForLevelStart(caughtLv),
    };
    if (caught && st.party.length < 6) {
      newParty = [...newParty, caughtMember];
    } else if (caught) {
      newBox = [...newBox, caughtMember];
    }

    // Evolution check — only for the active member
    const oldStage = getStage(prevLv);
    const newStage = getStage(newLv);
    let evoInfo: PendingEvolution | null = null;
    if (newStage > oldStage) {
      const evolvedMember = newParty[activeIdx];
      for (let s = oldStage + 1; s <= newStage; s++) {
        const sid = getSpeciesId(evolvedMember.baseType, s as 0 | 1 | 2);
        if (!newSpecies.includes(sid)) newSpecies.push(sid);
      }
      evoInfo = {
        toStage: newStage as 0 | 1 | 2,
        newLevel: newLv,
        evolutions: [{
          from:  EVOLUTION_DATA[evolvedMember.baseType].stages[oldStage].name,
          to:    EVOLUTION_DATA[evolvedMember.baseType].stages[newStage].name,
          emoji: EVOLUTION_DATA[evolvedMember.baseType].stages[newStage].emoji,
          type:  evolvedMember.baseType,
        }],
      };
    }

    const nextDse = st.dseScholar || Boolean(ctx.grantsDseScholar);
    setStats(s => s ? {
      ...s,
      algecoins: newCoins,
      gymBeaten: newGym,
      eliteFourBeaten: newElite,
      caughtSpecies: newSpecies,
      party: newParty,
      box: newBox,
      dseScholar: nextDse,
    } : s);
    if (evoInfo) setPendingEvolution(evoInfo);

    const spName = SPECIES_LIST.find(sp => sp.id === ctx.speciesId)?.name;
    const sentToBox = caught && st.party.length >= 6;
    setLastResult({
      won: true, caught, xpGained: xpGain, coinsGained: caught ? 0 : ctx.coinReward,
      badgeEarned: ctx.badgeReward && !caught,
      gymId: ctx.gymId, eliteId: ctx.eliteId,
      newLv: newLv > prevLv ? newLv : undefined, speciesName: spName, sentToBox,
      dseScholarUnlocked: Boolean(ctx.grantsDseScholar) && !st.dseScholar,
    });
    setTimeout(() => setScreen("result"), 900);
  }

  // ── Handle MC answer ─────────────────────────────────────────
  function handleAnswer(idx: number) {
    if (answered || !shQ || !ctx || !stats) return;
    setAnswered(true);
    const isCorrect = idx === shQ.correct;
    const playerLv  = xpToLevel(active(stats).xp);   // per-Algemon level
    const foeLv     = ctx.foeLv ?? playerLv;
    const defBonus  = memberDefBonus(active(stats), playerLv);
    const playerDmg = calcPlayerDmg(playerLv, foeLv);
    const foeDmg    = calcFoeDmg(playerLv, foeLv, defBonus);

    setStats(s => s ? { ...s,
      totalQuestions: s.totalQuestions + 1,
      totalCorrect:   s.totalCorrect + (isCorrect ? 1 : 0),
    } : s);

    if (isCorrect) {
      playSfx("correct");
      const newEnemyHp = Math.max(0, enemyHp - playerDmg);
      const newCount   = battleCorrect + 1;
      setEnemyHp(newEnemyHp);
      setBattleCorrect(newCount);
      addLog(`✓ Correct! ${ctx.enemyName} takes ${playerDmg} dmg! (${newEnemyHp}/${ENEMY_MAX_HP} HP)`);
      if (newEnemyHp <= 0) {
        addLog(`${ctx.enemyName} fainted!`);
        applyVictory(false, newCount, stats, newEnemyHp);
      } else {
        if (ctx.mode === "wild" && newEnemyHp < ENEMY_MAX_HP * 0.5) {
          const catchPct = Math.round((1 - newEnemyHp / ENEMY_MAX_HP) * CATCH_MODIFIER * 100);
          addLog(`${ctx.enemyName} is weakened! ⭕ Ball catch chance: ~${catchPct}%`);
        }
        setTimeout(nextQuestion, 1500);
      }
    } else {
      playSfx("wrong");
      const topicLabel = ctx.mode === "elite" ? "Elite Mixed Topics" : ALGE_DB[ctx.topic].topicName;
      const solution = shQ.hint ?? (ctx.mode !== "elite" ? ALGE_DB[ctx.topic].hint : "Review the relevant method and retry.");
      pushWrongAttempt({
        mode: "mc",
        topic: topicLabel,
        question: shQ.text,
        correctAnswer: shQ.options[shQ.correct] ?? "N/A",
        solution,
      });
      const newHp = Math.max(0, playerHp - foeDmg);
      setPlayerHp(newHp);
      addLog(`✗ Wrong! You take ${foeDmg} dmg! (${newHp}/${PLAYER_MAX_HP} HP)`);
      const hintText = shQ?.hint ?? (ctx.mode !== "elite" ? ALGE_DB[ctx.topic].hint.slice(0, 60) + "…" : "");
      const hint = hintText ? `  Tip: ${hintText}` : "";
      if (hint) addLog(hint);
      if (newHp <= 0) {
        addLog(`${memberName(active(stats), xpToLevel(active(stats).xp))} fainted!`);
        setLastResult({ won: false, caught: false, xpGained: 0, coinsGained: 0, badgeEarned: false });
        setTimeout(() => setScreen("result"), 900);
      } else {
        setTimeout(nextQuestion, 2200);
      }
    }
  }

  // ── Short-answer CATCH submit ─────────────────────────────────
  function handleCatchSubmit() {
    if (!catchQ || catchDone || !ctx || !stats) return;
    setCatchDone(true);
    const correct = normalizeAns(catchInput) === normalizeAns(catchQ.answer);
    setStats(s => s ? { ...s, totalQuestions: s.totalQuestions + 1, totalCorrect: s.totalCorrect + (correct ? 1 : 0) } : s);
    if (correct) {
      playSfx("catch");
      addLog(`Gotcha! ${ctx.enemyName} was caught!`);
      applyVictory(true, battleCorrect, stats, enemyHp);
    } else {
      playSfx("miss");
      const topicLabel = ctx.mode === "elite" ? "Elite Mixed Topics" : ALGE_DB[ctx.topic].topicName;
      pushWrongAttempt({
        mode: "sa",
        topic: topicLabel,
        question: catchQ.text,
        correctAnswer: catchQ.answer,
        solution: ALGE_DB[ctx.topic].hint,
      });
      addLog(`Catch failed! Correct was: ${catchQ.answer}. ${ctx.enemyName} broke free!`);
      setTimeout(() => { setCatchMode(false); setCatchInput(""); setCatchDone(false); nextQuestion(); }, 2200);
    }
  }

  // ── Algaball — triggers SA catch question at low HP ───────────
  function useAlgaball() {
    if (!stats || !ctx || enemyHp <= 0 || stats.inventory.algaballs < 1) return;
    if (ctx.mode !== "wild") {
      addLog("You can only catch wild Algemon!");
      setShowBag(false);
      return;
    }
    const catchChance = (1 - enemyHp / ENEMY_MAX_HP) * CATCH_MODIFIER;
    const pct = Math.round(catchChance * 100);
    setStats(s => s ? { ...s, inventory: { ...s.inventory, algaballs: s.inventory.algaballs - 1 } } : s);
    setShowBag(false);
    playSfx("throw");
    addLog(`⭕ Algaball thrown! Catch chance: ~${pct}%…`);
    const snapStats = stats;
    const snapEnemyHp = enemyHp;
    setTimeout(() => {
      if (Math.random() < catchChance) {
        playSfx("catch");
        addLog(`🎉 Gotcha! ${ctx!.enemyName} was caught!`);
        setTimeout(() => applyVictory(true, 0, snapStats, snapEnemyHp), 700);
      } else {
        playSfx("miss");
        addLog(`💨 Oh no! ${ctx!.enemyName} broke free! (${pct}% wasn't enough)`);
      }
    }, 1000);
  }

  // ── Potion (no turn consumed) ────────────────────────────────
  function usePotion() {
    if (!stats || stats.inventory.potions < 1) return;
    const healed = Math.min(PLAYER_MAX_HP - playerHp, POTION_HEAL);
    setPlayerHp(prev => Math.min(PLAYER_MAX_HP, prev + POTION_HEAL));
    setStats(s => s ? { ...s, inventory: { ...s.inventory, potions: s.inventory.potions - 1 } } : s);
    setShowBag(false);
    addLog(`Used a Potion! +${healed} HP restored.`);
  }

  // ── Hint ──────────────────────────────────────────────────────
  function handleHint() {
    if (!stats || !ctx) return;
    const lv = xpToLevel(active(stats).xp);
    if (lv >= HINT_MIN_LEVEL) {
      setShowHint(v => !v);
    } else if (stats.inventory.hints > 0) {
      setStats(s => s ? { ...s, inventory: { ...s.inventory, hints: s.inventory.hints - 1 } } : s);
      setShowHint(true);
      addLog(`Used a Hint Tool! (${stats.inventory.hints - 1} remaining)`);
    }
  }

  const canCatch   = (hp: number) => hp > 0;
  const canUseHint = (s: PlayerStats) => xpToLevel(s.party[s.activeIndex].xp) >= HINT_MIN_LEVEL || s.inventory.hints > 0;

  const wrap: React.CSSProperties = {
    minHeight: "100vh", background: P.bg,
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    ...mono, padding: "12px 8px",
  };

  // ══════════════════════════════════════════════════════════════
  // INTRO SPLASH
  // ══════════════════════════════════════════════════════════════
  if (screen === "intro") {
    return (
      <div style={{ ...wrap, alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #b7e36a 0%, #8bac0f 55%, #6f8c0c 100%)" }}>
        <Card style={{ maxWidth: 620 }}>
          <h1 style={{ textAlign: "center", color: P.border, fontSize: 20, fontWeight: "bold", marginBottom: 6 }}>WELCOME TO ALGEMON WORLD</h1>
          <div style={{ textAlign: "center", color: "#2f4f2f", fontSize: 12, marginBottom: 10 }}>
            Learn Math, Catch Algemon, Grow Stronger!
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 10 }}>
            {ELEMENTAL_ALGEMON_TYPES.map((t) => (
              <AlgemonSVG key={t} type={t} stage={0} size={58} animate />
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#e0f0c0", background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 5, padding: "7px 10px" }}>
            Press any key or tap anywhere to continue
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // START SCREEN — 8-type selector grid
  // ══════════════════════════════════════════════════════════════
  if (screen === "start") {
    return (
      <div style={wrap}>
        <Card>
          <h1 style={{ textAlign: "center", color: P.border, fontSize: 15, fontWeight: "bold", letterSpacing: 1, marginBottom: 1 }}>⚔️ ALGEMON MATH BATTLE</h1>
          <div style={{ textAlign: "center", fontSize: 10, color: "#3a5a1a", marginBottom: 14 }}>WSCSS v5 — HKDSE Compulsory Part A</div>
          <label style={{ display: "block", color: P.border, fontSize: 12, marginBottom: 3 }}>TRAINER NAME (ENGLISH ONLY):</label>
          <input type="text" maxLength={16} value={startName} onChange={e => {
            const next = e.target.value;
            if (/^[A-Za-z0-9 _-]*$/.test(next)) {
              setStartName(next);
              setNameError("");
            } else {
              setNameError("Use English letters/numbers only (Chinese input is not supported).");
            }
          }} placeholder="Enter your name (English only)"
            style={{ width: "100%", boxSizing: "border-box", ...mono, fontSize: 13, padding: "6px 10px", border: `3px solid ${P.border}`, borderRadius: 4, background: P.white, marginBottom: 14 }} />
          {nameError && <div style={{ color: "#c62828", fontSize: 10, marginTop: -10, marginBottom: 10 }}>{nameError}</div>}
          <div style={{ color: P.border, fontSize: 12, marginBottom: 6 }}>CHOOSE YOUR ALGEMON STARTER:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
            {ELEMENTAL_ALGEMON_TYPES.map(t => {
              const stage0 = EVOLUTION_DATA[t].stages[0];
              return (
                <button key={t} onClick={() => setStartType(t)} style={{
                  ...btnBase, padding: "7px 4px", fontSize: 10, lineHeight: 1.7, textAlign: "center",
                  background: startType === t ? TYPE_COLOR[t] : P.light,
                  color: startType === t ? "#fff" : P.border,
                  outline: startType === t ? `3px solid ${P.border}` : "none", outlineOffset: 2,
                }}>
                  <div style={{ fontSize: 16 }}>{stage0.emoji}</div>
                  <div style={{ fontWeight: "bold" }}>{stage0.name}</div>
                  <div style={{ fontSize: 9, fontWeight: "normal", opacity: 0.8 }}>{t}</div>
                </button>
              );
            })}
          </div>
          {startType && (
            <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "6px 10px", marginBottom: 12, fontSize: 11, color: P.light, lineHeight: 1.6 }}>
              <b>{EVOLUTION_DATA[startType].stages[0].name}</b> specialises in <b>{ALGE_DB[TYPE_TOPIC[startType]].topicName}</b>.<br />
              Evolves: Lv11 → {EVOLUTION_DATA[startType].stages[1].name} {EVOLUTION_DATA[startType].stages[1].emoji}  &nbsp;
              Lv21 → {EVOLUTION_DATA[startType].stages[2].name} {EVOLUTION_DATA[startType].stages[2].emoji}
            </div>
          )}
          <button onClick={() => {
            if (!startName.trim() || !startType) return;
            setStats({
              name: startName.trim(), activeIndex: 0,
              party: [{ baseType: startType, color: TYPE_COLOR[startType], xp: 0 }],
              box: [],
              algecoins: 0,
              gymBeaten: Array(8).fill(false), eliteFourBeaten: Array(4).fill(false),
              inventory: { hints: 0, algaballs: 0, potions: 0 },
              totalQuestions: 0, totalCorrect: 0,
              caughtSpecies: [getSpeciesId(startType, 0)],
              usedQuestions: {},
              dseScholar: false,
              wrongAttempts: [],
            });
            setScreen("hub");
          }} disabled={!startName.trim() || !startType || Boolean(nameError)}
            style={{ ...(!startName.trim() || !startType || Boolean(nameError) ? btnDisabled : btnDark), width: "100%", padding: "11px 0", fontSize: 14 }}>
            ▶ BEGIN ADVENTURE
          </button>
          <div style={{ marginTop: 14, borderTop: `2px solid ${P.border}`, paddingTop: 12 }}>
            <div style={{ fontSize: 10, color: P.light, marginBottom: 5, fontWeight: "bold" }}>📖 CONTINUE WITH SAVE CODE</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={saveCodeInput}
                onChange={e => { setSaveCodeInput(e.target.value); setSaveCodeError(""); }}
                placeholder="WSCSS-V6-eyJ2IjoG..."
                style={{ flex: 1, background: P.darkBg, border: `2px solid ${P.border}`, color: P.light, padding: "6px 8px", fontSize: 10, fontFamily: "monospace", borderRadius: 3, outline: "none" }}
              />
              <button onClick={() => {
                const parsed = parseSaveCode(saveCodeInput, startName);
                if (!parsed) { setSaveCodeError("Invalid save code — check it and try again."); return; }
                setStats(parsed);
                setScreen("hub");
              }} style={{ ...btnDark, padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>
                LOAD
              </button>
            </div>
            {saveCodeError && <div style={{ color: "#ef9a9a", fontSize: 10, marginTop: 5 }}>{saveCodeError}</div>}
            <div style={{ fontSize: 9, color: "#666", marginTop: 4 }}>Trainer name is optional when loading a code.</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  // ── Gym cutscene overlay ─────────────────────────────────────
  if (screen === "gymCutscene" && pendingGymId !== null) {
    const gym = GYM_DATA[pendingGymId];
    return (
      <div style={{ ...wrap, alignItems: "center", justifyContent: "center", background: "#0a0f0a" }}>
        <div style={{ textAlign: "center", color: "#fff", padding: "0 20px", maxWidth: 340 }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: "bounce 0.8s infinite alternate" }}>{gym.enemyEmoji}</div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#9bbc0f", fontWeight: "bold", marginBottom: 8 }}>
            ⚔️ GYM {pendingGymId + 1} BATTLE ⚔️
          </div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#ffd54f", marginBottom: 6, fontFamily: "monospace" }}>
            {gym.gymName}
          </div>
          <div style={{ fontSize: 13, color: "#a5d6a7", marginBottom: 4 }}>{gym.locationName}</div>
          <div style={{ fontSize: 13, color: "#e8f5e9", marginBottom: 12 }}>
            <b>{gym.leaderName}</b> challenges you to a battle!
          </div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 20 }}>
            Topic: {ALGE_DB[gym.topic].topicName} &nbsp;|&nbsp; Foe Lv {gym.foeLevel}
          </div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>loading…</div>
        </div>
      </div>
    );
  }

  const act     = active(stats);
  const lv      = xpToLevel(act.xp);   // per-Algemon level
  const badges  = stats.gymBeaten.filter(Boolean).length;
  const e4beats = stats.eliteFourBeaten.filter(Boolean).length;
  const allGyms = badges >= 8;
  const isChamp = allGyms && e4beats >= 4;
  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : null;
  const currentStage = getStage(lv);
  const activeName   = memberName(act, lv);
  const activeEmoji  = memberEmoji(act, lv);
  const defBonus     = memberDefBonus(act, lv);

  function PlayerBar({ goHub }: { goHub?: boolean }) {
    return (
      <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ color: P.light, fontSize: 12, fontWeight: "bold" }}>{stats!.name} — {activeEmoji} {activeName}</span>
          {goHub && <button onClick={() => setScreen("hub")} style={{ ...btnLight, fontSize: 10, padding: "3px 8px" }}>← HUB</button>}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
          <StatBadge label="AC" value={stats!.algecoins} color={P.gold} />
          <StatBadge label="Stage" value={currentStage} color={defBonus > 0 ? "#90caf9" : P.light} />
          <StatBadge label="Badges" value={`${badges}/8`} color={P.gold} />
          {isChamp && <StatBadge label="🏆" value="CHAMPION" color="#ff8f00" />}
        </div>
        <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
          {["🌿","💧","❄️","☀️","🌩️","🦋","🏋️","🗺️"].map((b, i) => (
            <span key={i} style={{ fontSize: 13, opacity: stats!.gymBeaten[i] ? 1 : 0.2, filter: stats!.gymBeaten[i] ? "none" : "grayscale(1)" }}>{b}</span>
          ))}
        </div>
        <XpBar xp={active(stats!).xp} label={activeName} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // HUB — 6-button main menu
  // ══════════════════════════════════════════════════════════════
  if (screen === "hub") {
    const nextGym   = GYM_DATA.find((_, i) => !stats.gymBeaten[i]);
    const nextElite = allGyms ? ELITE_FOUR.find((_, i) => !stats.eliteFourBeaten[i]) : null;
    const highestPartyLv = Math.max(...stats.party.map((p) => xpToLevel(p.xp)));
    const gymsBeaten   = stats.gymBeaten.filter(Boolean).length;
    const wildNextType = gymsBeaten >= 8
      ? "All Types (Elite Prep)"
      : ALGE_DB[TYPE_TOPIC[GYM_DATA[gymsBeaten].catchType]].topicName;
    const buttons = [
      {
        icon: "🌿", label: "(1) Wild Algemon Encounter",
        sub: `Topic: ${wildNextType} · Foe is 1–3 Lv below you (Lv ${lv})`,
        action: () => { setLastResult(null); startWildBattle(); },
      },
      {
        icon: "🏅", label: `(2) Challenge Gym${allGyms ? " / Elite Four" : ""}`,
        sub: isChamp ? "🏆 CHAMPION — All cleared!" : nextElite ? `ELITE: ${nextElite.name} awaits! (Lv ${highestPartyLv + nextElite.id + 1})` : nextGym ? `Next: ${nextGym.gymName} (Foe Lv ${nextGym.foeLevel})` : "All gyms beaten!",
        action: () => { setLastResult(null); setScreen("gymSelect"); },
      },
      {
        icon: "📦", label: "(3) Alge-Box (Party + PC)",
        sub: `Party ${stats.party.length}/6 · Box ${stats.box.length}${stats.box.length > 0 ? " — use swap/withdraw here" : ""}`,
        action: () => { setLastResult(null); setScreen("algeBox"); },
      },
      {
        icon: "🧠", label: "(4) Wrong Answer Review",
        sub: stats.wrongAttempts.length > 0
          ? `${stats.wrongAttempts.length} recorded mistakes · tap to see step-by-step hints`
          : "No mistakes recorded yet — great job so far!",
        action: () => { setLastResult(null); setScreen("mistakes"); },
      },
      {
        icon: "🛒", label: "(5) WSCSS Tuck Shop",
        sub: `Hint 50AC · Algaball 50AC · Potion 30AC  |  Balance: ${stats.algecoins} AC`,
        action: () => { setLastResult(null); setScreen("shop"); },
      },
      {
        icon: "📊", label: "(6) Show Status / Save",
        sub: `Accuracy: ${accuracy !== null ? accuracy + "%" : "N/A"}  |  Dex: ${stats.caughtSpecies.length}/${SPECIES_LIST.length}  |  Save Code`,
        action: () => { setLastResult(null); setScreen("status"); },
      },
      {
        icon: "📚", label: "(7) Alge-Library",
        sub: "Cheat sheet — key formulas and traps for all 10 topics",
        action: () => { setLastResult(null); setScreen("library"); },
      },
    ];
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ textAlign: "center", color: P.border, fontSize: 15, fontWeight: "bold", marginBottom: 10 }}>📋 TRAINER HUB</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
            <button onClick={() => setMusicEnabled(v => !v)} style={{ ...btnLight, fontSize: 10, padding: "4px 8px" }}>
              {musicEnabled ? "🎵 Music ON" : "🎵 Music OFF"}
            </button>
            <button onClick={() => setSfxEnabled(v => !v)} style={{ ...btnLight, fontSize: 10, padding: "4px 8px" }}>
              {sfxEnabled ? "🔊 SFX ON" : "🔇 SFX OFF"}
            </button>
          </div>
          <PlayerBar />
          {lastResult && (
            <div style={{ background: lastResult.won ? "#c8e6c9" : "#ffcdd2", border: `2px solid ${lastResult.won ? P.green : P.red}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10, fontSize: 11 }}>
              {lastResult.caught
                ? lastResult.sentToBox
                  ? `📦 ${lastResult.speciesName ?? "Algemon"} sent to Alge-Box! (Party full) +${lastResult.xpGained} XP`
                  : `Gotcha! ${lastResult.speciesName ?? "Algemon"} joined your party! +${lastResult.xpGained} XP`
                : lastResult.won
                ? `Victory! +${lastResult.coinsGained} AC  +${lastResult.xpGained} XP${lastResult.badgeEarned ? "  +Badge!" : ""}${lastResult.newLv ? `  ★ LV ${lastResult.newLv}!` : ""}`
                : "You fainted! No coins lost — review your study notes and try again."}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {buttons.map((item, i) => (
              <button key={i} onClick={() => item.action()}
                style={{ ...btnBase, textAlign: "left", padding: "9px 12px", background: P.darkBg, color: "#fff", cursor: "pointer", boxShadow: `3px 3px 0 ${P.border}`, fontSize: 12, lineHeight: 1.6 }}>
                <div>{item.icon} <b>{item.label}</b></div>
                <div style={{ fontSize: 10, color: "#a0d878", fontWeight: "normal" }}>{item.sub}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // GYM SELECT + ELITE FOUR
  // ══════════════════════════════════════════════════════════════
  if (screen === "gymSelect") {
    const firstUnbeaten      = stats.gymBeaten.findIndex(b => !b);
    const firstUnbeatenElite = stats.eliteFourBeaten.findIndex(b => !b);
    const highestPartyLv = Math.max(...stats.party.map((p) => xpToLevel(p.xp)));
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>🏅 GYM SELECTION</h2>
          <PlayerBar goHub />
          <div style={{ fontSize: 10, color: P.border, marginBottom: 8 }}>Your Lv {lv} vs. each gym's Foe Level. Level up in wild battles for an advantage!</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {GYM_DATA.map((gym, i) => {
              const beaten   = stats.gymBeaten[i];
              const unlocked = i === 0 || stats.gymBeaten[i - 1];
              const isNext   = i === firstUnbeaten;
              return (
                <button key={i} onClick={() => { if (unlocked && !beaten) { setLastResult(null); setPendingGymId(i); setScreen("gymCutscene"); } }}
                  style={{ ...btnBase, textAlign: "left", padding: "8px 11px", fontSize: 11, lineHeight: 1.7, background: beaten ? "#4a6141" : unlocked && isNext ? P.darkBg : "#555", color: beaten ? "#a0d878" : unlocked ? "#fff" : "#888", cursor: unlocked && !beaten ? "pointer" : "not-allowed", boxShadow: beaten || !unlocked ? "none" : `3px 3px 0 ${P.border}` }}>
                  <div>{beaten ? "✅" : unlocked ? gym.enemyEmoji : "🔒"} <b>GYM {i + 1}:</b> {gym.locationName} — {gym.gymName}</div>
                  <div style={{ fontSize: 10, color: beaten ? "#a0d878" : unlocked ? "#c0e08a" : "#666" }}>
                    {gym.leaderName} | {ALGE_DB[gym.topic].topicName} | Foe Lv {gym.foeLevel} | {gym.reward} AC + {gym.badge}
                    {beaten ? "  ✓ CLEARED" : isNext ? "  ← CHALLENGE" : !unlocked ? "  🔒 LOCKED" : ""}
                  </div>
                </button>
              );
            })}
          </div>
          {allGyms && (
            <>
              <div style={{ background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: "6px 10px", marginBottom: 8, textAlign: "center", color: P.gold, fontSize: 11, fontWeight: "bold" }}>
                ★ ELITE FOUR UNLOCKED ★
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ELITE_FOUR.map((el, i) => {
                  const beaten   = stats.eliteFourBeaten[i];
                  const unlocked = i === 0 || stats.eliteFourBeaten[i - 1];
                  const isNext   = i === firstUnbeatenElite;
                  return (
                    <button key={i} onClick={() => { if (unlocked && !beaten) { setScreen("hub"); startEliteBattle(i); } }}
                      style={{ ...btnBase, textAlign: "left", padding: "8px 11px", fontSize: 11, lineHeight: 1.7, background: beaten ? "#3a2a5a" : unlocked && isNext ? "#4a148c" : "#333", color: beaten ? "#ce93d8" : unlocked ? "#fff" : "#888", cursor: unlocked && !beaten ? "pointer" : "not-allowed", boxShadow: beaten || !unlocked ? "none" : `3px 3px 0 ${P.border}` }}>
                      <div>{beaten ? "✅" : unlocked ? el.enemyEmoji : "🔒"} <b>ELITE {i + 1}:</b> {el.name} — {el.title}</div>
                      <div style={{ fontSize: 10, color: beaten ? "#ce93d8" : unlocked ? "#e1bee7" : "#555" }}>
                        {el.enemyName} | Foe Lv {highestPartyLv + i + 1} | Mixed Topics | {ELITE_WIN_COINS} AC
                        {beaten ? "  ✓ DEFEATED" : isNext ? "  ← CHALLENGE" : "  🔒 LOCKED"}
                      </div>
                    </button>
                  );
                })}
              </div>
              {isChamp && (
                <div style={{ marginTop: 8, background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: 8, textAlign: "center", color: P.gold, fontSize: 13, fontWeight: "bold" }}>
                  🏆 YOU ARE THE WSCSS ALGEMON CHAMPION! 🏆
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // CHANGE ALGEMON
  // ══════════════════════════════════════════════════════════════
  if (screen === "changeAlgemon") {
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>🔄 CHANGE ALGEMON</h2>
          <PlayerBar goHub />
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {stats.party.map((member, i) => {
              const isActive = i === stats.activeIndex;
              const mLv    = xpToLevel(member.xp);
              const mName  = memberName(member, mLv);
              const mEmoji = memberEmoji(member, mLv);
              const stg    = getStage(mLv);
              const def    = EVOLUTION_DATA[member.baseType].stages[stg].defenseBonus;
              return (
                <button key={i} onClick={() => { if (!isActive) setStats(s => s ? { ...s, activeIndex: i } : s); }}
                  style={{ ...btnBase, display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", fontSize: 12, lineHeight: 1.7, background: isActive ? member.color + "cc" : P.darkBg, color: "#fff", cursor: isActive ? "default" : "pointer", outline: isActive ? `3px solid ${P.gold}` : "none", outlineOffset: 2 }}>
                  <AlgemonSVG type={member.baseType} stage={stg} speciesId={member.baseType === "Legendary" ? DOUBLE_STAR_SPECIES_ID : undefined} size={44} isEnemy={false} animate={false} />
                  <div style={{ textAlign: "left" }}>
                    <b>{mName}</b>
                    {isActive && <span style={{ marginLeft: 8, fontSize: 10, color: P.gold }}>★ ACTIVE</span>}
                    <div style={{ fontSize: 10, color: isActive ? "#e0f0c0" : "#a0d878", fontWeight: "normal" }}>
                      {member.baseType} · Lv {mLv} · Stage {stg} · {ALGE_DB[TYPE_TOPIC[member.baseType]].topicName}
                      {def > 0 && ` · Shield ${Math.round(def * 100)}%`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {stats.party.length < 6 && (
            <div style={{ marginTop: 8, fontSize: 10, color: "#3a5a1a", textAlign: "center" }}>
              Catch Algemons in battle to fill your party! ({6 - stats.party.length} slots free)
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ALGE-BOX — PC Storage
  // ══════════════════════════════════════════════════════════════
  if (screen === "algeBox") {
    function doSwap(kind: "box" | "party", idx: number) {
      if (!swapSrc) { setSwapSrc({ kind, idx }); return; }
      if (swapSrc.kind === kind && swapSrc.idx === idx) { setSwapSrc(null); return; }
      // Execute the swap
      setStats(s => {
        if (!s) return s;
        const party = [...s.party];
        const box   = [...s.box];
        if (swapSrc.kind === "box" && kind === "party") {
          const tmp = party[idx];
          party[idx] = box[swapSrc.idx];
          box[swapSrc.idx] = tmp;
        } else if (swapSrc.kind === "party" && kind === "box") {
          const tmp = box[idx];
          box[idx] = party[swapSrc.idx];
          party[swapSrc.idx] = tmp;
          // Keep activeIndex valid
          const ai = s.activeIndex === swapSrc.idx ? Math.min(swapSrc.idx, party.length - 1) : s.activeIndex;
          return { ...s, party, box, activeIndex: ai };
        } else if (swapSrc.kind === "box" && kind === "box") {
          const tmp = box[idx];
          box[idx] = box[swapSrc.idx];
          box[swapSrc.idx] = tmp;
        } else {
          const tmp = party[idx];
          party[idx] = party[swapSrc.idx];
          party[swapSrc.idx] = tmp;
        }
        return { ...s, party, box };
      });
      setSwapSrc(null);
    }

    function releaseToBox(partyIdx: number) {
      if (!stats || stats.party.length <= 1) return; // can't release last Algemon
      setStats(s => {
        if (!s) return s;
        const party = [...s.party];
        const released = party.splice(partyIdx, 1)[0];
        const box = [...s.box, released];
        const ai = s.activeIndex >= party.length ? party.length - 1 : s.activeIndex;
        return { ...s, party, box, activeIndex: ai };
      });
    }

    function withdrawFromBox(boxIdx: number) {
      if (!stats || stats.party.length >= 6) return; // party full
      setStats(s => {
        if (!s) return s;
        const box = [...s.box];
        const member = box.splice(boxIdx, 1)[0];
        const party = [...s.party, member];
        return { ...s, party, box };
      });
    }

    const MemberCard = ({ m, kind, idx }: { m: PartyMember; kind: "party" | "box"; idx: number }) => {
      const mLv    = xpToLevel(m.xp);
      const mName  = memberName(m, mLv);
      const mEmoji = memberEmoji(m, mLv);
      const stg    = getStage(mLv);
      const isSelected = swapSrc?.kind === kind && swapSrc.idx === idx;
      const isActive   = kind === "party" && idx === stats.activeIndex;
      return (
        <div style={{ background: isSelected ? "#2e7d32" : isActive ? "#1a3a1a" : P.logBg, border: `2px solid ${isSelected ? P.gold : P.border}`, borderRadius: 6, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <AlgemonSVG type={m.baseType} stage={stg} speciesId={m.baseType === "Legendary" ? DOUBLE_STAR_SPECIES_ID : undefined} size={36} isEnemy={false} animate={false} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: "bold" }}>
              {mEmoji} {mName} {isActive && <span style={{ color: "#a0d878", fontSize: 9 }}>★ACT</span>}
            </div>
            <div style={{ color: "#a0d878", fontSize: 9 }}>
              {m.baseType} · Lv {mLv} · {ALGE_DB[TYPE_TOPIC[m.baseType]].topicName}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <button onClick={() => doSwap(kind, idx)}
              style={{ ...btnLight, fontSize: 9, padding: "3px 6px" }}>
              {isSelected ? "CANCEL" : "SWAP"}
            </button>
            {kind === "party" && (
              <button onClick={() => releaseToBox(idx)} disabled={stats.party.length <= 1 || isActive}
                title={isActive ? "Can't box active" : "Move to Box"}
                style={{ ...(stats.party.length <= 1 || isActive ? btnDisabled : btnDark), fontSize: 9, padding: "3px 6px" }}>
                →BOX
              </button>
            )}
            {kind === "box" && (
              <button onClick={() => withdrawFromBox(idx)} disabled={stats.party.length >= 6}
                title={stats.party.length >= 6 ? "Party full" : "Add to party"}
                style={{ ...(stats.party.length >= 6 ? btnDisabled : btnDark), fontSize: 9, padding: "3px 6px" }}>
                →PTY
              </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div style={wrap}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold" }}>📦 ALGE-BOX</h2>
            <button onClick={() => { setSwapSrc(null); setScreen("hub"); }} style={{ ...btnLight, fontSize: 11, padding: "4px 10px" }}>← HUB</button>
          </div>
          {swapSrc && (
            <div style={{ background: "#2e7d32", border: `2px solid ${P.gold}`, borderRadius: 4, padding: "5px 10px", marginBottom: 8, fontSize: 10, color: P.gold }}>
              ↔️ SWAP MODE — select another Algemon to swap with, or press CANCEL.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ color: P.border, fontSize: 11, fontWeight: "bold", marginBottom: 5 }}>
                PARTY ({stats.party.length}/6)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {stats.party.map((m, i) => <MemberCard key={i} m={m} kind="party" idx={i} />)}
                {stats.party.length < 6 && (
                  <div style={{ border: `2px dashed ${P.border}`, borderRadius: 5, padding: "8px", textAlign: "center", color: "#3a5a1a", fontSize: 10 }}>
                    {6 - stats.party.length} slot{6 - stats.party.length > 1 ? "s" : ""} free
                  </div>
                )}
              </div>
            </div>
            <div>
              <div style={{ color: P.border, fontSize: 11, fontWeight: "bold", marginBottom: 5 }}>
                BOX ({stats.box.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 380, overflowY: "auto" }}>
                {stats.box.length === 0
                  ? <div style={{ color: "#3a5a1a", fontSize: 10, textAlign: "center", padding: 10 }}>Empty — catch Algemons in wild battles!</div>
                  : stats.box.map((m, i) => <MemberCard key={i} m={m} kind="box" idx={i} />)
                }
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "#3a5a1a" }}>
            Tip: Click SWAP on two Algemon to exchange them. →BOX moves from party to box; →PTY withdraws from box.
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SHOP — 3 items
  // ══════════════════════════════════════════════════════════════
  if (screen === "shop") {
    const inv = stats.inventory;
    const shopItems = [
      { icon: "💡", name: "Hint Tool",  desc: "Reveals a topic hint in battle. Free at Level 5+.", cost: HINT_TOOL_COST, own: inv.hints,     key: "hints"     as const },
      { icon: "⭕", name: "Algaball",  desc: `Throw in Wild battle. Catch chance = (1 − foe HP%) × 85%. Weaken the foe for the best odds!`, cost: ALGEBALL_COST, own: inv.algaballs, key: "algaballs" as const },
      { icon: "🧪", name: "Potion",    desc: `Restores ${POTION_HEAL} HP. Does NOT consume your turn.`,                     cost: POTION_COST,   own: inv.potions,   key: "potions"   as const },
    ];
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>🛒 WSCSS TUCK SHOP</h2>
          <PlayerBar goHub />
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 12px", marginBottom: 10 }}>
            <div style={{ color: P.gold, fontSize: 13, fontWeight: "bold" }}>💰 Balance: {stats.algecoins} AC</div>
            <div style={{ color: P.light, fontSize: 10, marginTop: 2 }}>Wild: {WILD_WIN_COINS} AC | Gym: {GYM_WIN_COINS} AC | Elite: {ELITE_WIN_COINS} AC</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shopItems.map(item => {
              const canAfford = stats.algecoins >= item.cost;
              return (
                <div key={item.key} style={{ background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 6, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: P.gold, fontSize: 13, fontWeight: "bold" }}>{item.icon} {item.name} ×{item.own}</div>
                    <div style={{ color: P.logText, fontSize: 10, marginTop: 3, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ color: P.gold, fontSize: 13, fontWeight: "bold" }}>{item.cost} AC</div>
                    <button onClick={() => {
                      if (canAfford) setStats(s => s ? { ...s, algecoins: s.algecoins - item.cost, inventory: { ...s.inventory, [item.key]: s.inventory[item.key] + 1 } } : s);
                    }} style={{ ...(canAfford ? btnDark : btnDisabled), fontSize: 11, padding: "5px 10px", marginTop: 4 }}>BUY</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // STATUS SCREEN
  // ══════════════════════════════════════════════════════════════
  if (screen === "status") {
    const collected = SPECIES_LIST.filter(sp => stats.caughtSpecies.includes(sp.id));
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>📊 TRAINER STATUS</h2>
          <PlayerBar goHub />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[
              { label: "Level",          value: `LV ${lv} (Stage ${currentStage})` },
              { label: "Active XP",      value: act.xp },
              { label: "Accuracy Rate",  value: accuracy !== null ? `${accuracy}%` : "N/A" },
              { label: "Questions",      value: `${stats.totalCorrect}/${stats.totalQuestions}` },
              { label: "Algecoins",      value: `${stats.algecoins} AC` },
              { label: "Gym Badges",     value: `${badges}/8` },
              { label: "Elite Defeated", value: `${e4beats}/4` },
              { label: "Shield Bonus",   value: `${Math.round(defBonus * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "6px 10px" }}>
                <div style={{ fontSize: 9, color: "#a0d878" }}>{label}</div>
                <div style={{ fontSize: 13, color: P.gold, fontWeight: "bold" }}>{value}</div>
              </div>
            ))}
          </div>
          {stats.dseScholar && (
            <div style={{ background: `linear-gradient(90deg, #2d2508, #5c4a0a)`, border: `2px solid ${P.gold}`, borderRadius: 4, padding: "8px 12px", marginBottom: 10, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#fff9c4", fontWeight: "bold", letterSpacing: 1 }}>DSE SCHOLAR</div>
              <div style={{ fontSize: 9, color: P.gold, marginTop: 2 }}>Honoured trainer — you met Double-Star on the long road.</div>
            </div>
          )}
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "8px 12px", marginBottom: 10 }}>
            <div style={{ color: P.light, fontSize: 11, fontWeight: "bold", marginBottom: 6 }}>📖 ALGEMON DEX — {collected.length}/{SPECIES_LIST.length}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SPECIES_LIST.map(sp => {
                const caught = stats.caughtSpecies.includes(sp.id);
                return (
                  <div key={sp.id} title={caught ? `${sp.name} · ${sp.topic}` : "??? (not yet caught)"}
                    style={{ opacity: caught ? 1 : 0.18, filter: caught ? "none" : "grayscale(1) brightness(0.4)", cursor: "default" }}>
                    <AlgemonSVG type={sp.type} stage={sp.stage} speciesId={sp.id === DOUBLE_STAR_SPECIES_ID ? DOUBLE_STAR_SPECIES_ID : undefined} size={34} animate={false} />
                  </div>
                );
              })}
            </div>
            {collected.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 9, color: "#a0d878" }}>
                {collected.map(sp => sp.name).join("  ·  ")}
              </div>
            )}
          </div>
          <div style={{ background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: P.logText, marginBottom: 3, fontWeight: "bold" }}>SAVE CODE</div>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: "bold", wordBreak: "break-all", marginBottom: 6 }}>{buildSaveCode(stats)}</div>
            <button onClick={() => navigator.clipboard?.writeText(buildSaveCode(stats))} style={{ ...btnLight, fontSize: 10, padding: "4px 10px" }}>📋 COPY</button>
          </div>
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "8px 12px" }}>
            <div style={{ color: P.light, fontSize: 11, fontWeight: "bold", marginBottom: 4 }}>🎒 BAG</div>
            <div style={{ display: "flex", gap: 8 }}>
              <StatBadge label="💡 Hints"    value={stats.inventory.hints} />
              <StatBadge label="⭕ Algaballs" value={stats.inventory.algaballs} />
              <StatBadge label="🧪 Potions"  value={stats.inventory.potions} />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // WRONG ANSWER REVIEW
  // ══════════════════════════════════════════════════════════════
  if (screen === "mistakes") {
    const latestFirst = [...stats.wrongAttempts].reverse();
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>🧠 WRONG ANSWER REVIEW</h2>
          <PlayerBar goHub />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ color: P.border, fontSize: 10 }}>
              Mistakes saved: <b>{stats.wrongAttempts.length}</b> (most recent first)
            </div>
            <button
              onClick={() => setStats(s => s ? { ...s, wrongAttempts: [] } : s)}
              disabled={stats.wrongAttempts.length === 0}
              style={{ ...(stats.wrongAttempts.length === 0 ? btnDisabled : btnLight), fontSize: 10, padding: "4px 8px" }}
            >
              CLEAR
            </button>
          </div>
          {latestFirst.length === 0 ? (
            <div style={{ background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 5, padding: "12px 10px", textAlign: "center", color: "#a0d878", fontSize: 11 }}>
              No wrong answers yet. Keep battling!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 420, overflowY: "auto" }}>
              {latestFirst.map((w, i) => (
                <div key={i} style={{ background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 5, padding: "8px 10px" }}>
                  <div style={{ color: P.gold, fontSize: 10, fontWeight: "bold", marginBottom: 4 }}>
                    {w.mode === "mc" ? "MC" : "CATCH SA"} · {w.topic}
                  </div>
                  <div style={{ color: P.light, fontSize: 10, marginBottom: 4 }}>
                    {w.question.includes("$") ? <MathText>{w.question}</MathText> : w.question}
                  </div>
                  <div style={{ color: "#a5d6a7", fontSize: 10, marginBottom: 3 }}>
                    Correct answer: {w.correctAnswer}
                  </div>
                  <div style={{ color: "#90caf9", fontSize: 10, lineHeight: 1.5 }}>
                    Step-by-step: {w.solution}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ALGE-LIBRARY
  // ══════════════════════════════════════════════════════════════
  if (screen === "library") {
    return (
      <div style={wrap}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold" }}>📚 ALGE-LIBRARY</h2>
            <button onClick={() => setScreen("hub")} style={{ ...btnLight, fontSize: 11, padding: "4px 10px" }}>← HUB</button>
          </div>
          <div style={{ fontSize: 10, color: P.border, marginBottom: 10 }}>Tap a topic to expand. Learn the formulas — memorise the TRAPS!</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STUDY_GUIDE.map((sec, i) => {
              const open = libOpen === i;
              return (
                <div key={i} style={{ border: `2px solid ${P.border}`, borderRadius: 5, overflow: "hidden" }}>
                  <button onClick={() => setLibOpen(open ? null : i)}
                    style={{ ...btnBase, width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 0, border: "none", boxShadow: "none", background: open ? P.darkBg : P.light, color: open ? "#fff" : P.border, fontSize: 12 }}>
                    {sec.emoji} <b>{sec.topicName}</b> {open ? "▲" : "▼"}
                  </button>
                  {open && (
                    <div style={{ background: P.logBg, padding: "10px 14px" }}>
                      <div style={{ color: P.gold, fontSize: 10, fontWeight: "bold", marginBottom: 4 }}>KEY FORMULAS</div>
                      {sec.formulas.map((f, j) => <div key={j} style={{ color: P.logText, fontSize: 10, marginBottom: 4, lineHeight: 1.5 }}>• {f}</div>)}
                      <div style={{ color: "#ff8a65", fontSize: 10, fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>⚠️ COMMON TRAPS</div>
                      {sec.traps.map((t, j) => <div key={j} style={{ color: "#ffccbc", fontSize: 10, marginBottom: 4, lineHeight: 1.5 }}>⚡ {t}</div>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // EVOLUTION SCREEN
  // ══════════════════════════════════════════════════════════════
  if (screen === "evolution" && pendingEvolution) {
    const { toStage, newLevel, evolutions } = pendingEvolution;
    const stageNames = ["Base Form", "Stage 2", "Final Form"];
    return (
      <div style={wrap}>
        <Card>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>✨ EVOLUTION! ✨</div>
            <div style={{ color: P.border, fontSize: 13, fontWeight: "bold" }}>Reached Level {newLevel}!</div>
            <div style={{ color: "#546e7a", fontSize: 11, marginTop: 2 }}>{evolutions[0].from} evolved to {stageNames[toStage]}!</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {evolutions.map((evo, i) => (
              <div key={i} style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 6, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#90a4ae", marginBottom: 2 }}>WAS</div>
                  <div style={{ fontSize: 22 }}>{TYPE_EMOJI[evo.type]}</div>
                  <div style={{ color: P.light, fontSize: 11, fontWeight: "bold" }}>{evo.from}</div>
                </div>
                <div style={{ fontSize: 20, color: P.gold }}>→</div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 10, color: P.gold, marginBottom: 2 }}>EVOLVED INTO</div>
                  <div style={{ fontSize: 26 }}>{evo.emoji}</div>
                  <div style={{ color: P.gold, fontSize: 12, fontWeight: "bold" }}>{evo.to}</div>
                </div>
              </div>
            ))}
          </div>
          {toStage > 0 && (
            <div style={{ background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: P.logText }}>
              🛡️ <b>Defense Bonus Active!</b> Stage {toStage} Algemon now absorb{" "}
              <b style={{ color: P.gold }}>{Math.round(EVOLUTION_DATA[evolutions[0].type].stages[toStage].defenseBonus * 100)}%</b> of incoming damage from wrong answers.
            </div>
          )}
          <button onClick={() => { setPendingEvolution(null); setScreen("hub"); }} style={{ ...btnDark, width: "100%", padding: "11px 0", fontSize: 13 }}>
            ✨ CONTINUE TO HUB
          </button>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ══════════════════════════════════════════════════════════════
  if (screen === "result" && ctx) {
    const r   = lastResult;
    const won = r?.won ?? false;
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", color: r?.caught ? P.blue : won ? P.green : P.red, marginBottom: 8 }}>
            {r?.caught ? "🎉 CAUGHT!" : won ? "🏆 VICTORY!" : "😵 FAINTED!"}
          </h2>
          <p style={{ textAlign: "center", color: P.border, fontSize: 12, marginBottom: 12 }}>
            {r?.caught ? `${r.speciesName ?? ctx.enemyName} joined your party!` : won ? `${ctx.enemyName} was defeated! Well done, ${stats.name}!` : `Review ${ctx.mode !== "elite" ? ALGE_DB[ctx.topic].topicName : "the Elite topics"} and try again.`}
          </p>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "10px 6px", marginBottom: 10 }}>
            <div style={{ textAlign: "center" }}>
              <AlgemonSVG type={act.baseType} stage={getStage(lv)} speciesId={act.baseType === "Legendary" ? DOUBLE_STAR_SPECIES_ID : undefined} size={72} isEnemy={false} fainted={!won} animate={false} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{stats.name}</div>
            </div>
            <div style={{ fontSize: 18, color: P.light, paddingBottom: 14 }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <AlgemonSVG type={ctx.enemyType} stage={ctx.enemyStage} speciesId={ctx.speciesId === DOUBLE_STAR_SPECIES_ID ? DOUBLE_STAR_SPECIES_ID : undefined} size={80} isEnemy fainted={won && !r?.caught} animate={false} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{ctx.enemyName}</div>
            </div>
          </div>
          {r && (
            <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10, fontSize: 11 }}>
              {r.xpGained > 0    && <div style={{ color: P.light }}>+{r.xpGained} XP</div>}
              {r.coinsGained > 0 && <div style={{ color: P.gold }}>+{r.coinsGained} Algecoins</div>}
              {r.badgeEarned     && <div style={{ color: P.gold }}>+1 Badge earned!</div>}
              {r.dseScholarUnlocked && <div style={{ color: P.gold }}>DSE Scholar badge — profile updated!</div>}
              {r.eliteId !== undefined && won && !r.caught && <div style={{ color: "#ce93d8" }}>Elite {r.eliteId! + 1} defeated!</div>}
              {r.newLv           && <div style={{ color: "#90caf9" }}>★ Level Up! Now Level {r.newLv}!</div>}
              {pendingEvolution  && <div style={{ color: P.gold }}>✨ Your Algemon are evolving…</div>}
              {r.caught          && <div style={{ color: "#90caf9" }}>{r.speciesName} added to party!</div>}
              <div style={{ marginTop: 4 }}><XpBar xp={act.xp} label={activeName} /></div>
            </div>
          )}
          {won && (
            <div style={{ background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "6px 10px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: P.logText, marginBottom: 2 }}>SAVE CODE:</div>
              <div style={{ color: P.gold, fontSize: 11, fontWeight: "bold", wordBreak: "break-all" }}>{buildSaveCode(stats)}</div>
            </div>
          )}
          <button onClick={() => setScreen(pendingEvolution ? "evolution" : "hub")}
            style={{ ...btnDark, width: "100%", padding: "10px 0", fontSize: 13 }}>
            {pendingEvolution ? "✨ SEE EVOLUTION →" : "📋 RETURN TO HUB"}
          </button>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // BATTLE SCREEN
  // ══════════════════════════════════════════════════════════════
  if (screen === "battle" && ctx) {
    const catchable  = canCatch(enemyHp);
    const hintAvail  = canUseHint(stats);
    const isElite    = ctx.mode === "elite";
    const topicHint  = shQ?.hint ?? (!isElite ? ALGE_DB[ctx.topic].hint : "Mixed HKDSE topics — apply everything you know!");
    const modeLabel  = isElite ? `ELITE ${ctx.eliteId! + 1}: ${ELITE_FOUR[ctx.eliteId!].name}` : ctx.mode === "gym" ? `GYM ${ctx.gymId! + 1}: ${GYM_DATA[ctx.gymId!].gymName}` : "WILD BATTLE";
    const foeLvShow  = ctx.foeLv ?? lv;
    const inv        = stats.inventory;
    const hasBagItems = inv.algaballs > 0 || inv.potions > 0;
    const algaballReady = enemyHp > 0 && ctx.mode === "wild";
    const algaballPct   = Math.round((1 - enemyHp / ENEMY_MAX_HP) * CATCH_MODIFIER * 100);

    return (
      <div style={wrap}>
        <Card>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.border, fontWeight: "bold", marginBottom: 7 }}>
            <span>{isElite ? "🔮" : "⚔️"} {modeLabel}</span>
            <span>LV{lv} S{currentStage} | {stats.algecoins}AC | 💡{inv.hints} ⭕{inv.algaballs} 🧪{inv.potions}</span>
          </div>
          {/* Field */}
          <div style={{ background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "9px 11px", marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
              <div style={{ flex: 1, paddingRight: 7 }}>
                <div style={{ fontSize: 11, color: P.light, marginBottom: 3, fontWeight: "bold" }}>
                  {ctx.enemyName} (Lv {foeLvShow})
                  {ctx.mode === "wild" && catchable && enemyHp > 0 && <span style={{ color: "#ff7043", marginLeft: 5 }}>★ CATCHABLE!</span>}
                </div>
                <HpBar hp={enemyHp} maxHp={ENEMY_MAX_HP} label="" />
              </div>
              <AlgemonSVG type={ctx.enemyType} stage={ctx.enemyStage} speciesId={ctx.speciesId === DOUBLE_STAR_SPECIES_ID ? DOUBLE_STAR_SPECIES_ID : undefined} size={88} isEnemy fainted={enemyHp <= 0} animate />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <AlgemonSVG type={act.baseType} stage={currentStage} speciesId={act.baseType === "Legendary" ? DOUBLE_STAR_SPECIES_ID : undefined} size={76} isEnemy={false} fainted={playerHp <= 0} animate />
              <div style={{ flex: 1, paddingLeft: 7 }}>
                <div style={{ fontSize: 10, color: P.light, marginBottom: 2, fontWeight: "bold" }}>
                  {stats.name}'s {activeName} (Lv {lv}{defBonus > 0 ? ` 🛡️${Math.round(defBonus * 100)}%` : ""})
                </div>
                <HpBar hp={playerHp} maxHp={PLAYER_MAX_HP} label="" />
                <div style={{ fontSize: 9, color: "#90a4ae", marginTop: 2 }}>
                  Your dmg: ~{calcPlayerDmg(lv, foeLvShow)} | Foe dmg: ~{calcFoeDmg(lv, foeLvShow, defBonus)}
                </div>
              </div>
            </div>
          </div>
          {/* Hint */}
          {showHint && (
            <div style={{ background: "#fff9c4", border: `2px solid #f9a825`, color: "#5d4037", borderRadius: 4, padding: "7px 10px", fontSize: 11, marginBottom: 7, lineHeight: 1.5 }}>
              💡 <MathText>{topicHint}</MathText>
            </div>
          )}
          {/* BAG panel */}
          {showBag && (
            <div style={{ background: "#263238", border: `2px solid ${P.border}`, borderRadius: 5, padding: "8px 12px", marginBottom: 7 }}>
              <div style={{ color: "#b0bec5", fontSize: 10, fontWeight: "bold", marginBottom: 6 }}>🎒 BAG — items do NOT consume your turn</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: "#fff", fontSize: 11 }}>🧪 Potion ×{inv.potions}</div>
                  <div style={{ fontSize: 10, color: "#b0bec5", marginBottom: 4 }}>+{POTION_HEAL} HP</div>
                  <button onClick={usePotion} disabled={inv.potions < 1 || playerHp >= PLAYER_MAX_HP}
                    style={{ ...(inv.potions < 1 || playerHp >= PLAYER_MAX_HP ? btnDisabled : { ...btnBase, background: "#00695c", color: "#fff" }), fontSize: 10, padding: "4px 10px" }}>
                    USE
                  </button>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: "#fff", fontSize: 11 }}>⭕ Algaball ×{inv.algaballs}</div>
                  <div style={{ fontSize: 10, color: algaballReady ? "#a5d6a7" : "#b0bec5", marginBottom: 4 }}>
                    {enemyHp <= 0 ? "enemy fainted" : ctx.mode !== "wild" ? "wild only" : `Catch chance: ~${algaballPct}%`}
                  </div>
                  <button onClick={useAlgaball} disabled={inv.algaballs < 1 || enemyHp <= 0}
                    style={{ ...(inv.algaballs < 1 || enemyHp <= 0 ? btnDisabled : { ...btnBase, background: algaballPct >= 40 ? "#00897b" : "#c17f24", color: "#fff" }), fontSize: 10, padding: "4px 10px" }}>
                    THROW
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* CATCH MODE */}
          {catchMode && catchQ ? (
            <>
              <div style={{ background: "#fce4ec", border: `3px solid ${P.red}`, borderRadius: 5, padding: "9px 11px", marginBottom: 7, fontSize: 12, color: "#4a0000", fontWeight: "bold", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {catchQ.text}
              </div>
              <input type="text" value={catchInput} onChange={e => setCatchInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !catchDone) handleCatchSubmit(); }}
                disabled={catchDone} placeholder="Type your answer…"
                style={{ width: "100%", boxSizing: "border-box", ...mono, fontSize: 12, padding: "6px 10px", border: `3px solid ${P.border}`, borderRadius: 4, background: P.white, marginBottom: 7 }} />
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={handleCatchSubmit} disabled={catchDone || !catchInput.trim()}
                  style={{ ...(!catchInput.trim() || catchDone ? btnDisabled : { ...btnBase, background: P.red, color: "#fff" }), flex: 1, padding: "8px 0", fontSize: 12 }}>
                  ✔ SUBMIT CATCH
                </button>
                {hintAvail && <button onClick={handleHint} style={{ ...btnLight, padding: "8px 11px", fontSize: 11, background: showHint ? P.gold : P.light }}>💡</button>}
                {hasBagItems && <button onClick={() => setShowBag(v => !v)} style={{ ...btnLight, padding: "8px 11px", fontSize: 11, background: showBag ? P.gold : P.light }}>🎒</button>}
              </div>
            </>
          ) : (
            /* MC QUESTION */
            shQ && (
              <>
                {!isElite && <div style={{ fontSize: 9, color: "#5a7a2a", marginBottom: 2 }}>Topic: {ALGE_DB[ctx.topic].topicName}</div>}
                <div style={{ background: P.white, border: `3px solid ${P.border}`, borderRadius: 5, padding: "8px 11px", marginBottom: 7, fontSize: 12, color: P.border, fontWeight: "bold", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  <MathText>{shQ.text}</MathText>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
                  {shQ.options.map((opt, i) => {
                    const correct = answered && i === shQ.correct;
                    const wrong   = answered && i !== shQ.correct;
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                        style={{ ...btnBase, background: correct ? "#a5d6a7" : wrong ? "#ffcdd2" : P.light, color: P.border, fontSize: 11, textAlign: "left", padding: "6px 8px", lineHeight: 1.4, cursor: answered ? "default" : "pointer", boxShadow: answered ? "none" : `3px 3px 0 ${P.border}` }}>
                        <b>{["A","B","C","D"][i]}.</b> <MathText>{opt}</MathText>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {ctx.mode === "wild" && catchable && (
                    <div style={{ flex: 1, background: "#e65100", color: "#fff", ...btnBase, padding: "7px 0", fontSize: 10, textAlign: "center", lineHeight: 1.3 }}>
                      ★ CATCHABLE — open 🎒 Bag and THROW an Algaball!
                    </div>
                  )}
                  {hintAvail && (
                    <button onClick={handleHint} style={{ ...btnLight, padding: "7px 10px", fontSize: 11, background: showHint ? P.gold : P.light }}>
                      💡{lv < HINT_MIN_LEVEL && inv.hints > 0 ? ` (${inv.hints})` : ""}
                    </button>
                  )}
                  <button onClick={() => setShowBag(v => !v)} style={{ ...btnLight, padding: "7px 10px", fontSize: 11, background: showBag ? P.gold : P.light }}>
                    🎒
                  </button>
                  <button onClick={() => { setCtx(null); setScreen("hub"); }}
                    style={{ ...btnLight, padding: "7px 10px", fontSize: 11, color: "#b71c1c" }}
                    title={ctx.mode === "wild" ? "Run away from battle" : "Forfeit this challenge"}>
                    ✈ {ctx.mode === "wild" ? "FLEE" : "QUIT"}
                  </button>
                </div>
              </>
            )
          )}
          {/* Battle Log */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, color: P.border, fontWeight: "bold", marginBottom: 2 }}>▼ BATTLE LOG</div>
            <BattleLog entries={log} />
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
