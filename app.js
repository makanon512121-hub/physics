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
};
const PLAY = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 1.5v13L14 8z"/></svg>`;

const data = { items: [], loaded: false, error: false, commitTime: null, changelog: [] };
const $ = (id) => document.getElementById(id);

// ---------- 言語（日本語 / English） ----------
const LANG_KEY = "physics-hp-lang";
let lang = "ja";
try { if (localStorage.getItem(LANG_KEY) === "en") lang = "en"; } catch (e) {}
const en = () => lang === "en";
const L = (ja, english) => (en() ? english : ja); // 日本語と英語のどちらかを返す

const NAV_TEXT = {
  exams: ["過去問研究", "Past Exams"], anime: ["アニメーション集", "Animations"],
  ask: ["質問箱", "Q&A"], updates: ["更新内容", "Updates"], links: ["リンク集", "Links"],
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
    </div>
  </div>
  <section class="section">
    <div class="wrap">
      <div class="section-title"><h2>${L("新着", "Latest")}</h2></div>
      ${loadingOr(latest.length ? `<div class="grid">${latest.map((i) => card(i)).join("")}</div>` : `<p class="empty">${L("まだ記事がありません。", "Nothing here yet.")}</p>`)}
    </div>
  </section>`;
}

// 今日の一言：管理ページで書いたもの（Apps Script に保存）→ なければ config.js の todayWord
const WORD_KEY = "physics-hp-word";
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
    const res = await fetch(url, { cache: "no-store" });
    const j = await res.json();
    if (typeof j.word !== "string") return; // まだ一度も書いていない → config.js のまま
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
  return w ? `<p class="today-word"><span class="today-label">${L("今日の一言", "Today's note")}</span><span>${esc(w)}</span></p>` : "";
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
  if (item.linkList.length) {
    media += `<div class="choices">${linksOf(item).map((l) => `
      <a class="choice" href="${esc(l.url)}"${/^https?:/.test(l.url) ? ' target="_blank" rel="noopener"' : ""}>
        <span class="choice-label">${esc(l.label)}</span><span class="choice-go">${L("開く", "Open")} →</span>
      </a>`).join("")}</div>`;
  }
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

// ---------- 管理（今日の一言の書きかえ） ----------
// パスワードは Apps Script 側で確かめます（このファイルには書きません）
const ADMIN_KEY = "physics-hp-admin";
async function adminCall(params) {
  const body = new URLSearchParams(params);
  const res = await fetch(CONFIG.questionUrl, { method: "POST", body });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return { ok: false, error: "script" }; }
}
function adminPage() {
  return pageHead("Admin", L(...NAV_TEXT.admin), "") + `
  <section class="section"><div class="wrap"><div class="form admin-box" id="admin-box"></div></div></section>`;
}
function bindAdmin() {
  const box = $("admin-box");
  let pw = "";
  try { pw = sessionStorage.getItem(ADMIN_KEY) || ""; } catch (e) {}
  const errText = (r) => r.error === "password" ? L("パスワードがちがいます。", "Wrong password.")
    : r.error === "script" ? L("Apps Script の更新がまだのようです（使い方ガイドの「B7. 管理ページ」を見てください）。", "The Apps Script has not been updated yet.")
    : L("うまくいきませんでした。時間をおいてもう一度お試しください。", "Something went wrong. Please try again later.");
  function login() {
    box.innerHTML = `
      <div class="field"><label for="ad-pw">${L("管理パスワード", "Admin password")}</label><input id="ad-pw" type="password" autocomplete="current-password"></div>
      <div id="ad-result"></div>
      <div><button class="btn" id="ad-login" type="button">${L("ログイン", "Log in")}</button></div>`;
    const go = async () => {
      const btn = $("ad-login"), v = $("ad-pw").value;
      if (!v) return;
      btn.disabled = true; btn.textContent = L("確認中…", "Checking…");
      let r;
      try { r = await adminCall({ _action: "login", _password: v }); } catch (e) { r = { ok: false }; }
      if (r.ok) { pw = v; try { sessionStorage.setItem(ADMIN_KEY, v); } catch (e) {} editor(r); return; }
      $("ad-result").innerHTML = `<p class="notice ng">${errText(r)}</p>`;
      btn.disabled = false; btn.textContent = L("ログイン", "Log in");
    };
    $("ad-login").onclick = go;
    $("ad-pw").onkeydown = (e) => { if (e.key === "Enter") go(); };
    $("ad-pw").focus();
  }
  function editor(r) {
    const cw = typeof r.word === "string" ? r : currentWord();
    box.innerHTML = `
      <div class="field"><label for="ad-word">${L("今日の一言", "Today's note")}<span class="opt">${L("空にすると表示しません", "Leave empty to hide")}</span></label>
        <textarea id="ad-word" maxlength="200" style="min-height:90px">${esc(cw.word || "")}</textarea></div>
      <div class="field"><label for="ad-word-en">${L("英語表示のときの一言", "Note in English")}<span class="opt">${L("空なら日本語のまま", "Optional")}</span></label>
        <input id="ad-word-en" maxlength="200" value="${esc(cw.wordEn || "")}"></div>
      <div id="ad-result"></div>
      <div class="admin-btns"><button class="btn" id="ad-save" type="button">${L("保存する", "Save")}</button>
        <button class="btn ghost" id="ad-logout" type="button">${L("ログアウト", "Log out")}</button></div>`;
    $("ad-save").onclick = async () => {
      const btn = $("ad-save"), word = $("ad-word").value.trim(), wordEn = $("ad-word-en").value.trim();
      btn.disabled = true; btn.textContent = L("保存中…", "Saving…");
      let res;
      try { res = await adminCall({ _action: "setWord", _password: pw, _word: word, _wordEn: wordEn }); } catch (e) { res = { ok: false }; }
      if (res.ok) {
        setTodayWord({ word, wordEn });
        $("ad-result").innerHTML = `<p class="notice ok">${L("保存しました。トップページに反映されています。", "Saved. It now shows on the top page.")} <a href="#home">${L("トップを見る →", "View top page →")}</a></p>`;
      } else {
        $("ad-result").innerHTML = `<p class="notice ng">${errText(res)}</p>`;
        if (res.error === "password") { try { sessionStorage.removeItem(ADMIN_KEY); } catch (e) {} }
      }
      btn.disabled = false; btn.textContent = L("保存する", "Save");
    };
    $("ad-logout").onclick = () => { pw = ""; try { sessionStorage.removeItem(ADMIN_KEY); } catch (e) {} login(); };
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
