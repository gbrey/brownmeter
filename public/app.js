const levels = [
  { name: "Marrón clarito", tag: "El postergador", quote: "El lunes empiezo.", desc: "Tenés la cuenta creada. Lo que no tenés es una primera conversación.", tip: "Hoy probá una tarea de diez minutos.", color: "#c29b76" },
  { name: "Marrón café", tag: "El escéptico", quote: "Lo probé y no sirve.", desc: "Un prompt malo en 2023 se convirtió en tu argumento para siempre.", tip: "Repetí la prueba con contexto y un objetivo.", color: "#ab7854" },
  { name: "Marrón chocolate", tag: "El artesano", quote: "Yo lo hago a mano.", desc: "Confundís hacer todo vos con aportar más valor.", tip: "Compará una tarea con IA y sin IA.", color: "#875235" },
  { name: "Marrón espresso", tag: "El resistente", quote: "Acá no aplica.", desc: "Todavía no encontraste un caso de uso. Tampoco lo buscaste.", tip: "Buscá un caso concreto de tu actividad.", color: "#643a28" },
  { name: "Marrón histórico", tag: "El último bastión", quote: "Esto ya va a pasar.", desc: "Si la resistencia al cambio cotizara, tendrías el mercado.", tip: "Probá antes de escribir el próximo manifiesto.", color: "#41271d" },
];
const slugs = ["clarito", "cafe", "chocolate", "espresso", "historico"];
const questions = [
  "Dejás que un agente haga una parte del trabajo y después la revisás.",
  "Usás IA en una tarea real de tu semana, no solo para mirar una demo.",
  "Si el resultado es flojo, reescribís el pedido en vez de cerrar la pestaña.",
  "Tenés un flujo propio: contexto, herramienta y revisión.",
  "Probás una idea con IA antes de decir que no aplica.",
  "La IA ya está en tu oficio. El criterio sigue siendo tuyo.",
];
const options = ["Nunca", "A veces", "Seguido", "Siempre"];
const $ = (selector) => document.querySelector(selector);
let answers = [];
let step = 0;

function certMarkup(prefix) {
  return `<article class="cert" id="${prefix}Cert"><p class="cert-kicker">IA en un sorbo · Pañuelómetro</p><p class="cert-doc" id="${prefix}Doc">Certificado de pañuelo marrón</p><p class="cert-lead">Se certifica que</p><p class="cert-name" id="${prefix}Name">El portador</p><p class="cert-lead" id="${prefix}Verb">queda en el grado de</p><p class="cert-level" id="${prefix}Level"></p><p class="cert-quote" id="${prefix}Quote"></p><p class="small" id="${prefix}Meta"></p></article>`;
}

function paintCert(prefix, model) {
  const name = String(model.name || "").trim() || "El portador";
  $(`#${prefix}Doc`).textContent = model.slug === "limpio" ? "Certificado de cero pañuelo" : "Certificado de pañuelo marrón";
  $(`#${prefix}Name`).textContent = name;
  $(`#${prefix}Verb`).textContent = model.kind === "dedicatoria" ? "recibe el grado de" : "queda en el grado de";
  $(`#${prefix}Level`).textContent = model.levelName;
  $(`#${prefix}Quote`).textContent = `“${String(model.quote || "").replace(/^[“"]|[”"]$/g, "")}”`;
  $(`#${prefix}Meta`).textContent = Number.isInteger(model.score) ? `${model.score}/18 puntos de pañuelo` : "Dedicatoria · edición 2026";
}

function render() {
  const quiz = $("#quiz");
  if (step === 6) {
    const use = answers.reduce((sum, value) => sum + value, 0);
    const brown = 18 - use;
    const idx = brown === 0 ? -1 : Math.min(4, Math.floor(((brown - 1) * 5) / 18));
    const level = levels[idx];
    const shown = level || {
      name: "Cyborg",
      tag: "Agentic",
      quote: "La IA ya es parte del oficio.",
      desc: "Usás IA como parte del oficio y el criterio sigue siendo tuyo. Cero pañuelo.",
      tip: "Compartí un flujo concreto con alguien que todavía no arrancó.",
      color: "#68ded9",
    };
    const slug = idx < 0 ? "limpio" : slugs[idx];
    quiz.innerHTML = `<div id="result"><span class="eyebrow">Tu nivel de pañuelo</span><div class="resultnum">${brown}<span style="font-size:24px;color:#a8a5af"> / 18</span></div><p class="small">Puntos de pañuelo. Más agentic, menos marrón. Uso de IA: ${use}/18.</p><form id="certForm"><label for="certName">A nombre de</label><input id="certName" maxlength="40" required placeholder="Tu nombre" autocomplete="name"><label for="certEmail">Tu correo, para generar el certificado</label><input id="certEmail" type="email" required maxlength="120" placeholder="tu@correo.com" autocomplete="email"><div class="actions"><button class="btn primary" id="issueCert" type="submit">Generar certificado</button><button class="btn" id="restart" type="button">Repetir el test</button></div><p id="certStatus" class="small" role="status">Sin correo no hay diploma. Queda en la lista de IA en un Sorbo y no se publica.</p></form><div id="certOut" hidden>${certMarkup("own")}<div id="shareSlot"></div>${level ? '<div class="actions"><a class="btn" id="useResult" href="/dedicar">Dedicar este nivel</a></div>' : ""}</div><p class="small">La escala es humor, no una medida científica.</p></div>`;
    $("#restart").onclick = () => {
      clearCertificateNonce("test");
      answers = [];
      step = 0;
      render();
    };
    const base = {
      levelName: shown.name,
      quote: shown.quote,
      score: brown,
      slug,
      veryBrown: idx >= 3,
      kind: "propio",
    };
    $("#certForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = $("#issueCert");
      const status = $("#certStatus");
      button.disabled = true;
      status.textContent = "Guardando el correo…";
      try {
        await registerCertificate({
          email: $("#certEmail").value.trim(),
          kind: "test",
          light: brown <= 4,
          nonce: certificateNonce("test"),
        });
      } catch (error) {
        button.disabled = false;
        status.textContent = error.status === 400 ? "Ese correo no se puede anotar." : "No pude guardarlo. Probá de nuevo.";
        return;
      }
      $("#certOut").hidden = false;
      const repaint = () => {
        paintCert("own", { ...base, name: $("#certName").value });
        refreshShare();
      };
      const refreshShare = mountSocial($("#shareSlot"), () => ({ ...base, name: $("#certName").value }));
      $("#certName").oninput = repaint;
      repaint();
      if ($("#useResult")) {
        const params = new URLSearchParams({ nivel: String(Math.max(idx, 0)), nombre: $("#certName").value.trim() });
        $("#useResult").href = `/dedicar?${params}`;
      }
      status.textContent = "Listo. El certificado está a tu nombre y el correo quedó en IA en un Sorbo.";
      button.disabled = false;
    });
    return;
  }
  quiz.innerHTML = `<span class="eyebrow">Pregunta ${step + 1} de 6</span><div class="progress"><i style="width:${(step / 6) * 100}%"></i></div><h3>${questions[step]}</h3><div class="answers">${options.map((label, index) => `<button class="answer" type="button" data-value="${index}" aria-pressed="${answers[step] === index}">${label}</button>`).join("")}</div>${step ? '<button class="back" id="back" type="button">Volver a la anterior</button>' : '<p class="small">Respondé sin pedirle ayuda a la IA.</p>'}`;
  quiz.querySelectorAll(".answer").forEach((button) => {
    button.onclick = () => {
      answers[step] = Number(button.dataset.value);
      step += 1;
      render();
    };
  });
  if (step) {
    $("#back").onclick = () => {
      step -= 1;
      render();
    };
  }
}

$("#levels").innerHTML = levels.map((level, index) => `<article class="level" style="--tone:${level.color}"><span class="number">NIVEL 0${index + 1}</span><div class="swatch"></div><h3>${level.name}</h3><p>“${level.quote}”</p><p>${level.desc}</p><strong>${level.tag}</strong></article>`).join("");
render();
