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
  goatcounterCode: "mknphysics",

  // ↓↓↓ リンク集（メニューの「リンク集」）↓↓↓
  // 1つのリンク = { name: "大学名", nameEn: "英語名", url: "URL", note: "ひとこと", noteEn: "英語のひとこと" }
  // 足したいときは { … }, の行をコピーして書きかえるだけ。グループ（見出し）も同じようにコピーで増やせます。
  links: [
    {
      group: "旧帝大", groupEn: "Former Imperial Universities",
      items: [
        { name: "北海道大学", nameEn: "Hokkaido University", url: "https://www.hokudai.ac.jp/admission/faculty/general/R8examanswer.html", note: "一般選抜の試験問題・正解・解答例（令和8年度）", noteEn: "General admission: questions and answers (2026)" },
        { name: "東北大学", nameEn: "Tohoku University", url: "https://www.tnc.tohoku.ac.jp/kakomon.php", note: "アドミッション機構の過去問ページ", noteEn: "Past exams (Admission Center)" },
        { name: "東京大学", nameEn: "The University of Tokyo", url: "https://www.u-tokyo.ac.jp/ja/admissions/undergraduate/e01_04.html", note: "これまでの試験問題・解答等の公表", noteEn: "Past questions and answers" },
        { name: "名古屋大学", nameEn: "Nagoya University", url: "https://www.nagoya-u.ac.jp/admissions/exam/data/answer/index.html", note: "試験問題・解答例等", noteEn: "Questions and model answers" },
        { name: "京都大学", nameEn: "Kyoto University", url: "https://www.kyoto-u.ac.jp/ja/admissions/undergrad/past-eq/r8-eq", note: "試験問題・解答例・出題意図（令和8年度）", noteEn: "Questions, answers and aims (2026)" },
        { name: "大阪大学", nameEn: "Osaka University", url: "https://www.osaka-u.ac.jp/ja/admissions/faculty/admission/official.html", note: "過去入試問題の公表状況一覧", noteEn: "List of published past exams" },
      ],
    },
    {
      group: "その他の大学", groupEn: "Other universities",
      items: [
        { name: "東京科学大学（旧 東京工業大学）", nameEn: "Institute of Science Tokyo (formerly Tokyo Tech)", url: "https://admissions.isct.ac.jp/ja/013/undergraduate/examination-questions", note: "過去の入試問題・出題の意図等", noteEn: "Past questions and their aims" },
        { name: "一橋大学", nameEn: "Hitotsubashi University", url: "https://juken.hit-u.ac.jp/admission/info/ito_26.html", note: "入試問題・出題の意図等（令和8年度）", noteEn: "Questions and their aims (2026)" },
        { name: "千葉大学", nameEn: "Chiba University", url: "https://www.chiba-u.jp/admissions/gakubu/past-eq/r8zenki.html", note: "一般選抜（前期日程）過去問題（令和8年度）", noteEn: "General admission (first stage) past questions (2026)" },
        { name: "神戸大学", nameEn: "Kobe University", url: "https://www.office.kobe-u.ac.jp/stdnt-examinavi/juken/past_exam/", note: "過年度入試問題", noteEn: "Past exam questions" },
      ],
    },
  ],

  // フッターに表示する文字
  footerText: "© 物理のHP",

  // ↓↓↓ 英語表示（右上の「EN」ボタン）のときに使う文字 ↓↓↓
  siteTitleEn: "Physics HP",
  heroTitleEn: "See physics in motion.\nTest it with past exams.",
  heroTextEn: "From mechanics to atomic physics: animations and studies of university entrance exam problems. If anything is unclear, ask in the Q&A box.",
  footerTextEn: "© Physics HP",
};
