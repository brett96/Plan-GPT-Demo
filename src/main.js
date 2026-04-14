function getUseCaseEls() {
  const tabList = document.querySelector(".uc-tabs");
  const tabs = Array.from(document.querySelectorAll(".uc-tab-btn"));
  const panels = Array.from(document.querySelectorAll(".uc-panel"));
  return { tabList, tabs, panels };
}

function setActiveUseCase(activeIndex) {
  const { tabs, panels } = getUseCaseEls();

  for (const tab of tabs) {
    const idx = Number(tab.dataset.ucIndex);
    const isActive = idx === activeIndex;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  }

  for (const panel of panels) {
    const isActive = panel.id === `uc-${activeIndex}`;
    panel.classList.toggle("active", isActive);
    if (isActive) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  }
}

function onTabClick(e) {
  const btn = e.target.closest(".uc-tab-btn");
  if (!btn) return;
  const idx = Number(btn.dataset.ucIndex);
  if (Number.isNaN(idx)) return;
  setActiveUseCase(idx);
}

function onTabKeyDown(e) {
  const { tabs } = getUseCaseEls();
  const current = e.target.closest(".uc-tab-btn");
  if (!current) return;

  const currentIndex = tabs.indexOf(current);
  if (currentIndex === -1) return;

  const key = e.key;
  if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return;
  e.preventDefault();

  let nextIndex = currentIndex;
  if (key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  if (key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  if (key === "Home") nextIndex = 0;
  if (key === "End") nextIndex = tabs.length - 1;

  const nextTab = tabs[nextIndex];
  nextTab.focus();
  const ucIndex = Number(nextTab.dataset.ucIndex);
  if (!Number.isNaN(ucIndex)) setActiveUseCase(ucIndex);
}

function initUseCaseTabs() {
  const { tabList, tabs } = getUseCaseEls();
  if (!tabList || tabs.length === 0) return;

  tabList.addEventListener("click", onTabClick);
  tabList.addEventListener("keydown", onTabKeyDown);

  const initiallyActive = tabs.find((t) => t.classList.contains("active"));
  const initialIndex = initiallyActive ? Number(initiallyActive.dataset.ucIndex) : 0;
  setActiveUseCase(Number.isNaN(initialIndex) ? 0 : initialIndex);
}

initUseCaseTabs();

