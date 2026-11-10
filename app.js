"use strict";

const suitIcons = { "大阿尔卡那": "star", "权杖": "wand", "圣杯": "cup", "宝剑": "sword", "星币": "coin" };
const cardCountInput = document.getElementById("cardCount");
const cardsContainer = document.getElementById("cardsContainer");
const timestampEl = document.getElementById("timestamp");
const noticeText = document.getElementById("noticeText");
const errorMsg = document.getElementById("errorMsg");
const emptyState = document.getElementById("emptyState");
const resultFooter = document.getElementById("resultFooter");
const clearBtn = document.getElementById("clearBtn");
const results = document.getElementById("results");
let lastDrawCount = 3;

function drawCards(count, random = Math.random) {
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new RangeError("抽牌张数必须为 1–10 的整数。");
  }
  const deck = [...TAROT_DECK];
  return Array.from({ length: count }, () => {
    const [card] = deck.splice(Math.floor(random() * deck.length), 1);
    const reversed = random() >= 0.5;
    return { ...card, reversed, orientation: reversed ? "逆位" : "正位", reading: reversed ? card.reversed : card.upright };
  });
}

function clearError() {
  errorMsg.hidden = true;
  errorMsg.textContent = "";
  cardCountInput.removeAttribute("aria-invalid");
}

function renderCard(card, index) {
  const article = document.createElement("article");
  article.className = "reading-card";
  article.setAttribute("aria-labelledby", `card-title-${index}`);
  // Only authored, local deck data is inserted here, never user input.
  article.innerHTML = `
    <div class="card-top">
      <div class="card-emblem ${card.reversed ? "reversed" : ""}" aria-hidden="true">
        <span class="card-number">${String(card.number).padStart(2, "0")}</span>
        <svg><use href="#icon-${suitIcons[card.suit]}"/></svg>
      </div>
      <div class="card-meta">
        <p class="card-index">第 ${index + 1} 张 · ${card.suit}</p>
        <div class="card-title-row"><h3 id="card-title-${index}">${card.name}</h3><span class="orientation ${card.reversed ? "reversed" : ""}">${card.orientation}</span></div>
      </div>
    </div>
    <ul class="keywords" aria-label="牌义关键词">${card.reading.keywords.map(keyword => `<li>${keyword}</li>`).join("")}</ul>
    <h4 class="meaning-label">${card.orientation}解读</h4>
    <p class="meaning">${card.reading.meaning}</p>`;
  return article;
}

function showDraw(count) {
  clearError();
  const drawn = drawCards(count);
  cardCountInput.value = String(count);
  lastDrawCount = count;
  cardsContainer.replaceChildren(...drawn.map(renderCard));
  cardsContainer.classList.toggle("single-card", count === 1);
  emptyState.hidden = true;
  resultFooter.hidden = false;
  clearBtn.hidden = false;
  noticeText.textContent = `已抽取 ${count} 张牌 · 以下为每张牌对应正逆位的解读`;
  timestampEl.textContent = `抽牌时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`;
  results.focus({ preventScroll: true });
  results.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

document.getElementById("quickOne").addEventListener("click", () => showDraw(1));
document.getElementById("quickThree").addEventListener("click", () => showDraw(3));
document.getElementById("redrawBtn").addEventListener("click", () => showDraw(lastDrawCount));
document.getElementById("drawForm").addEventListener("submit", event => {
  event.preventDefault();
  const value = cardCountInput.value.trim();
  const count = Number(value);
  if (!value || !Number.isInteger(count) || count < 1 || count > 10) {
    errorMsg.textContent = "请输入 1 到 10 之间的整数。";
    errorMsg.hidden = false;
    cardCountInput.setAttribute("aria-invalid", "true");
    cardCountInput.focus();
    return;
  }
  showDraw(count);
});
cardCountInput.addEventListener("input", clearError);
clearBtn.addEventListener("click", () => {
  cardsContainer.replaceChildren();
  cardsContainer.classList.remove("single-card");
  timestampEl.textContent = "";
  clearError();
  emptyState.hidden = false;
  resultFooter.hidden = true;
  clearBtn.hidden = true;
  noticeText.textContent = "结果已清空，选择一种抽牌方式，开始新的抽牌。";
  document.getElementById("quickOne").focus({ preventScroll: true });
  document.querySelector(".draw-panel").scrollIntoView({ behavior: "auto", block: "start" });
});
