export function GalleryDiscountBadge({ percentage }: { percentage: number }) {
  if (!percentage || percentage <= 0) return null

  return (
    <div className="absolute top-[-10px] -left-4 z-[2] hidden md:block">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="75"
        height="68"
        viewBox="0 0 75 68"
        fill="none"
      >
        <path
          d="M0.967285 6.35081V65.0915C0.967285 65.9955 1.92852 66.5522 2.67296 66.0759L10.1174 61.334C10.6462 60.9969 11.2552 60.8183 11.8762 60.8183C12.4973 60.8183 13.1062 60.9969 13.6351 61.334L21.0243 66.042C21.5532 66.3792 22.1621 66.5577 22.7832 66.5577C23.4043 66.5577 24.0132 66.3792 24.542 66.042L31.9312 61.3361C32.4602 60.9992 33.069 60.8208 33.6901 60.8208C34.3111 60.8208 34.92 60.9992 35.4489 61.3361L42.8382 66.042C43.367 66.3792 43.9759 66.5577 44.597 66.5577C45.2181 66.5577 45.827 66.3792 46.3559 66.042L53.7471 61.3361C54.276 60.999 54.8849 60.8205 55.506 60.8205C56.1271 60.8205 56.736 60.999 57.2648 61.3361L64.7093 66.078C64.8788 66.1857 65.0729 66.2446 65.2717 66.2487C65.4705 66.2528 65.6668 66.202 65.8404 66.1015C66.0139 66.001 66.1584 65.8545 66.2591 65.677C66.3597 65.4994 66.4128 65.2974 66.4129 65.0915V0H7.10281C5.47557 0 3.91497 0.669101 2.76434 1.86011C1.6137 3.05112 0.967285 4.66647 0.967285 6.35081Z"
          fill="#77DC9E"
        />
        <g fill="#1C1C15">
          <text
            x="33"
            y="26"
            fontSize="18"
            fontWeight="700"
            textAnchor="middle"
          >
            {percentage}%
          </text>
          <text
            x="42"
            y="48"
            fontSize="14"
            fontWeight="400"
            textAnchor="middle"
          >
            off
          </text>
        </g>
        <path
          d="M74.875 10.8871L66.4072 0V10.8871H74.875Z"
          fill="url(#paint0_gallery_badge)"
        />
        <defs>
          <linearGradient
            id="paint0_gallery_badge"
            x1="70.6411"
            y1="0"
            x2="70.6411"
            y2="10.8871"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#42A869" />
            <stop offset="1" stopColor="#1A4229" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
