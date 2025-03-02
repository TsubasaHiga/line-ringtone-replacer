import React from "react";
import DropArea from "./DropArea";
import Header from "./Header";
import StatusMessage from "./StatusMessage";
import RestoreButton from "./RestoreButton";
import Footer from "./Footer";
import { useAudioProcessor } from "../hooks/useAudioProcessor";
// import MessageBox from "./UI/MessageBox";

const App: React.FC = () => {
  const { status, backupExists, processAudioFile, handleRestore } =
    useAudioProcessor();

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-md mx-auto w-full">
        <Header />
        <div className="flex flex-col gap-3 w-full">
          <DropArea
            onFileSelect={processAudioFile}
            onFileDrop={processAudioFile}
          />
          {/* <MessageBox message="LINEアプリを再起動した時、または再起動後の初着信時にデフォルトの着信音に戻る事があります。" /> */}
        </div>
        <StatusMessage
          message={status.message}
          type={status.type}
        />
        <RestoreButton
          backupExists={backupExists}
          onRestore={handleRestore}
        />
      </div>
      <Footer />
    </div>
  );
};

export default App;
