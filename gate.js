// =============================================
//  パスワード画面（ふだんは触らなくてOK）
//  config.js の passwordHash が空なら何もしません。
//  ※ GitHub Pages ではファイルが公開されるので、これは「目隠し」程度の守りです。
// =============================================
(function () {
  var cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  var HASH = String(cfg.passwordHash || "").trim().toLowerCase();
  if (!HASH) return;
  var KEY = "physics-hp-auth";
  try { if (localStorage.getItem(KEY) === HASH) return; } catch (e) {}

  // 中身を隠す
  var hide = document.createElement("style");
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
    "#pw-gate .err{color:#ff8a9a;font-size:.85rem;min-height:1.2em}";
  document.head.appendChild(hide);

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  function show() {
    var box = document.createElement("div");
    box.id = "pw-gate";
    box.innerHTML =
      '<form autocomplete="on"><div class="mark">Φ</div><h1>パスワードを入力してください</h1>' +
      "<p>このサイトを見るにはパスワードが必要です。</p>" +
      '<input type="password" name="password" autocomplete="current-password" aria-label="パスワード" required>' +
      '<div class="err" aria-live="polite"></div><button type="submit">ひらく</button></form>';
    document.body.appendChild(box);
    var form = box.querySelector("form"), input = box.querySelector("input"), err = box.querySelector(".err");
    input.focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sha256(input.value).then(function (h) {
        if (h === HASH) {
          try { localStorage.setItem(KEY, HASH); } catch (x) {}
          box.remove();
          hide.remove();
        } else {
          err.textContent = "パスワードがちがいます。";
          input.select();
        }
      });
    });
  }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
