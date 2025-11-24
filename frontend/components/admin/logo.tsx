export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="420" 
      height="96" 
      viewBox="0 0 420 96"
      className={className}
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="#FFAACF"/>
          <stop offset="100%" stopColor="#D59BF6"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="16" fill="none"/>
      <text 
        x="50%" 
        y="58%" 
        dominantBaseline="middle" 
        textAnchor="middle"
        fontFamily="Jost, sans-serif" 
        fontWeight="600" 
        fontSize="36"
        fill="url(#g)" 
        letterSpacing=".5"
      >
        Memshaheb
      </text>
      <text 
        x="50%" 
        y="82%" 
        dominantBaseline="middle" 
        textAnchor="middle"
        fontFamily="Parkinsans, sans-serif" 
        fontSize="14" 
        fill="#BCA7D9" 
        opacity=".9"
      >
        Author · Painter · Philosopher
      </text>
    </svg>
  );
}
