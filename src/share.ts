type BadgeLevel = {
  slug: string;
  name: string;
  tag: string;
  color: string;
  quote: string;
  proud: string;
  shame: string;
};

type BadgeFile = { levels: BadgeLevel[] };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

function veryBrown(level: BadgeLevel, score: number | null): boolean {
  if (score !== null) return score >= 12;
  return level.slug === "espresso" || level.slug === "historico";
}

function caption(level: BadgeLevel, score: number | null): string {
  const jab = veryBrown(level, score) ? level.shame : level.proud;
  const points = score === null ? "" : ` (${score}/18)`;
  return `Mi insignia del Pañuelómetro: ${level.name}${points}. ${jab}`;
}

function parseScore(value: string | null): number | null {
  if (value === null || !/^(?:[0-9]|1[0-8])$/.test(value)) return null;
  return Number(value);
}

export async function sharePage(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "insignia") return env.ASSETS.fetch(request);

  const file = await env.ASSETS.fetch(new URL("/badges.json", url));
  if (!file.ok) return new Response("Insignias no disponibles", { status: 500 });
  const data = (await file.json()) as BadgeFile;
  const slug = parts[1];
  const level = data.levels.find((item) => item.slug === slug);
  if (!level) {
    return new Response("Insignia no encontrada", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (parts.length > 2) {
    url.pathname = `/insignia/${slug}`;
    return Response.redirect(url.toString(), 302);
  }
  const score = parseScore(url.searchParams.get("s"));
  const text = caption(level, score);
  const image = `${url.origin}/og/${level.slug}.png`;
  const canonical = url.toString();
  const title = `Insignia: ${level.name}`;
  const html = `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(text)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_AR">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(text)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(text)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<style>
body{margin:0;background:#101113;color:#f4f1f5;font-family:Arial,Helvetica,sans-serif;line-height:1.5}
.wrap{width:min(760px,calc(100% - 40px));margin:48px auto 72px}
.eyebrow{letter-spacing:2px;text-transform:uppercase;color:#68ded9;font-size:12px;font-weight:700}
h1{font-size:clamp(36px,6vw,58px);letter-spacing:-1.5px;line-height:1.05;margin:12px 0}
p{color:#cec0d1;font-size:18px}
img{width:100%;height:auto;border-radius:16px;border:1px solid #303037;display:block;margin:24px 0}
a.btn{display:inline-flex;background:#68ded9;color:#102626;text-decoration:none;font-weight:700;border-radius:8px;padding:13px 18px}
</style>
</head>
<body>
<main class="wrap">
<p class="eyebrow">Pañuelómetro · IA en un sorbo</p>
<h1>${escapeHtml(level.name)}</h1>
<p>${escapeHtml(text)}</p>
<img src="${escapeHtml(image)}" alt="${escapeHtml(`Insignia: ${level.name}`)}">
<p><a class="btn" href="/#test">Hacé el test</a></p>
</main>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function cleanText(raw: string | null, max: number, fallback: string): string {
  const value = (raw || "")
    .replace(/[\u0000-\u001f<>&"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return value || fallback;
}

export async function certificatePage(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "certificado" || !parts[1]) {
    return new Response("Certificado no encontrado", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const file = await env.ASSETS.fetch(new URL("/badges.json", url));
  if (!file.ok) return new Response("Certificados no disponibles", { status: 500 });
  const data = (await file.json()) as BadgeFile;
  const level = data.levels.find((item) => item.slug === parts[1]);
  if (!level) {
    return new Response("Certificado no encontrado", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const name = cleanText(url.searchParams.get("n"), 40, "El portador");
  const quote = cleanText(url.searchParams.get("f"), 140, level.quote);
  const score = parseScore(url.searchParams.get("s"));
  const zero = level.slug === "limpio";
  const doc = zero ? "Certificado de cero pañuelo" : "Certificado de pañuelo marrón";
  const points = score === null ? "" : ` (${score}/18)`;
  const text = `${doc} a nombre de ${name}: ${level.name}${points}. “${quote}”`;
  const image = `${url.origin}/og/${level.slug}.png`;
  const title = `${doc} · ${name}`;
  const html = `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(text)}">
<link rel="canonical" href="${escapeHtml(url.toString())}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_AR">
<meta property="og:url" content="${escapeHtml(url.toString())}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(text)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(text)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<style>
body{margin:0;background:#101113;color:#f4f1f5;font-family:Georgia,Times,serif}
.wrap{width:min(760px,calc(100% - 40px));margin:48px auto 72px}
.cert{text-align:center;border:1px solid #cbb48a;padding:42px 28px;background:radial-gradient(circle at 50% 0%,#2a1830,#141318 60%);box-shadow:inset 0 0 0 10px #101113,inset 0 0 0 11px #8d7358}
.kicker{letter-spacing:3px;text-transform:uppercase;color:#d7c4a8;font-size:12px;font-family:Arial,sans-serif}
h1{font-size:clamp(28px,5vw,44px);letter-spacing:1px;text-transform:uppercase;margin:18px 0 8px}
.lead{color:#a8a5af;font-style:italic}
.name{font-size:clamp(36px,6vw,58px);margin:8px 0 4px}
.level{color:#e7d3b1;font-size:28px}
.quote{color:#cec0d1;font-style:italic}
a.btn{display:inline-flex;background:#68ded9;color:#102626;text-decoration:none;font-weight:700;border-radius:8px;padding:13px 18px;font-family:Arial,sans-serif}
</style>
</head>
<body>
<main class="wrap">
<article class="cert">
<p class="kicker">IA en un sorbo · Pañuelómetro</p>
<h1>${escapeHtml(doc)}</h1>
<p class="lead">Se certifica que</p>
<p class="name">${escapeHtml(name)}</p>
<p class="lead">queda en el grado</p>
<p class="level">${escapeHtml(level.name)}</p>
<p class="quote">“${escapeHtml(quote)}”</p>
<p class="kicker">${escapeHtml(points ? points.trim() + " puntos de pañuelo" : "Edición 2026")}</p>
</article>
<p style="text-align:center;margin-top:28px"><a class="btn" href="/#test">Hacé el test</a></p>
</main>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
