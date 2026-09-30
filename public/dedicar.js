const levels = [
  { name: "Marrón clarito", quote: "El lunes empiezo." },
  { name: "Marrón café", quote: "Lo probé y no sirve." },
  { name: "Marrón chocolate", quote: "Yo lo hago a mano." },
  { name: "Marrón espresso", quote: "Acá no aplica." },
  { name: "Marrón histórico", quote: "Esto ya va a pasar." },
];
const slugs = ["clarito", "cafe", "chocolate", "espresso", "historico"];
const $ = (selector) => document.querySelector(selector);

function certMarkup(prefix) {
  return `<article class="cert" id="${prefix}Cert"><p class="cert-kicker">IA en un sorbo · Pañuelómetro</p><p class="cert-doc" id="${prefix}Doc">Certificado de pañuelo marrón</p><p class="cert-lead">Se certifica que</p><p class="cert-name" id="${prefix}Name">El portador</p><p class="cert-lead" id="${prefix}Verb">recibe el grado de</p><p class="cert-level" id="${prefix}Level"></p><p class="cert-quote" id="${prefix}Quote"></p><p class="small" id="${prefix}Meta"></p></article>`;
}

function paintCert(model) {
  const name = String(model.name || "").trim() || "El portador";
  $("#dediDoc").textContent = "Certificado de pañuelo marrón";
  $("#dediName").textContent = name;
  $("#dediLevel").textContent = model.levelName;
  $("#dediQuote").textContent = `“${String(model.quote || "").replace(/^[“"]|[”"]$/g, "")}”`;
  $("#dediMeta").textContent = "Dedicatoria · edición 2026";
}

function dedicationModel() {
  const idx = Number($("#levelSelect").value);
  const level = levels[idx];
  return {
    name: $("#recipient").value,
    levelName: level.name,
    quote: $("#excuse").value,
    score: null,
    slug: slugs[idx],
    veryBrown: idx >= 3,
    kind: "dedicatoria",
  };
}

function message(model) {
  const name = String(model.name || "").trim() || "El portador";
  return `Certificado de pañuelo marrón para ${name}.\nGrado: ${model.levelName}.\nFrase de cabecera: “${model.quote}”\n${location.origin}/certificado/${model.slug}?n=${encodeURIComponent(name)}&f=${encodeURIComponent(model.quote)}`;
}

const params = new URLSearchParams(location.search);
$("#levelSelect").innerHTML = levels.map((level, index) => `<option value="${index}">${index + 1} · ${level.name}</option>`).join("");
$("#excuse").innerHTML = phrases.map((phrase) => `<option>${phrase}</option>`).join("");
const nivel = Number(params.get("nivel"));
if (Number.isInteger(nivel) && nivel >= 0 && nivel < levels.length) $("#levelSelect").value = String(nivel);
if (params.get("nombre")) $("#recipient").value = params.get("nombre").slice(0, 40);
$("#dediSlot").innerHTML = certMarkup("dedi");
let giftDirty = true;
["recipient", "levelSelect", "excuse", "giftEmail"].forEach((id) => {
  $(`#${id}`).addEventListener("input", () => {
    if (giftDirty) return;
    giftDirty = true;
    clearCertificateNonce("gift");
  });
});

$("#refForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("#issueGift");
  const status = $("#status");
  button.disabled = true;
  status.textContent = "Guardando el correo…";
  const model = dedicationModel();
  try {
    await registerCertificate({
      email: $("#giftEmail").value.trim(),
      kind: "gift",
      light: false,
      nonce: certificateNonce("gift"),
    });
  } catch (error) {
    button.disabled = false;
    status.textContent = error.status === 400 ? "Ese correo no se puede anotar." : "No pude guardarlo. Probá de nuevo.";
    return;
  }
  giftDirty = false;
  $("#certOut").hidden = false;
  paintCert(model);
  mountSocial($("#dediShare"), dedicationModel);
  try {
    await navigator.clipboard.writeText(message(model));
    status.textContent = "Listo. Certificado generado y dedicatoria copiada. El correo quedó en IA en un Sorbo.";
  } catch {
    status.textContent = "Listo. El certificado está listo y el correo quedó en IA en un Sorbo.";
  }
  button.disabled = false;
});
