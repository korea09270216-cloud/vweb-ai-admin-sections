/* =========================================================
   va02 — 관리자 한 곳에서
   · 헤드: headReveal (섹션 유일한 줄 스플릿)
   · 목업: 커서가 메뉴를 하나씩 눌러 오른쪽 화면이 바뀜 (보일 때만 재생, 메뉴 클릭으로 이동)
   · 카드 3장 → 마지막 한 줄 (도장)
   ========================================================= */
VW.add(function (H) {
  const sec = document.querySelector(".va02");
  if (!sec) return;

  const body = sec.querySelector(".va02_body");
  const tabs = [].slice.call(sec.querySelectorAll(".va02_menu button"));
  const panels = [].slice.call(sec.querySelectorAll(".va02_panel"));
  const cursor = sec.querySelector(".va02_cursor");
  const num = sec.querySelector(".va02_num b");
  const ans = sec.querySelector(".va02_a");
  const ANS = ans.textContent;
  const HOLD = 2.4;        // 한 화면 머무는 시간(초)
  const HOLD_CLICK = 4.5;  // 직접 눌렀을 땐 조금 더 오래

  let shown = 0;           // 지금 보이는 패널
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
      b.addEventListener("click", function () { setTab(k); setPanel(k); shown = k; });
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
    t.fromTo(p.querySelector(".va02_txt"), { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.8 }, "< 0%");
    if (i === 0) {
      t.fromTo(p.querySelector(".va02_pop"), { opacity: 0, yPercent: 20, scale: 0.9 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, "< 40%");
    } else if (i === 1) {
      t.fromTo(p.querySelector(".va02_bn_b"), { xPercent: 100 }, { xPercent: 0, duration: 0.9, ease: "power3.inOut" }, "< 70%");
    } else if (i === 2) {
      t.fromTo(p.querySelector(".va02_row_new"), { opacity: 0, yPercent: -30 }, { opacity: 1, yPercent: 0, duration: 0.8 }, "< 40%")
        .fromTo(p.querySelector(".va02_who"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, "< 90%");
    } else if (i === 3) {
      H.countUp(t, num, "< 30%");
      t.fromTo(p.querySelectorAll(".va02_bars s"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.12 }, "< 20%");
    } else if (i === 4) {
      ans.textContent = "";
      t.fromTo(p.querySelector(".va02_q"), { opacity: 0, yPercent: 30, scale: 0.9 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.7, ease: "back.out(1.6)" }, "< 40%")
        .fromTo(ans, { opacity: 0 }, { opacity: 1, duration: 0.3 }, "< 80%");
      H.typeText(t, ans, "", ANS, 0.9, "< 50%");
    }
  }

  // i 번 화면으로 — byCursor: 커서가 가서 누름 / 아니면 사람이 직접 누름
  function go(i, byCursor) {
    if (demo) demo.kill();
    // 이전 컷이 중간에 끊겼으면 남은 패널 정리
    panels.forEach(function (p, k) { if (k !== shown && k !== i) gsap.set(p, { autoAlpha: 0 }); });
    const from = shown;
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
    t.call(function () { setTab(i); setPanel(i); shown = i; }, null, byCursor ? "< 50%" : "< 0%");
    if (from !== i) {
      t.fromTo(panels[from], { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, ease: "none" }, "< 0%")
        .fromTo(panels[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, "< 0%");
    }
    addContent(t, i);
    t.to({}, { duration: byCursor ? HOLD : HOLD_CLICK }, "< 100%");
    if (active) t.play();
  }

  tabs.forEach(function (b, k) {
    b.addEventListener("click", function () { go(k, false); });
  });

  // 커서 첫 자리
  function placeCursor() { if (isPC()) { const c = cursorPos(shown); gsap.set(cursor, { x: c.x, y: c.y }); } }
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

  // GA4 · 메타 · 엑셀 → 가운데로 모여 "브이웹 관리자" 하나로 (PC · 모바일 같은 동작, 블록 하나라 트리거 1개)
  const one = document.querySelector(".va02_one");
  function toCenter(el, axis) {
    const a = el.getBoundingClientRect(), b = one.getBoundingClientRect();
    return axis === "x" ? (b.left + b.width / 2) - (a.left + a.width / 2) : (b.top + b.height / 2) - (a.top + a.height / 2);
  }
  H.revealAt(".va02_merge", function (t) {
    t.from(".va02_old", { opacity: 0, yPercent: 30, stagger: 0.12 }, "< 0%")
      .to(".va02_old", {
        x: function (i, el) { return toCenter(el, "x"); }, y: function (i, el) { return toCenter(el, "y"); },
        scale: 0.6, opacity: 0, duration: 0.8, ease: "power3.in", stagger: 0.06,
      }, "< 110%")
      .fromTo(".va02_one", { opacity: 0.15, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.8)" }, "< 70%");   // 처음부터 흐리게 자리 잡고 있다가 모일 때 켜짐 (빈 화면 1초 방지)
  }, "top 80%");

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

  // 마지막 한 줄 — 앞줄 슈슉 → "누르면 끝." 쾅
  H.revealAt(".va02_end", function (t) {
    t.from(".va02_end_a", { opacity: 0, yPercent: 30 }, "< 0%")
      .from(".va02_end_b", { opacity: 0, scale: 3, duration: 0.7, ease: "expo.in" }, "< 30%");
  }, "top 85%");
});
