import React from "react";

interface RestoreButtonProps {
  backupExists: boolean;
  onRestore: () => void;
}

const RestoreButton: React.FC<RestoreButtonProps> = (
  { backupExists, onRestore },
) => {
  return (
    <div className="mt-6 text-center">
      <button
        className={`inline-flex items-center text-sm font-medium transition-colors duration-200 focus:outline-none ${
          backupExists
            ? "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 underline hover:no-underline"
            : "text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
        }`}
        onClick={onRestore}
        disabled={!backupExists}
        title={backupExists
          ? "デフォルトの着信音に戻します"
          : "着信音が置換されていません"}
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        デフォルトに戻す
      </button>
    </div>
  );
};

export default RestoreButton;
