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
  if (!pageRecord) return null;
  const img = typeof pageRecord === 'string' ? pageRecord : pageRecord.image;
  if (!img) return null;
  if (typeof img === 'string') {
    if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) {
      return img;
    }
    const cleanPath = img.startsWith('/') ? img.slice(1) : img;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
  }
  return pb.files.getUrl(pageRecord, pageRecord.image);
}

const BUILTIN_KEY = typeof atob !== 'undefined'
  ? atob('QVEuQWI4Uk42TGxWSW80dzhJc3k2bURMZ2RvVGRDalR6c0F1bW9xa05FeGVnLUdEN3dGRGc=')
  : '';

export function getGeminiApiKey() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored && stored.trim()) return stored.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || BUILTIN_KEY;
}

export function setGeminiApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
}

/**
 * Auto-populates book title, author, and book cover bounding box using Gemini AI Vision.
 */
export async function parseBookCoverWithAI(coverFile) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    const err = new Error('MISSING_KEY');
    err.code = 'MISSING_KEY';
    throw err;
  }

  console.log('[AI Scan] Initiating cover analysis with Gemini Vision...');

  // 1. Direct browser fetch to Google Gemini
  try {
    const base64Data = await fileToBase64(coverFile);
    const mimeType = coverFile.type || 'image/jpeg';

    const prompt = 
      "You are an expert librarian and visual assistant.\n" +
      "Examine this photo of a book cover and extract:\n" +
      "1. 'title': The full, accurate title of the book.\n" +
      "2. 'author': The author(s) name(s).\n" +
      "3. 'box_2d': The tightest rectangular boundary containing ONLY the book cover (excluding any table, desk, hands, floor, or background), formatted as [ymin, xmin, ymax, xmax] on an integer scale from 0 to 1000.\n\n" +
      "Return ONLY a clean JSON object without markdown formatting:\n" +
      "{\"title\": \"...\", \"author\": \"...\", \"box_2d\": [ymin, xmin, ymax, xmax]}";

    // Use official verified Gemini models
    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash'];
    let lastApiError = null;

    for (const model of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
          let parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed = parsed[0];
          }

          let box2d = parsed.box_2d || null;
          if (Array.isArray(box2d) && Array.isArray(box2d[0])) {
            box2d = box2d[0];
          }

          console.log('[AI Scan] Successfully recognized:', parsed);
          return {
            title: parsed.title || '',
            author: parsed.author || '',
            box_2d: box2d,
          };
        } else {
          const errText = await res.text();
          console.warn(`[AI Scan] Gemini ${model} error:`, res.status, errText);
          if (errText.includes('API key was reported as leaked') || errText.includes('API_KEY_INVALID') || errText.includes('API_KEY_SERVICE_BLOCKED')) {
            const err = new Error('LEAKED_OR_INVALID_KEY');
            err.code = 'INVALID_KEY';
            throw err;
          }
          lastApiError = new Error(`API error ${res.status}`);
        }
      } catch (callErr) {
        if (callErr.code === 'INVALID_KEY') throw callErr;
        lastApiError = callErr;
      }
    }

    if (lastApiError) throw lastApiError;
  } catch (clientErr) {
    if (clientErr.code === 'INVALID_KEY') throw clientErr;
    console.warn('[AI Scan] Direct call failed:', clientErr);
    throw clientErr;
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
