/* =========================================================
 * 倪永昊 · Personal Website — 交互脚本
 *  1) 背景：点线网格 + 跟随鼠标起伏/旋转的「几何海浪」
 *  2) 打字机 / 导航高亮 / 滚动入场 / 技能条 / 表单
 * ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =======================================================
   * 1. 背景点线海浪（Canvas）
   * ======================================================= */
  (function ocean() {
    const canvas = document.getElementById("wave");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    const GAP = 42;          // 点间距
    const mouse = { x: -9999, y: -9999, active: false };
    const influence = 190;   // 鼠标影响半径
    let t = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      mouse.x = p.clientX - rect.left;
      mouse.y = p.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() { mouse.active = false; mouse.x = mouse.y = -9999; }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    function waveHeight(x, y) {
      // 多频叠加的正弦波，模拟海面起伏
      return (
        Math.sin(x * 0.011 + t * 0.9) * 9 +
        Math.cos(y * 0.013 - t * 0.7) * 8 +
        Math.sin((x + y) * 0.008 + t * 0.5) * 6
      );
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const cols = Math.ceil(W / GAP) + 2;
      const rows = Math.ceil(H / GAP) + 2;
      const pts = [];

      for (let iy = 0; iy < rows; iy++) {
        pts[iy] = [];
        for (let ix = 0; ix < cols; ix++) {
          let x = ix * GAP;
          let y = iy * GAP + waveHeight(x, y0(iy));

          // 海浪起伏
          y += waveHeight(x, iy * GAP) * 0.6;

          // 鼠标交互：产生位移（排斥 + 轻微旋转旋涡）
          let ox = 0, oy = 0, infl = 0;
          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < influence) {
              infl = 1 - d / influence;               // 0..1
              const force = infl * infl * 34;
              const ang = Math.atan2(dy, dx);
              ox += Math.cos(ang) * force;            // 向外排斥
              oy += Math.sin(ang) * force;
              // 旋涡分量
              ox += Math.cos(ang + Math.PI / 2) * force * 0.5;
              oy += Math.sin(ang + Math.PI / 2) * force * 0.5;
            }
          }

          pts[iy][ix] = { x: x + ox, y: y + oy, infl: infl };
        }
      }

      // 连线：构成网格，靠近鼠标的线更亮更粗
      ctx.lineWidth = 1;
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const p = pts[iy][ix];
          const right = pts[iy][ix + 1];
          const down = pts[iy + 1] ? pts[iy + 1][ix] : null;

          if (right) {
            const a = Math.max(p.infl, right.infl);
            ctx.strokeStyle = `rgba(47,127,240,${0.05 + a * 0.42})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(right.x, right.y); ctx.stroke();
          }
          if (down) {
            const a = Math.max(p.infl, down.infl);
            ctx.strokeStyle = `rgba(53,199,232,${0.05 + a * 0.36})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(down.x, down.y); ctx.stroke();
          }
        }
      }

      // 点：靠近鼠标的点更大更实
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const p = pts[iy][ix];
          const r = 1.1 + p.infl * 2.4;
          const alpha = 0.18 + p.infl * 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = p.infl > 0.05
            ? `rgba(47,127,240,${alpha})`
            : `rgba(120,160,210,${alpha * 0.8})`;
          ctx.fill();
        }
      }

      t += reduceMotion ? 0 : 0.012;
      requestAnimationFrame(draw);
    }

    function y0(iy) { return iy * GAP; }

    resize();
    draw();
  })();

  /* =======================================================
   * 2. 导航栏
   * ======================================================= */
  const navbar = document.getElementById("navbar");
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 16);
    highlightNav();
  }, { passive: true });

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  const sections = Array.from(document.querySelectorAll("section[id]"));
  const links = Array.from(navLinks.querySelectorAll("a"));
  function highlightNav() {
    const pos = window.scrollY + 130;
    let current = sections[0] ? sections[0].id : "";
    sections.forEach((s) => { if (pos >= s.offsetTop) current = s.id; });
    links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
  }

  /* =======================================================
   * 3. 打字机
   * ======================================================= */
  const roles = [
    "上海杉达学院 · 计算机科学与技术",
    "C 语言 / Python 学习者",
    "对生产力工具充满好奇",
    "正在把想法敲成代码",
  ];
  const typedEl = document.getElementById("typed");
  if (typedEl && !reduceMotion) {
    let ri = 0, ci = 0, deleting = false;
    (function type() {
      const word = roles[ri];
      typedEl.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);
      let delay = deleting ? 55 : 115;
      if (!deleting && ci === word.length) { delay = 1500; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 380; }
      setTimeout(type, delay);
    })();
  } else if (typedEl) {
    typedEl.textContent = roles[0];
  }

  /* =======================================================
   * 4. 滚动入场 + 技能条
   * ======================================================= */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        e.target.querySelectorAll(".bar").forEach((bar) => {
          const pct = bar.dataset.pct || "70";
          const span = bar.querySelector("span");
          if (span) span.style.width = pct + "%";
        });
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* =======================================================
   * 5. 联系表单（前端演示）
   * ======================================================= */
  const form = document.getElementById("contactForm");
  const tip = document.getElementById("formTip");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (new FormData(form).get("name") || "").toString().trim();
      tip.textContent = `✅ 谢谢 ${name || "你"}！消息已记录（课程演示，未真正发送）。`;
      form.reset();
      setTimeout(() => { tip.textContent = ""; }, 5000);
    });
  }

  /* =======================================================
   * 6. 年份
   * ======================================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
