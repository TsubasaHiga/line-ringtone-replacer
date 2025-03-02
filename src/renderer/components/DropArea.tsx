import React, { useState, useRef } from 'react';
import { SUPPORTED_AUDIO_EXTENSIONS_WITH_DOT } from '../../contracts/AudioFormats';

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
  const handleDrag = (e: React.DragEvent<HTMLDivElement>, isDragging: boolean) => {
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
      if (file.type.startsWith('audio/')) {
        setIsProcessing(true);
        
        try {
          // ドロップハンドラーが提供されている場合はそれを使用、なければ通常の選択処理
          if (onFileDrop) {
            await onFileDrop(file);
          } else {
            onFileSelect(file);
          }
        } catch (error) {
          console.error('ファイル処理エラー:', error);
        } finally {
          setIsProcessing(false);
        }
      } else {
        alert('音声ファイルをドロップしてください');
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={SUPPORTED_AUDIO_EXTENSIONS_WITH_DOT.join(',')}
        style={{ display: 'none' }}
      />
      <div 
        className={`w-full h-48 border-2 border-dashed rounded-app cursor-pointer transition-colors duration-300 flex items-center justify-center ${
          isDragging 
            ? 'border-line-green dark:border-line-green bg-green-50 dark:bg-opacity-10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-line-green dark:hover:border-line-green bg-gray-50 dark:bg-gray-700'
        }`}
        onClick={openFileDialog}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
        data-testid="drop-area"
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none">
          <svg 
            className={`w-12 h-12 mb-4 text-line-green ${isProcessing ? 'animate-pulse' : ''}`}
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 16H15V10H19L12 3L5 10H9V16ZM12 5.83L14.17 8H13V14H11V8H9.83L12 5.83ZM5 18H19V20H5V18Z" fill="currentColor"/>
          </svg>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {isProcessing 
              ? 'ファイルを処理中...' 
              : isDragging 
                ? 'ファイルをドロップしてください' 
                : (<>クリックまたはドラッグ＆ドロップ<br/>で音声ファイルを選択</>)}
          </p>
        </div>
      </div>
    </>
  );
};

export default DropArea; 