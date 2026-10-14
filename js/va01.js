/* =========================================================
   va01 · 검색에 잘 뜨는 홈페이지
   등장: 헤드(공통) → 장면1·2(캡션+목업 동시) → 카드 3장
   데모 루프: 휴대폰 검색 / AI 채팅 — 화면 안에서만 재생 (onToggle)
   ========================================================= */
VW.add(function (H) {
  const S = ".va01";
  if (!document.querySelector(S)) return;

  H.headReveal(S);
  if (H.REDUCE) return; // CSS 기본값 = 최종 상태

  const RISE = { opacity: 0, yPercent: 30 };
  const STAGE = { opacity: 0, yPercent: 12 };

  /* ---------- 등장 : PC — 캡션·목업 좌우 동시 ---------- */
  H.mm.add(H.PC, function () {
    [".va01_scene1", ".va01_scene2"].forEach(function (sc) {
      H.revealAt(sc, function (t) {
        t.from(sc + " .va01_stage", STAGE, "< 0%")           // 0.00s 무대
          .from(sc + " .va01_num", RISE, "< 0%")              // 0.00s 짝 — 동시
          .from(sc + " .va01_cap_tit", RISE, "< 25%");        // 0.25s
      }, "top 75%");
    });

    H.revealAt(".va01_cards", function (t) {
      t.from(".va01_card", { opacity: 0, yPercent: 20, stagger: 0.12 }, "< 0%")
        .from(".va01_ic", { opacity: 0, scale: 0.6, duration: 0.8, ease: "back.out(1.7)", stagger: 0.12 }, "< 35%");
    }, "top 85%");
  });

  /* ---------- 등장 : 모바일 — 요소마다 자기 트리거 ---------- */
  H.mm.add(H.MO, function () {
    H.revealEach(".va01_cap", RISE);
    H.revealEach(".va01_stage", STAGE);
    H.revealEach(".va01_card", { opacity: 0, yPercent: 20 });
  });

  /* ---------- 자기장 호버 (PC 카드) ---------- */
  H.initMagneticField({ selector: ".va01_card", group: ".va01_cards", influenceRadius: 260, maxRotation: 1.5, maxTilt: 5, maxLift: 6, ns: "va01mag" });

  /* ---------- 루프 재생/정지 ---------- */
  function playInView(trigger, tl) {
    ScrollTrigger.create({
      trigger: trigger, start: "top 75%", end: "bottom 10%",
      // markers: true,
      onToggle: function (self) { if (self.isActive) tl.play(); else tl.pause(); },
    });
  }

  /* ---------- 데모 1 : 검색 → 우리 가게 ---------- */
  const q = document.querySelector(".va01_q");
  const Q = q.textContent;
  const hit = ".va01_hit", sk = ".va01_sk", tag = ".va01_tag";
  q.textContent = "";
  gsap.set([hit, sk], { opacity: 0, yPercent: 20 });

  const p = gsap.timeline({ paused: true, repeat: -1, defaults: { duration: 1, ease: "power4.out" } });
  p.to({}, { duration: 0.4 }, "< 0%");                                                         // 숨 고르기
  H.typeText(p, q, "", Q, 1.1, "< 100%");                                                      // 타이핑
  p.fromTo(".va01_btn", { scale: 1 }, { scale: 0.88, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, "< 100%") // 검색 누름
    .fromTo(hit, { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: 0 }, "< 60%")          // 우리 가게 결과
    .fromTo(sk, { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: 0, stagger: 0.1 }, "< 20%")
    .fromTo(tag, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, "< 30%") // "우리 가게" 꼬리표
    .to({}, { duration: 2.6 }, "< 100%")                                                      // 보여주기
    .to([hit, sk], { opacity: 0, duration: 0.5, ease: "power2.in" }, "< 100%");               // 정리
  H.typeText(p, q, Q, "", 0.5, "< 0%");
  playInView(".va01_scene1 .va01_stage", p);

  /* ---------- 데모 2 : AI 에게 물으면 → 주소 ---------- */
  const me = ".va01_me", dots = ".va01_dots", ans = ".va01_ans", rows = ".va01_info > *";
  gsap.set([me, ans], { opacity: 0, yPercent: 12 });
  gsap.set(rows, { opacity: 0 });

  const c = gsap.timeline({ paused: true, repeat: -1, defaults: { duration: 1, ease: "power4.out" } });
  c.to({}, { duration: 0.4 }, "< 0%")
    .fromTo(me, { opacity: 0, yPercent: 12 }, { opacity: 1, yPercent: 0, duration: 0.7 }, "< 100%")   // 질문
    .fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.3 }, "< 70%")                              // 생각 중…
    .fromTo(".va01_dots i", { opacity: 0.3 }, { opacity: 1, duration: 0.3, ease: "sine.inOut", stagger: 0.12, repeat: 3, yoyo: true }, "< 0%")
    .to(dots, { opacity: 0, duration: 0.2, ease: "power2.in" }, "< 100%")
    .fromTo(ans, { opacity: 0, yPercent: 12 }, { opacity: 1, yPercent: 0, duration: 0.8 }, "< 60%")   // 답
    .fromTo(rows, { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.15 }, "< 30%")
    .to({}, { duration: 2.6 }, "< 100%")
    .to([me, ans], { opacity: 0, duration: 0.5, ease: "power2.in" }, "< 100%");
  playInView(".va01_scene2 .va01_stage", c);
});
