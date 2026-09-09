import React, { useState, useEffect } from 'react';
import { PachaStorage } from '../../services/storage';

interface PachaIconProps {
  className?: string;
  size?: number;
  rounded?: boolean;
}

export const PachaIcon: React.FC<PachaIconProps> = ({ 
  className = '', 
  size = 64,
  rounded = true 
}) => {
  const [customIconUrl, setCustomIconUrl] = useState<string>(
    () => PachaStorage.getSettings().appIconUrl || ''
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    return PachaStorage.subscribe(() => {
      const current = PachaStorage.getSettings().appIconUrl || '';
      setCustomIconUrl(current);
      setImageError(false);
    });
  }, []);

  // If Super Admin uploaded a custom app icon and it loads successfully:
  if (customIconUrl && !imageError) {
    return (
      <img
        src={customIconUrl}
        alt="Ícono PACHA"
        width={size}
        height={size}
        onError={() => setImageError(true)}
        className={`shrink-0 select-none object-cover ${rounded ? 'rounded-2xl shadow-md' : ''} ${className}`}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 1000 1000"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Radial Gradient matching ISOTIPO PACHA-01.jpg */}
        <radialGradient id="pachaIsotypeBg" cx="46%" cy="42%" r="68%">
          <stop offset="0%" stopColor="#0A2552" />
          <stop offset="50%" stopColor="#051838" />
          <stop offset="100%" stopColor="#030E22" />
        </radialGradient>
      </defs>

      {/* App Container Background (supports rounded squircle or full bleed) */}
      <rect 
        width="1000" 
        height="1000" 
        rx={rounded ? 180 : 0} 
        fill="url(#pachaIsotypeBg)" 
      />

      {/* 1. The White "P" Loop */}
      <path
        d="M 325 152
           L 660 152
           C 805 152, 908 245, 908 373.5
           C 908 502, 805 595, 660 595
           L 392 595
           L 470 435
           L 648 435
           C 715 435, 755 398, 755 357.5
           C 755 317, 715 280, 648 280
           L 246 280
           Z"
        fill="#FFFFFF"
      />

      {/* 2. The Golden Yellow Highway Road */}
      <path
        d="M 105 845
           C 135 695, 195 485, 345 408
           C 415 375, 525 374, 646 376
           C 530 381, 435 396, 370 452
           C 308 518, 275 665, 232 845
           Z"
        fill="#FFB81C"
      />

      {/* 3. Highway Centerline Dashes in Deep Navy Blue */}
      <g fill="#051636">
        {/* Dash 1 (Lowest, nearest perspective) */}
        <polygon points="160,798 178,793 198,720 180,725" />
        {/* Dash 2 */}
        <polygon points="198,665 215,660 238,595 221,600" />
        {/* Dash 3 */}
        <polygon points="248,545 264,540 295,483 280,488" />
        {/* Dash 4 */}
        <polygon points="320,448 333,443 378,411 366,416" />
        {/* Dash 5 */}
        <polygon points="410,399 420,396 468,384 459,387" />
        {/* Dash 6 */}
        <polygon points="500,381 508,379 542,377 535,379" />
        {/* Dash 7 (Tip vanishing point) */}
        <polygon points="562,377 568,376 588,376 583,377" />
      </g>
    </svg>
  );
};
