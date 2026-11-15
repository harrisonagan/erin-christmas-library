# PocketBase Setup for Christmas Library

## 1. Local Mac Testing

1. Download PocketBase for macOS (Apple Silicon or Intel):
   https://pocketbase.io/docs/

2. Unzip into a folder, e.g. `pocketbase/`:
   ```bash
   ./pocketbase serve
   ```
   PocketBase admin UI is accessible at: `http://127.0.0.1:8090/_/`

3. Create your first admin account.

4. Import the pre-made collections:
   - Go to **Settings** > **Import collections**
   - Paste the contents of `pocketbase/pb_schema.json` (or load the file) and click **Confirm**.
   - The `books` and `book_pages` collections are now live with all permissions open to the local network!

5. Set up Gemini Vision AI hook:
   - Copy `pocketbase/pb_hooks/scan_cover.pb.js` into your PocketBase's `pb_hooks/` directory.
   - Run PocketBase with your Gemini API Key:
     ```bash
     GEMINI_API_KEY="your-gemini-api-key" ./pocketbase serve
     ```

## 2. Raspberry Pi Deployment

1. Download the ARM64 Linux PocketBase binary on the Pi:
   ```bash
   wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.20/pocketbase_0.22.20_linux_arm64.zip
   unzip pocketbase_0.22.20_linux_arm64.zip
   ```

2. Build your frontend on your Mac:
   ```bash
   npm run build
   ```
   This creates a `dist/` folder.

3. Copy the `dist` folder to PocketBase's `pb_public` on the Pi:
   ```bash
   scp -r dist/* pi@your-pi-tailscale-name:~/pocketbase/pb_public/
   ```

4. Configure systemd on the Pi so PocketBase starts on boot with the Gemini API key:
   Create `/etc/systemd/system/christmas-library.service`:
   ```ini
   [Unit]
   Description=Christmas Library PocketBase
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/pocketbase
   Environment="GEMINI_API_KEY=your_key_here"
   ExecStart=/home/pi/pocketbase/pocketbase serve --http="0.0.0.0:8090"
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```
   Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now christmas-library
   ```

5. Enable Tailscale HTTPS:
   ```bash
   tailscale cert your-pi.tailscale-domain.ts.net
   ```
   Now visit `https://your-pi.tailscale-domain.ts.net:8090` on iPad or iPhone, and tap **"Add to Home Screen"**!
