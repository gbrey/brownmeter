const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
const ICON_LI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
const ICON_DL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/></svg>';

function certificateName(value) {
  const name = String(value || "").replace(/\s+/g, " ").trim().slice(0, 40);
  return name || "El portador";
}

function bareQuote(value) {
  return String(value || "").replace(/^[“"']|[”"']$/g, "");
}

function certificateCaption(model) {
  const name = certificateName(model.name);
  const quote = bareQuote(model.quote);
  if (model.kind === "dedicatoria") {
    return `Certificado de pañuelo marrón para ${name}: ${model.levelName}. “${quote}”`;
  }
  const heading = model.slug === "limpio" ? "Certificado de cero pañuelo" : "Certificado de pañuelo marrón";
  const points = Number.isInteger(model.score) ? ` (${model.score}/18)` : "";
  const tail = model.veryBrown ? " Casi no hay IA en este diploma." : "";
  return `${heading} a nombre de ${name}: ${model.levelName}${points}.${tail}`;
}

function certificatePageUrl(model) {
  const url = new URL(`/certificado/${model.slug}`, location.origin);
  url.searchParams.set("n", certificateName(model.name));
  if (Number.isInteger(model.score)) url.searchParams.set("s", String(model.score));
  if (model.quote) url.searchParams.set("f", bareQuote(model.quote));
  return url.toString();
}

function fitLine(ctx, text, y, max, italic, startSize) {
  let size = startSize;
  ctx.font = `${italic ? "italic " : ""}${size}px Georgia`;
  while (ctx.measureText(text).width > max && size > 16) {
    size -= 1;
    ctx.font = `${italic ? "italic " : ""}${size}px Georgia`;
  }
  ctx.fillText(text, 700, y);
}

function drawCertificate(model) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 900;
  const x = canvas.getContext("2d");
  x.fillStyle = "#100f12";
  x.fillRect(0, 0, 1400, 900);
  const g = x.createLinearGradient(0, 0, 1400, 900);
  g.addColorStop(0, "#2a1830");
  g.addColorStop(1, "#102426");
  x.fillStyle = g;
  x.fillRect(36, 36, 1328, 828);
  x.strokeStyle = "#cbb48a";
  x.lineWidth = 4;
  x.strokeRect(58, 58, 1284, 784);
  x.strokeStyle = "#68ded9";
  x.lineWidth = 1;
  x.strokeRect(74, 74, 1252, 752);
  x.textAlign = "center";
  x.fillStyle = "#d7c4a8";
  x.font = "22px Georgia";
  x.fillText("IA EN UN SORBO   ·   PAÑUELÓMETRO", 700, 160);
  x.fillStyle = "#f4f1f5";
  const heading = model.slug === "limpio" ? "CERTIFICADO DE CERO PAÑUELO" : "CERTIFICADO DE PAÑUELO MARRÓN";
  fitLine(x, heading, 230, 1080, false, 34);
  x.fillStyle = "#cec0d1";
  x.font = "italic 26px Georgia";
  x.fillText("Se certifica que", 700, 310);
  x.fillStyle = "#ffffff";
  fitLine(x, certificateName(model.name), 400, 1080, false, 64);
  x.strokeStyle = "#cbb48a";
  x.beginPath();
  x.moveTo(380, 430);
  x.lineTo(1020, 430);
  x.stroke();
  x.fillStyle = "#cec0d1";
  x.font = "italic 26px Georgia";
  x.fillText(model.kind === "dedicatoria" ? "recibe el grado de" : "queda en el grado de", 700, 490);
  x.fillStyle = "#e7d3b1";
  fitLine(x, model.levelName, 560, 1080, false, 48);
  x.fillStyle = "#f4f1f5";
  fitLine(x, `“${bareQuote(model.quote)}”`, 650, 1000, true, 28);
  x.fillStyle = "#8d8794";
  x.font = "22px Georgia";
  const meta = Number.isInteger(model.score) ? `${model.score}/18 puntos de pañuelo` : "Dedicatoria · edición 2026";
  x.fillText(meta, 700, 740);
  x.fillText("Más agentic, menos marrón.", 700, 780);
  return canvas;
}

function downloadCertificate(model) {
  const a = document.createElement("a");
  a.download = "certificado-panuelo-marron.png";
  a.href = drawCertificate(model).toDataURL("image/png");
  a.click();
}

function mountSocial(slot, getModel) {
  slot.innerHTML = `<p class="shareline"></p><div class="soc"><a class="share-x" target="_blank" rel="noopener noreferrer" aria-label="Compartir en X">${ICON_X}</a><a class="share-li" target="_blank" rel="noopener noreferrer" aria-label="Compartir en LinkedIn">${ICON_LI}</a><a class="share-dl" href="#certificado" aria-label="Descargar certificado">${ICON_DL}</a></div><p class="small">En X el texto ya va escrito. En LinkedIn el certificado viaja en el enlace.</p>`;
  const paint = () => {
    const model = getModel();
    const caption = certificateCaption(model);
    const page = certificatePageUrl(model);
    slot.querySelector(".shareline").textContent = caption;
    const x = new URL("https://twitter.com/intent/tweet");
    x.searchParams.set("text", caption);
    x.searchParams.set("url", page);
    slot.querySelector(".share-x").href = x.toString();
    const linkedin = new URL("https://www.linkedin.com/sharing/share-offsite/");
    linkedin.searchParams.set("url", page);
    slot.querySelector(".share-li").href = linkedin.toString();
    slot.querySelector(".share-dl").onclick = (event) => {
      event.preventDefault();
      downloadCertificate(getModel());
    };
  };
  paint();
  return paint;
}
