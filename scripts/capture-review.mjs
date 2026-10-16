import {chromium} from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent((req.url||'/').split('?')[0]);
 const file=path.resolve(root,'.'+(u==='/'?'/index.html':u));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data)});
});
await new Promise(resolve=>server.listen(4184,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const out=path.join(root,'review');
fs.mkdirSync(out,{recursive:true});
const result=[];
try{
 for (const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4184/',{waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('img').evaluateAll(list=>list.forEach(i=>i.loading='eager'));
  await page.waitForTimeout(850);
  await page.evaluate(()=>window.scrollTo(0,0));
  const meta=await page.evaluate(()=>({
   viewport:innerWidth,
   pageWidth:document.documentElement.scrollWidth,
   height:document.documentElement.scrollHeight,
   priceBox:document.querySelector('.price__amount')?.getBoundingClientRect().toJSON(),
   imgs:[...document.images].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),
   anchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>({hash:a.getAttribute('href'),target:!!document.getElementById(a.getAttribute('href').slice(1))}))
  }));
  await page.screenshot({path:path.join(out,width===390?'hero-mobile-390.jpg':'hero-desktop-1440.jpg'),type:'jpeg',quality:87,animations:'disabled',timeout:25000});
  console.log('FIRST_FOLD_SAVED '+width);
  await page.screenshot({path:path.join(out,width===390?'mobile-390.jpg':'desktop-1440.jpg'),fullPage:true,type:'jpeg',quality:85,animations:'disabled',timeout:45000});
  console.log('FULL_SCREENSHOT_SAVED '+width);
  const links=await page.locator('a[href^="#"]:visible').count();
  const clickResults=[];
  for(let n=0;n<links;n++){
    const l=page.locator('a[href^="#"]:visible').nth(n);
    const hash=await l.getAttribute('href');
    await l.click({timeout:10000});
    clickResults.push({hash,clicked:new URL(page.url()).hash===hash});
  }
  const good=meta.pageWidth<=width+1&&meta.imgs.every(i=>i.ok)&&meta.anchors.every(x=>x.target)&&clickResults.every(x=>x.clicked)&&errors.length===0;
  result.push({width,passed:good,meta,clickResults,errors});
  console.log('QA_WIDTH '+JSON.stringify({width,passed:good,pageWidth:meta.pageWidth,height:meta.height,imageCount:meta.imgs.length,allImagesLoaded:meta.imgs.every(i=>i.ok),links:clickResults.length,errors}));
  await page.close();
 }
}finally{await browser.close();server.close()}
const good=result.every(x=>x.passed);
fs.writeFileSync(path.join(out,'review-fast-report.json'),JSON.stringify({pass:good,at:new Date().toISOString(),result},null,2));
console.log('OVERALL_'+(good?'PASS':'FAIL'));
if(!good)process.exitCode=1;