/* =========================================================
   브이웹 새 섹션 2종 — 공통 헬퍼 + 실행 순서
   · 섹션 파일(js/va01.js · js/va02.js)은 VW.add(function (H) { ... }) 로 등록만 한다.
   · H = { PC, MO, REDUCE, mm, revealAt, revealEach, splitLines, splitWords, countUp, typeText, headReveal, initMagneticField }
   · gsap.md : 기본 power4.out / 1s · position '< N%' · yPercent ≤ 30 · paused + onEnter(revealAt)
   ========================================================= */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
window.VW = { _inits: [], add: function (fn) { this._inits.push(fn); } };

window.addEventListener("load", function () {
  const PC = "(min-width: 600px)";
  const MO = "(max-width: 599px)";
  const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();

  // html { scroll-behavior: smooth } 가 refresh 좌표를 틀어지게 하지 않도록 (핀.md §8-9)
  const docEl = document.documentElement;
  ScrollTrigger.addEventListener("refreshInit", function () { docEl.style.setProperty("scroll-behavior", "auto", "important"); });
  ScrollTrigger.addEventListener("refresh", function () { docEl.style.removeProperty("scroll-behavior"); });

  /* =========================================================
     헬퍼
     ========================================================= */
  // 트리거가 트윈을 소유하지 않는 등장 (gsap.md §7-9) — refresh 때 op0 으로 되감기지 않음
  function revealAt(trigger, build, start) {
    if (REDUCE) return null;
    const t = gsap.timeline({ paused: true, defaults: { duration: 1, ease: "power4.out" } });
    build(t);
    ScrollTrigger.create({ trigger: trigger, start: start || "top 80%", once: true, onEnter: function () { t.play(); } });
    return t;
  }
  // 모바일 — 항목마다 자기 트리거 (gsap.md §6-0)
  function revealEach(sel, vars, start) {
    gsap.utils.toArray(sel).forEach(function (el) {
      revealAt(el, function (t) { t.from(el, Object.assign({ duration: 0.95 }, vars), "< 0%"); }, start || "top 88%");
    });
  }

  // <br> 기준 줄 래핑 — br 은 그대로 두고 그 사이만 inline-block span 으로 (gsap.md §3-17)
  function splitLines(sel) {
    const out = [];
    document.querySelectorAll(sel).forEach(function (el) {
      if (!el.dataset.lines) {
        const frag = document.createDocumentFragment();
        const made = [];
        let g = null;
        [].slice.call(el.childNodes).forEach(function (n) {
          if (n.nodeName === "BR") { g = null; frag.appendChild(n); return; }
          if (!g) { g = document.createElement("span"); g.className = "ln"; frag.appendChild(g); made.push(g); }
          g.appendChild(n);
        });
        made.forEach(function (s) {           // 줄 끝 공백은 span 밖으로
          const last = s.lastChild;
          if (!last || last.nodeType !== 3) return;
          const m = last.nodeValue.match(/\s+$/);
          if (!m || m[0].length === last.nodeValue.length) return;
          last.nodeValue = last.nodeValue.slice(0, -m[0].length);
          s.parentNode.insertBefore(document.createTextNode(m[0]), s.nextSibling);
        });
        el.appendChild(frag);
        el.dataset.lines = "1";
      }
      [].push.apply(out, el.querySelectorAll(".ln"));
    });
    return out.filter(function (s) { return s.textContent.trim(); });
  }

  // 답변 스트리밍용 단어 래핑 (inline span → opacity 만)
  function splitWords(sel) {
    const root = document.querySelector(sel);
    const words = [];
    if (!root) return words;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const s = document.createElement("span");
            s.className = "w";
            s.textContent = p;
            frag.appendChild(s);
            words.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    })(root);
    return words;
  }

  // 카운트업 — 자릿수에 맞춰 스냅 (gsap.md §2-1 (4))
  function countStep(t) {
    t = Math.abs(t);
    if (t >= 1e7) return 10000;
    if (t >= 1e6) return 1000;
    if (t >= 1e5) return 500;
    if (t >= 1e4) return 100;
    if (t >= 1e3) return 10;
    if (t >= 200) return 5;
    return 1;
  }
  const FMT = { time: function (v) { return Math.floor(v / 60) + "분 " + (v % 60) + "초"; } };
  function countUp(t, el, pos) {
    const to = +el.dataset.to;
    const step = countStep(to);
    const fmt = FMT[el.dataset.fmt] || function (v) { return v.toLocaleString(); };
    const o = { v: 0 };
    el.textContent = fmt(0);
    t.to(o, {
      v: to, duration: 1.6, ease: "expo.inOut",
      onUpdate: function () { el.textContent = fmt(Math.round(o.v / step) * step); },
      onComplete: function () { el.textContent = fmt(to); },
    }, pos);
  }

  // 지웠다가 다시 타이핑
  function typeText(t, node, from, to, dur, pos) {
    const o = { n: 0 };
    t.to(o, {
      n: from.length + to.length, duration: dur, ease: "none",
      onStart: function () { node.classList.add("typing"); },
      onUpdate: function () {
        const n = Math.round(o.n);
        node.textContent = n <= from.length ? from.slice(0, from.length - n) : to.slice(0, n - from.length);
      },
      onComplete: function () { node.textContent = to; node.classList.remove("typing"); },
    }, pos);
  }

  // 섹션 헤드 공통 (영문 타이틀 → 국문 타이틀 줄 스플릿 → 설명)
  function headReveal(sec) {
    const lines = splitLines(sec + " .sec_tit");
    revealAt(sec + " .sec_head", function (t) {
      t.from(sec + " .sec_en", { opacity: 0, yPercent: 30 }, "< 0%")
        .from(lines, { opacity: 0, yPercent: 30, stagger: 0.15 }, "< 30%")
        .from(sec + " .sec_desc", { opacity: 0, yPercent: 30 }, "< 40%");
    });
  }

  // 자기장(근접) 호버 — 자기장 효과.md §3
  function initMagneticField(options) {
    if (!window.gsap || !window.jQuery) return;
    if (REDUCE) return;
    const $ = window.jQuery;
    const opt = $.extend({
      selector: "", group: "", influenceRadius: 200, maxRotation: 6, maxTilt: 4, maxLift: 0,
      perspective: 700, followDuration: 0.35, settleDuration: 0.45, idle: null,
      media: "(min-width: 600px) and (hover: hover) and (pointer: fine)", ns: "magnetic",
    }, options);
    const $targets = $(opt.selector);
    if (!$targets.length) return;
    const $group = opt.group ? $(opt.group).first() : null;

    gsap.matchMedia().add(opt.media, function () {
      const ns = "." + opt.ns;
      let frameId = null, settleCall = null, pointerX = 0, pointerY = 0, influenced = false;
      const states = $targets.map(function () {
        const el = this;
        const base = parseFloat(gsap.getProperty(el, "rotation")) || 0;
        const quick = function (prop) { return gsap.quickTo(el, prop, { duration: opt.followDuration, ease: "power3.out" }); };
        return { el: el, base: base, yTo: quick("y"), rTo: quick("rotation"), rxTo: quick("rotationX"), ryTo: quick("rotationY") };
      }).get();
      const elements = states.map(function (s) { return s.el; });
      gsap.set(elements, { transformPerspective: opt.perspective, transformOrigin: "50% 50%" });

      function moveTo(s, y, r, rx, ry, d) {
        s.yTo.tween.duration(d); s.rTo.tween.duration(d); s.rxTo.tween.duration(d); s.ryTo.tween.duration(d);
        s.yTo(y); s.rTo(r); s.rxTo(rx); s.ryTo(ry);
      }
      function settle() {
        if (!influenced) return;
        influenced = false;
        if (settleCall) settleCall.kill();
        states.forEach(function (s) { moveTo(s, 0, s.base, 0, 0, opt.settleDuration); });
      }
      function update() {
        frameId = null;
        if ($group && $group.length) {
          const g = $group[0].getBoundingClientRect();
          if (pointerX < g.left - opt.influenceRadius || pointerX > g.right + opt.influenceRadius ||
              pointerY < g.top - opt.influenceRadius || pointerY > g.bottom + opt.influenceRadius) { settle(); return; }
        }
        let hit = false;
        const targets = states.map(function (s) {
          const rect = s.el.getBoundingClientRect();
          const dx = pointerX - (rect.left + rect.width / 2), dy = pointerY - (rect.top + rect.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const strength = Math.max(0, Math.min(1, 1 - dist / opt.influenceRadius));
          const ux = dist ? dx / dist : 0, uy = dist ? dy / dist : 0;
          if (strength > 0) hit = true;
          return { state: s, y: -opt.maxLift * strength, rotation: s.base + ux * opt.maxRotation * strength,
                   rotationX: -uy * opt.maxTilt * strength, rotationY: ux * opt.maxTilt * strength };
        });
        if (!hit) { settle(); return; }
        if (settleCall) { settleCall.kill(); settleCall = null; }
        targets.forEach(function (t) { moveTo(t.state, t.y, t.rotation, t.rotationX, t.rotationY, opt.followDuration); });
        influenced = true;
      }
      function queueUpdate(e) {
        pointerX = e.clientX; pointerY = e.clientY;
        if (!frameId) frameId = window.requestAnimationFrame(update);
      }
      $(window).on("mousemove" + ns, queueUpdate).on("blur" + ns + " scroll" + ns, settle);
      $(document).on("mouseleave" + ns, settle);
      return function () {
        if (frameId) window.cancelAnimationFrame(frameId);
        if (settleCall) settleCall.kill();
        $(window).off(ns); $(document).off(ns);
        gsap.killTweensOf(elements, "y,rotation,rotationX,rotationY,transformPerspective");
        gsap.set(elements, { clearProps: "transform,transform-origin" });
      };
    });
  }

  const H = { PC: PC, MO: MO, REDUCE: REDUCE, mm: mm, revealAt: revealAt, revealEach: revealEach, splitLines: splitLines,
    splitWords: splitWords, countUp: countUp, typeText: typeText, headReveal: headReveal, initMagneticField: initMagneticField };
  window.VW._inits.forEach(function (fn) { fn(H); });

  /* 데모 상단바 — 현재 섹션 */
  document.querySelectorAll(".dh_nav a").forEach(function (a) {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", toggleClass: { targets: a, className: "on" } });
  });

  ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
});
