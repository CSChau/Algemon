import { useState, useEffect, useCallback } from "react";

// ============================================================
// QUESTION BANK
// To add or edit questions, modify the QUESTIONS array below.
// Each question has:
//   - text: the question shown to the player
//   - options: exactly 4 choices labeled A, B, C, D
//   - correct: index (0=A, 1=B, 2=C, 3=D) of the right answer
//   - hint: a short hint shown when the player picks wrong
// ============================================================
const QUESTIONS = [
  {
    text: "Factorise completely: x² + 5x + 6",
    options: ["(x + 1)(x + 6)", "(x + 2)(x + 3)", "(x + 3)(x + 3)", "(x − 2)(x − 3)"],
    correct: 1,
    hint: "Look for two numbers that multiply to 6 and add to 5.",
  },
  {
    text: "Factorise completely: x² − 9",
    options: ["(x − 3)²", "(x + 9)(x − 1)", "(x + 3)(x − 3)", "(x − 9)(x + 1)"],
    correct: 2,
    hint: "Difference of two squares: a² − b² = (a+b)(a−b).",
  },
  {
    text: "Factorise completely: 2x² + 7x + 3",
    options: ["(2x + 1)(x + 3)", "(2x + 3)(x + 1)", "(x + 3)(x + 1)", "(2x − 1)(x + 3)"],
    correct: 0,
    hint: "Try (2x + ?)(x + ?) — check the outer × inner terms sum to 7x.",
  },
  {
    text: "Factorise completely: 3x² − 12",
    options: ["3(x² − 4)", "3(x − 2)(x + 2)", "(3x − 6)(x + 2)", "3(x − 4)"],
    correct: 1,
    hint: "First take out common factor 3, then use difference of two squares.",
  },
  {
    text: "Factorise completely: x² − 6x + 9",
    options: ["(x − 3)(x + 3)", "(x − 9)(x + 1)", "(x − 3)²", "(x + 3)²"],
    correct: 2,
    hint: "Perfect square: (a − b)² = a² − 2ab + b². What is b here?",
  },
];

// ============================================================
// ALGEMON TYPES
// ============================================================
const ALGEMON_TYPES = ["Fire", "Water", "Grass"] as const;
type AlgemonType = typeof ALGEMON_TYPES[number];

const TYPE_COLOR: Record<AlgemonType, string> = {
  Fire:  "#e05c00",
  Water: "#1976d2",
  Grass: "#2d7a27",
};

const TYPE_EMOJI: Record<AlgemonType, string> = {
  Fire:  "🔥",
  Water: "💧",
  Grass: "🌿",
};

// Enemy Algemon is always "Math Specter"
const ENEMY_NAME = "Math Specter";
const PLAYER_MAX_HP = 100;
const ENEMY_MAX_HP = 100;
const HIT_DAMAGE = 25;

// ============================================================
// TYPES
// ============================================================
type Screen = "start" | "battle" | "result";

interface Question {
  text: string;
  options: string[];
  correct: number;
  hint: string;
}

// ============================================================
// UTILITIES
// ============================================================
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hpBarColor(hp: number, max: number): string {
  const pct = hp / max;
  if (pct > 0.5) return "#3dbb3d";
  if (pct > 0.25) return "#e0b800";
  return "#cc2200";
}

// ============================================================
// HP BAR COMPONENT
// ============================================================
function HpBar({ hp, maxHp, label }: { hp: number; maxHp: number; label: string }) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  const color = hpBarColor(hp, maxHp);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 12, fontFamily: "'Courier New', monospace",
        color: "#1a2e1a", marginBottom: 2,
      }}>
        <span>{label}</span>
        <span>{hp}/{maxHp} HP</span>
      </div>
      <div style={{
        width: "100%", height: 14,
        background: "#4a6141",
        borderRadius: 4,
        border: "2px solid #1a2e1a",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color,
          transition: "width 0.4s ease, background 0.4s ease",
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
}

// ============================================================
// ALGEMON SPRITE (CSS-drawn box creature)
// ============================================================
function AlgemonSprite({ type, isEnemy, fainted }: { type: AlgemonType; isEnemy: boolean; fainted: boolean }) {
  const color = isEnemy ? "#5b3b8c" : TYPE_COLOR[type];
  const size = isEnemy ? 100 : 80;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      opacity: fainted ? 0.25 : 1,
      transition: "opacity 0.5s",
      transform: isEnemy ? "none" : "scaleX(-1)",
    }}>
      {/* Body */}
      <div style={{
        width: size, height: size,
        background: color,
        borderRadius: isEnemy ? "50% 50% 40% 40%" : "40% 40% 50% 50%",
        border: "3px solid #1a2e1a",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative",
        boxShadow: fainted ? "none" : `0 0 12px ${color}99`,
      }}>
        {/* Eyes */}
        <div style={{ display: "flex", gap: 12, marginTop: -8 }}>
          <div style={{ width: 10, height: 10, background: "#fff", borderRadius: "50%", border: "2px solid #1a2e1a" }}>
            <div style={{ width: 5, height: 5, background: "#1a2e1a", borderRadius: "50%", margin: "2px auto 0" }} />
          </div>
          <div style={{ width: 10, height: 10, background: "#fff", borderRadius: "50%", border: "2px solid #1a2e1a" }}>
            <div style={{ width: 5, height: 5, background: "#1a2e1a", borderRadius: "50%", margin: "2px auto 0" }} />
          </div>
        </div>
        {/* Type icon */}
        <div style={{ fontSize: 18, marginTop: 2 }}>
          {isEnemy ? "🧮" : TYPE_EMOJI[type]}
        </div>
      </div>
      {/* Shadow */}
      <div style={{
        width: size * 0.7, height: 8,
        background: "rgba(0,0,0,0.3)",
        borderRadius: "50%",
        marginTop: -2,
      }} />
    </div>
  );
}

// ============================================================
// MAIN GAME COMPONENT
// ============================================================
export default function Game() {
  // --- State ---
  const [screen, setScreen] = useState<Screen>("start");
  const [playerName, setPlayerName] = useState("");
  const [chosenType, setChosenType] = useState<AlgemonType | null>(null);

  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp] = useState(ENEMY_MAX_HP);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [answered, setAnswered] = useState(false);
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);

  // --- Pick a new question ---
  const newQuestion = useCallback(() => {
    setCurrentQuestion(pickRandom(QUESTIONS));
    setMessage("");
    setAnswered(false);
  }, []);

  // --- Start battle ---
  const startBattle = () => {
    if (!playerName.trim() || !chosenType) return;
    setPlayerHp(PLAYER_MAX_HP);
    setEnemyHp(ENEMY_MAX_HP);
    setWinner(null);
    setAnswered(false);
    setMessage("A wild Math Specter appeared! Answer the question to attack!");
    setMessageType("info");
    newQuestion();
    setScreen("battle");
  };

  // --- Answer handler ---
  const handleAnswer = (index: number) => {
    if (answered || winner) return;
    setAnswered(true);

    if (index === currentQuestion!.correct) {
      // Correct — enemy loses HP
      const newEnemyHp = Math.max(0, enemyHp - HIT_DAMAGE);
      setEnemyHp(newEnemyHp);
      if (newEnemyHp <= 0) {
        setMessage("Correct! Enemy fainted! You win!");
        setMessageType("success");
        setWinner("player");
        setScreen("result");
      } else {
        setMessage(`Correct! Math Specter takes ${HIT_DAMAGE} damage! Next question incoming…`);
        setMessageType("success");
        setTimeout(() => newQuestion(), 1800);
      }
    } else {
      // Wrong — player loses HP
      const newPlayerHp = Math.max(0, playerHp - HIT_DAMAGE);
      setPlayerHp(newPlayerHp);
      if (newPlayerHp <= 0) {
        setMessage(`Wrong! Hint: ${currentQuestion!.hint} You fainted!`);
        setMessageType("error");
        setWinner("enemy");
        setScreen("result");
      } else {
        setMessage(`Wrong! Hint: ${currentQuestion!.hint} Try the next one!`);
        setMessageType("error");
        setTimeout(() => newQuestion(), 2500);
      }
    }
  };

  // --- Reset ---
  const resetGame = () => {
    setScreen("start");
    setChosenType(null);
    setPlayerName("");
  };

  // ============================================================
  // STYLES (Game Boy Color palette)
  // ============================================================
  const palette = {
    bg:      "#8bac0f",   // GBC green
    darkBg:  "#306230",
    panelBg: "#9bbc0f",
    border:  "#1a2e1a",
    text:    "#1a2e1a",
    light:   "#e0f0c0",
    white:   "#f5f5dc",
  };

  const screenStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: palette.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Courier New', monospace",
    padding: 16,
  };

  const cardStyle: React.CSSProperties = {
    background: palette.panelBg,
    border: `4px solid ${palette.border}`,
    borderRadius: 8,
    padding: 24,
    width: "100%",
    maxWidth: 480,
    boxShadow: `6px 6px 0 ${palette.border}`,
  };

  const titleStyle: React.CSSProperties = {
    textAlign: "center",
    color: palette.border,
    fontWeight: "bold",
    letterSpacing: 1,
  };

  const btnBase: React.CSSProperties = {
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
    cursor: "pointer",
    border: `3px solid ${palette.border}`,
    borderRadius: 4,
    padding: "8px 16px",
    transition: "transform 0.08s, box-shadow 0.08s",
    boxShadow: `3px 3px 0 ${palette.border}`,
  };

  const msgColors = {
    success: { bg: "#c8e6c9", border: "#2e7d32", color: "#1b5e20" },
    error:   { bg: "#ffcdd2", border: "#c62828", color: "#7f0000" },
    info:    { bg: palette.light, border: palette.border, color: palette.border },
  };

  // ============================================================
  // START SCREEN
  // ============================================================
  if (screen === "start") {
    return (
      <div style={screenStyle}>
        <div style={cardStyle}>
          <h1 style={{ ...titleStyle, fontSize: 18, marginBottom: 4 }}>
            ⚔️ ALGEMON MATH BATTLE
          </h1>
          <p style={{ ...titleStyle, fontSize: 11, marginBottom: 20, color: "#3a5a1a" }}>
            WSCSS Prototype — Factorization
          </p>

          {/* Player name input */}
          <label style={{ display: "block", marginBottom: 4, color: palette.border, fontSize: 13 }}>
            TRAINER NAME:
          </label>
          <input
            type="text"
            maxLength={16}
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: "100%", boxSizing: "border-box",
              fontFamily: "'Courier New', monospace",
              fontSize: 14, padding: "6px 10px",
              border: `3px solid ${palette.border}`,
              borderRadius: 4, background: palette.white,
              marginBottom: 20,
            }}
          />

          {/* Starter selection */}
          <p style={{ color: palette.border, fontSize: 13, marginBottom: 8 }}>
            CHOOSE YOUR STARTER:
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {ALGEMON_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setChosenType(type)}
                style={{
                  ...btnBase,
                  flex: 1,
                  background: chosenType === type ? TYPE_COLOR[type] : palette.light,
                  color: chosenType === type ? "#fff" : palette.border,
                  fontSize: 13,
                  outline: chosenType === type ? `3px solid ${palette.border}` : "none",
                  outlineOffset: 2,
                }}
              >
                {TYPE_EMOJI[type]}<br />{type}
              </button>
            ))}
          </div>

          {/* Start button */}
          <button
            onClick={startBattle}
            disabled={!playerName.trim() || !chosenType}
            style={{
              ...btnBase,
              width: "100%",
              fontSize: 15,
              padding: "12px 0",
              background: (!playerName.trim() || !chosenType) ? "#aaa" : palette.darkBg,
              color: "#fff",
              cursor: (!playerName.trim() || !chosenType) ? "not-allowed" : "pointer",
              boxShadow: (!playerName.trim() || !chosenType) ? "none" : `3px 3px 0 ${palette.border}`,
            }}
          >
            ▶ START BATTLE
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RESULT SCREEN
  // ============================================================
  if (screen === "result") {
    const playerWon = winner === "player";
    return (
      <div style={screenStyle}>
        <div style={cardStyle}>
          <h2 style={{
            ...titleStyle, fontSize: 22, marginBottom: 12,
            color: playerWon ? "#2d7a27" : "#c62828",
          }}>
            {playerWon ? "🏆 YOU WIN!" : "😵 YOU FAINTED!"}
          </h2>
          <p style={{ textAlign: "center", color: palette.border, marginBottom: 16, fontSize: 14 }}>
            {playerWon
              ? `Well done, ${playerName}! Math Specter has been defeated!`
              : `Don't give up, ${playerName}! Study those factorization rules!`}
          </p>

          {/* Mini sprite scene */}
          <div style={{
            display: "flex", justifyContent: "space-around",
            alignItems: "flex-end", marginBottom: 20,
          }}>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite type={chosenType!} isEnemy={false} fainted={!playerWon} />
              <div style={{ fontSize: 11, color: palette.border, marginTop: 4 }}>
                {playerName} ({chosenType})
              </div>
            </div>
            <div style={{ fontSize: 28, color: palette.border, paddingBottom: 20 }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <AlgemonSprite type="Fire" isEnemy fainted={playerWon} />
              <div style={{ fontSize: 11, color: palette.border, marginTop: 4 }}>
                {ENEMY_NAME}
              </div>
            </div>
          </div>

          <button
            onClick={resetGame}
            style={{
              ...btnBase, width: "100%", fontSize: 14,
              padding: "10px 0",
              background: palette.darkBg, color: "#fff",
            }}
          >
            ↩ PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // BATTLE SCREEN
  // ============================================================
  const msgStyle = msgColors[messageType];

  return (
    <div style={screenStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", fontSize: 12, color: palette.border, marginBottom: 8 }}>
          ⚔️ ALGEMON MATH BATTLE — {playerName} vs {ENEMY_NAME}
        </div>

        {/* ── Battle field ── */}
        <div style={{
          background: palette.darkBg,
          border: `3px solid ${palette.border}`,
          borderRadius: 6, padding: 12, marginBottom: 10,
        }}>
          {/* Enemy row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, paddingRight: 8 }}>
              <div style={{ fontSize: 12, color: palette.light, marginBottom: 4, fontWeight: "bold" }}>
                {ENEMY_NAME} (Lv.10)
              </div>
              <HpBar hp={enemyHp} maxHp={ENEMY_MAX_HP} label={ENEMY_NAME} />
            </div>
            <AlgemonSprite type="Fire" isEnemy fainted={enemyHp <= 0} />
          </div>

          <div style={{ height: 12 }} />

          {/* Player row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <AlgemonSprite type={chosenType!} isEnemy={false} fainted={playerHp <= 0} />
            <div style={{ flex: 1, paddingLeft: 8 }}>
              <div style={{ fontSize: 12, color: palette.light, marginBottom: 4, fontWeight: "bold" }}>
                {playerName}'s {chosenType} (Lv.5)
              </div>
              <HpBar hp={playerHp} maxHp={PLAYER_MAX_HP} label={playerName} />
            </div>
          </div>
        </div>

        {/* ── Message box ── */}
        {message && (
          <div style={{
            background: msgStyle.bg,
            border: `2px solid ${msgStyle.border}`,
            color: msgStyle.color,
            borderRadius: 4, padding: "8px 12px",
            fontSize: 12, marginBottom: 10,
            fontWeight: "bold",
            minHeight: 36,
          }}>
            {message}
          </div>
        )}

        {/* ── Question ── */}
        {currentQuestion && !winner && (
          <>
            <div style={{
              background: palette.white,
              border: `3px solid ${palette.border}`,
              borderRadius: 6, padding: "10px 14px",
              marginBottom: 10, fontSize: 13,
              color: palette.border, fontWeight: "bold",
              lineHeight: 1.5,
            }}>
              {currentQuestion.text}
            </div>

            {/* Answer buttons */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}>
              {currentQuestion.options.map((opt, i) => {
                const label = ["A", "B", "C", "D"][i];
                const isCorrect = i === currentQuestion.correct;
                const btnBg = answered
                  ? (isCorrect ? "#a5d6a7" : "#ffcdd2")
                  : palette.light;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    style={{
                      ...btnBase,
                      background: btnBg,
                      color: palette.border,
                      fontSize: 12,
                      textAlign: "left",
                      cursor: answered ? "default" : "pointer",
                      boxShadow: answered ? "none" : `3px 3px 0 ${palette.border}`,
                      padding: "8px 10px",
                      transition: "background 0.2s",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>{label}.</span> {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
