import { useState, useRef, useEffect } from "react";
import {
  AlgemonType, TopicKey, MCQuestion, SAQuestion,
  ALGEMON_TYPES, TYPE_COLOR, TYPE_EMOJI, TYPE_TOPIC,
  WILD_ENEMY, GYM_DATA, ALGE_DB,
  PLAYER_MAX_HP, WILD_ENEMY_MAX_HP, GYM_ENEMY_MAX_HP,
  WILD_CORRECT_DMG, GYM_CORRECT_DMG, WRONG_DMG,
  CATCH_HP_PCT, XP_PER_CORRECT_WILD, XP_PER_CORRECT_GYM,
  XP_PER_LEVEL, HINT_MIN_LEVEL, HINT_TOOL_COST,
  WILD_WIN_COINS, GYM_WIN_COINS,
  xpToLevel, xpToNextLevel, pickRandom, normalizeAns,
} from "../data/gameData";

// ══════════════════════════════════════════════════════════════
// INTERFACES
// ══════════════════════════════════════════════════════════════
interface PartyMember {
  displayName: string;
  type:        AlgemonType;
  emoji:       string;
  color:       string;
}

interface PlayerStats {
  name:        string;
  activeIndex: number;        // which party member is fighting
  party:       PartyMember[]; // max 6 members
  xp:          number;
  algecoins:   number;
  gymBeaten:   boolean[];     // [false × 8]
  inventory:   { hints: number };
}

interface BattleCtx {
  mode:       "wild" | "gym";
  gymId?:     number;
  topic:      TopicKey;
  enemyName:  string;
  enemyColor: string;
  enemyEmoji: string;
  enemyMaxHp: number;
  correctDmg: number;
  xpReward:   number;
  coinReward: number;
  badgeReward: boolean;
  catchType:  AlgemonType;
}

interface BattleResult {
  won:       boolean;
  caught:    boolean;
  xpGained:  number;
  coinsGained: number;
  badgeEarned: boolean;
  gymId?:    number;
  newLv?:    number;
}

type Screen = "start" | "hub" | "gymSelect" | "shop" | "changeAlgemon" | "battle" | "result";

// ══════════════════════════════════════════════════════════════
// GBC PALETTE
// ══════════════════════════════════════════════════════════════
const P = {
  bg:      "#8bac0f",
  darkBg:  "#306230",
  panel:   "#9bbc0f",
  border:  "#1a2e1a",
  light:   "#e0f0c0",
  white:   "#f5f5dc",
  logBg:   "#0f380f",
  logText: "#9bbc0f",
  gold:    "#fdd835",
  red:     "#c62828",
  green:   "#2e7d32",
};

// ══════════════════════════════════════════════════════════════
// SHARED STYLE HELPERS
// ══════════════════════════════════════════════════════════════
const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };

const btnBase: React.CSSProperties = {
  ...mono, fontWeight: "bold", cursor: "pointer",
  border: `3px solid ${P.border}`, borderRadius: 4,
  boxShadow: `3px 3px 0 ${P.border}`,
  transition: "transform .07s, box-shadow .07s",
};
const btnDark: React.CSSProperties = { ...btnBase, background: P.darkBg, color: "#fff" };
const btnLight: React.CSSProperties = { ...btnBase, background: P.light, color: P.border };
const btnDisabled: React.CSSProperties = {
  ...btnBase, background: "#777", color: "#bbb",
  cursor: "not-allowed", boxShadow: "none",
};

function hpBarColor(hp: number, max: number) {
  const p = hp / max;
  return p > 0.5 ? "#3dbb3d" : p > 0.25 ? "#e0b800" : "#cc2200";
}

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: P.panel, border: `4px solid ${P.border}`,
      borderRadius: 8, padding: 18, width: "100%", maxWidth: 500,
      boxShadow: `6px 6px 0 ${P.border}`, ...style,
    }}>{children}</div>
  );
}

function HpBar({ hp, maxHp, label }: { hp: number; maxHp: number; label: string }) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.light, marginBottom: 2 }}>
        <span>{label}</span><span>{Math.max(0, hp)}/{maxHp} HP</span>
      </div>
      <div style={{ width: "100%", height: 11, background: "#4a6141", borderRadius: 3, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: hpBarColor(hp, maxHp), transition: "width .4s, background .4s" }} />
      </div>
    </div>
  );
}

function XpBar({ xp }: { xp: number }) {
  const lv = xpToLevel(xp);
  const pct = lv >= 10 ? 100 : ((xp - (lv - 1) * XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.light, marginBottom: 1 }}>
        <span>LV {lv}  XP {xp}</span>
        <span style={{ color: lv >= HINT_MIN_LEVEL ? P.gold : P.light }}>
          {lv >= 10 ? "MAX" : `→${xpToNextLevel(xp)} XP`}
          {lv >= HINT_MIN_LEVEL && " ★HINT"}
        </span>
      </div>
      <div style={{ width: "100%", height: 7, background: "#4a6141", borderRadius: 2, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#90caf9", transition: "width .4s" }} />
      </div>
    </div>
  );
}

function AlgemonSprite({ color, emoji, isEnemy, fainted }: {
  color: string; emoji: string; isEnemy: boolean; fainted: boolean;
}) {
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
    <div ref={ref} style={{ background: P.logBg, border: `3px solid ${P.border}`, borderRadius: 4, padding: "5px 9px", height: 68, overflowY: "auto", ...mono, fontSize: 10, color: P.logText, lineHeight: 1.55 }}>
      {entries.map((e, i) => <div key={i}>▸ {e}</div>)}
    </div>
  );
}

function StatBar({ label, value, color = P.gold }: { label: string; value: string | number; color?: string }) {
  return (
    <span style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 3, padding: "1px 7px", fontSize: 11, color, ...mono, fontWeight: "bold", marginRight: 5 }}>
      {label}: {value}
    </span>
  );
}

function BadgeIcons({ gymBeaten }: { gymBeaten: boolean[] }) {
  const badges = ["🌿","💧","❄️","⚡","🔩","🌺","🔺","🌊"];
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {badges.map((b, i) => (
        <span key={i} style={{ fontSize: 16, opacity: gymBeaten[i] ? 1 : 0.2, filter: gymBeaten[i] ? "none" : "grayscale(1)" }}>{b}</span>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ══════════════════════════════════════════════════════════════
export default function Game() {

  // ── Player Stats (persist across battles) ──────────────────
  const [stats, setStats] = useState<PlayerStats | null>(null);

  // ── Navigation ─────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("start");

  // ── Battle State ───────────────────────────────────────────
  const [ctx, setCtx]             = useState<BattleCtx | null>(null);
  const [playerHp, setPlayerHp]   = useState(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp]     = useState(100);
  const [mcQ, setMcQ]             = useState<MCQuestion | null>(null);
  const [answered, setAnswered]   = useState(false);
  const [catchMode, setCatchMode] = useState(false);
  const [catchQ, setCatchQ]       = useState<SAQuestion | null>(null);
  const [catchInput, setCatchInput] = useState("");
  const [catchDone, setCatchDone] = useState(false);
  const [showHint, setShowHint]   = useState(false);
  const [log, setLog]             = useState<string[]>([]);

  // ── Result ─────────────────────────────────────────────────
  const [lastResult, setLastResult] = useState<BattleResult | null>(null);

  // ── Start screen form ──────────────────────────────────────
  const [startName, setStartName]   = useState("");
  const [startType, setStartType]   = useState<AlgemonType | null>(null);

  // ── Hub show save code toggle ──────────────────────────────
  const [showCode, setShowCode] = useState(false);

  // ── Helpers ────────────────────────────────────────────────
  const addLog = (msg: string) => setLog(prev => [...prev.slice(-40), msg]);

  const activeMember = (s: PlayerStats) => s.party[s.activeIndex];

  function buildSaveCode(s: PlayerStats): string {
    const lv  = xpToLevel(s.xp);
    const bdg = s.gymBeaten.filter(Boolean).length;
    const typ = activeMember(s).type.toUpperCase();
    return `WSCSS-ALGE2-${typ}-LV${lv}-${s.xp}XP-${bdg}GYM-${s.algecoins}AC`;
  }

  // ── Start new battle ───────────────────────────────────────
  function launchBattle(battleCtx: BattleCtx, currentStats: PlayerStats) {
    const topicData = ALGE_DB[battleCtx.topic];
    const pool = battleCtx.mode === "wild" ? topicData.easy : topicData.hard;
    setCtx(battleCtx);
    setPlayerHp(PLAYER_MAX_HP);
    setEnemyHp(battleCtx.enemyMaxHp);
    setMcQ(pickRandom(pool));
    setAnswered(false);
    setCatchMode(false);
    setCatchQ(null);
    setCatchInput("");
    setCatchDone(false);
    setShowHint(false);
    setLog([
      `A wild ${battleCtx.enemyName} appeared!`,
      `Topic: ${topicData.topicName}`,
      `${currentStats.name}'s ${activeMember(currentStats).displayName} steps forward!`,
      battleCtx.mode === "gym"
        ? `Gym Leader ${GYM_DATA[battleCtx.gymId!].leaderName} wants to battle!`
        : `Practice battle! Simple questions ahead.`,
    ]);
    setScreen("battle");
  }

  function startWildBattle() {
    if (!stats) return;
    const active = activeMember(stats);
    const topic = TYPE_TOPIC[active.type];
    const topicData = ALGE_DB[topic];
    if (!topicData.easy.length) {
      addLog("No wild questions for this topic!");
      return;
    }
    const enemy = WILD_ENEMY[active.type];
    launchBattle({
      mode: "wild", topic, enemyMaxHp: WILD_ENEMY_MAX_HP,
      enemyName: enemy.name, enemyColor: enemy.color, enemyEmoji: enemy.emoji,
      correctDmg: WILD_CORRECT_DMG, xpReward: XP_PER_CORRECT_WILD,
      coinReward: WILD_WIN_COINS, badgeReward: false, catchType: enemy.catchType,
    }, stats);
  }

  function startGymBattle(gymId: number) {
    if (!stats) return;
    const gym = GYM_DATA[gymId];
    launchBattle({
      mode: "gym", gymId, topic: gym.topic, enemyMaxHp: GYM_ENEMY_MAX_HP,
      enemyName: gym.enemyName, enemyColor: gym.enemyColor, enemyEmoji: gym.enemyEmoji,
      correctDmg: GYM_CORRECT_DMG, xpReward: XP_PER_CORRECT_GYM,
      coinReward: GYM_WIN_COINS, badgeReward: true, catchType: gym.catchType,
    }, stats);
  }

  // ── Next MC question ───────────────────────────────────────
  function nextQuestion() {
    if (!ctx) return;
    const pool = ctx.mode === "wild" ? ALGE_DB[ctx.topic].easy : ALGE_DB[ctx.topic].hard;
    setMcQ(pickRandom(pool));
    setAnswered(false);
    setCatchMode(false);
    setCatchQ(null);
    setCatchInput("");
    setCatchDone(false);
    setShowHint(false);
  }

  // ── Handle MC answer ───────────────────────────────────────
  function handleAnswer(idx: number) {
    if (answered || !mcQ || !ctx || !stats) return;
    setAnswered(true);

    if (idx === mcQ.correct) {
      const newEnemyHp = Math.max(0, enemyHp - ctx.correctDmg);
      setEnemyHp(newEnemyHp);
      const newXp = stats.xp + ctx.xpReward;
      const prevLv = xpToLevel(stats.xp);
      const newLv  = xpToLevel(newXp);
      setStats(s => s ? { ...s, xp: newXp } : s);
      addLog(`Correct! ${ctx.enemyName} takes ${ctx.correctDmg} damage! (+${ctx.xpReward} XP)`);
      if (newLv > prevLv) addLog(`★ LEVEL UP! Now Level ${newLv}!`);

      if (newEnemyHp <= 0) {
        // Victory
        const newCoins = stats.algecoins + ctx.coinReward;
        const newBeaten = [...stats.gymBeaten];
        if (ctx.badgeReward && ctx.gymId !== undefined) newBeaten[ctx.gymId] = true;
        setStats(s => s ? { ...s, algecoins: newCoins, gymBeaten: newBeaten, xp: newXp } : s);
        addLog(`${ctx.enemyName} fainted!`);
        if (ctx.badgeReward) addLog(`You earned the ${GYM_DATA[ctx.gymId!].badge}! +${ctx.coinReward}AC`);
        else addLog(`+${ctx.coinReward} Algecoins!`);
        setLastResult({ won: true, caught: false, xpGained: ctx.xpReward, coinsGained: ctx.coinReward, badgeEarned: ctx.badgeReward, gymId: ctx.gymId, newLv: newLv > prevLv ? newLv : undefined });
        setTimeout(() => setScreen("result"), 900);
      } else {
        if (newEnemyHp < ctx.enemyMaxHp * CATCH_HP_PCT) addLog(`${ctx.enemyName} is weakened! Try to CATCH it!`);
        setTimeout(nextQuestion, 1600);
      }
    } else {
      const newHp = Math.max(0, playerHp - WRONG_DMG);
      setPlayerHp(newHp);
      addLog(`Wrong! ${stats.name} takes ${WRONG_DMG} damage!`);
      addLog(`Tip: ${ALGE_DB[ctx.topic].hint.slice(0, 55)}…`);
      if (newHp <= 0) {
        addLog(`${activeMember(stats).displayName} fainted!`);
        setLastResult({ won: false, caught: false, xpGained: 0, coinsGained: 0, badgeEarned: false });
        setTimeout(() => setScreen("result"), 900);
      } else {
        setTimeout(nextQuestion, 2200);
      }
    }
  }

  // ── Handle CATCH button ────────────────────────────────────
  function handleCatch() {
    if (!ctx || !stats) return;
    const saq = pickRandom(ALGE_DB[ctx.topic].shortAnswer as SAQuestion[]);
    setCatchQ(saq);
    setCatchMode(true);
    setCatchInput("");
    setCatchDone(false);
    addLog(`${stats.name} threw a capture device!`);
    addLog(`Solve the challenge to catch ${ctx.enemyName}!`);
  }

  // ── Submit CATCH answer ────────────────────────────────────
  function handleCatchSubmit() {
    if (!catchQ || catchDone || !ctx || !stats) return;
    setCatchDone(true);
    const correct = normalizeAns(catchInput) === normalizeAns(catchQ.answer);
    if (correct) {
      const bonusXp = ctx.xpReward * 2;
      const newXp = stats.xp + bonusXp;
      const prevLv = xpToLevel(stats.xp);
      const newLv  = xpToLevel(newXp);
      // Add to party (max 6)
      const newMember: PartyMember = { displayName: ctx.enemyName, type: ctx.catchType, emoji: ctx.enemyEmoji, color: ctx.enemyColor };
      const newParty = stats.party.length < 6 ? [...stats.party, newMember] : stats.party;
      setStats(s => s ? { ...s, xp: newXp, party: newParty } : s);
      addLog(`Gotcha! ${ctx.enemyName} was caught! (+${bonusXp} XP)`);
      setLastResult({ won: true, caught: true, xpGained: bonusXp, coinsGained: 0, badgeEarned: false, newLv: newLv > prevLv ? newLv : undefined });
      setTimeout(() => setScreen("result"), 1200);
    } else {
      addLog(`Catch failed! Correct: ${catchQ.answer}. ${ctx.enemyName} breaks free!`);
      setTimeout(() => { setCatchMode(false); setCatchInput(""); setCatchDone(false); nextQuestion(); }, 2200);
    }
  }

  // ── Use HINT ────────────────────────────────────────────────
  function handleHint() {
    if (!stats || !ctx) return;
    const lv = xpToLevel(stats.xp);
    if (lv >= HINT_MIN_LEVEL) {
      setShowHint(v => !v);
    } else if (stats.inventory.hints > 0) {
      setStats(s => s ? { ...s, inventory: { hints: s.inventory.hints - 1 } } : s);
      setShowHint(true);
      addLog(`Used a Hint Tool! (${stats.inventory.hints - 1} remaining)`);
    }
  }

  const canHint = (stats: PlayerStats) => xpToLevel(stats.xp) >= HINT_MIN_LEVEL || stats.inventory.hints > 0;
  const canCatch = (hp: number, maxHp: number) => hp > 0 && hp < maxHp * CATCH_HP_PCT;

  // ══════════════════════════════════════════════════════════
  // SCREEN WRAPPERS
  // ══════════════════════════════════════════════════════════
  const wrap: React.CSSProperties = {
    minHeight: "100vh", background: P.bg,
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    ...mono, padding: "12px 8px",
  };

  // ══════════════════════════════════════════════════════════
  // START SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "start") {
    return (
      <div style={wrap}>
        <Card>
          <h1 style={{ textAlign: "center", color: P.border, fontSize: 16, fontWeight: "bold", letterSpacing: 1, marginBottom: 2 }}>⚔️ ALGEMON MATH BATTLE</h1>
          <div style={{ textAlign: "center", fontSize: 10, color: "#3a5a1a", marginBottom: 18 }}>WSCSS v3 — Full Game Loop</div>

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

          <button
            onClick={() => {
              if (!startName.trim() || !startType) return;
              const newStats: PlayerStats = {
                name: startName.trim(), activeIndex: 0,
                party: [{ displayName: `${startType} Starter`, type: startType, emoji: TYPE_EMOJI[startType], color: TYPE_COLOR[startType] }],
                xp: 0, algecoins: 0,
                gymBeaten: Array(8).fill(false),
                inventory: { hints: 0 },
              };
              setStats(newStats);
              setScreen("hub");
            }}
            disabled={!startName.trim() || !startType}
            style={{ ...(!startName.trim() || !startType ? btnDisabled : btnDark), width: "100%", padding: "11px 0", fontSize: 14 }}>
            ▶ BEGIN ADVENTURE
          </button>
        </Card>
      </div>
    );
  }

  // Safety guard — stats must exist beyond start screen
  if (!stats) return null;

  const lv = xpToLevel(stats.xp);
  const badges = stats.gymBeaten.filter(Boolean).length;
  const active = activeMember(stats);

  // ── Shared player info bar ─────────────────────────────────
  const PlayerBar = () => (
    <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ color: P.light, fontSize: 12, fontWeight: "bold" }}>{stats.name} — {active.displayName} {active.emoji}</span>
        <BadgeIcons gymBeaten={stats.gymBeaten} />
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
        <StatBar label="AC" value={stats.algecoins} color={P.gold} />
        <StatBar label="Hints" value={stats.inventory.hints} color="#90caf9" />
        <StatBar label="Party" value={`${stats.party.length}/6`} color={P.light} />
        <StatBar label="Badges" value={badges} color={P.gold} />
      </div>
      <XpBar xp={stats.xp} />
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // HUB (MAIN MENU)
  // ══════════════════════════════════════════════════════════
  if (screen === "hub") {
    const menuItems: { icon: string; label: string; sub: string; action: () => void; disabled?: boolean }[] = [
      {
        icon: "🌿", label: "(1) Encounter Wild Algemon",
        sub: `Practice — ${ALGE_DB[TYPE_TOPIC[active.type]].topicName} (easy)`,
        action: startWildBattle,
      },
      {
        icon: "🏅", label: "(2) Challenge the GYM",
        sub: `${badges}/8 Badges — Next: ${!stats.gymBeaten[0] ? "Lam Tsuen Gym" : GYM_DATA.find((g, i) => !stats.gymBeaten[i])?.gymName ?? "ALL CLEARED!"}`,
        action: () => setScreen("gymSelect"),
      },
      {
        icon: "🔄", label: "(3) Change Algemon",
        sub: `Party: ${stats.party.map(p => p.emoji).join(" ")} (${stats.party.length} members)`,
        action: () => setScreen("changeAlgemon"),
        disabled: stats.party.length < 2,
      },
      {
        icon: "🛒", label: "(4) WSCSS Tuck Shop",
        sub: `Hint Tool — 50 AC each  |  Balance: ${stats.algecoins} AC`,
        action: () => setScreen("shop"),
      },
      {
        icon: "💾", label: "(5) Show Save Code",
        sub: showCode ? buildSaveCode(stats) : "(click to reveal)",
        action: () => setShowCode(v => !v),
      },
    ];

    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ textAlign: "center", color: P.border, fontSize: 15, fontWeight: "bold", marginBottom: 10 }}>📋 TRAINER HUB</h2>
          <PlayerBar />

          {/* Last battle result flash */}
          {lastResult && (
            <div style={{ background: lastResult.won ? "#c8e6c9" : "#ffcdd2", border: `2px solid ${lastResult.won ? P.green : P.red}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10, fontSize: 11 }}>
              {lastResult.caught
                ? `Gotcha! New Algemon caught! +${lastResult.xpGained} XP`
                : lastResult.won
                ? `Victory! +${lastResult.coinsGained} AC  +${lastResult.xpGained} XP${lastResult.badgeEarned ? `  +1 Badge (${GYM_DATA[lastResult.gymId!].badge})` : ""}${lastResult.newLv ? `  ★ LV ${lastResult.newLv}!` : ""}`
                : "You fainted! Try again — no coins lost."}
            </div>
          )}

          {/* 5 menu buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {menuItems.map((item, i) => (
              <button key={i} onClick={() => { if (!item.disabled) { setLastResult(null); item.action(); } }}
                style={{
                  ...btnBase, textAlign: "left", padding: "9px 12px",
                  background: item.disabled ? "#666" : P.darkBg,
                  color: item.disabled ? "#aaa" : "#fff",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  boxShadow: item.disabled ? "none" : `3px 3px 0 ${P.border}`,
                  fontSize: 12, lineHeight: 1.6,
                }}>
                <div>{item.icon} <b>{item.label}</b></div>
                <div style={{ fontSize: 10, color: item.disabled ? "#999" : "#a0d878", fontWeight: "normal" }}>
                  {item.sub}
                </div>
              </button>
            ))}
          </div>

          {showCode && (
            <div style={{ marginTop: 10, background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ color: P.gold, fontSize: 12, fontWeight: "bold", letterSpacing: 1, wordBreak: "break-all", marginBottom: 6 }}>
                {buildSaveCode(stats)}
              </div>
              <button onClick={() => navigator.clipboard?.writeText(buildSaveCode(stats))} style={{ ...btnLight, fontSize: 10, padding: "4px 10px" }}>📋 COPY</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // GYM SELECT
  // ══════════════════════════════════════════════════════════
  if (screen === "gymSelect") {
    const firstUnbeaten = stats.gymBeaten.findIndex(b => !b);
    return (
      <div style={wrap}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold" }}>🏅 GYM SELECTION</h2>
            <button onClick={() => setScreen("hub")} style={{ ...btnLight, fontSize: 11, padding: "4px 10px" }}>← HUB</button>
          </div>
          <PlayerBar />
          <div style={{ fontSize: 10, color: P.border, marginBottom: 8 }}>Challenge gyms in order. Defeat each Leader to unlock the next.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {GYM_DATA.map((gym, i) => {
              const beaten  = stats.gymBeaten[i];
              const unlocked = i === 0 || stats.gymBeaten[i - 1];
              const isCurrent = i === firstUnbeaten;
              return (
                <button key={i} onClick={() => { if (unlocked && !beaten) { setScreen("hub"); startGymBattle(i); } }}
                  style={{
                    ...btnBase, textAlign: "left", padding: "8px 11px", fontSize: 11, lineHeight: 1.7,
                    background: beaten ? "#4a6141" : isCurrent ? P.darkBg : "#555",
                    color: beaten ? "#a0d878" : unlocked ? "#fff" : "#888",
                    cursor: unlocked && !beaten ? "pointer" : "not-allowed",
                    boxShadow: beaten || !unlocked ? "none" : `3px 3px 0 ${P.border}`,
                  }}>
                  <div>
                    {beaten ? "✅" : unlocked ? gym.enemyEmoji : "🔒"}
                    {" "}<b>GYM {i + 1}:</b> {gym.locationName} — {gym.gymName}
                  </div>
                  <div style={{ fontSize: 10, color: beaten ? "#a0d878" : unlocked ? "#a0d878" : "#666" }}>
                    {gym.leaderName}  |  {ALGE_DB[gym.topic].topicName}  |  Reward: {gym.reward} AC + {gym.badge}
                    {beaten ? "  ✓ CLEARED" : isCurrent ? "  ← CHALLENGE NOW" : !unlocked ? "  🔒 LOCKED" : ""}
                  </div>
                </button>
              );
            })}
          </div>
          {badges >= 8 && (
            <div style={{ marginTop: 10, background: P.logBg, border: `2px solid ${P.gold}`, borderRadius: 4, padding: 8, textAlign: "center", color: P.gold, fontSize: 12, fontWeight: "bold" }}>
              🏆 ALL 8 GYMS DEFEATED! You are the WSCSS Champion!
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // CHANGE ALGEMON
  // ══════════════════════════════════════════════════════════
  if (screen === "changeAlgemon") {
    return (
      <div style={wrap}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold" }}>🔄 CHANGE ALGEMON</h2>
            <button onClick={() => setScreen("hub")} style={{ ...btnLight, fontSize: 11, padding: "4px 10px" }}>← HUB</button>
          </div>
          <div style={{ fontSize: 11, color: P.border, marginBottom: 10 }}>
            Active: <b>{active.displayName}</b> {active.emoji} — {ALGE_DB[TYPE_TOPIC[active.type]].topicName}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {stats.party.map((member, i) => {
              const isActive = i === stats.activeIndex;
              return (
                <button key={i} onClick={() => { if (!isActive) setStats(s => s ? { ...s, activeIndex: i } : s); }}
                  style={{
                    ...btnBase, textAlign: "left", padding: "9px 12px", fontSize: 12, lineHeight: 1.7,
                    background: isActive ? member.color : P.darkBg,
                    color: "#fff",
                    cursor: isActive ? "default" : "pointer",
                    outline: isActive ? `3px solid ${P.gold}` : "none", outlineOffset: 2,
                  }}>
                  <b>{member.emoji} {member.displayName}</b>
                  {isActive && <span style={{ marginLeft: 8, fontSize: 10, color: P.gold }}>★ ACTIVE</span>}
                  <div style={{ fontSize: 10, color: isActive ? "#e0f0c0" : "#a0d878", fontWeight: "normal" }}>
                    Type: {member.type}  |  Topic: {ALGE_DB[TYPE_TOPIC[member.type]].topicName}
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

  // ══════════════════════════════════════════════════════════
  // SHOP
  // ══════════════════════════════════════════════════════════
  if (screen === "shop") {
    const hintCost = HINT_TOOL_COST;
    const canBuy   = stats.algecoins >= hintCost;
    return (
      <div style={wrap}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ color: P.border, fontSize: 14, fontWeight: "bold" }}>🛒 WSCSS TUCK SHOP</h2>
            <button onClick={() => setScreen("hub")} style={{ ...btnLight, fontSize: 11, padding: "4px 10px" }}>← HUB</button>
          </div>
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 12px", marginBottom: 12 }}>
            <div style={{ color: P.gold, fontSize: 13, fontWeight: "bold" }}>💰 Balance: {stats.algecoins} Algecoins</div>
            <div style={{ color: P.light, fontSize: 10, marginTop: 2 }}>Earn coins by winning battles. Wild: {WILD_WIN_COINS} AC | Gym: {GYM_WIN_COINS} AC</div>
          </div>

          {/* Hint Tool item */}
          <div style={{ background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 6, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: P.gold, fontSize: 13, fontWeight: "bold" }}>💡 Hint Tool  ×{stats.inventory.hints}</div>
                <div style={{ color: P.logText, fontSize: 10, marginTop: 3, lineHeight: 1.5 }}>
                  Used in battle to reveal a topic hint.<br />
                  Usable at any level. One consumed per use.
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: P.gold, fontSize: 14, fontWeight: "bold" }}>{hintCost} AC</div>
                <button onClick={() => {
                  if (canBuy) setStats(s => s ? { ...s, algecoins: s.algecoins - hintCost, inventory: { hints: s.inventory.hints + 1 } } : s);
                }} style={{ ...canBuy ? btnDark : btnDisabled, fontSize: 11, padding: "6px 12px", marginTop: 4 }}>
                  BUY
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 10, color: P.border, textAlign: "center" }}>
            More items coming in a future update!
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "result" && ctx) {
    const r = lastResult;
    const won = r?.won ?? false;
    return (
      <div style={wrap}>
        <Card>
          <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", color: r?.caught ? "#1565c0" : won ? P.green : P.red, marginBottom: 8 }}>
            {r?.caught ? "🎉 CAUGHT!" : won ? "🏆 VICTORY!" : "😵 FAINTED!"}
          </h2>
          <p style={{ textAlign: "center", color: P.border, fontSize: 12, marginBottom: 12 }}>
            {r?.caught
              ? `Gotcha! ${ctx.enemyName} joined your party!`
              : won
              ? `${ctx.enemyName} was defeated! Great work, ${stats.name}!`
              : `Don't give up! Review ${ALGE_DB[ctx.topic].topicName} and try again.`}
          </p>

          {/* Mini sprite scene */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "10px 6px", marginBottom: 10 }}>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite color={active.color} emoji={active.emoji} isEnemy={false} fainted={!won} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{stats.name} ({active.displayName})</div>
            </div>
            <div style={{ fontSize: 18, color: P.light, paddingBottom: 14 }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite color={ctx.enemyColor} emoji={ctx.enemyEmoji} isEnemy fainted={won && !r?.caught} />
              <div style={{ fontSize: 9, color: P.light, marginTop: 3 }}>{ctx.enemyName}</div>
            </div>
          </div>

          {/* Stats */}
          {r && (
            <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "7px 10px", marginBottom: 10, fontSize: 11 }}>
              {r.xpGained > 0 && <div style={{ color: P.light }}>+{r.xpGained} XP</div>}
              {r.coinsGained > 0 && <div style={{ color: P.gold }}>+{r.coinsGained} Algecoins</div>}
              {r.badgeEarned && <div style={{ color: P.gold }}>+1 Badge: {GYM_DATA[r.gymId!].badge} {GYM_DATA[r.gymId!].enemyEmoji}</div>}
              {r.newLv && <div style={{ color: "#90caf9" }}>★ Level Up! Now Level {r.newLv}!</div>}
              {r.caught && <div style={{ color: "#90caf9" }}>{ctx.enemyName} added to your party!</div>}
              <div style={{ marginTop: 4 }}><XpBar xp={stats.xp} /></div>
            </div>
          )}

          {/* Save code on win */}
          {won && (
            <div style={{ background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "6px 10px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: P.logText, marginBottom: 3 }}>SAVE CODE:</div>
              <div style={{ color: P.gold, fontSize: 11, fontWeight: "bold", wordBreak: "break-all" }}>{buildSaveCode(stats)}</div>
            </div>
          )}

          <button onClick={() => { setScreen("hub"); }} style={{ ...btnDark, width: "100%", padding: "10px 0", fontSize: 13 }}>
            📋 RETURN TO HUB
          </button>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // BATTLE SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "battle" && ctx) {
    const catchable = canCatch(enemyHp, ctx.enemyMaxHp);
    const hintAvail = canHint(stats);
    const topicHint = ALGE_DB[ctx.topic].hint;
    const gymLabel = ctx.mode === "gym" ? `GYM ${ctx.gymId! + 1}: ${GYM_DATA[ctx.gymId!].gymName}` : "WILD BATTLE";

    return (
      <div style={wrap}>
        <Card>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.border, fontWeight: "bold", marginBottom: 7 }}>
            <span>⚔️ {gymLabel} — {ALGE_DB[ctx.topic].topicName}</span>
            <span style={{ color: lv >= HINT_MIN_LEVEL ? P.gold : P.border }}>LV{lv} | {stats.algecoins}AC | 💡{stats.inventory.hints}</span>
          </div>

          {/* Field */}
          <div style={{ background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "9px 11px", marginBottom: 7 }}>
            {/* Enemy */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
              <div style={{ flex: 1, paddingRight: 7 }}>
                <div style={{ fontSize: 11, color: P.light, marginBottom: 3, fontWeight: "bold" }}>
                  {ctx.enemyName}{catchable && enemyHp > 0 ? <span style={{ color: "#ff7043", marginLeft: 5 }}>★ CATCHABLE!</span> : ""}
                </div>
                <HpBar hp={enemyHp} maxHp={ctx.enemyMaxHp} label={ctx.enemyName} />
              </div>
              <AlgemonSprite color={ctx.enemyColor} emoji={ctx.enemyEmoji} isEnemy fainted={enemyHp <= 0} />
            </div>
            {/* Player */}
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
            <div style={{ background: "#fff9c4", border: `2px solid #f9a825`, color: "#5d4037", borderRadius: 4, padding: "7px 10px", fontSize: 11, marginBottom: 7, fontWeight: "bold", lineHeight: 1.5 }}>
              💡 {topicHint}
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
                disabled={catchDone}
                placeholder="Type your answer…"
                style={{ width: "100%", boxSizing: "border-box", ...mono, fontSize: 12, padding: "6px 10px", border: `3px solid ${P.border}`, borderRadius: 4, background: P.white, marginBottom: 7 }} />
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={handleCatchSubmit} disabled={catchDone || !catchInput.trim()}
                  style={{ ...(!catchInput.trim() || catchDone ? btnDisabled : { ...btnBase, background: P.red, color: "#fff" }), flex: 1, padding: "8px 0", fontSize: 12 }}>
                  ✔ SUBMIT ANSWER
                </button>
                {hintAvail && (
                  <button onClick={handleHint} style={{ ...btnLight, padding: "8px 11px", fontSize: 11, background: showHint ? P.gold : P.light }}>
                    💡 HINT{lv < HINT_MIN_LEVEL && stats.inventory.hints > 0 ? ` (${stats.inventory.hints})` : ""}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* MC QUESTION */
            mcQ && (
              <>
                <div style={{ background: P.white, border: `3px solid ${P.border}`, borderRadius: 5, padding: "8px 11px", marginBottom: 7, fontSize: 12, color: P.border, fontWeight: "bold", lineHeight: 1.6 }}>
                  {mcQ.text}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
                  {mcQ.options.map((opt, i) => {
                    const label = ["A", "B", "C", "D"][i];
                    const isCorrect = i === mcQ.correct;
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                        style={{ ...btnBase, background: answered ? (isCorrect ? "#a5d6a7" : "#ffcdd2") : P.light, color: P.border, fontSize: 11, textAlign: "left", padding: "6px 8px", lineHeight: 1.4, cursor: answered ? "default" : "pointer", boxShadow: answered ? "none" : `3px 3px 0 ${P.border}` }}>
                        <b>{label}.</b> {opt}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={handleCatch}
                    disabled={!catchable || answered}
                    style={{ ...(!catchable || answered ? btnDisabled : { ...btnBase, background: "#e65100", color: "#fff" }), flex: 1, padding: "7px 0", fontSize: 11 }}>
                    🎯 CATCH{enemyHp >= ctx.enemyMaxHp * CATCH_HP_PCT ? ` (HP<30%)` : ""}
                  </button>
                  {hintAvail && (
                    <button onClick={handleHint} style={{ ...btnLight, padding: "7px 11px", fontSize: 11, background: showHint ? P.gold : P.light }}>
                      💡 HINT{lv < HINT_MIN_LEVEL && stats.inventory.hints > 0 ? ` (${stats.inventory.hints})` : ""}
                    </button>
                  )}
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

