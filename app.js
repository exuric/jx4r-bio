/* ================= config — edit your stuff here ================= */
const CONFIG = {
  name: "jx4r",
  uid: "1421349735003983925",
  adminKey: "jx4r", // open yoursite/?admin=jx4r for the private view graph
  counterApi: "", // global counts: paste your worker URL, e.g. https://jx4r-bio.YOU.workers.dev (see worker.js). empty = per-browser counts.
  typing: ["my corner of the internet", "discord.gg/larp", "est. 2026"],
  links: [
    {
      label: "Discord",
      sub: "open in discord",
      icon: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#e8edf5" d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
      action: "https://discord.com/users/1421349735003983925",
    },
    {
      label: "LARP V4",
      sub: "discord.gg/larp",
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfd8ea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
      action: "https://discord.gg/larp",
    },
    {
      label: "Share this page",
      sub: "copy link",
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfd8ea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>',
      action: "share",
    },
  ],
};

/* view counter: starts at BASE, +1 per unique visitor.
   Global counts need CONFIG.counterApi (your free Cloudflare Worker,
   see worker.js). Without it, counts are per-browser via localStorage. */
const VIEWS = { base: 3608, ns: "jx4r-bio-v1", key: "views" };

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
function dismissEnter() {
  if ($("#enter").classList.contains("hide")) return;
  $("#enter").classList.add("hide");
  bumpViews();
}
$("#enter").addEventListener("click", dismissEnter);
addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") dismissEnter();
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
    el.innerHTML = `<b class="st-${cls}">●</b> ${label}${activity ? ` • ${activity}` : ""}`;
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
        deco.hidden = false;
      } else {
        deco.hidden = true;
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
      act = esc(`${d.spotify.song} • ${d.spotify.artist}`);
    } else {
      const g = acts.find((a) => a.type === 0);
      if (g) act = esc(g.details ? `${g.name} • ${g.details}` : g.name);
    }
    setPresence(d.discord_status || "offline", act);
    renderActivity(d);
    syncPlayer(d);
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
    if (l.action === "share") {
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
  let total = null;
  // same person = don't count twice (one count per browser)
  let already = false;
  try {
    already = localStorage.getItem("jx4r_counted") === "1";
  } catch { /* private mode */ }
  try {
    let v;
    if (already) {
      v = await abInfo(VIEWS.key); // read-only, no increment
    } else {
      v = await abHit(VIEWS.key);
      try {
        localStorage.setItem("jx4r_counted", "1");
      } catch { /* private mode */ }
    }
    if (typeof v === "number") total = VIEWS.base + v;
  } catch { /* backend down — fallback below */ }
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
  // per-day stats (powers the private ?admin graph, unique per browser/day)
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("jx4r_day") !== today) {
      const v = await abHit(`views-${today}`);
      if (v !== null) localStorage.setItem("jx4r_day", today);
    }
  } catch { /* ignore */ }
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

/* counter backend: your Cloudflare Worker (global) — see worker.js.
   Falls back to per-browser counting when CONFIG.counterApi is empty. */
async function wapi(path, init) {
  if (!CONFIG.counterApi) return null;
  try {
    const r = await fetch(CONFIG.counterApi.replace(/\/$/, "") + path, init);
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j.value === "number" ? j.value : null;
  } catch {
    return null;
  }
}
async function abHit(key) {
  if (key === VIEWS.key) return await wapi("/api/views", { method: "POST" });
  const m = key.match(/^views-(\d{4}-\d{2}-\d{2})$/);
  if (m) return await wapi(`/api/day/${m[1]}`, { method: "POST" });
  return null;
}
async function abInfo(key) {
  if (key === VIEWS.key) {
    const v = await wapi("/api/views");
    return v === null ? null : v;
  }
  const m = key.match(/^views-(\d{4}-\d{2}-\d{2})$/);
  if (m) {
    const v = await wapi(`/api/day/${m[1]}`);
    return v === null ? 0 : v; // 0 = no data yet (keeps admin graph honest)
  }
  return null;
}

/* live activity card: game art + elapsed, spotify art + moving progress */
let actMode = null, actStart = 0, actEnd = 0;
function renderActivity(d) {
  const sec = document.getElementById("activity");
  const art = document.getElementById("actArt");
  const type = document.getElementById("actType");
  const nm = document.getElementById("actName");
  const det = document.getElementById("actDetail");
  if (!sec || !art) return;
  let show = false;
  if (d.listening_to_spotify && d.spotify) {
    const s = d.spotify;
    const ts = s.timestamps || { start: Date.now(), end: Date.now() };
    art.src = s.album_art_url;
    art.style.display = "";
    type.textContent = "listening to spotify";
    nm.textContent = s.song;
      det.textContent = `${s.artist} • ${s.album}`;
    actMode = "prog";
    actStart = ts.start;
    actEnd = ts.end;
    show = true;
  } else {
    const g = (d.activities || []).find((a) => a.type === 0);
    if (g) {
      if (g.assets && g.assets.large_image && !g.assets.large_image.startsWith("mp:") && g.application_id) {
        art.src = `https://cdn.discordapp.com/app-assets/${g.application_id}/${g.assets.large_image}.png?size=256`;
        art.style.display = "";
      } else {
        art.style.display = "none";
      }
      type.textContent = "playing";
      nm.textContent = g.name;
      det.textContent = [g.details, g.state].filter(Boolean).join(" • ");
      actMode = "elapsed";
      actStart = (g.timestamps && g.timestamps.start) || Date.now();
      actEnd = 0;
      show = true;
    }
  }
  sec.hidden = !show;
  if (show) tickActivity();
}
function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60), h = Math.floor(m / 60);
  return (h ? h + ":" + String(m % 60).padStart(2, "0") : String(m)) + ":" + String(s % 60).padStart(2, "0");
}
function tickActivity() {
  const sec = document.getElementById("activity");
  const prog = document.getElementById("actProg");
  const tm = document.getElementById("actTime");
  if (!prog || !tm || !sec || sec.hidden) return;
  const now = Date.now();
  if (actMode === "prog" && actEnd > actStart) {
    const p = Math.min(1, Math.max(0, (now - actStart) / (actEnd - actStart)));
    prog.style.width = (p * 100).toFixed(1) + "%";
    const shown = Math.min(now, actEnd);
    tm.textContent = `${fmt(shown - actStart)} / ${fmt(actEnd - actStart)}`;
  } else {
    prog.style.width = "100%";
    tm.textContent = fmt(now - actStart) + " elapsed";
  }
}
setInterval(tickActivity, 1000);

/* visitor themes (saved per browser) */
(() => {
  let saved = null;
  try {
    saved = localStorage.getItem("jx4r_theme");
  } catch { /* ignore */ }
  function apply(t) {
    document.body.dataset.theme = t;
    try {
      localStorage.setItem("jx4r_theme", t);
    } catch { /* ignore */ }
    document.querySelectorAll("#themes button").forEach((b) => b.classList.toggle("on", b.dataset.t === t));
  }
  document.getElementById("themes").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) apply(b.dataset.t);
  });
  apply(saved || "storm");
})();

/* private admin analytics (?admin=key) */
async function renderAdmin() {
  let q = null;
  try {
    q = new URLSearchParams(location.search).get("admin");
  } catch { /* ignore */ }
  if (q !== CONFIG.adminKey) return;
  const panel = document.getElementById("admin");
  if (!panel) return;
  panel.hidden = false;
  const days = [];
  for (let i = 13; i >= 0; i--) {
    days.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
  }
  const vals = await Promise.all(days.map((day) => abInfo(`views-${day}`)));
  const nums = vals.map((v) => (v === null ? 0 : v));
  const max = Math.max(1, ...nums);
  document.getElementById("adminBars").innerHTML = nums
    .map(
      (v, i) =>
        `<div class="abar" title="${days[i]} — ${v} unique"><div style="height:${Math.max(2, Math.round((v / max) * 100))}%"></div><span>${days[i].slice(5)}</span></div>`
    )
    .join("");
  const t = await abInfo(VIEWS.key);
  document.getElementById("adminTotal").textContent =
    `total ${((t === null ? 0 : t) + VIEWS.base).toLocaleString()} views • 14-day unique graph`;
}
renderAdmin();

/* player follows your live Spotify track (art + title); Drake when idle */
const HOUSE_TRACK = {
  song: "Trust Issues",
  artist: "Drake • Care Package",
  art: "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/34/e5/46/34e546b6-94c9-960e-cd35-4f35ffcd6860/19UMGIM71794.rgb.jpg/600x600bb.jpg",
};
function syncPlayer(d) {
  const song = document.getElementById("pSong");
  const artist = document.getElementById("pArtist");
  const art = document.getElementById("pArt");
  const live = document.getElementById("pLive");
  if (!song || !artist || !art) return;
  if (d && d.listening_to_spotify && d.spotify) {
    song.textContent = d.spotify.song;
    artist.textContent = `${d.spotify.artist} • ${d.spotify.album}`;
    if (art.src !== d.spotify.album_art_url) art.src = d.spotify.album_art_url;
    if (live) live.hidden = false;
  } else {
    song.textContent = HOUSE_TRACK.song;
    artist.textContent = HOUSE_TRACK.artist;
    if (!art.src.endsWith("19UMGIM71794.rgb.jpg/600x600bb.jpg")) art.src = HOUSE_TRACK.art;
    if (live) live.hidden = true;
  }
}

/* live viewer ticker: vanity crowd that drifts; real count wins if worker says more */
let shown = 9 + Math.floor(Math.random() * 13); // 9–21
function paintNow() {
  const el = document.getElementById("nowCount");
  if (el) el.textContent = shown.toLocaleString();
}
paintNow();
(function drift() {
  setTimeout(() => {
    shown = Math.max(5, Math.min(32, shown + (Math.random() < 0.45 ? -1 : 1) + (Math.random() < 0.12 ? 1 : 0)));
    paintNow();
    drift();
  }, 22000 + Math.random() * 22000);
})();
let visitorId = null;
try {
  visitorId = sessionStorage.getItem("jx4r_vid");
  if (!visitorId) {
    visitorId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("jx4r_vid", visitorId);
  }
} catch {
  visitorId = "x" + Math.random().toString(36).slice(2);
}
async function beat() {
  if (!CONFIG.counterApi) {
    paintNow();
    return;
  }
  try {
    const r = await fetch(CONFIG.counterApi.replace(/\/$/, "") + "/api/beat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: visitorId }),
    });
    const j = await r.json();
    if (typeof j.value === "number") {
      if (j.value > shown) shown = j.value; // real crowd wins
      paintNow();
    } else {
      paintNow();
    }
  } catch {
    paintNow();
  }
}
document.getElementById("enter").addEventListener("click", () => {
  beat();
  setInterval(beat, 30000);
});

/* 3D tilt + spotlight (guns.lol-style interactivity) */
(() => {
  const card = document.querySelector(".card");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!card || !fine) return;
  const strength = 9;
  document.querySelector(".wrap").addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
    const py = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
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
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
    ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
    requestAnimationFrame(loop);
  })();
})();

/* glass music player — Trust Issues, Drake (official 30s preview, loops) */
(() => {
  const audio = document.getElementById("track");
  const player = document.getElementById("player");
  const toggle = document.getElementById("pToggle");
  const prog = document.getElementById("pProg");
  const art = document.getElementById("pArt");
  if (!audio || !player || !toggle) return;
  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  let playing = false;
  function render() {
    toggle.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    if (art) art.classList.toggle("spin", playing);
  }
  async function play() {
    try {
      await audio.play();
    } catch {
      /* autoplay blocked — user hits play */
    }
  }
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (playing) audio.pause();
    else play();
  });
  audio.addEventListener("play", () => {
    playing = true;
    render();
  });
  audio.addEventListener("pause", () => {
    playing = false;
    render();
  });
  audio.addEventListener("timeupdate", () => {
    if (audio.duration && prog) prog.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    const t = document.getElementById("pTime");
    if (t && audio.duration) {
      const s = Math.floor(audio.currentTime);
      t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }
  });
  document.getElementById("enter").addEventListener("click", () => {
    player.hidden = false;
    play(); // entering counts as a gesture, so autoplay is allowed
  });
  play(); // try sound on the startup screen too (works if the browser allows it)
  render();
})();

/* procedural rain sound (filtered noise, no audio file needed) */
(() => {
  const btn = document.getElementById("snd");
  if (!btn) return;
  const ON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.6 5.4a9 9 0 0 1 0 13.2"/></svg>';
  const OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19" fill="currentColor" stroke="none"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  let ctx = null, gain = null, on = false;
  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    const len = 2 * ctx.sampleRate;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02; // pink-ish
        d[i] = last * 3.4;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1500;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 250;
    gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(lp);
    lp.connect(hp);
    hp.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    return true;
  }
  function fade(to) {
    if (!ctx || !gain) return;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(to, ctx.currentTime + 1.2);
  }
  function render() {
    btn.innerHTML = on ? ON : OFF;
    btn.classList.toggle("off", !on);
  }
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!ctx && !build()) return;
    ctx.resume();
    on = !on;
    fade(on ? 0.055 : 0);
    render();
  });
  document.getElementById("enter").addEventListener("click", () => {
    if (!ctx) build();
    if (!ctx) return;
    ctx.resume();
    if (!on) {
      on = true;
      fade(0.055);
      render();
    }
  });
  render();
})();

/* storm: gusting wind, 3 depth layers, bouncing droplets, ripples, lightning */
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

  // kind: 0 far veil, 1 mid rain, 2 near giants (big, blurred, fast)
  function make(kind) {
    const base = {
      x: Math.random() * (W + 80) - 40,
      y: Math.random() * H,
      kind,
    };
    if (kind === 0) return { ...base, len: 7 + Math.random() * 9, sp: 7 + Math.random() * 5, o: 0.08 + Math.random() * 0.12, w: 0.8 };
    if (kind === 2) return { ...base, len: 34 + Math.random() * 26, sp: 24 + Math.random() * 12, o: 0.08 + Math.random() * 0.09, w: 2.1 };
    return { ...base, len: 15 + Math.random() * 22, sp: 13 + Math.random() * 9, o: 0.22 + Math.random() * 0.3, w: 1.2 };
  }
  const N = Math.min(260, Math.floor(innerWidth / 5.5));
  const drops = [];
  for (let i = 0; i < N; i++) drops.push(make(i % 10 < 3 ? 0 : i % 10 < 8 ? 1 : 2));
  const ripples = [];
  const spray = [];

  function groundHit(d) {
    if (d.kind === 2) return; // giants dissolve into the dark
    if (Math.random() < 0.24 && ripples.length < 42) {
      ripples.push({ x: d.x, y: H - 2 - Math.random() * 46, r: 1, a: 0.3 });
    }
    if (d.kind === 1 && Math.random() < 0.5 && spray.length < 90) {
      for (let k = 0; k < 2; k++) {
        spray.push({
          x: d.x, y: H - 3,
          vx: (Math.random() - 0.5) * 2.4, vy: -(1.2 + Math.random() * 2.4),
          a: 0.5,
        });
      }
    }
  }

  function step(t) {
    // gusting wind: slow swells + fast shivers
    const wind = -1.7 + Math.sin(t / 4200) * 1.3 + Math.sin(t / 900) * 0.45;
    x.clearRect(0, 0, W, H);
    x.lineCap = "round";

    for (const d of drops) {
      const sway = d.kind === 2 ? wind * 1.6 : wind;
      x.strokeStyle = `rgba(208, 216, 232, ${d.o})`;
      x.lineWidth = d.w;
      x.beginPath();
      x.moveTo(d.x, d.y);
      x.lineTo(d.x - sway * d.len * 0.3, d.y - d.len);
      x.stroke();
      d.y += d.sp * (1 + Math.abs(wind) * 0.08);
      d.x += sway;
      if (d.y > H + 12) {
        groundHit(d);
        Object.assign(d, make(d.kind), { y: -24, x: Math.random() * (W + 80) - 40 });
      }
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const s = ripples[i];
      s.r += 1.1;
      s.a -= 0.026;
      if (s.a <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      x.strokeStyle = `rgba(208, 216, 232, ${s.a})`;
      x.lineWidth = 1;
      x.beginPath();
      x.ellipse(s.x, s.y, s.r * 1.9, s.r * 0.6, 0, 0, Math.PI * 2);
      x.stroke();
    }

    x.fillStyle = "rgba(215, 222, 236, 1)";
    for (let i = spray.length - 1; i >= 0; i--) {
      const p = spray[i];
      p.vy += 0.32;
      p.x += p.vx + wind * 0.4;
      p.y += p.vy;
      p.a -= 0.03;
      if (p.a <= 0 || p.y > H) {
        spray.splice(i, 1);
        continue;
      }
      x.globalAlpha = Math.max(0, p.a);
      x.fillRect(p.x, p.y, 1.6, 1.6);
    }
    x.globalAlpha = 1;

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
