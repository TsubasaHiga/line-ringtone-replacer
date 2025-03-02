import { useState, useCallback, useEffect } from 'react';

interface StatusMessage {
  message: string;
  type: '' | 'success' | 'error';
}

export function useAudioProcessor() {
  // ステータスメッセージ管理
  const [status, setStatus] = useState<StatusMessage>({ message: '', type: '' });
  
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

  return {
    status,
    backupExists,
    processAudioFile,
    handleRestore
  };
} 