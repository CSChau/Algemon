import { useState, useRef, useEffect } from "react";
import { AlgemonSVG } from "../components/AlgemonSVG";
import {
  AlgemonType, TopicKey, MCQuestion, SAQuestion,
  ALGEMON_TYPES, TYPE_COLOR, TYPE_EMOJI, TYPE_TOPIC,
  WILD_ENEMY, GYM_DATA, ALGE_DB, ELITE_FOUR, STUDY_GUIDE, SPECIES_LIST,
  EVOLUTION_DATA, getEvolutionStage, getSpeciesId,
  PLAYER_MAX_HP, ENEMY_MAX_HP, BASE_DAMAGE,
  calcPlayerDmg, calcFoeDmg,
  CATCH_HP_PCT, XP_PER_CORRECT_WILD, XP_PER_CORRECT_GYM, XP_PER_CORRECT_ELITE,
  XP_PER_LEVEL, HINT_MIN_LEVEL, HINT_TOOL_COST, ALGEBALL_COST, POTION_COST, POTION_HEAL,
  WILD_WIN_COINS, GYM_WIN_COINS, ELITE_WIN_COINS,
  xpToLevel, xpToNextLevel, pickRandom, normalizeAns,
} from "../data/gameData";

// ══════════════════════════════════════════════════════════════
// INTERFACES
// ══════════════════════════════════════════════════════════════
interface PartyMember {
  baseType: AlgemonType;  // permanent type — name/emoji computed from player level
  color:    string;
}

interface ShuffledQ {
  text:    string;
  options: string[];   // randomised every new question
  correct: number;     // new index of the correct answer after shuffle
}

interface PlayerStats {
  name:             string;
  activeIndex:      number;
  party:            PartyMember[];
  xp:               number;
  algecoins:        number;
  gymBeaten:        boolean[];
  eliteFourBeaten:  boolean[];
  inventory:        { hints: number; algaballs: number; potions: number };
  totalQuestions:   number;
  totalCorrect:     number;
  caughtSpecies:    string[];
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
}

interface BattleResult {
  won: boolean; caught: boolean; xpGained: number;
  coinsGained: number; badgeEarned: boolean;
  gymId?: number; eliteId?: number; newLv?: number;
  speciesName?: string;
}

interface PendingEvolution {
  toStage:   0 | 1 | 2;
  newLevel:  number;
  evolutions: { from: string; to: string; emoji: string; type: AlgemonType }[];
}

type Screen = "start" | "hub" | "gymSelect" | "shop" | "changeAlgemon"
            | "status" | "library" | "evolution" | "battle" | "result";

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
  return { text: q.text, options: shuffled, correct: shuffled.indexOf(correctText) };
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

function XpBar({ xp }: { xp: number }) {
  const lv  = xpToLevel(xp);
  const pct = lv >= 30 ? 100 : ((xp - (lv - 1) * XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  const hintFree = lv >= HINT_MIN_LEVEL;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.light, marginBottom: 1 }}>
        <span>LV {lv}  XP {xp}</span>
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
      {entries.map((e, i) => <div key={i}>▸ {e}</div>)}
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
  const [screen, setScreen] = useState<Screen>("start");

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
  const [startType, setStartType] = useState<AlgemonType | null>(null);
  // Library
  const [libOpen, setLibOpen] = useState<number | null>(null);

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-40), msg]);

  const active = (s: PlayerStats) => s.party[s.activeIndex];

  function buildSaveCode(s: PlayerStats): string {
    const lv    = xpToLevel(s.xp);
    const bdg   = s.gymBeaten.filter(Boolean).length;
    const e4    = s.eliteFourBeaten.filter(Boolean).length;
    const typ   = active(s).baseType.toUpperCase().slice(0, 4);
    return `WSCSS-ALGE5-${typ}-LV${lv}-${s.xp}XP-${bdg}GYM-${e4}E4-${s.algecoins}AC`;
  }

  function pickQuestion(c: BattleCtx): MCQuestion {
    if (c.mode === "elite") return pickRandom(ELITE_FOUR[c.eliteId!].questions);
    const easy = ALGE_DB[c.topic].easy;
    const hard = ALGE_DB[c.topic].hard;
    const pool = c.mode === "wild" ? (easy.length > 0 ? easy : hard) : hard;
    return pickRandom(pool);
  }

  // ── Launch a battle ─────────────────────────────────────────
  function launchBattle(bc: BattleCtx, currentStats: PlayerStats) {
    const lv = xpToLevel(currentStats.xp);
    const act = active(currentStats);
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
      `Topic: ${topicLabel}`,
      `${currentStats.name}'s ${memberName(act, lv)} (Lv ${lv}) steps forward!`,
    ]);
    setScreen("battle");
  }

  function startWildBattle() {
    if (!stats) return;
    const act   = active(stats);
    const topic = TYPE_TOPIC[act.baseType];
    const enemy = WILD_ENEMY[act.baseType];
    launchBattle({
      mode: "wild", topic, speciesId: enemy.speciesId,
      enemyName: enemy.name, enemyColor: enemy.color, enemyEmoji: enemy.emoji,
      enemyType: enemy.catchType, enemyStage: 0,
      xpReward: XP_PER_CORRECT_WILD, coinReward: WILD_WIN_COINS, badgeReward: false, catchType: enemy.catchType,
      // foeLv undefined → uses player level dynamically
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
    launchBattle({
      mode: "elite", eliteId, topic: "factorization", speciesId: elite.speciesId,
      enemyName: elite.enemyName, enemyColor: elite.enemyColor, enemyEmoji: elite.enemyEmoji,
      enemyType: elite.catchType, enemyStage: 2,
      foeLv: elite.foeLevel, xpReward: XP_PER_CORRECT_ELITE,
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
    const xpGain   = caught ? correctCount * ctx.xpReward * 2 : correctCount * ctx.xpReward;
    const newXp    = st.xp + xpGain;
    const prevLv   = xpToLevel(st.xp);
    const newLv    = xpToLevel(newXp);
    const newCoins = st.algecoins + (caught ? 0 : ctx.coinReward);
    const newGym   = [...st.gymBeaten];
    const newElite = [...st.eliteFourBeaten];
    if (!caught && ctx.badgeReward && ctx.gymId !== undefined) newGym[ctx.gymId] = true;
    if (!caught && ctx.mode === "elite" && ctx.eliteId !== undefined) newElite[ctx.eliteId] = true;

    // Species collection
    let newSpecies = [...st.caughtSpecies];
    if (caught && ctx.speciesId && !newSpecies.includes(ctx.speciesId)) newSpecies.push(ctx.speciesId);

    // Party update on catch
    let newParty = [...st.party];
    if (caught && st.party.length < 6) {
      newParty.push({ baseType: ctx.catchType, color: TYPE_COLOR[ctx.catchType] });
    }

    // Evolution check
    const oldStage = getStage(prevLv);
    const newStage = getStage(newLv);
    let evoInfo: PendingEvolution | null = null;
    if (newStage > oldStage) {
      // Add new-stage speciesIds for all (post-catch) party members
      for (const m of newParty) {
        for (let s = oldStage + 1; s <= newStage; s++) {
          const sid = getSpeciesId(m.baseType, s as 0 | 1 | 2);
          if (!newSpecies.includes(sid)) newSpecies.push(sid);
        }
      }
      evoInfo = {
        toStage: newStage as 0 | 1 | 2,
        newLevel: newLv,
        evolutions: newParty.map(m => ({
          from:  EVOLUTION_DATA[m.baseType].stages[oldStage].name,
          to:    EVOLUTION_DATA[m.baseType].stages[newStage].name,
          emoji: EVOLUTION_DATA[m.baseType].stages[newStage].emoji,
          type:  m.baseType,
        })),
      };
    }

    setStats(s => s ? { ...s, xp: newXp, algecoins: newCoins, gymBeaten: newGym, eliteFourBeaten: newElite, caughtSpecies: newSpecies, party: newParty } : s);
    if (evoInfo) setPendingEvolution(evoInfo);

    const spName = SPECIES_LIST.find(sp => sp.id === ctx.speciesId)?.name;
    setLastResult({
      won: true, caught, xpGained: xpGain, coinsGained: caught ? 0 : ctx.coinReward,
      badgeEarned: ctx.badgeReward && !caught,
      gymId: ctx.gymId, eliteId: ctx.eliteId,
      newLv: newLv > prevLv ? newLv : undefined, speciesName: spName,
    });
    setTimeout(() => setScreen("result"), 900);
  }

  // ── Handle MC answer ─────────────────────────────────────────
  function handleAnswer(idx: number) {
    if (answered || !shQ || !ctx || !stats) return;
    setAnswered(true);
    const isCorrect = idx === shQ.correct;
    const playerLv  = xpToLevel(stats.xp);
    const foeLv     = ctx.foeLv ?? playerLv;
    const defBonus  = memberDefBonus(active(stats), playerLv);
    const playerDmg = calcPlayerDmg(playerLv, foeLv);
    const foeDmg    = calcFoeDmg(playerLv, foeLv, defBonus);

    setStats(s => s ? { ...s,
      totalQuestions: s.totalQuestions + 1,
      totalCorrect:   s.totalCorrect + (isCorrect ? 1 : 0),
    } : s);

    if (isCorrect) {
      const newEnemyHp = Math.max(0, enemyHp - playerDmg);
      const newCount   = battleCorrect + 1;
      setEnemyHp(newEnemyHp);
      setBattleCorrect(newCount);
      addLog(`✓ Correct! ${ctx.enemyName} takes ${playerDmg} dmg! (${newEnemyHp}/${ENEMY_MAX_HP} HP)`);
      if (newEnemyHp <= 0) {
        addLog(`${ctx.enemyName} fainted!`);
        applyVictory(false, newCount, stats, newEnemyHp);
      } else {
        if (newEnemyHp < ENEMY_MAX_HP * CATCH_HP_PCT) addLog(`${ctx.enemyName} is weakened! Try to CATCH it!`);
        setTimeout(nextQuestion, 1500);
      }
    } else {
      const newHp = Math.max(0, playerHp - foeDmg);
      setPlayerHp(newHp);
      addLog(`✗ Wrong! You take ${foeDmg} dmg! (${newHp}/${PLAYER_MAX_HP} HP)`);
      const hint = ctx.mode !== "elite" ? `  Tip: ${ALGE_DB[ctx.topic].hint.slice(0, 55)}…` : "";
      if (hint) addLog(hint);
      if (newHp <= 0) {
        addLog(`${memberName(active(stats), xpToLevel(stats.xp))} fainted!`);
        setLastResult({ won: false, caught: false, xpGained: 0, coinsGained: 0, badgeEarned: false });
        setTimeout(() => setScreen("result"), 900);
      } else {
        setTimeout(nextQuestion, 2200);
      }
    }
  }

  // ── Short-answer CATCH ───────────────────────────────────────
  function handleCatch() {
    if (!ctx || !stats) return;
    const saq = pickRandom(ALGE_DB[ctx.topic].shortAnswer as SAQuestion[]);
    setCatchQ(saq); setCatchMode(true); setCatchInput(""); setCatchDone(false);
    addLog(`${stats.name} threw a Catch Device!`);
  }

  function handleCatchSubmit() {
    if (!catchQ || catchDone || !ctx || !stats) return;
    setCatchDone(true);
    const correct = normalizeAns(catchInput) === normalizeAns(catchQ.answer);
    setStats(s => s ? { ...s, totalQuestions: s.totalQuestions + 1, totalCorrect: s.totalCorrect + (correct ? 1 : 0) } : s);
    if (correct) {
      addLog(`Gotcha! ${ctx.enemyName} was caught!`);
      applyVictory(true, battleCorrect, stats, enemyHp);
    } else {
      addLog(`Catch failed! Correct was: ${catchQ.answer}. ${ctx.enemyName} broke free!`);
      setTimeout(() => { setCatchMode(false); setCatchInput(""); setCatchDone(false); nextQuestion(); }, 2200);
    }
  }

  // ── Algaball (from BAG, no turn consumed on fail) ─────────────
  function useAlgaball() {
    if (!stats || !ctx || enemyHp <= 0 || stats.inventory.algaballs < 1) return;
    setStats(s => s ? { ...s, inventory: { ...s.inventory, algaballs: s.inventory.algaballs - 1 } } : s);
    setShowBag(false);
    const ratio   = enemyHp / ENEMY_MAX_HP;
    const rate    = ratio > 0.6 ? 0.40 : ratio > 0.3 ? 0.65 : 0.85;
    const success = Math.random() < rate;
    if (success) {
      addLog(`Algaball succeeded! (${Math.round(rate * 100)}%) ${ctx.enemyName} caught!`);
      applyVictory(true, battleCorrect, stats, enemyHp);
    } else {
      addLog(`Algaball missed! (${Math.round(rate * 100)}% rate) ${ctx.enemyName} broke free.`);
    }
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
    const lv = xpToLevel(stats.xp);
    if (lv >= HINT_MIN_LEVEL) {
      setShowHint(v => !v);
    } else if (stats.inventory.hints > 0) {
      setStats(s => s ? { ...s, inventory: { ...s.inventory, hints: s.inventory.hints - 1 } } : s);
      setShowHint(true);
      addLog(`Used a Hint Tool! (${stats.inventory.hints - 1} remaining)`);
    }
  }

  const canCatch   = (hp: number) => hp > 0 && hp < ENEMY_MAX_HP * CATCH_HP_PCT;
  const canUseHint = (s: PlayerStats) => xpToLevel(s.xp) >= HINT_MIN_LEVEL || s.inventory.hints > 0;

  const wrap: React.CSSProperties = {
    minHeight: "100vh", background: P.bg,
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    ...mono, padding: "12px 8px",
  };

  // ══════════════════════════════════════════════════════════════
  // START SCREEN — 8-type selector grid
  // ══════════════════════════════════════════════════════════════
  if (screen === "start") {
    return (
      <div style={wrap}>
        <Card>
          <h1 style={{ textAlign: "center", color: P.border, fontSize: 15, fontWeight: "bold", letterSpacing: 1, marginBottom: 1 }}>⚔️ ALGEMON MATH BATTLE</h1>
          <div style={{ textAlign: "center", fontSize: 10, color: "#3a5a1a", marginBottom: 14 }}>WSCSS v5 — HKDSE Compulsory Part A</div>
          <label style={{ display: "block", color: P.border, fontSize: 12, marginBottom: 3 }}>TRAINER NAME:</label>
          <input type="text" maxLength={16} value={startName} onChange={e => setStartName(e.target.value)} placeholder="Enter your name"
            style={{ width: "100%", boxSizing: "border-box", ...mono, fontSize: 13, padding: "6px 10px", border: `3px solid ${P.border}`, borderRadius: 4, background: P.white, marginBottom: 14 }} />
          <div style={{ color: P.border, fontSize: 12, marginBottom: 6 }}>CHOOSE YOUR ALGEMON STARTER:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
            {ALGEMON_TYPES.map(t => {
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
              party: [{ baseType: startType, color: TYPE_COLOR[startType] }],
              xp: 0, algecoins: 0,
              gymBeaten: Array(8).fill(false), eliteFourBeaten: Array(4).fill(false),
              inventory: { hints: 0, algaballs: 0, potions: 0 },
              totalQuestions: 0, totalCorrect: 0,
              caughtSpecies: [getSpeciesId(startType, 0)],
            });
            setScreen("hub");
          }} disabled={!startName.trim() || !startType}
            style={{ ...(!startName.trim() || !startType ? btnDisabled : btnDark), width: "100%", padding: "11px 0", fontSize: 14 }}>
            ▶ BEGIN ADVENTURE
          </button>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const lv      = xpToLevel(stats.xp);
  const act     = active(stats);
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
        <XpBar xp={stats!.xp} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // HUB — 6-button main menu
  // ══════════════════════════════════════════════════════════════
  if (screen === "hub") {
    const nextGym   = GYM_DATA.find((_, i) => !stats.gymBeaten[i]);
    const nextElite = allGyms ? ELITE_FOUR.find((_, i) => !stats.eliteFourBeaten[i]) : null;
    const buttons = [
      {
        icon: TYPE_EMOJI[act.baseType], label: "(1) Wild Algemon Encounter",
        sub: `Practice — ${ALGE_DB[TYPE_TOPIC[act.baseType]].topicName} (balanced vs your level)`,
        action: () => { setLastResult(null); startWildBattle(); },
      },
      {
        icon: "🏅", label: `(2) Challenge Gym${allGyms ? " / Elite Four" : ""}`,
        sub: isChamp ? "🏆 CHAMPION — All cleared!" : nextElite ? `ELITE: ${nextElite.name} awaits!` : nextGym ? `Next: ${nextGym.gymName} (Foe Lv ${nextGym.foeLevel})` : "All gyms beaten!",
        action: () => { setLastResult(null); setScreen("gymSelect"); },
      },
      {
        icon: "🔄", label: "(3) Change Algemon",
        sub: `Party: ${stats.party.map(p => memberEmoji(p, lv)).join(" ")} (${stats.party.length}/6 members)`,
        action: () => { setLastResult(null); setScreen("changeAlgemon"); },
        disabled: false,
      },
      {
        icon: "🛒", label: "(4) WSCSS Tuck Shop",
        sub: `Hint 50AC · Algaball 50AC · Potion 30AC  |  Balance: ${stats.algecoins} AC`,
        action: () => { setLastResult(null); setScreen("shop"); },
      },
      {
        icon: "📊", label: "(5) Show Status",
        sub: `Accuracy: ${accuracy !== null ? accuracy + "%" : "N/A"}  |  Dex: ${stats.caughtSpecies.length}/24  |  Save Code`,
        action: () => { setLastResult(null); setScreen("status"); },
      },
      {
        icon: "📚", label: "(6) Alge-Library",
        sub: "Cheat sheet — key formulas and traps for all 10 topics",
        action: () => { setLastResult(null); setScreen("library"); },
      },
    ];
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ textAlign: "center", color: P.border, fontSize: 15, fontWeight: "bold", marginBottom: 10 }}>📋 TRAINER HUB</h2>
          <PlayerBar />
          {lastResult && (
            <div style={{ background: lastResult.won ? "#c8e6c9" : "#ffcdd2", border: `2px solid ${lastResult.won ? P.green : P.red}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10, fontSize: 11 }}>
              {lastResult.caught
                ? `Gotcha! ${lastResult.speciesName ?? "Algemon"} caught! +${lastResult.xpGained} XP`
                : lastResult.won
                ? `Victory! +${lastResult.coinsGained} AC  +${lastResult.xpGained} XP${lastResult.badgeEarned ? "  +Badge!" : ""}${lastResult.newLv ? `  ★ LV ${lastResult.newLv}!` : ""}`
                : "You fainted! No coins lost — review your study notes and try again."}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {buttons.map((item, i) => (
              <button key={i} onClick={() => { if (!item.disabled) item.action(); }}
                style={{ ...btnBase, textAlign: "left", padding: "9px 12px", background: item.disabled ? "#666" : P.darkBg, color: item.disabled ? "#aaa" : "#fff", cursor: item.disabled ? "not-allowed" : "pointer", boxShadow: item.disabled ? "none" : `3px 3px 0 ${P.border}`, fontSize: 12, lineHeight: 1.6 }}>
                <div>{item.icon} <b>{item.label}</b></div>
                <div style={{ fontSize: 10, color: item.disabled ? "#999" : "#a0d878", fontWeight: "normal" }}>{item.sub}</div>
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
                <button key={i} onClick={() => { if (unlocked && !beaten) { setScreen("hub"); startGymBattle(i); } }}
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
                        {el.enemyName} | Foe Lv {el.foeLevel} | Mixed Topics | {ELITE_WIN_COINS} AC
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
              const mName = memberName(member, lv);
              const mEmoji = memberEmoji(member, lv);
              const stg = getStage(lv);
              const def = EVOLUTION_DATA[member.baseType].stages[stg].defenseBonus;
              return (
                <button key={i} onClick={() => { if (!isActive) setStats(s => s ? { ...s, activeIndex: i } : s); }}
                  style={{ ...btnBase, display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", fontSize: 12, lineHeight: 1.7, background: isActive ? member.color + "cc" : P.darkBg, color: "#fff", cursor: isActive ? "default" : "pointer", outline: isActive ? `3px solid ${P.gold}` : "none", outlineOffset: 2 }}>
                  <AlgemonSVG type={member.baseType} stage={stg} size={44} isEnemy={false} animate={false} />
                  <div style={{ textAlign: "left" }}>
                    <b>{mName}</b>
                    {isActive && <span style={{ marginLeft: 8, fontSize: 10, color: P.gold }}>★ ACTIVE</span>}
                    <div style={{ fontSize: 10, color: isActive ? "#e0f0c0" : "#a0d878", fontWeight: "normal" }}>
                      {member.baseType} · Stage {stg} · {ALGE_DB[TYPE_TOPIC[member.baseType]].topicName}
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
  // SHOP — 3 items
  // ══════════════════════════════════════════════════════════════
  if (screen === "shop") {
    const inv = stats.inventory;
    const shopItems = [
      { icon: "💡", name: "Hint Tool",  desc: "Reveals a topic hint in battle. Free at Level 5+.", cost: HINT_TOOL_COST, own: inv.hints,     key: "hints"     as const },
      { icon: "⭕", name: "Algaball",  desc: "40–85% catch rate based on enemy HP. No turn wasted on fail!",                cost: ALGEBALL_COST, own: inv.algaballs, key: "algaballs" as const },
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
          <div style={{ background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: "8px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: P.logText, marginBottom: 3, fontWeight: "bold" }}>SAVE CODE</div>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: "bold", wordBreak: "break-all", marginBottom: 6 }}>{buildSaveCode(stats)}</div>
            <button onClick={() => navigator.clipboard?.writeText(buildSaveCode(stats))} style={{ ...btnLight, fontSize: 10, padding: "4px 10px" }}>📋 COPY</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[
              { label: "Level",          value: `LV ${lv} (Stage ${currentStage})` },
              { label: "Total XP",       value: stats.xp },
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
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ color: P.light, fontSize: 11, fontWeight: "bold", marginBottom: 6 }}>📖 ALGEMON DEX — {collected.length}/24</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SPECIES_LIST.map(sp => {
                const caught = stats.caughtSpecies.includes(sp.id);
                return (
                  <div key={sp.id} title={caught ? `${sp.name} · ${sp.topic}` : "??? (not yet caught)"}
                    style={{ opacity: caught ? 1 : 0.18, filter: caught ? "none" : "grayscale(1) brightness(0.4)", cursor: "default" }}>
                    <AlgemonSVG type={sp.type} stage={sp.stage} size={34} animate={false} />
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
            <div style={{ color: "#546e7a", fontSize: 11, marginTop: 2 }}>All Algemon evolved to {stageNames[toStage]}!</div>
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
              <AlgemonSVG type={act.baseType} stage={getStage(lv)} size={72} isEnemy={false} fainted={!won} animate={false} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{stats.name}</div>
            </div>
            <div style={{ fontSize: 18, color: P.light, paddingBottom: 14 }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <AlgemonSVG type={ctx.enemyType} stage={ctx.enemyStage} size={80} isEnemy fainted={won && !r?.caught} animate={false} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{ctx.enemyName}</div>
            </div>
          </div>
          {r && (
            <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10, fontSize: 11 }}>
              {r.xpGained > 0    && <div style={{ color: P.light }}>+{r.xpGained} XP</div>}
              {r.coinsGained > 0 && <div style={{ color: P.gold }}>+{r.coinsGained} Algecoins</div>}
              {r.badgeEarned     && <div style={{ color: P.gold }}>+1 Badge earned!</div>}
              {r.eliteId !== undefined && won && !r.caught && <div style={{ color: "#ce93d8" }}>Elite {r.eliteId! + 1} defeated!</div>}
              {r.newLv           && <div style={{ color: "#90caf9" }}>★ Level Up! Now Level {r.newLv}!</div>}
              {pendingEvolution  && <div style={{ color: P.gold }}>✨ Your Algemon are evolving…</div>}
              {r.caught          && <div style={{ color: "#90caf9" }}>{r.speciesName} added to party!</div>}
              <div style={{ marginTop: 4 }}><XpBar xp={stats.xp} /></div>
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
    const topicHint  = !isElite ? ALGE_DB[ctx.topic].hint : "Mixed HKDSE topics — apply everything you know!";
    const modeLabel  = isElite ? `ELITE ${ctx.eliteId! + 1}: ${ELITE_FOUR[ctx.eliteId!].name}` : ctx.mode === "gym" ? `GYM ${ctx.gymId! + 1}: ${GYM_DATA[ctx.gymId!].gymName}` : "WILD BATTLE";
    const foeLvShow  = ctx.foeLv ?? lv;
    const inv        = stats.inventory;
    const hasBagItems = inv.algaballs > 0 || inv.potions > 0;
    const allaballRate = enemyHp / ENEMY_MAX_HP > 0.6 ? 40 : enemyHp / ENEMY_MAX_HP > 0.3 ? 65 : 85;

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
                  {catchable && enemyHp > 0 && <span style={{ color: "#ff7043", marginLeft: 5 }}>★ CATCHABLE!</span>}
                </div>
                <HpBar hp={enemyHp} maxHp={ENEMY_MAX_HP} label="" />
              </div>
              <AlgemonSVG type={ctx.enemyType} stage={ctx.enemyStage} size={88} isEnemy fainted={enemyHp <= 0} animate />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <AlgemonSVG type={act.baseType} stage={currentStage} size={76} isEnemy={false} fainted={playerHp <= 0} animate />
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
              💡 {topicHint}
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
                  <div style={{ fontSize: 10, color: "#b0bec5", marginBottom: 4 }}>
                    {enemyHp > 0 ? `~${allaballRate}% catch rate` : "enemy fainted"}
                  </div>
                  <button onClick={useAlgaball} disabled={inv.algaballs < 1 || enemyHp <= 0}
                    style={{ ...(inv.algaballs < 1 || enemyHp <= 0 ? btnDisabled : { ...btnBase, background: P.red, color: "#fff" }), fontSize: 10, padding: "4px 10px" }}>
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
                  {shQ.text}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
                  {shQ.options.map((opt, i) => {
                    const correct = answered && i === shQ.correct;
                    const wrong   = answered && i !== shQ.correct;
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                        style={{ ...btnBase, background: correct ? "#a5d6a7" : wrong ? "#ffcdd2" : P.light, color: P.border, fontSize: 11, textAlign: "left", padding: "6px 8px", lineHeight: 1.4, cursor: answered ? "default" : "pointer", boxShadow: answered ? "none" : `3px 3px 0 ${P.border}` }}>
                        <b>{["A","B","C","D"][i]}.</b> {opt}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={handleCatch} disabled={!catchable || answered}
                    style={{ ...(!catchable || answered ? btnDisabled : { ...btnBase, background: "#e65100", color: "#fff" }), flex: 1, padding: "7px 0", fontSize: 10 }}>
                    🎯 CATCH{!catchable ? " (need <30% HP)" : "!"}
                  </button>
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
