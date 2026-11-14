"use client";

import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";

const RAD = Math.PI / 180;
const TIMELINE = 40;

const CONFIG = {
  cycleSeconds: 40,
  home: [117, 3] as [number, number],
  origin: { lon: 106.8, lat: -6.2, id: "Indonesia", en: "Indonesia" },
  follow: 0.78,
  driftDeg: 5,
  flightBase: 2.4,
  flightPerRad: 1.9,
  holdSeconds: 1.0,
  returnSeconds: 2.2,
  labelSeconds: 2.0,
  trailFadeSeconds: 1.6,
  trailLengthRad: 0.9,
  altitude: 0.07,
  planeSize: 0.052,
  graticuleStep: 20,
  maxDpr: 2,
  reducedRoute: 0,
  routes: [
    { id: "Australia", en: "Australia", lon: 151.2, lat: -33.9, start: 0.4 },
    { id: "Singapura", en: "Singapore", lon: 103.8, lat: 1.35, start: 2.6 },
    { id: "China", en: "China", lon: 116.4, lat: 39.9, start: 5.6 },
    { id: "Jepang", en: "Japan", lon: 139.7, lat: 35.7, start: 7.8 },
    { id: "Korea", en: "Korea", lon: 127.0, lat: 37.6, start: 10.4 },
    { id: "Timur Tengah", en: "Middle East", lon: 55.3, lat: 25.2, start: 14.2 },
    { id: "Inggris", en: "United Kingdom", lon: -0.13, lat: 51.5, start: 16.4 },
    { id: "Eropa", en: "Europe", lon: 9.2, lat: 45.5, start: 19.0 },
    { id: "Kanada", en: "Canada", lon: -79.4, lat: 43.7, start: 26.4 },
    { id: "Amerika Serikat", en: "United States", lon: -118.2, lat: 34.1, start: 28.6 },
  ],
};

function vec(ll: [number, number]): [number, number, number] {
  const l = ll[0] * RAD;
  const p = ll[1] * RAD;
  const c = Math.cos(p);
  return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)];
}

function lonlat(v: [number, number, number]): [number, number] {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return [Math.atan2(v[1], v[0]) / RAD, Math.asin(v[2] / n) / RAD];
}

function geoDistance(a: [number, number], b: [number, number]): number {
  const va = vec(a);
  const vb = vec(b);
  const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  return Math.acos(dot);
}

function geoInterpolate(a: [number, number], b: [number, number]) {
  const va = vec(a);
  const vb = vec(b);
  const omega = geoDistance(a, b);
  const sinOmega = Math.sin(omega);
  return (t: number): [number, number] => {
    if (sinOmega < 1e-6) return a;
    const k0 = Math.sin((1 - t) * omega) / sinOmega;
    const k1 = Math.sin(t * omega) / sinOmega;
    return lonlat([
      va[0] * k0 + vb[0] * k1,
      va[1] * k0 + vb[1] * k1,
      va[2] * k0 + vb[2] * k1,
    ]);
  };
}

function smooth(x: number) {
  const c = x < 0 ? 0 : x > 1 ? 1 : x;
  return c * c * (3 - 2 * c);
}

function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function decodeTopoLand(topo: any): [number, number][][] {
  if (!topo || !topo.arcs || !topo.objects?.land) return [];
  const scale = topo.transform?.scale || [1, 1];
  const translate = topo.transform?.translate || [0, 0];

  const decodedArcs: [number, number][][] = topo.arcs.map((arc: number[][]) => {
    let x = 0;
    let y = 0;
    return arc.map((pt) => {
      x += pt[0];
      y += pt[1];
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]] as [
        number,
        number
      ];
    });
  });

  const getArc = (idx: number): [number, number][] => {
    if (idx >= 0) return decodedArcs[idx];
    return [...decodedArcs[~idx]].reverse();
  };

  const rings: [number, number][][] = [];
  const geoms = topo.objects.land.geometries || [topo.objects.land];

  for (const g of geoms) {
    const polys =
      g.type === "Polygon"
        ? [g.arcs]
        : g.type === "MultiPolygon"
        ? g.arcs
        : [];
    for (const poly of polys) {
      for (const ringArcs of poly) {
        const ring: [number, number][] = [];
        for (const arcIdx of ringArcs) {
          const pts = getArc(arcIdx);
          for (let i = 0; i < pts.length; i++) {
            if (i === 0 && ring.length > 0) continue;
            ring.push(pts[i]);
          }
        }
        if (ring.length > 2) rings.push(ring);
      }
    }
  }
  return rings;
}

export function HeroGlobe() {
  const { lang, t, theme } = useApp();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let raf = 0;
    let lastTs = 0;
    let clock = 0;
    let landRings: [number, number][][] = [];

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const originLL: [number, number] = [CONFIG.origin.lon, CONFIG.origin.lat];
    const homeV = vec(CONFIG.home);

    const routes = CONFIG.routes.map((r) => {
      const dest: [number, number] = [r.lon, r.lat];
      const dist = geoDistance(originLL, dest);
      const n = Math.max(10, Math.round(dist / 0.03));
      const interp = geoInterpolate(originLL, dest);
      const pts: [number, number][] = [];
      for (let k = 0; k <= n; k++) pts.push(interp(k / n));
      return {
        cfg: r,
        dest,
        dist,
        n,
        pts,
        interp,
        dur: CONFIG.flightBase + CONFIG.flightPerRad * dist,
      };
    });

    const graticuleLines: [number, number][][] = [];
    for (let lon = -180; lon < 180; lon += CONFIG.graticuleStep) {
      const line: [number, number][] = [];
      for (let lat = -80; lat <= 80; lat += 5) line.push([lon, lat]);
      graticuleLines.push(line);
    }
    for (let lat = -60; lat <= 60; lat += CONFIG.graticuleStep) {
      const line: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 5) line.push([lon, lat]);
      graticuleLines.push(line);
    }

    let W = 420;
    let H = 420;
    let R = 200;
    let cx = 210;
    let cy = 210;
    let dpr = 1;
    let center: [number, number] = [...CONFIG.home];

    const C: Record<string, string> = {};
    const readColors = () => {
      const cs = getComputedStyle(wrap);
      [
        "sea",
        "rim",
        "grat",
        "land",
        "land-tint",
        "land-edge",
        "trail",
        "origin",
        "arrive",
        "dest",
        "plane",
        "plane-fold",
        "plane-edge",
        "shadow",
        "label-bg",
        "label-line",
        "label-ink",
      ].forEach((k) => {
        C[k] = cs.getPropertyValue(`--g-${k}`).trim() || "#1b54a8";
      });
      C.font = cs.getPropertyValue("--sans").trim() || "system-ui, sans-serif";
    };

    const resize = () => {
      const b = wrap.getBoundingClientRect();
      W = Math.max(1, b.width);
      H = Math.max(1, b.height);
      dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      R = Math.min(W / 2 - 2, H * 0.54);
      cx = W / 2;
      cy = Math.max(H / 2, R + 2);
    };

    const project = (ll: [number, number]): [number, number, boolean] => {
      const lam = (ll[0] - center[0]) * RAD;
      const phi = ll[1] * RAD;
      const phi0 = center[1] * RAD;
      const sinPhi0 = Math.sin(phi0);
      const cosPhi0 = Math.cos(phi0);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const cosLam = Math.cos(lam);
      const cosc = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosLam;
      const x = cx + R * cosPhi * Math.sin(lam);
      const y = cy - R * (cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosLam);
      return [x, y, cosc >= 0];
    };

    const visible = (ll: [number, number]) =>
      geoDistance(ll, center) < Math.PI / 2 - 0.03;

    const stateAt = (r: (typeof routes)[0], time: number) => {
      const lt = (((time - r.cfg.start) % TIMELINE) + TIMELINE) % TIMELINE;
      const d = r.dur;
      let env = 0;
      if (lt < d * 0.35) env = smooth(lt / (d * 0.35));
      else if (lt < d + CONFIG.holdSeconds) env = 1;
      else env = 1 - smooth((lt - d - CONFIG.holdSeconds) / CONFIG.returnSeconds);
      return {
        flying: lt < d,
        p: lt < d ? easeInOut(lt / d) : 1,
        since: lt - d,
        env,
      };
    };

    const cameraAt = (
      time: number,
      states: ReturnType<typeof stateAt>[]
    ): [number, number] => {
      let sx = 0;
      let sy = 0;
      let sz = 0;
      let keep = 1;
      for (let i = 0; i < routes.length; i++) {
        const e = states[i].env;
        if (e <= 0) continue;
        const v = vec(routes[i].interp(states[i].p));
        sx += v[0] * e;
        sy += v[1] * e;
        sz += v[2] * e;
        keep *= 1 - e;
      }
      const a = CONFIG.follow * (1 - keep);
      const n = Math.hypot(sx, sy, sz);
      const c: [number, number] =
        n > 1e-6
          ? lonlat([
              homeV[0] * (1 - a) + (sx / n) * a,
              homeV[1] * (1 - a) + (sy / n) * a,
              homeV[2] * (1 - a) + (sz / n) * a,
            ])
          : [...CONFIG.home];
      c[0] += CONFIG.driftDeg * Math.sin((2 * Math.PI * time) / TIMELINE);
      return c;
    };

    const drawGlobeBase = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fillStyle = C.sea;
      ctx.fill();
      ctx.clip();

      ctx.beginPath();
      for (const line of graticuleLines) {
        let started = false;
        for (const pt of line) {
          const [px, py, vis] = project(pt);
          if (vis) {
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        }
      }
      ctx.strokeStyle = C.grat;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      if (landRings.length > 0) {
        ctx.beginPath();
        for (const ring of landRings) {
          let anyVis = false;
          for (let i = 0; i < ring.length; i += 3) {
            if (geoDistance(ring[i], center) < Math.PI / 2 + 0.15) {
              anyVis = true;
              break;
            }
          }
          if (!anyVis) continue;
          let started = false;
          for (const pt of ring) {
            const [px, py, vis] = project(pt);
            if (!vis) {
              started = false;
              continue;
            }
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          }
          if (started) ctx.closePath();
        }
        ctx.fillStyle = C.land;
        ctx.fill();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = C["land-tint"];
        ctx.fill();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = C["land-edge"];
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.strokeStyle = C.rim;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawTrail = (
      r: (typeof routes)[0],
      p: number,
      alpha: number,
      fullTrail = false
    ) => {
      if (alpha <= 0) return;
      ctx.strokeStyle = C.trail;
      ctx.lineWidth = 1.7;
      ctx.lineCap = "round";
      const head = p * r.n;
      const maxLen = fullTrail ? 1e9 : CONFIG.trailLengthRad;
      for (let k = 0; k < r.n && k + 1 <= head + 0.5; k++) {
        if (k % 3 === 2) continue;
        const behind = ((head - k) / r.n) * r.dist;
        const a = alpha * Math.max(0, 1 - behind / maxLen);
        if (a <= 0.02 || !visible(r.pts[k]) || !visible(r.pts[k + 1])) continue;
        const p0 = project(r.pts[k]);
        const p1 = project(r.pts[k + 1]);
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const drawPlane = (r: (typeof routes)[0], p: number, alpha: number) => {
      const ll = r.interp(p);
      if (!visible(ll) || alpha <= 0) return;
      const g = project(ll);
      const q =
        p < 0.985
          ? project(r.interp(p + 0.015))
          : project(r.interp(p - 0.015));
      let ang = Math.atan2(q[1] - g[1], q[0] - g[0]);
      if (p >= 0.985) ang += Math.PI;
      const lift = Math.sin(Math.PI * p);
      const k = 1 + CONFIG.altitude * lift;
      const x = cx + (g[0] - cx) * k;
      const y = cy + (g[1] - cy) * k - R * CONFIG.altitude * 0.5 * lift;
      const s = Math.max(10, R * CONFIG.planeSize) * (1 + 0.22 * lift);

      [
        [1.25, 0.07],
        [0.95, 0.13],
      ].forEach((b) => {
        ctx.save();
        ctx.translate(g[0], g[1] + 1);
        ctx.rotate(ang);
        ctx.scale(s * b[0] * 0.8, s * b[0] * 0.8);
        ctx.globalAlpha = alpha * b[1] * (0.6 + 0.4 * lift);
        ctx.fillStyle = C.shadow;
        ctx.beginPath();
        ctx.moveTo(1, 0);
        ctx.lineTo(-1, -0.62);
        ctx.lineTo(-0.55, 0);
        ctx.lineTo(-1, 0.62);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.scale(s, s);
      ctx.globalAlpha = alpha;
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.1 / s;
      ctx.strokeStyle = C["plane-edge"];
      ctx.beginPath();
      ctx.moveTo(1, 0);
      ctx.lineTo(-1, -0.62);
      ctx.lineTo(-0.55, 0);
      ctx.closePath();
      ctx.fillStyle = C.plane;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(1, 0);
      ctx.lineTo(-0.55, 0);
      ctx.lineTo(-1, 0.62);
      ctx.closePath();
      ctx.fillStyle = C["plane-fold"];
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const drawLabel = (
      text: string,
      x: number,
      y: number,
      alpha: number,
      below: boolean
    ) => {
      if (alpha <= 0) return;
      ctx.font = `600 12px ${C.font}`;
      const w = Math.ceil(ctx.measureText(text).width) + 16;
      const h = 24;
      const lx = Math.min(Math.max(x - w / 2, 4), W - w - 4);
      let ly = below ? y + 12 : y - 12 - h;
      ly = Math.min(Math.max(ly, 4), H - h - 4);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(lx, ly, w, h, 12);
      else ctx.rect(lx, ly, w, h);
      ctx.fillStyle = C["label-bg"];
      ctx.fill();
      ctx.strokeStyle = C["label-line"];
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C["label-ink"];
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(text, lx + w / 2, ly + h / 2 + 0.5);
      ctx.globalAlpha = 1;
    };

    const drawDot = (
      pt: [number, number, boolean],
      radius: number,
      fill: string,
      alpha: number
    ) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], radius, 0, 2 * Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = C.sea;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawOrigin = (pulse: number) => {
      if (!visible(originLL)) return;
      const o = project(originLL);
      if (pulse >= 0) {
        ctx.globalAlpha = 0.55 * (1 - pulse);
        ctx.beginPath();
        ctx.arc(o[0], o[1], 6 + 14 * pulse, 0, 2 * Math.PI);
        ctx.strokeStyle = C.origin;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      drawDot(o, 5.5, C.origin, 1);
      drawLabel(CONFIG.origin[lang], o[0], o[1], 1, pulse >= 0);
    };

    const drawArrival = (r: (typeof routes)[0], since: number) => {
      if (!visible(r.dest)) return;
      const d = project(r.dest);
      const total = CONFIG.labelSeconds + 0.5;
      if (since < 0 || since > total) return;
      const fade =
        since < 0.25
          ? since / 0.25
          : since > CONFIG.labelSeconds
          ? 1 - (since - CONFIG.labelSeconds) / 0.5
          : 1;
      if (since < 1.1) {
        const u = since / 1.1;
        ctx.globalAlpha = 0.4 * (1 - u);
        ctx.beginPath();
        ctx.arc(d[0], d[1], 5 + 20 * u, 0, 2 * Math.PI);
        ctx.fillStyle = C.arrive;
        ctx.fill();
        ctx.globalAlpha = 0.95 * (1 - u);
        ctx.strokeStyle = C.arrive;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      drawDot(d, 4.5, C.dest, fade);
      drawLabel(r.cfg[lang], d[0], d[1], fade, false);
    };

    const drawStatic = () => {
      const r = routes[CONFIG.reducedRoute] || routes[0];
      center = [...CONFIG.home];
      drawGlobeBase();
      drawTrail(r, 0.7, 0.9, true);
      drawOrigin(-1);
      const d = project(r.dest);
      drawDot(d, 4.5, C.dest, 1);
      drawLabel(r.cfg[lang], d[0], d[1], 1, true);
      drawPlane(r, 0.7, 1);
    };

    const renderFrame = (time: number, wall: number) => {
      const mqReduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (mqReduce) {
        drawStatic();
        return;
      }
      const states = routes.map((r) => stateAt(r, time));
      center = cameraAt(time, states);
      drawGlobeBase();
      for (let i = 0; i < routes.length; i++) {
        const s = states[i];
        const r = routes[i];
        if (s.flying) drawTrail(r, s.p, 0.9);
        else if (s.since < CONFIG.trailFadeSeconds) {
          drawTrail(r, 1, 0.9 * (1 - s.since / CONFIG.trailFadeSeconds));
        }
      }
      drawOrigin((wall % 2.4) / 2.4);
      for (let i = 0; i < routes.length; i++) {
        if (!states[i].flying) drawArrival(routes[i], states[i].since);
      }
      for (let i = 0; i < routes.length; i++) {
        const s = states[i];
        const r = routes[i];
        if (s.flying) drawPlane(r, s.p, Math.min(1, s.p / 0.06));
        else if (s.since < 0.35) drawPlane(r, 1, 1 - s.since / 0.35);
      }
    };

    const tick = (ts: number) => {
      if (!active) return;
      if (lastTs) clock += Math.min(0.1, (ts - lastTs) / 1000);
      lastTs = ts;
      readColors();
      renderFrame(((clock * TIMELINE) / CONFIG.cycleSeconds) % TIMELINE, clock);
      if (!paused) {
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    readColors();
    renderFrame(0.8, 0.8);

    fetch("/assets/data/land-110m.json")
      .then((res) => (res.ok ? res.json() : fetch("/data/topo-land.json").then((r) => r.json())))
      .then((topo) => {
        if (!active) return;
        landRings = decodeTopoLand(topo);
        setReady(true);
        renderFrame(((clock * TIMELINE) / CONFIG.cycleSeconds) % TIMELINE, clock);
      })
      .catch(() => {
        setReady(true);
      });

    if (!paused) {
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      resize();
      readColors();
      renderFrame(((clock * TIMELINE) / CONFIG.cycleSeconds) % TIMELINE, clock);
    };
    window.addEventListener("resize", onResize);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [lang, theme, paused]);

  return (
    <section className="hero" id="hero">
      <div className="wrap hero-in">
        <div className="hero-copy">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.tagline}</h1>
          <p className="lead">{t.hero.sub}</p>
          <div className="cta-row">
            <a id="hero-cta-book" className="btn btn-accent" href="#konsultasi">
              <span>{t.hero.ctaBook}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a id="hero-cta-aura" className="btn btn-secondary" href="#aura">
              {t.hero.ctaAsk}
            </a>
          </div>
        </div>

        <div ref={wrapRef} className="kglobe" id="kglobe">
          {!ready && (
            <svg
              className="kglobe-fallback"
              id="globe-fallback"
              viewBox="0 0 420 420"
              role="img"
              aria-labelledby="globe-fallback-title"
            >
              <title id="globe-fallback-title">
                Ilustrasi globe: pesawat kertas terbang dari Indonesia menuju
                Australia. Illustration of a globe: a paper plane flying from
                Indonesia to Australia.
              </title>
              <circle className="f-sea" cx="210" cy="210" r="200" />
              <path
                className="f-route"
                d="M174.8,241.8L220.5,277.7L265.4,307.8"
              />
              <circle className="f-origin" cx="174.8" cy="241.8" r="5.5" />
              <circle className="f-dest" cx="303.3" cy="328.6" r="4.5" />
              <path
                className="f-plane"
                transform="translate(267.9 309.4) rotate(30.8) scale(11)"
                vectorEffect="non-scaling-stroke"
                d="M1 0L-1-.62L-.55 0L-1 .62Z"
              />
              <g>
                <rect
                  className="f-chip"
                  x="135.8"
                  y="205.8"
                  width="78"
                  height="24"
                  rx="12"
                />
                <text x="174.8" y="221.8">
                  Indonesia
                </text>
              </g>
              <g>
                <rect
                  className="f-chip"
                  x="266.3"
                  y="340.6"
                  width="74"
                  height="24"
                  rx="12"
                />
                <text x="303.3" y="356.6">
                  Australia
                </text>
              </g>
            </svg>
          )}
          <canvas
            ref={canvasRef}
            id="globe-canvas"
            role="img"
            aria-label={t.hero.globeAria}
          />
          <button
            type="button"
            className="kglobe-toggle"
            id="globe-toggle"
            aria-pressed={paused}
            aria-label={paused ? t.hero.play : t.hero.pause}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <svg
                id="ico-play"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            ) : (
              <svg
                id="ico-pause"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M9 6v12M15 6v12" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
