import { matchTier, tierColor } from "../utils/match";

/**
 * Ring variant — the signature visual of the app. Used for hero / detail
 * views where the match percentage is the single most important number.
 */
export function MatchRing({ percent, size = 96, stroke = 9 }) {
  const tier = matchTier(percent);
  const color = tierColor[tier].ring;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E4E2DA"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono-num font-semibold text-ink" style={{ fontSize: size * 0.22 }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

/** Horizontal bar variant — used inline within compact cards and lists. */
export function MatchBar({ percent, showLabel = true }) {
  const tier = matchTier(percent);
  const color = tierColor[tier];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-muted uppercase tracking-wide">Skill Match</span>
          <span className={`font-mono-num font-semibold ${color.text}`}>{percent}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
        <div
          className={`h-full rounded-full ${color.bar}`}
          style={{ width: `${percent}%`, transition: "width 600ms ease-out" }}
        />
      </div>
    </div>
  );
}
