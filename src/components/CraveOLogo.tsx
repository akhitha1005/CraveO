import React from 'react';

interface CraveOLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  inverted?: boolean;
}

export const CraveOLogo: React.FC<CraveOLogoProps> = ({
  size = 'md',
  showTagline = true,
  inverted = false,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSize = isSm ? 'w-8 h-8' : isLg ? 'w-13 h-13' : 'w-10 h-10';
  const textSize = isSm ? 'text-xl' : isLg ? 'text-3xl sm:text-4xl' : 'text-2xl';
  const taglineSize = isSm ? 'text-[9px]' : isLg ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Creative Crafted Icon Mark */}
      <div className={`relative ${iconSize} shrink-0`}>
        <svg
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Rounded Hexagonal / Squircle Badge */}
          <rect
            width="54"
            height="54"
            rx="16"
            className="fill-gradient-to-br"
            fill="url(#craveo-bg-grad)"
          />

          {/* Steaming aromatic curves */}
          <path
            d="M23 15C21 11.5 25 9 23 6"
            stroke="#FEF08A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M31 16C29 12.5 33 10 31 7"
            stroke="#FEF08A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Cloche Dome */}
          <path
            d="M14 36C14 25.5 20 20 27 20C34 20 40 25.5 40 36H14Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />

          {/* Golden Handle Knob */}
          <circle cx="27" cy="18" r="3.2" fill="#FDE047" />

          {/* Serving Platter Base with Rim */}
          <rect x="11" y="36.5" width="32" height="3.5" rx="1.75" fill="#FEF08A" />

          {/* Subtle Flame / Spice Heart Inset */}
          <path
            d="M27 26C28.2 27.5 29.5 29 29.5 30.5C29.5 32 28.4 33 27 33C25.6 33 24.5 32 24.5 30.5C24.5 29 25.8 27.5 27 26Z"
            fill="#EA580C"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="craveo-bg-grad" x1="0" y1="0" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EA580C" />
              <stop offset="0.5" stopColor="#F97316" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col text-left">
        <div className={`font-black tracking-tight leading-none ${textSize} flex items-center`}>
          <span className={inverted ? 'text-white' : 'text-[#0F172A]'}>Crave</span>
          <span className="relative inline-flex items-center text-orange-500 ml-0.5">
            O
            {/* Small golden spice bindi dot above O */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 ring-1 ring-white" />
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-bold uppercase tracking-wider mt-0.5 ${taglineSize} ${
              inverted ? 'text-orange-300' : 'text-orange-900/60'
            }`}
          >
            Good Food, Delivered Fresh
          </span>
        )}
      </div>
    </div>
  );
};
