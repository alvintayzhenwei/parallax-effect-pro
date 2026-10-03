(()=>{
 const reduce=document.querySelector('#reduce'),intensity=document.querySelector('#intensity'),view=document.querySelector('#view'),status=document.querySelector('#status');
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
 const scenes=[...document.querySelectorAll('.scene')];let frame=0,pointer={x:0,y:0};
 const reduced=()=>preference.matches||reduce.checked;
 function update(){frame=0;const off=reduced();document.body.dataset.reduced=String(off);const amount=Number(intensity.value);const mobile=innerWidth<700||document.body.dataset.view==='mobile';
  for(const scene of scenes){const box=scene.getBoundingClientRect();const visible=box.bottom>0&&box.top<innerHeight;const progress=Math.max(-1,Math.min(1,(innerHeight/2-box.top-box.height/2)/innerHeight));for(const layer of scene.querySelectorAll('.layer')){if(off||!visible||['video-scrub','three-dimensional'].includes(scene.dataset.effect)){layer.style.transform='none';continue;}
   const travel=Number(layer.dataset.travel)*amount*(mobile?0.5:1);const isPointer=scene.dataset.effect==='pointer-depth';const x=isPointer?(coarse.matches?0:pointer.x*travel*35):(layer.dataset.direction==='horizontal'?progress*travel*160:0);const y=isPointer?(coarse.matches?0:pointer.y*travel*35):(layer.dataset.direction==='vertical'?progress*travel*160:0);layer.style.transform=`translate(${x}px, ${y}px)`;
  }}
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 function controls(){document.body.dataset.view=view.value;reduce.disabled=preference.matches;if(preference.matches)reduce.checked=true;status.textContent=reduced()?'Reduced motion: static composition. Content remains available.':'Exploratory settings changed. Ask your agent to save and regenerate before approval.';schedule();}
 reduce.addEventListener('change',controls);intensity.addEventListener('input',controls);view.addEventListener('change',controls);preference.addEventListener('change',()=>{reduce.checked=preference.matches;controls();});coarse.addEventListener('change',schedule);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('pointermove',e=>{if(reduced()||coarse.matches)return;pointer={x:e.clientX/innerWidth*2-1,y:e.clientY/innerHeight*2-1};schedule();},{passive:true});
 const providerNote=document.querySelector('#provider-note');const notes={import:'Use reviewed local assets or keep placeholders. No generation runs from this preview.',runway:'Ask your agent to verify Runway MCP connection and available tools. Approve prompt, references, settings and credit use before generation.',higgsfield:'Manual route: ask your agent for tailored Higgsfield / Seedance prompts and current settings. Import reviewed outputs.',luma:'Manual route: ask your agent for Luma prompts and current settings. Import reviewed outputs.'};
 document.querySelector('#providers').addEventListener('change',e=>{providerNote.textContent=notes[e.target.value]??notes.import;});
 reduce.checked=preference.matches;reduce.disabled=preference.matches;document.body.dataset.view=view.value;update();
})();
