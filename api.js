const BASE_HEADERS_CLAUDE = {
  Referer: "https://claude.ai/chats",
  Origin: "https://claude.ai",
  Accept: "application/json, text/plain, */*",
};

const BASE_HEADERS_CHATGPT = {
  Referer: "https://chatgpt.com/",
  Origin: "https://chatgpt.com",
  Accept: "*/*",
};

function buildCookieHeader(cookies) {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

/**
 * Fetch Claude usage data.
 * Returns { fiveHour: { utilization, resetsAt }, sevenDay: { utilization, resetsAt } }
 */
export async function fetchClaudeUsage() {
  // Get org ID from lastActiveOrg cookie
  const orgCookie = await chrome.cookies.get({
    url: "https://claude.ai",
    name: "lastActiveOrg",
  });
  if (!orgCookie) {
    throw new Error("Not logged in to Claude (missing lastActiveOrg cookie)");
  }
  const orgId = orgCookie.value;

  // Get all cookies for the domain
  const cookies = await chrome.cookies.getAll({ domain: ".claude.ai" });
  if (cookies.length === 0) {
    throw new Error("No Claude cookies found");
  }

  const resp = await fetch(
    `https://claude.ai/api/organizations/${orgId}/usage`,
    {
      headers: {
        ...BASE_HEADERS_CLAUDE,
        Cookie: buildCookieHeader(cookies),
      },
      credentials: "include",
    },
  );

  if (!resp.ok) {
    if (resp.status === 403) {
      throw new Error("Claude auth error (403) — try refreshing claude.ai");
    }
    throw new Error(`Claude API error: ${resp.status}`);
  }

  const data = await resp.json();

  return {
    fiveHour: {
      utilization: data.five_hour?.utilization ?? 0,
      resetsAt: data.five_hour?.resets_at ?? null,
    },
    sevenDay: {
      utilization: data.seven_day?.utilization ?? 0,
      resetsAt: data.seven_day?.resets_at ?? null,
    },
  };
}

/**
 * Fetch ChatGPT usage data.
 * Returns { primary: { utilization, resetsAt }, secondary: { utilization, resetsAt } }
 */
export async function fetchChatGPTUsage() {
  // Get all cookies
  const cookies = await chrome.cookies.getAll({ domain: ".chatgpt.com" });
  if (cookies.length === 0) {
    throw new Error("Not logged in to ChatGPT (no cookies found)");
  }

  const cookieHeader = buildCookieHeader(cookies);

  // Step 1: Get access token from session endpoint
  const sessionResp = await fetch("https://chatgpt.com/api/auth/session", {
    headers: {
      ...BASE_HEADERS_CHATGPT,
      Cookie: cookieHeader,
    },
    credentials: "include",
  });

  if (!sessionResp.ok) {
    if (sessionResp.status === 403) {
      throw new Error(
        "ChatGPT auth error (403) — try refreshing chatgpt.com",
      );
    }
    throw new Error(`ChatGPT session error: ${sessionResp.status}`);
  }

  const sessionData = await sessionResp.json();
  const accessToken = sessionData.accessToken;
  if (!accessToken) {
    throw new Error("ChatGPT accessToken not found in session");
  }

  // Step 2: Fetch usage with bearer token
  const usageResp = await fetch(
    "https://chatgpt.com/backend-api/wham/usage",
    {
      headers: {
        ...BASE_HEADERS_CHATGPT,
        Cookie: cookieHeader,
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );

  if (!usageResp.ok) {
    throw new Error(`ChatGPT usage error: ${usageResp.status}`);
  }

  const data = await usageResp.json();
  const rl = data.rate_limit;

  return {
    primary: {
      utilization: rl?.primary_window?.used_percent ?? 0,
      resetsAt: rl?.primary_window?.reset_at ?? null,
    },
    secondary: {
      utilization: rl?.secondary_window?.used_percent ?? 0,
      resetsAt: rl?.secondary_window?.reset_at ?? null,
    },
  };
}
