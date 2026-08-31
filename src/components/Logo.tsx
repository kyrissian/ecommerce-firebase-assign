const Logo: React.FC<{ height?: number }> = ({ height = 56 }) => {
  return (
    <svg
      height={height}
      viewBox="0 0 490 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#f4c95d" strokeWidth="3.5" strokeLinecap="round">
        <line x1="60" y1="14" x2="60" y2="30" />
        <line x1="18" y1="28" x2="28" y2="40" />
        <line x1="102" y1="28" x2="92" y2="40" />
        <line x1="2" y1="62" x2="18" y2="62" />
        <line x1="118" y1="62" x2="102" y2="62" />
      </g>
      <circle cx="60" cy="78" r="30" fill="#f6d98a" />
      <rect x="15" y="78" width="90" height="30" fill="none" />
      <path
        d="M27 62 Q27 34 60 34 Q93 34 93 62 L93 68 L27 68 Z"
        fill="none"
        stroke="#5f4578"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="15" y="62" width="90" height="72" rx="8" fill="#7a5c99" />
      <line
        x1="38"
        y1="62"
        x2="33"
        y2="78"
        stroke="#5f4578"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="82"
        y1="62"
        x2="87"
        y2="78"
        stroke="#5f4578"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="310"
        y="88"
        fontFamily="'Fraunces', serif"
        fontSize="42"
        fontWeight="700"
        fill="#ffffff"
        textAnchor="middle"
      >
        The Daily Haul
      </text>
      <text
        x="310"
        y="112"
        fontFamily="system-ui, sans-serif"
        fontSize="15"
        letterSpacing="5"
        fill="#a8ddd5"
        textAnchor="middle"
      >
        EVERY DAY, SOMETHING NEW
      </text>
    </svg>
  );
};

export default Logo;
