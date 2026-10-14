# 브이웹 메인 새 섹션 — 검색 · 관리자

브이웹.com 메인에 넣을 새 섹션 2개의 시안과 GSAP 모션 데모입니다.

| # | 섹션 | 내용 |
|---|---|---|
| 01 | V SEARCH. | 검색에 잘 뜨는 홈페이지 — 네이버 · 구글 · AI |
| 02 | V ADMIN. | 관리자 한 곳에서 — 팝업 · 배너 · 문의 · 손님 |

## 구성

```
index.html          시안 (상단바 · 커버 · 하단 안내는 데모용)
css/base.css        공통 (PC 1920 기준 vw) / css/base_mo.css 모바일 (≤599px, 390 기준 vw)
css/va01.css        01 섹션 (하단에 모바일 블록)
css/va02.css        02 섹션 (하단에 모바일 블록)
js/base.js          공통 헬퍼 + 실행 순서 (GSAP 3.13 · ScrollTrigger · ScrollToPlugin + jQuery)
js/va01.js · va02.js 섹션 모션
```

## 실제 메인에 붙일 때

- 섹션 클래스는 `va01` · `va02` 접두어라 기존 `con2`~`con9`, 다른 시안 `vs01`~`vs05`와 겹치지 않습니다.
- `.dh`(상단바) · `.cv`(커버) · `.df`(하단 안내)는 데모용이라 옮기지 않습니다.
- 화면 속 브랜드(모노브루)와 숫자는 예시입니다.
- 다른 시안: https://korea09270216-cloud.github.io/vweb-main-sections/
