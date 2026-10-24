# Nginx Server Visual

An interactive, step-by-step visualization of how a visitor's request travels
from a browser to an NGINX web server running on AWS EC2.

## What it shows

1. AWS EC2 - launch Amazon Linux 2023
2. Security Group - open ports 80 and 22
3. Connect to EC2 - SSH from your terminal
4. Install NGINX - `sudo dnf install nginx -y`
5. Start NGINX - `sudo systemctl enable --now nginx`
6. Website files - `/usr/share/nginx/html`
7. Browser request - HTTP GET over port 80
8. NGINX response - the page goes back to the visitor

## Files

| File         | Purpose                                   |
|--------------|-------------------------------------------|
| `index.html` | Page structure and the SVG diagram        |
| `style.css`  | Dark theme and layout                     |
| `script.js`  | Step content, navigation, packet animation|

## Run locally

Open `index.html` in any browser. No build step or dependencies needed.

## Deploy on GitHub Pages

1. Create a new repository, e.g. `nginx-server-visualization`.
2. Upload `index.html`, `style.css`, `script.js` and `README.md` to the repo root.
3. Go to **Settings -> Pages**.
4. Under **Source**, choose **Deploy from a branch**, then select `main` and `/ (root)`, and save.
5. After a minute, your site is live at
   `https://<your-username>.github.io/<repo-name>/`

## Customize

- **Step text and commands:** edit the `STEPS` array at the top of `script.js`.
- **Colors:** edit the variables in the `:root` block of `style.css`.
- **Diagram:** edit the inline `<svg>` in `index.html`. Elements with a
  `data-from="N"` attribute appear from step N onward.

## Controls

- Click a step in the left list
- Use the **Back** / **Next step** buttons
- Use the left and right arrow keys
