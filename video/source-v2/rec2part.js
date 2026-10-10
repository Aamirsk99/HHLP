const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [,,html,out,vo,fps,a,b2]=process.argv;const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.addInitScript(v=>{window.VO=v},JSON.parse(fs.readFileSync(vo)));
await p.goto('file://'+html);await p.waitForTimeout(1000);
for(let i=+a;i<=+b2;i++){await p.evaluate(t=>seek(t),i/fps);await p.screenshot({path:`${out}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
console.log('done',a,b2);await b.close();})();
