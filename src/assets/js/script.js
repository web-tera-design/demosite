/**
 * ===========================================================================
 * JavaScript 共通テンプレート（統合・完全版）
 * ===========================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
  // --- 初期実行 ---
  setHeaderHeight();
  smoothScroll();
  drawerMenu();
  setUpAccordion(); // GSAP版アコーディオン
  modalHandler();
  cTabs();
  externalLinks();
  setUpFormBirthLogic(); // 生年月日・年齢計算

  // --- リサイズ処理 ---
  window.addEventListener(
    "resize",
    debounce(() => {
      setHeaderHeight();
      if (window.handleDrawerResize) window.handleDrawerResize();
    }, 200)
  );
});

/* ===================================================
 * 関数定義
 * =================================================== */

// 1. ヘッダー高さをCSS変数にセット
function setHeaderHeight() {
  const header = document.querySelector(".l-header");
  if (!header) return;
  document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
}

// 2. スムーススクロール
function smoothScroll() {
  const getHeaderHeight = () => document.querySelector(".l-header")?.offsetHeight || 0;

  document.querySelectorAll('a[href^="#"]:not([class*="no-scroll"])').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetPosition = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight();
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });

        // フォーカス移動
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });
}

// 3. ドロワーメニュー
function drawerMenu() {
  const drawerIcon = document.querySelector(".p-drawer-icon") || document.querySelector(".c-drawer-icon");
  const drawer = document.querySelector(".p-drawer") || document.querySelector(".c-drawer");
  const drawerOverlay = document.querySelector(".p-drawer-overlay") || document.querySelector(".c-drawer-overlay");

  if (!drawerIcon || !drawer) return;

  const header = document.querySelector(".l-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const breakpoint = 768;
  let isMenuOpen = false;
  let isMenuOpenAtBreakpoint = false;

  const openMenu = () => {
    drawer.classList.add("js-show");
    drawerIcon.classList.add("js-show");
    drawerOverlay?.classList.add("js-show");
    document.body.classList.add("is-fixed");
    isMenuOpen = true;
  };

  const closeMenu = () => {
    drawer.classList.remove("js-show");
    drawerIcon.classList.remove("js-show");
    drawerOverlay?.classList.remove("js-show");
    document.body.classList.remove("is-fixed");
    isMenuOpen = false;
  };

  const toggleMenu = () => {
    drawer.classList.contains("js-show") ? closeMenu() : openMenu();
  };

  const handleResize = () => {
    if (window.innerWidth > breakpoint && isMenuOpenAtBreakpoint) {
      closeMenu();
    } else if (window.innerWidth <= breakpoint && drawer.classList.contains("js-show")) {
      isMenuOpenAtBreakpoint = true;
    }
  };

  const clickOuter = (event) => {
    if (isMenuOpen && !drawer.contains(event.target) && !drawerIcon.contains(event.target) && (!drawerOverlay || !drawerOverlay.contains(event.target))) {
      closeMenu();
    }
  };

  drawerIcon.addEventListener("click", toggleMenu);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeMenu);
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", clickOuter);

  const drawerNavItems = drawer.querySelectorAll('a[href^="#"]');
  drawerNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      closeMenu();
    });
  });

  window.handleDrawerResize = handleResize;
}

// 4. アコーディオン定義 (GSAP版)
function setUpAccordion() {
  const details = document.querySelectorAll(".js-details");
  if (details.length === 0) return;

  const IS_OPENED_CLASS = "is-opened";

  // 最後の要素を開く仕様
  const last = details[details.length - 1];
  if (last) {
    last.classList.add(IS_OPENED_CLASS);
    last.setAttribute("open", "true");
  }

  details.forEach((element) => {
    const summary = element.querySelector(".js-summary");
    const content = element.querySelector(".js-content");
    if (!summary || !content) return;

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      if (element.classList.contains(IS_OPENED_CLASS)) {
        element.classList.remove(IS_OPENED_CLASS);
        closingAnim(content).then(() => {
          element.removeAttribute("open");
        });
      } else {
        element.classList.add(IS_OPENED_CLASS);
        element.setAttribute("open", "true");
        openingAnim(content);
      }
    });
  });
}

const closingAnim = (content) => {
  return gsap.to(content, {
    height: 0,
    opacity: 0,
    duration: 0.3,
    ease: "power3.out",
    overwrite: true,
  });
};

const openingAnim = (content) => {
  return gsap.fromTo(content, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.3, ease: "power3.out", overwrite: true });
};

// 5. フォーム生年月日・年齢計算ロジック
function setUpFormBirthLogic() {
  const today = new Date();
  const limitDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
  const limitYear = limitDate.getFullYear();

  /** 年齢計算ロジック */
  const getCalculatedAge = (birthDate) => {
    if (!birthDate || isNaN(birthDate.getTime())) return "";
    let age = today.getFullYear() - birthDate.getFullYear();
    const thisYearBirth = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (today < thisYearBirth) age--;
    if (age < 20) return "error";
    return age;
  };

  // --- パターンA: セレクトボックス形式 ---
  const ys = document.getElementById("birth-year-s");
  const ms = document.getElementById("birth-month-s");
  const ds = document.getElementById("birth-day-s");
  const ageResultS = document.getElementById("age-from-select");

  if (ys && ms && ds && ageResultS) {
    if (ys.options.length <= 1) {
      for (let i = limitYear; i >= limitYear - 75; i--) ys.add(new Option(i, i));
      for (let i = 1; i <= 12; i++) ms.add(new Option(i, i));
      for (let i = 1; i <= 31; i++) ds.add(new Option(i, i));
    }

    const updateAgeS = () => {
      if (ys.value && ms.value && ds.value) {
        const res = getCalculatedAge(new Date(ys.value, ms.value - 1, ds.value));
        if (res === "error") {
          alert("20歳未満の方はご利用いただけません");
          ys.value = "";
          ms.value = "";
          ds.value = "";
          ageResultS.value = "";
        } else {
          ageResultS.value = res;
        }
      }
    };
    [ys, ms, ds].forEach((el) => el.addEventListener("change", updateAgeS));
  }

  // --- パターンB: カレンダー形式 ---
  const dateInput = document.getElementById("birth-date-cal");
  const ageResultD = document.getElementById("age-from-date");

  if (dateInput && ageResultD) {
    const yyyy = limitDate.getFullYear();
    const mm = String(limitDate.getMonth() + 1).padStart(2, "0");
    const dd = String(limitDate.getDate()).padStart(2, "0");
    dateInput.setAttribute("max", `${yyyy}-${mm}-${dd}`);

    dateInput.addEventListener("change", function () {
      if (this.value) {
        const res = getCalculatedAge(new Date(this.value));
        if (res === "error") {
          alert("20歳未満の方はご利用いただけません");
          this.value = "";
          ageResultD.value = "";
        } else {
          ageResultD.value = res;
        }
      }
    });
  }
}

// 6. モーダル
function modalHandler() {
  const dialogs = document.querySelectorAll("dialog");
  const modalOpenBtns = document.querySelectorAll(".js-modal-open");
  const modalCloseBtns = document.querySelectorAll(".js-modal-close");

  modalOpenBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dialog = document.getElementById(btn.dataset.dialog);
      if (!dialog) return;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      dialog.classList.add("js-show");
      document.body.style.overflow = "hidden";
    });
  });

  modalCloseBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dialog = btn.closest("dialog");
      if (dialog) dialog.close();
    });
  });

  dialogs.forEach((dialog) => {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      dialog.classList.remove("js-show");
      document.body.style.overflow = "";
    });
  });
}

// 7. タブ
function cTabs() {
  document.querySelectorAll(".c-tabs").forEach((container) => {
    const tabs = container.querySelectorAll(".c-tabs__tab");
    const panels = container.querySelectorAll(".c-tabs__content-wrap");

    tabs.forEach((tab, i) => {
      tab.setAttribute("tabindex", tab.getAttribute("aria-selected") === "true" ? "0" : "-1");
      tab.addEventListener("click", () => activateTab(i));
    });

    function activateTab(index) {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", selected);
        tab.setAttribute("tabindex", selected ? "0" : "-1");
        panels[i].classList.toggle("js-show", selected);
      });
    }
  });
}

// 8. 外部リンク調整
function externalLinks() {
  const domain = window.location.hostname;
  document.querySelectorAll("a[href^='http']").forEach((a) => {
    if (!a.href.includes(domain)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
  });
}

// 9. ユーティリティ: debounce
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// // --- 送信完了後のリダイレクト ---
// document.addEventListener(
//   "wpcf7mailsent",
//   () => {
//     location = "/career-design/thanks/";
//   },
//   false
// );
