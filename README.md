# LINE Ringtone Replacer

デスクトップ版LINEアプリケーションの着信音ファイルを置換するツールです。
Electronを使用してデスクトップアプリケーションとして実装しています。

macOS版もありますが、現在はWindows版のみの展開です。

<div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
  <div style="border-radius: 10px; overflow: hidden; max-width: 400px; margin: 0 auto;">
    <img src="./docs/images/image-app-shot-1.png">
  </div>
</div>

## 動作確認環境

- Windows 11 (10.0.22631.4602): LINE `ver 9.6.1.3529`

## 使用方法

### 1. LINEアプリケーションを起動した状態にする

LINEアプリケーションを起動した状態にしておきます。

<img src="./docs/images/image-1.png">

### 2. *LINE Ringtone Replacer*を起動し、音声ファイルを選択（またはドラッグアンドドロップ）して置換する

*LINE Ringtone Replacer*を起動後音声ファイルを選択します。
音声ファイルは`mp3`, `wav`, `ogg`, `m4a`, `flac`, `aac`のいずれかの形式である必要があります。最終的に`wav`形式に自動変換され、デフォルトの着信音ファイルに置換されます。

途中操作権限の許可が求められるので忘れず許可します。

<video src="./docs/videos/video-1.mp4" controls></video>

基本的な使用方法は以上です。

元の着信音に戻したい場合は「デフォルトに戻す」ボタンをクリックすると元の着信音に戻ります。なお複数回置換した場合は、最新の着信音から1つ前の着信音に戻ります。その場合は一度LINEアプリケーションを再起動し、着信があると元の着信音に戻ります。

もし起動の過程で「WindowsによってPCが保護されました」が表示された場合は、詳細情報をクリックし「実行」を選択します。

<img src="./docs/images/image-2.png">

## 操作の様子

- 00s 〜 05s: 通常の着信音が流れる様子
- 05s 〜 18s: *LINE Ringtone Replacer*を用いて着信音を置換する様子
- 18s 〜 27s: 置換後の着信音が流れる様子

**※ 音声が流れますので音量にご注意ください。**

<video src="./docs/videos/video-2.mp4" controls></video>

## 仕様について

- 本ツールはLINEアプリケーションが起動中の状態でのみ使用できます
- 本ツールを用いて置換した着信音は、LINEアプリケーションの再起動後一度でも着信があると強制的に元に戻されます。本ツールで置換後はLINEアプリケーションを終了せず最小化した状態にすることで、着信音を変更した状態を維持出来ます

## 注意事項

- LINEアプリケーションのバージョンによっては、正常に動作しない場合があります
- LINEアプリケーションのアップデートにより、正常に動作しなくなる可能性があります
- 本ツールの使用によるいかなる損害についても、当方は一切の責任を負いません

## Required Environment

- Node.js `v20.18.1`

```bash
# macOS
$ sw_vers
ProductName:    macOS
ProductVersion: 14.4.1
BuildVersion:   23E224

$ node -v
20.18.1

# Windows OS
$ ver
Microsoft Windows [Version 10.0.22631.4602]

$ node -v
20.18.1
```

## Install

```bash
npm install
```

## Dev

```bash
npm run dev
```

## Package

```bash
# for Windows OS
npm run package:win

# for macOS
npm run package:mac
```