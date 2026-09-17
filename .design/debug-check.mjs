import fs from 'node:fs';
export async function connect(port, match) {
 const tabs=await fetch(`http://localhost:${port}/json/list`).then(r=>r.json()); const target=tabs.find(match);if(!target)throw new Error('Target not found');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map();const events=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}else events.push(m)};
 return {events,close:()=>ws.close(),send:(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(new Error('CDP timeout: '+method))},20000);pending.set(n,m=>{clearTimeout(timer);resolve(m)});ws.send(JSON.stringify({id:n,method,params}))}),eval:async function(expression){const m=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(m.result?.exceptionDetails)throw new Error(JSON.stringify(m.result.exceptionDetails));return m.result?.result?.value;}};
}
const action=process.argv[2];if(action==='start'){
 const user=await connect(9777,t=>t.url.startsWith('http://localhost:5173/'));const session=await user.eval('JSON.stringify({access_token:localStorage.getItem("access_token"),serverAddress:localStorage.getItem("serverAddress")})');user.close();
 const page=await connect(9778,t=>t.type==='page');await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await page.send('Page.enable');
 await page.eval(`for(const [k,v] of Object.entries(${session}))if(v)localStorage.setItem(k,v);true`);
 await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.hostname==='localhost'){for(const [k,v] of Object.entries(${session}))if(v)localStorage.setItem(k,v)};window.__tvDiag=[];window.addEventListener('message',e=>{const m=e.data;if(m&&typeof m.type==='string')window.__tvDiag.push({type:m.type,field:m.payload?.fieldId,fields:Object.keys(m.payload?.fields||{}),points:m.payload?.history?.length})});`});
 await page.send('Page.navigate',{url:'http://localhost:5173/#/pages/devices/detail?device_id=d59ea842-b798-8994-4e41-f3c0db565cdf'});page.close();console.log('Started isolated browser check');
}else if(action==='inspect'){
 const targets=await fetch('http://localhost:9778/json/list').then(r=>r.json());for(const target of targets.filter(t=>t.type==='page'||t.type==='iframe')){
 const page=await connect(9778,t=>t.id===target.id);await page.send('Runtime.enable');console.log(target.type,await page.eval('JSON.stringify({text:document.body?.innerText.slice(0,1000),canvas:document.querySelectorAll("canvas").length,messages:window.__tvDiag?.slice(-15),resources:performance.getEntriesByType("resource").filter(x=>x.name.includes("widgets/")||x.name.includes("statistic")).map(x=>({url:x.name,status:x.responseStatus,ms:Math.round(x.duration)}))})'));
 console.log('Errors',page.events.filter(x=>x.method==='Runtime.exceptionThrown'||(x.method==='Runtime.consoleAPICalled'&&x.params.type==='error')).map(x=>x.params.exceptionDetails?.exception?.description||x.params.args.map(a=>a.value||a.description).join(' ')));
 if(target.type==='page'){const shot=await page.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('F:/coding/app/.design/device-detail/live-check.png',Buffer.from(shot.result.data,'base64'));}page.close();
}}
