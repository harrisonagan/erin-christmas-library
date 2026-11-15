/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase JS Hook: Secure Gemini Vision Proxy
 * 
 * Automatically registered by PocketBase upon start.
 * Listens on: POST /api/scan-cover
 * 
 * Takes an uploaded image 'cover', converts to base64, invokes Gemini 1.5/2.0 Flash
 * on the server side using the GEMINI_API_KEY environment variable,
 * and returns { title, author } safely to the client.
 */

routerAdd("POST", "/api/scan-cover", (c) => {
  const apiKey = $os.getenv("GEMINI_API_KEY");
  if (!apiKey) {
    return c.json(400, {
      error: "GEMINI_API_KEY is not set on the server environment. Please set it in your systemd service or .env."
    });
  }

  // Extract the uploaded file from the request
  const requestInfo = $apis.requestInfo(c);
  const files = requestInfo.files;
  
  if (!files || !files.cover) {
    return c.json(400, { error: "No 'cover' file was provided in the multipart form." });
  }

  const coverFile = files.cover;
  
  // Read file bytes and encode to base64
  const bytes = $filesystem.fileBytes(coverFile);
  const base64Data = $security.base64Encode(bytes);
  const mimeType = coverFile.header.get("Content-Type") || "image/jpeg";

  // Prompt Gemini Flash with structured output instructions
  const prompt = "Look at this book cover image and extract the book Title and Author. " +
    "Return ONLY a raw JSON object with keys 'title' and 'author'. " +
    "Example: {\"title\": \"The Polar Express\", \"author\": \"Chris Van Allsburg\"}. " +
    "Do NOT include markdown backticks (```json), markdown formatting, or any extra text.";

  const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

  try {
    const response = $http.send({
      url: geminiEndpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1
        }
      }),
      timeout: 15 // seconds
    });

    if (response.statusCode !== 200) {
      return c.json(response.statusCode, {
        error: "Gemini API error: " + response.raw
      });
    }

    const data = JSON.parse(response.raw);
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean any accidental markdown wrappers
    const cleanedJson = candidateText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanedJson);

    return c.json(200, {
      title: result.title || "",
      author: result.author || ""
    });
  } catch (err) {
    return c.json(500, {
      error: "Failed to process cover: " + err.message
    });
  }
});
