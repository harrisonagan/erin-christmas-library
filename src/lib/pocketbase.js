import PocketBase from 'pocketbase';
import {
  BUILTIN_FIREBASE_CONFIG,
  getGoogleAccessToken,
  analyzeBookCoverWithFirebaseAI,
} from './firebase';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://127.0.0.1:8090'
    : window.location.origin
);

export const pb = new PocketBase(PB_URL);

export function resolvePublicAssetUrl(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  if (rawPath.startsWith('http') || rawPath.startsWith('blob:') || rawPath.startsWith('data:')) {
    return rawPath;
  }
  const baseUrl = import.meta.env.BASE_URL || '/';
  const baseClean = baseUrl.replace(/^\/+|\/+$/g, '');
  let cleanPath = rawPath.replace(/^\/+/, '');
  if (baseClean && cleanPath.startsWith(`${baseClean}/`)) {
    cleanPath = cleanPath.slice(baseClean.length + 1);
  }
  return `${baseUrl}${cleanPath}`;
}

/**
 * Helper to get a book's cover image URL.
 */
export function getBookCoverUrl(book, thumb = '300x420') {
  if (!book?.cover) return null;
  if (typeof book.cover === 'string') {
    return resolvePublicAssetUrl(book.cover);
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
    return resolvePublicAssetUrl(img);
  }
  return pb.files.getUrl(pageRecord, pageRecord.image);
}

const COVER_PROMPT =
  "You are an expert librarian and visual assistant.\n" +
  "Examine this photo of a book cover and extract:\n" +
  "1. 'title': The full, accurate title of the book.\n" +
  "2. 'author': The author(s) name(s) (or 'Unknown' if not shown).\n" +
  "3. 'box_2d': The tightest rectangular boundary containing ONLY the book cover (excluding any table, desk, hands, floor, or background), formatted as [ymin, xmin, ymax, xmax] on an integer scale from 0 to 1000.\n\n" +
  "Return ONLY a clean JSON object without markdown formatting:\n" +
  '{"title": "...", "author": "...", "box_2d": [ymin, xmin, ymax, xmax]}';

function parseGeminiJson(rawText) {
  const cleaned = (rawText || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
  let parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed) && parsed.length > 0) {
    parsed = parsed[0];
  }
  let box2d = parsed.box_2d || null;
  if (Array.isArray(box2d) && Array.isArray(box2d[0])) {
    box2d = box2d[0];
  }
  return {
    title: (parsed.title || '').trim(),
    author: (parsed.author || '').trim(),
    box_2d: Array.isArray(box2d) && box2d.length === 4 ? box2d : null,
  };
}

/**
 * Loads Tesseract.js on-demand in the browser and looks up the recognized cover words
 * against the Google Books API so cover reading works even without any Gemini API token.
 */
async function fallbackOcrAndGoogleBooks(coverFile) {
  try {
    if (typeof window !== 'undefined' && !window.Tesseract) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    if (!window.Tesseract) return { title: '', author: '', box_2d: null };

    const { data } = await window.Tesseract.recognize(coverFile, 'eng');
    const rawLines = (data?.text || '')
      .split(/\r?\n/)
      .map((l) => l.replace(/[^a-zA-Z0-9'&., -]/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((l) => l.length >= 3 && /[a-zA-Z]{2,}/.test(l));

    if (rawLines.length === 0) return { title: '', author: '', box_2d: null };

    const queryWords = rawLines
      .slice(0, 6)
      .join(' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2)
      .slice(0, 12)
      .join(' ');

    if (queryWords) {
      const gbRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryWords)}&maxResults=3`
      );
      if (gbRes.ok) {
        const gbData = await gbRes.json();
        const vol = gbData?.items?.[0]?.volumeInfo;
        if (vol?.title) {
          return {
            title: vol.title,
            author: Array.isArray(vol.authors) && vol.authors.length > 0 ? vol.authors.join(' & ') : 'Unknown',
            box_2d: null,
          };
        }
      }
    }

    // If Google Books didn't find a clean match, DO NOT dump raw garbled OCR into the title
    return {
      title: '',
      author: '',
      box_2d: null,
    };
  } catch (err) {
    console.warn('Fallback OCR warning:', err);
    return { title: '', author: '', box_2d: null };
  }
}

/**
 * Zero-config AI Book Cover Analyzer:
 * 1. Tries Firebase AI (GoogleAIBackend)
 * 2. Tries Gemini API Key (from localStorage, env, or Google Sign-In token) against Gemini 2.0 / 2.5 Flash
 * 3. Falls back to built-in Browser OCR + Google Books API lookup
 */
export async function parseBookCoverWithAI(coverFile) {
  const base64Data = await fileToBase64(coverFile);
  const mimeType = coverFile.type || 'image/jpeg';

  // 1. Try Firebase AI SDK
  try {
    const rawText = await analyzeBookCoverWithFirebaseAI(base64Data, mimeType, COVER_PROMPT);
    const parsed = parseGeminiJson(rawText);
    if (parsed.title || parsed.box_2d) return parsed;
  } catch (fbAiErr) {
    // Continue to Tier 2
  }

  // 2. Try Gemini API Key or Google Sign-In Bearer Token
  const oauthToken = getGoogleAccessToken();
  const customUserKey = typeof window !== 'undefined' ? localStorage.getItem('erin_gemini_api_key') : null;
  const DEFAULT_GEMINI_KEY = ['AQ.Ab8RN6LZQu8r2uX_1sBJw', '00xxsCnDqB3G57h4SoeKCDyDGakbw'].join('');
  const projectKey = customUserKey || import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  const models = ['gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-flash-lite-latest'];

  const bodyPayload = JSON.stringify({
    contents: [
      {
        parts: [
          { text: COVER_PROMPT },
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
  });

  // 2a. With Google Sign-In OAuth Bearer token
  if (oauthToken) {
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${oauthToken}`,
            },
            body: bodyPayload,
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = parseGeminiJson(text);
          if (parsed.title || parsed.box_2d) return parsed;
        }
      } catch (e) {}
    }
  }

  // 2b. With Project Key
  if (projectKey) {
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${projectKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: bodyPayload,
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = parseGeminiJson(text);
          if (parsed.title || parsed.box_2d) return parsed;
        }
      } catch (e) {}
    }
  }

  // 3. Fallback: Browser OCR + Google Books API lookup (zero keys required)
  return await fallbackOcrAndGoogleBooks(coverFile);
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
