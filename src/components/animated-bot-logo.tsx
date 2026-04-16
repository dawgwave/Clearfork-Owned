"use client";

export function AnimatedBotLogo() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes blink {
          0%, 90%, 100% {
            cy: 85;
            r: 12;
          }
          95% {
            cy: 85;
            r: 5;
          }
        }

        @keyframes smile {
          0%, 100% {
            d: path("M 120 150 Q 150 180 180 150");
          }
          50% {
            d: path("M 120 150 Q 150 190 180 150");
          }
        }

        .bot-container {
          animation: float 2.5s ease-in-out infinite;
        }

        .bot-eye-left {
          animation: blink 4s ease-in-out infinite;
        }

        .bot-eye-right {
          animation: blink 4s ease-in-out 0.2s infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 300 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="bot-container"
        width="32"
        height="32"
      >
        {/* Antenna */}
        <line
          x1="150"
          y1="20"
          x2="150"
          y2="50"
          stroke="black"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <circle cx="150" cy="20" r="18" fill="black" />
        <circle cx="150" cy="20" r="12" fill="white" />

        {/* Left ear */}
        <ellipse
          cx="40"
          cy="120"
          rx="24"
          ry="50"
          fill="none"
          stroke="black"
          strokeWidth="16"
        />

        {/* Right ear */}
        <ellipse
          cx="260"
          cy="120"
          rx="24"
          ry="50"
          fill="none"
          stroke="black"
          strokeWidth="16"
        />

        {/* Main head - rounded rectangle */}
        <path
          d="M 80 60 L 220 60 Q 250 60 250 90 L 250 240 Q 250 270 220 270 L 80 270 Q 50 270 50 240 L 50 90 Q 50 60 80 60 Z"
          fill="white"
          stroke="black"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Left eye */}
        <circle cx="115" cy="130" r="22" fill="#20B2AA" />
        <circle cx="115" cy="130" r="12" fill="white" />
        <circle cx="120" cy="125" r="6" fill="#20B2AA" opacity="0.7" />

        {/* Right eye */}
        <circle cx="185" cy="130" r="22" fill="#20B2AA" />
        <circle cx="185" cy="130" r="12" fill="white" />
        <circle cx="190" cy="125" r="6" fill="#20B2AA" opacity="0.7" />

        {/* Smile */}
        <path
          d="M 115 170 Q 150 200 185 170"
          stroke="#20B2AA"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />

        {/* Speaker/audio at bottom */}
        <rect x="125" y="285" width="50" height="20" rx="10" fill="#20B2AA" />
        <circle cx="135" cy="295" r="3" fill="white" opacity="0.8" />
        <circle cx="150" cy="295" r="3" fill="white" opacity="0.9" />
        <circle cx="165" cy="295" r="3" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}
