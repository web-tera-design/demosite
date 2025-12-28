雛形を開いたら最初にやること
style.css のテーマ情報を自分用に書き換える

テーマ名、作者、バージョン、説明など

functions.php のGoogle Fontsや外部フォント設定を編集する

必要なフォントやCDNリンクを自分の用途に合わせて調整

package.json の name はそのままでもOK

プロジェクト名として表示されるだけなので、必要に応じて変更

WordPress管理画面で以下を設定

サイトアイコン（ファビコン）を登録。
５１２＊５１２のpngでよい。
名前もfavicon-○○.pngで自由。
icoじゃなくてよい。
指示があれば従う

サイトタイトル・キャッチフレーズを入力

パーマリンク設定を「投稿名」など好みに変更

管理者メールアドレスやタイムゾーンを確認

必要ならカスタムロゴやウィジェット、メニューも整理

必要に応じて screenshot.png（テーマサムネイル）を設置

reCAPTCHAの設定


Variablesの色とフォント入力
Base.scssのBodyのフォント、カラー、bgカラー入力

# Gulp 開発環境 README

このリポジトリは、**静的サイト / WordPress（PHP）の両方に対応した Gulp 開発環境**です。
LP制作から WordPress テーマ開発まで、実務でそのまま使える構成を目指しています。

---

## 特徴

* 静的サイト / WordPress 両対応（モード切替）
* SCSS 構成の自動管理（index.scss 自動生成）
* PostCSS による CSS 最適化
* esbuild による高速 JavaScript ビルド
* 画像の WebP 変換 + 差分ビルド
* 動画ファイル対応
* BrowserSync によるライブリロード
* 壊れにくい watch 設計

---

## 動作環境

* Node.js：推奨 v18 以上
* npm
* Gulp v4

---

## ディレクトリ構成

```
.
├─ src
│  ├─ assets
│  │  ├─ sass
│  │  │  ├─ foundation
│  │  │  ├─ layout
│  │  │  ├─ component
│  │  │  ├─ project
│  │  │  ├─ utility
│  │  │  └─ style.scss
│  │  ├─ js
│  │  ├─ img
│  │  └─ video
│  ├─ *.html
│  └─ *.php
│
├─ dist
│  └─ assets
│
├─ gulpfile.js
└─ package.json
```

---

## 初期設定

### 1. 依存関係のインストール

```bash
npm install
```

---

## モード設定（重要）

```js
const CONFIG = {
  mode: "static", // "static" or "dynamic"
  proxy: "tera-portfolio.local", // dynamic時のみ使用
  baseDir: "./dist",
};
```

### static モード

* HTML を整形して dist に出力
* BrowserSync は dist を直接参照
* LP / 静的サイト向け

### dynamic モード

* PHP をそのままコピー
* BrowserSync は proxy 経由
* WordPress / PHP 案件向け

---

## SCSS 設計ルール

### フォルダ構成

* foundation
* layout
* component
* project
* utility

### 自動処理内容

* 各フォルダ内の `index.scss` を自動生成
* `.scss` ファイルには自動で以下を挿入

```scss
@use "../global" as *;
```

* `index.scss` は差分がある場合のみ更新

👉 **SCSS の import 管理を意識しなくてOK**

---

## CSS ビルド内容

* Sass コンパイル
* Autoprefixer
* CSS 宣言順ソート（SMACSS）
* ルールマージ
* minify
* sourcemap 出力

---

## JavaScript ビルド

* esbuild 使用（高速）
* ES2015 対応
* minify 有効
* **bundle しない（WordPress 想定）**

---

## 画像処理

* jpg / png / gif / svg / webp をコピー
* jpg / png は WebP に変換
* 差分ビルド対応（newer）

---

## 動画処理

* mp4 / webm / mov / ogg 対応
* video フォルダが存在しない場合は自動スキップ

---

## 使用コマンド

### 開発開始

```bash
npm run dev
# または
gulp
```

### ビルドのみ

```bash
gulp build
```

---

## watch 対象

* SCSS（index.scss は除外）
* JavaScript
* 画像 / 動画
* HTML / PHP

---

## 設計思想

* **壊れにくさを最優先**
* 自動化しすぎない
* 初見でも理解できる構成
* LP / WordPress の両立

---

## 補足

* 本構成は実案件を想定しています
* boilerplate として複製・再利用可能
* 必要に応じて Vite 等へ移行しても思想は流用可能

---

## 作成者メモ

* gulp + esbuild は "軽量・高速・安定"
* 小〜中規模案件に最適
* チーム開発でも扱いやすい



# 🚀 GitHub Actions + Xserver 自動デプロイ完全ガイド（初心者5分構築）

## 📋 事前準備（各自5分）
- [ ] **Xserver管理画面 → アカウント → SSH設定**
  - SSH設定: **ON**
  - **国外IP制限: OFF**（GitHub Actions必須！）
  - 公開鍵生成 → 秘密鍵（`.key`ファイル）ダウンロード

- [ ] **秘密鍵コピー**
Finder → ユーザー → .ssh → 自分のID.key → テキストエディタで全選択コピー

- [ ] **GitHubリポジトリ確認**
## 🎯 構築手順（コピペのみ）

### 1. GitHub Secrets設定
リポジトリ → Settings → Secrets and variables → Actions → New repository secret
Name: SFTP_KEY
Secret: [コピーした鍵の中身（-----BEGIN...-----END...全部）]

### 2. `.github/workflows/deploy.yml`作成
name: Deploy to XServer
on:
push:
branches: [ master ] # mainなら[ main ]に変更

jobs:
deploy:
runs-on: ubuntu-latest
steps:
- name: Checkout code
uses: actions/checkout@v4

text
  - name: Use Node.js 20
    uses: actions/setup-node@v4
    with:
      node-version: "20"
      cache: 'npm'

  - name: Build Project
    run: |
      mkdir -p src/assets/img
      npm ci
      npm run build

  - name: Deploy
    uses: easingthemes/ssh-deploy@main
    with:
      SSH_PRIVATE_KEY: ${{ secrets.SFTP_KEY }}
      SSH_CMD_ARGS: "-o ConnectTimeout=60 -o ServerAliveInterval=10 -o StrictHostKeyChecking=no"
      ARGS: "-rlgoDzvc -i --delete"
      SOURCE: "./"
      REMOTE_HOST: "sv16201.xserver.jp"          # ← svXXXXX.xserver.jp
      REMOTE_USER: "xs655858"                    # ← xsXXXXXX
      REMOTE_PORT: "10022"
      TARGET: "ドメイン/public_html/テーマパス"    # ← 自分のパス
      EXCLUDE: |
        .vscode
        .index.html
        .src
        node_modules
        .git
        .DS_Store
        README.md
        package.json
        package-lock.json
        gulpfile.js
        .gitignore