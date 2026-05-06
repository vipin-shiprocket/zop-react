export function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="24" height="24" rx="12" fill="#1C1C15" />
      <path
        d="M5 16l4.5-4.5 3 3L17 9"
        stroke="url(#tg)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9h3v3"
        stroke="url(#tg)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="tg"
          x1="5"
          y1="9"
          x2="17"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F8F50B" />
          <stop offset="1" stopColor="#6AF49F" />
        </linearGradient>
      </defs>
    </svg>
  )
}
