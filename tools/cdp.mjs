// Мини-клиент Chrome DevTools Protocol без зависимостей (Node 22+).
import fs from "node:fs";
export async function connect(port = 9333) {
  const targets = await (await fetch(`http://localhost:${port}/json`)).json();
  let t = targets.find(x => x.type === "page");
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));
  let id = 0; const pend = new Map(); const listeners = [];
  ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else listeners.forEach(l => l(m));
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const api = {
    send, sleep, on: l => listeners.push(l), close: () => ws.close(),
    async eval(expr) { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval error"); return r.result.value; },
    async viewport(w, h, dsf = 1) { await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dsf, mobile: false }); },
    async goto(url, wait = 3000) { await send("Page.enable"); await send("Page.navigate", { url }); await sleep(wait); },
    async shot(file, clip) { const p = { format: "png" }; if (clip) p.clip = { ...clip, scale: 1 }; const r = await send("Page.captureScreenshot", p); fs.writeFileSync(file, Buffer.from(r.data, "base64")); },
  };
  return api;
}
