import { useState, useRef, useEffect } from "react";
import {
  AlgemonType, TopicKey, MCQuestion, SAQuestion,
  ALGEMON_TYPES, TYPE_COLOR, TYPE_EMOJI, TYPE_TOPIC,
  WILD_ENEMY, GYM_DATA, ALGE_DB, ELITE_FOUR, STUDY_GUIDE, SPECIES_LIST,
  PLAYER_MAX_HP, WILD_ENEMY_MAX_HP, GYM_ENEMY_MAX_HP, ELITE_ENEMY_MAX_HP,
  WILD_CORRECT_DMG, GYM_CORRECT_DMG, ELITE_CORRECT_DMG, WRONG_DMG,
  CATCH_HP_PCT, XP_PER_CORRECT_WILD, XP_PER_CORRECT_GYM, XP_PER_CORRECT_ELITE,
  XP_PER_LEVEL, HINT_MIN_LEVEL, HINT_TOOL_COST, ALGEBALL_COST, POTION_COST, POTION_HEAL,
  WILD_WIN_COINS, GYM_WIN_COINS, ELITE_WIN_COINS,
  xpToLevel, xpToNextLevel, pickRandom, normalizeAns,
} from "../data/gameData";

// ══════════════════════════════════════════════════════════════
// INTERFACES
// ══════════════════════════════════════════════════════════════
interface PartyMember {
  displayName: string; type: AlgemonType; emoji: string; color: string;
}

interface PlayerStats {
  name:           string;
  activeIndex:    number;
  party:          PartyMember[];
  xp:             number;
  algecoins:      number;
  gymBeaten:      boolean[];      // length 8
  eliteFourBeaten: boolean[];     // length 4
  inventory:      { hints: number; algaballs: number; potions: number };
  totalQuestions: number;
  totalCorrect:   number;
  caughtSpecies:  string[];       // array of speciesIds
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
  enemyMaxHp:  number;
  correctDmg:  number;
  xpReward:    number;
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

type Screen = "start" | "hub" | "gymSelect" | "shop" | "changeAlgemon"
            | "status" | "library" | "battle" | "result";

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
const btnDark:  React.CSSProperties = { ...btnBase, background: P.darkBg, color: "#fff" };
const btnLight: React.CSSProperties = { ...btnBase, background: P.light,  color: P.border };
const btnDisabled: React.CSSProperties = { ...btnBase, background: "#777", color: "#bbb", cursor: "not-allowed", boxShadow: "none" };

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: P.panel, border: `4px solid ${P.border}`, borderRadius: 8, padding: 18, width: "100%", maxWidth: 500, boxShadow: `6px 6px 0 ${P.border}`, ...style }}>
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
        <span>{label}</span><span>{Math.max(0, hp)}/{maxHp} HP</span>
      </div>
      <div style={{ width: "100%", height: 11, background: "#4a6141", borderRadius: 3, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, transition: "width .4s" }} />
      </div>
    </div>
  );
}

function XpBar({ xp }: { xp: number }) {
  const lv  = xpToLevel(xp);
  const pct = lv >= 10 ? 100 : ((xp - (lv - 1) * XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.light, marginBottom: 1 }}>
        <span>LV {lv}  XP {xp}</span>
        <span style={{ color: lv >= HINT_MIN_LEVEL ? P.gold : P.light }}>
          {lv >= 10 ? "MAX" : `→${xpToNextLevel(xp)} XP`}
          {lv >= HINT_MIN_LEVEL && " ★HINT FREE"}
        </span>
      </div>
      <div style={{ width: "100%", height: 7, background: "#4a6141", borderRadius: 2, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#90caf9", transition: "width .4s" }} />
      </div>
    </div>
  );
}

function AlgemonSprite({ color, emoji, isEnemy, fainted }: { color: string; emoji: string; isEnemy: boolean; fainted: boolean }) {
  const sz = isEnemy ? 88 : 72;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: fainted ? 0.18 : 1, transition: "opacity .5s", transform: isEnemy ? "none" : "scaleX(-1)", flexShrink: 0 }}>
      <div style={{ width: sz, height: sz, background: color, borderRadius: isEnemy ? "50% 50% 38% 38%" : "38% 38% 50% 50%", border: `3px solid ${P.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: fainted ? "none" : `0 0 14px ${color}88` }}>
        <div style={{ display: "flex", gap: 9, marginBottom: 2 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: 9, height: 9, background: "#fff", borderRadius: "50%", border: `2px solid ${P.border}` }}>
              <div style={{ width: 4, height: 4, background: P.border, borderRadius: "50%", margin: "2px auto 0" }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 16 }}>{emoji}</div>
      </div>
      <div style={{ width: sz * 0.65, height: 6, background: "rgba(0,0,0,.3)", borderRadius: "50%", marginTop: -1 }} />
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
    <span style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 3, padding: "1px 7px", fontSize: 11, color, ...mono, fontWeight: "bold", marginRight: 4 }}>
      {label}: {value}
    </span>
  );
}

function BadgeIcons({ gymBeaten }: { gymBeaten: boolean[] }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {["🌿","💧","❄️","⚡","🔩","🌺","🔺","🌊"].map((b, i) => (
        <span key={i} style={{ fontSize: 14, opacity: gymBeaten[i] ? 1 : 0.2, filter: gymBeaten[i] ? "none" : "grayscale(1)" }}>{b}</span>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ══════════════════════════════════════════════════════════════
export default function Game() {

  const [stats,   setStats]   = useState<PlayerStats | null>(null);
  const [screen,  setScreen]  = useState<Screen>("start");

  // Battle state
  const [ctx,          setCtx]          = useState<BattleCtx | null>(null);
  const [playerHp,     setPlayerHp]     = useState(PLAYER_MAX_HP);
  const [enemyHp,      setEnemyHp]      = useState(100);
  const [mcQ,          setMcQ]          = useState<MCQuestion | null>(null);
  const [answered,     setAnswered]     = useState(false);
  const [catchMode,    setCatchMode]    = useState(false);
  const [catchQ,       setCatchQ]       = useState<SAQuestion | null>(null);
  const [catchInput,   setCatchInput]   = useState("");
  const [catchDone,    setCatchDone]    = useState(false);
  const [showHint,     setShowHint]     = useState(false);
  const [showBag,      setShowBag]      = useState(false);
  const [log,          setLog]          = useState<string[]>([]);
  const [lastResult,   setLastResult]   = useState<BattleResult | null>(null);

  // Start form
  const [startName, setStartName] = useState("");
  const [startType, setStartType] = useState<AlgemonType | null>(null);

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-40), msg]);

  const activeMember = (s: PlayerStats) => s.party[s.activeIndex];

  function buildSaveCode(s: PlayerStats): string {
    const lv  = xpToLevel(s.xp);
    const bdg = s.gymBeaten.filter(Boolean).length;
    const elite = s.eliteFourBeaten.filter(Boolean).length;
    const typ = activeMember(s).type.toUpperCase();
    return `WSCSS-ALGE2-${typ}-LV${lv}-${s.xp}XP-${bdg}GYM-${elite}E4-${s.algecoins}AC`;
  }

  function pickBattleQuestion(c: BattleCtx): MCQuestion {
    if (c.mode === "elite") return pickRandom(ELITE_FOUR[c.eliteId!].questions);
    const pool = c.mode === "wild" ? ALGE_DB[c.topic].easy : ALGE_DB[c.topic].hard;
    return pickRandom(pool);
  }

  // ── Launch a battle ─────────────────────────────────────────
  function launchBattle(battleCtx: BattleCtx, currentStats: PlayerStats) {
    const topicLabel = battleCtx.mode === "elite"
      ? `Mixed Topics — ${ELITE_FOUR[battleCtx.eliteId!].name}`
      : ALGE_DB[battleCtx.topic].topicName;
    setCtx(battleCtx);
    setPlayerHp(PLAYER_MAX_HP);
    setEnemyHp(battleCtx.enemyMaxHp);
    setMcQ(pickBattleQuestion(battleCtx));
    setAnswered(false); setCatchMode(false); setCatchQ(null);
    setCatchInput(""); setCatchDone(false); setShowHint(false); setShowBag(false);
    setLog([
      `${battleCtx.enemyName} appeared!`,
      `Topic: ${topicLabel}`,
      `${currentStats.name}'s ${activeMember(currentStats).displayName} steps forward!`,
    ]);
    setScreen("battle");
  }

  function startWildBattle() {
    if (!stats) return;
    const active = activeMember(stats);
    const topic  = TYPE_TOPIC[active.type];
    const enemy  = WILD_ENEMY[active.type];
    launchBattle({
      mode: "wild", topic, speciesId: enemy.speciesId,
      enemyName: enemy.name, enemyColor: enemy.color, enemyEmoji: enemy.emoji,
      enemyMaxHp: WILD_ENEMY_MAX_HP, correctDmg: WILD_CORRECT_DMG,
      xpReward: XP_PER_CORRECT_WILD, coinReward: WILD_WIN_COINS, badgeReward: false, catchType: enemy.catchType,
    }, stats);
  }

  function startGymBattle(gymId: number) {
    if (!stats) return;
    const gym = GYM_DATA[gymId];
    launchBattle({
      mode: "gym", gymId, topic: gym.topic, speciesId: gym.speciesId,
      enemyName: gym.enemyName, enemyColor: gym.enemyColor, enemyEmoji: gym.enemyEmoji,
      enemyMaxHp: GYM_ENEMY_MAX_HP, correctDmg: GYM_CORRECT_DMG,
      xpReward: XP_PER_CORRECT_GYM, coinReward: GYM_WIN_COINS, badgeReward: true, catchType: gym.catchType,
    }, stats);
  }

  function startEliteBattle(eliteId: number) {
    if (!stats) return;
    const elite = ELITE_FOUR[eliteId];
    launchBattle({
      mode: "elite", eliteId, topic: "factorization", speciesId: elite.speciesId,
      enemyName: elite.enemyName, enemyColor: elite.enemyColor, enemyEmoji: elite.enemyEmoji,
      enemyMaxHp: ELITE_ENEMY_MAX_HP, correctDmg: ELITE_CORRECT_DMG,
      xpReward: XP_PER_CORRECT_ELITE, coinReward: ELITE_WIN_COINS, badgeReward: false, catchType: elite.catchType,
    }, stats);
  }

  // ── Next question (called after answer resolves) ─────────────
  function nextQuestion() {
    if (!ctx) return;
    setMcQ(pickBattleQuestion(ctx));
    setAnswered(false); setCatchMode(false); setCatchQ(null);
    setCatchInput(""); setCatchDone(false); setShowHint(false); setShowBag(false);
  }

  // ── Apply victory ────────────────────────────────────────────
  function applyVictory(caught: boolean, speciesName: string | undefined, extraXp: number, st: PlayerStats, curEnemyHp: number) {
    if (!ctx) return;
    const xpGain    = caught ? ctx.xpReward * 2 : ctx.xpReward;
    const newXp     = st.xp + xpGain + extraXp;
    const prevLv    = xpToLevel(st.xp);
    const newLv     = xpToLevel(newXp);
    const newCoins  = st.algecoins + (caught ? 0 : ctx.coinReward);
    const newBeaten = [...st.gymBeaten];
    const newElite  = [...st.eliteFourBeaten];
    if (!caught && ctx.badgeReward && ctx.gymId !== undefined) newBeaten[ctx.gymId] = true;
    if (!caught && ctx.mode === "elite" && ctx.eliteId !== undefined) newElite[ctx.eliteId] = true;
    // Add species to collection
    const newSpecies = caught && ctx.speciesId && !st.caughtSpecies.includes(ctx.speciesId)
      ? [...st.caughtSpecies, ctx.speciesId]
      : st.caughtSpecies;
    // Add to party if caught
    let newParty = [...st.party];
    if (caught && st.party.length < 6) {
      newParty.push({ displayName: ctx.enemyName, type: ctx.catchType, emoji: ctx.enemyEmoji, color: ctx.enemyColor });
    }
    setStats(s => s ? { ...s, xp: newXp, algecoins: newCoins, gymBeaten: newBeaten, eliteFourBeaten: newElite, caughtSpecies: newSpecies, party: newParty } : s);
    setLastResult({ won: true, caught, xpGained: xpGain + extraXp, coinsGained: caught ? 0 : ctx.coinReward, badgeEarned: ctx.badgeReward && !caught, gymId: ctx.gymId, eliteId: ctx.eliteId, newLv: newLv > prevLv ? newLv : undefined, speciesName });
    setTimeout(() => setScreen("result"), 900);
  }

  // ── Handle MC answer ─────────────────────────────────────────
  function handleAnswer(idx: number) {
    if (answered || !mcQ || !ctx || !stats) return;
    setAnswered(true);
    const isCorrect = idx === mcQ.correct;
    setStats(s => s ? {
      ...s,
      totalQuestions: s.totalQuestions + 1,
      totalCorrect:   s.totalCorrect + (isCorrect ? 1 : 0),
    } : s);

    if (isCorrect) {
      const newEnemyHp = Math.max(0, enemyHp - ctx.correctDmg);
      setEnemyHp(newEnemyHp);
      addLog(`Correct! ${ctx.enemyName} takes ${ctx.correctDmg} damage! (+${ctx.xpReward} XP)`);
      if (newEnemyHp <= 0) {
        addLog(`${ctx.enemyName} fainted!`);
        applyVictory(false, undefined, 0, stats, newEnemyHp);
      } else {
        if (newEnemyHp < ctx.enemyMaxHp * CATCH_HP_PCT) addLog(`${ctx.enemyName} is weakened! Try to CATCH it!`);
        // Update xp in stats (partial — will be overwritten on victory)
        setStats(s => s ? { ...s, xp: s.xp + ctx.xpReward } : s);
        const prevLv = xpToLevel(stats.xp);
        const newLv  = xpToLevel(stats.xp + ctx.xpReward);
        if (newLv > prevLv) addLog(`★ LEVEL UP! Now Level ${newLv}!`);
        setTimeout(nextQuestion, 1600);
      }
    } else {
      const newHp = Math.max(0, playerHp - WRONG_DMG);
      setPlayerHp(newHp);
      addLog(`Wrong! ${stats.name} takes ${WRONG_DMG} damage!`);
      if (ctx.mode !== "elite") addLog(`Tip: ${ALGE_DB[ctx.topic].hint.slice(0, 60)}…`);
      if (newHp <= 0) {
        addLog(`${activeMember(stats).displayName} fainted!`);
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
      const sp = SPECIES_LIST.find(s => s.id === ctx.speciesId);
      addLog(`Gotcha! ${ctx.enemyName} was caught!`);
      applyVictory(true, sp?.name, 0, stats, enemyHp);
    } else {
      addLog(`Catch failed! Correct: ${catchQ.answer}. ${ctx.enemyName} breaks free!`);
      setTimeout(() => { setCatchMode(false); setCatchInput(""); setCatchDone(false); nextQuestion(); }, 2200);
    }
  }

  // ── Algeball catch (from BAG, no turn consumed on fail) ──────
  function useAlgeball() {
    if (!stats || !ctx || enemyHp <= 0) return;
    if (stats.inventory.algaballs < 1) return;
    setStats(s => s ? { ...s, inventory: { ...s.inventory, algaballs: s.inventory.algaballs - 1 } } : s);
    setShowBag(false);
    const ratio = enemyHp / ctx.enemyMaxHp;
    const rate  = ratio > 0.6 ? 0.40 : ratio > 0.3 ? 0.65 : 0.85;
    const success = Math.random() < rate;
    if (success) {
      const sp = SPECIES_LIST.find(s => s.id === ctx.speciesId);
      addLog(`Algeball succeeded! (${Math.round(rate * 100)}% chance) ${ctx.enemyName} caught!`);
      applyVictory(true, sp?.name, 0, stats, enemyHp);
    } else {
      addLog(`Algeball missed! (${Math.round(rate * 100)}% rate — bad luck!) ${ctx.enemyName} broke free.`);
    }
  }

  // ── Potion (no turn consumed) ────────────────────────────────
  function usePotion() {
    if (!stats || stats.inventory.potions < 1) return;
    const healed = Math.min(PLAYER_MAX_HP - playerHp, POTION_HEAL);
    setPlayerHp(prev => Math.min(PLAYER_MAX_HP, prev + POTION_HEAL));
    setStats(s => s ? { ...s, inventory: { ...s.inventory, potions: s.inventory.potions - 1 } } : s);
    setShowBag(false);
    addLog(`Used a Potion! +${healed} HP restored. (${stats.inventory.potions - 1} left)`);
  }

  // ── Hint ─────────────────────────────────────────────────────
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

  const canCatch    = (hp: number, maxHp: number) => hp > 0 && hp < maxHp * CATCH_HP_PCT;
  const canUseHint  = (s: PlayerStats) => xpToLevel(s.xp) >= HINT_MIN_LEVEL || s.inventory.hints > 0;

  // ══════════════════════════════════════════════════════════════
  // LAYOUT WRAPPER
  // ══════════════════════════════════════════════════════════════
  const wrap: React.CSSProperties = {
    minHeight: "100vh", background: P.bg,
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    ...mono, padding: "12px 8px",
  };

  // ══════════════════════════════════════════════════════════════
  // START SCREEN
  // ══════════════════════════════════════════════════════════════
  if (screen === "start") {
    return (
      <div style={wrap}>
        <Card>
          <h1 style={{ textAlign: "center", color: P.border, fontSize: 16, fontWeight: "bold", letterSpacing: 1, marginBottom: 2 }}>⚔️ ALGEMON MATH BATTLE</h1>
          <div style={{ textAlign: "center", fontSize: 10, color: "#3a5a1a", marginBottom: 18 }}>WSCSS v4 — Economy & Elite Four</div>
          <label style={{ display: "block", color: P.border, fontSize: 12, marginBottom: 3 }}>TRAINER NAME:</label>
          <input type="text" maxLength={16} value={startName} onChange={e => setStartName(e.target.value)}
            placeholder="Enter your name"
            style={{ width: "100%", boxSizing: "border-box", ...mono, fontSize: 13, padding: "6px 10px", border: `3px solid ${P.border}`, borderRadius: 4, background: P.white, marginBottom: 16 }} />
          <div style={{ color: P.border, fontSize: 12, marginBottom: 6 }}>CHOOSE YOUR STARTER:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {ALGEMON_TYPES.map(t => (
              <button key={t} onClick={() => setStartType(t)} style={{
                ...btnBase, flex: 1, padding: "8px 4px", fontSize: 12, lineHeight: 1.7,
                background: startType === t ? TYPE_COLOR[t] : P.light,
                color: startType === t ? "#fff" : P.border,
                outline: startType === t ? `3px solid ${P.border}` : "none", outlineOffset: 2,
              }}>
                {TYPE_EMOJI[t]}<br /><b>{t}</b>
              </button>
            ))}
          </div>
          {startType && (
            <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "5px 10px", marginBottom: 14, fontSize: 11, color: P.light }}>
              <b>{startType}</b> Algemon specialises in <b>{ALGE_DB[TYPE_TOPIC[startType]].topicName}</b>.
            </div>
          )}
          <button onClick={() => {
            if (!startName.trim() || !startType) return;
            setStats({
              name: startName.trim(), activeIndex: 0,
              party: [{ displayName: `${startType} Starter`, type: startType, emoji: TYPE_EMOJI[startType], color: TYPE_COLOR[startType] }],
              xp: 0, algecoins: 0,
              gymBeaten: Array(8).fill(false), eliteFourBeaten: Array(4).fill(false),
              inventory: { hints: 0, algaballs: 0, potions: 0 },
              totalQuestions: 0, totalCorrect: 0, caughtSpecies: [],
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

  const lv        = xpToLevel(stats.xp);
  const badges    = stats.gymBeaten.filter(Boolean).length;
  const e4beats   = stats.eliteFourBeaten.filter(Boolean).length;
  const active    = activeMember(stats);
  const allGyms   = badges >= 8;
  const isChamp   = allGyms && e4beats >= 4;
  const accuracy  = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : null;

  // ── Shared player info strip ───────────────────────────────
  function PlayerBar({ goHub }: { goHub?: boolean }) {
    return (
      <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ color: P.light, fontSize: 12, fontWeight: "bold" }}>{stats!.name} — {active.emoji} {active.displayName}</span>
          {goHub && <button onClick={() => setScreen("hub")} style={{ ...btnLight, fontSize: 10, padding: "3px 8px" }}>← HUB</button>}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
          <StatBadge label="AC" value={stats!.algecoins} color={P.gold} />
          <StatBadge label="Party" value={`${stats!.party.length}/6`} color={P.light} />
          <StatBadge label="Badges" value={`${badges}/8`} color={P.gold} />
          {isChamp && <StatBadge label="🏆" value="CHAMPION" color="#ff8f00" />}
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
          <BadgeIcons gymBeaten={stats!.gymBeaten} />
        </div>
        <XpBar xp={stats!.xp} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // HUB — 6-button main menu
  // ══════════════════════════════════════════════════════════════
  if (screen === "hub") {
    const nextGym = GYM_DATA.find((_, i) => !stats.gymBeaten[i]);
    const nextElite = allGyms ? ELITE_FOUR.find((_, i) => !stats.eliteFourBeaten[i]) : null;

    const buttons = [
      {
        icon: "🌿", label: "(1) Encounter Wild Algemon",
        sub: `Practice — ${ALGE_DB[TYPE_TOPIC[active.type]].topicName} (easy)`,
        action: () => { setLastResult(null); startWildBattle(); },
      },
      {
        icon: "🏅", label: `(2) Challenge the GYM${allGyms ? " / ELITE FOUR" : ""}`,
        sub: isChamp ? "🏆 CHAMPION — All battles cleared!" : nextElite ? `ELITE: ${nextElite.name} awaits!` : nextGym ? `Next: ${nextGym.gymName}` : "All gyms beaten!",
        action: () => { setLastResult(null); setScreen("gymSelect"); },
      },
      {
        icon: "🔄", label: "(3) Change Algemon",
        sub: `Party: ${stats.party.map(p => p.emoji).join(" ")} (${stats.party.length} members)`,
        action: () => { setLastResult(null); setScreen("changeAlgemon"); },
        disabled: stats.party.length < 2,
      },
      {
        icon: "🛒", label: "(4) WSCSS Tuck Shop",
        sub: `Hint 50AC · Algeball 50AC · Potion 30AC  |  Balance: ${stats.algecoins} AC`,
        action: () => { setLastResult(null); setScreen("shop"); },
      },
      {
        icon: "📊", label: "(5) Show Status",
        sub: `Accuracy: ${accuracy !== null ? accuracy + "%" : "N/A"}  |  Dex: ${stats.caughtSpecies.length}/24  |  Save Code`,
        action: () => { setLastResult(null); setScreen("status"); },
      },
      {
        icon: "📚", label: "(6) Alge-Library",
        sub: "Study guide — key formulas for all 8 topics",
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
                ? `Gotcha! ${lastResult.speciesName ?? "Algemon"} joined your party! +${lastResult.xpGained} XP`
                : lastResult.won
                ? `Victory! +${lastResult.coinsGained} AC  +${lastResult.xpGained} XP${lastResult.badgeEarned ? `  +1 Badge!` : ""}${lastResult.newLv ? `  ★ LV ${lastResult.newLv}!` : ""}`
                : "You fainted! No coins lost — try again."}
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
  // GYM SELECT (+ Elite Four section)
  // ══════════════════════════════════════════════════════════════
  if (screen === "gymSelect") {
    const firstUnbeaten = stats.gymBeaten.findIndex(b => !b);
    const firstUnbeatenElite = stats.eliteFourBeaten.findIndex(b => !b);
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>🏅 GYM SELECTION</h2>
          <PlayerBar goHub />
          <div style={{ fontSize: 10, color: P.border, marginBottom: 8 }}>Challenge gyms in order. Defeat each Leader to unlock the next.</div>

          {/* 8 Gyms */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {GYM_DATA.map((gym, i) => {
              const beaten   = stats.gymBeaten[i];
              const unlocked = i === 0 || stats.gymBeaten[i - 1];
              return (
                <button key={i} onClick={() => { if (unlocked && !beaten) { setScreen("hub"); startGymBattle(i); } }}
                  style={{ ...btnBase, textAlign: "left", padding: "8px 11px", fontSize: 11, lineHeight: 1.7, background: beaten ? "#4a6141" : unlocked && i === firstUnbeaten ? P.darkBg : "#555", color: beaten ? "#a0d878" : unlocked ? "#fff" : "#888", cursor: unlocked && !beaten ? "pointer" : "not-allowed", boxShadow: beaten || !unlocked ? "none" : `3px 3px 0 ${P.border}` }}>
                  <div>{beaten ? "✅" : unlocked ? gym.enemyEmoji : "🔒"} <b>GYM {i + 1}:</b> {gym.locationName} — {gym.gymName}</div>
                  <div style={{ fontSize: 10, color: beaten ? "#a0d878" : unlocked ? "#c0e08a" : "#666" }}>
                    {gym.leaderName} | {ALGE_DB[gym.topic].topicName} | {gym.reward} AC + {gym.badge}
                    {beaten ? "  ✓ CLEARED" : i === firstUnbeaten ? "  ← CHALLENGE" : !unlocked ? "  🔒 LOCKED" : ""}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Elite Four — appears after all 8 gyms */}
          {allGyms && (
            <>
              <div style={{ background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: "6px 10px", marginBottom: 8, textAlign: "center", color: P.gold, fontSize: 11, fontWeight: "bold" }}>
                ★ ELITE FOUR UNLOCKED ★
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ELITE_FOUR.map((el, i) => {
                  const beaten   = stats.eliteFourBeaten[i];
                  const unlocked = i === 0 || stats.eliteFourBeaten[i - 1];
                  return (
                    <button key={i} onClick={() => { if (unlocked && !beaten) { setScreen("hub"); startEliteBattle(i); } }}
                      style={{ ...btnBase, textAlign: "left", padding: "8px 11px", fontSize: 11, lineHeight: 1.7, background: beaten ? "#3a2a5a" : unlocked && i === firstUnbeatenElite ? "#4a148c" : "#333", color: beaten ? "#ce93d8" : unlocked ? "#fff" : "#888", cursor: unlocked && !beaten ? "pointer" : "not-allowed", boxShadow: beaten || !unlocked ? "none" : `3px 3px 0 ${P.border}` }}>
                      <div>{beaten ? "✅" : unlocked ? el.enemyEmoji : "🔒"} <b>ELITE {i + 1}:</b> {el.name} — {el.title}</div>
                      <div style={{ fontSize: 10, color: beaten ? "#ce93d8" : unlocked ? "#e1bee7" : "#555" }}>
                        {el.enemyName} | Mixed Topics | {ELITE_WIN_COINS} AC
                        {beaten ? "  ✓ DEFEATED" : i === firstUnbeatenElite ? "  ← CHALLENGE" : "  🔒 LOCKED"}
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
              return (
                <button key={i} onClick={() => { if (!isActive) setStats(s => s ? { ...s, activeIndex: i } : s); }}
                  style={{ ...btnBase, textAlign: "left", padding: "9px 12px", fontSize: 12, lineHeight: 1.7, background: isActive ? member.color : P.darkBg, color: "#fff", cursor: isActive ? "default" : "pointer", outline: isActive ? `3px solid ${P.gold}` : "none", outlineOffset: 2 }}>
                  <b>{member.emoji} {member.displayName}</b>
                  {isActive && <span style={{ marginLeft: 8, fontSize: 10, color: P.gold }}>★ ACTIVE</span>}
                  <div style={{ fontSize: 10, color: isActive ? "#e0f0c0" : "#a0d878", fontWeight: "normal" }}>
                    Type: {member.type} | Wild topic: {ALGE_DB[TYPE_TOPIC[member.type]].topicName}
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
      { icon: "💡", name: "Hint Tool",  desc: "Reveals a topic hint in battle. Free at Level 5+; otherwise uses this item.", cost: HINT_TOOL_COST,  own: inv.hints,     key: "hints"     as const },
      { icon: "⭕", name: "Algeball",  desc: "Throw at weakened foes! 40–85% catch rate (no turn wasted on fail).",         cost: ALGEBALL_COST, own: inv.algaballs, key: "algaballs" as const },
      { icon: "🧪", name: "Potion",    desc: `Restores ${POTION_HEAL} HP instantly. Does NOT consume your turn!`,            cost: POTION_COST,   own: inv.potions,   key: "potions"   as const },
    ];
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>🛒 WSCSS TUCK SHOP</h2>
          <PlayerBar goHub />
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 12px", marginBottom: 10 }}>
            <div style={{ color: P.gold, fontSize: 13, fontWeight: "bold" }}>💰 Balance: {stats.algecoins} AC</div>
            <div style={{ color: P.light, fontSize: 10, marginTop: 2 }}>Wild win: {WILD_WIN_COINS} AC | Gym win: {GYM_WIN_COINS} AC | Elite win: {ELITE_WIN_COINS} AC</div>
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
    const collectedSpecies = SPECIES_LIST.filter(sp => stats.caughtSpecies.includes(sp.id));
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>📊 TRAINER STATUS</h2>
          <PlayerBar goHub />

          {/* Save Code */}
          <div style={{ background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: "8px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: P.logText, marginBottom: 3, fontWeight: "bold" }}>SAVE CODE</div>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: "bold", wordBreak: "break-all", marginBottom: 6 }}>{buildSaveCode(stats)}</div>
            <button onClick={() => navigator.clipboard?.writeText(buildSaveCode(stats))} style={{ ...btnLight, fontSize: 10, padding: "4px 10px" }}>📋 COPY</button>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[
              { label: "Level",          value: `LV ${lv}` },
              { label: "Total XP",       value: stats.xp },
              { label: "Accuracy Rate",  value: accuracy !== null ? `${accuracy}%` : "N/A" },
              { label: "Questions",      value: `${stats.totalCorrect}/${stats.totalQuestions}` },
              { label: "Algecoins",      value: `${stats.algecoins} AC` },
              { label: "Gym Badges",     value: `${badges}/8` },
              { label: "Elite Defeated", value: `${e4beats}/4` },
              { label: "Party Size",     value: `${stats.party.length}/6` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "6px 10px" }}>
                <div style={{ fontSize: 9, color: "#a0d878" }}>{label}</div>
                <div style={{ fontSize: 14, color: P.gold, fontWeight: "bold" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Collection */}
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ color: P.light, fontSize: 11, fontWeight: "bold", marginBottom: 6 }}>
              📖 ALGEMON COLLECTION — {collectedSpecies.length}/24
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {SPECIES_LIST.map(sp => {
                const caught = stats.caughtSpecies.includes(sp.id);
                return (
                  <span key={sp.id} title={caught ? `${sp.name} (${sp.topic})` : "???"}
                    style={{ fontSize: 13, opacity: caught ? 1 : 0.2, filter: caught ? "none" : "grayscale(1)", cursor: "default" }}>
                    {sp.emoji}
                  </span>
                );
              })}
            </div>
            {collectedSpecies.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 10, color: "#a0d878" }}>
                {collectedSpecies.map(sp => sp.name).join("  ·  ")}
              </div>
            )}
          </div>

          {/* Inventory */}
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "8px 12px" }}>
            <div style={{ color: P.light, fontSize: 11, fontWeight: "bold", marginBottom: 4 }}>🎒 BAG</div>
            <div style={{ display: "flex", gap: 8 }}>
              <StatBadge label="💡 Hints"     value={stats.inventory.hints} />
              <StatBadge label="⭕ Algaballs" value={stats.inventory.algaballs} />
              <StatBadge label="🧪 Potions"   value={stats.inventory.potions} />
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
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    return (
      <div style={wrap}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold" }}>📚 ALGE-LIBRARY</h2>
            <button onClick={() => setScreen("hub")} style={{ ...btnLight, fontSize: 11, padding: "4px 10px" }}>← HUB</button>
          </div>
          <div style={{ fontSize: 10, color: P.border, marginBottom: 10 }}>Tap a topic to expand the cheat sheet. Memorise the traps!</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STUDY_GUIDE.map((sec, i) => {
              const open = openIdx === i;
              return (
                <div key={i} style={{ border: `2px solid ${P.border}`, borderRadius: 5, overflow: "hidden" }}>
                  <button onClick={() => setOpenIdx(open ? null : i)}
                    style={{ ...btnBase, width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 0, border: "none", boxShadow: "none", background: open ? P.darkBg : P.light, color: open ? "#fff" : P.border, fontSize: 12 }}>
                    {sec.emoji} <b>{sec.topicName}</b> {open ? "▲" : "▼"}
                  </button>
                  {open && (
                    <div style={{ background: P.logBg, padding: "10px 14px" }}>
                      <div style={{ color: P.gold, fontSize: 10, fontWeight: "bold", marginBottom: 4 }}>KEY FORMULAS</div>
                      {sec.formulas.map((f, j) => (
                        <div key={j} style={{ color: P.logText, fontSize: 10, marginBottom: 4, lineHeight: 1.5 }}>• {f}</div>
                      ))}
                      <div style={{ color: "#ff8a65", fontSize: 10, fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>⚠️ COMMON TRAPS</div>
                      {sec.traps.map((t, j) => (
                        <div key={j} style={{ color: "#ffccbc", fontSize: 10, marginBottom: 4, lineHeight: 1.5 }}>⚡ {t}</div>
                      ))}
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
            {r?.caught ? `${r.speciesName ?? ctx.enemyName} joined your party!` : won ? `${ctx.enemyName} was defeated! Great work, ${stats.name}!` : `Review ${ctx.mode !== "elite" ? ALGE_DB[ctx.topic].topicName : "the Elite topics"} and try again.`}
          </p>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "10px 6px", marginBottom: 10 }}>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite color={active.color} emoji={active.emoji} isEnemy={false} fainted={!won} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{stats.name}</div>
            </div>
            <div style={{ fontSize: 18, color: P.light, paddingBottom: 14 }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite color={ctx.enemyColor} emoji={ctx.enemyEmoji} isEnemy fainted={won && !r?.caught} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{ctx.enemyName}</div>
            </div>
          </div>
          {r && (
            <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10, fontSize: 11 }}>
              {r.xpGained > 0   && <div style={{ color: P.light }}>+{r.xpGained} XP</div>}
              {r.coinsGained > 0 && <div style={{ color: P.gold }}>+{r.coinsGained} Algecoins</div>}
              {r.badgeEarned     && <div style={{ color: P.gold }}>+1 Badge earned!</div>}
              {r.eliteId !== undefined && won && !r.caught && <div style={{ color: "#ce93d8" }}>Elite {r.eliteId + 1} defeated!</div>}
              {r.newLv           && <div style={{ color: "#90caf9" }}>★ Level Up! Now Level {r.newLv}!</div>}
              {r.caught          && <div style={{ color: "#90caf9" }}>{r.speciesName} added to party! 🎉</div>}
              <div style={{ marginTop: 4 }}><XpBar xp={stats.xp} /></div>
            </div>
          )}
          {won && (
            <div style={{ background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "6px 10px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: P.logText, marginBottom: 2 }}>SAVE CODE:</div>
              <div style={{ color: P.gold, fontSize: 11, fontWeight: "bold", wordBreak: "break-all" }}>{buildSaveCode(stats)}</div>
            </div>
          )}
          <button onClick={() => setScreen("hub")} style={{ ...btnDark, width: "100%", padding: "10px 0", fontSize: 13 }}>
            📋 RETURN TO HUB
          </button>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // BATTLE SCREEN
  // ══════════════════════════════════════════════════════════════
  if (screen === "battle" && ctx) {
    const catchable = canCatch(enemyHp, ctx.enemyMaxHp);
    const hintAvail = canUseHint(stats);
    const isElite   = ctx.mode === "elite";
    const topicHint = !isElite ? ALGE_DB[ctx.topic].hint : "Mixed topics — use all your knowledge!";
    const modeLabel = isElite ? `ELITE ${ctx.eliteId! + 1}: ${ELITE_FOUR[ctx.eliteId!].name}` : ctx.mode === "gym" ? `GYM ${ctx.gymId! + 1}: ${GYM_DATA[ctx.gymId!].gymName}` : "WILD BATTLE";
    const inv = stats.inventory;
    const hasBagItems = inv.algaballs > 0 || inv.potions > 0;

    return (
      <div style={wrap}>
        <Card>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.border, fontWeight: "bold", marginBottom: 7 }}>
            <span>{isElite ? "🔮" : "⚔️"} {modeLabel}</span>
            <span>LV{lv} | {stats.algecoins}AC | 💡{inv.hints} ⭕{inv.algaballs} 🧪{inv.potions}</span>
          </div>

          {/* Field */}
          <div style={{ background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "9px 11px", marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
              <div style={{ flex: 1, paddingRight: 7 }}>
                <div style={{ fontSize: 11, color: P.light, marginBottom: 3, fontWeight: "bold" }}>
                  {ctx.enemyName}
                  {catchable && enemyHp > 0 ? <span style={{ color: "#ff7043", marginLeft: 5 }}>★ CATCHABLE!</span> : ""}
                </div>
                <HpBar hp={enemyHp} maxHp={ctx.enemyMaxHp} label={ctx.enemyName} />
              </div>
              <AlgemonSprite color={ctx.enemyColor} emoji={ctx.enemyEmoji} isEnemy fainted={enemyHp <= 0} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <AlgemonSprite color={active.color} emoji={active.emoji} isEnemy={false} fainted={playerHp <= 0} />
              <div style={{ flex: 1, paddingLeft: 7 }}>
                <div style={{ fontSize: 10, color: P.light, marginBottom: 2, fontWeight: "bold" }}>{stats.name}'s {active.displayName}</div>
                <HpBar hp={playerHp} maxHp={PLAYER_MAX_HP} label={stats.name} />
                <XpBar xp={stats.xp} />
              </div>
            </div>
          </div>

          {/* Hint box */}
          {showHint && (
            <div style={{ background: "#fff9c4", border: `2px solid #f9a825`, color: "#5d4037", borderRadius: 4, padding: "7px 10px", fontSize: 11, marginBottom: 7, lineHeight: 1.5 }}>
              💡 {topicHint}
            </div>
          )}

          {/* BAG panel */}
          {showBag && (
            <div style={{ background: "#263238", border: `2px solid ${P.border}`, borderRadius: 5, padding: "8px 12px", marginBottom: 7 }}>
              <div style={{ color: "#b0bec5", fontSize: 10, fontWeight: "bold", marginBottom: 6 }}>🎒 BAG — items used here DO NOT consume your turn</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: "#fff", fontSize: 11 }}>🧪 Potion ×{inv.potions}</div>
                  <div style={{ fontSize: 10, color: "#b0bec5", marginBottom: 4 }}>+{POTION_HEAL} HP</div>
                  <button onClick={usePotion} disabled={inv.potions < 1 || playerHp >= PLAYER_MAX_HP}
                    style={{ ...(inv.potions < 1 || playerHp >= PLAYER_MAX_HP ? btnDisabled : { ...btnBase, background: "#00695c", color: "#fff" }), fontSize: 10, padding: "4px 8px" }}>
                    USE
                  </button>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: "#fff", fontSize: 11 }}>⭕ Algaball ×{inv.algaballs}</div>
                  <div style={{ fontSize: 10, color: "#b0bec5", marginBottom: 4 }}>
                    {enemyHp > 0 ? `~${Math.round((enemyHp / ctx.enemyMaxHp > 0.6 ? 40 : enemyHp / ctx.enemyMaxHp > 0.3 ? 65 : 85))}% catch` : "enemy fainted"}
                  </div>
                  <button onClick={useAlgeball} disabled={inv.algaballs < 1 || enemyHp <= 0}
                    style={{ ...(inv.algaballs < 1 || enemyHp <= 0 ? btnDisabled : { ...btnBase, background: P.red, color: "#fff" }), fontSize: 10, padding: "4px 8px" }}>
                    THROW
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CATCH MODE (short-answer) */}
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
                {hintAvail && (
                  <button onClick={handleHint} style={{ ...btnLight, padding: "8px 11px", fontSize: 11, background: showHint ? P.gold : P.light }}>
                    💡
                  </button>
                )}
                {hasBagItems && (
                  <button onClick={() => setShowBag(v => !v)} style={{ ...btnLight, padding: "8px 11px", fontSize: 11, background: showBag ? P.gold : P.light }}>
                    🎒
                  </button>
                )}
              </div>
            </>
          ) : (
            /* MC QUESTION */
            mcQ && (
              <>
                {!isElite && (
                  <div style={{ fontSize: 9, color: "#5a7a2a", marginBottom: 2 }}>
                    Topic: {ALGE_DB[ctx.topic].topicName}
                  </div>
                )}
                <div style={{ background: P.white, border: `3px solid ${P.border}`, borderRadius: 5, padding: "8px 11px", marginBottom: 7, fontSize: 12, color: P.border, fontWeight: "bold", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {mcQ.text}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
                  {mcQ.options.map((opt, i) => {
                    const label = ["A", "B", "C", "D"][i];
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                        style={{ ...btnBase, background: answered ? (i === mcQ.correct ? "#a5d6a7" : "#ffcdd2") : P.light, color: P.border, fontSize: 11, textAlign: "left", padding: "6px 8px", lineHeight: 1.4, cursor: answered ? "default" : "pointer", boxShadow: answered ? "none" : `3px 3px 0 ${P.border}` }}>
                        <b>{label}.</b> {opt}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={handleCatch} disabled={!catchable || answered}
                    style={{ ...(!catchable || answered ? btnDisabled : { ...btnBase, background: "#e65100", color: "#fff" }), flex: 1, padding: "7px 0", fontSize: 10 }}>
                    🎯 CATCH{!catchable ? " (HP≥30%)" : "!"}
                  </button>
                  {hintAvail && (
                    <button onClick={handleHint} style={{ ...btnLight, padding: "7px 10px", fontSize: 11, background: showHint ? P.gold : P.light }}>
                      💡 HINT{lv < HINT_MIN_LEVEL && inv.hints > 0 ? ` (${inv.hints})` : ""}
                    </button>
                  )}
                  <button onClick={() => setShowBag(v => !v)} style={{ ...btnLight, padding: "7px 10px", fontSize: 11, background: showBag ? P.gold : P.light }}>
                    🎒 BAG
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
