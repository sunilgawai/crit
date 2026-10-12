/** Store-screenshot composition: headline on the app's world colour over a device-framed render that bleeds off the bottom. */
export const SHOT = {
  ios: { width: 440, height: 956, scale: 3 }, // → 1320×2868 (App Store 6.9")
  android: { width: 360, height: 640, scale: 3 }, // → 1080×1920 (Google Play phone)
};

export function shotHtml({ image, headline, bg, ink, font = "Georgia, serif", weight = 400, fontsCss, platform }) {
  const ios = platform === "ios";
  const { width: W, height: H } = SHOT[platform];
  const deviceW = Math.round(W * (ios ? 0.8 : 0.72));
  const deviceTop = Math.round(H * (ios ? 0.27 : 0.3));
  const radius = ios ? 52 : 36;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<!doctype html><html><head><meta charset="utf-8">
${fontsCss ? `<link rel="stylesheet" href="${fontsCss}">` : ""}
<style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${bg}}
  h1{position:absolute;left:${Math.round(W * 0.09)}px;right:${Math.round(W * 0.09)}px;top:${Math.round(H * 0.075)}px;margin:0;
     font-family:${font};font-weight:${weight};font-synthesis:none;font-size:${ios ? 46 : 36}px;line-height:1.04;letter-spacing:-0.025em;color:${ink};
     text-wrap:balance;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .device{position:absolute;left:50%;top:${deviceTop}px;width:${deviceW}px;transform:translateX(-50%);
     border-radius:${radius}px;overflow:hidden;box-shadow:0 0 0 ${ios ? 9 : 7}px #0d0d0f,0 30px 70px -20px rgba(0,0,0,.35)}
  .device img{display:block;width:100%}
  .cam{position:absolute;top:${ios ? 11 : 10}px;left:50%;transform:translateX(-50%);background:#000;
     ${ios ? "width:30%;height:28px;border-radius:20px" : "width:13px;height:13px;border-radius:50%"}}
</style></head><body>
<h1>${esc(headline)}</h1>
<div class="device"><img src="${image}"><i class="cam"></i></div>
</body></html>`;
}

export function iconHtml(svgUrl) {
  return `<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;background:transparent}
img{display:block;width:100%;height:100%}</style></head><body><img src="${svgUrl}"></body></html>`;
}
