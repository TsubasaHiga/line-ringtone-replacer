import React from "react";

interface StatusMessageProps {
  message: string;
  type: "" | "success" | "error";
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message, type }) => {
  if (!message) return null;

  return (
    <div
      className={`w-full mt-2 px-4 py-3 rounded-md flex items-center transition-all duration-300 break-all ${
        type === "success"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : type === "error"
          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      }`}
      role="alert"
    >
      {type === "success" && (
        <svg
          className="w-5 h-5 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          >
          </path>
        </svg>
      )}
      {type === "error" && (
        <svg
          className="w-5 h-5 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          >
          </path>
        </svg>
      )}
      {!type && (
        <svg
          className="w-5 h-5 mr-2 flex-shrink-0 animate-spin"
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
          >
          </path>
        </svg>
      )}
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default StatusMessage;
