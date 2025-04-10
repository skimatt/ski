export const generateAIReply = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer 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`, // Ganti dengan key kamu
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content || "Maaf, saya tidak bisa menjawab."
    );
  } catch (error) {
    console.error("AI Error:", error);
    return "Terjadi kesalahan saat menghubungi AI.";
  }
};
