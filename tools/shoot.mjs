// Снимок одного экрана живого терминала с ожиданием загрузки данных.
// node shoot.mjs <id> "<пункт меню>" [--click "<текст кнопки>"] [--hide "<заголовок зоны>"]... [--wait сек]
import fs from "node:fs";
import { connect } from "./cdp.mjs";
const args = process.argv.slice(2);
const [id, label] = args;
const opt = (k) => { const r = []; args.forEach((a, i) => a === k && r.push(args[i + 1])); return r; };
const OUT = decodeURIComponent(new URL("../site/assets/shots/", import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
fs.mkdirSync(OUT, { recursive: true });
const c = await connect();
await c.viewport(1920, 1080);
const url = await c.eval("location.href").catch(() => "");
if (!url.startsWith("http://localhost:8000")) await c.goto("http://localhost:8000/", 5000);
const clean = `(()=>{
 const pick=t=>[...document.querySelectorAll('div,span')].filter(e=>e.children.length<6&&(e.innerText||'').trim().startsWith(t)).sort((a,b)=>a.innerText.length-b.innerText.length)[0];
 const hide=e=>{ if(e) e.style.setProperty('display','none','important'); };
 for (const t of ['VPN включён','VPN выключен','Переподключение','Перезапуск','Загрузка терминала']) hide(pick(t));
 const ver=pick('v4.79'); if(ver) hide(ver.parentElement);
 const re=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g; const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; while(n=w.nextNode()) if(re.test(n.nodeValue)) n.nodeValue=n.nodeValue.replace(re,'•••');
})()`;
const nav = async (l) => c.eval(`(async()=>{
  const items=()=>[...document.querySelectorAll('aside button, aside a')];
  const find=()=>items().find(e=>e.innerText.trim().replace(/\s+/g,' ').startsWith(${JSON.stringify(l)}));
  let el=find();
  if(!el){ for(const g of items().filter(b=>/^›/.test(b.innerText.trim()))){ g.click(); await new Promise(r=>setTimeout(r,150)); el=find(); if(el) break; } }
  if(!el) return false; el.click(); return true; })()`);
console.log("nav", label, await nav(label));
await c.sleep(2500);
for (const b of opt("--click")) { console.log("click", b, await c.eval(`(()=>{const e=[...document.querySelectorAll('button')].find(x=>x.innerText.trim().includes(${JSON.stringify(b)})); if(!e) return false; e.click(); return true;})()`)); await c.sleep(1500); }
// ждём, пока исчезнут «загружаю…» и баннер переподключения (до 90 с)
const maxWait = (+(opt("--wait")[0] || 45)) * 1000, t0 = Date.now();
while (Date.now() - t0 < maxWait) {
  const busy = await c.eval(`/загружаю|Переподключение|загрузка данных|идёт скан|сканирую/i.test(document.body.innerText)`);
  if (!busy && Date.now() - t0 > 8000) break;
  await c.sleep(2000);
}
await c.sleep(2500);
for (const h of opt("--hide")) await c.eval(`(()=>{const hs=[...document.querySelectorAll('div,span')].filter(e=>(e.innerText||'').trim().startsWith(${JSON.stringify(h)}));
  const t=hs.sort((a,b)=>a.innerText.length-b.innerText.length)[0]; if(!t) return; let p=t; for(let i=0;i<6&&p;i++){ if(p.className&&/rounded|border/.test(p.className.toString())&&p.offsetHeight>80){ p.style.setProperty('display','none','important'); return;} p=p.parentElement; } })()`);
for (const j of opt("--js")) { await c.eval(j); await c.sleep(4000); }
const sc = opt("--scroll")[0];
if (sc) await c.eval(`(()=>{const els=[...document.querySelectorAll('main *')].filter(e=>e.scrollHeight>e.clientHeight+100&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)); els.sort((a,b)=>b.clientWidth*b.clientHeight-a.clientWidth*a.clientHeight); const e=els[0]; if(e) e.scrollTop=${sc==="bottom"?"e.scrollHeight":+sc||0};})()`);
await c.eval(clean); await c.sleep(800);
await c.shot(OUT + id + ".png");
console.log("saved", id, Date.now() - t0, "ms");
c.close();
