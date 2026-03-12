import React from 'react';
import MemeLoading, { defaultMemesSet } from '../../src/index';

interface Config {
  minDuration: number;
  boostDuration: number;
  backgroundColor: string;
  safemod: boolean;
  trueFan: boolean;
}

interface MiniPreviewProps {
  config: Config;
  isActive: boolean;
  onPreviewClick?: () => void;
  hasChanges?: boolean;
}

const MiniPreview: React.FC<MiniPreviewProps> = ({
  config,
  isActive,
  onPreviewClick,
  hasChanges = false,
}) => {
  return (
    <div
      className={`mini-preview ${hasChanges ? 'changed' : ''}`}
      onClick={onPreviewClick}
    >
      <div className="mini-preview-inner">
        <MemeLoading
          loadingSignal={isActive}
          minDuration={config.minDuration}
          boostDuration={config.boostDuration}
          backgroundColor={config.backgroundColor}
          safemod={config.safemod}
          trueFan={config.trueFan}
          memes={defaultMemesSet}
        />
      </div>
    </div>
  );
};

export default MiniPreview;