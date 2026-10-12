/** HTML for a contact sheet: renders in device frames, in a row, on a soft ground (like a studio presentation). */
export function sheetHtml({ images, bg = "radial-gradient(120% 120% at 50% 0%, #FFFFFF 0%, #ECEEF2 100%)", labels = [] }) {
  const W = 300; // CSS px per device
  const perRow = Math.min(images.length, 8);
  const width = perRow * W + (perRow - 1) * 56 + 96 * 2;
  const figures = images
    .map(({ dataUri, width, height, platform = "ios" }, i) => {
      const ios = platform !== "android";
      const h = Math.round((W * height) / width);
      const label = labels[i] ? `<figcaption>${labels[i]}</figcaption>` : "";
      return `<figure><div class="frame ${ios ? "ios" : "android"}" style="width:${W}px;height:${h}px">
        <img src="${dataUri}" width="${W}" height="${h}">
        ${ios ? '<i class="island"></i>' : '<i class="punch"></i>'}
      </div>${label}</figure>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0}
    body{background:${bg};display:flex;flex-wrap:wrap;gap:56px;padding:96px;width:${width}px;box-sizing:border-box;
      font:500 15px system-ui,BlinkMacSystemFont,sans-serif;color:#3b3f46}
    figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:20px}
    .frame{position:relative;border-radius:44px;overflow:hidden;box-shadow:0 0 0 8px #0d0d0f,0 0 0 9.5px #3a3a3e,0 30px 60px -10px rgba(20,24,40,.35)}
    .frame img{display:block}
    .frame.android{border-radius:34px}
    .island{position:absolute;top:8px;left:50%;width:86px;height:25px;margin-left:-43px;border-radius:20px;background:#000}
    .punch{position:absolute;top:10px;left:50%;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#000}
  </style></head><body>${figures}</body></html>`;
}
