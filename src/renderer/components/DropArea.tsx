import React, { useRef, useState } from "react";
import { SUPPORTED_AUDIO_EXTENSIONS_WITH_DOT } from "../../contracts/AudioFormats";
import { Upload } from "@deemlol/next-icons";
import SupportedFormats from "./SupportedFormats";

interface DropAreaProps {
  onFileSelect: (file: File) => void;
  onFileDrop?: (file: File) => Promise<void>;
}

const DropArea: React.FC<DropAreaProps> = ({ onFileSelect, onFileDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択ダイアログを開く
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // ファイル選択時のハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  // ドラッグイベントのハンドラー
  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>,
    isDragging: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isDragging);
  };

  // ドロップイベントのハンドラー
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // ドロップされたファイルを取得
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // 音声ファイルかどうかチェック
      if (file.type.startsWith("audio/")) {
        setIsProcessing(true);

        try {
          // ドロップハンドラーが提供されている場合はそれを使用、なければ通常の選択処理
          if (onFileDrop) {
            await onFileDrop(file);
          } else {
            onFileSelect(file);
          }
        } catch (error) {
          console.error("ファイル処理エラー:", error);
        } finally {
          setIsProcessing(false);
        }
      } else {
        alert("音声ファイルをドロップしてください");
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={SUPPORTED_AUDIO_EXTENSIONS_WITH_DOT.join(",")}
        style={{ display: "none" }}
      />
      <div
        className={`border-1 border-dashed rounded-app cursor-pointer transition-colors duration-300 p-3 h-58
        ${
          isDragging
            ? "border-line-green dark:border-line-green"
            : "border-gray-300 dark:border-gray-600 hover:border-line-green dark:hover:border-line-green"
        }
        `}
      >
        <div
          className={`w-full h-full flex flex-col items-center justify-center gap-4 select-none rounded-md
            ${
            isDragging
              ? "bg-green-50 dark:bg-opacity-10"
              : "hover:border-line-green dark:hover:border-line-green bg-gray-50 dark:bg-gray-700"
          }`}
          onClick={openFileDialog}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
          data-testid="drop-area"
        >
          <div className="flex flex-col items-center justify-center">
            <Upload
              size={24}
              className={`w-12 h-12 mb-4 text-line-green ${
                isProcessing ? "animate-pulse" : ""
              }`}
            />
            <p className="text-gray-600 dark:text-gray-300 text-center">
              {isProcessing ? "ファイルを処理中..." : (
                <>
                  クリックまたはドラッグ＆ドロップ<br />で音声ファイルを選択
                </>
              )}
            </p>
          </div>
          <SupportedFormats />
        </div>
      </div>
    </>
  );
};

export default DropArea;
