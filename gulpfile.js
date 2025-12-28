// ▼ プロジェクト設定（テストサイト用に設定済み）
/**
 * ===============================================
 * # Gulp 設定ファイル（WordPress / PHP 動的サイト用）
 * ===============================================
 * 本ファイルは、WordPress テーマなどの開発効率を高めるための Gulp 設定です。
 * 主な機能：
 *  - SCSS の自動インデックス生成とコンパイル（Autoprefixer, minify, 整形付き）
 *  - JS のビルド（esbuild を使用）
 *  - 画像の最適化と WebP 自動生成
 *  - 動画ファイルのコピー（存在すれば）
 *  - HTML / PHP のコピーまたは整形
 *  - BrowserSync による動的リロード・ローカルサーバー対応
 *
 * 使用モード：
 *  - "dynamic"：WordPressやPHP環境向け（proxy指定でローカル環境に接続）
 *  - "static" ：通常の静的サイト生成向け（distをルートとして出力）
 *
 * コマンド：
 *  - `gulp`        ：開発用（サーバー起動 + 自動監視）
 *  - `gulp build`  ：ビルド処理のみ実行（dist 生成）
 * ===============================================
 */

const CONFIG = {
  mode: "dynamic", // WordPress/PHPなので "dynamic"
  proxy: "demosite.local", // あなたのテスト環境のドメイン
  baseDir: "./dist", // (dynamicモードでは使いませんが念のため)
};

const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const newer = require("gulp-newer");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const { deleteAsync } = require("del");

// CSS関連
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
const mergeRules = require("postcss-merge-rules");
const cleanCSS = require("gulp-clean-css");

// HTML関連
const htmlBeautify = require("gulp-html-beautify");

// JS関連 (esbuildに変更)
const esbuild = require("gulp-esbuild");

// 画像関連
const webp = require("gulp-webp").default;

// パス設定
const paths = {
  src: {
    base: "./src",
    scss: "./src/assets/sass",
    js: "./src/assets/js",
    img: "./src/assets/img",
    video: "./src/assets/video", // 動画用パス追加
    html: "./src/**/*.html",
    php: "./src/**/*.php",
    themePhp: "./**/*.php", // テーマ内のすべての PHP ファイルを監視 (node_modulesを除く)
  },
  dist: {
    base: "./dist",
    css: "./dist/assets/css",
    js: "./dist/assets/js",
    img: "./dist/assets/img",
    video: "./dist/assets/video", // 動画用パス追加
  },
};

// SCSSディレクトリ
const scssDirs = ["foundation", "layout", "component", "project", "utility"];

// エラー通知設定
const errorHandler = (title) => {
  return plumber({
    errorHandler: notify.onError({
      title: title,
      message: "<%= error.message %>",
      sound: "Bottle",
    }),
  });
};

// ===============================================
// # 1. SCSSパーシャル自動生成（修正版）
// ===============================================
function generateIndexScss(done) {
  scssDirs.forEach((dir) => {
    const fullPath = path.join(paths.src.scss, dir);

    // ディレクトリが存在する場合のみ処理
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
      let files = fs
        .readdirSync(fullPath)
        .filter((file) => {
          // ▼ 修正：index.scss 以外で、.scss で終わるすべてのファイルを対象にする
          // （!file.startsWith("_") を削除しました）
          return file.endsWith(".scss") && file !== "index.scss";
        })
        .sort();

      // 各ファイルに @use '../global' を自動挿入
      files.forEach((file) => {
        const filePath = path.join(fullPath, file);
        let fileContent = fs.readFileSync(filePath, "utf8");
        const importLine = '@use "../global" as *;';

        // ファイルの先頭に global 読み込みがない場合のみ追加
        if (!fileContent.includes(importLine) && !fileContent.includes("@use '../global' as *;")) {
          const newContent = `${importLine}\n${fileContent}`;
          fs.writeFileSync(filePath, newContent, "utf8");
        }
      });

      // index.scss の生成（_ も拡張子も取り除いて記述）
      const importStatements =
        files.length > 0
          ? files
              .map((file) => {
                // ファイル名から拡張子を削除
                let fileName = file.replace(".scss", "");
                // _c-button.scss -> @use "c-button"; と書くのが一般的だが、
                // ファイル名そのまま @use "_c-button"; でも動く。
                // ここではファイル名をそのまま採用します。
                return `@use "${fileName}";`;
              })
              .join("\n")
          : "";

      const indexScssPath = path.join(fullPath, "index.scss");
      const newIndexContent = `/* Auto-generated index.scss for ${dir} */\n${importStatements}\n`;

      // 内容が変わった時だけ書き込む
      if (!fs.existsSync(indexScssPath) || fs.readFileSync(indexScssPath, "utf8") !== newIndexContent) {
        fs.writeFileSync(indexScssPath, newIndexContent);
        console.log(`Generated: ${dir}/index.scss`); // ログで確認できるように追加
      }
    }
  });
  done();
}

// ===============================================
// # 2. CSSコンパイル（高品質版）
// ===============================================
function compileSass() {
  return gulp
    .src(path.join(paths.src.scss, "style.scss"), { sourcemaps: true })
    .pipe(errorHandler("Sass Error"))
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssSorter({ order: "smacss" }), mergeRules()]))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist.css, { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

// ===============================================
// # 3. HTML処理
// ===============================================
function processHtml() {
  if (CONFIG.mode === "dynamic") {
    // 動的モード：コピーのみ
    return gulp.src(paths.src.html).pipe(gulp.dest(paths.dist.base));
  } else {
    // 静的モード：整形
    return gulp
      .src(paths.src.html)
      .pipe(errorHandler("HTML Error"))
      .pipe(htmlBeautify({ indent_size: 2, max_preserve_newlines: 1 }))
      .pipe(gulp.dest(paths.dist.base))
      .pipe(browserSync.stream());
  }
}

// ===============================================
// # 4. PHP処理（動的モード用）
// ===============================================
function processPhp() {
  // PHPをdistにもコピーしたい場合（不要ならこの関数を使わなくてもOK）
  return gulp.src(paths.src.php).pipe(gulp.dest(paths.dist.base));
}

// ===============================================
// # 5. JS処理（esbuild）
// ===============================================
function compileJs() {
  return gulp
    .src(paths.src.js + "/**/*.js", { sourcemaps: true }) // 全JS対象に変更
    .pipe(errorHandler("JS Error"))
    .pipe(
      esbuild({
        target: "es2015",
        minify: true,
        bundle: false,
        sourcemap: true,
      })
    )
    .pipe(gulp.dest(paths.dist.js, { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

// ===============================================
// # 6. 画像処理 & 動画処理
// ===============================================
// 画像（WebP以外もコピー）
function copyImages() {
  return gulp
    .src([`${paths.src.img}/**/*.{jpg,jpeg,png,gif,svg,webp}`, `!${paths.src.img}/**/.DS_Store`], { encoding: false })
    .pipe(newer(paths.dist.img))
    .pipe(gulp.dest(paths.dist.img));
}

// WebP変換
function generateWebp() {
  return gulp
    .src([`${paths.src.img}/**/*.{jpg,jpeg,png}`, `!${paths.src.img}/**/.DS_Store`], { encoding: false })
    .pipe(newer({ dest: paths.dist.img, ext: ".webp" }))
    .pipe(webp({ quality: 75 }))
    .pipe(gulp.dest(paths.dist.img));
}

// 動画コピー（フォルダがなければスキップする安全設計）
function copyVideos(done) {
  // videoフォルダが存在するか確認
  if (!fs.existsSync(paths.src.video)) {
    console.log("Skipping copyVideos: No video folder found.");
    return done(); // なければ何もしないで終了
  }

  // あればコピー実行
  return gulp
    .src([`${paths.src.video}/**/*.{mp4,webm,mov,ogg}`, `!${paths.src.video}/**/.DS_Store`], { encoding: false })
    .pipe(newer(paths.dist.video))
    .pipe(errorHandler("Video Copy Error"))
    .pipe(gulp.dest(paths.dist.video));
}

// ===============================================
// # 7. サーバー & 監視
// ===============================================
function serve(done) {
  const serverConfig = {
    notify: false,
    ghostMode: false,
  };
  if (CONFIG.mode === "dynamic") {
    serverConfig.proxy = CONFIG.proxy;
  } else {
    serverConfig.server = { baseDir: CONFIG.baseDir };
  }
  browserSync.init(serverConfig);
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  // SCSS
  gulp.watch([`${paths.src.scss}/**/*.scss`, `!${paths.src.scss}/**/index.scss`], gulp.series(generateIndexScss, compileSass));
  // JS
  gulp.watch(`${paths.src.js}/**/*.js`, compileJs);
  // 画像
  gulp.watch(`${paths.src.img}/**/*`, gulp.series(gulp.parallel(copyImages, generateWebp), reload));
  // 動画（追加）
  gulp.watch(`${paths.src.video}/**/*`, gulp.series(copyVideos, reload));

  // HTML/PHP
  if (CONFIG.mode === "dynamic") {
    gulp.watch([paths.src.themePhp, `!./node_modules/**/*.php`], reload); // テーマ内のPHPファイルを監視（node_modulesは除く）    gulp.watch(paths.src.html, gulp.series(processHtml, reload));
  } else {
    gulp.watch(paths.src.html, gulp.series(processHtml));
  }
}

// ===============================================
// # タスク実行
// ===============================================
function clean() {
  return deleteAsync([paths.dist.base]);
}

const buildTasks = gulp.series(clean, generateIndexScss, gulp.parallel(compileSass, compileJs, processHtml, processPhp, copyImages, generateWebp, copyVideos));

exports.default = gulp.series(buildTasks, serve, watchFiles);
exports.build = buildTasks;
