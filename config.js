// =============================================
//  設定ファイル（ここだけ書きかえればOK）
// =============================================
const CONFIG = {
  // サイトの名前（ページ左上とタブに表示されます）
  siteTitle: "物理のHP",

  // トップページの大きな見出しと説明
  heroTitle: "動きで分かる物理。\n過去問で確かめる物理。",
  heroText: "力学から原子まで、アニメーションと大学入試の過去問研究をまとめています。わからないところは質問箱からどうぞ。",

  // ↓↓↓ Googleスプレッドシートを「ウェブに公開（CSV）」したURL ↓↓↓
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQc0YLa2m16LuWB4iHzAj3BDn2nthRvx7Bm7GwQcZsVfzEyHlWSDk2GLQsEhIqsmI9VdMXOMPoX6B70/pub?gid=1816583427&single=true&output=csv",

  // ↓↓↓ 質問箱：Apps Scriptを「ウェブアプリ」としてデプロイしたURLを貼ります ↓↓↓
  // 空のままだと「準備中」と表示されます。（やり方は 使い方ガイド.md の「質問箱」）
  questionUrl: "https://script.google.com/macros/s/AKfycbzTRMAtQgEXKkmxsSEvKpAjhOmPvIidU2UEJ8Z5sslN5gSkRO6vfw96nw0YQoX22LEc/exec",

  // アニメーション集の分野（この順番で並びます）
  categories: ["力学", "電磁気学", "熱力学", "波動", "原子"],

  // ↓↓↓ パスワード：パスワードそのものではなく「SHA-256」という方式で変換した値を入れます ↓↓↓
  // 空にするとパスワード画面が出なくなります。変えたいときはClaudeに新しいパスワードを伝えてください。
  passwordHash: "1be2e452b46d7a0d9656bbb1f768e8248eba1b75baed65f5d99eafa948899a6a",

  // ↓↓↓ 訪問者数：GoatCounter（無料）に登録したときの「コード名」（例："mknphysics"）↓↓↓
  // 空のままだと数えません。
  goatcounterCode: "",

  // フッターに表示する文字
  footerText: "© 物理のHP",
};
