# LINE Ringtone Replacer

デスクトップ版LINEアプリケーションの着信音ファイルを置換するツールです。Electronを使用してデスクトップアプリケーションとして実装しています。

macOS版もありますが、現在はWindows版のみの展開です。

<p align="center">
  <img src="./docs/images/image-app-shot-1.png" width="40%">
</p>

## 動作確認環境

- Windows 11 (10.0.22631.4602): LINE `ver 9.6.1.3529`

## 使用方法

### 1. LINEアプリケーションを起動した状態にする

LINEアプリケーションを起動した状態にします。

<img src="./docs/images/image-1.png">

### 2. **LINE Ringtone Replacer**を起動し、音声ファイルを選択して置換する

**LINE Ringtone Replacer**を起動後、音声ファイルを選択（またはドラッグアンドドロップ）します。

音声ファイルは`mp3`, `wav`, `ogg`, `m4a`, `flac`, `aac`のいずれかの形式である必要があります。最終的に`wav`形式に自動変換され、デフォルトの着信音ファイルに置換されます。

途中操作権限の許可が求められるので忘れずに許可します。

<video controls src="https://github.com/user-attachments/assets/0325b172-7ea8-4cb6-9822-8ff5fb410dae" muted="false"></video>

基本的な使用方法は以上です。

元の着信音に戻したい場合は「**デフォルトに戻す**」ボタンをクリックすると元の着信音に戻ります。なお複数回置換した場合は、最新の着信音から1つ前の着信音に戻ります。その場合は一度LINEアプリケーションを再起動し、着信があると元の着信音に戻ります。

もし起動の過程で「WindowsによってPCが保護されました」が表示された場合は、詳細情報をクリックし「実行」を押下します。

<img src="./docs/images/image-2.png">

## 実際の操作の様子

- 00s 〜 05s: 通常の着信音が流れる様子
- 05s 〜 18s: **LINE Ringtone Replacer**を用いて着信音を置換する様子
- 18s 〜 27s: 置換後の着信音が流れる様子

**※ 音声をONにしてご確認ください**

<video controls src="https://github.com/user-attachments/assets/2f0e3c44-431e-43ed-84a7-90a57c66814a" muted="false"></video>

## 仕様について

- 本ツールはLINEアプリケーションが起動中の状態での使用を前提としています。
- 本ツールを用いて置換した着信音は、LINEアプリケーションの再起動後一度でも着信があると強制的に元に戻されます。本ツールで置換後はLINEアプリケーションを終了せず最小化した上でなるべく終了されない事をおすすめします。

## 注意事項

- LINEアプリケーションのバージョンによっては、正常に動作しない場合があります。
- LINEアプリケーションのアップデートにより、正常に動作しなくなる可能性があります。
- 本ツールの使用によるいかなる損害についても、当方は一切の責任を負いません。

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