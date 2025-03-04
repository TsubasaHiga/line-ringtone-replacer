# LINE Ringtone Replacer

デスクトップ版LINEアプリケーションの着信音ファイルを置換するツールです。Electronを使用してクロスプラットフォームのデスクトップアプリケーションとして実装しています。

<p align="center">
  <img src="./docs/images/image-app-shot-2.png">
</p>

## 動作確認環境

- Windows 11 (10.0.22631.4602): LINE `ver 9.6.1.3529`
- macOS 14.4.1 (23E224): LINE `ver 9.6.1.3529` ※macOS版は検証段階で未リリースです

## ダウンロード

以下より最新バージョンのインストーラーをダウンロード可能です。
お使いの環境に適したものをダウンロードしてください。

<https://github.com/TsubasaHiga/line-ringtone-replacer/releases>

## 使用方法

### 1. LINEアプリケーションを起動する

最初にLINEアプリケーションを起動した状態にします。

<kbd>
  <img src="./docs/images/image-1.png" width="366">
</kbd>

### 2. LINE Ringtone Replacerで音声ファイルを選択

LINE Ringtone Replacerを起動し、以下のいずれかの方法で音声ファイルを選択します：
- 「ファイルを選択」ボタンをクリック
- 対応音声ファイルをドラッグ&ドロップ

対応フォーマット: `mp3`, `wav`, `ogg`, `m4a`, `flac`, `aac`  
※自動的に`wav`形式に変換されます

<video controls src="https://github.com/user-attachments/assets/0325b172-7ea8-4cb6-9822-8ff5fb410dae" muted="false"></video>

### 3. 管理者権限を許可

ファイル置換には管理者権限が必要なため、表示される許可ダイアログを承認してください。

### 元の着信音に戻す方法

「**デフォルトに戻す**」ボタンをクリックすると元の着信音に戻ります。複数回置換を行った場合、最後に置換を行う前の状態に戻ります。

### 初回起動時の注意点

Windows環境で初回起動時に「WindowsによってPCが保護されました」と表示された場合：
1. 「詳細情報」をクリック
2. 「実行」ボタンを押す

<kbd>
  <img src="./docs/images/image-2.png" width="534">
</kbd>

## 実際の操作デモ

以下の動画では操作の様子を確認できます（**音声をONにしてご視聴ください**）：
- 00s～05s: 通常の着信音
- 05s～18s: LINE Ringtone Replacerによる置換操作
- 18s～27s: 置換後の着信音

<video controls src="https://github.com/user-attachments/assets/2f0e3c44-431e-43ed-84a7-90a57c66814a" muted="false"></video>

## 使用上の注意点

- LINEアプリケーションが起動中の状態で使用してください
- 置換した着信音はLINEアプリケーションの再起動後、最初の着信で自動的に元に戻る仕様です
- 置換後はLINEアプリケーションを終了せず、最小化したままご使用ください

## 免責事項

- LINEアプリケーションのバージョンによっては正常に動作しない場合があります
- LINEアプリケーションのアップデートにより動作しなくなる可能性があります
- 本ツールの使用によるいかなる損害についても、一切の責任を負いません

## 開発者向け情報

### 必要な環境

- Node.js `v20.18.1`

```bash
# 動作確認済み環境
# macOS
$ sw_vers
ProductName:    macOS
ProductVersion: 14.4.1
BuildVersion:   23E224

# Windows
$ ver
Microsoft Windows [Version 10.0.22631.4602]

# 共通
$ node -v
v20.18.1
```

### インストール方法

```bash
npm install
```

### 開発モードでの実行

```bash
npm run dev
```

### アプリケーションのビルド

```bash
# Windows版のビルド（Windows環境推奨）
npm run package:win

# macOS版のビルド
npm run package:mac

# 両方のプラットフォーム向けにビルド
npm run package
```

※クロスプラットフォームビルド（macOSからWindows向け、またはその逆）は一部機能に制限が発生する場合があります。
