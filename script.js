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
   * 3. 头像翻牌卡片（图1 常驻 / 点击切换 图2）
   * ======================================================= */
  (function flip() {
    const card = document.getElementById("flipCard");
    const btn = document.getElementById("flipBtn");
    if (!card) return;
    const toggle = () => card.classList.toggle("flipped");
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    if (btn) btn.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
  })();

  /* =======================================================
   * 4. 打字机
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
   * 5. 通用滚动入场（标题 / 首屏等）
   * ======================================================= */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        revealIO.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

  /* =======================================================
   * 6. 卡片滑动入场（技能 / 项目）
   *    向下滚动：从右滑入；滚过头：向左滑出
   * ======================================================= */
  (function slideCards() {
    const cards = Array.from(document.querySelectorAll(".slide-card"));
    if (!cards.length) return;

    // 单一滚动驱动：根据卡片在视口中的位置决定状态，避免多机制互相打架
    // - 从右侧滑入（进场）
    // - 滑出视口上方时向左滑出
    let ticking = false;

    function setIn(c) {
      if (!c.classList.contains("in")) {
        c.classList.remove("out-left");
        c.classList.add("in");
      }
    }
    function setOut(c) {
      if (!c.classList.contains("out-left")) {
        c.classList.remove("in");
        c.classList.add("out-left");
      }
    }
    function setHidden(c) {
      // 在视口下方（还没进场）：无动画状态，等待首次滑入
      c.classList.remove("in", "out-left");
    }

    function update() {
      const vh = window.innerHeight;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const center = r.top + r.height / 2;
        // 技能条填充
        if (center > 0 && center < vh) {
          c.querySelectorAll(".bar").forEach((bar) => {
            const span = bar.querySelector("span");
            if (span) span.style.width = (bar.dataset.pct || "70") + "%";
          });
        }
        if (center < vh * 0.15) {
          // 已滚到视口上方 → 向左滑出
          setOut(c);
        } else if (center < vh * 0.85) {
          // 在视口中下部 → 进场（从右滑入）
          setIn(c);
        } else {
          // 在视口下方 → 归位待入场
          setHidden(c);
        }
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // 首次：等布局完成再判定（避免直接落在隐藏态）
    requestAnimationFrame(update);
    window.addEventListener("load", onScroll);
  })();
  /* =======================================================
   * 7. 兴趣爱好云图：漂浮晃动 + 鼠标吸附 + 悬停放大展开
   * ======================================================= */
  (function cloud() {
    const stage = document.getElementById("cloudStage");
    const cloud = document.getElementById("cloud");
    if (!stage || !cloud) return;
    const items = Array.from(cloud.querySelectorAll(".cloud-item"));
    const isMobile = () => window.matchMedia("(max-width: 780px)").matches;

    items.forEach((el) => {
      el._s  = parseFloat(el.style.getPropertyValue("--s")) || 1;
      el._ox = 0; el._oy = 0;
      el.style.setProperty("--ox", "0px");
      el.style.setProperty("--oy", "0px");
    });

    const R = 210;       // 吸附半径 (px)
    const PULL = 0.26;   // 吸附强度
    let mx = null, my = null;

    // 展开时：把超大后的卡片拉回云图框内，保证完整可见
    const PAD = 14;   // 与边框的内边距
    function clampActive(el) {
      const sRect = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();          // 当前（已含 --ox/--oy 与放大）
      let dx = 0, dy = 0;
      // 只按「当前渲染框」与舞台边界比较，超出就往回推
      const overflowL = sRect.left + PAD - r.left;
      const overflowR = r.right - (sRect.right - PAD);
      const overflowT = sRect.top + PAD - r.top;
      const overflowB = r.bottom - (sRect.bottom - PAD);
      if (overflowL > 0) dx += overflowL;
      if (overflowR > 0) dx -= overflowR;
      if (overflowT > 0) dy += overflowT;
      if (overflowB > 0) dy -= overflowB;
      return { dx, dy };
    }

    function apply() {
      if (!isMobile()) {
        const sRect = stage.getBoundingClientRect();
        items.forEach((el) => {
          if (el.classList.contains("active")) {
            // 平滑地把越界部分推回框内
            const c = clampActive(el);
            el._ox += (c.dx - el._ox) * 0.2;
            el._oy += (c.dy - el._oy) * 0.2;
            el.style.setProperty("--ox", el._ox.toFixed(2) + "px");
            el.style.setProperty("--oy", el._oy.toFixed(2) + "px");
            return;
          }
          let tx = 0, ty = 0;
          if (mx !== null) {
            const r = el.getBoundingClientRect();
            const baseCx = r.left + r.width / 2 - el._ox;
            const baseCy = r.top + r.height / 2 - el._oy;
            const mAbsX = sRect.left + mx;
            const mAbsY = sRect.top + my;
            const dx = mAbsX - baseCx;
            const dy = mAbsY - baseCy;
            const d = Math.hypot(dx, dy);
            if (d < R) {
              const f = (1 - d / R) * PULL;
              tx = dx * f;
              ty = dy * f;
            }
          }
          el._ox += (tx - el._ox) * 0.14;
          el._oy += (ty - el._oy) * 0.14;
          el.style.setProperty("--ox", el._ox.toFixed(2) + "px");
          el.style.setProperty("--oy", el._oy.toFixed(2) + "px");
        });
      }
      requestAnimationFrame(apply);
    }

    stage.addEventListener("mousemove", (e) => {
      const rect = stage.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    });

    function activate(el) {
      items.forEach((o) => {
        if (o === el) {
          o.classList.add("active");
          o.classList.remove("dimmed");
        } else {
          o.classList.add("dimmed");
          o.classList.remove("active");
        }
      });
      stage.classList.add("hovered");
    }
    function deactivate() {
      items.forEach((el) => el.classList.remove("active", "dimmed"));
      stage.classList.remove("hovered");
    }

    // 悬停在某张卡片上 → 展开；离开该卡片 → 恢复
    items.forEach((el) => {
      el.addEventListener("mouseenter", () => activate(el));
      el.addEventListener("mouseleave", () => {
        // 仅当离开的正是当前展开的那张时收起
        if (el.classList.contains("active")) deactivate();
      });
    });
    // 离开整个舞台时兜底清理
    stage.addEventListener("mouseleave", () => {
      mx = my = null;
      deactivate();
    });

    apply();
  })();

  /* =======================================================
   * 8. 联系表单（前端演示）
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
   * 9. 年份
   * ======================================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
