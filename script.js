document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 導覽連結以平滑捲動前往存在的區塊。
  const navigation = document.querySelector("#navigation");
  navigation?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
    });
  });

  // 依作品的 data-category 屬性篩選卡片。
  const portfolio = document.querySelector("#portfolio");
  const filterButtons = portfolio?.querySelectorAll(".filter-button") ?? [];
  const cards = portfolio?.querySelectorAll(".card[data-category]") ?? [];

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;
      if (!selectedCategory) return;

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      cards.forEach((card) => {
        const isVisible = selectedCategory === "all" || card.dataset.category === selectedCategory;
        card.hidden = !isVisible;
      });
    });
  });

  // 以原生 dialog 呈現作品圖片與簡介。
  const preview = document.querySelector("#work-preview");
  const previewImage = preview?.querySelector(".preview-image");
  const previewTitle = preview?.querySelector("#preview-title");
  const previewDescription = preview?.querySelector(".preview-description");
  const closePreviewButton = preview?.querySelector(".preview-close");

  const openPreview = (card) => {
    if (!preview || !previewImage || !previewTitle || !previewDescription) return;

    const image = card.querySelector("img");
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    if (!image || !title || !description) return;

    previewImage.src = image.currentSrc || image.src;
    previewImage.alt = image.alt;
    previewTitle.textContent = title.textContent.trim();
    previewDescription.textContent = description.textContent.trim();

    if (typeof preview.showModal === "function") {
      preview.showModal();
    } else {
      preview.setAttribute("open", "");
    }
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => openPreview(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPreview(card);
      }
    });
  });

  closePreviewButton?.addEventListener("click", () => {
    if (!preview) return;
    if (typeof preview.close === "function") {
      preview.close();
    } else {
      preview.removeAttribute("open");
    }
  });

  preview?.addEventListener("click", (event) => {
    if (event.target !== preview) return;
    if (typeof preview.close === "function") {
      preview.close();
    } else {
      preview.removeAttribute("open");
    }
  });

  // 使用 IntersectionObserver 讓區塊進入畫面時淡入。
  const revealTargets = document.querySelectorAll("main > header, main > section, footer");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((element) => {
      element.classList.add("scroll-reveal");
      revealObserver.observe(element);
    });
  }

  // 捲動至一定距離後顯示回頂部按鈕。
  const backToTopButton = document.querySelector("#back-to-top");
  const updateBackToTopVisibility = () => {
    if (!backToTopButton) return;
    backToTopButton.classList.toggle("is-visible", window.scrollY > 420);
  };

  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
  updateBackToTopVisibility();

  backToTopButton?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  });

  // 更新頁尾年份，並提供一致的按鈕按壓回饋。
  const currentYear = document.querySelector("#current-year");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("pointerdown", () => button.classList.add("is-pressed"));
    ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
      button.addEventListener(eventName, () => button.classList.remove("is-pressed"));
    });
  });
});