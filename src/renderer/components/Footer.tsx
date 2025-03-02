import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-xs text-gray-500 dark:text-gray-400 text-center py-8 flex flex-col items-center gap-1">
      <a
        className="underline hover:no-underline"
        href="https://x.com/_cofus"
        target="_blank"
        rel="noopener noreferrer"
      >
        比嘉翼｜COFUS
      </a>
      <a
        className="underline hover:no-underline"
        href="https://cofus.work"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://cofus.work
      </a>
    </footer>
  );
};

export default Footer;
