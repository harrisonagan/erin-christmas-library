import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://127.0.0.1:8090'
    : window.location.origin
);

export const pb = new PocketBase(PB_URL);

/**
 * Helper to get a book's cover image URL.
 */
export function getBookCoverUrl(book, thumb = '300x420') {
  if (!book?.cover) return null;
  if (typeof book.cover === 'string') {
    if (book.cover.startsWith('http') || book.cover.startsWith('blob:') || book.cover.startsWith('data:')) {
      return book.cover;
    }
    // Local static asset
    const cleanPath = book.cover.startsWith('/') ? book.cover.slice(1) : book.cover;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
  }
  return pb.files.getUrl(book, book.cover, { thumb });
}

/**
 * Helper to get a book page image URL.
 */
export function getPageImageUrl(pageRecord) {
  if (!pageRecord?.image) return null;
  if (typeof pageRecord.image === 'string' && (pageRecord.image.startsWith('http') || pageRecord.image.startsWith('blob:'))) {
    return pageRecord.image;
  }
  return pb.files.getUrl(pageRecord, pageRecord.image);
}

/**
 * Auto-populates book title, author, and book cover bounding box using Gemini Flash AI Vision.
 */
export async function parseBookCoverWithAI(coverFile) {
  // Always ensure API key is present (env or direct fallback)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCetUBgYuQmpDYYEbKvlc1vGChkCX2kJP0';

  console.log('[AI Scan] Initiating cover analysis with Gemini Flash...');

  // 1. Direct browser fetch to Google Gemini Flash
  if (apiKey) {
    try {
      const base64Data = await fileToBase64(coverFile);
      const mimeType = coverFile.type || 'image/jpeg';

      const prompt = 
        "Look at this photo of a book and perform two tasks:\n" +
        "1. Extract the book Title and Author.\n" +
        "2. Detect the rectangular boundary of the book cover (excluding any table, hands, or surrounding background) as [ymin, xmin, ymax, xmax] on a scale of 0 to 1000.\n" +
        "Return ONLY a clean JSON object with keys 'title', 'author', and 'box_2d'.\n" +
        "Example: {\"title\": \"Mice Skating\", \"author\": \"Annie Silvestro\", \"box_2d\": [80, 100, 920, 900]}.\n" +
        "Do NOT include markdown backticks or commentary.";

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        console.log('[AI Scan] Successfully recognized:', parsed);
        return {
          title: parsed.title || '',
          author: parsed.author || '',
          box_2d: parsed.box_2d || null,
        };
      } else {
        const errText = await res.text();
        console.warn('[AI Scan] Gemini API error response:', res.status, errText);
      }
    } catch (clientErr) {
      console.warn('[AI Scan] Direct call failed, trying local proxy:', clientErr);
    }
  }

  // 2. Fallback to local / PocketBase proxy endpoint
  try {
    const formData = new FormData();
    formData.append('cover', coverFile);
    const response = await fetch('/api/scan-cover', {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('[AI Scan] Proxy scan failed:', err);
  }

  return { title: '', author: '', box_2d: null };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' && result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}
