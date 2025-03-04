import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as os from "os";

const execAsync = promisify(exec);

// ffmpeg-staticのパスを取得
const getFfmpegPath = (): string => {
  let ffmpegPath: string;

  if (process.env.NODE_ENV === "development") {
    // 開発環境ではnode_modulesから直接使用
    ffmpegPath = require("ffmpeg-static") as string;
  } else {
    // 本番環境ではelectron-builderによって配置されたパスを使用
    const platform = process.platform;
    const resourcesPath = process.resourcesPath || "";

    if (platform === "darwin") {
      ffmpegPath = path.join(resourcesPath, "ffmpeg-static", "ffmpeg");
    } else if (platform === "win32") {
      ffmpegPath = path.join(resourcesPath, "ffmpeg-static", "ffmpeg.exe");
    } else {
      ffmpegPath = path.join(resourcesPath, "ffmpeg-static", "ffmpeg");
    }
  }

  return ffmpegPath;
};

// 音声ファイルかどうかを判定
export const isAudioFile = async (filePath: string): Promise<boolean> => {
  try {
    const ffmpegPath = getFfmpegPath();
    const { stdout } = await execAsync(
      `"${ffmpegPath}" -i "${filePath}" -f null - 2>&1`
    );
    return !stdout.includes("Invalid data found when processing input");
  } catch (error: any) {
    // ffmpegがエラーを返すが、音声ファイルであれば特定のエラーメッセージを含まない
    if (
      error.stderr &&
      !error.stderr.includes("Invalid data found when processing input")
    ) {
      return true;
    }
    return false;
  }
};

// 音声ファイルをWAV形式に変換
export const convertToWav = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).toLowerCase();

  // 既にWAVファイルであれば変換しない
  if (ext === ".wav") {
    return filePath;
  }

  // 一時ファイル名の生成
  const tempDir = os.tmpdir();
  const outputPath = path.join(
    tempDir,
    `${path.basename(filePath, ext)}_converted.wav`
  );

  try {
    const ffmpegPath = getFfmpegPath();
    await execAsync(
      `"${ffmpegPath}" -i "${filePath}" -acodec pcm_s16le -ar 44100 "${outputPath}"`
    );
    return outputPath;
  } catch (error: any) {
    console.error("Error converting audio file:", error);
    throw new Error("音声ファイルの変換に失敗しました。");
  }
};
