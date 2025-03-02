import React from "react";
import { SUPPORTED_AUDIO_EXTENSIONS_DISPLAY } from "../../contracts/AudioFormats";

const SupportedFormats: React.FC = () => {
  return (
    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
      対応ファイル形式<br />
      {SUPPORTED_AUDIO_EXTENSIONS_DISPLAY}
    </p>
  );
};

export default SupportedFormats;
