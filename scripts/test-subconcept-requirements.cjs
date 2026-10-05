const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const n of [2,3]){
 const source=fs.readFileSync(`training-i/modules/module-${n}/index.html`,'utf8');
 const start=source.indexOf(' function updateConceptFinishState('), end=source.indexOf('\n document.addEventListener',start);
 const fn=source.slice(start,end);
 const finish={style:{}};
 const panel={dataset:{keyIdeasRequired:'true',keyIdeasDone:'true',insightPillarsRequired:'true',insightPillarsDone:'true',choiceComplete:'false'},querySelector:()=>finish,querySelectorAll:()=>[]};
 const ctx={conceptContent:{leaf:{requiresChoiceActivity:true}},isOverviewReturnSubconcept:()=>true,isInPracticeCompleteForPanel:()=>true,getNextActionLabel:()=> 'Done',Date};
 vm.createContext(ctx);vm.runInContext(fn,ctx);
 ctx.updateConceptFinishState(panel,'block2','leaf');assert.equal(finish.disabled,true,'leaf requires activity');
 panel.dataset.choiceComplete='true';panel.dataset.insightPillarsDone='false';ctx.updateConceptFinishState(panel,'block2','leaf');assert.equal(finish.disabled,true,'leaf requires intro cards');
 panel.dataset.insightPillarsDone='true';panel.dataset.keyIdeasDone='false';ctx.updateConceptFinishState(panel,'block2','leaf');assert.equal(finish.disabled,true,'leaf requires key ideas');
 panel.dataset.keyIdeasDone='true';ctx.updateConceptFinishState(panel,'block2','leaf');assert.equal(finish.disabled,false,'reviewed leaf can finish');
 console.log(`ok M${n} leaf requirements cannot be bypassed`);
}
