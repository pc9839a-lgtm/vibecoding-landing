/* Scroll motion for the Vibe Coding landing page.
   Based on Cruiseplay's varied section entrances; no changes to functional UI. */
(function(){
  'use strict';
  function setup(){
    if(!('IntersectionObserver' in window)||!window.matchMedia||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const groups=[
      {selector:'#idea-bridge .idea-bridge__question',motion:'rise'},
      {selector:'#idea-bridge .idea-bridge__inner p',motion:'rise'},
      {selector:'#idea-bridge .idea-bridge__inner h2',motion:'pop'},
      {selector:'#who-for .forwho__eyebrow,#who-for .forwho__heading h2',motion:'rise'},
      {selector:'#who-for .forwho__row',motion:'alternate'},
      {selector:'#how-it-works .connector__eyebrow,#how-it-works .connector__title,#how-it-works .connector__answer',motion:'rise'},
      {selector:'#how-it-works .connector__stage',motion:'zoom'},
      {selector:'#use-cases .usecases__eyebrow,#use-cases .usecases__head h2',motion:'rise'},
      {selector:'#use-cases .usecase',motion:'alternate'},
      {selector:'#use-cases .usecase__example',motion:'zoom'},
      {selector:'#try-demo .trydemo__eyebrow,#try-demo .trydemo__heading h2',motion:'rise'},
      {selector:'#try-demo .trydemo__formside,#try-demo .trydemo__resultside',motion:'alternate'},
      {selector:'#try-demo .trydemo__panel-head',motion:'soft'},
      {selector:'#calltag .calltag__intro .calltag__kicker,#calltag .calltag__intro h2,#calltag .calltag__intro-closer',motion:'rise'},
      {selector:'#calltag .calltag__alert .calltag__kicker,#calltag .calltag__alert h3',motion:'soft'},
      {selector:'#calltag .calltag__phone',motion:'zoom'},
      {selector:'#calltag .calltag__notification',motion:'pop'},
      {selector:'#calltag .calltag__offer .calltag__kicker,#calltag .calltag__offer h3',motion:'pop'},
      {selector:'#projects .projects__eyebrow,#projects .projects__title,#projects .projects__controls',motion:'rise'},
      {selector:'#projects .projects__slider',motion:'zoom'},
      {selector:'#instructor .mentor-intro__kicker,#instructor .mentor-intro__headline',motion:'rise'},
      {selector:'#instructor .mentor-intro__year',motion:'pop'},
      {selector:'#instructor .mentor-intro__work',motion:'rise'},
      {selector:'#course-guide .course-guide__eyebrow,#course-guide .course-guide__headline',motion:'rise'},
      {selector:'#course-guide .course-guide__step',motion:'alternate'},
      {selector:'#course-guide .course-guide__resources',motion:'rise'},
      {selector:'#adsense-proof .adsense-proof__eyebrow,#adsense-proof .adsense-proof__head h2',motion:'rise'},
      {selector:'#adsense-proof .adsense-proof__cost',motion:'alternate'},
      {selector:'#adsense-proof .adsense-proof__cost strong',motion:'pop'},
      {selector:'#adsense-proof .adsense-proof__approved',motion:'pop'},
      {selector:'#adsense-proof .adsense-proof__approved-mark',motion:'zoom'},
      {selector:'#adsense-proof .adsense-proof__site',motion:'rise'},
      {selector:'#curriculum .learning__eyebrow,#curriculum .learning__heading h2,#curriculum .learning__intro',motion:'rise'},
      {selector:'#curriculum .learning__chapter',motion:'alternate'},
      {selector:'#curriculum .learning__output',motion:'soft'},
      {selector:'#coaching .support__kicker,#coaching .support__lead',motion:'rise'},
      {selector:'#coaching .support__heading h2',motion:'pop'},
      {selector:'#coaching .support__work h3,#coaching .support__items,#coaching .support__resources',motion:'rise'},
      {selector:'#coaching .support__items span',motion:'pop'},
      {selector:'#pricing .tuition__preorder,#pricing #price-title,#pricing .tuition__old',motion:'rise'},
      {selector:'#pricing .tuition__price',motion:'pop'},
      {selector:'#pricing .tuition__payment,#pricing .tuition__contents',motion:'rise'}
    ];
    const targets=[];
    const seen=new Set();
    for(const group of groups){
      const elements=document.querySelectorAll(group.selector);
      elements.forEach((el,i)=>{
        if(seen.has(el))return;
        seen.add(el);
        const motion=group.motion==='alternate'?(i%2?'right':'left'):group.motion;
        el.classList.add('vm-item','vm-'+motion);
        el.style.setProperty('--vm-delay',String(Math.min(i,3)*95)+'ms');
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
