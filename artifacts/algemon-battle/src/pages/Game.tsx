import { useState, useRef, useEffect } from "react";

// ╔══════════════════════════════════════════════════════════════╗
// ║                      ALGE_DB v2.0                           ║
// ║  Organized by topic. To add questions, append entries to    ║
// ║  the multipleChoice or shortAnswer arrays in each topic.    ║
// ║                                                             ║
// ║  multipleChoice entries:                                    ║
// ║    text     – question text                                 ║
// ║    options  – exactly 4 choices (A B C D)                   ║
// ║    correct  – index 0-3 of the correct option               ║
// ║                                                             ║
// ║  shortAnswer entries (used for CATCH phase):                ║
// ║    text     – question shown during catch attempt           ║
// ║    answer   – accepted answer string (case-insensitive,     ║
// ║               spaces ignored for matching)                  ║
// ║                                                             ║
// ║  hint – a topic-level tip shown when HINT is clicked        ║
// ╚══════════════════════════════════════════════════════════════╝
const ALGE_DB = {
  factorization: {
    topicName: "Factorization",
    // Hint shown when the player clicks the HINT button (Level 5+)
    hint: "Factor out any common factor first! Then look for Difference of Two Squares (a²−b² = (a+b)(a−b)) or a trinomial pattern ax²+bx+c.",
    multipleChoice: [
      {
        text: "Factorise completely: x² + 5x + 6",
        // Distractor A: wrong pair (1×6 not 2×3)
        // Distractor C: repeated factor — common mistake
        // Distractor D: sign error
        options: ["(x + 1)(x + 6)", "(x + 2)(x + 3)", "(x + 3)²", "(x − 2)(x − 3)"],
        correct: 1,
      },
      {
        text: "Factorise completely: x² − 9",
        // Distractor A: treated as perfect square, wrong sign
        // Distractor C: wrong sum/product
        // Distractor D: flipped signs
        options: ["(x − 3)²", "(x + 9)(x − 1)", "(x + 3)(x − 3)", "(x − 9)(x + 1)"],
        correct: 2,
      },
      {
        text: "Factorise completely: 2x² + 7x + 3",
        // Distractor B: wrong inner term order
        // Distractor C: dropped the 2 coefficient
        // Distractor D: sign error on constant
        options: ["(2x + 1)(x + 3)", "(2x + 3)(x + 1)", "(x + 3)(x + 1)", "(2x − 1)(x + 3)"],
        correct: 0,
      },
      {
        text: "Factorise completely: 3x² − 12",
        // Distractor A: correct factor but not fully factorised (common DSE mark loss)
        // Distractor C: incorrectly expanded before factoring
        // Distractor D: wrong — subtracts constant inside
        options: ["3(x² − 4)", "3(x + 2)(x − 2)", "(3x − 6)(x + 2)", "3(x − 4)"],
        correct: 1,
      },
      {
        text: "Factorise completely: x² − 6x + 9",
        // Distractor A: DOTS mistake — treats as difference of squares
        // Distractor B: wrong number pair
        // Distractor D: sign flipped
        options: ["(x − 3)(x + 3)", "(x − 9)(x + 1)", "(x − 3)²", "(x + 3)²"],
        correct: 2,
      },
    ],
    shortAnswer: [
      {
        text: "CATCH CHALLENGE!\nFactorise: x² − 16\n(Type your answer, e.g. (x+4)(x-4))",
        answer: "(x+4)(x-4)",
      },
      {
        text: "CATCH CHALLENGE!\nFactorise: x² + 8x + 15\n(Type your answer, e.g. (x+a)(x+b))",
        answer: "(x+3)(x+5)",
      },
    ],
  },

  changeOfSubject: {
    topicName: "Change of Subject",
    hint: "Isolate the target variable step by step — inverse operations in reverse order. If it appears in a fraction, cross-multiply first!",
    multipleChoice: [
      {
        text: "Make x the subject: y = 3x + 5",
        // Distractor B: divided only part of the expression
        // Distractor C: added instead of subtracted
        // Distractor D: multiplied instead of divided
        options: ["x = (y − 5) / 3", "x = y/3 − 5", "x = (y + 5) / 3", "x = 3y − 5"],
        correct: 0,
      },
      {
        text: "Make r the subject: A = πr²",
        // Distractor B: forgot square root
        // Distractor C: took square root of whole thing incorrectly
        // Distractor D: inverted
        options: ["r = √(A / π)", "r = A / π", "r = √(Aπ)", "r = A² / π"],
        correct: 0,
      },
      {
        text: "Make h the subject: V = ½ b h",
        // Distractor B: only divided by b, forgot the ½
        // Distractor C: multiplied b instead of dividing
        // Distractor D: inverted both
        options: ["h = 2V / b", "h = V / b", "h = Vb / 2", "h = b / (2V)"],
        correct: 0,
      },
      {
        text: "Make b the subject: P = 2(a + b)",
        // Distractor A: forgot to divide by 2 before subtracting
        // Distractor C: added a instead of subtracting
        // Distractor D: multiplied by 2 instead of dividing
        options: ["b = P − 2a", "b = P/2 − a", "b = P/2 + a", "b = 2P − a"],
        correct: 1,
      },
      {
        text: "Make t the subject: s = ut + ½at²  (ignore the ½at² term — make t the subject of s = ut only)",
        // Simple version: s = ut → t = s/u
        options: ["t = s/u", "t = u/s", "t = su", "t = s − u"],
        correct: 0,
      },
    ],
    shortAnswer: [
      {
        text: "CATCH CHALLENGE!\nMake x the subject: y = 2x − 3\n(Type your answer, e.g. x=(y+3)/2)",
        answer: "x=(y+3)/2",
      },
      {
        text: "CATCH CHALLENGE!\nMake x the subject: y = 5x\n(Type your answer, e.g. x=y/5)",
        answer: "x=y/5",
      },
    ],
  },

  inequalities: {
    topicName: "Inequalities",
    hint: "Remember: multiplying or dividing both sides by a NEGATIVE number FLIPS the inequality sign (< becomes >, ≤ becomes ≥)!",
    multipleChoice: [
      {
        text: "Solve: 2x + 3 > 7",
        // Distractor B: added instead of subtracted
        // Distractor C: flipped sign — common error
        // Distractor D: non-strict — wrong symbol
        options: ["x > 2", "x > 5", "x < 2", "x ≥ 2"],
        correct: 0,
      },
      {
        text: "Solve: −3x ≤ 9",
        // Key: dividing by negative flips ≤ to ≥
        // Distractor A: forgot to flip sign
        // Distractor C: divided wrong
        // Distractor D: both wrong
        options: ["x ≤ −3", "x ≥ −3", "x ≥ 3", "x ≤ 3"],
        correct: 1,
      },
      {
        text: "Solve: x/2 − 1 < 3",
        // x/2 < 4 → x < 8
        // Distractor B: forgot to multiply by 2 at end
        // Distractor C: subtracted instead of added
        // Distractor D: flipped sign
        options: ["x < 8", "x < 4", "x < 2", "x > 8"],
        correct: 0,
      },
      {
        text: "Solve: 5 − 2x > 1",
        // −2x > −4 → x < 2 (flip!)
        // Distractor A: forgot to flip
        // Distractor C: arithmetic error
        // Distractor D: subtracted wrong
        options: ["x > 2", "x < 2", "x > −2", "x < −2"],
        correct: 1,
      },
      {
        text: "Solve: 3(x − 1) ≥ 6",
        // 3x − 3 ≥ 6 → 3x ≥ 9 → x ≥ 3
        // Distractor A: not strict
        // Distractor C: divided by 6 not 3
        // Distractor D: subtracted instead of added
        options: ["x > 3", "x ≥ 3", "x ≥ 2", "x ≥ 0"],
        correct: 1,
      },
    ],
    shortAnswer: [
      {
        text: "CATCH CHALLENGE!\nSolve: 4x − 2 > 10\n(Type your answer as: x>3)",
        answer: "x>3",
      },
      {
        text: "CATCH CHALLENGE!\nSolve: −2x < 6\n(Type your answer as: x>-3)",
        answer: "x>-3",
      },
    ],
  },
} as const;

// ══════════════════════════════════════════════════════════════
// TYPE SYSTEM
// ══════════════════════════════════════════════════════════════
const ALGEMON_TYPES = ["Fire", "Water", "Grass"] as const;
type AlgemonType = typeof ALGEMON_TYPES[number];
type TopicKey = "factorization" | "changeOfSubject" | "inequalities";

// Fire → solves Change of Subject (Water-type enemy)
// Water → solves Factorization (Grass-type enemy)
// Grass → solves Inequalities (Ice-type enemy)
const TYPE_TOPIC: Record<AlgemonType, TopicKey> = {
  Fire:  "changeOfSubject",
  Water: "factorization",
  Grass: "inequalities",
};

const TYPE_COLOR: Record<AlgemonType, string> = {
  Fire:  "#e05c00",
  Water: "#1565c0",
  Grass: "#2d7a27",
};

const TYPE_EMOJI: Record<AlgemonType, string> = {
  Fire:  "🔥",
  Water: "💧",
  Grass: "🌿",
};

// Enemy appearance per topic
const ENEMY_DATA: Record<TopicKey, { name: string; color: string; emoji: string }> = {
  changeOfSubject: { name: "Aqua Specter",  color: "#1565c0", emoji: "💧" },
  factorization:   { name: "Flora Specter", color: "#2d7a27", emoji: "🌿" },
  inequalities:    { name: "Cryo Specter",  color: "#00838f", emoji: "❄️" },
};

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════
const PLAYER_MAX_HP  = 100;
const ENEMY_MAX_HP   = 100;
const CORRECT_DMG    = 50;  // 2 correct answers to win
const WRONG_DMG      = 20;  // player takes this on wrong answer
const CATCH_HP_THRESHOLD = 30; // enemy HP must be below this to catch
const XP_PER_CORRECT = 40;
const XP_PER_LEVEL   = 100;
const HINT_MIN_LEVEL = 5;

// ══════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function xpToLevel(xp: number): number {
  return Math.min(10, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function xpToNextLevel(xp: number): number {
  const lv = xpToLevel(xp);
  return lv * XP_PER_LEVEL - xp;
}

// Normalize strings for short-answer comparison
function normalizeAnswer(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "").replace(/×/g, "*");
}

function hpBarColor(hp: number, max: number): string {
  const pct = hp / max;
  if (pct > 0.5) return "#3dbb3d";
  if (pct > 0.25) return "#e0b800";
  return "#cc2200";
}

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
};

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════
function HpBar({ hp, maxHp, label }: { hp: number; maxHp: number; label: string }) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: P.light, marginBottom: 2 }}>
        <span>{label}</span>
        <span>{Math.max(0, hp)}/{maxHp} HP</span>
      </div>
      <div style={{ width: "100%", height: 12, background: "#4a6141", borderRadius: 3, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: hpBarColor(hp, maxHp),
          transition: "width 0.4s ease, background 0.4s ease",
        }} />
      </div>
    </div>
  );
}

function XpBar({ xp }: { xp: number }) {
  const lv = xpToLevel(xp);
  const lvStart = (lv - 1) * XP_PER_LEVEL;
  const lvEnd = lv * XP_PER_LEVEL;
  const pct = lv >= 10 ? 100 : ((xp - lvStart) / (lvEnd - lvStart)) * 100;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.light, marginBottom: 1 }}>
        <span>LV {lv}  XP {xp}</span>
        <span>{lv < 10 ? `Next: ${xpToNextLevel(xp)} XP` : "MAX"}</span>
      </div>
      <div style={{ width: "100%", height: 8, background: "#4a6141", borderRadius: 2, border: `2px solid ${P.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#a0c4ff", transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function AlgemonSprite({
  color, emoji, isEnemy, fainted,
}: { color: string; emoji: string; isEnemy: boolean; fainted: boolean }) {
  const size = isEnemy ? 90 : 74;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      opacity: fainted ? 0.2 : 1, transition: "opacity 0.5s",
      transform: isEnemy ? "none" : "scaleX(-1)",
      flexShrink: 0,
    }}>
      <div style={{
        width: size, height: size, background: color,
        borderRadius: isEnemy ? "50% 50% 38% 38%" : "38% 38% 50% 50%",
        border: `3px solid ${P.border}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        boxShadow: fainted ? "none" : `0 0 14px ${color}99`,
      }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 2 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: 10, height: 10, background: "#fff", borderRadius: "50%", border: `2px solid ${P.border}` }}>
              <div style={{ width: 5, height: 5, background: P.border, borderRadius: "50%", margin: "2px auto 0" }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 18 }}>{emoji}</div>
      </div>
      <div style={{ width: size * 0.65, height: 7, background: "rgba(0,0,0,0.3)", borderRadius: "50%", marginTop: -2 }} />
    </div>
  );
}

function BattleLog({ entries }: { entries: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);
  return (
    <div ref={ref} style={{
      background: P.logBg, border: `3px solid ${P.border}`,
      borderRadius: 4, padding: "6px 10px",
      height: 76, overflowY: "auto",
      fontFamily: "'Courier New', monospace", fontSize: 11,
      color: P.logText, lineHeight: 1.55,
    }}>
      {entries.map((e, i) => <div key={i}>▸ {e}</div>)}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ══════════════════════════════════════════════════════════════
type Screen = "start" | "battle" | "result";
type WinCause = "defeat" | "caught" | "fainted" | null;

export default function Game() {
  // ── Persistent across battles ──────────────────────────────
  const [playerName, setPlayerName] = useState("");
  const [chosenType, setChosenType]  = useState<AlgemonType | null>(null);
  const [xp, setXp]   = useState(0);

  // ── Screen routing ─────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("start");

  // ── Per-battle state ───────────────────────────────────────
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [enemyHp,  setEnemyHp]  = useState(ENEMY_MAX_HP);

  // Multiple-choice question
  const [mcQuestion, setMcQuestion] = useState<(typeof ALGE_DB.factorization.multipleChoice)[number] | null>(null);
  const [answered, setAnswered] = useState(false);

  // Catch phase
  const [catchMode,     setCatchMode]     = useState(false);
  const [catchQuestion, setCatchQuestion] = useState<{ text: string; answer: string } | null>(null);
  const [catchInput,    setCatchInput]    = useState("");
  const [catchSubmitted, setCatchSubmitted] = useState(false);

  // Hint
  const [showHint, setShowHint] = useState(false);

  // Battle log
  const [log, setLog] = useState<string[]>([]);

  // Result
  const [winCause, setWinCause] = useState<WinCause>(null);
  const [saveCode, setSaveCode] = useState("");

  // ── Derived ────────────────────────────────────────────────
  const level = xpToLevel(xp);
  const topic = chosenType ? ALGE_DB[TYPE_TOPIC[chosenType]] : null;
  const enemyInfo = chosenType ? ENEMY_DATA[TYPE_TOPIC[chosenType]] : null;
  const canCatch = enemyHp > 0 && enemyHp < CATCH_HP_THRESHOLD && !catchMode && !answered;
  const canHint  = level >= HINT_MIN_LEVEL && !catchMode;

  // ── Log helper ─────────────────────────────────────────────
  const addLog = (msg: string) => setLog(prev => [...prev.slice(-30), msg]);

  // ── Pick next MC question ──────────────────────────────────
  const nextQuestion = (topicData: typeof ALGE_DB.factorization) => {
    setMcQuestion(pickRandom(topicData.multipleChoice));
    setAnswered(false);
    setCatchMode(false);
    setCatchInput("");
    setCatchSubmitted(false);
    setShowHint(false);
  };

  // ── Start battle ───────────────────────────────────────────
  const startBattle = () => {
    if (!playerName.trim() || !chosenType) return;
    const topicData = ALGE_DB[TYPE_TOPIC[chosenType]];
    const enemy = ENEMY_DATA[TYPE_TOPIC[chosenType]];
    setPlayerHp(PLAYER_MAX_HP);
    setEnemyHp(ENEMY_MAX_HP);
    setWinCause(null);
    setSaveCode("");
    setLog([
      `A wild ${enemy.name} appeared!`,
      `Topic: ${topicData.topicName}`,
      `${playerName}'s ${chosenType} Algemon steps forward!`,
    ]);
    nextQuestion(topicData);
    setScreen("battle");
  };

  // ── Answer MC question ─────────────────────────────────────
  const handleAnswer = (idx: number) => {
    if (answered || !mcQuestion || !topic || !enemyInfo) return;
    setAnswered(true);

    if (idx === mcQuestion.correct) {
      const newEnemyHp = Math.max(0, enemyHp - CORRECT_DMG);
      const newXp = xp + XP_PER_CORRECT;
      setEnemyHp(newEnemyHp);
      setXp(newXp);
      addLog(`Correct! ${enemyInfo.name} takes ${CORRECT_DMG} damage! (+${XP_PER_CORRECT} XP)`);

      if (xpToLevel(newXp) > level) {
        addLog(`★ LEVEL UP! Now Level ${xpToLevel(newXp)}!`);
      }

      if (newEnemyHp <= 0) {
        addLog(`${enemyInfo.name} fainted! ${playerName} wins!`);
        const code = `WSCSS-ALGE2-${chosenType!.toUpperCase()}-${xpToLevel(newXp)}-${newXp}`;
        setSaveCode(code);
        setWinCause("defeat");
        setTimeout(() => setScreen("result"), 900);
      } else {
        if (newEnemyHp < CATCH_HP_THRESHOLD) {
          addLog(`${enemyInfo.name} is weakened! Try to CATCH it!`);
        }
        setTimeout(() => nextQuestion(topic), 1600);
      }
    } else {
      const newPlayerHp = Math.max(0, playerHp - WRONG_DMG);
      setPlayerHp(newPlayerHp);
      addLog(`Wrong! ${playerName} takes ${WRONG_DMG} damage!`);
      addLog(`Tip: ${topic.hint.slice(0, 60)}…`);

      if (newPlayerHp <= 0) {
        addLog(`${playerName}'s Algemon fainted!`);
        setWinCause("fainted");
        setTimeout(() => setScreen("result"), 900);
      } else {
        setTimeout(() => nextQuestion(topic), 2200);
      }
    }
  };

  // ── Start catch phase ──────────────────────────────────────
  const handleCatch = () => {
    if (!canCatch || !topic || !enemyInfo) return;
    const q = pickRandom(topic.shortAnswer as readonly { text: string; answer: string }[]);
    setCatchQuestion(q);
    setCatchMode(true);
    setCatchInput("");
    setCatchSubmitted(false);
    addLog(`${playerName} threw a capture device!`);
    addLog(`Solve the challenge to catch ${enemyInfo.name}!`);
  };

  // ── Submit short-answer catch ──────────────────────────────
  const handleCatchSubmit = () => {
    if (!catchQuestion || catchSubmitted || !enemyInfo) return;
    setCatchSubmitted(true);

    const playerNorm = normalizeAnswer(catchInput);
    const answerNorm = normalizeAnswer(catchQuestion.answer);

    if (playerNorm === answerNorm) {
      const newXp = xp + XP_PER_CORRECT * 2;
      setXp(newXp);
      addLog(`Gotcha! ${enemyInfo.name} was caught! (+${XP_PER_CORRECT * 2} XP)`);
      const code = `WSCSS-ALGE2-${chosenType!.toUpperCase()}-${xpToLevel(newXp)}-${newXp}`;
      setSaveCode(code);
      setWinCause("caught");
      setTimeout(() => setScreen("result"), 1200);
    } else {
      addLog(`Catch failed! Correct answer was: ${catchQuestion.answer}`);
      addLog(`${enemyInfo.name} broke free! Keep fighting!`);
      setTimeout(() => {
        setCatchMode(false);
        setCatchInput("");
        setCatchSubmitted(false);
        nextQuestion(topic!);
      }, 2000);
    }
  };

  // ── Reset ──────────────────────────────────────────────────
  const resetGame = () => {
    setScreen("start");
    setChosenType(null);
    setAnswered(false);
    setCatchMode(false);
    setCatchInput("");
    setShowHint(false);
  };

  // ── Styles ─────────────────────────────────────────────────
  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", background: P.bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Courier New', monospace", padding: "12px 8px",
  };

  const cardStyle: React.CSSProperties = {
    background: P.panel, border: `4px solid ${P.border}`,
    borderRadius: 8, padding: 18, width: "100%", maxWidth: 500,
    boxShadow: `6px 6px 0 ${P.border}`,
  };

  const btnBase: React.CSSProperties = {
    fontFamily: "'Courier New', monospace", fontWeight: "bold",
    cursor: "pointer", border: `3px solid ${P.border}`,
    borderRadius: 4, transition: "transform 0.07s, box-shadow 0.07s",
    boxShadow: `3px 3px 0 ${P.border}`,
  };

  const disabledBtn: React.CSSProperties = {
    ...btnBase, background: "#888", color: "#ccc",
    cursor: "not-allowed", boxShadow: "none",
  };

  // ══════════════════════════════════════════════════════════
  // START SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "start") {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h1 style={{ textAlign: "center", color: P.border, fontSize: 17, fontWeight: "bold", letterSpacing: 1, marginBottom: 2 }}>
            ⚔️ ALGEMON MATH BATTLE
          </h1>
          <div style={{ textAlign: "center", fontSize: 10, color: "#3a5a1a", marginBottom: 18 }}>
            WSCSS v2.0 — Type Weakness Battle System
          </div>

          {xp > 0 && (
            <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "6px 10px", marginBottom: 14 }}>
              <div style={{ color: P.light, fontSize: 11, marginBottom: 4 }}>TRAINER RECORD</div>
              <XpBar xp={xp} />
              {level >= HINT_MIN_LEVEL && (
                <div style={{ fontSize: 10, color: "#ffd54f", marginTop: 2 }}>★ HINT UNLOCKED (Lv {level})</div>
              )}
            </div>
          )}

          <label style={{ display: "block", color: P.border, fontSize: 12, marginBottom: 3 }}>TRAINER NAME:</label>
          <input
            type="text" maxLength={16} value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: "100%", boxSizing: "border-box",
              fontFamily: "'Courier New', monospace", fontSize: 13, padding: "6px 10px",
              border: `3px solid ${P.border}`, borderRadius: 4, background: P.white,
              marginBottom: 16,
            }}
          />

          <div style={{ color: P.border, fontSize: 12, marginBottom: 6 }}>CHOOSE YOUR STARTER:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {ALGEMON_TYPES.map(t => (
              <button key={t} onClick={() => setChosenType(t)} style={{
                ...btnBase, flex: 1, padding: "8px 4px", fontSize: 12, lineHeight: 1.6,
                background: chosenType === t ? TYPE_COLOR[t] : P.light,
                color: chosenType === t ? "#fff" : P.border,
                outline: chosenType === t ? `3px solid ${P.border}` : "none",
                outlineOffset: 2,
              }}>
                {TYPE_EMOJI[t]}<br /><b>{t}</b>
              </button>
            ))}
          </div>

          {chosenType && (
            <div style={{
              background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4,
              padding: "6px 10px", marginBottom: 14, fontSize: 11, color: P.light,
            }}>
              <b>{chosenType}</b> Algemon fights <b>{chosenType === "Fire" ? "Water" : chosenType === "Water" ? "Grass" : "Ice"}</b> enemies
              {" "}using <b>{topic?.topicName}</b> questions.
            </div>
          )}

          <button onClick={startBattle} disabled={!playerName.trim() || !chosenType}
            style={(!playerName.trim() || !chosenType)
              ? { ...disabledBtn, width: "100%", padding: "11px 0", fontSize: 14 }
              : { ...btnBase, width: "100%", padding: "11px 0", fontSize: 14, background: P.darkBg, color: "#fff" }
            }>
            ▶ START BATTLE
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ══════════════════════════════════════════════════════════
  if (screen === "result") {
    const playerWon = winCause === "defeat" || winCause === "caught";
    const resultColor = playerWon ? "#2d7a27" : "#c62828";

    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", color: resultColor, marginBottom: 8 }}>
            {winCause === "caught" ? "🎉 CAUGHT!" : playerWon ? "🏆 YOU WIN!" : "😵 YOU FAINTED!"}
          </h2>
          <p style={{ textAlign: "center", color: P.border, fontSize: 13, marginBottom: 14 }}>
            {winCause === "caught"
              ? `Gotcha! ${enemyInfo?.name} joined your team, ${playerName}!`
              : playerWon
              ? `${enemyInfo?.name} was defeated! Great maths, ${playerName}!`
              : `Don't give up, ${playerName}! Review ${topic?.topicName}!`}
          </p>

          {/* Sprite scene */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 14, background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "12px 8px" }}>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite color={TYPE_COLOR[chosenType!]} emoji={TYPE_EMOJI[chosenType!]} isEnemy={false} fainted={!playerWon} />
              <div style={{ fontSize: 10, color: P.light, marginTop: 4 }}>{playerName} ({chosenType})</div>
            </div>
            <div style={{ fontSize: 22, color: P.light, paddingBottom: 16 }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite color={enemyInfo!.color} emoji={enemyInfo!.emoji} isEnemy fainted={playerWon && winCause !== "caught"} />
              <div style={{ fontSize: 10, color: P.light, marginTop: 4 }}>{enemyInfo?.name}</div>
            </div>
          </div>

          {/* XP summary */}
          <div style={{ background: P.darkBg, border: `2px solid ${P.border}`, borderRadius: 4, padding: "8px 12px", marginBottom: 12 }}>
            <div style={{ color: P.light, fontSize: 11, marginBottom: 4 }}>TRAINER STATS</div>
            <XpBar xp={xp} />
            {level >= HINT_MIN_LEVEL && <div style={{ fontSize: 10, color: "#ffd54f", marginTop: 2 }}>★ HINT UNLOCKED at Level {HINT_MIN_LEVEL}!</div>}
          </div>

          {/* Save code */}
          {saveCode && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: P.border, marginBottom: 4, fontWeight: "bold" }}>SAVE CODE — copy and keep this!</div>
              <div style={{
                background: P.logBg, border: `2px solid ${P.border}`, borderRadius: 4,
                padding: "8px 12px", color: "#ffd54f",
                fontSize: 13, fontWeight: "bold", letterSpacing: 1,
                wordBreak: "break-all", textAlign: "center",
              }}>
                {saveCode}
              </div>
              <button onClick={() => navigator.clipboard?.writeText(saveCode)} style={{
                ...btnBase, marginTop: 6, width: "100%", padding: "6px 0",
                fontSize: 11, background: P.light, color: P.border,
              }}>
                📋 COPY CODE
              </button>
            </div>
          )}

          <button onClick={resetGame} style={{
            ...btnBase, width: "100%", padding: "10px 0",
            fontSize: 13, background: P.darkBg, color: "#fff",
          }}>
            ↩ PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // BATTLE SCREEN
  // ══════════════════════════════════════════════════════════
  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>

        {/* ── Header bar ────────────────────────────────── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 11, color: P.border, marginBottom: 8, fontWeight: "bold",
        }}>
          <span>⚔️ {topic?.topicName}</span>
          <span style={{ color: level >= HINT_MIN_LEVEL ? "#2d7a27" : P.border }}>
            LV {level}  XP {xp}
          </span>
        </div>

        {/* ── Battle field ──────────────────────────────── */}
        <div style={{ background: P.darkBg, border: `3px solid ${P.border}`, borderRadius: 6, padding: "10px 12px", marginBottom: 8 }}>
          {/* Enemy */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1, paddingRight: 8 }}>
              <div style={{ fontSize: 11, color: P.light, marginBottom: 3, fontWeight: "bold" }}>
                {enemyInfo?.name} (Lv.10)
                {enemyHp < CATCH_HP_THRESHOLD && enemyHp > 0 && (
                  <span style={{ color: "#ff7043", marginLeft: 6 }}>★ CATCHABLE!</span>
                )}
              </div>
              <HpBar hp={enemyHp} maxHp={ENEMY_MAX_HP} label={enemyInfo?.name ?? ""} />
            </div>
            <AlgemonSprite color={enemyInfo!.color} emoji={enemyInfo!.emoji} isEnemy fainted={enemyHp <= 0} />
          </div>

          {/* Player */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <AlgemonSprite color={TYPE_COLOR[chosenType!]} emoji={TYPE_EMOJI[chosenType!]} isEnemy={false} fainted={playerHp <= 0} />
            <div style={{ flex: 1, paddingLeft: 8 }}>
              <div style={{ fontSize: 11, color: P.light, marginBottom: 3, fontWeight: "bold" }}>
                {playerName}'s {chosenType} (Lv.{level})
              </div>
              <HpBar hp={playerHp} maxHp={PLAYER_MAX_HP} label={playerName} />
              <XpBar xp={xp} />
            </div>
          </div>
        </div>

        {/* ── Hint box (shown when HINT clicked) ────────── */}
        {showHint && topic && (
          <div style={{
            background: "#fff9c4", border: `2px solid #f9a825`, color: "#5d4037",
            borderRadius: 4, padding: "7px 10px", fontSize: 11, marginBottom: 7,
            fontWeight: "bold", lineHeight: 1.5,
          }}>
            💡 HINT: {topic.hint}
          </div>
        )}

        {/* ── CATCH MODE: short answer ───────────────────── */}
        {catchMode && catchQuestion ? (
          <div>
            <div style={{
              background: "#fce4ec", border: `3px solid #c62828`,
              borderRadius: 6, padding: "10px 12px", marginBottom: 8,
              fontSize: 12, color: "#4a0000", fontWeight: "bold", lineHeight: 1.6,
              whiteSpace: "pre-line",
            }}>
              {catchQuestion.text}
            </div>
            <input
              type="text"
              value={catchInput}
              onChange={e => setCatchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !catchSubmitted) handleCatchSubmit(); }}
              disabled={catchSubmitted}
              placeholder="Type your answer here…"
              style={{
                width: "100%", boxSizing: "border-box",
                fontFamily: "'Courier New', monospace", fontSize: 13,
                padding: "7px 10px", border: `3px solid ${P.border}`,
                borderRadius: 4, background: P.white, marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCatchSubmit} disabled={catchSubmitted || !catchInput.trim()}
                style={{
                  ...((!catchInput.trim() || catchSubmitted) ? disabledBtn : {
                    ...btnBase, background: "#c62828", color: "#fff",
                  }),
                  flex: 1, padding: "9px 0", fontSize: 13,
                }}>
                ✔ SUBMIT ANSWER
              </button>
              {canHint && (
                <button onClick={() => setShowHint(v => !v)} style={{
                  ...btnBase, padding: "9px 12px", fontSize: 12,
                  background: showHint ? "#fdd835" : P.light, color: P.border,
                }}>
                  💡 HINT
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── MC QUESTION + ACTION BUTTONS ──────────────── */
          mcQuestion && (
            <>
              <div style={{
                background: P.white, border: `3px solid ${P.border}`,
                borderRadius: 5, padding: "9px 12px",
                fontSize: 12, color: P.border, fontWeight: "bold",
                lineHeight: 1.6, marginBottom: 8,
              }}>
                {mcQuestion.text}
              </div>

              {/* A/B/C/D buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 8 }}>
                {mcQuestion.options.map((opt, i) => {
                  const label = ["A", "B", "C", "D"][i];
                  const isCorrect = i === mcQuestion.correct;
                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                      style={{
                        ...btnBase,
                        background: answered ? (isCorrect ? "#a5d6a7" : "#ffcdd2") : P.light,
                        color: P.border, fontSize: 11, textAlign: "left",
                        padding: "7px 9px", lineHeight: 1.4,
                        cursor: answered ? "default" : "pointer",
                        boxShadow: answered ? "none" : `3px 3px 0 ${P.border}`,
                      }}>
                      <b>{label}.</b> {opt}
                    </button>
                  );
                })}
              </div>

              {/* Action row: CATCH + HINT */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCatch} disabled={!canCatch}
                  style={{
                    ...(canCatch ? {
                      ...btnBase, background: "#ff7043", color: "#fff",
                    } : disabledBtn),
                    flex: 1, padding: "8px 0", fontSize: 12,
                  }}>
                  🎯 CATCH {!canCatch && enemyHp >= CATCH_HP_THRESHOLD ? `(HP < ${CATCH_HP_THRESHOLD}%)` : ""}
                </button>
                {canHint && (
                  <button onClick={() => setShowHint(v => !v)} style={{
                    ...btnBase, padding: "8px 12px", fontSize: 12,
                    background: showHint ? "#fdd835" : P.light, color: P.border,
                  }}>
                    💡 HINT
                  </button>
                )}
              </div>
            </>
          )
        )}

        {/* ── Battle Log ────────────────────────────────── */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, color: P.border, fontWeight: "bold", marginBottom: 3 }}>
            ▼ BATTLE LOG
          </div>
          <BattleLog entries={log} />
        </div>

      </div>
    </div>
  );
}
