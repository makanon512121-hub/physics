// =============================================
//  トップページのアニメーション（4パターン、タップで切りかえ）
//  HeroAnim.mount(要素) で、その中の canvas に描きます。
// =============================================
const HeroAnim = (function () {
  const S = 340; // 描く大きさ
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  function gradStroke(g) {
    const gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, "#8fb0ff"); gr.addColorStop(1, "#c9a6ff"); return gr;
  }
  function glowDot(g, x, y, r, color, glow) {
    const gr = g.createRadialGradient(x, y, 0, x, y, glow);
    gr.addColorStop(0, color); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, glow, 0, 7); g.fill();
    if (r) { g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  }

  // ---------- 1. 電子のジャンプと光 ----------
  function electron(g) {
    const cx = S / 2, cy = S / 2, R = [52, 96, 140];
    const COL = { "2-1": "#7aa2ff", "1-0": "#b48cff", "2-0": "#e07cff" };
    let level = 2, from = 2, to = 2, t = 1, ang = 0, wait = 1.2;
    const photons = [];
    return {
      draw(dt) {
        const stroke = gradStroke(g);
        R.forEach((r, k) => {
          g.strokeStyle = stroke; g.globalAlpha = k === level || (t < 1 && (k === from || k === to)) ? .75 : .35;
          g.lineWidth = 1.3; g.setLineDash(k === level ? [] : [3, 5]);
          g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
        });
        g.setLineDash([]); g.globalAlpha = 1;
        const ng = g.createRadialGradient(cx, cy, 0, cx, cy, 26);
        ng.addColorStop(0, "rgba(201,166,255,.9)"); ng.addColorStop(.45, "rgba(143,176,255,.5)"); ng.addColorStop(1, "rgba(143,176,255,0)");
        g.fillStyle = ng; g.beginPath(); g.arc(cx, cy, 26, 0, 7); g.fill();
        g.fillStyle = stroke; g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.fill();
        const r = t >= 1 ? R[level] : lerp(R[from], R[to], ease(t));
        ang += dt * 95 / Math.pow(r, 1.2) * 1.6;
        if (t < 1) { t += dt / .45; if (t >= 1) { t = 1; level = to; } }
        else if ((wait -= dt) <= 0) {
          from = level; to = [0, 1, 2].filter((k) => k !== level)[Math.random() < .5 ? 0 : 1];
          const key = Math.max(from, to) + "-" + Math.min(from, to);
          const ex = cx + Math.cos(ang) * R[from], ey = cy + Math.sin(ang) * R[from];
          const dir = ang + (Math.random() - .5) * 1.2;
          if (to < from) photons.push({ x: ex, y: ey, dir, d: 0, color: COL[key], out: true });
          else photons.push({ x: ex + Math.cos(dir) * 170, y: ey + Math.sin(dir) * 170, dir: dir + Math.PI, d: 0, color: COL[key], out: false });
          t = 0; wait = 1.4 + Math.random() * 1.4;
        }
        for (let i = photons.length - 1; i >= 0; i--) {
          const p = photons[i]; p.d += dt * 210;
          const L = 46, k = 2 * Math.PI / 11, cs = Math.cos(p.dir), sn = Math.sin(p.dir);
          g.strokeStyle = p.color; g.lineWidth = 2; g.globalAlpha = p.out ? Math.max(0, 1 - p.d / 190) : Math.min(1, p.d / 60);
          g.shadowColor = p.color; g.shadowBlur = 10;
          g.beginPath();
          for (let s = 0; s <= L; s += 1.5) {
            const along = p.d - s, w = Math.sin(k * along - p.d * .25) * 5 * Math.sin(Math.PI * s / L);
            const x = p.x + cs * along - sn * w, y = p.y + sn * along + cs * w;
            s ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
          if (p.d > (p.out ? 200 : 170)) photons.splice(i, 1);
        }
        const flash = t < 1 ? Math.sin(Math.PI * t) : 0;
        glowDot(g, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 4.5, `rgba(201,166,255,${.35 + .5 * flash})`, 16 + 14 * flash);
      },
    };
  }

  // ---------- 2. 電場の矢印（−の電荷が指やマウスについてくる） ----------
  function field(g) {
    const pos = { x: S * .32, y: S * .5 }, neg = { x: S * .7, y: S * .5 }, step = 22;
    let target = null, idle = 0;
    function E(x, y) {
      let ex = 0, ey = 0;
      for (const [q, p] of [[1, pos], [-1, neg]]) {
        const dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy + 40, r = Math.sqrt(r2);
        ex += q * dx / (r2 * r); ey += q * dy / (r2 * r);
      }
      return { x: ex, y: ey };
    }
    function charge(x, y, col, sign) {
      glowDot(g, x, y, 0, col, 24);
      g.fillStyle = col; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill();
      g.fillStyle = "#0a0f1f"; g.font = "800 15px Inter, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(sign, x, y + 1);
    }
    return {
      point(p) { target = p; idle = 0; },
      leave() { target = null; },
      draw(dt, time) {
        idle += dt;
        const auto = { x: S / 2 + Math.cos(time * .6) * 105, y: S / 2 + Math.sin(time * .9) * 95 };
        const tg = target && idle < 3 ? { x: Math.max(14, Math.min(S - 14, target.x)), y: Math.max(14, Math.min(S - 14, target.y)) } : auto;
        neg.x = lerp(neg.x, tg.x, 1 - Math.exp(-dt * 6)); neg.y = lerp(neg.y, tg.y, 1 - Math.exp(-dt * 6));
        const stroke = gradStroke(g);
        g.strokeStyle = stroke; g.fillStyle = stroke; g.lineWidth = 1.4;
        for (let y = step / 2; y < S; y += step) for (let x = step / 2; x < S; x += step) {
          const f = E(x, y), m = Math.hypot(f.x, f.y);
          if (!m) continue;
          const edge = Math.max(0, 1 - Math.pow(Math.hypot(x - S / 2, y - S / 2) / (S * .52), 4));
          if (Math.min(Math.hypot(x - pos.x, y - pos.y), Math.hypot(x - neg.x, y - neg.y)) < 12) continue;
          const s = Math.max(0, Math.min(1, Math.log10(m * 1e5) / 2.6));
          const len = 7 + 9 * s, ux = f.x / m, uy = f.y / m;
          g.globalAlpha = (.3 + .7 * s) * edge;
          const x2 = x + ux * len / 2, y2 = y + uy * len / 2;
          g.beginPath(); g.moveTo(x - ux * len / 2, y - uy * len / 2); g.lineTo(x2, y2); g.stroke();
          g.beginPath(); g.moveTo(x2 + ux * 2, y2 + uy * 2);
          g.lineTo(x2 - ux * 3.5 - uy * 3, y2 - uy * 3.5 + ux * 3); g.lineTo(x2 - ux * 3.5 + uy * 3, y2 - uy * 3.5 - ux * 3); g.fill();
        }
        g.globalAlpha = 1;
        charge(pos.x, pos.y, "#ff8fb1", "+");
        charge(neg.x, neg.y, "#7fb2ff", "−");
      },
    };
  }

  // ---------- 3. 惑星の軌道 ----------
  function planets(g) {
    const cx = S / 2, cy = S / 2, GM = 1.3e5;
    const list = [
      { r: 48, e: 1.08, size: 3.5, col: "143,176,255" },
      { r: 82, e: 1.16, size: 4.5, col: "201,166,255" },
      { r: 118, e: 1.06, size: 5.5, col: "255,170,210" },
    ].map((p, k) => {
      const a0 = k * 2.1 + Math.random(), v = Math.sqrt(GM / p.r) * p.e;
      return { ...p, x: cx + Math.cos(a0) * p.r, y: cy + Math.sin(a0) * p.r, vx: -Math.sin(a0) * v, vy: Math.cos(a0) * v, trail: [] };
    });
    return {
      draw(dt) {
        const n = 12, h = dt / n;
        for (const p of list) {
          for (let i = 0; i < n; i++) {
            const dx = cx - p.x, dy = cy - p.y, r2 = dx * dx + dy * dy, r = Math.sqrt(r2), a = GM / r2;
            p.vx += a * dx / r * h; p.vy += a * dy / r * h; p.x += p.vx * h; p.y += p.vy * h;
          }
          p.trail.push([p.x, p.y]); if (p.trail.length > 240) p.trail.shift();
        }
        const sg = g.createRadialGradient(cx, cy, 0, cx, cy, 40);
        sg.addColorStop(0, "rgba(255,236,200,1)"); sg.addColorStop(.25, "rgba(255,200,150,.7)"); sg.addColorStop(1, "rgba(255,170,120,0)");
        g.fillStyle = sg; g.beginPath(); g.arc(cx, cy, 40, 0, 7); g.fill();
        g.fillStyle = "#fff6e6"; g.beginPath(); g.arc(cx, cy, 10, 0, 7); g.fill();
        g.lineCap = "round";
        for (const p of list) {
          for (let i = 1; i < p.trail.length; i++) {
            const a = i / p.trail.length;
            g.strokeStyle = `rgba(${p.col},${a * a * .85})`; g.lineWidth = p.size * .8 * a + .4;
            g.beginPath(); g.moveTo(...p.trail[i - 1]); g.lineTo(...p.trail[i]); g.stroke();
          }
          glowDot(g, p.x, p.y, p.size, `rgba(${p.col},.6)`, p.size * 4);
        }
      },
    };
  }

  // ---------- 4. 2つの波源の干渉 ----------
  function waves(g) {
    const N = 120, cell = S / N;
    const off = document.createElement("canvas"); off.width = off.height = N;
    const og = off.getContext("2d"), img = og.createImageData(N, N);
    const src = [{ x: S / 2 - 34, y: S / 2 }, { x: S / 2 + 34, y: S / 2 }], k = 2 * Math.PI / 30;
    const dist = src.map((s) => {
      const a = new Float32Array(N * N);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) a[j * N + i] = Math.hypot((i + .5) * cell - s.x, (j + .5) * cell - s.y);
      return a;
    });
    const edge = new Float32Array(N * N);
    for (let p = 0; p < N * N; p++) edge[p] = Math.max(0, 1 - Math.pow(Math.hypot(p % N - N / 2 + .5, ((p / N) | 0) - N / 2 + .5) / (N / 2), 3));
    return {
      draw(dt, time) {
        const w = time * 3.2, d = img.data;
        for (let p = 0; p < N * N; p++) {
          const r1 = dist[0][p], r2 = dist[1][p];
          const v = Math.sin(k * r1 - w) / Math.sqrt(1 + r1 / 40) + Math.sin(k * r2 - w) / Math.sqrt(1 + r2 / 40);
          const t = (v + 2) / 4;
          d[p * 4] = lerp(70, 220, t); d[p * 4 + 1] = lerp(90, 190, t); d[p * 4 + 2] = 255;
          d[p * 4 + 3] = 255 * edge[p] * Math.min(1, Math.abs(v) * .55) * (v > 0 ? 1 : .55);
        }
        og.putImageData(img, 0, 0);
        g.imageSmoothingEnabled = true; g.drawImage(off, 0, 0, S, S);
        for (const s of src) glowDot(g, s.x, s.y, 3.5, "rgba(201,166,255,.8)", 14);
      },
    };
  }

  const PATTERNS = [electron, field, planets, waves];
  let current = Math.floor(Math.random() * PATTERNS.length); // ページを開くたびにランダム
  let running = null;

  function mount(box) {
    if (running) running.stop();
    const c = box.querySelector("canvas"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = S * dpr; c.height = S * dpr;
    const g = c.getContext("2d");
    let anim = PATTERNS[current](g), last = performance.now(), stopped = false, down = null;
    const toCanvas = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * S / r.width, y: (e.clientY - r.top) * S / r.height }; };
    function next() {
      let n; do n = Math.floor(Math.random() * PATTERNS.length); while (n === current);
      current = n; anim = PATTERNS[current](g);
      box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap");
      if (reduce) requestAnimationFrame(frame);
    }
    // タップ（ほとんど動かさずに離した）なら切りかえ、ドラッグなら電荷が動くだけ
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; anim.point && anim.point(toCanvas(e)); };
    const onUp = (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10 && performance.now() - down.t < 500) next();
      down = null;
    };
    const hero = box.closest(".hero") || box;
    const onMove = (e) => { anim.point && anim.point(toCanvas(e)); };
    const onLeave = () => { anim.leave && anim.leave(); };
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointerup", onUp);
    c.addEventListener("pointercancel", () => { down = null; });
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); } });
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    function frame(now) {
      if (stopped) return;
      if (!c.isConnected) { stop(); return; }
      const dt = Math.min((now - last) / 1000, .05); last = now;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, S, S);
      anim.draw(dt, now / 1000);
      if (!reduce) requestAnimationFrame(frame);
    }
    function stop() {
      stopped = true;
      hero.removeEventListener("pointermove", onMove); hero.removeEventListener("pointerleave", onLeave);
    }
    requestAnimationFrame(frame);
    running = { stop };
  }
  return { mount };
})();
