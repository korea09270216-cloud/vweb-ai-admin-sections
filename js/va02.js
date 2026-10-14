/* =========================================================
   va02 — 관리자 한 곳에서 (방문자 분석)
   · 헤드: headReveal (섹션 유일한 줄 스플릿)
   · 목업: 커서가 메뉴를 하나씩 눌러 오른쪽 화면이 바뀜 (보일 때만 재생, 메뉴 클릭으로 이동)
     전환은 순서대로 — 옛 화면이 다 빠진 뒤(0.2s) 새 화면 등장. 두 화면이 겹쳐 보이는 순간 없음
   · 카드 3장 → 마지막 한 줄 (도장)
   ========================================================= */
VW.add(function (H) {
  const sec = document.querySelector(".va02");
  if (!sec) return;

  const body = sec.querySelector(".va02_body");
  const tabs = [].slice.call(sec.querySelectorAll(".va02_menu button"));
  const panels = [].slice.call(sec.querySelectorAll(".va02_panel"));
  const cursor = sec.querySelector(".va02_cursor");
  const HOLD = 2.4;        // 한 화면 머무는 시간(초)
  const HOLD_CLICK = 4.5;  // 직접 눌렀을 땐 조금 더 오래

  let demo = null;         // 지금 도는 한 컷
  let active = false;      // 화면 안에 있나

  function setTab(i) {
    tabs.forEach(function (b, k) {
      b.classList.toggle("on", k === i);
      b.setAttribute("aria-selected", k === i ? "true" : "false");
    });
  }
  function setPanel(i) {
    panels.forEach(function (p, k) { p.classList.toggle("on", k === i); });
  }

  /* ---------- 줄인 모션: 정지 상태 + 클릭만 ---------- */
  if (H.REDUCE) {
    cursor.style.display = "none";
    tabs.forEach(function (b, k) {
      b.addEventListener("click", function () { setTab(k); setPanel(k); });
    });
    return;
  }

  gsap.set(panels, { autoAlpha: 0 });
  gsap.set(panels[0], { autoAlpha: 1 });

  const isPC = function () { return window.matchMedia(H.PC).matches; };
  function cursorPos(i) {
    const r = tabs[i].getBoundingClientRect();
    const b = body.getBoundingClientRect();
    return { x: r.left - b.left + r.width * 0.62, y: r.top - b.top + r.height * 0.5 };
  }

  // 패널별 짧은 데모 — fromTo 라 몇 번을 다시 틀어도 같은 모양
  function addContent(t, i) {
    const p = panels[i];
    const q = function (s) { return p.querySelectorAll(s); };
    t.fromTo(p.querySelector(".va02_txt"), { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.8 }, "< 0%");
    if (i === 0) {          // 접속자 — 숫자 촤르륵 → 휴대폰 비율 채움
      H.countUp(t, p.querySelector(".va02_num b"), "< 20%");
      t.fromTo(q(".va02_split s"), { scaleX: 0 }, { scaleX: 1, duration: 1.2 }, "< 35%")
        .fromTo(q(".va02_legend span"), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.12 }, "< 50%");
    } else if (i === 1) {   // 광고 성과 — 줄이 차오르고 → 문의 1위 콕
      t.fromTo(q(".va02_rank li"), { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.8, stagger: 0.12 }, "< 20%")
        .fromTo(q(".va02_rank s"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, stagger: 0.12 }, "< 30%")
        .fromTo(q(".va02_rank strong"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, "< 80%");
    } else if (i === 2) {   // 체류 · 행동 — 시간 촤르륵 → 어디까지 봤나
      H.countUp(t, p.querySelector(".va02_num b"), "< 20%");
      t.fromTo(q(".va02_bars s"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.12 }, "< 35%");
    } else if (i === 3) {   // 광고 → 문의 — 42 → 12 → 5 차례로 → 비율 콕
      t.fromTo(q(".va02_steps li"), { opacity: 0, xPercent: -20 }, { opacity: 1, xPercent: 0, duration: 0.8, stagger: 0.25 }, "< 20%")
        .fromTo(q(".va02_rate"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, "< 85%");
    }
  }

  // i 번 화면으로 — byCursor: 커서가 가서 누름 / 아니면 사람이 직접 누름
  function go(i, byCursor) {
    if (demo) demo.kill();
    // 지금 조금이라도 보이는 다른 화면 (중간에 끊긴 전환 포함) — 이게 다 빠진 뒤에만 새 화면
    const out = panels.filter(function (p, k) { return k !== i && gsap.getProperty(p, "opacity") > 0; });
    const fadeIn = out.length > 0 || gsap.getProperty(panels[i], "opacity") < 1;
    if (out.length) gsap.set(panels[i], { autoAlpha: 0 });

    const t = gsap.timeline({ paused: !active, defaults: { duration: 1, ease: "power4.out" }, onComplete: function () { go((i + 1) % panels.length, true); } });
    demo = t;

    const pc = isPC();
    if (byCursor && pc) {
      const c = cursorPos(i);
      t.to(cursor, { x: c.x, y: c.y, duration: 0.7, ease: "power3.inOut" }, "< 0%")
        .to([cursor, tabs[i]], { scale: 0.86, duration: 0.12, ease: "power1.inOut", yoyo: true, repeat: 1 }, "< 100%");
    } else if (pc) {
      const c2 = cursorPos(i);
      gsap.set(cursor, { x: c2.x, y: c2.y });
    }
    t.call(function () { setTab(i); setPanel(i); }, null, "< 50%");
    if (out.length) t.to(out, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, "< 0%");                     // ① 옛 화면 완전히 빠짐
    if (fadeIn) t.fromTo(panels[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, out.length ? "< 100%" : "< 0%"); // ② 그 다음 새 화면
    addContent(t, i);
    t.to({}, { duration: byCursor ? HOLD : HOLD_CLICK }, "< 100%");
    if (active) t.play();
  }

  tabs.forEach(function (b, k) {
    b.addEventListener("click", function () { go(k, false); });
  });

  // 커서 첫 자리
  function placeCursor() { if (isPC()) { const c = cursorPos(Math.max(0, tabs.findIndex(function (b) { return b.classList.contains("on"); }))); gsap.set(cursor, { x: c.x, y: c.y }); } }
  placeCursor();
  window.addEventListener("resize", function () { if (!demo || !demo.isActive()) placeCursor(); });

  // 보일 때만 돈다 — 첫 진입이면 첫 화면 데모부터
  ScrollTrigger.create({
    trigger: ".va02_mock",
    start: "top 80%",
    end: "bottom 15%",
    // markers: true,
    onToggle: function (self) {
      active = self.isActive;
      if (!demo) { if (active) go(0, false); return; }
      if (active) demo.play(); else demo.pause();
    },
  });

  /* ---------- 등장 ---------- */
  H.headReveal(".va02");

  // 따로 쓰던 것(왼쪽) → 브이웹 관리자(오른쪽): 박스 등장 → 왼쪽 줄 긋기 → 오른쪽 체크 (gsap.md §3-15 PC 좌우 동시, 모바일은 박스별 트리거)
  function strikeIn(t, pos) { t.from(".va02_strike", { scaleX: 0, duration: 0.5, ease: "power3.inOut", stagger: 0.12 }, pos); }
  function checkIn(t, pos) { t.from(".va02_after li em", { scale: 0, duration: 0.5, ease: "back.out(2.4)", stagger: 0.12 }, pos); }
  H.mm.add(H.PC, function () {
    H.revealAt(".va02_merge", function (t) {
      t.from(".va02_before", { opacity: 0, yPercent: 12 }, "< 0%")
        .from(".va02_after", { opacity: 0, yPercent: 12 }, "< 0%")
        .from(".va02_arrow", { opacity: 0, xPercent: -30, duration: 0.8 }, "< 30%");
      strikeIn(t, "< 30%");
      checkIn(t, "< 40%");
    }, "top 80%");
  });
  H.mm.add(H.MO, function () {
    H.revealAt(".va02_before", function (t) {
      t.from(".va02_before", { opacity: 0, yPercent: 12, duration: 0.95 }, "< 0%");
      strikeIn(t, "< 50%");
    }, "top 85%");
    H.revealAt(".va02_after", function (t) {
      t.from(".va02_arrow", { opacity: 0, yPercent: -30, duration: 0.8 }, "< 0%")
        .from(".va02_after", { opacity: 0, yPercent: 12, duration: 0.95 }, "< 20%");
      checkIn(t, "< 50%");
    }, "top 85%");
  });

  H.mm.add(H.PC, function () {
    H.revealAt(".va02_mock", function (t) {
      t.from(".va02_mock", { opacity: 0, yPercent: 6 }, "< 0%");
    });
    H.revealAt(".va02_cards", function (t) {
      t.from(".va02_cards li", { opacity: 0, yPercent: 30, stagger: 0.12 }, "< 0%");
    }, "top 88%");
  });
  H.mm.add(H.MO, function () {
    H.revealAt(".va02_mock", function (t) {
      t.from(".va02_mock", { opacity: 0, yPercent: 6, duration: 0.95 }, "< 0%");
    }, "top 85%");
    H.revealEach(".va02_cards li", { opacity: 0, yPercent: 30 }, "top 90%");
  });

  // 마지막 한 줄 — 앞줄 슈슉 → "사장님은 보기만." 쾅
  H.revealAt(".va02_end", function (t) {
    t.from(".va02_end_a", { opacity: 0, yPercent: 30 }, "< 0%")
      .from(".va02_end_b", { opacity: 0, scale: 3, duration: 0.7, ease: "expo.in" }, "< 30%");
  }, "top 85%");
});
