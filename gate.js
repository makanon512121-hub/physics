// =============================================
//  パスワード画面（ふだんは触らなくてOK）
//  パスワードは「管理」ページで変えられます（Apps Script に保存）。
//  Apps Script に届かないときは、前に読んだもの → config.js の passwordHash の順で使います。
//  どれも空なら何もしません。
//  ※ GitHub Pages ではファイルが公開されるので、これは「目隠し」程度の守りです。
// =============================================
(function () {
  var cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  var CFG_HASH = String(cfg.passwordHash || "").trim().toLowerCase();
  var KEY = "physics-hp-auth", HASH_KEY = "physics-hp-sitehash";
  function get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function put(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }
  var isHash = function (h) { return /^[0-9a-f]{64}$/.test(h); };
  var HASH = get(HASH_KEY) || CFG_HASH; // いま分かっている最新のパスワード

  // Apps Script から最新の設定（パスワード・今日の一言）を読む。app.js もこれを使い回します
  var url = String(cfg.questionUrl || "").trim();
  var info = url && window.fetch
    ? fetch(url, { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return null; })
    : Promise.resolve(null);
  window.SITE_INFO = info;

  // 管理ページでパスワードを変えた人は、そのまま見られるようにする
  window.SiteGate = {
    remember: function (h) { HASH = h; put(HASH_KEY, h); put(KEY, h); },
  };

  var hide = document.createElement("style"), box = null;
  hide.textContent =
    "html{visibility:hidden!important}" +
    "#pw-gate,#pw-gate *{visibility:visible!important}" +
    "#pw-gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:16px;" +
    "background:#0a0f1f;font-family:'Noto Sans JP','Hiragino Sans',Meiryo,sans-serif;color:#e9edf7}" +
    "#pw-gate form{width:min(360px,100%);background:#131a2e;border:1px solid #232c45;border-radius:18px;padding:28px;display:grid;gap:14px;box-shadow:0 30px 80px rgba(0,0,0,.5)}" +
    "#pw-gate .mark{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-weight:800;font-size:20px;background:linear-gradient(135deg,#4f7cff,#9b5cff);color:#fff}" +
    "#pw-gate h1{margin:0;font-size:1.2rem}#pw-gate p{margin:0;color:#9aa5bf;font-size:.9rem}" +
    "#pw-gate input{font:inherit;font-size:1rem;color:#e9edf7;background:#0b1020;border:1px solid #232c45;border-radius:12px;padding:12px 14px}" +
    "#pw-gate input:focus{outline:2px solid #4f7cff;outline-offset:-1px}" +
    "#pw-gate button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:12px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#4f7cff,#9b5cff)}" +
    "#pw-gate .err{color:#ff8a9a;font-size:.85rem;min-height:1.2em}" +
    "#pw-gate .top{display:flex;justify-content:space-between;align-items:center}" +
    "#pw-gate button.lang{font-size:.78rem;padding:5px 12px;background:transparent;border:1px solid #33405f;color:#e9edf7}";
  // 言語（サイトの「EN」ボタンと同じ設定を使う）
  var LANG_KEY = "physics-hp-lang", lang = "ja";
  try { if (localStorage.getItem(LANG_KEY) === "en") lang = "en"; } catch (e) {}
  var TEXT = {
    ja: { title: "パスワードを入力してください", text: "このサイトを見るにはパスワードが必要です。", label: "パスワード", open: "ひらく", wrong: "パスワードがちがいます。", lang: "English" },
    en: { title: "Enter the password", text: "A password is required to view this site.", label: "Password", open: "Open", wrong: "Wrong password.", lang: "日本語" },
  };

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  function show() {
    if (box || !lockedNow) return;
    box = document.createElement("div");
    box.id = "pw-gate";
    box.innerHTML =
      '<form autocomplete="on"><div class="top"><div class="mark">Φ</div><button type="button" class="lang"></button></div><h1></h1><p></p>' +
      '<input type="password" name="password" autocomplete="current-password" required>' +
      '<div class="err" aria-live="polite"></div><button type="submit" class="go"></button></form>';
    document.body.appendChild(box);
    var form = box.querySelector("form"), input = box.querySelector("input"), err = box.querySelector(".err");
    function paint() {
      var t = TEXT[lang];
      document.documentElement.lang = lang;
      box.querySelector("h1").textContent = t.title;
      box.querySelector("p").textContent = t.text;
      input.setAttribute("aria-label", t.label);
      box.querySelector(".go").textContent = t.open;
      box.querySelector(".lang").textContent = t.lang;
      if (err.textContent) err.textContent = t.wrong;
    }
    paint();
    box.querySelector(".lang").addEventListener("click", function () {
      lang = lang === "en" ? "ja" : "en";
      try { localStorage.setItem(LANG_KEY, lang); } catch (x) {}
      paint();
      if (typeof setLang === "function") setLang(lang); // サイトの表示も合わせる
      input.focus();
    });
    input.focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var go = box.querySelector(".go");
      go.disabled = true;
      // 最新のパスワードを読み終えるまで少し待つ（最大5秒）
      var wait = new Promise(function (ok) { setTimeout(ok, 5000); });
      Promise.race([info, wait]).then(function () { return sha256(input.value); }).then(function (h) {
        go.disabled = false;
        if (!HASH || h === HASH) {
          put(KEY, HASH);
          unlock();
        } else {
          err.textContent = TEXT[lang].wrong;
          input.select();
        }
      });
    });
  }
  var lockedNow = false;
  function lock() {
    if (lockedNow) return;
    lockedNow = true;
    document.head.appendChild(hide);
    if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
  }
  function unlock() {
    lockedNow = false;
    if (box) { box.remove(); box = null; }
    hide.remove();
  }
  function check() { if (HASH && get(KEY) !== HASH) lock(); else unlock(); }
  check();

  // 最新のパスワードが届いたら、変わっていればもう一度パスワードを聞く
  info.then(function (j) {
    if (!j || typeof j !== "object") return; // 読めなかった → いまのまま
    var remote = String(j.siteHash || "").toLowerCase();
    if (!isHash(remote)) remote = "";
    put(HASH_KEY, remote);
    var next = remote || CFG_HASH;
    if (next !== HASH) { HASH = next; check(); }
  });
})();
