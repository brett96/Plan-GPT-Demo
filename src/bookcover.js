// Exposed on `window` for inline onclick handlers in BookCover markup.

function toggleMobileMenu() {
  const menu = document.getElementById("nav-mobile-menu");
  if (menu) menu.classList.toggle("open");
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("nav-mobile-menu");
  if (menu && !menu.contains(e.target) && !e.target.closest(".nav-hamburger")) {
    menu.classList.remove("open");
  }
});

function showAG(idx, btn) {
  document.querySelectorAll(".ag-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".ag-tab-btn").forEach((b) => b.classList.remove("active"));
  const panel = document.getElementById(`ag-${idx}`);
  if (panel) panel.classList.add("active");
  if (btn) btn.classList.add("active");
}

function showMC(idx, btn) {
  document.querySelectorAll(".mc-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".mc-tab-btn").forEach((b) => b.classList.remove("active"));
  const panel = document.getElementById(`mc-${idx}`);
  if (panel) panel.classList.add("active");
  if (btn) btn.classList.add("active");
}

function showUC(idx, btn) {
  document.querySelectorAll(".uc-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".uc-tab-btn").forEach((b) => b.classList.remove("active"));
  const panel = document.getElementById(`uc-${idx}`);
  if (panel) panel.classList.add("active");
  if (btn) btn.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const firstPanel = document.getElementById("uc-0");
  const firstBtn = document.querySelector(".uc-tab-btn");
  if (firstPanel) firstPanel.classList.add("active");
  if (firstBtn) firstBtn.classList.add("active");

  const firstMC = document.getElementById("mc-0");
  const firstMCBtn = document.querySelector(".mc-tab-btn");
  if (firstMC) firstMC.classList.add("active");
  if (firstMCBtn) firstMCBtn.classList.add("active");

  const firstAG = document.getElementById("ag-0");
  const firstAGBtn = document.querySelector(".ag-tab-btn");
  if (firstAG) firstAG.classList.add("active");
  if (firstAGBtn) firstAGBtn.classList.add("active");
});

Object.assign(window, {
  toggleMobileMenu,
  showAG,
  showMC,
  showUC,
});
