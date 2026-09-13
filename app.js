/* ================= config — edit your stuff here ================= */
const CONFIG = {
  name: "jx4r",
  uid: "1421349735003983925",
  typing: ["my corner of the internet", "discord.gg/...", "est. 2026"],
  links: [
    {
      label: "Discord — @jx4r",
      sub: "click to copy uid",
      icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#5c94ff" d="M19.6 5.1A16.4 16.4 0 0 0 15.5 4l-.5 1a15 15 0 0 0-3.7 0L10.8 4a16.4 16.4 0 0 0-4.1 1.2C3.4 10 2.5 14.7 3 19.3A16.5 16.5 0 0 0 8 22l1.2-2h-1.5l-.4-.5 2.4-1 1 2.5c.5.1 1 .2 1.6.2h1.4c.6 0 1.1-.1 1.6-.2l1-2.5 2.4 1-.4.5h-1.5L17 22a16.5 16.5 0 0 0 5-2.7c.6-5.3-.7-9.9-2.4-14.2zM8.7 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg>',
      action: "copy-uid",
    },
    {
      label: "Share this page",
      sub: "copy link",
      icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#9fd0ff" d="M13 5.5A3.5 3.5 0 0 0 8.5 7L5 10.5A3.5 3.5 0 0 0 10 15.5l2-2M11 18.5a3.5 3.5 0 0 0 4.5-1.5l3.5-3.5a3.5 3.5 0 0 0-5-5l-2 2" stroke="#9fd0ff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
      action: "share",
    },
  ],
};

/* view counter: starts at BASE, +1 per real visit (global via Abacus,
   per-browser fallback if offline). change BASE to whatever you want. */
const VIEWS = { base: 2804, ns: "jx4r-bio-v1", key: "views" };

/* ================= logic (no need to touch) ================= */
const $ = (s) => document.querySelector(s);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 1800);
}

/* enter overlay */
$("#enter").addEventListener("click", () => {
  $("#enter").classList.add("hide");
  bumpViews();
});

/* uid copy */
$("#uid").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(CONFIG.uid);
    toast("uid copied");
  } catch {
    toast(CONFIG.uid);
  }
});

/* live discord presence (lanyard — refreshes every 30s) */
const LANYARD_URL = "https://api.lanyard.rest/v1/users/1421349735003983925";
const STATUS_COLORS = { online: "#23a55a", idle: "#f0b232", dnd: "#da373c", offline: "#80848e" };

function esc(s) {
  return String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
}

function setPresence(status, activity) {
  const dot = document.querySelector(".status");
  if (dot) {
    dot.style.background = STATUS_COLORS[status] || STATUS_COLORS.offline;
    dot.title = status;
  }
  document.body.dataset.status = status;
  const el = document.getElementById("presence");
  if (el) {
    const label = { online: "online", idle: "idle", dnd: "do not disturb", offline: "offline" }[status] || status;
    const cls = status === "dnd" ? "dnd" : status;
    el.innerHTML = `<b class="st-${cls}">●</b> ${label}${activity ? ` — ${activity}` : ""}`;
  }
}

async function syncPresence() {
  try {
    const r = await fetch(LANYARD_URL);
    const j = await r.json();
    if (!j.success) return;
    const d = j.data, u = d.discord_user;
    document.querySelector(".name").textContent = u.global_name || u.username || CONFIG.name;
    document.title = u.username || CONFIG.name;
    if (u.avatar) {
      const ext = u.avatar.startsWith("a_") ? "gif" : "png";
      const url = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=256`;
      const img = document.getElementById("avatar");
      if (img && img.src !== url) img.src = url;
    }
    const deco = document.getElementById("deco");
    const asset = u.avatar_decoration_data && u.avatar_decoration_data.asset;
    if (deco) {
      if (asset) {
        deco.src = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=256`;
        deco.style.display = "";
      } else {
        deco.style.display = "none";
      }
    }
    let act = "";
    if (d.listening_to_spotify && d.spotify) act = `${d.spotify.song} — ${d.spotify.artist}`;
    else {
      const g = (d.activities || []).find((a) => a.type === 0);
      if (g) act = g.name;
    }
    setPresence(d.discord_status || "offline", act ? esc(act) : "");
  } catch {
    /* offline / blocked — static fallback stays */
  }
}

setPresence("offline", "");
syncPresence();
setInterval(syncPresence, 30000);

/* links */
const nav = $("#links");
CONFIG.links.forEach((l) => {
  const a = document.createElement("a");
  a.className = "link";
  a.href = l.action.startsWith("http") ? l.action : "#";
  if (l.action.startsWith("http")) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  a.innerHTML = `${l.icon}<span>${l.label}<br><small style="color:var(--dim);font-size:12px">${l.sub || ""}</small></span><span class="go">↗</span>`;
  a.addEventListener("click", async (e) => {
    if (l.action === "copy-uid") {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(CONFIG.uid);
        toast("discord uid copied");
      } catch {
        toast(CONFIG.uid);
      }
    } else if (l.action === "share") {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(location.href);
        toast("link copied");
      } catch {
        toast(location.href);
      }
    }
  });
  nav.appendChild(a);
});

/* typing bio */
(() => {
  const el = $("#typed");
  const lines = CONFIG.typing;
  let li = 0, ci = 0, del = false;
  (function tick() {
    const line = lines[li];
    el.textContent = line.slice(0, ci);
    let wait = del ? 35 : 70;
    if (!del && ci === line.length) {
      wait = 1600;
      del = true;
    } else if (del && ci === 0) {
      del = false;
      li = (li + 1) % lines.length;
      wait = 400;
    } else {
      ci += del ? -1 : 1;
    }
    setTimeout(tick, wait);
  })();
})();

/* view counter */
function animateCount(to) {
  const el = $("#viewCount");
  const from = VIEWS.base;
  const t0 = performance.now();
  const dur = 1200;
  (function frame(t) {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}

let counted = false;
async function bumpViews() {
  if (counted) return;
  counted = true;
  const el = $("#viewCount");
  try {
    const hit = `${"https://abacus.jasoncameron.dev"}/v1/hit/${VIEWS.ns}/${VIEWS.key}`;
    let r = await fetch(hit);
    if (r.status === 404) {
      await fetch("https://abacus.jasoncameron.dev/v1/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace: VIEWS.ns, key: VIEWS.key }),
      });
      r = await fetch(hit);
    }
    const j = await r.json();
    animateCount(VIEWS.base + (j.value || 0));
  } catch {
    let n = 0;
    try {
      n = parseInt(localStorage.getItem("jx4r_views") || "0", 10) || 0;
      n += 1;
      localStorage.setItem("jx4r_views", String(n));
    } catch { n = 1; }
    animateCount(VIEWS.base + n);
  }
}
// count when the overlay is dismissed (observer covers all paths)
elFallbackCount();
function elFallbackCount() {
  // if overlay dismissed by other means, still count
  new MutationObserver(() => {
    if ($("#enter").classList.contains("hide")) bumpViews();
  }).observe($("#enter"), { attributes: true, attributeFilter: ["class"] });
}

/* 3D tilt + spotlight (guns.lol-style interactivity) */
(() => {
  const card = document.querySelector(".card");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!card || !fine) return;
  const strength = 9;
  document.querySelector(".wrap").addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transition = "transform 0.06s linear";
    card.style.transform = `rotateY(${px * strength}deg) rotateX(${-py * strength}deg)`;
    card.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
    card.style.setProperty("--my", `${(py + 0.5) * 100}%`);
  });
  document.querySelector(".wrap").addEventListener("mouseleave", () => {
    card.style.transition = "transform 0.4s ease";
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
})();

/* smooth crosshair cursor */
(() => {
  const dot = document.querySelector(".cursor");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform = `translate(${mx - 11}px, ${my - 11}px)`;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(loop);
  })();
})();

/* snowfall */
(() => {
  const c = $("#snow");
  const x = c.getContext("2d");
  let W, H, flakes = [];
  function size() {
    W = c.width = innerWidth;
    H = c.height = innerHeight;
  }
  size();
  addEventListener("resize", size);
  const N = Math.min(90, Math.floor(innerWidth / 14));
  for (let i = 0; i < N; i++) {
    flakes.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 2 + 0.5,
      s: Math.random() * 0.6 + 0.2,
      o: Math.random() * 0.5 + 0.2,
      ph: Math.random() * Math.PI * 2,
    });
  }
  (function draw(t) {
    x.clearRect(0, 0, W, H);
    x.fillStyle = "#cfe2ff";
    flakes.forEach((f) => {
      f.y += f.s;
      f.x += Math.sin(t / 1600 + f.ph) * 0.3;
      if (f.y > H + 5) {
        f.y = -5;
        f.x = Math.random() * W;
      }
      x.globalAlpha = f.o;
      x.beginPath();
      x.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      x.fill();
    });
    x.globalAlpha = 1;
    requestAnimationFrame(draw);
  })(0);
})();
