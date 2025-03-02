/**
 * 対応している音声ファイル形式の定義
 */

/** 対応音声ファイル拡張子の配列 */
export const SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'] as const;

/** 対応音声ファイル拡張子の型 */
export type SupportedAudioExtension = typeof SUPPORTED_AUDIO_EXTENSIONS[number];

/** 音声ファイル形式と表示名のマッピング */
export const AUDIO_FORMAT_DISPLAY_NAMES: Record<SupportedAudioExtension, string> = {
  'mp3': 'MP3 音声',
  'wav': 'WAV 音声',
  'ogg': 'OGG 音声',
  'm4a': 'M4A 音声',
  'flac': 'FLAC 音声',
  'aac': 'AAC 音声'
};

/** 対応音声ファイル拡張子を「.拡張子」形式の文字列配列として取得 */
export const SUPPORTED_AUDIO_EXTENSIONS_WITH_DOT = SUPPORTED_AUDIO_EXTENSIONS.map(ext => `.${ext}`);

/** 対応音声ファイル拡張子をカンマ区切りで表示するための文字列 */
export const SUPPORTED_AUDIO_EXTENSIONS_DISPLAY = SUPPORTED_AUDIO_EXTENSIONS.map(ext => `.${ext}`).join(', '); 