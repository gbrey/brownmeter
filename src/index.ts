import { issueCertificate, readStats } from "./certificate";
import { certificatePage, sharePage } from "./share";
import { subscribe } from "./subscribe";

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/health") {
      return Response.json({ ok: true, service: "brownmeter" });
    }

    if (pathname === "/api/subscribe") {
      return subscribe(request, env);
    }

    if (pathname === "/api/certificate") {
      return issueCertificate(request, env);
    }

    if (pathname === "/api/stats") {
      return readStats(env);
    }

    if (pathname === "/insignia" || pathname.startsWith("/insignia/")) {
      return sharePage(request, env);
    }

    if (pathname === "/certificado" || pathname.startsWith("/certificado/")) {
      return certificatePage(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
