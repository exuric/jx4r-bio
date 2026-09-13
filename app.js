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
      label: "GitHub",
      sub: "github.com/exuric",
      icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#eef3ff" d="M12 2A10 10 0 0 0 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.4 4.7-4.6 4.9.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 22 12 10 10 0 0 0 12 2z"/></svg>',
      action: "https://github.com/exuric",
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
