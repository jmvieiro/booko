// export async function telegramSend(text: string) {
//   const token = process.env.TELEGRAM_BOT_TOKEN;
//   const chatId = process.env.TELEGRAM_CHAT_ID;

//   if (!token || !chatId) {
//     console.warn("Telegram not configured");
//     return;
//   }

//   try {
//     const url = `https://api.telegram.org/bot${token}/sendMessage`;

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         chat_id: chatId,
//         text,
//         disable_web_page_preview: true,
//       }),
//     });

//       console.log("Telegram send ok");


//     if (!res.ok) {
//       const body = await res.text();
//       console.error("Telegram send failed:", body);
//     }
//   } catch (err) {
//     console.error("Telegram error:", err);
//   }
// }

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 7000
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function telegramSend(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram not configured");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  // Reintentos progresivos
  const delays = [0, 500, 1500];

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) {
      await sleep(delays[attempt]);
    }

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
        },
        7000
      );

      if (response.ok) {
        return;
      }

      if (response.status === 429) {
        const data = await response.json().catch(() => null);
        const retryAfter = data?.parameters?.retry_after;

        if (typeof retryAfter === "number") {
          console.warn("Telegram rate limited. Waiting:", retryAfter);
          await sleep((retryAfter + 1) * 1000);
          continue;
        }
      }

      const errorBody = await response.text();
      console.error("Telegram send failed:", response.status, errorBody);
    } catch (error) {
      console.error("Telegram error:", error);
    }
  }
}