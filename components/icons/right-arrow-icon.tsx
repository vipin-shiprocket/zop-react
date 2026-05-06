interface RightArrowIconProps {
  strokeColor?: string
  className?: string
}

export function RightArrowIcon({
  strokeColor = "#1C1C15",
  className,
}: RightArrowIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 29 15"
      fill="none"
      className={`h-[20px] w-auto md:h-[60px] md:w-[60px] ${className ? ` ${className}` : ""}`}
    >
      <path
        d="M28 7.5H1.5"
        stroke={strokeColor}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 7.5L22 1.5"
        stroke={strokeColor}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 7.5L22 13.5"
        stroke={strokeColor}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
