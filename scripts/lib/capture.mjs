import { spawn, spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

export { ffmpegPath };

/** Pause every animation in every frame of the page and move it to `ms`. */
export async function seek(page, ms) {
  await Promise.all(
    page.frames().map((f) =>
      f.evaluate((t) => {
        for (const a of document.getAnimations()) {
          a.pause();
          a.currentTime = t;
        }
      }, ms).catch(() => {}),
    ),
  );
}

/** Reads width, height and duration from ffmpeg's banner (ffmpeg-static ships no ffprobe). */
export function probe(file) {
  const { stderr } = spawnSync(ffmpegPath, ["-hide_banner", "-i", file], { encoding: "utf8" });
  const d = stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const v = stderr.match(/Video: .*?, (\d{2,5})x(\d{2,5})/);
  if (!d || !v) throw new Error(`cannot probe ${file}:\n${stderr}`);
  return { width: +v[1], height: +v[2], seconds: +d[1] * 3600 + +d[2] * 60 + +d[3] };
}

/** An ffmpeg process that encodes PNG frames written to its stdin into an H.264 MP4. */
export function encoder(out, fps) {
  const proc = spawn(
    ffmpegPath,
    ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", out],
    { stdio: ["pipe", "ignore", "pipe"] },
  );
  let err = "";
  proc.stderr.on("data", (d) => (err += d));
  const done = new Promise((resolve, reject) =>
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${err}`)))),
  );
  const write = (buf) => new Promise((resolve) => (proc.stdin.write(buf) ? resolve() : proc.stdin.once("drain", resolve)));
  const end = () => {
    proc.stdin.end();
    return done;
  };
  return { write, end };
}
