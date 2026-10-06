// Запись живого экрана терминала в WebM: CDP-скринкаст -> кадры -> MediaRecorder в самом Chrome.
import fs from "node:fs";
import { connect } from "./cdp.mjs";
const [id, label, secs = "9", jsAfter = "", jsDelay = "2500"] = process.argv.slice(2);
const OUT = decodeURIComponent(new URL("../site/assets/shots/", import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
const c = await connect();
await c.viewport(1920, 1080);
const url = await c.eval("location.href").catch(() => "");
if (!url.startsWith("http://localhost:8000")) await c.goto("http://localhost:8000/", 5000);
await c.eval(`(async()=>{const items=()=>[...document.querySelectorAll('aside button, aside a')];const find=()=>items().find(e=>e.innerText.trim().replace(/\s+/g,' ').startsWith(${JSON.stringify(label)}));let el=find();if(!el){for(const g of items().filter(b=>/^›/.test(b.innerText.trim()))){g.click();await new Promise(r=>setTimeout(r,150));el=find();if(el)break;}}el&&el.click();})()`);
await c.sleep(12000);
await c.eval(`(()=>{const pick=t=>[...document.querySelectorAll('div,span')].filter(e=>e.children.length<6&&(e.innerText||'').trim().startsWith(t)).sort((a,b)=>a.innerText.length-b.innerText.length)[0];const hide=e=>e&&e.style.setProperty('display','none','important');['VPN включён','VPN выключен','Переподключение'].forEach(t=>hide(pick(t)));const v=pick('v4.79');v&&hide(v.parentElement);})()`);
if (process.env.PRE) { await c.eval(process.env.PRE); await c.sleep(3500); }
const frames = [];
c.on(m => { if (m.method === "Page.screencastFrame") { frames.push({ t: m.params.metadata.timestamp, d: m.params.data }); c.send("Page.screencastFrameAck", { sessionId: m.params.sessionId }); } });
await c.send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 1600, maxHeight: 900, everyNthFrame: 1 });
if (jsAfter) { await c.sleep(+jsDelay); await c.eval(jsAfter); await c.sleep(Math.max(1000, +secs * 1000 - +jsDelay)); } else await c.sleep(+secs * 1000);
await c.send("Page.stopScreencast");
console.log("frames", frames.length);
if (frames.length < 5) { console.log("мало кадров"); process.exit(1); }
const t0 = frames[0].t, data = frames.map(f => ({ at: (f.t - t0) * 1000, d: f.d }));
const dur = data[data.length - 1].at + 200;
await c.goto("about:blank", 500);
const b64 = await c.eval(`(async()=>{
  const F=${JSON.stringify(data)}; const dur=${dur};
  const imgs=await Promise.all(F.map(f=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/jpeg;base64,'+f.d;})));
  const cv=document.createElement('canvas'); cv.width=1600; cv.height=900; const x=cv.getContext('2d');
  x.drawImage(imgs[0],0,0,1600,900);
  const st=cv.captureStream(30); const rec=new MediaRecorder(st,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2500000}); const chunks=[];
  rec.ondataavailable=e=>chunks.push(e.data); const done=new Promise(r=>rec.onstop=r); rec.start();
  const t0=performance.now(); let k=0;
  await new Promise(res=>{(function tick(){const t=performance.now()-t0; while(k+1<F.length&&F[k+1].at<=t)k++; x.drawImage(imgs[k],0,0,1600,900); if(t<dur) requestAnimationFrame(tick); else res();})();});
  rec.stop(); await done;
  const blob=new Blob(chunks,{type:'video/webm'}); const buf=new Uint8Array(await blob.arrayBuffer()); let s=''; for(let i=0;i<buf.length;i+=32768) s+=String.fromCharCode.apply(null,buf.subarray(i,i+32768)); return btoa(s);
})()`);
fs.writeFileSync(OUT + id + ".webm", Buffer.from(b64, "base64"));
fs.writeFileSync(OUT + id + "-poster.jpg", Buffer.from(frames[Math.floor(frames.length / 2)].d, "base64"));
console.log("saved", id + ".webm", (b64.length * 0.75 / 1048576).toFixed(1) + " MB");
c.close();
