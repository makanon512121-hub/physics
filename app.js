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
  year: ["年度", "year"],
  image: ["画像", "image"],
  pdf: ["PDF", "pdf"],
  description: ["説明", "description"],
};

const state = { items: [], type: "すべて", category: "すべて", query: "" };
const $ = (id) => document.getElementById(id);

// ---------- 起動 ----------
document.title = CONFIG.siteTitle;
$("site-title").textContent = CONFIG.siteTitle;
$("site-desc").textContent = CONFIG.siteDescription;
$("footer-text").textContent = CONFIG.footerText;
load();

async function load() {
  const url = CONFIG.sheetCsvUrl.trim() || "sample-data.csv";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("CSVではなくHTMLが返ってきました");
    state.items = toItems(parseCSV(text));
    buildChips();
    render();
  } catch (e) {
    console.error(e);
    $("status").textContent = CONFIG.sheetCsvUrl
      ? "データを読み込めませんでした。config.js のURLが「CSV形式でウェブに公開」したものか確認してください。"
      : "サンプルデータを読み込めませんでした（パソコンでファイルを直接ひらいた場合は表示されません。GitHub Pagesに公開すると表示されます）。";
  }
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
  return rows.slice(1)
    .map((r) => {
      const item = {};
      for (const key in index) item[key] = index[key] >= 0 ? (r[index[key]] || "").trim() : "";
      item.videoId = youtubeId(item.youtube);
      return item;
    })
    .filter((item) => item.title);
}

// ---------- YouTubeのURLから動画IDを取り出す ----------
// watch?v= / youtu.be / shorts / embed / live / IDだけ、どれでもOK
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

// ---------- 絞り込みボタン ----------
function buildChips() {
  makeChips("type-chips", "type");
  makeChips("cat-chips", "category");
}

function makeChips(containerId, key) {
  const values = ["すべて", ...new Set(state.items.map((i) => i[key]).filter(Boolean))];
  const box = $(containerId);
  box.innerHTML = "";
  for (const v of values) {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = v;
    b.setAttribute("aria-pressed", String(state[key] === v));
    b.onclick = () => {
      state[key] = v;
      box.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
      render();
    };
    box.appendChild(b);
  }
}

$("search").addEventListener("input", (e) => { state.query = e.target.value.trim().toLowerCase(); render(); });

// ---------- 一覧を表示 ----------
function render() {
  const list = state.items.filter((i) =>
    (state.type === "すべて" || i.type === state.type) &&
    (state.category === "すべて" || i.category === state.category) &&
    (!state.query || Object.values(i).join(" ").toLowerCase().includes(state.query))
  );
  $("status").textContent = `${list.length} 件`;
  const grid = $("grid");
  grid.innerHTML = "";
  for (const item of list) grid.appendChild(card(item));
}

function tagsHtml(item) {
  const t = [];
  if (item.type) t.push(`<span class="tag type">${esc(item.type)}</span>`);
  if (item.category) t.push(`<span class="tag">${esc(item.category)}</span>`);
  const exam = [item.university, item.year && `${item.year}年`].filter(Boolean).join(" ");
  if (exam) t.push(`<span class="tag exam">${esc(exam)}</span>`);
  return t.join("");
}

function card(item) {
  const el = document.createElement("button");
  el.className = "card";
  let media;
  if (item.videoId) {
    media = `<div class="thumb-wrap"><img class="thumb" loading="lazy" alt="" onerror="this.style.visibility='hidden'" src="https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg"><span class="play">▶</span></div>`;
  } else if (item.image) {
    media = `<img class="thumb" loading="lazy" alt="" src="${esc(imageUrl(item.image))}">`;
  } else {
    media = `<div class="placeholder">${esc(item.category || "物理")}</div>`;
  }
  el.innerHTML = `${media}
    <div class="card-body">
      <div class="tags">${tagsHtml(item)}</div>
      <h3 class="card-title">${esc(item.title)}</h3>
      <p class="card-desc">${esc(item.description)}</p>
    </div>`;
  el.onclick = () => openModal(item);
  return el;
}

// ---------- くわしく見る ----------
function openModal(item) {
  let media = "";
  if (item.videoId) {
    media = `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&rel=0"
      title="${esc(item.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  } else if (item.image) {
    media = `<img class="modal-img" alt="" src="${esc(imageUrl(item.image))}">`;
  }
  $("modal-media").innerHTML = media;
  $("modal-tags").innerHTML = tagsHtml(item);
  $("modal-title").textContent = item.title;
  $("modal-desc").textContent = item.description;
  const links = [];
  if (item.pdf) links.push(`<a class="btn" href="${esc(item.pdf)}" target="_blank" rel="noopener">問題・解答（PDF）を開く</a>`);
  if (item.image && item.videoId) links.push(`<a class="btn outline" href="${esc(item.image)}" target="_blank" rel="noopener">画像を開く</a>`);
  if (item.videoId) links.push(`<a class="btn outline" href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener">YouTubeで見る</a>`);
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

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
