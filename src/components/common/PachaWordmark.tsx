import React, { useState, useEffect } from 'react';
import { PachaStorage } from '../../services/storage';

interface PachaWordmarkProps {
  className?: string;
  height?: number | string;
  width?: number | string;
}

export const PachaWordmark: React.FC<PachaWordmarkProps> = ({
  className = '',
  height,
  width
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(
    () => PachaStorage.getSettings().appLogoUrl || ''
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    return PachaStorage.subscribe(() => {
      const current = PachaStorage.getSettings().appLogoUrl || '';
      setCustomLogoUrl(current);
      setImageError(false);
    });
  }, []);

  const logoSrc = (customLogoUrl && !imageError) ? customLogoUrl : '/pacha-wordmark.svg';

  return (
    <img
      src={logoSrc}
      alt="PACHA"
      width={width}
      height={height}
      onError={() => setImageError(true)}
      className={`select-none object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
