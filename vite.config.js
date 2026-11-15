import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/erin-christmas-library/',
  plugins: [
    react(),
    {
      name: 'gemini-scan-local-proxy',
      configureServer(server) {
        server.middlewares.use('/api/scan-cover', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          const chunks = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const apiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyCetUBgYuQmpDYYEbKvlc1vGChkCX2kJP0';

              const contentType = req.headers['content-type'] || '';
              let base64Image = '';
              let mimeType = 'image/jpeg';

              if (contentType.includes('multipart/form-data')) {
                const str = buffer.toString('binary');
                const parts = str.split(/--[^\r\n]+/);
                for (const part of parts) {
                  if (part.includes('filename=') || part.includes('Content-Type: image/')) {
                    const headerEnd = part.indexOf('\r\n\r\n');
                    if (headerEnd !== -1) {
                      const body = part.slice(headerEnd + 4).replace(/\r\n$/, '');
                      base64Image = Buffer.from(body, 'binary').toString('base64');
                      if (part.includes('image/png')) mimeType = 'image/png';
                      if (part.includes('image/webp')) mimeType = 'image/webp';
                      break;
                    }
                  }
                }
              }

              if (!base64Image) {
                base64Image = buffer.toString('base64');
              }

              const prompt = 
                "Look at this photo of a book and extract the book Title and Author. " +
                "Also detect the rectangular book boundary as [ymin, xmin, ymax, xmax] from 0 to 1000. " +
                "Return ONLY a clean JSON object with keys 'title', 'author', and 'box_2d'.";

              const response = await fetch(
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
                              data: base64Image,
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

              if (response.ok) {
                const data = await response.json();
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                res.setHeader('Content-Type', 'application/json');
                res.end(cleaned);
              } else {
                const errText = await response.text();
                res.statusCode = response.status;
                res.end(JSON.stringify({ error: errText }));
              }
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
