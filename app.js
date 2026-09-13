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
    const acts = d.activities || [];
    const custom = acts.find((a) => a.type === 4);
    let act = "";
    if (custom && (custom.state || (custom.emoji && custom.emoji.name))) {
      let emo = "";
      if (custom.emoji) {
        emo = custom.emoji.id
          ? `<img class="cemoji" src="https://cdn.discordapp.com/emojis/${custom.emoji.id}.webp?size=44" alt=""> `
          : esc(custom.emoji.name) + " ";
      }
      act = `${emo}${esc(custom.state || "")}`.trim();
    } else if (d.listening_to_spotify && d.spotify) {
      act = esc(`${d.spotify.song} — ${d.spotify.artist}`);
    } else {
      const g = acts.find((a) => a.type === 0);
      if (g) act = esc(g.details ? `${g.name} — ${g.details}` : g.name);
    }
    setPresence(d.discord_status || "offline", act);
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
  const HIT = `https://abacus.jasoncameron.dev/v1/hit/${VIEWS.ns}/${VIEWS.key}`;
  const INFO = `https://abacus.jasoncameron.dev/v1/info/${VIEWS.ns}/${VIEWS.key}`;
  let total = null;
  // same person = don't count twice (one count per browser)
  let already = false;
  try {
    already = localStorage.getItem("jx4r_counted") === "1";
  } catch { /* private mode */ }
  try {
    let r;
    if (already) {
      r = await fetch(INFO); // read-only, no increment
    } else {
      r = await fetch(HIT);
      if (r.status === 404) {
        await fetch("https://abacus.jasoncameron.dev/v1/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namespace: VIEWS.ns, key: VIEWS.key }),
        });
        r = await fetch(HIT);
      }
      try {
        localStorage.setItem("jx4r_counted", "1");
      } catch { /* private mode */ }
    }
    const j = await r.json();
    if (typeof j.value === "number") total = VIEWS.base + j.value;
  } catch { /* api down — fallback below */ }
  if (total === null) {
    let n = 0;
    try {
      n = parseInt(localStorage.getItem("jx4r_views") || "0", 10) || 0;
      if (!already) {
        n += 1;
        localStorage.setItem("jx4r_views", String(n));
      }
    } catch { n = already ? 0 : 1; }
    total = VIEWS.base + n;
  }
  animateCount(total);
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

/* heavy rain + distant lightning */
(() => {
  const c = $("#snow");
  const x = c.getContext("2d");
  const DPR = Math.min(1.5, window.devicePixelRatio || 1);
  let W, H;
  function size() {
    W = innerWidth;
    H = innerHeight;
    c.width = W * DPR;
    c.height = H * DPR;
    c.style.width = W + "px";
    c.style.height = H + "px";
    x.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  size();
  addEventListener("resize", size);

  const wind = -1.7; // slant (negative = blows left)
  function make(far) {
    return {
      x: Math.random() * (W + 60) - 30,
      y: Math.random() * H,
      len: far ? 8 + Math.random() * 10 : 17 + Math.random() * 24,
      sp: far ? 8 + Math.random() * 5 : 14 + Math.random() * 10,
      o: far ? 0.1 + Math.random() * 0.14 : 0.24 + Math.random() * 0.3,
      w: far ? 0.8 : 1.3,
    };
  }
  const N = Math.min(230, Math.floor(innerWidth / 6));
  const drops = [];
  for (let i = 0; i < N; i++) drops.push(make(i % 3 === 0));
  const splashes = [];

  function step() {
    x.clearRect(0, 0, W, H);
    x.lineCap = "round";
    for (const d of drops) {
      x.strokeStyle = `rgba(174, 194, 255, ${d.o})`;
      x.lineWidth = d.w;
      x.beginPath();
      x.moveTo(d.x, d.y);
      x.lineTo(d.x - wind * d.len * 0.32, d.y - d.len);
      x.stroke();
      d.y += d.sp;
      d.x += wind;
      if (d.y > H + 10) {
        if (Math.random() < 0.22 && splashes.length < 46) {
          splashes.push({ x: d.x, y: H - 2 - Math.random() * 40, r: 1, a: 0.32 });
        }
        d.y = -20;
        d.x = Math.random() * (W + 60) - 30;
      }
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.r += 1;
      s.a -= 0.028;
      if (s.a <= 0) {
        splashes.splice(i, 1);
        continue;
      }
      x.strokeStyle = `rgba(174, 194, 255, ${s.a})`;
      x.lineWidth = 1;
      x.beginPath();
      x.ellipse(s.x, s.y, s.r * 1.9, s.r * 0.62, 0, 0, Math.PI * 2);
      x.stroke();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // distant lightning: soft flickers every 9-23s
  const flash = document.getElementById("flash");
  (function bolt() {
    setTimeout(() => {
      if (flash && !document.hidden) {
        let n = 2 + Math.floor(Math.random() * 2);
        const flick = () => {
          if (n-- <= 0) return;
          flash.style.opacity = (0.08 + Math.random() * 0.1).toFixed(2);
          setTimeout(() => {
            flash.style.opacity = 0;
            setTimeout(flick, 60 + Math.random() * 130);
          }, 70 + Math.random() * 100);
        };
        flick();
      }
      bolt();
    }, 9000 + Math.random() * 14000);
  })();
})();
