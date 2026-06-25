// API key is stored in Chrome extension storage, never hardcoded
// Set it via the options page or run this in the console:
// chrome.storage.local.set({ gemini_api_key: "your_key_here" })

const API_URL_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["gemini_api_key"], (result) => {
      resolve(result.gemini_api_key || "");
    });
  });
}

async function sendToGemini(text, prompt) {
  try {
    const API_KEY = await getApiKey();

    if (!API_KEY) {
      return {
        success: false,
        error: "No API key set. Please add your Gemini API key in the CogniShift options page.",
      };
    }

    const API_URL = API_URL_BASE + API_KEY;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt + "\n\n" + text,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message || response.statusText || "Unknown API Error";
      return { success: false, error: errorMessage };
    }

    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResult) {
      return { success: true, data: textResult };
    }
    return { success: false, error: "No content generated" };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { success: false, error: error.message };
  }
}
