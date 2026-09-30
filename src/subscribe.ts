function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export async function subscribe(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Método no permitido", { status: 405 });
  }

  let payload: { email?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false }, 400);
  }

  await env.BROWNMETER_SUBS.put(email, new Date().toISOString());
  return json({ ok: true });
}
