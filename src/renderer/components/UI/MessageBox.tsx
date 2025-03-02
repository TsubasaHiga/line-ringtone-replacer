import { Info } from "@deemlol/next-icons";

const MessageBox = ({ message }: { message: string }) => {
  return (
    <div className="grid grid-cols-[16px_1fr] gap-2 border-1 border-gray-300 rounded-md px-3 py-2 text-gray-500 dark:text-gray-400">
      <Info size="100%" />
      <small className="text-[11px]">{message}</small>
    </div>
  );
};

export default MessageBox;
