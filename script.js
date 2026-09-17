/* ===================== 个人主页脚本 ===================== */
(function () {
  "use strict";

  /* ---------- 1. 导航栏滚动效果 ---------- */
  const navbar = document.getElementById("navbar");
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
    highlightNav();
  });

  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));

  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );

  /* ---------- 2. 高亮当前分区 ---------- */
  const sections = [...document.querySelectorAll("section[id]")];
  const links = [...navLinks.querySelectorAll("a")];

  function highlightNav() {
    const pos = window.scrollY + 120;
    let current = "home";
    sections.forEach((s) => {
      if (pos >= s.offsetTop) current = s.id;
    });
    links.forEach((l) =>
      l.classList.toggle("active", l.getAttribute("href") === "#" + current)
    );
  }

  /* ---------- 3. 打字机效果 ---------- */
  const roles = [
    "计算机科学与技术学生",
    "Web 前端开发者",
    "算法爱好者",
    "终身学习者",
  ];
  const typedEl = document.getElementById("typed");
  let ri = 0, ci = 0, deleting = false;

  function type() {
    const word = roles[ri];
    typedEl.textContent = deleting
      ? word.slice(0, --ci)
      : word.slice(0, ++ci);

    let delay = deleting ? 60 : 120;
    if (!deleting && ci === word.length) { delay = 1600; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 400; }

    setTimeout(type, delay);
  }
  if (typedEl) type();

  /* ---------- 4. 滚动入场 + 技能条动画 ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        // 技能进度条
        e.target.querySelectorAll(".bar span").forEach((b) => {
          b.style.width = b.dataset.w || b.style.width;
        });
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );

  document
    .querySelectorAll(".section > .container > *, .hero-card")
    .forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });

  // 记录技能条目标宽度并清零，等待进入视口
  document.querySelectorAll(".bar span").forEach((b) => {
    b.dataset.w = b.style.width || "80%";
    b.style.width = "0";
  });

  /* ---------- 5. 联系表单（前端演示） ---------- */
  const form = document.getElementById("contactForm");
  const tip = document.getElementById("formTip");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      tip.textContent = `✅ 谢谢 ${name || "你"}！消息已记录（课程演示用，未真正发送）。`;
      form.reset();
      setTimeout(() => (tip.textContent = ""), 5000);
    });
  }

  /* ---------- 6. 年份 ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
