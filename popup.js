import { fetchClaudeUsage, fetchChatGPTUsage } from "./api.js";
import { formatETA, getColorClass } from "./utils.js";

const $ = (id) => document.getElementById(id);

function renderWindow(barId, pctId, resetId, utilization, resetsAt) {
  const bar = $(barId);
  const pct = $(pctId);
  const reset = $(resetId);

  const rounded = Math.round(utilization);
  pct.textContent = `${rounded}%`;
  bar.style.width = `${Math.min(rounded, 100)}%`;
  bar.className = `bar-fill ${getColorClass(rounded)}`;

  if (resetsAt) {
    reset.textContent = `resets in ${formatETA(resetsAt)}`;
  } else {
    reset.textContent = "";
  }
}

function showError(provider, message) {
  const body = $(`${provider}-body`);
  const error = $(`${provider}-error`);
  body.hidden = true;
  error.hidden = false;
  error.textContent = message;
}

function showBody(provider) {
  const body = $(`${provider}-body`);
  const error = $(`${provider}-error`);
  body.hidden = false;
  error.hidden = true;
}

async function loadClaude() {
  $("claude-status").textContent = "loading...";
  try {
    const data = await fetchClaudeUsage();
    showBody("claude");
    renderWindow(
      "claude-5h-bar",
      "claude-5h-pct",
      "claude-5h-reset",
      data.fiveHour.utilization,
      data.fiveHour.resetsAt,
    );
    renderWindow(
      "claude-7d-bar",
      "claude-7d-pct",
      "claude-7d-reset",
      data.sevenDay.utilization,
      data.sevenDay.resetsAt,
    );
    $("claude-status").textContent = "";
  } catch (err) {
    showError("claude", err.message);
    $("claude-status").textContent = "error";
  }
}

async function loadChatGPT() {
  $("chatgpt-status").textContent = "loading...";
  try {
    const data = await fetchChatGPTUsage();
    showBody("chatgpt");
    renderWindow(
      "chatgpt-pri-bar",
      "chatgpt-pri-pct",
      "chatgpt-pri-reset",
      data.primary.utilization,
      data.primary.resetsAt,
    );
    renderWindow(
      "chatgpt-sec-bar",
      "chatgpt-sec-pct",
      "chatgpt-sec-reset",
      data.secondary.utilization,
      data.secondary.resetsAt,
    );
    $("chatgpt-status").textContent = "";
  } catch (err) {
    showError("chatgpt", err.message);
    $("chatgpt-status").textContent = "error";
  }
}

async function refresh() {
  const btn = $("refresh");
  btn.classList.add("spinning");
  btn.disabled = true;

  await Promise.allSettled([loadClaude(), loadChatGPT()]);

  btn.classList.remove("spinning");
  btn.disabled = false;
}

$("refresh").addEventListener("click", refresh);

// Auto-fetch on popup open
refresh();
