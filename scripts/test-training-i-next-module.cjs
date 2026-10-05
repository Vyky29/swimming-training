const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('common/shared/training-flow-guide.js','utf8');
const fn=source.slice(source.indexOf('  function resolveSectionStage('),source.indexOf('  function allBlocksComplete('));
for(const [passed,visible,number] of [[true,true,1],[false,true,1],[true,false,1],[true,true,5]]){
 const next={textContent:number===5?'Return to Training Portal':'Go to Next Module'};
 const quiz={classList:{contains:()=>false},querySelector:s=>s==='.quiz-next-btn'?next:{}};
 const progress={getSnapshot:()=>({quiz:{passed}})};
 const ctx={window:{location:{pathname:`/training-i/modules/module-${number}/`},TrainingIProgress:progress},TrainingIProgress:progress,
 $:()=>quiz,isModuleStarted:()=>true,isChecked:()=>true,insideModuleReviewed:()=>true,resolveKeyIdeasRecapSection:()=>null,resolveStartQuizStep:()=>null,
 isVisibleEl:()=>visible,sectionScrollStep:(kind,el,label)=>({kind,el,label})};
 vm.createContext(ctx);vm.runInContext(fn,ctx);const step=ctx.resolveSectionStage('quiz');
 assert.equal(step.kind,passed&&visible?'quiz-passed':'quiz');
 if(passed&&visible){assert.equal(step.el,next);assert.equal(step.label,next.textContent);}
}
console.log('ok passed quiz guides to the next module or portal; unfinished and review quizzes keep their quiz guide');
