import React, { useState, useCallback, useEffect } from 'react';
import DropArea from './DropArea';
import { SUPPORTED_AUDIO_EXTENSIONS_DISPLAY } from '../../contracts/AudioFormats';

const App: React.FC = () => {
  // ステータスメッセージ管理
  const [status, setStatus] = useState<{
    message: string;
    type: '' | 'success' | 'error';
  }>({ message: '', type: '' });
  
  // バックアップファイルの存在フラグ
  const [backupExists, setBackupExists] = useState(false);
  
  // バックアップの存在を確認する関数
  const checkBackupExists = useCallback(async () => {
    try {
      const result = await window.electronAPI.checkBackupExists();
      setBackupExists(result.exists);
    } catch (error) {
      console.error('バックアップ確認エラー:', error);
      setBackupExists(false);
    }
  }, []);
  
  // 初回ロード時とステータス変更時にバックアップの存在を確認
  useEffect(() => {
    checkBackupExists();
  }, [checkBackupExists, status]);

  // ファイル処理の共通関数
  const processAudioFile = useCallback(async (file: File) => {
    try {
      // 処理中状態に設定
      setStatus({ message: '処理中...', type: '' });
      
      // ファイルパスを取得
      const filePath = await window.electronAPI.getFilePath(file);
      
      // ファイルパス取得に失敗した場合
      if (!filePath || typeof filePath !== 'string') {
        setStatus({
          message: 'ファイルが選択されませんでした',
          type: 'error'
        });
        return;
      }
      
      // 着信音置換を実行
      const replaceResult = await window.electronAPI.replaceRingtone(filePath);
      
      // 結果に応じてステータスを設定
      setStatus({ 
        message: replaceResult.message, 
        type: replaceResult.success ? 'success' : 'error' 
      });
      
      // 置換後にバックアップの存在を再確認
      await checkBackupExists();
    } catch (error: any) {
      console.error('ファイル処理エラー:', error);
      setStatus({
        message: `エラーが発生しました: ${error.message || '不明なエラー'}`,
        type: 'error'
      });
    }
  }, [checkBackupExists]);

  // デフォルトの着信音に復元
  const handleRestore = async () => {
    try {
      setStatus({ message: '復元中...', type: '' });
      
      const result = await window.electronAPI.restoreRingtone();
      
      setStatus({ 
        message: result.message, 
        type: result.success ? 'success' : 'error' 
      });
      
      // 復元後にバックアップの存在を再確認
      await checkBackupExists();
    } catch (error: any) {
      setStatus({
        message: `エラーが発生しました: ${error.message || '不明なエラー'}`,
        type: 'error'
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800 shadow-app">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 max-w-md mx-auto w-full">
        {/* LINEロゴ */}
        <div className="mb-6">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-line-green">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM10 16.5L16 12L10 7.5V16.5Z" fill="currentColor"/>
          </svg>
        </div>
        
        {/* タイトルと説明 */}
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">LINE着信音置換ツール</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          クリックして音声ファイルを選択するだけで、<br/>
          LINEの着信音を簡単に変更できます
        </p>
        
        {/* 対応ファイル形式 */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
          対応ファイル形式: {SUPPORTED_AUDIO_EXTENSIONS_DISPLAY}
        </p>
        
        {/* ドロップエリア */}
        <DropArea 
          onFileSelect={processAudioFile} 
          onFileDrop={processAudioFile}
        />
        
        {/* ステータスメッセージ */}
        {status.message && (
          <div 
            className={`w-full mt-4 px-4 py-3 rounded-md shadow-sm flex items-center transition-all duration-300 break-all ${
              status.type === 'success' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : status.type === 'error' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}
            role="alert"
          >
            {status.type === 'success' && (
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            )}
            {status.type === 'error' && (
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            )}
            {!status.type && (
              <svg className="w-5 h-5 mr-2 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            )}
            <span className="font-medium">{status.message}</span>
          </div>
        )}
        
        {/* デフォルトに戻すボタン */}
        <div className="mt-6">
          <button 
            className={`px-5 py-2 rounded-app transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-line-green ${
              backupExists
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            onClick={handleRestore}
            disabled={!backupExists}
            title={backupExists ? 'デフォルトの着信音に戻します' : '着信音が置換されていません'}
          >
            デフォルトに戻す
          </button>
        </div>
      </div>
      <footer className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">HigaTsubasa - COFUS</footer>
    </div>
  );
};

export default App; 