function certificateNonce(kind) {
  const key = `bm-nonce-${kind}`;
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
}

function clearCertificateNonce(kind) {
  sessionStorage.removeItem(`bm-nonce-${kind}`);
}

async function registerCertificate({ email, kind, light, nonce }) {
  const response = await fetch("/api/certificate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, kind, light: Boolean(light), nonce }),
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok || !data.ok) {
    const error = new Error("reject");
    error.status = response.status;
    throw error;
  }
}
