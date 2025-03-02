import { contextBridge, ipcRenderer,webUtils } from 'electron';

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electronAPI', {
  // 着信音置換
  replaceRingtone: (filePath: string) => ipcRenderer.invoke('replace-ringtone', filePath),
  restoreRingtone: () => ipcRenderer.invoke('restore-ringtone'),
  
  // ファイル選択
  getFilePath: (file: File) => webUtils.getPathForFile(file),

  // ファイルドラッグアンドドロップ
  startDrag: (fileName: string) => ipcRenderer.send('ondragstart', fileName),

  // ドロップされたファイルを処理
  handleDroppedFile: (filePath: string) => 
    ipcRenderer.invoke('handle-dropped-file', { path: filePath }),
    
  // バックアップファイルの存在確認
  checkBackupExists: () => ipcRenderer.invoke('check-backup-exists'),
  
  // アプリケーション情報の取得
  getAppInfo: () => ipcRenderer.invoke('get-app-info')
}); 