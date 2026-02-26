export async function telegramSend(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram not configured");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

      console.log("Telegram send ok");


    if (!res.ok) {
      const body = await res.text();
      console.error("Telegram send failed:", body);
    }
  } catch (err) {
    console.error("Telegram error:", err);
  }
}