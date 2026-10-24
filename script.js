const STEPS = [
  { t: "AWS EC2", s: "Launch Amazon Linux 2023",
    plain: "You rent a small computer in Amazon's data centre. This is the shop where your website will live.",
    tech: "EC2 instance (t3.micro) running Amazon Linux 2023 inside a VPC public subnet, with a public IPv4 address.",
    watch: "The orange EC2 box appears inside the public subnet and its status light turns green.",
    cmd: "AWS Console → EC2 → Launch instance → Amazon Linux 2023 → t3.micro → create key pair" },
  { t: "Security Group", s: "Open port 80 and 22",
    plain: "The door guard decides who may knock. Port 80 is for visitors, port 22 is for you only.",
    tech: "Inbound rules: TCP 80 from 0.0.0.0/0 (HTTP), TCP 22 from your IP (SSH). Every other port is dropped.",
    watch: "A red dashed guard wraps the EC2. Other ports hit a blocked sign.",
    cmd: "Inbound rules:\n  HTTP  TCP 80  0.0.0.0/0\n  SSH   TCP 22  <your-ip>/32" },
  { t: "Connect to EC2", s: "SSH from your terminal",
    plain: "You open a private tunnel from your laptop to the server so you can type commands on it.",
    tech: "SSH over TCP 22 using your .pem private key, through the Internet Gateway and past the Security Group.",
    watch: "A green dashed line runs from your laptop into the terminal on the EC2.",
    cmd: "chmod 400 key.pem\nssh -i key.pem ec2-user@<EC2-PUBLIC-IP>" },
  { t: "Install NGINX", s: "sudo dnf install nginx -y",
    plain: "You download the web server program. It is installed, but nobody is home yet.",
    tech: "dnf pulls the nginx package from the Amazon Linux repository and installs the binary and config in /etc/nginx.",
    watch: "The NGINX box appears with the status 'installed'.",
    cmd: "sudo dnf install nginx -y\nnginx -v" },
  { t: "Start NGINX", s: "systemctl enable --now",
    plain: "You switch the server on and tell it to start itself again after every reboot.",
    tech: "systemd starts nginx.service, which listens on port 80. 'enable' makes it start at boot.",
    watch: "The NGINX box turns green: active (running), listening on :80.",
    cmd: "sudo systemctl enable --now nginx\nsudo systemctl status nginx" },
  { t: "Website files", s: "/usr/share/nginx/html",
    plain: "You put your pages on the shelf where NGINX looks first.",
    tech: "The default document root is /usr/share/nginx/html. NGINX serves index.html for the path /.",
    watch: "A files folder appears next to NGINX with index.html, style.css, script.js and images/.",
    cmd: "sudo cp -r ~/site/* /usr/share/nginx/html/\nsudo chown -R nginx:nginx /usr/share/nginx/html" },
  { t: "Browser request", s: "Visitor types the IP",
    plain: "A visitor types your shop address. The browser writes a short note, \"please give me the front page\", and sends it down the road.",
    tech: "HTTP GET / over TCP port 80. Path: browser, Internet, Internet Gateway, Security Group (allows 80), EC2, NGINX.",
    watch: "An envelope leaves the visitor, crosses the internet and the main gate, passes the door guard and reaches NGINX.",
    cmd: "curl -i http://<EC2-PUBLIC-IP>/" },
  { t: "NGINX response", s: "Page goes back",
    plain: "NGINX finds index.html on the shelf, wraps it in an envelope and sends it back the same way.",
    tech: "HTTP/1.1 200 OK with Content-Type text/html. The browser then requests style.css and script.js the same way.",
    watch: "The envelope travels back from NGINX to the visitor and the browser shows the page.",
    cmd: "HTTP/1.1 200 OK\nServer: nginx\nContent-Type: text/html" }
];

const $ = (id) => document.getElementById(id);
const svg = $("diagram");
const list = $("steps");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let cur = 0, raf = 0;

STEPS.forEach((st, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<button type="button"><span class="n">${i + 1}</span><span><b>${st.t}</b><small>${st.s}</small></span></button>`;
  li.firstChild.onclick = () => go(i);
  list.appendChild(li);
});

function go(i) {
  cur = Math.max(0, Math.min(STEPS.length - 1, i));
  const n = cur + 1, st = STEPS[cur];

  [...list.children].forEach((li, k) => {
    li.className = k === cur ? "on" : k < cur ? "done" : "";
    li.firstChild.setAttribute("aria-current", k === cur ? "step" : "false");
  });

  svg.querySelectorAll("[data-from]").forEach((el) => {
    el.classList.toggle("hidden", n < +el.dataset.from);
    const focus = (el.dataset.focus || "").split(",").map(Number);
    el.classList.toggle("glow", focus.includes(n));
  });

  const running = n >= 5;
  $("nginxBox").style.stroke = running ? "#2ecc71" : "#6b7280";
  $("nginxState").textContent = running ? "active (running) · listening on :80" : "installed";
  $("bState").textContent = n === 7 ? "presses Enter · GET / HTTP/1.1" : n === 8 ? "page loaded ✓" : "waiting";

  $("dTitle").textContent = `${n}. ${st.t === "AWS EC2" ? "AWS EC2" : st.t}`;
  $("dPlain").textContent = st.plain;
  $("dTech").textContent = st.tech;
  $("dWatch").textContent = st.watch;
  $("dCmd").textContent = st.cmd;
  $("count").textContent = `Step ${n} of ${STEPS.length}`;
  $("prev").disabled = cur === 0;
  $("next").disabled = cur === STEPS.length - 1;

  runPacket(n);
}

function runPacket(n) {
  cancelAnimationFrame(raf);
  const pk = $("packet");
  const path = n === 3 ? $("sshPath") : $("httpPath");
  if (n !== 3 && n < 7) { pk.setAttribute("opacity", 0); return; }
  if (n === 3) $("httpPath").classList.add("hidden");
  const len = path.getTotalLength();
  const rev = n === 8;
  const place = (t) => {
    const p = path.getPointAtLength((rev ? 1 - t : t) * len);
    pk.setAttribute("transform", `translate(${p.x},${p.y})`);
  };
  pk.setAttribute("opacity", 1);
  if (reduce) { place(1); return; }
  const dur = 3200; let t0 = null;
  const tick = (now) => {
    if (t0 === null) t0 = now;
    place(((now - t0) % (dur + 600)) / dur > 1 ? 1 : ((now - t0) % (dur + 600)) / dur);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

$("prev").onclick = () => go(cur - 1);
$("next").onclick = () => go(cur + 1);
addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") go(cur + 1);
  if (e.key === "ArrowLeft") go(cur - 1);
});

go(6);
