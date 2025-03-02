import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { convertToWav, isAudioFile } from '../utils/audioConverter';
import { SUPPORTED_AUDIO_EXTENSIONS } from '../contracts/AudioFormats';
import * as sudoPrompt from 'sudo-prompt';

// アプリケーションのバージョン情報を取得
const APP_VERSION = app.getVersion();
console.log('アプリケーションバージョン:', APP_VERSION);

// DPIスケーリングの問題を解決するために高DPI動作を設定
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', '1');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

// パスの設定
const DIST_PATH = path.join(__dirname, '../..');
const PUBLIC_PATH = app.isPackaged 
  ? path.join(DIST_PATH) 
  : path.join(DIST_PATH, '../public');

// ウィンドウの参照
let mainWindow: BrowserWindow | null = null;

// 開発者モード判定
const isDev = !app.isPackaged;

// 着信音のファイル名
const ringtoneFileName = 'VoipRing.wav';

// アプリ名（sudo-promptのメッセージで使用 - 英数字のみに制限）
const APP_NAME = 'LINE Ringtone Replacer';
// 日本語表示用アプリ名
const APP_NAME_JP = 'LINE着信音置換くん';

// バックアップ存在確認のキャッシュ
let backupExistsCache: { exists: boolean; timestamp: number } | null = null;
// キャッシュの有効期間（ミリ秒）- 30秒
const CACHE_TTL = 30 * 1000;

// アイコンパスを取得する関数
function getIconPath() {
  const iconFilename = 'icon.png';
  const possiblePaths = [
    path.join(PUBLIC_PATH, iconFilename),
    path.join(app.getAppPath(), 'public', iconFilename),
    path.join(process.resourcesPath, 'public', iconFilename),
    path.join(__dirname, '../../public', iconFilename),
    path.join(process.cwd(), 'public', iconFilename)
  ];

  for (const iconPath of possiblePaths) {
    if (fs.existsSync(iconPath)) {
      console.log('アイコンファイルを見つけました:', iconPath);
      return iconPath;
    }
  }

  console.log('アイコンファイルが見つかりません。デフォルトを使用します。');
  return null;
}

const createWindow = () => {
  // プリロードスクリプトの正しいパスを見つける
  let preloadPath = path.join(__dirname, '../preload/index.js');
  console.log('デフォルトのプリロードパス:', preloadPath);
  
  // ファイルが存在するか確認
  if (!fs.existsSync(preloadPath)) {
    console.log('デフォルトのプリロードパスが見つかりません、代替を探します');
    
    // 代替パスを試す
    const altPaths = [
      path.join(app.getAppPath(), 'dist-electron/preload/index.js'),
      path.join(DIST_PATH, 'preload/index.js'),
      path.join(__dirname, '../../dist-electron/preload/index.js')
    ];
    
    for (const altPath of altPaths) {
      console.log('代替プリロードパスを確認:', altPath);
      if (fs.existsSync(altPath)) {
        preloadPath = altPath;
        console.log('有効なプリロードパスを見つけました:', preloadPath);
        break;
      }
    }
  }

  mainWindow = new BrowserWindow({
    title: `${APP_NAME_JP} v${APP_VERSION}`,
    width: 500,
    height: 780,
    minWidth: 500,
    minHeight: 700,
    icon: getIconPath() || undefined,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  // ウィンドウ読み込み完了後にタイトルを再設定
  mainWindow.webContents.on('did-finish-load', () => {
    if (mainWindow) {
      console.log('ウィンドウ読み込み完了、タイトルを再設定します');
      mainWindow.setTitle(`${APP_NAME_JP} v${APP_VERSION}`);
      console.log('実際のタイトル (再設定後):', mainWindow.getTitle());
    }
  });

  // デバッグ情報を表示
  console.log('アプリのパス情報:');
  console.log('app.getAppPath():', app.getAppPath());
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
  console.log('app.getPath(exe):', app.getPath('exe'));
  console.log('app.getPath(userData):', app.getPath('userData'));
  console.log('app.getPath(appData):', app.getPath('appData'));
  
  // 開発環境ではローカルサーバーから読み込む
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({
      mode: 'detach',
    });
  } else {
    // 本番環境では、index.htmlファイルを探して読み込む
    // パッケージング後のindex.htmlの検索順序を定義
    const htmlPaths = [
      // 1. アプリケーションのリソースディレクトリ内のdist/index.html
      path.join(app.getAppPath(), 'dist', 'index.html'),
      
      // 2. Resourcesディレクトリ内のdist/index.html
      path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
      
      // 3. 実行ファイルの相対パス
      path.join(app.getPath('exe'), '..', '..', 'Resources', 'app', 'dist', 'index.html'),
      
      // 4. dist-electronの親ディレクトリ内のdist/index.html
      path.join(__dirname, '../../dist', 'index.html'),
      
      // 5. カレントディレクトリ内のdist/index.html
      path.join(process.cwd(), 'dist', 'index.html'),
    ];
    
    // 各パスを試行してindex.htmlを探す
    let indexHtmlPath = null;
    for (const htmlPath of htmlPaths) {
      console.log(`index.htmlの検索: ${htmlPath} - ${fs.existsSync(htmlPath) ? '存在します' : '存在しません'}`);
      if (fs.existsSync(htmlPath)) {
        indexHtmlPath = htmlPath;
        break;
      }
    }
    
    if (indexHtmlPath) {
      console.log('index.htmlを読み込みます:', indexHtmlPath);
      mainWindow.loadFile(indexHtmlPath);
    } else {
      console.error('index.htmlが見つかりませんでした。');
      mainWindow.loadURL(`data:text/html,<html><body><h1>エラー</h1><p>index.htmlファイルが見つかりませんでした。</p></body></html>`);
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  // preloadスクリプトへのパスを動的に検索
  const getPreloadPath = () => {
    const possiblePreloadPaths = [
      path.join(__dirname, '../preload/index.js'),
      path.join(__dirname, '../../preload/index.js'),
      path.join(app.getAppPath(), 'dist-electron/preload/index.js'),
      path.join(process.resourcesPath, 'dist-electron/preload/index.js'),
      path.join(process.resourcesPath, 'app/dist-electron/preload/index.js'),
      path.join(app.getPath('exe'), '..', '..', 'Resources', 'app', 'dist-electron', 'preload', 'index.js'),
      path.join(app.getPath('exe'), '..', '..', 'Resources', 'dist-electron', 'preload', 'index.js')
    ];
    
    console.log('プリロードスクリプトの検索:');
    for (const p of possiblePreloadPaths) {
      const exists = fs.existsSync(p);
      console.log(`- ${p}: ${exists ? '存在します' : '存在しません'}`);
      if (exists) {
        return p;
      }
    }
    
    console.error('プリロードスクリプトが見つかりませんでした。デフォルトパスを使用します。');
    return path.join(__dirname, '../preload/index.js');
  };
  
  const preloadPath = getPreloadPath();
  console.log('使用するプリロードスクリプトのパス:', preloadPath);
  
  // アプリケーションディレクトリ構造をデバッグログに出力
  console.log('============ ディレクトリ構造デバッグ ============');
  
  // 重要なディレクトリパスのリスト
  const dirsToCheck = [
    { name: 'app.getAppPath()', path: app.getAppPath() },
    { name: '__dirname', path: __dirname },
    { name: 'process.resourcesPath', path: process.resourcesPath },
    { name: 'app.getPath(exe) 親ディレクトリ', path: path.dirname(app.getPath('exe')) }
  ];
  
  // 各ディレクトリの内容を確認
  dirsToCheck.forEach(dir => {
    console.log(`\n【${dir.name}】: ${dir.path}`);
    try {
      if (fs.existsSync(dir.path)) {
        const files = fs.readdirSync(dir.path);
        console.log('内容:', files.join(', '));
        
        // distディレクトリが存在するか確認
        const distPath = path.join(dir.path, 'dist');
        if (fs.existsSync(distPath)) {
          console.log('distディレクトリが存在します');
          try {
            const distFiles = fs.readdirSync(distPath);
            console.log('distの内容:', distFiles.join(', '));
            
            // index.htmlが存在するか確認
            const indexPath = path.join(distPath, 'index.html');
            console.log(`index.html存在チェック: ${fs.existsSync(indexPath) ? '存在します' : '存在しません'}`);
          } catch (err) {
            console.error('distディレクトリの読み取りエラー:', err);
          }
        } else {
          console.log('distディレクトリが存在しません');
        }
      } else {
        console.log('ディレクトリが存在しません');
      }
    } catch (err) {
      console.error('ディレクトリ確認エラー:', err);
    }
  });
  
  console.log('============ ディレクトリ構造デバッグ終了 ============');
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// LINEの着信音ファイルを置換する
ipcMain.handle('replace-ringtone', async (_, filePath: string) => {
  return await replaceRingtone(filePath);
});

// バックアップから復元する
ipcMain.handle('restore-ringtone', async () => {
  try {
    // キャッシュを無効化
    invalidateCacheAfterOperation();
    
    // 開発環境でテスト用ディレクトリを使用するかどうかのフラグを取得
    const useTestDirInDev = getUseTestDirInDevFlag();
    
    const lineDataPath = getLineDataPath();
    if (!lineDataPath) {
      return { success: false, message: 'LINEのデータディレクトリが見つかりません。' };
    }

    const ringtoneDir = path.join(lineDataPath, 'sound');
    const ringtonePath = path.join(ringtoneDir, ringtoneFileName);
    const backupPath = path.join(ringtoneDir, ringtoneFileName + '.backup');
    
    console.log('着信音ディレクトリパス:', ringtoneDir);
    console.log('着信音ファイルパス:', ringtonePath);
    console.log('バックアップファイルパス:', backupPath);
    
    if (!fs.existsSync(backupPath)) {
      return { success: false, message: 'バックアップファイルが見つかりません。' };
    }
    
    // テスト用ディレクトリを使用しているかどうかを確認
    const isUsingTestDir = isDev && useTestDirInDev && lineDataPath.includes('line-ringtone-replace-test');
    
    // テスト用ディレクトリの場合は直接ファイル操作を行う
    if (isUsingTestDir) {
      console.log('テスト用ディレクトリを使用中: 直接ファイル操作を実行します');
      return new Promise((resolve) => {
        try {
          // バックアップから復元
          fs.copyFileSync(backupPath, ringtonePath);
          console.log('バックアップから復元しました:', ringtonePath);
          
          // バックアップファイルを削除
          fs.unlinkSync(backupPath);
          console.log('バックアップファイルを削除しました:', backupPath);
          
          // 復元成功後にキャッシュを更新
          updateBackupExistsCache(false);
          resolve({ success: true, message: 'デフォルトの着信音に戻しました。バックアップファイルも削除しました。' });
        } catch (e: unknown) {
          console.error('テスト用ディレクトリでのファイル操作エラー:', e);
          const errorMessage = e instanceof Error ? e.message : '不明なエラー';
          resolve({ success: false, message: `ファイル操作に失敗しました: ${errorMessage}` });
        }
      });
    }
    
    // 通常環境の場合は以下の処理を続行
    
    // Windowsでの注意メッセージ
    if (process.platform === 'win32' && !isUsingTestDir) {
      // LINEアプリが実行中の場合、ファイルがロックされている可能性があるため警告メッセージを表示
      const messageResult = await dialog.showMessageBox({
        type: 'warning',
        title: `実行確認`,
        message: 'LINEアプリは実行中のまま続行することをお勧めします',
        detail: 'LINEアプリは起動直後の最初の着信時に、強制的にデフォルトの着信音に戻す処理が行われます。\n\nそのためLINEアプリを起動中に本アプリケーションを用いて着信音を置換してください。',
        buttons: ['続行', 'キャンセル'],
        defaultId: 0,
        cancelId: 1
      });
      
      if (messageResult.response === 1) {
        // ユーザーがキャンセルを選択
        return { success: false, message: '操作がキャンセルされました。' };
      }
      
      console.log('ユーザーが続行を選択しました');
    }
    
    // Windowsでの特別処理
    if (process.platform === 'win32') {
      // 管理者権限でファイルを復元（PowerShell経由で実行）
      return new Promise((resolve) => {
        // PowerShellコマンドを構築
        let psCommand = [];
        
        // バックアップから復元
        psCommand.push(`Copy-Item "${backupPath}" "${ringtonePath}" -Force`);
        
        // バックアップファイルを削除
        psCommand.push(`Remove-Item "${backupPath}" -Force`);
        
        // 最終コマンド
        const finalPsCommand = psCommand.join('; ');
        const encodedCommand = Buffer.from(finalPsCommand, 'utf16le').toString('base64');
        
        // PowerShellを管理者権限で実行するコマンド
        const command = `powershell.exe -EncodedCommand ${encodedCommand}`;
        
        console.log('実行するPowerShellコマンド:', finalPsCommand);
        console.log('sudo-prompt実行開始...');
        
        // 管理者権限でコマンドを実行
        sudoPrompt.exec(command, { name: APP_NAME }, (error, stdout, stderr) => {
          console.log('sudo-prompt実行完了');
          
          if (stdout) {
            console.log('コマンド実行結果 (stdout):', stdout);
          }
          
          if (stderr) {
            console.error('コマンド実行エラー (stderr):', stderr);
          }
          
          if (error) {
            console.error('Error restoring ringtone with sudo:', error);
            let errorMessage = `管理者権限での復元に失敗しました`;
            if (error.message) {
              errorMessage += `: ${error.message}`;
            }
            if (stderr) {
              errorMessage += `\n詳細: ${stderr}`;
            }
            resolve({ success: false, message: errorMessage });
          } else {
            // 復元が成功したか確認
            try {
              const backupExists = fs.existsSync(backupPath);
              console.log('バックアップファイル存在確認:', backupExists);
              
              if (backupExists) {
                console.error('警告: バックアップファイルが削除されていません:', backupPath);
              }
              
              // ファイルのタイムスタンプを確認
              try {
                const stats = fs.statSync(ringtonePath);
                console.log('復元後のファイル更新日時:', stats.mtime);
                console.log('復元後のファイルサイズ:', stats.size, 'bytes');
              } catch (e) {
                console.error('ファイル情報取得エラー:', e);
              }
            } catch (e) {
              console.error('復元後のファイル確認エラー:', e);
            }
            
            // 復元成功後にキャッシュを更新
            updateBackupExistsCache(false);
            resolve({
              success: true,
              message: 'デフォルトの着信音に戻しました。バックアップファイルも削除しました。'
            });
          }
        });
      });
    } else {
      // macOS - 既存の処理を続行
      
      // 管理者権限でファイルを復元
      return new Promise((resolve) => {
        // コマンドを構築
        const command = `cp "${backupPath}" "${ringtonePath}" && rm "${backupPath}"`;
        
        console.log('復元実行コマンド:', command);
        
        sudoPrompt.exec(command, {
          name: APP_NAME,
        }, (error, stdout, stderr) => {
          if (stdout) {
            console.log('コマンド実行結果 (stdout):', stdout);
          }
          
          if (stderr) {
            console.error('コマンド実行エラー (stderr):', stderr);
          }
          
          if (error) {
            console.error('Error restoring ringtone with sudo:', error);
            resolve({ success: false, message: `管理者権限での復元に失敗しました: ${error.message || '不明なエラー'}` });
          } else {
            // 復元成功後にキャッシュを更新
            updateBackupExistsCache(false);
            resolve({ success: true, message: 'デフォルトの着信音に戻しました。バックアップファイルも削除しました。' });
          }
        });
      });
    }
  } catch (error: any) {
    console.error('Error restoring ringtone:', error);
    return { success: false, message: `エラーが発生しました: ${error.message || '不明なエラー'}` };
  }
});

// バックアップファイルの存在を確認する
ipcMain.handle('check-backup-exists', async () => {
  try {
    // キャッシュが有効であれば使用
    if (backupExistsCache && (Date.now() - backupExistsCache.timestamp) < CACHE_TTL) {
      console.log('バックアップ存在確認: キャッシュを使用', backupExistsCache.exists);
      return { exists: backupExistsCache.exists };
    }

    // 開発環境でテスト用ディレクトリを使用するかどうかのフラグを取得
    const useTestDirInDev = getUseTestDirInDevFlag();

    const lineDataPath = getLineDataPath();
    if (!lineDataPath) {
      updateBackupExistsCache(false);
      return { exists: false };
    }

    const ringtoneDir = path.join(lineDataPath, 'sound');
    const backupPath = path.join(ringtoneDir, ringtoneFileName + '.backup');
    
    console.log('着信音ディレクトリパス:', ringtoneDir);
    console.log('バックアップファイルパス:', backupPath);
    
    // テスト用ディレクトリを使用しているかどうかを確認
    const isUsingTestDir = isDev && useTestDirInDev && lineDataPath.includes('line-ringtone-replace-test');
    
    // テスト用ディレクトリの場合は直接ファイル確認を行う
    if (isUsingTestDir) {
      console.log('テスト用ディレクトリを使用中: 直接ファイル確認を実行します');
      try {
        const exists = fs.existsSync(backupPath);
        console.log('テスト用ディレクトリでのバックアップ確認結果:', exists);
        updateBackupExistsCache(exists);
        return { exists };
      } catch (e: unknown) {
        console.error('テスト用ディレクトリでのファイル確認エラー:', e);
        updateBackupExistsCache(false);
        return { exists: false };
      }
    }
    
    // 通常環境の場合は以下の処理を続行
    
    // 通常権限でファイルが存在するか確認を試みる
    try {
      if (fs.existsSync(backupPath)) {
        updateBackupExistsCache(true);
        return { exists: true };
      } else if (fs.existsSync(ringtoneDir)) {
        // ディレクトリにアクセスできるがファイルがない場合
        updateBackupExistsCache(false);
        return { exists: false };
      }
    } catch (e) {
      console.log('通常権限でのバックアップ確認に失敗、管理者権限で確認します:', e);
    }
    
    // 開発環境では管理者権限チェックをスキップ
    if (process.env.NODE_ENV === 'development') {
      console.log('開発環境: 管理者権限チェックをスキップ');
      
      // Windowsの場合は特別処理（開発環境でも管理者権限でチェック）
      if (process.platform === 'win32') {
        // PowerShellでファイルの存在を確認
        return new Promise((resolve) => {
          const psCommand = `Test-Path "${backupPath}" | Out-String`;
          const encodedCommand = Buffer.from(psCommand, 'utf16le').toString('base64');
          const command = `powershell.exe -EncodedCommand ${encodedCommand}`;
          
          console.log('実行するPowerShellコマンド:', psCommand);
          console.log('sudo-prompt実行開始...');
          
          sudoPrompt.exec(command, { name: APP_NAME }, (error, stdout, stderr) => {
            console.log('sudo-prompt実行完了');
            
            if (stdout) {
              console.log('コマンド実行結果 (stdout):', stdout);
            }
            
            if (stderr) {
              console.error('コマンド実行エラー (stderr):', stderr);
            }
            
            if (error) {
              console.error('Error checking backup with sudo:', error);
              updateBackupExistsCache(false);
              resolve({ exists: false });
            } else {
              // 'True'か'False'を含む文字列が返される
              const output = stdout ? stdout.toString().trim() : '';
              const exists = output.toLowerCase().includes('true');
              updateBackupExistsCache(exists);
              resolve({ exists });
            }
          });
        });
      }
      
      // macOSなど - 権限チェックをスキップ
      updateBackupExistsCache(false);
      return { exists: false };
    }
    
    // 管理者権限でファイルの存在を確認
    return new Promise((resolve) => {
      let command;
      if (process.platform === 'win32') {
        // Windowsの場合は PowerShell を使用
        const psCommand = `Test-Path "${backupPath}" | Out-String`;
        const encodedCommand = Buffer.from(psCommand, 'utf16le').toString('base64');
        command = `powershell.exe -EncodedCommand ${encodedCommand}`;
      } else {
        // macOSの場合
        command = `test -f "${backupPath}" && echo "exists" || echo "notexists"`;
      }
      
      console.log('バックアップ確認コマンド:', command);
      
      sudoPrompt.exec(command, {
        name: APP_NAME,
      }, (error, stdout) => {
        if (error) {
          console.error('Error checking backup with sudo:', error);
          updateBackupExistsCache(false);
          resolve({ exists: false });
        } else {
          const output = stdout ? stdout.toString().trim() : '';
          
          // Windowsの場合はPowerShellの出力を解析
          let exists;
          if (process.platform === 'win32') {
            exists = output.toLowerCase().includes('true');
          } else {
            exists = output === 'exists';
          }
          
          updateBackupExistsCache(exists);
          resolve({ exists });
        }
      });
    });
  } catch (error) {
    console.error('バックアップ確認エラー:', error);
    updateBackupExistsCache(false);
    return { exists: false };
  }
});

// LINEデータディレクトリのパスを取得
function getLineDataPath(): string | null {
  try {
    // 環境変数からホームディレクトリを取得
    const homedir = os.homedir();
    console.log('現在の環境:', process.env.NODE_ENV);
    console.log('開発者モード判定:', isDev);
    
    // 開発環境でテスト用ディレクトリを使用する場合
    if (isDev && getUseTestDirInDevFlag()) {
      // テスト用ディレクトリを使用する場合は一時ディレクトリに出力
      const testDir = path.join(os.tmpdir(), 'line-ringtone-replace-test-output');
      console.log('テスト用ディレクトリを使用:', testDir);
      
      // テスト用ディレクトリが存在しない場合は作成
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
        console.log('テスト用ディレクトリを作成しました');
      }
      
      return testDir;
    }
    
    // 検索するLINEのデータディレクトリパスの候補
    let lineDataDirs: string[] = [];
    
    if (process.platform === 'darwin') {
      // macOSの場合
      lineDataDirs = [
        path.join(homedir, 'Library/Application Support/LINECall/Data'),
        path.join(homedir, 'Library/Application Support/LineCall/Data')
      ];
    } else if (process.platform === 'win32') {
      // Windowsの場合
      lineDataDirs = [
        path.join(homedir, 'AppData/Local/LineCall/Data'),
        path.join(homedir, 'AppData/Local/LINECall/Data')
      ];
    } else {
      console.error('対応していないプラットフォームです:', process.platform);
      return null;
    }
    
    console.log('検索するLINEデータディレクトリパス:', lineDataDirs);
    
    // 存在するディレクトリを探す
    for (const dir of lineDataDirs) {
      try {
        const exists = fs.existsSync(dir);
        console.log('パス確認:', dir, '- 存在:', exists);
        if (exists) {
          console.log('使用するLINEデータディレクトリパス:', dir);
          return dir;
        }
      } catch (e) {
        console.error(`パス確認エラー: ${dir}`, e);
      }
    }
    
    // ディレクトリが見つからない場合
    // Windows環境では作成を試みる
    if (process.platform === 'win32') {
      try {
        const defaultDir = path.join(homedir, 'AppData/Local/LineCall/Data');
        console.log('LINEデータディレクトリが見つからないため作成を試みます:', defaultDir);
        
        // ディレクトリ作成を試みる
        fs.mkdirSync(defaultDir, { recursive: true });
        console.log('LINEデータディレクトリを作成しました:', defaultDir);
        return defaultDir;
      } catch (e) {
        console.error('ディレクトリ作成エラー:', e);
      }
    }
    
    console.error('LINEデータディレクトリが見つかりません。手動でインストールされているか確認してください。');
    
    // ディレクトリが見つからない場合は特別処理
    if (process.platform === 'win32' && process.env.NODE_ENV === 'development') {
      // 開発環境では一時ディレクトリを使用（自動テスト用）
      const fallbackDir = path.join(homedir, 'AppData/Local/LineCall/Data');
      console.log('開発環境: ディレクトリが見つからないためフォールバックパスを使用します:', fallbackDir);
      return fallbackDir;
    }
    
    return null;
  } catch (error) {
    console.error('LINEデータディレクトリの取得エラー:', error);
    return null;
  }
}

// 音声ファイル選択ダイアログを表示するハンドラ
ipcMain.handle('get-file-path', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: '音声ファイルを選択',
      properties: ['openFile'],
      filters: [
        { name: '音声ファイル', extensions: [...SUPPORTED_AUDIO_EXTENSIONS] }
      ],
      message: '置き換える音声ファイルを選択してください'
    });
    
    if (canceled || filePaths.length === 0) {
      return { success: false, message: 'ファイルが選択されませんでした' };
    }
    
    return { success: true, filePath: filePaths[0] };
  } catch (error) {
    console.error('ファイル選択エラー:', error);
    return { success: false, message: 'ファイル選択中にエラーが発生しました' };
  }
});

// ドロップされたファイルを処理するハンドラ
ipcMain.handle('handle-dropped-file', async (_, fileInfo) => {
  try {
    if (!fileInfo || !fileInfo.path) {
      return { success: false, message: 'ファイルが選択されていません' };
    }

    console.log('ドロップされたファイル情報:', fileInfo);
    
    // 実際にはレンダラープロセスから渡されるのはFileオブジェクトのようなものではなく、
    // Electronがファイルパスなどの基本情報を含むオブジェクトを渡します
    const filePath = fileInfo.path;
    
    // 着信音置換の処理を直接呼び出す
    return await replaceRingtone(filePath);
  } catch (error: any) {
    console.error('ドロップファイル処理エラー:', error);
    return { success: false, message: `エラーが発生しました: ${error.message || '不明なエラー'}` };
  }
});

// 着信音置換のヘルパー関数
async function replaceRingtone(filePath: string) {
  try {
    // キャッシュを無効化
    invalidateCacheAfterOperation();
    
    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
      return { success: false, message: 'ファイルが見つかりません。' };
    }

    // 音声ファイルかどうかを検証
    const isAudio = await isAudioFile(filePath);
    if (!isAudio) {
      return { success: false, message: '選択されたファイルは音声ファイルではありません。' };
    }

    // 音声ファイルを.wavに変換
    const wavFilePath = await convertToWav(filePath);
    
    // 開発環境でテスト用ディレクトリを使用するかどうかのフラグを取得
    const useTestDirInDev = getUseTestDirInDevFlag();
    
    // LINEのデータディレクトリパスを取得
    const lineDataPath = getLineDataPath();
    if (!lineDataPath) {
      return { success: false, message: 'LINEのデータディレクトリが見つかりません。' };
    }

    // 着信音ファイルのパス
    const ringtoneDir = path.join(lineDataPath, 'sound');
    const ringtonePath = path.join(ringtoneDir, ringtoneFileName);
    const backupPath = path.join(ringtoneDir, ringtoneFileName + '.backup');
    
    console.log('着信音ディレクトリパス:', ringtoneDir);
    console.log('着信音ファイルパス:', ringtonePath);
    console.log('バックアップファイルパス:', backupPath);
    
    // テスト用ディレクトリを使用しているかどうかを確認
    const isUsingTestDir = isDev && useTestDirInDev && lineDataPath.includes('line-ringtone-replace-test');
    
    // テスト用ディレクトリの場合は直接ファイル操作を行う
    if (isUsingTestDir) {
      console.log('テスト用ディレクトリを使用中: 直接ファイル操作を実行します');
      return new Promise((resolve) => {
        try {
          // ディレクトリが存在しなければ作成
          if (!fs.existsSync(ringtoneDir)) {
            fs.mkdirSync(ringtoneDir, { recursive: true });
            console.log('テスト用ディレクトリを作成しました:', ringtoneDir);
          }
          
          // 既存ファイルのバックアップを作成（既存ファイルが存在し、バックアップがない場合）
          if (fs.existsSync(ringtonePath) && !fs.existsSync(backupPath)) {
            fs.copyFileSync(ringtonePath, backupPath);
            console.log('バックアップファイルを作成しました:', backupPath);
          }
          
          // 新しいファイルを着信音として設定
          fs.copyFileSync(wavFilePath, ringtonePath);
          console.log('着信音ファイルを置換しました:', ringtonePath);
          
          // 一時ファイルの削除
          if (wavFilePath !== filePath && fs.existsSync(wavFilePath)) {
            fs.unlinkSync(wavFilePath);
            console.log('一時ファイルを削除しました:', wavFilePath);
          }
          
          // 置換後にファイルが存在するか確認
          if (fs.existsSync(ringtonePath)) {
            // ファイルサイズを確認
            const stats = fs.statSync(ringtonePath);
            console.log('置換後のファイルサイズ:', stats.size, 'bytes');
            
            // タイムスタンプを確認
            console.log('ファイル更新日時:', stats.mtime);
            
            // 置換成功後にキャッシュを更新
            updateBackupExistsCache(true);
            resolve({ success: true, message: '着信音の置換が完了しました！' });
          } else {
            console.error('警告: 置換後にファイルが見つかりません');
            resolve({ success: false, message: 'ファイル置換に失敗しました。' });
          }
        } catch (e: unknown) {
          console.error('テスト用ディレクトリでのファイル操作エラー:', e);
          const errorMessage = e instanceof Error ? e.message : '不明なエラー';
          resolve({ success: false, message: `ファイル操作に失敗しました: ${errorMessage}` });
        }
      });
    }
    
    // 通常環境の場合は以下の処理を続行
    
    // Windowsでの注意メッセージ
    if (process.platform === 'win32' && !isUsingTestDir) {
      // LINEアプリが実行中の場合、ファイルがロックされている可能性があるため警告メッセージを表示
      const messageResult = await dialog.showMessageBox({
        type: 'warning',
        title: `${APP_NAME_JP} - 実行確認`,
        message: 'LINEアプリは実行中のまま続行することをお勧めします',
        detail: 'LINEアプリは起動直後の最初の着信時に、強制的にデフォルトの着信音に戻す処理が行われます。\n\nそのためLINEアプリを起動中に本アプリケーションを用いて着信音を置換してください。',
        buttons: ['続行', 'キャンセル'],
        defaultId: 0,
        cancelId: 1
      });
      
      if (messageResult.response === 1) {
        // ユーザーがキャンセルを選択
        return { success: false, message: '操作がキャンセルされました。' };
      }
      
      console.log('ユーザーが続行を選択しました');
    }
    
    // 先にsoundディレクトリを確認し作成を試みる（管理者権限なしで可能な場合）
    if (!fs.existsSync(ringtoneDir)) {
      try {
        fs.mkdirSync(ringtoneDir, { recursive: true });
        console.log('ディレクトリを作成しました:', ringtoneDir);
      } catch (e) {
        console.log('通常権限でのディレクトリ作成に失敗しました、管理者権限で試行します:', e);
        // エラーは無視して続行（後でsudoで作成する）
      }
    }
    
    // 通常権限でバックアップがあるか確認
    let hasBackup = false;
    try {
      hasBackup = fs.existsSync(backupPath);
      console.log('通常権限でのバックアップ確認結果:', hasBackup);
    } catch (e) {
      console.log('通常権限でのバックアップ確認に失敗:', e);
    }
    
    // Windowsでの特別処理
    if (process.platform === 'win32') {
      // 管理者権限で着信音ファイルを置換（PowerShell経由で実行）
      return new Promise((resolve) => {
        // PowerShellコマンドを構築
        let psCommand = [];
        
        // ディレクトリ作成
        psCommand.push(`if (-not (Test-Path "${ringtoneDir}")) { New-Item -Path "${ringtoneDir}" -ItemType Directory -Force }`);
        
        // バックアップ作成（必要な場合）
        if (fs.existsSync(ringtonePath) && !hasBackup) {
          psCommand.push(`if (-not (Test-Path "${backupPath}")) { Copy-Item "${ringtonePath}" "${backupPath}" -Force }`);
        }
        
        // ファイル置換
        psCommand.push(`Copy-Item "${wavFilePath}" "${ringtonePath}" -Force`);
        
        // 最終コマンド
        const finalPsCommand = psCommand.join('; ');
        const encodedCommand = Buffer.from(finalPsCommand, 'utf16le').toString('base64');
        
        // PowerShellを管理者権限で実行するコマンド
        const command = `powershell.exe -EncodedCommand ${encodedCommand}`;
        
        console.log('実行するPowerShellコマンド:', finalPsCommand);
        console.log('sudo-prompt実行開始...');
        
        // 管理者権限でコマンドを実行
        sudoPrompt.exec(command, { name: APP_NAME }, (error, stdout, stderr) => {
          console.log('sudo-prompt実行完了');
          
          if (stdout) {
            console.log('コマンド実行結果 (stdout):', stdout);
          }
          
          if (stderr) {
            console.error('コマンド実行エラー (stderr):', stderr);
          }
          
          // 一時ファイルの削除
          if (wavFilePath !== filePath && fs.existsSync(wavFilePath)) {
            try {
              fs.unlinkSync(wavFilePath);
              console.log('一時ファイルを削除しました:', wavFilePath);
            } catch (e) {
              console.error('一時ファイル削除エラー:', e);
            }
          }
          
          if (error) {
            console.error('Error replacing ringtone with sudo:', error);
            
            // エラーメッセージをより詳細に
            let errorMessage = `管理者権限での着信音置換に失敗しました`;
            if (error.message) {
              errorMessage += `: ${error.message}`;
            }
            if (stderr) {
              errorMessage += `\n詳細: ${stderr}`;
            }
            
            resolve({ success: false, message: errorMessage });
          } else {
            // 置換後にファイルが存在するか確認
            try {
              const fileExists = fs.existsSync(ringtonePath);
              console.log('置換後のファイル存在確認:', fileExists);
              
              if (!fileExists) {
                console.error('警告: 置換後にファイルが見つかりません:', ringtonePath);
                
                // さらに詳細な情報を提供
                let detailedMessage = '着信音ファイルの置換に失敗しました。以下の原因が考えられます：\n';
                detailedMessage += '・LINEアプリが実行中でファイルがロックされている\n';
                detailedMessage += '・管理者権限が正しく機能していない\n';
                detailedMessage += '・ファイルパスに問題がある\n\n';
                detailedMessage += 'LINEアプリを完全に終了してから再試行してください。';
                
                resolve({ success: false, message: detailedMessage });
                return;
              }
              
              // ファイルのタイムスタンプを確認
              try {
                const stats = fs.statSync(ringtonePath);
                console.log('置換後のファイル更新日時:', stats.mtime);
                console.log('置換後のファイルサイズ:', stats.size, 'bytes');
              } catch (e) {
                console.error('ファイル情報取得エラー:', e);
              }
            } catch (e) {
              console.error('置換後のファイル確認エラー:', e);
            }
            
            // 置換成功後にキャッシュを更新
            updateBackupExistsCache(true);
            resolve({
              success: true,
              message: '着信音の置換が完了しました！\n\nLINEアプリの再起動は不要です。'
            });
          }
        });
      });
    } else {
      // macOS - 既存の処理を続行
      
      // 必要ならバックアップファイルを作成
      let backupCommand = '';
      if (fs.existsSync(ringtonePath) && !hasBackup) {
        backupCommand = `mkdir -p "${ringtoneDir}" && cp "${ringtonePath}" "${backupPath}" && `;
      } else if (!fs.existsSync(ringtoneDir)) {
        backupCommand = `mkdir -p "${ringtoneDir}" && `;
      }
      
      // 管理者権限で着信音ファイルを置換
      return new Promise((resolve) => {
        // macOSの場合
        const command = `${backupCommand}cp "${wavFilePath}" "${ringtonePath}"`;
        
        console.log('実行するコマンド:', command);
        console.log('sudo-prompt実行開始...');
        
        // 管理者権限でコマンドを実行
        sudoPrompt.exec(command, { name: APP_NAME }, (error, stdout, stderr) => {
          console.log('sudo-prompt実行完了');
          
          if (stdout) {
            console.log('コマンド実行結果 (stdout):', stdout);
          }
          
          if (stderr) {
            console.error('コマンド実行エラー (stderr):', stderr);
          }
          
          // 一時ファイルの削除
          if (wavFilePath !== filePath && fs.existsSync(wavFilePath)) {
            try {
              fs.unlinkSync(wavFilePath);
              console.log('一時ファイルを削除しました:', wavFilePath);
            } catch (e) {
              console.error('一時ファイル削除エラー:', e);
            }
          }
          
          if (error) {
            console.error('Error replacing ringtone with sudo:', error);
            
            // エラーメッセージをより詳細に
            let errorMessage = `管理者権限での着信音置換に失敗しました`;
            if (error.message) {
              errorMessage += `: ${error.message}`;
            }
            if (stderr) {
              errorMessage += `\n詳細: ${stderr}`;
            }
            
            resolve({ success: false, message: errorMessage });
          } else {
            // 置換後にファイルが存在するか確認
            try {
              const fileExists = fs.existsSync(ringtonePath);
              console.log('置換後のファイル存在確認:', fileExists);
              
              if (!fileExists) {
                console.error('警告: 置換後にファイルが見つかりません:', ringtonePath);
                resolve({ success: false, message: '着信音ファイルの置換に成功しましたが、ファイルが見つかりません。権限の問題が発生している可能性があります。' });
                return;
              }
              
              // ファイルのタイムスタンプを確認
              try {
                const stats = fs.statSync(ringtonePath);
                console.log('置換後のファイル更新日時:', stats.mtime);
                console.log('置換後のファイルサイズ:', stats.size, 'bytes');
              } catch (e) {
                console.error('ファイル情報取得エラー:', e);
              }
            } catch (e) {
              console.error('置換後のファイル確認エラー:', e);
            }
            
            // 置換成功後にキャッシュを更新
            updateBackupExistsCache(true);
            resolve({ success: true, message: '着信音の置換が完了しました！' });
          }
        });
      });
    }
  } catch (error: any) {
    console.error('Error replacing ringtone:', error);
    return { success: false, message: `エラーが発生しました: ${error.message || '不明なエラー'}` };
  }
}

// useTestDirInDevフラグを取得する関数
function getUseTestDirInDevFlag(): boolean {
  // 開発環境でテスト用ディレクトリを使用するかどうかのフラグ
  // 開発中にLINEの実際のディレクトリを変更したくない場合はtrueに設定
  return false; // 実際のLINEディレクトリを使用（必要に応じてtrueに変更可能）
}

// バックアップ存在確認のキャッシュを更新
function updateBackupExistsCache(exists: boolean): void {
  backupExistsCache = {
    exists,
    timestamp: Date.now()
  };
  console.log('バックアップ存在確認キャッシュを更新:', exists);
}

// バックアップ存在確認のキャッシュを無効化
function invalidateBackupExistsCache(): void {
  backupExistsCache = null;
  console.log('バックアップ存在確認キャッシュを無効化');
}

// 着信音関連操作の後にキャッシュを無効化する（置換または復元操作後）
function invalidateCacheAfterOperation(): void {
  invalidateBackupExistsCache();
}

// アプリケーションのバージョン情報を取得するハンドラ
ipcMain.handle('get-app-info', () => {
  return {
    version: APP_VERSION,
    name: APP_NAME_JP,
    platform: process.platform
  };
}); 