export async function askGeminiWithImage(
  text: string,
  imageUrl: string | null
): Promise<string> {
  try {
    // Prepare message content based on whether an image was provided
    const content = imageUrl
      ? [
          { type: "text", text },
          { type: "image_url", image_url: { url: imageUrl } },
        ]
      : [{ type: "text", text }];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://skimons.com",
        "X-Title": "AI Chat Skimons",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false, // Ensure we get complete responses
        top_p: 0.95,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data = await res.json();

    // Get raw response from API
    const rawResponse =
      data.choices?.[0]?.message?.content || "Tidak ada respons dari AI.";

    // Process response to make it more readable and visually appealing
    return beautifyResponse(rawResponse);
  } catch (error) {
    console.error("Error in askGeminiWithImage:", error);
    return "Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi nanti.";
  }
}

/**
 * Beautifies the AI response text to make it more visually appealing without HTML tags
 */
function beautifyResponse(text: string): string {
  // Step 1: Clean up the text by removing any existing formatting
  let cleanText = text.trim();

  // Step 2: Process bullet points and sections
  // Replace bullet points with proper Unicode bullets
  cleanText = cleanText.replace(/^\s*[*•-]\s+/gm, "• ");

  // Step 3: Clean up emphasis markers - remove asterisks but preserve the text
  cleanText = cleanText.replace(/\*\*([^*]+):\*\*/g, "$1:");
  cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleanText = cleanText.replace(/\*([^*]+)\*/g, "$1");

  // Step 4: Ensure proper spacing
  // Add proper spacing after periods, question marks, and exclamation points
  cleanText = cleanText.replace(/([.?!])(?=\S)/g, "$1 ");

  // Step 5: Ensure proper paragraph spacing
  cleanText = cleanText.replace(/\n{3,}/g, "\n\n"); // Replace excessive line breaks

  // Step 6: Make section headers stand out with proper formatting
  // Look for "Title:" patterns at the beginning of lines and format them nicely
  cleanText = cleanText.replace(/^([A-Za-z]+):\s*/gm, (match, title) => {
    // Return the title in a more emphasized form
    return `${title}: `;
  });

  // Step 7: Process URLs to make them cleaner
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  cleanText = cleanText.replace(urlRegex, (url) => {
    // Just keep the URL as is, as we don't want markdown or HTML in the output
    return url;
  });

  // Step 8: Add signature if it's not already there
  if (!cleanText.includes("— skiAI") && !cleanText.includes("—skiAI")) {
    cleanText += "\n\n— skiAI";
  }

  return cleanText;
}
