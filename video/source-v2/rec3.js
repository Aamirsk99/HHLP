const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [,,html,out,vo,fps]=process.argv;const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.addInitScript(v=>{window.VO=v},JSON.parse(fs.readFileSync(vo)));
await p.goto('file://'+html);await p.waitForTimeout(1000);const D=await p.evaluate(()=>DURATION);const N=Math.ceil(D*fps);
fs.writeFileSync(out+'/../timeline.json',JSON.stringify(await p.evaluate(()=>TIMELINE)));
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/fps);await p.screenshot({path:`${out}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
console.log('frames',N,D);await b.close();})();
