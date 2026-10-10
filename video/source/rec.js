const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,html,out,fps]=process.argv;const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+html);await p.waitForTimeout(1000);const D=await p.evaluate(()=>DURATION);const N=Math.ceil(D*fps);
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/fps);await p.screenshot({path:`${out}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
console.log('frames',N);await b.close();})();
