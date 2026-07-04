const iconKeyForGame = (name = "") => {
  const normalized = name.toLowerCase();

  if (normalized.includes("badminton")) return "badminton";
  if (normalized.includes("chess")) return "chess";
  if (normalized.includes("carrom")) return "carrom";
  if (normalized.includes("table") || normalized.includes("tennis")) return "tableTennis";

  return "default";
};

const iconPaths = {
  badminton: (
    <>
      <path d="M10 7l12 12" />
      <path d="M22 19l-5 5" />
      <path d="M19 16l-5 5" />
      <path d="M16 13l-5 5" />
      <path d="M10 7l2-4 4 2" />
      <path d="M8 26c4-1 7-3 9-6" />
    </>
  ),
  chess: (
    <>
      <path d="M10 26h12" />
      <path d="M12 22h8" />
      <path d="M14 11h4l1 11h-6z" />
      <path d="M12 11l2-5 2 5 2-5 2 5" />
    </>
  ),
  carrom: (
    <>
      <rect x="6" y="6" width="20" height="20" rx="3" />
      <circle cx="10" cy="10" r="2" />
      <circle cx="22" cy="10" r="2" />
      <circle cx="10" cy="22" r="2" />
      <circle cx="22" cy="22" r="2" />
      <circle cx="16" cy="16" r="3" />
    </>
  ),
  tableTennis: (
    <>
      <circle cx="12" cy="13" r="6" />
      <path d="M16 17l7 7" />
      <circle cx="23" cy="8" r="2" />
    </>
  ),
  default: (
    <>
      <circle cx="16" cy="16" r="10" />
      <circle cx="16" cy="16" r="4" />
      <path d="M16 6v4" />
      <path d="M16 22v4" />
      <path d="M6 16h4" />
      <path d="M22 16h4" />
    </>
  ),
};

const GameIcon = ({ name }) => {
  const iconKey = iconKeyForGame(name);

  return (
    <span className="game-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        {iconPaths[iconKey]}
      </svg>
    </span>
  );
};

export default GameIcon;
