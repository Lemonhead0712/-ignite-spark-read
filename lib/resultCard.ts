import type { Sign, SoloResultData } from "./engine";

export interface ResultCardData {
  userSign: Sign;
  partnerSign: Sign;
  result: Pick<SoloResultData, "score" | "scoreTease" | "chips">;
}

const WIDTH = 1080;
const HEIGHT = 1920;
const NIGHT = "#1A0F1E";
const NIGHT_2 = "#241428";
const EMBER_1 = "#FF6B4A";
const EMBER_2 = "#FFB347";
const IVORY = "#F5EDE6";
const IVORY_DIM = "rgba(245,237,230,.68)";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function drawResultCard(canvas: HTMLCanvasElement, { userSign, partnerSign, result }: ResultCardData): void {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // background
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, NIGHT);
  bg.addColorStop(1, NIGHT_2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ambient glow behind the score
  const glow = ctx.createRadialGradient(WIDTH / 2, 660, 40, WIDTH / 2, 660, 480);
  glow.addColorStop(0, "rgba(255,107,74,.32)");
  glow.addColorStop(1, "rgba(255,107,74,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // brand wordmark: "Ig" + italic "nite"
  ctx.font = "84px Georgia, 'Times New Roman', serif";
  const igWidth = ctx.measureText("Ig").width;
  const niteFont = "italic 84px Georgia, 'Times New Roman', serif";
  ctx.font = niteFont;
  const niteWidth = ctx.measureText("nite").width;
  const wordmarkStart = WIDTH / 2 - (igWidth + niteWidth) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = IVORY;
  ctx.font = "84px Georgia, 'Times New Roman', serif";
  ctx.fillText("Ig", wordmarkStart, 170);
  ctx.fillStyle = EMBER_2;
  ctx.font = niteFont;
  ctx.fillText("nite", wordmarkStart + igWidth, 170);
  ctx.textAlign = "center";

  // eyebrow
  ctx.font = "bold 26px Arial, Helvetica, sans-serif";
  ctx.fillStyle = EMBER_2;
  ctx.fillText("S P A R K   R E A D", WIDTH / 2, 224);

  // sign pairing
  ctx.font = "44px Arial, Helvetica, sans-serif";
  const pairing = `${userSign.n}  ×  ${partnerSign.n}`;
  ctx.fillStyle = IVORY_DIM;
  ctx.fillText(pairing, WIDTH / 2, 320);

  // score ring
  const ringCx = WIDTH / 2;
  const ringCy = 660;
  const ringR = 220;
  ctx.lineWidth = 22;
  ctx.strokeStyle = NIGHT_2;
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
  ctx.stroke();

  const pct = Math.max(0, Math.min(100, result.score)) / 100;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + pct * Math.PI * 2;
  const ringGradient = ctx.createLinearGradient(ringCx - ringR, ringCy - ringR, ringCx + ringR, ringCy + ringR);
  ringGradient.addColorStop(0, EMBER_1);
  ringGradient.addColorStop(1, EMBER_2);
  ctx.strokeStyle = ringGradient;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, startAngle, endAngle);
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.font = "128px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = IVORY;
  ctx.fillText(String(result.score), ringCx, ringCy + 40);
  ctx.font = "bold 24px Arial, Helvetica, sans-serif";
  ctx.fillStyle = IVORY_DIM;
  ctx.fillText("S P A R K   S C O R E", ringCx, ringCy + 88);

  // tease quote
  ctx.font = "italic 38px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = IVORY_DIM;
  const teaseLines = wrapText(ctx, `"${result.scoreTease}"`, 860);
  let teaseY = 1040;
  for (const line of teaseLines) {
    ctx.fillText(line, WIDTH / 2, teaseY);
    teaseY += 50;
  }

  // chips
  ctx.font = "bold 30px Arial, Helvetica, sans-serif";
  let chipY = teaseY + 60;
  for (const chip of result.chips) {
    const chipWidth = ctx.measureText(chip).width + 80;
    const chipHeight = 76;
    const chipX = WIDTH / 2 - chipWidth / 2;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(chipX, chipY, chipWidth, chipHeight, chipHeight / 2);
    } else {
      ctx.rect(chipX, chipY, chipWidth, chipHeight);
    }
    ctx.strokeStyle = "rgba(245,237,230,.24)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#FFB4C4";
    ctx.fillText(chip, WIDTH / 2, chipY + chipHeight / 2 + 11);
    chipY += chipHeight + 24;
  }

  // footer
  ctx.font = "28px Arial, Helvetica, sans-serif";
  ctx.fillStyle = IVORY_DIM;
  ctx.fillText("Two minutes. Zero mercy.", WIDTH / 2, HEIGHT - 140);
  ctx.font = "bold 26px Arial, Helvetica, sans-serif";
  ctx.fillStyle = EMBER_2;
  ctx.fillText("sparkread.netlify.app", WIDTH / 2, HEIGHT - 90);
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

export async function saveOrShareResultCard(data: ResultCardData): Promise<"shared" | "downloaded" | "failed"> {
  const canvas = document.createElement("canvas");
  drawResultCard(canvas, data);
  const blob = await canvasToPngBlob(canvas);
  if (!blob) return "failed";

  const file = new File([blob], "spark-read.png", { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My Spark Read" });
      return "shared";
    } catch {
      // user cancelled or share failed — fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "spark-read.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return "downloaded";
}
