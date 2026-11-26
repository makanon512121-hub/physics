// =============================================
//  サイトの動き（ふだんは触らなくてOK）
// =============================================

// スプレッドシートの見出し名 → プログラム内の名前
const COLUMNS = {
  title: ["タイトル", "title"],
  category: ["分野", "category"],
  type: ["種類", "type"],
  youtube: ["YouTube", "youtube", "動画", "動画URL"],
  university: ["大学", "university"],
  year: ["年", "年度", "year"],
  image: ["画像", "image"],
  pdf: ["PDF", "pdf"],
  description: ["説明", "description"],
  updated: ["更新日時", "更新日", "updated"],
  links: ["リンク", "link", "links"],
  tags: ["タグ", "tags"],
  solution: ["解答解説", "解答・解説", "solution"],
};
// 英語表示のときに使う列（なくてもOK）：「タイトル_en」のように、見出しの後ろに _en をつけた列
const EN_KEYS = ["title", "category", "type", "university", "description", "links", "tags"];

// 分野の書き方のゆれをそろえる（「電磁気」と書いても「電磁気学」に入ります）
const CATEGORY_ALIAS = {
  "電磁気": "電磁気学", "電磁": "電磁気学", "電気": "電磁気学", "磁気": "電磁気学",
  "熱": "熱力学", "熱学": "熱力学",
  "波": "波動", "光": "波動", "音": "波動",
  "原子物理": "原子", "原子物理学": "原子", "量子": "原子", "原子核": "原子",
};

// 分野ごとの色とアイコン
const ICONS = {
  "力学": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 40 C 14 8, 30 8, 42 40" stroke-dasharray="1 6"/><circle cx="31" cy="17" r="5" fill="currentColor" stroke="none"/><path d="M4 42h40"/></svg>`,
  "電磁気学": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M27 4 12 27h11l-3 17 16-24H25z" fill="currentColor" fill-opacity=".15"/></svg>`,
  "熱力学": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 44c-8 0-13-6-13-13 0-9 9-12 9-24 6 4 9 9 9 15 2-2 3-4 3-7 5 4 6 10 6 16 0 7-6 13-14 13z" fill="currentColor" fill-opacity=".15"/></svg>`,
  "波動": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M3 24c4-12 8-12 12 0s8 12 12 0 8-12 12 0 6 8 6 8"/><path d="M3 36c4-6 8-6 12 0s8 6 12 0 8-6 12 0" opacity=".4"/></svg>`,
  "原子": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5"><ellipse cx="24" cy="24" rx="20" ry="8"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-60 24 24)"/><circle cx="24" cy="24" r="4" fill="currentColor"/></svg>`,
  "other": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="16"/><path d="M24 14v20M14 24h20" stroke-linecap="round"/></svg>`,
};
const COLORS = { "力学": "#3b82f6", "電磁気学": "#8b5cf6", "熱力学": "#f97316", "波動": "#14b8a6", "原子": "#ec4899" };
const EXTRA_COLORS = ["#0ea5e9", "#84cc16", "#eab308", "#f43f5e", "#6366f1"];

const ENTRY_ICONS = {
  exams: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h11l5 5v11H4z"/><path d="M14 4v6h6M8 13h8M8 17h5"/></svg>`,
  anime: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>`,
  ask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5M12 16.5h.01"/></svg>`,
  diary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4M8 13h3M8 17h6"/></svg>`,
};
const PLAY = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 1.5v13L14 8z"/></svg>`;

const data = { items: [], loaded: false, error: false, commitTime: null, changelog: [] };
const $ = (id) => document.getElementById(id);
// 保存場所の名前など（最初のページ表示より前に決めておく）
const WORD_KEY = "physics-hp-word";
const DIARY_KEY = "physics-hp-diary";
const ADMIN_KEY = "physics-hp-admin";
const MAX_IMGS = 10;
const SEEN_KEY = "physics-hp-diary-seen"; // この端末で最後に見た日記の更新時刻
const GLOW_HOURS = 6; // 日記を更新してから何時間「日記」を光らせるか
const diaryCal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: "" }; // 日記のカレンダー（表示中の月・選んだ日）

// ---------- 言語（日本語 / English） ----------
const LANG_KEY = "physics-hp-lang";
let lang = "ja";
try { if (localStorage.getItem(LANG_KEY) === "en") lang = "en"; } catch (e) {}
const en = () => lang === "en";
const L = (ja, english) => (en() ? english : ja); // 日本語と英語のどちらかを返す

const NAV_TEXT = {
  exams: ["過去問研究", "Past Exams"], anime: ["アニメーション集", "Animations"],
  ask: ["質問箱", "Q&A"], updates: ["更新内容", "Updates"], links: ["リンク集", "Links"], diary: ["日記", "Diary"],
  admin: ["管理", "Admin"],
};
const CATEGORY_EN = { "力学": "Mechanics", "電磁気学": "Electromagnetism", "熱力学": "Thermodynamics", "波動": "Waves", "原子": "Atomic Physics", "その他": "Other" };
const GRADE_EN = { "中1": "Junior high 1", "中2": "Junior high 2", "中3": "Junior high 3", "高1": "High school 1", "高2": "High school 2", "高3": "High school 3", "浪人": "Gap year (rōnin)", "社会人": "Working adult", "その他": "Other" };

// 表示用の名前（データやURLは日本語のまま）
function catName(name) {
  if (!en()) return name;
  const it = data.items.find((i) => i.category === name && i.en.category);
  return CATEGORY_EN[name] || (it && it.en.category) || name;
}
function uniName(name) {
  if (!en()) return name;
  if (name === "その他") return "Other";
  const it = data.items.find((i) => i.university === name && i.en.university);
  return (it && it.en.university) || name;
}
function tagName(tag) {
  if (!en()) return tag;
  for (const i of data.items) { const k = i.tagList.indexOf(tag); if (k >= 0 && i.en.tagList[k]) return i.en.tagList[k]; }
  return tag;
}
const yearName = (y) => (y === "年なし" ? L(y, "No year") : /^\d+$/.test(y) ? L(`${y}年`, y) : y);
const tx = (item, key) => (en() && item.en[key]) || item[key]; // 記事の文字：英語列があれば英語
const TYPE_EN = { "入試問題": "Entrance exam", "過去問": "Past exam", "解説": "Explanation", "動画": "Video", "演習": "Practice" };
const typeName = (item) => (en() && (item.en.type || TYPE_EN[item.type])) || item.type;

function setLang(next) {
  lang = next;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  applyLang();
  route();
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = L(CONFIG.siteTitle, CONFIG.siteTitleEn || CONFIG.siteTitle);
  $("logo-text").textContent = document.title;
  $("footer-text").textContent = L(CONFIG.footerText, CONFIG.footerTextEn || CONFIG.footerText);
  document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = L(...NAV_TEXT[el.dataset.t]); });
  const btn = $("lang-btn");
  btn.textContent = L("EN", "日本語");
  btn.title = L("Switch to English", "日本語に切りかえる");
  $("modal-close").setAttribute("aria-label", L("閉じる", "Close"));
  showVisitors();
}

// ---------- 起動 ----------
$("lang-btn").addEventListener("click", () => setLang(en() ? "ja" : "en"));
applyLang();
window.addEventListener("hashchange", route);
route();
load();
loadTodayWord();
loadCommitTime();
setupCounter();

async function load() {
  loadChangelog();
  const url = (CONFIG.sheetCsvUrl || "").trim() || "sample-data.csv";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("HTML instead of CSV");
    data.items = toItems(parseCSV(text));
  } catch (e) {
    console.error(e);
    data.error = true;
  }
  data.loaded = true;
  route();
}

// ---------- CSVを読む ----------
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

function toItems(rows) {
  const header = rows[0].map((h) => h.trim());
  const index = {};
  for (const [key, names] of Object.entries(COLUMNS)) {
    index[key] = header.findIndex((h) => names.some((n) => n.toLowerCase() === h.toLowerCase()));
  }
  const enIndex = {};
  for (const key of EN_KEYS) {
    enIndex[key] = header.findIndex((h) => COLUMNS[key].some((n) => [n + "_en", n + "（英語）", n + "(英語)"].includes(h.toLowerCase())));
  }
  return rows.slice(1)
    .map((r, n) => {
      const item = { order: n };
      for (const key in index) item[key] = index[key] >= 0 ? (r[index[key]] || "").trim() : "";
      item.en = {};
      for (const key in enIndex) item.en[key] = enIndex[key] >= 0 ? (r[enIndex[key]] || "").trim() : "";
      item.category = CATEGORY_ALIAS[item.category] || item.category;
      item.videoId = youtubeId(item.youtube);
      // 大学名が入っている、または種類に「入試」「過去問」がある行 → 過去問研究
      item.updatedAt = parseDate(item.updated);
      item.isExam = !!item.university || /入試|過去問/.test(item.type);
      // 種類が「アニメーション」なら、大学名があってもアニメーション集にも出す
      item.isAnime = /アニメ/.test(item.type) || !item.isExam;
      item.linkList = parseLinks(item.links);
      // 「タグ」列：「中２、理科１」のように区切って書く（分野と同じタグは省く）
      // 英語のタグ（タグ_en）は日本語のタグと同じ順番で書く（英語はカンマ区切り）
      const jaTags = String(item.tags || "").split(/[、,，\s]+/).map((t) => t.trim());
      const enTags = String(item.en.tags || "").split(/[、,，]+/).map((t) => t.trim());
      item.tagList = []; item.en.tagList = [];
      jaTags.forEach((t, k) => {
        if (!t || t === item.category || item.tagList.includes(t)) return;
        item.tagList.push(t); item.en.tagList.push(enTags[k] || "");
      });
      item.en.linkList = parseLinks(item.en.links);
      return item;
    })
    .filter((item) => item.title);
}

// 「リンク」列を読む：1行に1つ「表示名 URL」（セル内改行は Alt+Enter）。「、」「;」区切りもOK
function parseLinks(text) {
  return String(text || "").split(/\n|、|;/).map((part, n) => {
    const m = part.match(/(https?:\/\/\S+|[^\s]+\.html?(?:[?#]\S*)?)/);
    if (!m) return null;
    const label = part.replace(m[0], "").replace(/[|｜:：]/g, " ").trim();
    return { url: m[0], label, n: n + 1 };
  }).filter(Boolean);
}

// YouTubeのURLから動画IDを取り出す（watch?v= / youtu.be / shorts / embed / live / IDだけ、どれでもOK）
function youtubeId(text) {
  if (!text) return "";
  if (/^[\w-]{11}$/.test(text)) return text;
  const m = text.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/|\/v\/)([\w-]{11})/);
  return m ? m[1] : "";
}

// Googleドライブの共有リンクを、画像として表示できる形に変える
function imageUrl(url) {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200` : url;
}

// ---------- ページの切りかえ ----------
// #home / #exams / #exams/大学名 / #anime / #anime/分野 / #ask
function route() {
  const [page, ...rest] = decodeURIComponent(location.hash.slice(1)).split("/");
  const arg = rest.join("/");
  if (!$("modal").hidden) closeModal();
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === page));
  const view = $("view");
  if (page === "exams") view.innerHTML = examsPage(arg);
  else if (page === "anime" && arg) view.innerHTML = animeCategoryPage(arg);
  else if (page === "anime") view.innerHTML = animePage();
  else if (page === "ask") { view.innerHTML = askPage(); bindAsk(); }
  else if (page === "updates") view.innerHTML = updatesPage();
  else if (page === "links") view.innerHTML = linksPage();
  else if (page === "diary") { view.innerHTML = diaryPage(); loadDiary(); }
  else if (page === "admin") { view.innerHTML = adminPage(); bindAdmin(); }
  else view.innerHTML = homePage();
  bindCards(view);
  const heroAnim = view.querySelector(".hero-anim");
  if (heroAnim && typeof HeroAnim !== "undefined") HeroAnim.mount(heroAnim);
  const ys = $("year-select");
  if (ys) ys.addEventListener("change", () => {
    const u = ys.dataset.uni, y = ys.value;
    location.hash = y ? `#exams/${encodeURIComponent(u)}/${encodeURIComponent(y)}` : u ? `#exams/${encodeURIComponent(u)}` : "#exams";
  });
  showLastUpdated();
  applyDiaryGlow();
  if (!route.first) route.first = true; else window.scrollTo({ top: 0 });
}

function loadingOr(html) {
  if (!data.loaded) return `<p class="status">${L("読み込み中…", "Loading…")}</p>`;
  if (data.error) return errorHtml();
  return html;
}

function errorHtml() {
  return `<p class="notice ng">${L("データを読み込めませんでした。config.js のURLが「CSV形式でウェブに公開」したものか確認してください。",
    "Could not load the data. Please try again later.")}</p>`;
}

// ---------- トップ ----------
function homePage() {
  const animes = data.items.filter((i) => i.isAnime);
  const exams = data.items.filter((i) => i.isExam);
  // 新着：更新日時があれば新しい順、なければシートの下の行から
  const latest = [...data.items].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0) || b.order - a.order).slice(0, 6);
  const unis = new Set(exams.map((i) => i.university).filter(Boolean));
  const heroTitle = en()
    ? esc(CONFIG.heroTitleEn || CONFIG.heroTitle).replace(/(physics)/i, '<span class="grad">$1</span>')
    : esc(CONFIG.heroTitle).replace(/(物理)/, '<span class="grad">$1</span>');
  return `
  <section class="hero">
    <div class="wrap">
      ${todayWordHtml()}
      <span class="eyebrow">Physics Lab</span>
      <h1>${heroTitle}</h1>
      <p>${esc(L(CONFIG.heroText, CONFIG.heroTextEn || CONFIG.heroText))}</p>
      ${lastUpdatedHtml()}
    </div>
    <div class="hero-anim">
      <canvas tabindex="0" role="button" aria-label="${L("アニメーションを切りかえる", "Switch animation")}"></canvas>
    </div>
  </section>
  <div class="wrap">
    <div class="entries">
      <a class="entry" href="#exams">
        <span class="entry-icon">${ENTRY_ICONS.exams}</span>
        <h2>${L(...NAV_TEXT.exams)}</h2>
        <p>${L("大学ごとに入試問題を研究。年の新しい順に並んでいます。", "Entrance exam problems by university, newest year first.")}</p>
        <span class="more">${data.loaded ? L(`${unis.size}大学・${exams.length}問`, `${unis.size} universities · ${exams.length} problems`) : L("見る", "View")} →</span>
      </a>
      <a class="entry" href="#anime">
        <span class="entry-icon">${ENTRY_ICONS.anime}</span>
        <h2>${L(...NAV_TEXT.anime)}</h2>
        <p>${L("力学・電磁気学・熱力学・波動・原子の5分野から選べます。", "Choose from five fields: mechanics, electromagnetism, thermodynamics, waves and atomic physics.")}</p>
        <span class="more">${data.loaded ? L(`${animes.length}本`, `${animes.length} animations`) : L("見る", "View")} →</span>
      </a>
      <a class="entry" href="#ask">
        <span class="entry-icon">${ENTRY_ICONS.ask}</span>
        <h2>${L(...NAV_TEXT.ask)}</h2>
        <p>${L("わからないところを気軽に質問してください。", "Feel free to ask about anything you don't understand.")}</p>
        <span class="more">${L("質問する", "Ask a question")} →</span>
      </a>
      <a class="entry" href="#diary">
        <span class="entry-icon">${ENTRY_ICONS.diary}</span>
        <h2>${L(...NAV_TEXT.diary)}</h2>
        <p>${L("日々のできごとや、サイトづくりのメモ。カレンダーから日付で探せます。", "Everyday notes and notes on building this site. Find entries by date on the calendar.")}</p>
        <span class="more">${(diaryEntries() || []).length ? L(`${diaryEntries().length}件`, `${diaryEntries().length} entries`) : L("読む", "Read")} →</span>
      </a>
    </div>
  </div>
  <section class="section">
    <div class="wrap">
      <div class="section-title"><h2>${L("新着", "Latest")}</h2></div>
      ${loadingOr(latest.length ? `<div class="grid">${latest.map((i) => card(i)).join("")}</div>` : `<p class="empty">${L("まだ記事がありません。", "Nothing here yet.")}</p>`)}
    </div>
  </section>`;
}

// 日記が更新されてから6時間は、メニューとトップの「日記」を光らせる（日記ページを一度見たら消える）
function applyDiaryGlow() {
  const t = data.diaryUpdated || 0;
  let seen = 0;
  try { seen = +localStorage.getItem(SEEN_KEY) || 0; } catch (e) {}
  if (t && location.hash.slice(1).split("/")[0] === "diary" && seen < t) {
    seen = t;
    try { localStorage.setItem(SEEN_KEY, String(t)); } catch (e) {}
  }
  const left = t + GLOW_HOURS * 3600e3 - Date.now(), on = !!t && left > 0 && seen < t;
  document.querySelectorAll('[data-nav="diary"], .entry[href="#diary"]').forEach((el) => el.classList.toggle("glow", on));
  clearTimeout(applyDiaryGlow.timer);
  if (on) applyDiaryGlow.timer = setTimeout(applyDiaryGlow, Math.min(left + 1000, 2 ** 31 - 1));
}

// 今日の一言：管理ページで書いたもの（Apps Script に保存）→ なければ config.js の todayWord
function currentWord() {
  let w = data.todayWord;
  if (!w) { try { w = JSON.parse(localStorage.getItem(WORD_KEY) || "null"); } catch (e) { w = null; } }
  if (!w || typeof w.word !== "string") w = { word: CONFIG.todayWord || "", wordEn: CONFIG.todayWordEn || "" };
  return w;
}
async function loadTodayWord() {
  const url = (CONFIG.questionUrl || "").trim();
  if (!url) return;
  try {
    // gate.js がもう読みに行っていれば、それを使い回す
    const j = (window.SITE_INFO && await window.SITE_INFO) || await (await fetch(url, { cache: "no-store" })).json();
    if (j && j.diaryUpdated) { data.diaryUpdated = +j.diaryUpdated; applyDiaryGlow(); }
    if (!j || typeof j.word !== "string") return; // まだ一度も書いていない → config.js のまま
    setTodayWord({ word: j.word, wordEn: j.wordEn || "" });
  } catch (e) { /* 読めなければ config.js のまま */ }
}
function setTodayWord(w) {
  data.todayWord = w;
  try { localStorage.setItem(WORD_KEY, JSON.stringify(w)); } catch (e) {}
  const el = document.querySelector(".hero .today-word"), html = todayWordHtml();
  if (el) { if (html) el.outerHTML = html; else el.remove(); }
  else if (html) { const eb = document.querySelector(".hero .eyebrow"); if (eb) eb.insertAdjacentHTML("beforebegin", html); }
}

function todayWordHtml() {
  const cw = currentWord();
  const w = String(L(cw.word || "", cw.wordEn || cw.word || "")).trim();
  return w ? `<p class="today-word"><button type="button" class="today-label" data-word-log>${L("今日の一言", "Today's note")}</button><span>${esc(w)}</span></p>` : "";
}

// （隠し要素）「今日の一言」を押すと、これまでの一言が新しい順に出る
document.addEventListener("click", (e) => { if (e.target.closest("[data-word-log]")) openWordLog(); });
function wordTime(t) {
  const m = String(t || "").match(/^(\d{4})\D(\d{1,2})\D(\d{1,2})(?:\D+(\d{1,2}):(\d{2}))?/);
  if (!m) return esc(t || "");
  const d = new Date(Date.UTC(+m[1], m[2] - 1, +m[3], (+m[4] || 0) - 9, +m[5] || 0)); // 日本時間として読む
  const min = Math.floor((Date.now() - d) / 60000);
  if (m[4] && min >= 0 && min < 60) return L(`${Math.max(1, min)}分前`, `${Math.max(1, min)}m`);
  if (m[4] && min >= 0 && min < 1440) return L(`${Math.floor(min / 60)}時間前`, `${Math.floor(min / 60)}h`);
  const time = m[4] ? ` ${m[4].padStart(2, "0")}:${m[5]}` : "";
  return L(`${+m[1]}年${+m[2]}月${+m[3]}日${time}`, `${MONTHS[m[2] - 1]} ${+m[3]}, ${m[1]}${time}`);
}
async function openWordLog() {
  let box = $("word-log");
  if (!box) {
    box = document.createElement("div");
    box.id = "word-log"; box.className = "word-log"; box.hidden = true;
    box.innerHTML = `<div class="word-log-bg" data-wl-close></div><div class="word-log-box" role="dialog" aria-modal="true" aria-labelledby="word-log-h">
      <div class="word-log-head"><h2 id="word-log-h"></h2><button type="button" class="word-log-x" data-wl-close>×</button></div>
      <div class="word-log-list"></div></div>`;
    document.body.appendChild(box);
    box.addEventListener("click", (e) => { if (e.target.closest("[data-wl-close]")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
    function close() { box.hidden = true; document.body.style.overflow = ""; }
  }
  box.querySelector("h2").textContent = L("これまでの一言", "Past notes");
  box.querySelector(".word-log-x").setAttribute("aria-label", L("閉じる", "Close"));
  const list = box.querySelector(".word-log-list");
  list.innerHTML = `<p class="status">${L("読み込み中…", "Loading…")}</p>`;
  box.hidden = false; document.body.style.overflow = "hidden";
  let words = null;
  try {
    const url = CONFIG.questionUrl.trim();
    const j = await (await fetch(url + (url.includes("?") ? "&" : "?") + "words=1", { cache: "no-store" })).json();
    if (Array.isArray(j.words)) words = j.words;
    else if (typeof j.word === "string" && j.word) words = [{ time: j.updated || "", word: j.word, wordEn: j.wordEn || "" }]; // 記録がまだない古い Apps Script
  } catch (e) {}
  if (!words) { const cw = currentWord(); words = cw.word ? [{ time: "", word: cw.word, wordEn: cw.wordEn || "" }] : []; }
  const name = esc(L(CONFIG.siteTitle, CONFIG.siteTitleEn || CONFIG.siteTitle));
  list.innerHTML = words.length ? words.map((w, i) => `<article class="word-post${i === 0 ? " now" : ""}">
      <span class="word-ava" aria-hidden="true">Φ</span>
      <div class="word-main"><div class="word-meta"><b>${name}</b>${w.time ? `<span>· <time>${wordTime(w.time)}</time></span>` : ""}${i === 0 ? `<span class="word-now">${L("いまの一言", "Current")}</span>` : ""}</div>
        <p>${esc(L(w.word, w.wordEn || w.word))}</p></div></article>`).join("")
    : `<p class="empty">${L("まだ一言がありません。", "No notes yet.")}</p>`;
}

function pageHead(eyebrow, title, text, crumb) {
  return `<header class="page-head"><div class="wrap">
    ${crumb ? `<a class="crumb" href="${crumb.href}">← ${esc(crumb.label)}</a><br>` : ""}
    <span class="eyebrow">${eyebrow}</span>
    <h1>${esc(title)}</h1>
    ${text ? `<p>${esc(text)}</p>` : ""}
  </div></header>`;
}

// ---------- 過去問研究 ----------
// #exams / #exams/大学名 / #exams/大学名/年
function examsPage(arg) {
  const exams = data.items.filter((i) => i.isExam);
  const uniOf = (i) => i.university || "その他";
  const yearOf = (i) => i.year || "年なし";
  const [selUni = "", selYear = ""] = (arg || "").split("/");
  const unis = [...new Set(exams.map(uniOf))];
  const uni = unis.includes(selUni) ? selUni : "";
  const inUni = exams.filter((i) => !uni || uniOf(i) === uni);
  const years = [...new Set(inUni.map(yearOf))].sort((a, b) => (parseInt(b) || -1) - (parseInt(a) || -1));
  const year = years.includes(selYear) ? selYear : "";
  const list = inUni.filter((i) => !year || yearOf(i) === year);
  const href = (u, y) => (y ? `#exams/${encodeURIComponent(u)}/${encodeURIComponent(y)}` : u ? `#exams/${encodeURIComponent(u)}` : "#exams");

  // 大学のタブ
  const uniTabs = ["", ...unis].map((u) => {
    const n = u ? exams.filter((i) => uniOf(i) === u).length : exams.length;
    return `<button class="tab" role="tab" aria-selected="${u === uni}" data-href="${href(u)}">${esc(u ? uniName(u) : L("すべて", "All"))}<span class="count">${n}</span></button>`;
  }).join("");

  // 年のプルダウン（ドロップダウン）
  const yearTabs = years.length ? `<div class="year-picker">
    <label for="year-select">${L("表示年：", "Year:")}</label>
    <select id="year-select" data-uni="${esc(uni)}">
      <option value="">${L("すべて", "All")}</option>
      ${years.map((y) => `<option value="${esc(y)}"${y === year ? " selected" : ""}>${esc(y === "年なし" ? yearName(y) : y)}</option>`).join("")}
    </select>
    ${L("<span>年</span>", "")}
    <span class="count">${L(`${list.length} 問`, `${list.length} problem${list.length === 1 ? "" : "s"}`)}</span>
  </div>` : "";

  // 年ごとにまとめる（新しい年が上）
  const groups = years.filter((y) => !year || y === year).map((y) => `
    <div class="year-group">
      <h3 class="year-label">${esc(yearName(y))}</h3>
      <div class="grid">${list.filter((i) => yearOf(i) === y).map((i) => card(i, !!uni)).join("")}</div>
    </div>`).join("");

  return pageHead("Past Exams", L(...NAV_TEXT.exams), L("大学名のタブを押すと、その大学の問題だけが表示されます。", "Tap a university tab to show only that university's problems.")) + `
  <section class="section"><div class="wrap">
    ${loadingOr(exams.length
      ? `<div class="tabs" role="tablist">${uniTabs}</div>${yearTabs}${groups}`
      : `<p class="empty">${L("まだ過去問がありません。スプレッドシートの「大学」列に大学名を入れると、ここに表示されます。", "No past exams yet.")}</p>`)}
  </div></section>`;
}

// ---------- アニメーション集 ----------
function animeCategories() {
  const animes = data.items.filter((i) => i.isAnime);
  const cats = [...CONFIG.categories];
  for (const i of animes) if (i.category && !cats.includes(i.category)) cats.push(i.category);
  return cats.map((name, n) => ({
    name,
    color: COLORS[name] || EXTRA_COLORS[n % EXTRA_COLORS.length],
    icon: ICONS[name] || ICONS.other,
    items: animes.filter((i) => i.category === name),
  }));
}

function catTile(c, small) {
  return `<a class="cat${small ? " small" : ""}" style="--c:${c.color}" href="#anime/${encodeURIComponent(c.name)}">
    <span class="cat-icon">${c.icon}</span>
    <h3>${esc(catName(c.name))}</h3>
    ${small ? "" : `<span class="num">${data.loaded ? L(`${c.items.length} 本`, `${c.items.length} item${c.items.length === 1 ? "" : "s"}`) : ""}</span>`}
  </a>`;
}

function animePage() {
  return pageHead("Animations", L(...NAV_TEXT.anime), L("分野を選ぶと、その分野のアニメーションが一覧で見られます。", "Choose a field to see its animations.")) + `
  <section class="section"><div class="wrap">
    ${data.error ? errorHtml() : ""}
    <div class="cats">${animeCategories().map((c) => catTile(c)).join("")}</div>
  </div></section>`;
}

// #anime/分野 / #anime/分野/タグ
function animeCategoryPage(arg) {
  const [name, selTag = ""] = arg.split("/");
  const cats = animeCategories();
  const c = cats.find((x) => x.name === name) || { name, color: "#64748b", icon: ICONS.other, items: [] };
  const others = cats.filter((x) => x.name !== name);
  const tags = [...new Set(c.items.flatMap((i) => i.tagList))];
  const tag = tags.includes(selTag) ? selTag : "";
  const list = c.items.filter((i) => !tag || i.tagList.includes(tag));
  const base = "#anime/" + encodeURIComponent(c.name);
  const chips = tags.length ? `<div class="tag-filter">${["", ...tags].map((t) =>
    `<button class="subtab" aria-pressed="${t === tag}" data-href="${t ? base + "/" + encodeURIComponent(t) : base}">${esc(t ? tagName(t) : L("すべて", "All"))}<span class="count">${t ? c.items.filter((i) => i.tagList.includes(t)).length : c.items.length}</span></button>`
  ).join("")}</div>` : "";
  return pageHead("Animations", catName(c.name), "", { href: "#anime", label: L(...NAV_TEXT.anime) }) + `
  <section class="section"><div class="wrap">
    ${loadingOr(c.items.length
      ? `${chips}<div class="grid">${list.map((i) => card(i)).join("")}</div>`
      : `<p class="empty">${L(`「${esc(c.name)}」のアニメーションはまだありません。`, `No animations in ${esc(catName(c.name))} yet.`)}</p>`)}
    <div class="section-title" style="margin-top:56px"><h2>${L("ほかの分野", "Other fields")}</h2></div>
    <div class="cats">${others.map((x) => catTile(x, true)).join("")}</div>
  </div></section>`;
}

// ---------- 質問箱 ----------
function askPage() {
  const GRADES = ["中1", "中2", "中3", "高1", "高2", "高3", "浪人", "社会人", "その他"];
  const cats = [...CONFIG.categories, "その他"];
  const ready = !!(CONFIG.questionUrl || "").trim();
  // data-label：スプレッドシートとメールに使う項目名（英語表示でも日本語のまま送ります）
  const lab = (id, ja, english, extra = "") => `<label for="${id}">${L(ja, english)}${extra}</label>`;
  const req = `<span class="req">${L("必須", "Required")}</span>`;
  const opt = (ja, english) => `<span class="opt">${L(ja, english)}</span>`;
  const none = `<option value="なし" selected>${L("なし", "None")}</option>`;
  return pageHead("Q &amp; A", L(...NAV_TEXT.ask), L("物理のわからないところ、過去問の解き方など、なんでも送ってください。", "Send us anything: physics you don't understand, how to solve a past exam problem, and more.")) + `
  <section class="section"><div class="wrap ask-grid">
    <div class="ask-info">
      <h2>${L("質問のコツ", "Tips for asking")}</h2>
      <ul>${L([
        "どの問題か（大学・年・問題番号など）を書いてください。",
        "どこまでわかって、どこでつまずいたかを書くと、答えやすくなります。",
        "返信がほしい場合はメールアドレスを入れてください。",
        "大学入試以外の質問でもOKです。",
      ], [
        "Say which problem it is (university, year, problem number, etc.).",
        "Tell us how far you got and where you got stuck. That makes it easier to answer.",
        "If you would like a reply, enter your email address.",
        "Questions that are not about entrance exams are welcome too.",
      ]).map((t) => `<li>${t}</li>`).join("")}</ul>
    </div>
    <form class="form" id="ask-form" novalidate>
      ${ready ? "" : `<p class="notice info">${L("質問箱は準備中です。", "The Q&A box is not ready yet.")}</p>`}
      <div class="field">${lab("q-name", "お名前", "Name", req + opt("フルネームで", "Full name"))}<input id="q-name" name="name" data-label="お名前" autocomplete="name" required></div>
      <div class="field">${lab("q-grade", "学年", "Grade", req)}<select id="q-grade" name="grade" data-label="学年" required>
        <option value="">${L("選んでください", "Choose")}</option>${GRADES.map((g) => `<option value="${g}">${L(g, GRADE_EN[g])}</option>`).join("")}
      </select></div>
      <div class="field">${lab("q-klass", "組", "Class")}<select id="q-klass" name="klass" data-label="組">
        ${[...Array(10)].map((_, i) => `<option>${i + 1}</option>`).join("")}${none}
      </select></div>
      <div class="field">${lab("q-number", "番号", "Student number")}<select id="q-number" name="number" data-label="番号">
        ${[...Array(45)].map((_, i) => `<option>${i + 1}</option>`).join("")}${none}
      </select></div>
      <div class="field">${lab("q-email", "メールアドレス", "Email", opt("返信がほしい場合", "If you want a reply"))}<input id="q-email" name="email" data-label="メールアドレス" type="email" autocomplete="email"></div>
      <div class="field">${lab("q-cat", "分野", "Field")}<select id="q-cat" name="category" data-label="分野">${cats.map((c) => `<option value="${esc(c)}">${esc(catName(c))}</option>`).join("")}</select></div>
      <div class="field">${lab("q-body", "質問内容", "Question", req)}<textarea id="q-body" name="question" data-label="質問内容" required></textarea></div>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div id="ask-result"></div>
      <div><button class="btn" type="submit" ${ready ? "" : "disabled"}>${L("送信する", "Send")}</button></div>
    </form>
  </div></section>`;
}

function bindAsk() {
  const form = $("ask-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const result = $("ask-result");
    const fd = new FormData(form);
    const missing = [];
    if (!String(fd.get("name") || "").trim()) missing.push(L("お名前", "Name"));
    if (!fd.get("grade")) missing.push(L("学年", "Grade"));
    if (!String(fd.get("question") || "").trim()) missing.push(L("質問内容", "Question"));
    if (missing.length) {
      result.innerHTML = `<p class="notice ng">${L(`${missing.join("・")}を入力してください。`, `Please fill in: ${missing.join(", ")}.`)}</p>`;
      return;
    }
    const btn = form.querySelector("button");
    btn.disabled = true; btn.textContent = L("送信中…", "Sending…");
    try {
      // Apps Script へ送信（相手のサーバーの都合で返事は読めないので、送れたら成功とします）
      // 項目名（ラベル）とメールの件名も一緒に送る → Apps Script 側は項目が増えても書きかえ不要
      const fields = [...form.elements].filter((el) => el.name && el.name !== "website" && el.id)
        .map((el) => [el.name, el.dataset.label || el.name]);
      fd.set("_fields", JSON.stringify(fields));
      const g = (k) => String(fd.get(k) || "").trim();
      const who = [g("grade"), g("klass") && g("klass") !== "なし" ? g("klass") + "組" : "", g("number") && g("number") !== "なし" ? g("number") + "番" : ""].filter(Boolean);
      fd.set("_subject", `${who.length ? who[0] + (who.length > 1 ? " " + who.slice(1).join("") : "") : ""}・${g("category")}：${g("question").replace(/\s+/g, " ").slice(0, 30)}`);
      await fetch(CONFIG.questionUrl, { method: "POST", mode: "no-cors", body: new URLSearchParams(fd) });
      form.reset();
      result.innerHTML = `<p class="notice ok">${L("送信しました。ありがとうございます！", "Sent. Thank you!")}</p>`;
    } catch (err) {
      console.error(err);
      result.innerHTML = `<p class="notice ng">${L("送信できませんでした。時間をおいてもう一度お試しください。", "Could not send. Please try again later.")}</p>`;
    }
    btn.disabled = false; btn.textContent = L("送信する", "Send");
  });
}

// ---------- カード ----------
function colorOf(item) {
  return COLORS[item.category] || "#64748b";
}

function tagsHtml(item, hideUni) {
  const t = [];
  if (item.category) t.push(`<span class="tag">${esc(catName(item.category))}</span>`);
  item.tagList.forEach((tag, k) => t.push(`<span class="tag grade">${esc((en() && item.en.tagList[k]) || tag)}</span>`));
  if (item.type && !/アニメ/.test(item.type)) t.push(`<span class="tag plain">${esc(typeName(item))}</span>`);
  if (item.isExam) {
    if (item.university && !hideUni && !item.tagList.includes(item.university)) t.push(`<span class="tag exam">${esc(tx(item, "university"))}</span>`);
    if (item.year && !item.tagList.includes(item.year + "年") && !item.tagList.includes(item.year)) t.push(`<span class="tag exam">${esc(yearName(item.year))}</span>`);
  }
  return t.join("");
}

// 「リンク」の表示名（英語表示で リンク_en があればそちら）
function linksOf(item) {
  const list = en() && item.en.linkList.length ? item.en.linkList : item.linkList;
  return list.map((l) => ({ url: l.url, label: l.label || L(`リンク${l.n}`, `Link ${l.n}`) }));
}

function card(item, hideUni) {
  let media;
  if (item.videoId) {
    media = `<img class="thumb" loading="lazy" alt="" onerror="this.style.visibility='hidden'" src="https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg"><span class="play">${PLAY}</span>`;
  } else if (item.image) {
    media = `<img class="thumb" loading="lazy" alt="" src="${esc(imageUrl(item.image))}">`;
  } else {
    media = `<span class="placeholder">${ICONS[item.category] || ICONS.other}</span>`;
  }
  if (item.linkList.length) {
    media += `<span class="badge">${linksOf(item).map((l) => esc(l.label)).join(" / ")}</span>`;
  }
  return `<button class="card" style="--c:${colorOf(item)}" data-item="${item.order}">
    <div class="thumb-wrap">${media}</div>
    <div class="card-body">
      <div class="tags">${tagsHtml(item, hideUni === true)}</div>
      <h3 class="card-title">${esc(tx(item, "title"))}</h3>
      <p class="card-desc">${esc(tx(item, "description"))}</p>
      ${item.updatedAt ? `<p class="card-time">${updatedText(item.updatedAt)}</p>` : ""}
    </div>
  </button>`;
}

function bindCards(root) {
  root.querySelectorAll("[data-item]").forEach((el) => {
    el.onclick = () => openModal(data.items.find((i) => i.order === +el.dataset.item));
  });
  root.querySelectorAll("[data-href]").forEach((el) => {
    el.onclick = () => { location.hash = el.dataset.href.replace(/\/$/, ""); };
  });
}

// ---------- 動画ウィンドウ ----------
function openModal(item) {
  let media = "";
  if (item.videoId) {
    media = `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&rel=0"
      title="${esc(tx(item, "title"))}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  } else if (item.image && !item.linkList.length) {
    media = `<img class="modal-img" alt="" src="${esc(imageUrl(item.image))}">`;
  }
  // ボタン：アニメーションを開く（リンク列）＋ 解答解説（「解答解説」列。空なら準備中）
  const newTab = (u) => (/^https?:|\.pdf(?:[?#]|$)/i.test(u) ? ' target="_blank" rel="noopener"' : "");
  let tiles = linksOf(item).map((l) => `
      <a class="choice" href="${esc(l.url)}"${newTab(l.url)}>
        <span class="choice-label">${esc(l.label)}</span><span class="choice-go">${L("開く", "Open")} →</span>
      </a>`).join("");
  if (item.isAnime) {
    tiles += item.solution
      ? `<a class="choice sol" href="${esc(item.solution)}"${newTab(item.solution)}>
        <span class="choice-label">${L("解答解説", "Solution")}</span><span class="choice-go">${L("見る", "View")} →</span></a>`
      : `<div class="choice sol off" aria-disabled="true">
        <span class="choice-label">${L("解答解説", "Solution")}</span><span class="choice-go">${L("準備中", "Coming soon")}</span></div>`;
  }
  if (tiles) media += `<div class="choices${item.videoId ? " below" : ""}">${tiles}</div>`;
  $("modal-media").innerHTML = media;
  $("modal-tags").innerHTML = tagsHtml(item);
  document.querySelector(".modal-box").style.setProperty("--c", colorOf(item));
  $("modal-title").textContent = tx(item, "title");
  $("modal-desc").textContent = tx(item, "description") + (item.updatedAt ? `\n\n${updatedText(item.updatedAt)}` : "");
  const links = [];
  if (item.pdf) links.push(`<a class="btn" href="${esc(item.pdf)}" target="_blank" rel="noopener">${L("問題・解答（PDF）を開く", "Open problem & solution (PDF)")}</a>`);
  if (item.image && item.videoId) links.push(`<a class="btn ghost" href="${esc(item.image)}" target="_blank" rel="noopener">${L("画像を開く", "Open image")}</a>`);
  if (item.videoId) links.push(`<a class="btn ghost" href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener">${L("YouTubeで見る", "Watch on YouTube")}</a>`);
  $("modal-links").innerHTML = links.join("");
  $("modal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("modal").hidden = true;
  $("modal-media").innerHTML = ""; // 動画を止める
  document.body.style.overflow = "";
}
document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("modal").hidden) closeModal(); });

// ---------- 更新日時 ----------
// 「2026/11/22 17:53:00」「2026-11-22 17:53」「2026年11月22日 17時53分」などを読む
function parseDate(text) {
  const m = String(text || "").match(/(\d{4})\D(\d{1,2})\D(\d{1,2})\D*(?:(\d{1,2})\D(\d{1,2}))?/);
  if (!m) return null;
  const d = new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  return isNaN(d) ? null : d;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDay(d) {
  return L(`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`, `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
}
function formatTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}
const formatDate = (d) => `${formatDay(d)} ${formatTime(d)}`;
const updatedText = (d) => L(`${formatDate(d)} 更新`, `Updated ${formatDate(d)}`);

// サイト全体の最終更新：スプレッドシートの更新日時と、GitHubに最後に反映した時刻の新しいほう
function lastUpdated() {
  const times = data.items.map((i) => i.updatedAt).filter(Boolean);
  if (data.commitTime) times.push(data.commitTime);
  for (const e of data.changelog) times.push(e.date);
  return times.length ? new Date(Math.max(...times)) : null;
}

const lastText = (d) => L(`最終更新：${formatDate(d)}`, `Last updated: ${formatDate(d)}`);

function lastUpdatedHtml() {
  const d = lastUpdated();
  return `<a class="last-updated" href="#updates" id="last-updated" ${d ? "" : "hidden"}>${d ? lastText(d) : ""}</a>`;
}

function showLastUpdated() {
  const d = lastUpdated();
  const text = d ? lastText(d) : "";
  const el = $("last-updated");
  if (el && d) { el.hidden = false; el.textContent = text; }
  $("footer-updated").textContent = text;
}

async function loadCommitTime() {
  const m = location.hostname.match(/^([\w-]+)\.github\.io$/);
  if (!m) return;
  const repo = location.pathname.split("/")[1] || `${m[1]}.github.io`;
  try {
    const res = await fetch(`https://api.github.com/repos/${m[1]}/${repo}/commits?per_page=1`);
    if (!res.ok) return;
    const [c] = await res.json();
    data.commitTime = new Date(c.commit.committer.date);
    showLastUpdated();
  } catch (e) { /* 取れなくても表示しないだけ */ }
}

// ---------- 更新内容 ----------
// changelog.csv（日時,内容,リンク）＋ スプレッドシートで「更新日時」が入っている記事
async function loadChangelog() {
  try {
    const res = await fetch("changelog.csv", { cache: "no-store" });
    if (!res.ok) return;
    const rows = parseCSV(await res.text()).slice(1);
    // 4列目「内容_en」があれば英語表示で使う
    data.changelog = rows.map((r) => ({ date: parseDate(r[0]), text: (r[1] || "").trim(), href: (r[2] || "").trim(), textEn: (r[3] || "").trim() }))
      .filter((e) => e.date && e.text);
    if (location.hash.startsWith("#updates")) route();
    showLastUpdated();
  } catch (e) { /* なくても動く */ }
}

function updateEntries() {
  const list = data.changelog.map((e) => ({ ...e, kind: "site" }));
  // 更新履歴に書かれていない記事は、更新日時から自動で載せる
  for (const i of data.items) {
    if (!i.updatedAt || list.some((e) => e.text.includes(i.title))) continue;
    const where = i.isAnime ? i.category || "アニメーション集" : "過去問研究";
    const whereEn = i.isAnime ? (i.category ? catName(i.category) : "Animations") : "Past Exams";
    list.push({ date: i.updatedAt, text: `${where}の「${i.title}」を追加・更新しました。`,
      textEn: `Added or updated "${i.en.title || i.title}" in ${whereEn}.`, item: i.order, kind: "item" });
  }
  return list.sort((a, b) => b.date - a.date);
}

function updatesPage() {
  const list = updateEntries();
  const days = [...new Set(list.map((e) => formatDay(e.date)))];
  const body = days.map((day) => `
    <div class="log-day">
      <h3 class="year-label">${esc(day)}</h3>
      <ul class="log">${list.filter((e) => formatDay(e.date) === day).map((e) => {
        const time = formatTime(e.date);
        const inner = `<span class="log-time">${time}</span><span class="log-text">${esc(L(e.text, e.textEn || e.text))}</span>`;
        if (e.item != null) return `<li><button class="log-link" data-item="${e.item}">${inner}<span class="log-go">${L("見る", "View")} →</span></button></li>`;
        if (e.href) return `<li><a class="log-link" href="${esc(e.href)}">${inner}<span class="log-go">${L("見る", "View")} →</span></a></li>`;
        return `<li><div class="log-link">${inner}</div></li>`;
      }).join("")}</ul>
    </div>`).join("");
  return pageHead("Updates", L(...NAV_TEXT.updates), L("追加した過去問・アニメーションと、新しい機能の一覧です。押すとその場所に移動します。", "New past exams, animations and features. Tap one to go there.")) + `
  <section class="section"><div class="wrap">
    ${loadingOr(list.length ? body : `<p class="empty">${L("まだ更新履歴がありません。", "No updates yet.")}</p>`)}
  </div></section>`;
}

// ---------- リンク集 ----------
// 中身は config.js の links に書きます
function linksPage() {
  const groups = (CONFIG.links || []).map((g) => `
    <div class="log-day">
      <h3 class="year-label">${esc(L(g.group, g.groupEn || g.group))}</h3>
      <ul class="log">${(g.items || []).map((l) => `<li><a class="log-link" href="${esc(l.url)}" target="_blank" rel="noopener">
        <span class="log-text"><strong class="link-name">${esc(L(l.name, l.nameEn || l.name))}${l.info ? `<span class="tag plain link-info">${L("入試情報", "Admission info")}</span>` : ""}</strong>${l.note ? `<span class="link-note">${esc(L(l.note, l.noteEn || l.note))}</span>` : ""}</span>
        <span class="log-go">${L("開く", "Open")} ↗</span></a></li>`).join("")}</ul>
    </div>`).join("");
  return pageHead("Links", L(...NAV_TEXT.links), L("各大学が公式サイトで公開している入試問題（過去問）のページです。押すと新しいタブで開きます。",
    "Official pages where each university publishes its past entrance exams. Links open in a new tab.")) + `
  <section class="section"><div class="wrap">
    ${groups || `<p class="empty">${L("まだリンクがありません。", "No links yet.")}</p>`}
    <p class="link-foot">${L("※ 公開している年度や科目は大学によってちがいます。ページの場所が変わっていたら教えてください。なお、リンクが間違っている場合の責任は一切とれません。不安であれば必ず自分でしっかりと調べてください。",
      "Note: the years and subjects available differ by university. We cannot take any responsibility if a link is wrong. If you are unsure, please check for yourself.")}</p>
  </div></section>`;
}

// ---------- 日記 ----------
// 中身は Apps Script（スプレッドシートの「日記」シート）に保存。書く・直す・消すは「管理」から
function diaryEntries() {
  if (data.diary) return data.diary;
  try { const c = JSON.parse(localStorage.getItem(DIARY_KEY) || "null"); if (Array.isArray(c)) return c; } catch (e) {}
  return null;
}
async function fetchDiary() {
  const url = (CONFIG.questionUrl || "").trim();
  if (!url) return [];
  const res = await fetch(url + (url.includes("?") ? "&" : "?") + "diary=1", { cache: "no-store" });
  const j = await res.json();
  if (!Array.isArray(j.entries)) throw new Error("script");
  return j.entries;
}
function setDiary(list) {
  data.diary = list;
  try { localStorage.setItem(DIARY_KEY, JSON.stringify(list)); } catch (e) {}
}
async function loadDiary() {
  try { setDiary(await fetchDiary()); data.diaryError = false; }
  catch (e) { data.diaryError = true; }
  renderDiary();
}
function diaryDate(d) {
  const m = String(d || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return String(d || "");
  if (en()) return new Date(+m[1], m[2] - 1, +m[3]).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", weekday: "short" });
  const wd = "日月火水木金土"[new Date(+m[1], m[2] - 1, +m[3]).getDay()];
  return `${+m[1]}年${+m[2]}月${+m[3]}日（${wd}）`;
}
// 本文：改行をそのまま出し、URLはリンクにする
function diaryText(text) {
  return esc(text).replace(/https?:\/\/[^\s<"']+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
}
// 日記の画像（Googleドライブに保存した画像のID → 表示用のURL）
function photoUrl(id, w) { return `https://drive.google.com/thumbnail?id=${id}&sz=w${w || 1600}`; }
function photoImg(id, w, cls) {
  // サムネイルが出ないときは別のURLでもう一度
  return `<img${cls ? ` class="${cls}"` : ""} loading="lazy" alt="" src="${photoUrl(id, w)}" referrerpolicy="no-referrer"
    onerror="if(!this.dataset.f){this.dataset.f=1;this.src='https://lh3.googleusercontent.com/d/${id}=w${w || 1600}'}">`;
}
function diaryImages(d) { return (d.images || []).filter((id) => /^[\w-]{10,}$/.test(id)); }
function diaryEntryHtml(d) {
  const title = L(d.title, d.titleEn || d.title), body = L(d.body, d.bodyEn || d.body), imgs = diaryImages(d);
  return `<article class="diary-entry" id="diary-${esc(d.id)}">
      <time class="diary-date" datetime="${esc(d.date)}">${esc(diaryDate(d.date))}</time>
      ${title ? `<h2 class="diary-title">${esc(title)}</h2>` : ""}
      ${body ? `<div class="diary-body">${diaryText(body)}</div>` : ""}
      ${imgs.length ? `<div class="diary-imgs${imgs.length === 1 ? " one" : ""}">${imgs.map((id, i) =>
        `<button class="diary-img" type="button" data-photo="${i}" aria-label="${L("画像を大きく見る", "View larger")}">${photoImg(id, imgs.length === 1 ? 1600 : 800)}</button>`).join("")}</div>` : ""}
    </article>`;
}
function diaryListHtml() {
  const list = diaryEntries();
  if (!list) return data.diaryError ? `<p class="notice ng">${L("日記を読み込めませんでした。時間をおいてもう一度お試しください。", "Could not load the diary. Please try again later.")}</p>`
    : `<p class="status">${L("読み込み中…", "Loading…")}</p>`;
  if (!list.length) return `<p class="empty">${L("まだ日記がありません。", "No diary entries yet.")}</p>`;
  const sel = diaryCal.sel;
  if (sel) {
    const day = list.filter((d) => d.date === sel);
    return `<div class="diary-filter"><span>${L(`${esc(diaryDate(sel))}の日記`, `Entries on ${esc(diaryDate(sel))}`)}</span>
      <button class="btn ghost small" type="button" data-cal-all>${L("すべての日記を見る", "Show all entries")}</button></div>
      <div class="diary-list">${day.length ? day.map(diaryEntryHtml).join("") : `<p class="empty">${L("この日の日記はありません。", "No entries on this day.")}</p>`}</div>`;
  }
  return `<div class="diary-list">${list.map(diaryEntryHtml).join("")}</div>`;
}

// カレンダー：日記のある日に印。押すとその日の日記だけを表示（diaryCal はファイルの最初のほうにあります）
function isoOf(y, m, d) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
function diaryCalHtml() {
  const list = diaryEntries() || [];
  const count = {};
  list.forEach((d) => { count[d.date] = (count[d.date] || 0) + 1; });
  const { y, m, sel } = diaryCal;
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), today = todayIso();
  const week = en() ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] : [..."日月火水木金土"];
  let cells = week.map((w, i) => `<span class="cal-wd${i === 0 ? " sun" : i === 6 ? " sat" : ""}">${w}</span>`).join("");
  for (let i = 0; i < first; i++) cells += `<span></span>`;
  for (let d = 1; d <= days; d++) {
    const iso = isoOf(y, m, d), n = count[iso] || 0, wd = (first + d - 1) % 7;
    const cls = ["cal-day", n ? "has" : "", iso === today ? "today" : "", iso === sel ? "sel" : "", wd === 0 ? "sun" : wd === 6 ? "sat" : ""].filter(Boolean).join(" ");
    cells += n ? `<button type="button" class="${cls}" data-day="${iso}" aria-pressed="${iso === sel}" title="${L(`日記 ${n}件`, `${n} entr${n > 1 ? "ies" : "y"}`)}">${d}</button>`
      : `<span class="${cls}">${d}</span>`;
  }
  const label = en() ? new Date(y, m, 1).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : `${y}年${m + 1}月`;
  return `<div class="cal-head">
      <button type="button" class="cal-nav" data-cal-move="-1" aria-label="${L("前の月", "Previous month")}">‹</button>
      <span class="cal-title">${label}</span>
      <button type="button" class="cal-nav" data-cal-move="1" aria-label="${L("次の月", "Next month")}">›</button>
    </div>
    <div class="cal-grid">${cells}</div>
    ${y !== new Date().getFullYear() || m !== new Date().getMonth() ? `<button type="button" class="cal-today" data-cal-today>${L("今月にもどる", "Back to this month")}</button>` : ""}`;
}
function renderDiary(scroll) {
  const cal = $("diary-cal"), box = $("diary-list");
  if (cal) cal.innerHTML = diaryCalHtml();
  if (box) box.innerHTML = diaryListHtml();
  if (scroll && box && window.innerWidth < 860) box.scrollIntoView({ behavior: "smooth", block: "start" });
}
function diaryPage() {
  return pageHead("Diary", L(...NAV_TEXT.diary), L("日々のできごとや、サイトづくりのメモを書いています。", "Notes on everyday things and on building this site.")) + `
  <section class="section"><div class="wrap diary-layout">
    <aside class="diary-cal" id="diary-cal">${diaryCalHtml()}</aside>
    <div id="diary-list">${diaryListHtml()}</div>
  </div></section>`;
}
// カレンダーと画像のクリック（日記ページ）
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-day],[data-cal-move],[data-cal-today],[data-cal-all],[data-photo]");
  if (!t || !t.closest("#view")) return;
  if (t.dataset.photo != null) {
    const entry = (diaryEntries() || []).find((d) => `diary-${d.id}` === t.closest(".diary-entry").id);
    if (entry) openPhotos(diaryImages(entry), +t.dataset.photo);
    return;
  }
  if (t.dataset.day) { diaryCal.sel = diaryCal.sel === t.dataset.day ? "" : t.dataset.day; return renderDiary(!!diaryCal.sel); }
  if (t.dataset.calMove) {
    const d = new Date(diaryCal.y, diaryCal.m + +t.dataset.calMove, 1);
    diaryCal.y = d.getFullYear(); diaryCal.m = d.getMonth();
  } else if (t.dataset.calToday != null) { diaryCal.y = new Date().getFullYear(); diaryCal.m = new Date().getMonth(); }
  else if (t.dataset.calAll != null) diaryCal.sel = "";
  renderDiary();
});

// 画像を大きく表示（← → で前後の画像、Esc で閉じる）
function openPhotos(ids, i) {
  let box = $("photo-view");
  if (!box) {
    box = document.createElement("div");
    box.id = "photo-view"; box.className = "photo-view"; box.hidden = true;
    box.innerHTML = `<button class="photo-close" type="button" data-pv="x">×</button>
      <button class="photo-nav prev" type="button" data-pv="-1">‹</button><div class="photo-stage"></div>
      <button class="photo-nav next" type="button" data-pv="1">›</button><span class="photo-count"></span>`;
    document.body.appendChild(box);
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pv]");
      if (b && b.dataset.pv !== "x") return box.show(box.i + +b.dataset.pv);
      if (b || !e.target.closest("img")) box.close();
    });
    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") box.close();
      if (e.key === "ArrowLeft") box.show(box.i - 1);
      if (e.key === "ArrowRight") box.show(box.i + 1);
    });
    box.show = (n) => {
      box.i = (n + box.ids.length) % box.ids.length;
      box.querySelector(".photo-stage").innerHTML = photoImg(box.ids[box.i], 2400);
      box.querySelector(".photo-count").textContent = box.ids.length > 1 ? `${box.i + 1} / ${box.ids.length}` : "";
    };
    box.close = () => { box.hidden = true; document.body.style.overflow = ""; };
  }
  box.querySelector(".photo-close").setAttribute("aria-label", L("閉じる", "Close"));
  box.ids = ids;
  box.classList.toggle("single", ids.length < 2);
  box.show(i);
  box.hidden = false;
  document.body.style.overflow = "hidden";
}

// ---------- 管理（今日の一言・日記・サイトのパスワード） ----------
// 管理パスワードは Apps Script 側で確かめます（このファイルには書きません）
async function adminCall(params) {
  const body = new URLSearchParams(params);
  const res = await fetch(CONFIG.questionUrl, { method: "POST", body });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return { ok: false, error: "script" }; }
}
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
// 選んだ画像を、長い辺が1600pxまでのJPEGにして小さくする（送る時間とドライブの容量を節約）
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type) && !/\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name)) return reject(new Error("type"));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
      const g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); // 透明な部分は白に
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const dataUrl = c.toDataURL("image/jpeg", 0.85);
      resolve({ url: dataUrl, data: dataUrl.split(",")[1], type: "image/jpeg" });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); };
    img.src = url;
  });
}
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function adminPage() {
  return pageHead("Admin", L(...NAV_TEXT.admin), "") + `
  <section class="section"><div class="wrap" id="admin-box"></div></section>`;
}
function bindAdmin() {
  const box = $("admin-box");
  let pw = "";
  try { pw = sessionStorage.getItem(ADMIN_KEY) || ""; } catch (e) {}
  const errText = (r) => r.error === "password" ? L("パスワードがちがいます。", "Wrong password.")
    : r.error === "share" ? L("画像を公開できませんでした。Googleドライブの共有の設定を確かめてください。", "Could not share the image on Google Drive.")
    : r.error === "type" || r.error === "size" || r.error === "data" ? L("この画像は保存できませんでした（JPEG・PNG などで、15MBまで）。", "This image could not be saved.")
    : r.error === "drive" ? L("Googleドライブを使う許可がまだのようです（使い方ガイドの「B7」の setupDiaryImages を見てください）。", "Google Drive is not authorized yet.")
    : r.error === "script" || r.error === "action" ? L("Apps Script の更新がまだのようです（使い方ガイドの「B7. 管理ページ」を見てください）。", "The Apps Script has not been updated yet.")
    : L("うまくいきませんでした。時間をおいてもう一度お試しください。", "Something went wrong. Please try again later.");
  const show = (id, ok, msg) => { $(id).innerHTML = `<p class="notice ${ok ? "ok" : "ng"}">${msg}</p>`; };
  const failed = (id, r) => {
    show(id, false, errText(r));
    if (r.error === "password") { try { sessionStorage.removeItem(ADMIN_KEY); } catch (e) {} }
  };
  // ボタンを押している間は「…中」にする
  async function busy(btn, label, fn) {
    const old = btn.textContent;
    btn.disabled = true; btn.textContent = label;
    try { return await fn(); } catch (e) { return { ok: false }; } finally { btn.disabled = false; btn.textContent = old; }
  }

  function login() {
    box.innerHTML = `<div class="form admin-box">
      <div class="field"><label for="ad-pw">${L("管理パスワード", "Admin password")}</label><input id="ad-pw" type="password" autocomplete="current-password"></div>
      <div id="ad-result"></div>
      <div><button class="btn" id="ad-login" type="button">${L("ログイン", "Log in")}</button></div></div>`;
    const go = async () => {
      const v = $("ad-pw").value;
      if (!v) return;
      const r = await busy($("ad-login"), L("確認中…", "Checking…"), () => adminCall({ _action: "login", _password: v }));
      if (r.ok) { pw = v; try { sessionStorage.setItem(ADMIN_KEY, v); } catch (e) {} editor(r); return; }
      show("ad-result", false, errText(r));
    };
    $("ad-login").onclick = go;
    $("ad-pw").onkeydown = (e) => { if (e.key === "Enter") go(); };
    $("ad-pw").focus();
  }

  function editor(r) {
    const cw = typeof r.word === "string" ? r : currentWord();
    box.innerHTML = `
      <nav class="admin-jump">
        <a href="#ad-word-sec" data-jump>${L("今日の一言", "Today's note")}</a>
        <a href="#ad-diary-sec" data-jump>${L("日記", "Diary")}</a>
        <a href="#ad-pass-sec" data-jump>${L("サイトのパスワード", "Site password")}</a>
        <button class="btn ghost" id="ad-logout" type="button">${L("ログアウト", "Log out")}</button>
      </nav>
      <div class="form admin-box admin-sec" id="ad-word-sec">
        <h2 class="admin-h">${L("今日の一言", "Today's note")}</h2>
        <div class="field"><label for="ad-word">${L("今日の一言", "Today's note")}<span class="opt">${L("空にすると表示しません", "Leave empty to hide")}</span></label>
          <textarea id="ad-word" maxlength="200" style="min-height:90px">${esc(cw.word || "")}</textarea></div>
        <div class="field"><label for="ad-word-en">${L("英語表示のときの一言", "Note in English")}<span class="opt">${L("空なら日本語のまま", "Optional")}</span></label>
          <input id="ad-word-en" maxlength="200" value="${esc(cw.wordEn || "")}"></div>
        <div id="ad-result"></div>
        <div class="admin-btns"><button class="btn" id="ad-save" type="button">${L("保存する", "Save")}</button></div>
      </div>
      <div class="form admin-box admin-sec" id="ad-diary-sec">
        <h2 class="admin-h">${L("日記", "Diary")}</h2>
        <div id="ad-diary-form"></div>
        <div id="ad-diary-result"></div>
        <div id="ad-diary-list"><p class="status">${L("読み込み中…", "Loading…")}</p></div>
      </div>
      <div class="form admin-box admin-sec" id="ad-pass-sec">
        <h2 class="admin-h">${L("サイトを見るためのパスワード", "Password to view the site")}</h2>
        <p class="admin-note">${L("サイトを開いたときに聞かれるパスワードを変えます（管理パスワードは変わりません）。変えると、見に来た人はもう一度新しいパスワードを入れることになります。",
          "Changes the password asked when opening the site (not the admin password). Visitors will need to enter the new one.")}</p>
        <div class="field"><label for="ad-pass1">${L("新しいパスワード", "New password")}<span class="opt">${L("4文字以上", "4+ characters")}</span></label><input id="ad-pass1" type="password" autocomplete="new-password"></div>
        <div class="field"><label for="ad-pass2">${L("もう一度（確認）", "Again (to confirm)")}</label><input id="ad-pass2" type="password" autocomplete="new-password"></div>
        <label class="admin-check"><input type="checkbox" id="ad-pass-show"> ${L("入力した文字を見る", "Show what I typed")}</label>
        <div id="ad-pass-result"></div>
        <div class="admin-btns"><button class="btn" id="ad-pass-save" type="button">${L("パスワードを変える", "Change password")}</button></div>
      </div>`;
    box.querySelectorAll("[data-jump]").forEach((a) => { a.onclick = (e) => { e.preventDefault(); $(a.getAttribute("href").slice(1)).scrollIntoView({ behavior: "smooth" }); }; });
    $("ad-logout").onclick = () => { pw = ""; try { sessionStorage.removeItem(ADMIN_KEY); } catch (e) {} login(); };

    // 今日の一言
    $("ad-save").onclick = async () => {
      const word = $("ad-word").value.trim(), wordEn = $("ad-word-en").value.trim();
      const res = await busy($("ad-save"), L("保存中…", "Saving…"), () => adminCall({ _action: "setWord", _password: pw, _word: word, _wordEn: wordEn }));
      if (res.ok) {
        setTodayWord({ word, wordEn });
        show("ad-result", true, `${L("保存しました。トップページに反映されています。", "Saved. It now shows on the top page.")} <a href="#home">${L("トップを見る →", "View top page →")}</a>`);
      } else failed("ad-result", res);
    };

    // サイトのパスワード
    $("ad-pass-show").onchange = (e) => { $("ad-pass1").type = $("ad-pass2").type = e.target.checked ? "text" : "password"; };
    $("ad-pass-save").onclick = async () => {
      const a = $("ad-pass1").value, b = $("ad-pass2").value;
      if (a.length < 4) return show("ad-pass-result", false, L("4文字以上にしてください。", "Use at least 4 characters."));
      if (a !== b) return show("ad-pass-result", false, L("2つの欄のパスワードが同じではありません。", "The two passwords do not match."));
      if (a.trim() !== a) return show("ad-pass-result", false, L("最初と最後にスペースは入れられません。", "No spaces at the start or end."));
      const hash = await sha256Hex(a); // パスワードそのものは送らず、変換した値だけ送る
      const res = await busy($("ad-pass-save"), L("変更中…", "Changing…"), () => adminCall({ _action: "setSiteHash", _password: pw, _hash: hash }));
      if (res.ok) {
        if (window.SiteGate) window.SiteGate.remember(hash); // この端末はそのまま見られる
        $("ad-pass1").value = $("ad-pass2").value = "";
        show("ad-pass-result", true, L("サイトのパスワードを変えました。忘れないようにメモしておいてください。", "Site password changed. Make a note of it."));
      } else failed("ad-pass-result", res);
    };

    // 日記
    let entries = [];
    function diaryForm(d) {
      d = d || { id: "", date: todayIso(), title: "", body: "", titleEn: "", bodyEn: "", images: [] };
      // 画像：{ id }＝保存ずみ、{ data, type, url }＝これから送る画像
      let imgs = diaryImages(d).map((id) => ({ id }));
      $("ad-diary-form").innerHTML = `
        <p class="admin-mode">${d.id ? L("日記を直しています", "Editing an entry") : L("新しい日記を書く", "Write a new entry")}</p>
        <div class="field"><label for="ad-d-date">${L("日付", "Date")}</label><input id="ad-d-date" type="date" value="${esc(d.date)}"></div>
        <div class="field"><label for="ad-d-title">${L("タイトル", "Title")}<span class="opt">${L("なくてもOK", "Optional")}</span></label><input id="ad-d-title" maxlength="100" value="${esc(d.title)}"></div>
        <div class="field"><label for="ad-d-body">${L("本文", "Text")}</label><textarea id="ad-d-body" maxlength="20000" style="min-height:180px">${esc(d.body)}</textarea></div>
        <div class="field"><span class="ad-label">${L("画像", "Images")}<span class="opt">${L(`なくてもOK・${MAX_IMGS}枚まで`, `Optional, up to ${MAX_IMGS}`)}</span></span>
          <div class="ad-imgs" id="ad-d-imgs"></div>
          <label class="btn ghost small ad-img-add" id="ad-d-add"><input type="file" id="ad-d-file" accept="image/*" multiple hidden>＋ ${L("画像を追加", "Add images")}</label>
          <input type="file" id="ad-d-swap" accept="image/*" hidden>
          <p class="admin-note">${L("大きい画像は自動で小さくしてから保存します。保存するとGoogleドライブの「物理のHP 日記の画像」フォルダに入ります。",
            "Large images are resized before saving. They are stored in a Google Drive folder.")}</p></div>
        <details class="admin-en"${d.titleEn || d.bodyEn ? " open" : ""}><summary>${L("英語表示のとき（なくてもOK）", "English version (optional)")}</summary>
          <div class="field"><label for="ad-d-title-en">${L("タイトル（英語）", "Title (English)")}</label><input id="ad-d-title-en" maxlength="100" value="${esc(d.titleEn)}"></div>
          <div class="field"><label for="ad-d-body-en">${L("本文（英語）", "Text (English)")}</label><textarea id="ad-d-body-en" maxlength="20000" style="min-height:120px">${esc(d.bodyEn)}</textarea></div>
        </details>
        <div class="admin-btns"><button class="btn" id="ad-d-save" type="button">${d.id ? L("直した内容を保存", "Save changes") : L("日記を公開する", "Publish")}</button>
          ${d.id ? `<button class="btn ghost" id="ad-d-cancel" type="button">${L("やめる（新しく書く）", "Cancel")}</button>` : ""}</div>`;
      if (d.id) $("ad-d-cancel").onclick = () => { diaryForm(); $("ad-diary-result").innerHTML = ""; };

      // 画像の並び（← → で順番、「差しかえ」で入れかえ、「外す」で削除）
      let swapAt = -1;
      function drawImgs() {
        $("ad-d-imgs").innerHTML = imgs.map((im, i) => `<figure class="ad-img">
            ${im.id ? photoImg(im.id, 400) : `<img alt="" src="${im.url}">`}
            ${im.id ? "" : `<span class="ad-img-new">${L("未保存", "Not saved")}</span>`}
            <figcaption>
              <button type="button" class="ad-img-b" data-mv="-1" data-i="${i}" ${i ? "" : "disabled"} aria-label="${L("前へ", "Move left")}">←</button>
              <button type="button" class="ad-img-b" data-mv="1" data-i="${i}" ${i < imgs.length - 1 ? "" : "disabled"} aria-label="${L("後ろへ", "Move right")}">→</button>
              <button type="button" class="ad-img-b" data-swap="${i}">${L("差しかえ", "Replace")}</button>
              <button type="button" class="ad-img-b danger" data-rm="${i}">${L("外す", "Remove")}</button>
            </figcaption></figure>`).join("");
        $("ad-d-add").hidden = imgs.length >= MAX_IMGS;
      }
      $("ad-d-imgs").onclick = (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.mv) { const i = +b.dataset.i, j = i + +b.dataset.mv; [imgs[i], imgs[j]] = [imgs[j], imgs[i]]; }
        else if (b.dataset.rm) imgs.splice(+b.dataset.rm, 1);
        else if (b.dataset.swap) { swapAt = +b.dataset.swap; $("ad-d-swap").value = ""; $("ad-d-swap").click(); return; }
        drawImgs();
      };
      async function readFiles(files) {
        const out = [];
        for (const f of files) {
          try { out.push(await shrinkImage(f)); }
          catch (e) { show("ad-diary-result", false, L(`「${esc(f.name)}」は読みこめませんでした（JPEG・PNG などの画像にしてください）。`, `Could not read "${esc(f.name)}". Use a JPEG or PNG image.`)); }
        }
        return out;
      }
      $("ad-d-file").onchange = async (e) => {
        $("ad-diary-result").innerHTML = "";
        const add = await readFiles([...e.target.files].slice(0, MAX_IMGS - imgs.length));
        e.target.value = "";
        imgs = imgs.concat(add); drawImgs();
      };
      $("ad-d-swap").onchange = async (e) => {
        $("ad-diary-result").innerHTML = "";
        const [im] = await readFiles([...e.target.files].slice(0, 1));
        if (im && imgs[swapAt]) { imgs[swapAt] = im; drawImgs(); }
      };
      drawImgs();

      $("ad-d-save").onclick = async () => {
        const v = { date: $("ad-d-date").value || todayIso(), title: $("ad-d-title").value.trim(), body: $("ad-d-body").value.replace(/\s+$/, ""),
          titleEn: $("ad-d-title-en").value.trim(), bodyEn: $("ad-d-body-en").value.replace(/\s+$/, "") };
        if (!v.title && !v.body.trim() && !imgs.length) return show("ad-diary-result", false, L("タイトルか本文を書いてください。", "Write a title or some text."));
        const btn = $("ad-d-save");
        const res = await busy(btn, L("保存中…", "Saving…"), async () => {
          // まだ送っていない画像を1枚ずつ送る（送れた画像は覚えておくので、やり直しても二重になりません）
          const todo = imgs.filter((im) => !im.id);
          for (let k = 0; k < todo.length; k++) {
            btn.textContent = L(`画像を送信中（${k + 1}/${todo.length}）…`, `Uploading image ${k + 1}/${todo.length}…`);
            const r = await adminCall({ _action: "diaryImage", _password: pw, _data: todo[k].data, _type: todo[k].type });
            if (!r.ok) return r;
            todo[k].id = r.id; delete todo[k].data;
          }
          btn.textContent = L("保存中…", "Saving…");
          return adminCall({ _action: "diarySave", _password: pw, _id: d.id,
            _date: v.date, _title: v.title, _body: v.body, _titleEn: v.titleEn, _bodyEn: v.bodyEn, _images: imgs.map((im) => im.id).join(",") });
        });
        if (res.ok) {
          show("ad-diary-result", true, `${d.id ? L("直しました。", "Saved.") : L("公開しました。", "Published.")} <a href="#diary">${L("日記を見る →", "View diary →")}</a>`);
          diaryForm(); gotList(res.entries);
        } else failed("ad-diary-result", res);
      };
    }
    function gotList(list) {
      if (Array.isArray(list)) { entries = list; setDiary(list); }
      const el = $("ad-diary-list");
      if (!el) return;
      if (!entries.length) { el.innerHTML = `<p class="admin-note">${L("まだ日記はありません。", "No entries yet.")}</p>`; return; }
      el.innerHTML = `<h3 class="admin-sub">${L("これまでの日記", "Entries")}（${entries.length}）</h3><ul class="admin-diary">${entries.map((d) => `
        <li data-id="${esc(d.id)}"><span class="ad-d-info"><span class="ad-d-date">${esc(diaryDate(d.date))}</span>
          <span class="ad-d-title">${esc(d.title || String(d.body || "").slice(0, 40) || L("（画像のみ）", "(images only)"))}</span>
          ${diaryImages(d).length ? `<span class="ad-d-imgn">${L(`画像${diaryImages(d).length}枚`, `${diaryImages(d).length} image${diaryImages(d).length > 1 ? "s" : ""}`)}</span>` : ""}</span>
          <span class="ad-d-btns"><button class="btn ghost small" data-edit type="button">${L("直す", "Edit")}</button>
          <button class="btn ghost small danger" data-del type="button">${L("消す", "Delete")}</button></span></li>`).join("")}</ul>`;
      el.querySelectorAll("li").forEach((li) => {
        const d = entries.find((x) => String(x.id) === li.dataset.id);
        li.querySelector("[data-edit]").onclick = () => { diaryForm(d); $("ad-diary-result").innerHTML = ""; $("ad-diary-sec").scrollIntoView({ behavior: "smooth" }); $("ad-d-body").focus({ preventScroll: true }); };
        const del = li.querySelector("[data-del]");
        del.onclick = async () => {
          // 1回目は確認、2回目で本当に消す
          if (!del.dataset.sure) { del.dataset.sure = "1"; del.textContent = L("本当に消す？", "Really delete?"); setTimeout(() => { if (del.isConnected) { delete del.dataset.sure; del.textContent = L("消す", "Delete"); } }, 4000); return; }
          const res = await busy(del, L("削除中…", "Deleting…"), () => adminCall({ _action: "diaryDelete", _password: pw, _id: d.id }));
          if (res.ok) { show("ad-diary-result", true, L("消しました。", "Deleted.")); gotList(res.entries); }
          else failed("ad-diary-result", res);
        };
      });
    }
    diaryForm();
    fetchDiary().then(gotList).catch(() => { $("ad-diary-list").innerHTML = `<p class="notice ng">${errText({ error: "script" })}</p>`; });
  }

  if (!(CONFIG.questionUrl || "").trim()) { box.innerHTML = `<p class="notice info">${L("Apps Script のURLが設定されていません。", "Apps Script URL is not set.")}</p>`; return; }
  if (pw) {
    box.innerHTML = `<p class="status">${L("読み込み中…", "Loading…")}</p>`;
    adminCall({ _action: "login", _password: pw }).then((r) => r.ok ? editor(r) : login()).catch(login);
  } else login();
}

// ---------- 訪問者数（GoatCounter） ----------
// config.js の goatcounterCode を入れると、公開中のサイト（github.io）でだけ数えます。
function setupCounter() {
  const code = String(CONFIG.goatcounterCode || "").trim();
  if (!code || !/\.github\.io$/.test(location.hostname)) return;
  const count = () => window.goatcounter && window.goatcounter.count &&
    window.goatcounter.count({ path: location.pathname + (location.hash || "#home"), title: document.title });
  window.goatcounter = { no_onload: true };
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  s.onload = count;
  document.head.appendChild(s);
  window.addEventListener("hashchange", count);
  // 累計の訪問者数をページ下に表示
  fetch(`https://${code}.goatcounter.com/counter/TOTAL.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => { if (j && j.count) { data.visitors = j.count; showVisitors(); } })
    .catch(() => {});
}

function showVisitors() {
  if (data.visitors) $("footer-visitors").textContent = L(`訪問者数（累計）：${data.visitors}人`, `Visitors (total): ${data.visitors}`);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
