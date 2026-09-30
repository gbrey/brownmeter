function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function cleanEmail(value: unknown): string | null {
  const email = String(value || "").trim().toLowerCase();
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

async function bump(env: Env, key: string): Promise<void> {
  const current = Number(await env.BROWNMETER_SUBS.get(key)) || 0;
  await env.BROWNMETER_SUBS.put(key, String(current + 1));
}

export async function issueCertificate(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Método no permitido", { status: 405 });
  }

  let payload: { email?: unknown; kind?: unknown; light?: unknown; nonce?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const email = cleanEmail(payload.email);
  const kind = payload.kind === "gift" ? "gift" : payload.kind === "test" ? "test" : "";
  const nonce = String(payload.nonce || "");
  if (!email || !kind || !/^[0-9a-f-]{36}$/i.test(nonce)) {
    return json({ ok: false }, 400);
  }

  await env.BROWNMETER_SUBS.put(email, new Date().toISOString());

  const seenKey = `seen:${nonce}`;
  const seen = await env.BROWNMETER_SUBS.get(seenKey);
  if (!seen) {
    await bump(env, kind === "gift" ? "stat:gifts" : "stat:tests");
    if (kind === "test" && payload.light === true) await bump(env, "stat:light");
    await env.BROWNMETER_SUBS.put(seenKey, "1", { expirationTtl: 60 * 60 * 24 * 30 });
  }

  return json({ ok: true });
}

export async function readStats(env: Env): Promise<Response> {
  const [tests, gifts, light] = await Promise.all([
    env.BROWNMETER_SUBS.get("stat:tests"),
    env.BROWNMETER_SUBS.get("stat:gifts"),
    env.BROWNMETER_SUBS.get("stat:light"),
  ]);
  return json({
    tests: Number(tests) || 0,
    gifts: Number(gifts) || 0,
    light: Number(light) || 0,
  });
}
