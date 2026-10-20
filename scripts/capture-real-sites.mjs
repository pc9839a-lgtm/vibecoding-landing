import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const root=process.cwd();
const out=path.join(root,'assets','cases');
fs.mkdirSync(out,{recursive:true});
const projects=[
 {key:'pagero',url:'https://pagero.kr/',selector:'body',label:'PageRo public landing page'},
 {key:'cruise-partner',url:'https://cruiseplay-dyt.pages.dev/partner/',selector:'body',label:'Cruise Partner homepage hero'},
 {key:'brand-awards',url:'https://awards.pagero.kr/',selector:'#contact',label:'Brand Awards public contact form'},
 {key:'peopleent',url:'https://peopleent.pagero.kr/',selector:'body',label:'PEOPLEENT public landing page'},
 {key:'awards-hero',url:'https://awards.pagero.kr/',selector:'body',label:'Brand Awards actual home hero'},
 {key:'calltag-hero',url:'https://calltag.pagero.kr/',selector:'body',label:'CallTag actual service home hero'}
];
const report=[];
try{
 for(const p of projects){
  for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:960},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(p.url,{waitUntil:'domcontentloaded',timeout:25000});
   if(!response||response.status()>=400)throw Error('HTTP '+response?.status());
   await page.locator('img').evaluateAll(list=>list.forEach(i=>i.loading='eager'));
   if(p.key==='brand-awards'){
     await page.locator('#mainForm select[name="program"]').selectOption({label:'상담 후 추천'});
     await page.waitForTimeout(350);
   }
   await page.waitForTimeout(1000);
   if(p.selector!=='body'){
     const el=page.locator(p.selector).first();
     await el.waitFor({state:'visible',timeout:15000});
     await el.scrollIntoViewIfNeeded();
     await page.evaluate(sel=>{
       const target=document.querySelector(sel);
       if(target)window.scrollTo(0,Math.max(0,target.getBoundingClientRect().top+scrollY-100));
     },p.selector);
   }else{await page.evaluate(()=>window.scrollTo(0,0))}
   await page.waitForTimeout(600);
   const imagePath=path.join(out,p.key+(width===390?'-mobile':'')+'.jpg');
   if(p.key==='brand-awards'&&width===390){
     await page.locator('#mainForm').first().screenshot({path:imagePath,type:'jpeg',quality:87,animations:'disabled',timeout:20000});
   }else{
     await page.screenshot({path:imagePath,type:'jpeg',quality:87,animations:'disabled',timeout:20000});
   }
   const meta=await page.evaluate(()=>({
     title:document.title,heading:document.querySelector('h1')?.innerText?.slice(0,100)||'',
     forms:document.querySelectorAll('form').length,scrollY:window.scrollY
   }));
   report.push({key:p.key,width,url:p.url,selector:p.selector,label:p.label,ok:true,meta,errors:errors.slice(0,3)});
   console.log('CAPTURED '+p.key+' '+meta.title);
  }catch(e){
    report.push({key:p.key,width,url:p.url,selector:p.selector,label:p.label,ok:false,error:String(e).slice(0,400)});
    console.log('CAPTURE_FAIL '+p.key+' '+String(e).slice(0,400));
  }finally{await page.close()}
 }
 }
}finally{await browser.close()}
fs.writeFileSync(path.join(out,'capture-report.json'),JSON.stringify(report,null,2));
const successes=report.filter(x=>x.ok);
if(successes.length<2)process.exitCode=1;
console.log('RESULT '+JSON.stringify({successes:successes.length,report}));
