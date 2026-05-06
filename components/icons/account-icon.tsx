export function AccountIcon({
  stroke = "currentColor",
  className,
}: {
  stroke?: string
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 10.5C14.2091 10.5 16 8.70914 16 6.5C16 4.29086 14.2091 2.5 12 2.5C9.79086 2.5 8 4.29086 8 6.5C8 8.70914 9.79086 10.5 12 10.5Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 20.5C19 16.634 15.866 13.5 12 13.5C8.13402 13.5 5 16.634 5 20.5"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
