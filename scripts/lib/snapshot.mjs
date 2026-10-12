/**
 * collect() runs inside the screen page (page.evaluate) and returns the Snapshot fields
 * rules.mjs evaluates (everything except screen/platform). It must stay self-contained.
 * Device chrome injected by device.js (.sb, .home) is ignored.
 */
export async function collect() {
  const CHROME = ".sb, .home";
  const TARGETS = "a, button, [role=button], input, select, [data-tap]";
  const PRICE = /[€$£¥₹]\s?\d|\d[.,]\d{2}\s?[€$£]/;
  const vw = innerWidth, vh = innerHeight;

  const isChrome = (el) => Boolean(el.closest(CHROME));
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) return false;
    }
    return true;
  };
  const alpha = (c) => {
    const m = c.match(/rgba?\(([^)]*)\)/);
    if (!m) return c === "transparent" ? 0 : 1;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    return parts.length > 3 ? parseFloat(parts[3]) : 1;
  };
  const rgba = (c) => {
    const m = c.match(/rgba?\(([^)]*)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  // The colour actually behind `el`: translucent backgrounds are blended onto their ancestors'.
  // null when an image or gradient is in the way (contrast unknown).
  const effectiveBg = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
      const c = rgba(cs.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 1) break;
      }
    }
    let out = { r: 255, g: 255, b: 255 };
    for (const c of layers.reverse()) out = { r: c.r * c.a + out.r * (1 - c.a), g: c.g * c.a + out.g * (1 - c.a), b: c.b * c.a + out.b * (1 - c.a) };
    return `rgb(${Math.round(out.r)}, ${Math.round(out.g)}, ${Math.round(out.b)})`;
  };
  const directText = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();

  // Force-load every declared face whose family is used, so broken URLs surface as errors.
  const all = [...document.querySelectorAll("body *")];
  const used = new Set(all.map((el) => getComputedStyle(el).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "")));
  await Promise.all([...document.fonts].filter((f) => used.has(f.family.replace(/^["']|["']$/g, ""))).map((f) => f.load().catch(() => {})));
  await document.fonts.ready;
  const failedFonts = [...new Set([...document.fonts].filter((f) => f.status === "error").map((f) => f.family.replace(/^["']|["']$/g, "")))];

  // External <use href="file.svg#id">: a sprite that isn't valid XML (e.g. "--" inside a comment)
  // or lacks the id draws nothing, silently. Load each sprite and check.
  const brokenIllustrations = [];
  const hrefs = [...document.querySelectorAll("use")]
    .map((u) => u.getAttribute("href") || u.getAttribute("xlink:href"))
    .filter((h) => h && !h.startsWith("#"));
  const byFile = new Map();
  for (const h of hrefs) {
    const url = new URL(h, location.href);
    const file = url.href.split("#")[0];
    if (!byFile.has(file)) byFile.set(file, { ids: new Set(), name: h.split("#")[0] });
    if (url.hash) byFile.get(file).ids.add(url.hash.slice(1));
  }
  const load = (url) => new Promise((resolve) => {
    const x = new XMLHttpRequest();
    x.open("GET", url);
    x.onload = () => resolve(x.responseText);
    x.onerror = () => resolve(null);
    x.send();
  });
  for (const [file, { ids, name }] of byFile) {
    const text = await load(file);
    if (text === null || text === "") { brokenIllustrations.push({ href: name, reason: "file not found" }); continue; }
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    const err = doc.querySelector("parsererror");
    if (err) {
      brokenIllustrations.push({ href: name, reason: `not valid XML (${err.textContent.replace(/\s+/g, " ").trim().slice(0, 120)}) — check for "--" inside <!-- comments -->` });
      continue;
    }
    for (const id of ids) if (!doc.getElementById(id)) brokenIllustrations.push({ href: `${name}#${id}`, reason: "no element with that id" });
  }

  const texts = [], targets = [], gradients = [], media = [], cardGroups = [], priceTexts = [];
  const colorMap = new Map();
  const addColor = (css, role, area, interactive) => {
    if (!css || alpha(css) === 0) return;
    const key = `${css}|${role}|${interactive}`;
    const c = colorMap.get(key) ?? { css, role, area: 0, interactive };
    c.area += area;
    colorMap.set(key, c);
  };
  let maxRight = vw, minLeft = 0;

  for (const el of all) {
    if (isChrome(el) || !visible(el)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const area = Math.min(r.width, vw) * Math.min(r.height, vh);
    const interactive = Boolean(el.closest(TARGETS));
    const inSvg = Boolean(el.closest("svg"));

    if (!inSvg) addColor(cs.backgroundColor, "bg", area, interactive);
    else if (["path", "circle", "rect", "ellipse", "polygon", "line", "polyline"].includes(el.localName)) addColor(cs.fill, "fill", area, interactive);
    if (cs.backgroundImage.includes("gradient")) gradients.push(cs.backgroundImage);
    if ((el.localName === "svg" && !el.parentElement.closest("svg")) || el.localName === "img") media.push({ width: r.width, height: r.height });

    const text = directText(el);
    if (text) {
      const t = {
        text,
        fontSize: parseFloat(cs.fontSize),
        fontWeight: parseInt(cs.fontWeight, 10),
        family: cs.fontFamily,
        color: cs.color,
        bg: inSvg ? null : effectiveBg(el),
        align: cs.textAlign === "start" ? "left" : cs.textAlign,
        allowEmoji: Boolean(el.closest("[data-allow-emoji]")),
        inSvg,
      };
      texts.push(t);
      addColor(cs.color, "text", 0, interactive);
      if (!inSvg) {
        // Measure the glyphs, not the box: nowrap text can spill out of a box that fits.
        const range = document.createRange();
        range.selectNodeContents(el);
        const tr = range.getBoundingClientRect();
        maxRight = Math.max(maxRight, r.right, tr.right);
        minLeft = Math.min(minLeft, r.left, tr.left);
      }
      if (PRICE.test(text)) priceTexts.push({ fontSize: t.fontSize, paywallRole: el.closest("[data-paywall]")?.dataset.paywall ?? null });
    }
    if (el.matches(TARGETS)) {
      targets.push({
        label: el.getAttribute("aria-label") || el.innerText.trim().slice(0, 30) || el.localName,
        width: r.width, height: r.height,
        // Segmented-control segments are drawn ~32pt tall; the control pads their hit area.
        segmented: Boolean(el.closest('[role="tablist"]')),
      });
      maxRight = Math.max(maxRight, r.right);
    }

    const kids = [...el.children].filter((k) => {
      if (isChrome(k) || !visible(k)) return false;
      const ks = getComputedStyle(k);
      return alpha(ks.backgroundColor) > 0 || parseFloat(ks.borderTopLeftRadius) > 0;
    });
    // Tab bars and segmented controls repeat items by design.
    const isBar = el.matches('nav, [role="tablist"], [role="navigation"], [role="tabbar"]') || Boolean(el.closest("nav"));
    if (kids.length >= 3 && !inSvg && !isBar) {
      const sig = new Map();
      for (const k of kids) {
        const kr = k.getBoundingClientRect();
        const key = `${k.localName}|${Math.round(kr.width)}|${Math.round(kr.height)}|${k.childElementCount}`;
        sig.set(key, (sig.get(key) ?? 0) + 1);
      }
      const top = Math.max(...sig.values());
      cardGroups.push({ count: top >= 3 ? top : kids.length, identical: top >= 3 });
    }
  }

  const paywall = {};
  for (const k of ["price", "terms", "privacy", "restore", "close", "trial", "after-trial"])
    paywall[k] = [...document.querySelectorAll(`[data-paywall="${k}"]`)].map((el) => ({ visible: visible(el), fontSize: parseFloat(getComputedStyle(el).fontSize) }));

  return {
    bodyPlatform: document.body.dataset.platform ?? null,
    kind: document.body.dataset.screenKind ?? "other",
    viewport: { width: vw, height: vh },
    // Width spanned by text and controls (illustrations may bleed off the edge on purpose).
    scrollWidth: Math.ceil(maxRight - minLeft),
    failedFonts, brokenIllustrations, texts, targets, colors: [...colorMap.values()], gradients, media, cardGroups, paywall, priceTexts,
  };
}
