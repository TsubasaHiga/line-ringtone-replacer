export interface ElectronAPI {
  replaceRingtone: (filePath: string) => Promise<{success: boolean, message: string}>;
  restoreRingtone: () => Promise<{success: boolean, message: string}>;
  getFilePath: (file: File) => Promise<string>;
  startDrag: (fileName: string) => void;
  handleDroppedFile: (filePath: string) => Promise<{success: boolean, message: string}>;
  checkBackupExists: () => Promise<{exists: boolean}>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 