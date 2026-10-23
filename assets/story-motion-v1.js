/* Scroll motion for the Vibe Coding landing page.
   Based on Cruiseplay's varied section entrances; no changes to functional UI. */
(function(){
  'use strict';
  function setup(){
    if(!('IntersectionObserver' in window)||!window.matchMedia||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const groups=[
      {selector:'#who-for .forwho__heading',motion:'rise'},
      {selector:'#who-for .forwho__row',motion:'rise'},
      {selector:'#how-it-works .connector__eyebrow,#how-it-works .connector__title,#how-it-works .connector__answer',motion:'rise'},
      {selector:'#how-it-works .connector__stage',motion:'zoom'},
      {selector:'#use-cases .usecases__head',motion:'rise'},
      {selector:'#use-cases .usecase',motion:'rise'},
      {selector:'#try-demo .trydemo__heading',motion:'rise'},
      {selector:'#try-demo .trydemo__workspace',motion:'rise'},
      {selector:'#calltag .calltag__intro h2,#calltag .calltag__lead',motion:'rise'},
      {selector:'#calltag .calltag__phone',motion:'zoom'},
      {selector:'#calltag .calltag__offer',motion:'rise'},
      {selector:'#projects .projects__heading',motion:'rise'},
      {selector:'#adsense-proof .adsense-proof__head',motion:'rise'},
      {selector:'#adsense-proof .adsense-proof__approved',motion:'rise'},
      {selector:'#curriculum .learning__heading',motion:'rise'},
      {selector:'#curriculum .learning__chapter',motion:'rise'},
      {selector:'#coaching .support__heading',motion:'rise'},
      {selector:'#coaching .support__work,#coaching .support__resources',motion:'rise'},
      {selector:'#pricing #price-title,#pricing .tuition__price',motion:'rise'}
    ];    const targets=[];
    const seen=new Set();
    for(const group of groups){
      const elements=document.querySelectorAll(group.selector);
      elements.forEach((el,i)=>{
        if(seen.has(el))return;
        seen.add(el);
        const motion=group.motion==='alternate'?(i%2?'right':'left'):group.motion;
        el.classList.add('vm-item','vm-'+motion);
        el.style.setProperty('--vm-delay',String(Math.min(i,2)*65)+'ms');
        targets.push(el);
      });
    }
    if(!targets.length)return;
    const viewport=window.innerHeight||document.documentElement.clientHeight;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        entry.target.classList.add('vm-in');
        observer.unobserve(entry.target);
      }
    },{threshold:.08,rootMargin:'0px 0px -7% 0px'});
    const onScreen=[];
    targets.forEach(el=>{
      const rect=el.getBoundingClientRect();
      if(rect.top<viewport*.92&&rect.bottom>0){
        onScreen.push(el);
      }else{
        observer.observe(el);
      }
    });
    document.documentElement.classList.add('vm-ready');
    // Allow the browser to paint the initial state; direct section links animate too.
    window.requestAnimationFrame(()=>{
      window.requestAnimationFrame(()=>onScreen.forEach(el=>el.classList.add('vm-in')));
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
