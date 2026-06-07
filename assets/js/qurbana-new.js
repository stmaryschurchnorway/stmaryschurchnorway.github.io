const IMG="/assets/img/";
const {phaseTitles,phaseNums,subNames,stages,hotspots,glossary,stageExtras,hymnInfo,quizzes,finalQuiz,mascot}=window.QDATA;
// ---- per-page config (so one engine can drive Qurbana, Mooron, Mamodisa) ----
const NS=(window.QDATA.ns||'qurbana');           // localStorage namespace
const SK=function(k){return NS+k;};              // namespaced storage key
const subPhase=(window.QDATA.subPhase!=null?window.QDATA.subPhase:-1); // which phase shows sub-part pills (-1 = none)

// helper to build sacred item





// Hotspots placed on stage illustrations → open the sacred-item modal.
// Keyed by stage title; x/y are % of the media box. item must match a sacred-item name.




let idx=+(localStorage.getItem(SK('Stage'))||0)||0;
let readMode='full';
let kidsMode=localStorage.getItem(SK('Kids'))==='1';
let visited=new Set();try{visited=new Set(JSON.parse(localStorage.getItem(SK('Visited'))||'[]'));}catch(e){}
function saveVisited(){try{localStorage.setItem(SK('Visited'),JSON.stringify([...visited]));}catch(e){}}
// track which stages a kid has fully READ (every sub-step opened) — gates the hunt + part quiz.
// session-only (NOT loaded from storage): every page load re-gates behind exploring the steps.
let readStages=new Set();
function saveReadStages(){try{localStorage.setItem(SK('ReadStages'),JSON.stringify([...readStages]));}catch(e){}}
// which part quizzes the kid has COMPLETED this session — gates the Final Challenge
let quizDoneParts=new Set();
function allPartQuizzesDone(){if(!quizzes)return true;for(var k in quizzes){if(!quizDoneParts.has(+k))return false;}return true;}
// once the kid taps any hotspot, they've learned it — the "Tap the dots" hint stops showing
let hotspotTapped=false;
function stageSteps(s){return (!s||s.flat)?[]:(s.subs||[]).filter(function(x){return x&&x.title;});}
function stageIsRead(s,i){return stageSteps(s).length?readStages.has(s.title):visited.has(i);}
function partFullyRead(part){for(let i=0;i<stages.length;i++){if(stages[i].p===part&&!stageIsRead(stages[i],i))return false;}return true;}
// mark the CURRENT stage read once all its sub-steps are open (or it has none); refresh the quiz if it just unlocked
function checkStageRead(){
  const st=stages[idx];if(!st)return;
  if(readStages.has(st.title))return;
  const steps=stageSteps(st);
  let read=false;
  if(!steps.length){read=true;}
  else{const items=snGuideItems();read=items.length>0&&items.every(function(el){return el.classList.contains('open');});}
  if(read){readStages.add(st.title);saveReadStages();if(typeof renderQuiz==='function')renderQuiz();if(typeof renderHunt==='function')renderHunt();}
}
function siblings(i){const p=stages[i].p,s=stages[i].s;return stages.map((st,j)=>({st,j})).filter(o=>o.st.p===p&&o.st.s===s).map(o=>o.j);}
function firstOfPhase(p){return stages.findIndex(s=>s.p===p);}
function firstOfSub(p,s){return stages.findIndex(st=>st.p===p&&st.s===s);}

// phase tabs
const tabsEl=document.getElementById('phaseTabs');
phaseTitles.forEach((_pt,p)=>{
  const card=document.createElement('div');card.className='phase-card';card.dataset.p=p;
  card.innerHTML='<div class="phase-card-num">'+phaseNums[p]+'</div><div class="phase-card-title">'+phaseTitles[p]+'</div>';
  if(p===subPhase && subNames && subNames.length){
    const sp=document.createElement('div');sp.className='phase-card-subparts';
    subNames.forEach((nm,s)=>{const pill=document.createElement('button');pill.className='subpart-pill';pill.dataset.s=s;pill.textContent=nm;
      pill.addEventListener('click',e=>{e.stopPropagation();go(firstOfSub(subPhase,s));});sp.appendChild(pill);});
    card.appendChild(sp);
  }
  card.addEventListener('click',()=>go(firstOfPhase(p)));tabsEl.appendChild(card);
});

// progress bar dividers at phase boundaries
const progressFill=document.getElementById('progressFill'),phaseProgress=document.getElementById('phaseProgress');
(function(){let cum=0;for(let p=0;p<phaseTitles.length-1;p++){cum+=stages.filter(s=>s.p===p).length;const d=document.createElement('div');d.className='phase-progress-div';d.style.left=(cum/stages.length*100)+'%';phaseProgress.appendChild(d);}})();

const media=document.getElementById('media'),subpartInd=document.getElementById('subpartInd'),
 counter=document.getElementById('counter'),title=document.getElementById('title'),
 mlSection=document.getElementById('mlSection'),mlText=document.getElementById('mlText'),trText=document.getElementById('trText'),
 desc=document.getElementById('desc'),panel=document.getElementById('panel'),dots=document.getElementById('dots');

// flat index of all sacred items (for modal nav), deduped by name
const allItems=[];
const seen=new Set();
stages.forEach(st=>(st.subs||[]).forEach(sub=>(sub.items||[]).forEach(it=>{if(it.img&&!seen.has(it.name)){seen.add(it.name);allItems.push(it);}})));

function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// Bible reference auto-linking → opens the verse on Bible.com
const bibleBooks={'Genesis':'GEN','Exodus':'EXO','Leviticus':'LEV','Numbers':'NUM','Deuteronomy':'DEU','Psalms':'PSA','Psalm':'PSA','Proverbs':'PRO','Isaiah':'ISA','St. Matthew':'MAT','Matthew':'MAT','St. Mark':'MRK','Mark':'MRK','St. Luke':'LUK','Luke':'LUK','St. John':'JHN','John':'JHN','Acts':'ACT','Romans':'ROM','1 Corinthians':'1CO','2 Corinthians':'2CO','Galatians':'GAL','Ephesians':'EPH','Philippians':'PHP','Colossians':'COL','Hebrews':'HEB','1 Peter':'1PE','2 Peter':'2PE','Revelation':'REV'};
function linkBibleRefs(text){
  let html=esc(text);
  const books=Object.keys(bibleBooks).sort((a,b)=>b.length-a.length).map(b=>b.replace(/\./g,'\\.')).join('|');
  const re=new RegExp('('+books+')\\s+(\\d+):(\\d+(?:[\u2013-]\\d+)?)','g');
  return html.replace(re,function(m,book,ch,v){
    const code=bibleBooks[book]; const vv=v.replace('\u2013','-');
    return '<a class="verse-link" href="https://www.bible.com/bible/1/'+code+'.'+ch+'.'+vv+'" target="_blank" rel="noopener">'+book+' '+ch+':'+v+'</a>';
  });
}

// ---- Kid-friendly glossary (tap any term for a quick definition) ----

const glossLC={};Object.keys(glossary).forEach(k=>glossLC[k.toLowerCase()]={term:k,def:glossary[k]});
function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function glossify(html){
  const termSrc=Object.keys(glossary).sort((a,b)=>b.length-a.length).map(escRe).join('|');
  const re=new RegExp('\\b('+termSrc+')\\b','gi');
  return html.replace(/(<[^>]+>)|([^<]+)/g,function(seg,tag,text){
    if(tag)return tag;
    return text.replace(re,function(w){return '<button class="gloss-term" data-term="'+w.toLowerCase()+'">'+w+'</button>';});
  });
}
const _origLinkBibleRefs=linkBibleRefs;
linkBibleRefs=function(t){return glossify(_origLinkBibleRefs(t));};

// ---- Simplified text + “Did you know?” per stage (data-driven) ----


// Hymn metadata: duration + lyrics for the demo player
function fmtTime(s){s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
let hymnTimers=[];
// real hymn <audio> elements, for mutual-exclusion + stop-on-navigate
let hymnAudios=[];
function stopHymnAudios(except){for(var i=0;i<hymnAudios.length;i++){var a=hymnAudios[i];if(a&&a!==except){try{a.pause();}catch(e){}}}}

function renderSubstages(st){
  hymnTimers.forEach(clearInterval);hymnTimers=[];
  stopHymnAudios();hymnAudios=[];
  panel.innerHTML='';
  if(!st.subs||!st.subs.length){panel.style.display='none';return;}
  panel.style.display='flex';
  const flat=!!st.flat;
  if(!flat){
    const lead=document.createElement('div');lead.className='substages-lead';
    lead.textContent='Explore this stage — '+st.subs.length+(st.subs.length>1?' steps':' step');
    panel.appendChild(lead);
  }
  st.subs.forEach((sub,i)=>{
    const el=document.createElement('div');el.className='substage-item'+(flat?' flat open':'');
    let head=null;
    if(!(flat&&!sub.title)){
      head=document.createElement('button');head.className='substage-header'+(flat?' flat':'');
      head.innerHTML='<span class="substage-titlewrap">'+(flat?'':'<span class="substage-step">'+(i+1)+'</span>')+'<h4 class="substage-title">'+esc(sub.title||'')+'</h4></span>'+(flat?'':'<span class="substage-toggle-arrow">▼</span>');
    }
    const content=document.createElement('div');content.className='substage-content';
    let h='';
    if(sub.significance) h+='<div class="substage-section"><span class="substage-section-title">Significance</span><p class="substage-text">'+linkBibleRefs(sub.significance)+'</p></div>';
    if(sub.ritual) h+='<div class="substage-section"><span class="substage-section-title">Ritual Gesture</span><p class="substage-text">'+linkBibleRefs(sub.ritual)+'</p></div>';
    if(sub.theology) h+='<div class="substage-section"><span class="substage-section-title">Theological Meaning</span><p class="substage-text">'+linkBibleRefs(sub.theology)+'</p></div>';
    if(sub.malayalam) h+='<div class="substage-section substage-malayalam"><span class="substage-section-title">Malayalam</span><span class="malayalam-word">'+esc(sub.malayalam)+'</span><span class="transliteration">'+esc(sub.translit||'')+'</span></div>';
    if(sub.items&&sub.items.length){
      h+='<div class="substage-section"><span class="substage-section-title">Sacred Items</span><div class="sacred-items-grid">';
      sub.items.forEach(item=>{
        var L=esc((item.name||'?').trim().charAt(0).toUpperCase());
        if(item.img) h+='<button class="sacred-item-link" data-item="'+esc(item.name)+'"><span class="thumb" data-letter="'+L+'"><img src="'+item.img+'" alt="" loading="lazy" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'ph\');"></span>'+esc(item.name)+'</button>';
        else h+='<span class="sacred-item-link noimg"><span class="thumb ph" data-letter="'+L+'"></span>'+esc(item.name)+'</span>';
      });
      h+='</div></div>';
    }
    if(sub.hymn){var _hp=(sub.hymn.name||'').split('—');var _hn=_hp[0].trim();var _hm=(_hp[1]||'').trim();
      var _hkey=_hn.replace(/\s*\(.*?\)\s*/g,' ').trim();var _hi=hymnInfo[_hn]||hymnInfo[_hkey]||{dur:150,lyrics:[]};
      var _ly=(_hi.lyrics||[]).map(function(l){return l.note?'<div class="lyric-note">'+esc(l.note)+'</div>':'<div class="lyric-line"><div class="ly-tr">'+esc(l.tr||'')+'</div><div class="ly-sub'+(l.ml?' ly-ml':'')+'">'+esc(l.ml||l.en||'')+'</div></div>';}).join('');
      var _au=sub.hymn.audio||'',_au2=sub.hymn.audio2||'',_al=sub.hymn.audio_label||'',_al2=sub.hymn.audio2_label||'';
      // dual-version toggle (e.g. Malayalam / Syriac) when a second recording exists
      var _vers=_au2?('<div class="hymn-versions" role="group" aria-label="Hymn versions">'+
          '<button type="button" class="hymn-ver active" data-src="'+esc(_au)+'">'+esc(_al||'Version 1')+'</button>'+
          '<button type="button" class="hymn-ver" data-src="'+esc(_au2)+'">'+esc(_al2||'Version 2')+'</button></div>'):'';
      h+='<div class="hymn-section'+(_au?' has-audio':' no-audio')+'" data-dur="'+_hi.dur+'" data-audio="'+esc(_au)+'"'+(_au2?(' data-audio2="'+esc(_au2)+'"'):'')+'>'+
        '<div class="hymn-top"><button class="hymn-play-btn" aria-label="Play hymn"'+(_au?'':' disabled')+'>▶</button>'+
        '<div class="hymn-info"><div class="hymn-label">♪ Hymn sung here</div>'+
        '<div class="hymn-name">'+esc(_hn)+'</div>'+
        (_hm?'<div class="hymn-ml ml">'+esc(_hm)+'</div>':'')+'</div>'+
        '<div class="hymn-wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div></div>'+
        '<div class="hymn-player"><span class="hymn-time hymn-cur">0:00</span><div class="hymn-track"><div class="hymn-prog"></div></div><span class="hymn-time hymn-dur">'+fmtTime(_hi.dur)+'</span></div>'+
        _vers+
        (_ly?'<button class="hymn-lyrics-toggle" aria-expanded="false">View full lyrics <span class="lt-caret">▾</span></button><div class="hymn-lyrics">'+_ly+'</div>':'')+
      '</div>';}
    if(sub.biblical) h+='<div class="substage-section"><span class="substage-section-title">Biblical Remembrance</span><p class="substage-text">'+linkBibleRefs(sub.biblical)+'</p></div>';
    if(sub.spiritual) h+='<div class="substage-section"><span class="substage-section-title">Spiritual Reflection</span><p class="substage-text">'+linkBibleRefs(sub.spiritual)+'</p></div>';
    content.innerHTML=h;
    if(head){if(!flat)head.addEventListener('click',()=>{el.classList.toggle('open');if(typeof checkStageRead==='function')checkStageRead();});el.appendChild(head);}
    el.appendChild(content);panel.appendChild(el);
  });
  // sacred item buttons → modal
  panel.querySelectorAll('.sacred-item-link[data-item]').forEach(b=>{
    b.addEventListener('click',()=>openModal(b.dataset.item));
  });
  // hymn player — plays the real recording; supports a Malayalam/Syriac version toggle.
  panel.querySelectorAll('.hymn-section').forEach(sec=>{
    const btn=sec.querySelector('.hymn-play-btn'),prog=sec.querySelector('.hymn-prog'),cur=sec.querySelector('.hymn-cur'),durEl=sec.querySelector('.hymn-dur'),track=sec.querySelector('.hymn-track');
    const lt=sec.querySelector('.hymn-lyrics-toggle');
    if(lt)lt.addEventListener('click',()=>{const open=sec.classList.toggle('lyrics-open');lt.setAttribute('aria-expanded',open);});
    let curSrc=sec.dataset.audio||'';
    if(!curSrc){return;}   // no recording → static (button disabled in markup)
    let audio=null;
    function reset(){if(prog)prog.style.width='0%';if(cur)cur.textContent='0:00';btn.textContent='▶';sec.classList.remove('playing');}
    function ensure(){
      if(audio)return audio;
      audio=new Audio(curSrc);hymnAudios.push(audio);
      audio.addEventListener('timeupdate',()=>{const d=audio.duration||+sec.dataset.dur||0;if(prog)prog.style.width=(d?(audio.currentTime/d*100):0)+'%';if(cur)cur.textContent=fmtTime(audio.currentTime);});
      audio.addEventListener('loadedmetadata',()=>{if(durEl&&isFinite(audio.duration))durEl.textContent=fmtTime(audio.duration);});
      audio.addEventListener('play',()=>{btn.textContent='❚❚';sec.classList.add('playing');});
      audio.addEventListener('pause',()=>{btn.textContent='▶';sec.classList.remove('playing');});
      audio.addEventListener('ended',()=>{reset();});
      return audio;
    }
    btn.addEventListener('click',()=>{const a=ensure();if(a.paused){stopHymnAudios(a);if(typeof stopStageAudio==='function')stopStageAudio();if('speechSynthesis'in window)speechSynthesis.cancel();a.play().catch(function(){});}else a.pause();});
    if(track)track.addEventListener('click',e=>{const a=ensure();const r=track.getBoundingClientRect();const d=a.duration||+sec.dataset.dur||0;if(d){a.currentTime=Math.max(0,Math.min(d,(e.clientX-r.left)/r.width*d));}});
    sec.querySelectorAll('.hymn-ver').forEach(vb=>vb.addEventListener('click',()=>{
      const ns=vb.dataset.src||'';if(ns===curSrc&&audio){return;}
      sec.querySelectorAll('.hymn-ver').forEach(x=>x.classList.remove('active'));vb.classList.add('active');
      const wasPlaying=audio&&!audio.paused;if(audio)audio.pause();curSrc=ns;audio=null;reset();
      if(wasPlaying){const a=ensure();stopHymnAudios(a);if(typeof stopStageAudio==='function')stopStageAudio();a.play().catch(function(){});}
    }));
  });
}

// ===== QUIZ (Kids mode, one per part, shown on the last stage of each part) =====

function lastStageOfPart(i){const p=stages[i].p;return i===stages.length-1||stages[i+1].p!==p;}
function shuffled(n){const a=[...Array(n).keys()];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// Generic quiz engine — drives any quiz into any container with its own state object.
// opts: {kicker, startTitle, startSub, finishLabel, accent}
function runQuiz(quiz, state, el, key, draw, opts){
  opts=opts||{};
  if(state.key!==key){state.key=key;state.started=false;state.qi=0;state.score=0;state.answered=false;state.order=null;}
  const kicker=opts.kicker||'Quick Quiz';
  // start screen
  if(!state.started){
    el.innerHTML='<div class="quiz-start"><div class="quiz-badge">'+(opts.accent||'★')+'</div><div class="qs-text"><div class="qst-title">'+esc(opts.startTitle||kicker)+'</div><div class="qst-sub">'+esc(quiz.intro)+'</div></div><button class="qs-go">Start →</button></div>';
    el.querySelector('.qs-go').onclick=()=>{state.started=true;state.qi=0;state.score=0;state.answered=false;draw();};
    return;
  }
  // result screen
  if(state.qi>=quiz.questions.length){
    const tot=quiz.questions.length,sc=state.score;
    const perfect=sc===tot;const emoji=perfect?'🌟':(sc>=Math.ceil(tot/2)?'🎉':'💛');
    const title=perfect?'Perfect!':(sc>=Math.ceil(tot/2)?'Well done!':'Nice try!');
    el.innerHTML='<div class="quiz-result"><div class="qr-emoji">'+emoji+'</div><div class="qr-title">'+title+'</div><div class="qr-score">You got <b>'+sc+'</b> of <b>'+tot+'</b> right.</div><button class="qr-retry">Try again</button></div>';
    el.querySelector('.qr-retry').onclick=()=>{state.started=false;draw();};
    return;
  }
  // question screen
  const qIdx=state.qi,Q=quiz.questions[qIdx];
  if(!state.order||state.order._for!==qIdx){state.order=shuffled(Q.opts.length);state.order._for=qIdx;}
  const order=state.order;
  let h='<div class="quiz-head"><div class="quiz-badge">'+(opts.accent||'★')+'</div><span class="quiz-kicker">'+esc(kicker)+'</span><span class="quiz-progress">'+(qIdx+1)+' / '+quiz.questions.length+'</span></div>';
  h+='<div class="quiz-q">'+esc(Q.q)+'</div><div class="quiz-opts">';
  order.forEach(oi=>{h+='<button class="quiz-opt" data-oi="'+oi+'"><span class="qo-mark"></span>'+esc(Q.opts[oi])+'</button>';});
  h+='</div><div class="quiz-feedback"></div><div class="quiz-foot"><button class="foot-btn primary quiz-next">'+(qIdx===quiz.questions.length-1?(opts.finishLabel||'See results'):'Next question')+' <span aria-hidden="true">→</span></button></div>';
  el.innerHTML=h;
  const fb=el.querySelector('.quiz-feedback'),nextBtn=el.querySelector('.quiz-next');
  el.querySelectorAll('.quiz-opt').forEach(btn=>{
    btn.onclick=()=>{
      if(state.answered)return;state.answered=true;
      const chosen=+btn.dataset.oi,correct=Q.a;
      el.querySelectorAll('.quiz-opt').forEach(b=>{
        b.disabled=true;const bi=+b.dataset.oi;
        if(bi===correct){b.classList.add('correct');b.querySelector('.qo-mark').textContent='✓';}
        else if(bi===chosen){b.classList.add('wrong');b.querySelector('.qo-mark').textContent='✕';}
      });
      const right=chosen===correct;if(right)state.score++;
      fb.className='quiz-feedback show'+(right?' qf-right':'');
      fb.innerHTML='<span class="qf-tag">'+(right?'Correct! ':'Good guess — ')+'</span>'+esc(Q.why);
      nextBtn.classList.add('show');
    };
  });
  nextBtn.onclick=()=>{state.qi++;state.answered=false;state.order=null;draw();};
}

// Per-part quiz (end of each part)
const quizState={key:null,started:false,qi:0,score:0,answered:false,order:null};
function renderQuiz(){
  const quizEl=document.getElementById('quiz');
  const part=stages[idx].p;
  if(!kidsMode||!quizzes[part]||!lastStageOfPart(idx)){quizEl.hidden=true;return;}
  quizEl.hidden=false;
  // gate: the quiz stays locked until every step of this part has been read
  if(!partFullyRead(part)){
    const inPart=[];stages.forEach(function(s,i){if(s.p===part)inPart.push({s:s,i:i});});
    let total,read,unit;
    if(inPart.length===1){const subs=stageSteps(inPart[0].s);total=subs.length||1;read=snGuideItems().filter(function(el){return el.classList.contains('open');}).length;unit='steps';}
    else{total=inPart.length;read=inPart.filter(function(o){return stageIsRead(o.s,o.i);}).length;unit='parts';}
    quizState.started=false;
    quizEl.innerHTML='<div class="quiz-start quiz-locked"><div class="quiz-badge">🔒</div>'+
      '<div class="qs-text"><div class="qst-title">Quick Quiz — '+esc(phaseNums[part])+'</div>'+
      '<div class="qst-sub">Read all the '+unit+' first to unlock the quiz! <b>'+read+' of '+total+'</b> done.</div></div>'+
      '<button class="qs-go qs-locked-go">Keep reading →</button></div>';
    const kb=quizEl.querySelector('.qs-locked-go');
    if(kb)kb.onclick=function(){
      // jump to the first unread stage of this part, or open the next closed step here
      for(let i=0;i<stages.length;i++){if(stages[i].p===part&&!stageIsRead(stages[i],i)&&i!==idx){go(i);return;}}
      const items=snGuideItems();for(let k=0;k<items.length;k++){if(!items[k].classList.contains('open')){snOpenStep(k);checkStageRead();renderQuiz();return;}}
    };
    return;
  }
  runQuiz(quizzes[part], quizState, quizEl, 'part'+part, renderQuiz,
    {kicker:'Quick Quiz — '+phaseNums[part], startTitle:'Quick Quiz — '+phaseNums[part]});
  // once the kid reaches this part quiz's result screen, mark it done (gates the Final Challenge)
  if(quizState.started&&quizState.qi>=quizzes[part].questions.length&&!quizDoneParts.has(part)){
    quizDoneParts.add(part);if(typeof renderFinalQuiz==='function')renderFinalQuiz();
  }
}
// Shlomo launches the part quiz directly (used by his "Take the Quiz" button)
function startPartQuiz(){
  const part=stages[idx].p;
  if(!kidsMode||!quizzes[part]||!lastStageOfPart(idx)||!partFullyRead(part))return;
  quizState.key='part'+part;quizState.started=true;quizState.qi=0;quizState.score=0;quizState.answered=false;quizState.order=null;
  renderQuiz();
  if(typeof buildSceneNote==='function')buildSceneNote();
  const q=document.getElementById('quiz');if(!q)return;
  requestAnimationFrame(function(){requestAnimationFrame(function(){snScrollToHeader(q);});});
}

// Final whole-journey quiz (very last stage)
const finalQuizState={key:null,started:false,qi:0,score:0,answered:false,order:null};
function renderFinalQuiz(){
  const el=document.getElementById('finalQuiz');
  if(!el)return;
  if(!kidsMode||!finalQuiz||idx!==stages.length-1||!allPartQuizzesDone()){el.hidden=true;return;}
  el.hidden=false;
  runQuiz(finalQuiz, finalQuizState, el, 'final', renderFinalQuiz,
    {kicker:'Final Challenge', startTitle:'🏆 Final Challenge', finishLabel:'See my score', accent:'🏆'});
}

// ===== TREASURE HUNT (seek-and-find, reuses hotspot coords) =====
const HUNT_KEY=SK('Treasures');
let treasures=new Set();try{treasures=new Set(JSON.parse(localStorage.getItem(HUNT_KEY)||'[]'));}catch(e){}
function saveTreasures(){try{localStorage.setItem(HUNT_KEY,JSON.stringify([...treasures]));}catch(e){}}
const huntState={active:false,stage:null};
function pick(a){return a&&a.length?a[Math.floor(Math.random()*a.length)]:'';}
function hkey(t,item){return t+'::'+item;}
function huntList(){const st=stages[idx];return (kidsMode&&st.img&&hotspots[st.title])||[];}
function currentTarget(title,list){return list.find(h=>!treasures.has(hkey(title,h.item)));}
function drawHuntOverlay(st,list){
  media.querySelectorAll('.hunt-prompt,.hunt-found-mark').forEach(n=>n.remove());
  list.forEach(h=>{if(treasures.has(hkey(st.title,h.item))){const m=document.createElement('div');m.className='hunt-found-mark';m.style.left=h.x+'%';m.style.top=h.y+'%';m.textContent='✓';media.appendChild(m);}});
  const t=currentTarget(st.title,list);
  const p=document.createElement('div');p.className='hunt-prompt';
  p.innerHTML=t?'🔍 Find the <b>'+esc(t.label)+'</b>':'🎉 You found them all!';
  media.appendChild(p);
}
function startHunt(st){huntState.active=true;huntState.stage=st.title;render();const t=currentTarget(st.title,huntList());if(t)showMascot('Find the '+t.label+'! Tap it in the picture. 🔍');}
function renderHunt(){
  const bar=document.getElementById('huntBar');const st=stages[idx];const list=huntList();
  // keep the hunt hidden until the kid has explored all the steps of this stage
  if(!list.length||!stageIsRead(st,idx)){bar.hidden=true;huntState.active=false;media.classList.remove('hunting');return;}
  bar.hidden=false;
  if(huntState.active&&huntState.stage!==st.title)huntState.active=false;
  const foundHere=list.filter(h=>treasures.has(hkey(st.title,h.item))).length;
  const allFound=foundHere===list.length;
  if(huntState.active){
    media.classList.add('hunting');drawHuntOverlay(st,list);
    const chips=list.map(h=>{const done=treasures.has(hkey(st.title,h.item));const cur=!done&&h===currentTarget(st.title,list);return '<span class="ht-chip'+(done?' done':(cur?' active':''))+'">'+(done?'✓ ':'')+esc(h.label)+'</span>';}).join('');
    bar.className='hunt-bar';
    bar.innerHTML='<div class="hb-icon">🔍</div><div class="hb-text"><div class="hb-title">Tap to find the treasures!</div><div class="hunt-targets">'+chips+'</div></div><button class="hb-btn ghost" id="huntStop">Stop</button>';
    document.getElementById('huntStop').onclick=()=>{huntState.active=false;media.classList.remove('hunting');render();};
  }else{
    media.classList.remove('hunting');
    if(allFound){
      bar.className='hunt-bar found';
      bar.innerHTML='<div class="hb-icon">⭐</div><div class="hb-text"><div class="hb-title">All treasures found here!</div><div class="hb-sub">You spotted all '+list.length+'. Sharp eyes!</div></div><button class="hb-btn ghost" id="huntReplay">Play again</button>';
      document.getElementById('huntReplay').onclick=()=>{list.forEach(h=>treasures.delete(hkey(st.title,h.item)));saveTreasures();startHunt(st);};
    }else{
      const remain=list.length-foundHere;
      bar.className='hunt-bar';
      bar.innerHTML='<div class="hb-icon">🔍</div><div class="hb-text"><div class="hb-title">Treasure Hunt</div><div class="hb-sub">'+remain+' sacred treasure'+(remain>1?'s':'')+' hidden in this picture — can you find '+(remain>1?'them all':'it')+'?</div></div><button class="hb-btn" id="huntStart">Start hunt</button>';
      document.getElementById('huntStart').onclick=()=>startHunt(st);
    }
  }
}
media.addEventListener('click',e=>{
  if(!huntState.active)return;
  const rect=media.getBoundingClientRect();const px=e.clientX-rect.left,py=e.clientY-rect.top;
  const st=stages[idx],list=huntList();const t=currentTarget(st.title,list);if(!t)return;
  let nearest=null,nd=1e9;
  list.forEach(h=>{const hx=h.x/100*rect.width,hy=h.y/100*rect.height;const d=Math.hypot(px-hx,py-hy);if(d<nd){nd=d;nearest=h;}});
  if(nearest===t&&nd<0.15*rect.width){
    treasures.add(hkey(st.title,t.item));saveTreasures();
    showMascot(pick(mascot.huntPraise));
    const stillLeft=list.some(h=>!treasures.has(hkey(st.title,h.item)));
    if(!stillLeft)huntState.active=false;
    render();
    if(!stillLeft)setTimeout(()=>showMascot(mascot.huntDone),800);
  }else{
    const r=document.createElement('div');r.className='hunt-ripple';r.style.left=px+'px';r.style.top=py+'px';media.appendChild(r);setTimeout(()=>r.remove(),500);
    showMascot(pick(mascot.huntMiss));
  }
});

// ===== SHLOMO THE DOVE (mascot guide) =====
const mascotEl=document.getElementById('mascot'),mascotBubble=document.getElementById('mascotBubble'),
 mascotText=document.getElementById('mascotText'),mascotPing=document.getElementById('mascotPing'),
 mascotMore=document.getElementById('mascotMore');
let mascotStage=-1, mascotOpen=false, mascotGreeted=false;
function currentDyk(){const ext=stageExtras[stages[idx].title]||{};return ext.dyk;}
function revealDyk(){const d=currentDyk();if(!d)return;mascotText.innerHTML='<span class="mb-dyk-q">💡 '+esc(d.q)+'</span>'+esc(d.a);mascotMore.hidden=true;}
function showMascot(text,opts){opts=opts||{};if(!mascot||!text)return;mascotText.textContent=text;mascotBubble.hidden=false;mascotOpen=true;mascotBubble.style.animation='none';void mascotBubble.offsetWidth;mascotBubble.style.animation='';mascotPing.classList.remove('show');
  const d=currentDyk();
  if(opts.more&&kidsMode&&d){mascotMore.hidden=false;mascotMore.textContent='💡 Did you know?';mascotMore.onclick=revealDyk;}
  else{mascotMore.hidden=true;}
}
function hideMascotBubble(){mascotBubble.hidden=true;mascotOpen=false;mascotPing.classList.add('show');}
function stageLine(){return (mascot&&mascot.lines&&mascot.lines[stages[idx].title])||(mascot&&mascot.greeting)||'';}
function mascotTap(){
  if(!mascotBubble.hidden){hideMascotBubble();return;}
  if(!mascotGreeted){mascotGreeted=true;showMascot(mascot.greeting,{more:true});}
  else showMascot(stageLine(),{more:true});
}
function updateMascot(){
  if(!mascot||!kidsMode){mascotEl.hidden=true;return;}
  mascotEl.hidden=false;
  if(mascotStage!==idx){
    mascotStage=idx;
    // Don't auto-pop on load / navigation. If the kid already opened Shlomo, refresh his tip;
    // otherwise leave him closed with a gentle ping inviting a tap.
    if(mascotOpen)showMascot(stageLine(),{more:true});
    else{mascotBubble.hidden=true;mascotPing.classList.add('show');}
  }
}
if(mascot){
  document.getElementById('mascotName').textContent=mascot.name||'Guide';
  document.getElementById('mascotClose').onclick=hideMascotBubble;
  document.getElementById('mascotDove').onclick=mascotTap;
}

// ===== READING-VIEW HEADER (liturgy name + which part / how many) =====
const readingHeader=document.getElementById('readingHeader');
const sceneNote=document.getElementById('sceneNote');
const LITURGY_NAME=((document.querySelector('.section-statement')||{}).textContent||window.QDATA.title||'Holy Qurbana').trim();
function buildReadingHeader(){
  if(!readingHeader)return;
  const st=stages[idx], cur=st.p, total=phaseTitles.length;
  let steps='';
  phaseTitles.forEach((pt,p)=>{
    const cls=p===cur?'active':(p<cur?'done':'');
    steps+='<button class="rh-step '+cls+'" data-p="'+p+'" title="'+esc(phaseNums[p]+' — '+pt)+'"><span class="rh-step-n">'+(p+1)+'</span><span class="rh-step-t">'+esc(pt)+'</span></button>';
  });
  let bars='';
  phaseTitles.forEach((pt,p)=>{bars+='<span class="'+(p===cur?'active':(p<cur?'done':''))+'"></span>';});
  // dropdown menu listing every part — used by the compact (mobile/tight) indicator
  let menu='';
  phaseTitles.forEach((pt,p)=>{
    const cls=p===cur?'active':(p<cur?'done':'');
    menu+='<button class="rh-menu-item '+cls+'" data-p="'+p+'"><span class="rh-mi-n">'+(p+1)+'</span><span class="rh-mi-t">'+esc(pt)+'</span></button>';
  });
  // sub-part (Pre-anaphora / Anaphora) is already shown as the stage kicker — no separate row needed
  let subrow='';
  readingHeader.innerHTML=
    '<div class="rh-main">'+
      '<button class="rh-close" id="rhClose" aria-label="Exit reading view" title="Close reading view">✕</button>'+
      '<div class="rh-brand"><span class="rh-kicker">Liturgy</span><span class="rh-name">'+esc(LITURGY_NAME)+'</span></div>'+
      '<button class="kids-switch rh-kids" role="switch" aria-checked="'+(kidsMode?'true':'false')+'" aria-label="Kids mode" title="Kids mode"><span class="ks-label">Kids mode</span><span class="ks-track"><span class="ks-knob"></span></span></button>'+
      '<div class="rh-steps" role="tablist" aria-label="Parts of the liturgy">'+steps+'</div>'+
      '<div class="rh-compact"><button class="rh-c-label" id="rhCompactBtn" aria-haspopup="true" aria-expanded="false">Part <b>'+(cur+1)+'</b> of '+total+'<span class="rh-c-phase"> · '+esc(phaseTitles[cur])+'</span><span class="rh-c-caret">▾</span></button><div class="rh-c-bars">'+bars+'</div><div class="rh-menu" id="rhMenu" hidden>'+menu+'</div></div>'+
    '</div>'+subrow+
    '<div class="rh-progress"><span style="width:'+(((idx+1)/stages.length)*100).toFixed(2)+'%"></span></div>';
  document.getElementById('rhClose').onclick=exitReading;
  readingHeader.querySelector('.rh-kids').onclick=toggleKids;
  readingHeader.querySelectorAll('.rh-step').forEach(b=>b.onclick=()=>go(firstOfPhase(+b.dataset.p)));
  readingHeader.querySelectorAll('.rh-subrow .subpart-pill').forEach(b=>b.onclick=()=>go(firstOfSub(subPhase,+b.dataset.s)));
  // compact part menu (mobile / tight widths)
  const cBtn=document.getElementById('rhCompactBtn'), cMenu=document.getElementById('rhMenu');
  if(cBtn&&cMenu){
    cBtn.onclick=(e)=>{e.stopPropagation();const open=cMenu.hidden;cMenu.hidden=!open;cBtn.setAttribute('aria-expanded',open?'true':'false');};
    cMenu.querySelectorAll('.rh-menu-item').forEach(b=>b.onclick=()=>{cMenu.hidden=true;go(firstOfPhase(+b.dataset.p));});
  }
  if(typeof syncRhOffset==='function')requestAnimationFrame(syncRhOffset);
}

// Shlomo's scene explainer — sits under the image, explains what's happening
let snGuide={stage:-1,step:0};
function snGuideItems(){return [...panel.querySelectorAll('.substage-item')].filter(el=>el.querySelector('.substage-header'));}
function snOpenStep(n){
  const items=snGuideItems();const it=items[n];if(!it)return;
  it.classList.add('open');
  checkStageRead();
  // wait for the expand + any quiz/hunt insertion to settle, then scroll the heading
  // to just BELOW the sticky stage-title header(s) so it never hides underneath them.
  requestAnimationFrame(function(){requestAnimationFrame(function(){snScrollToHeader(it);});});
}
// nearest scrollable ancestor of an element (the real reading-view scroller)
function snScroller(el){
  let n=el?el.parentElement:null;
  while(n&&n!==document.body){
    const cs=getComputedStyle(n);
    if(/(auto|scroll)/.test(cs.overflowY)&&n.scrollHeight>n.clientHeight+4)return n;
    n=n.parentElement;
  }
  return document.scrollingElement||document.documentElement;
}
// total height of sticky headers currently pinned at the top of the scroller
function snStickyInset(scroller){
  const card=document.querySelector('.carousel-card.reading');if(!card)return 0;
  let inset=0;
  card.querySelectorAll('.reading-header,.controls-header').forEach(function(el){
    if(getComputedStyle(el).position==='sticky'&&scroller.contains(el))inset+=el.getBoundingClientRect().height;
  });
  return inset;
}
function snScrollToHeader(item){
  const head=item.querySelector('.substage-header')||item;
  const scroller=snScroller(head);
  const inset=snStickyInset(scroller)+12;
  const hr=head.getBoundingClientRect();
  const isWin=scroller===document.scrollingElement||scroller===document.documentElement;
  const cur=isWin?(window.scrollY||document.documentElement.scrollTop):scroller.scrollTop;
  const target=Math.max(0,cur+(hr.top-(isWin?0:scroller.getBoundingClientRect().top))-inset);
  snAnimateScroll(scroller,isWin,cur,target);
}
// lightweight JS smooth-scroll (CSS scroll-behavior is unreliable for programmatic scroll here)
let snScrollRAF=null;
function snAnimateScroll(scroller,isWin,from,to){
  if(snScrollRAF)cancelAnimationFrame(snScrollRAF);
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const set=function(v){if(isWin)window.scrollTo(0,v);else scroller.scrollTop=v;};
  if(reduce||Math.abs(to-from)<2){set(to);return;}
  const dur=Math.min(420,160+Math.abs(to-from)*0.35),t0=performance.now();
  const ease=function(x){return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2;};
  (function step(now){
    const p=Math.min(1,(now-t0)/dur);
    set(from+(to-from)*ease(p));
    if(p<1)snScrollRAF=requestAnimationFrame(step);else snScrollRAF=null;
  })(t0);
}
// Shlomo's forward-action helpers — shared by the guided branch AND flat/simple stages
function snHuntInfo(st){const hl=huntList();const found=hl.filter(function(h){return treasures.has(hkey(st.title,h.item));}).length;return {hl:hl,found:found,huntDone:(!hl.length||found>=hl.length)};}
function snDoneLine(st,N){
  const fi=snHuntInfo(st),hl=fi.hl,found=fi.found,huntDone=fi.huntDone;
  const quizReady=quizzes&&quizzes[st.p]&&lastStageOfPart(idx)&&partFullyRead(st.p);
  const quizGoing=quizReady&&quizState.started&&quizState.key==='part'+st.p;
  const hasNext=idx<stages.length-1;
  if(huntState.active&&!huntDone){const t=currentTarget(st.title,hl);return t?("Now find the "+t.label+" — tap it in the picture above! 🔍"):"Keep looking in the picture above! 🔍";}
  if(hl.length&&!huntDone)return N?("You read all "+N+" steps! 🎉 Time to hunt for hidden treasures!"):"Now let's hunt for hidden treasures! 🔍";
  if(quizGoing)return "Answer the questions on the side — you've got this! 💪";
  if(quizReady)return hl.length?("You found all "+hl.length+" treasures! 🌟 Now let's see what you remember!"):"All done here! 🎉 Ready for the Quick Quiz?";
  if(hasNext)return pick(["Nice work! 🎉 Ready for the next part?","Great reading! Let's keep going. ✨","You did it! On to the next part 👉"]);
  return "You reached the very end — well done! 🎉 You explored the whole "+(window.QDATA.title||'journey')+"!";
}
function snDoneTail(st,N){
  const fi=snHuntInfo(st),hl=fi.hl,found=fi.found,huntDone=fi.huntDone;
  const quizReady=quizzes&&quizzes[st.p]&&lastStageOfPart(idx)&&partFullyRead(st.p);
  const quizStarted=quizReady&&quizState.started&&quizState.key==='part'+st.p;
  const hasNext=idx<stages.length-1;
  let a=N?('<div class="sn-progress-done">✓ All '+N+' steps explored</div>'):'';
  if(hl.length&&!huntDone){
    a+= huntState.active ? '<div class="sn-hunt-progress">Found <b>'+found+'</b> of <b>'+hl.length+'</b> — find the rest in the picture above! ☝️</div>'
                         : '<button class="sn-hunt" type="button">🔍 Start the Treasure Hunt</button>';
  }else{
    if(hl.length)a+='<div class="sn-hunt-progress">🎉 Every treasure found!</div>';
    if(quizReady)a+= quizStarted ? '<div class="sn-hunt-progress">📝 Quiz started — answer the questions! →</div>'
                                 : '<button class="sn-quiz" type="button">⭐ Take the Quick Quiz</button>';
    else if(hasNext)a+='<button class="sn-nextstage" type="button"><span class="nx-go">Next ▸</span><span class="nx-t">'+esc(stages[idx+1].title)+'</span></button>';
    else a+='<div class="sn-hunt-progress">🎉 You finished the whole '+esc(window.QDATA.title||'journey')+'!</div>';
  }
  return a;
}
function buildSceneNote(){
  if(!sceneNote)return;
  const st=stages[idx];
  const ext=stageExtras[st.title]||{};
  const line=(mascot&&mascot.lines&&mascot.lines[st.title])||ext.simple||st.desc||'';
  const dyk=ext.dyk;
  const guide=(mascot&&mascot.name)||'Guide';
  const starPos=[[12,18,2.4,0],[29,40,1.8,.7],[46,12,3,1.3],[60,48,1.8,2],[74,22,2.6,.5],[86,38,1.8,1.6],[20,60,1.8,2.3],[52,30,2,1]];
  const stars=starPos.map(function(p){return '<span class="sn-star" style="left:'+p[0]+'%;top:'+p[1]+'%;width:'+p[2]+'px;height:'+p[2]+'px;animation-delay:'+p[3]+'s"></span>';}).join('');
  const dove='<div class="sn-dove-wrap"><span class="sn-halo"></span>'+
    '<span class="sn-dove" role="img" tabindex="0" aria-label="'+esc(guide)+' the dove — tap me!">🕊️</span></div>';
  let introSeen=true; try{introSeen=localStorage.getItem(SK('ShlomoIntro'))==='1';}catch(e){}
  let h;
  if(kidsMode&&!introSeen){
    h=stars+'<div class="sn-body"><div class="sn-convo">'+dove+
        '<div class="sn-bubble"><span class="sn-name">'+esc(guide)+'</span>'+
          '<p class="sn-line">'+esc((mascot&&mascot.greeting)||("Hi! I'm "+guide+" the dove. 🕊️ Let me show you around!"))+'</p>'+
          '<div class="sn-steps">'+
            '<div class="sn-step"><span class="sn-step-n">1</span><span><b>Read the story</b> next to the picture 📖</span></div>'+
            '<div class="sn-step"><span class="sn-step-n">2</span><span>Tap the glowing dots to explore ✨</span></div>'+
            '<div class="sn-step"><span class="sn-step-n">3</span><span>Play the <b>Treasure Hunt</b> 🔍</span></div>'+
            '<div class="sn-step"><span class="sn-step-n">4</span><span>Finish with a <b>Quick Quiz</b> ⭐</span></div>'+
          '</div>'+
          '<button class="sn-go" type="button">Let\'s explore!</button>'+
        '</div></div></div>';
  }else{
    const guideSubs=(!st.flat&&st.subs)?st.subs.filter(function(s){return s&&s.title;}):[];
    if(kidsMode&&guideSubs.length){
      // GUIDED WALK-THROUGH — Shlomo opens one step at a time as the kid taps
      if(snGuide.stage!==idx){snGuide.stage=idx;snGuide.step=0;}
      const N=guideSubs.length;
      const done=snGuide.step>=N;
      let bubbleLine;
      if(snGuide.step===0){bubbleLine=line||"Let's explore this part together — one step at a time!";}
      else if(!done){bubbleLine=pick(["Great reading! 👏 Here's the next one:","Nice work! Let's keep going. 🌟","You're doing wonderfully! Next step:","Onward, little explorer! 👇"]);}
      else{bubbleLine=snDoneLine(st,N);}
      h=stars+'<div class="sn-body"><div class="sn-convo">'+dove+
          '<div class="sn-bubble"><span class="sn-name">'+esc(guide)+' says</span>'+
            '<p class="sn-line">'+esc(bubbleLine)+'</p>';
      if(!done){
        h+='<button class="sn-next" type="button"><span class="sn-next-k">Step '+(snGuide.step+1)+' of '+N+'</span>'+
             '<span class="sn-next-t">'+esc(guideSubs[snGuide.step].title)+'</span>'+
             '<span class="sn-next-go">Read it ▸</span></button>';
      }else{
        h+=snDoneTail(st,N);
      }
      h+='</div></div>';
      if(done&&dyk&&dyk.q){
        h+='<button class="sn-dyk-toggle" type="button">Did you know?</button>'+
           '<div class="sn-dyk"><span class="sn-q">'+esc(dyk.q)+'</span><p class="sn-a">'+linkBibleRefs(dyk.a||'')+'</p></div>';
      }
      h+='</div>';
    }else{
      // FLAT / no-guided-steps stage. Keep the stage's own teaching tip, but in kids mode
      // Shlomo still drives forward (hunt → quiz → next) and coaches during hunt/quiz.
      let simpleLine=line;
      if(kidsMode){
        const fi=snHuntInfo(st);
        const quizGoing=quizzes&&quizzes[st.p]&&lastStageOfPart(idx)&&partFullyRead(st.p)&&quizState.started&&quizState.key==='part'+st.p;
        if(huntState.active&&!fi.huntDone){const t=currentTarget(st.title,fi.hl);simpleLine=t?("Now find the "+t.label+" — tap it in the picture above! 🔍"):"Keep looking in the picture above! 🔍";}
        else if(quizGoing){simpleLine="Answer the questions on the side — you've got this! 💪";}
      }
      const tail=kidsMode?snDoneTail(st,0):'';
      h=stars+'<div class="sn-body"><div class="sn-convo">'+dove+
          '<div class="sn-bubble"><span class="sn-name">'+esc(guide)+' says</span>'+
            '<p class="sn-line">'+esc(simpleLine)+'</p>'+tail+'</div></div>';
      if(dyk&&dyk.q){
        h+='<button class="sn-dyk-toggle" type="button">Did you know?</button>'+
           '<div class="sn-dyk"><span class="sn-q">'+esc(dyk.q)+'</span><p class="sn-a">'+linkBibleRefs(dyk.a||'')+'</p></div>';
      }
      h+='</div>';
    }
  }
  sceneNote.className='media-note';
  sceneNote.innerHTML=h;
  const nx=sceneNote.querySelector('.sn-next');
  if(nx)nx.onclick=function(){snOpenStep(snGuide.step);snGuide.step++;buildSceneNote();};
  const hb=sceneNote.querySelector('.sn-hunt');
  if(hb)hb.onclick=function(){startHunt(st);};
  const qz=sceneNote.querySelector('.sn-quiz');
  if(qz)qz.onclick=function(){startPartQuiz();};
  const nxs=sceneNote.querySelector('.sn-nextstage');
  if(nxs)nxs.onclick=function(){go(idx+1);};
  const tg=sceneNote.querySelector('.sn-dyk-toggle');
  if(tg)tg.onclick=()=>sceneNote.classList.add('dyk-open');
  const goBtn=sceneNote.querySelector('.sn-go');
  if(goBtn)goBtn.onclick=function(){try{localStorage.setItem(SK('ShlomoIntro'),'1');}catch(e){}buildSceneNote();};
  const dv=sceneNote.querySelector('.sn-dove');
  if(dv){
    const cheer=function(){dv.classList.add('cheer');};
    dv.addEventListener('click',cheer);
    dv.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();cheer();}});
    dv.addEventListener('animationend',function(e){if(e.animationName==='snCheer')dv.classList.remove('cheer');});
  }
}

function render(){
 const st=stages[idx];
 visited.add(idx);saveVisited();
 let m;
 if(st.video){
   m='<div class="media-video"><iframe src="https://www.youtube-nocookie.com/embed/'+esc(st.video)+'?rel=0&modestbranding=1" title="'+esc(st.title)+'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div>';
 } else {
   m = st.img ? '<div class="media-bg" style="background-image:url(\''+IMG+st.img+'\')"></div><img src="'+IMG+st.img+'" alt="'+esc(st.title)+'">' : '<div class="media-ph"><span>illustration to come</span></div>';
 }
 if(st.img||st.video) m+='<button class="fs-btn" aria-label="Open reading view" title="Reading view">⤢</button>';
 const hs = (kidsMode && st.img && hotspots[st.title]) || [];
 hs.forEach((h,i)=>{m+='<button class="hotspot" data-item="'+esc(h.item)+'" style="left:'+h.x+'%;top:'+h.y+'%" aria-label="Explore: '+esc(h.label)+'"></button>';});
 if(hs.length&&!hotspotTapped) m+='<div class="hotspot-hint"><span class="hh-dot"></span>Tap the dots to explore</div>';
 media.innerHTML=m;
 media.classList.toggle('has-hotspots',hs.length>0);
 media.classList.toggle('has-video',!!st.video);
 media.querySelectorAll('.hotspot').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();if(!hotspotTapped){hotspotTapped=true;const hint=media.querySelector('.hotspot-hint');if(hint)hint.remove();}openModal(b.dataset.item);}));
 subpartInd.textContent = st.s!==null ? subNames[st.s] : ''; subpartInd.style.display = st.s!==null?'':'none';
 const sibs=siblings(idx);
 counter.textContent='STAGE '+(sibs.indexOf(idx)+1)+' OF '+sibs.length;
 title.textContent=st.title; title.className='stage-title'+(st.pivot?' pivot':'');
 if(st.ml||st.tr){mlSection.style.display='flex';mlText.textContent=st.ml;trText.textContent=st.tr;} else mlSection.style.display='none';
 const ext=stageExtras[st.title]||{};
 desc.innerHTML=linkBibleRefs(kidsMode&&ext.simple?ext.simple:st.desc);
 // "Did you know?" now lives inside Shlomo (mascot) to reduce on-page clutter
 document.getElementById('dyk').hidden=true;
 renderSubstages(st);
 document.getElementById('simpleHint').hidden=true;
 dots.innerHTML='';
 sibs.forEach(j=>{const d=document.createElement('button');let cls='dot';if(j===idx)cls+=' active';else if(kidsMode&&visited.has(j))cls+=' seen';d.className=cls;d.title=stages[j].title;d.addEventListener('click',()=>go(j));dots.appendChild(d);});
 document.querySelectorAll('.phase-card').forEach(c=>{const p=+c.dataset.p;c.classList.toggle('active',p===st.p);
   c.querySelectorAll('.subpart-pill').forEach(pl=>pl.classList.toggle('active',p===st.p&&+pl.dataset.s===st.s));});
 prev.disabled=prevF.disabled=idx===0; next.disabled=nextF.disabled=idx===stages.length-1;
 // overall progress
 const pct=(idx+1)/stages.length*100;
 progressFill.style.width=pct+'%';
 if(kidsMode){
   const _exp=visited.size;
   document.getElementById('overallPos').innerHTML='<b>'+(idx+1)+'</b> of '+stages.length+'  ·  <b>'+_exp+'</b> explored';
   const doneDismissed=localStorage.getItem(SK('DoneDismissed'))==='1';
   document.getElementById('doneBanner').hidden=!(_exp>=stages.length && idx===stages.length-1 && !doneDismissed);
 }else{
   document.getElementById('overallPos').innerHTML='<b>'+(idx+1)+'</b> of '+stages.length+' in the full '+(window.QDATA.title||'Qurbana');
   document.getElementById('doneBanner').hidden=true;
 }
 phaseProgress.setAttribute('aria-valuenow',idx+1);
 phaseProgress.setAttribute('aria-valuemax',stages.length);
 checkStageRead();
 renderQuiz();
 renderFinalQuiz();
 renderHunt();
 updateMascot();
 buildReadingHeader();
 buildSceneNote();
}
let _animTimer=null;
function playStageAnim(dir){
  if(!dir)return;
  const c=readingCard;
  c.classList.remove('anim-next','anim-prev');
  void c.offsetWidth;                 // force reflow so the animation replays
  c.classList.add(dir>0?'anim-next':'anim-prev');
  clearTimeout(_animTimer);
  _animTimer=setTimeout(()=>c.classList.remove('anim-next','anim-prev'),520);
}
function go(i){if('speechSynthesis'in window)speechSynthesis.cancel();if(typeof stopStageAudio==='function')stopStageAudio();const _prev=idx;idx=Math.max(0,Math.min(stages.length-1,i));const _dir=idx>_prev?1:(idx<_prev?-1:0);try{localStorage.setItem(SK('Stage'),idx);}catch(e){}render();playStageAnim(_dir);anchorStage();}
/* keep the reader on the carousel instead of jumping to the top of the whole page */
function anchorStage(){
  if(readingCard&&readingCard.classList.contains('reading')){var cs=document.getElementById('cardScroll');if(cs)cs.scrollTop=0;return;}
  var a=document.querySelector('.carousel-stage');if(!a)return;
  var rect=a.getBoundingClientRect();
  /* only move if the stage top is off-screen above or sitting well below the fold */
  if(rect.top<0||rect.top>90){window.scrollTo(0,Math.max(0,rect.top+window.pageYOffset-12));}
}
const prev=document.getElementById('prev'),next=document.getElementById('next'),prevF=document.getElementById('prevF'),nextF=document.getElementById('nextF');
[prev,prevF].forEach(b=>b.addEventListener('click',()=>go(idx-1)));
[next,nextF].forEach(b=>b.addEventListener('click',()=>go(idx+1)));
document.addEventListener('keydown',e=>{if(modal.classList.contains('open')||lightbox.classList.contains('open'))return;if(e.key==='ArrowLeft')go(idx-1);if(e.key==='ArrowRight')go(idx+1);});

/* ---- modal ---- */
const modal=document.getElementById('modal'),mImg=document.getElementById('mImg'),mFlip=document.getElementById('mFlip'),
 mViewLabel=document.getElementById('mViewLabel'),mName=document.getElementById('mName'),mMl=document.getElementById('mMl'),
 mMeaning=document.getElementById('mMeaning'),mHistBlock=document.getElementById('mHistBlock'),mHist=document.getElementById('mHist'),
 mBibBlock=document.getElementById('mBibBlock'),mBib=document.getElementById('mBib'),mCur=document.getElementById('mCur'),mTot=document.getElementById('mTot');
let mIndex=0,mFace='front';
function openModal(name){const i=allItems.findIndex(x=>x.name===name);if(i<0)return;mIndex=i;showItem();modal.classList.add('open');}
function showItem(){
 const it=allItems[mIndex];mFace='front';
 var _mm=document.querySelector('.modal-media');if(_mm){_mm.classList.remove('ph-fallback');_mm.removeAttribute('data-letter');}
 mImg.style.display='';mImg.src=it.img;mImg.alt=it.name;
 mImg.onerror=function(){this.style.display='none';var mm=document.querySelector('.modal-media');if(mm){mm.classList.add('ph-fallback');mm.setAttribute('data-letter',(it.name||'?').trim().charAt(0).toUpperCase());}};
 mName.textContent=it.name;mMl.textContent=it.ml||'';mMl.style.display=it.ml?'':'none';
 mMeaning.innerHTML=linkBibleRefs(it.meaning||'');
 mHistBlock.style.display=it.hist?'':'none';mHist.textContent=it.hist||'';
 mBibBlock.style.display=it.bib?'':'none';mBib.innerHTML=linkBibleRefs(it.bib||'');
 if(it.back){mFlip.style.display='';mFlip.textContent='⇄ Flip to back';mViewLabel.textContent='Front View';mViewLabel.style.display='';}
 else{mFlip.style.display='none';mViewLabel.style.display='none';}
 mCur.textContent=mIndex+1;mTot.textContent=allItems.length;
}
mFlip.addEventListener('click',()=>{const it=allItems[mIndex];if(!it.back)return;mFace=mFace==='front'?'back':'front';mImg.src=mFace==='front'?it.img:it.back;mViewLabel.textContent=mFace==='front'?'Front View':'Back View';mFlip.textContent=mFace==='front'?'⇄ Flip to back':'⇄ Flip to front';});
document.getElementById('mClose').addEventListener('click',()=>modal.classList.remove('open'));
document.getElementById('mPrev').addEventListener('click',()=>{mIndex=(mIndex-1+allItems.length)%allItems.length;showItem();});
document.getElementById('mNext').addEventListener('click',()=>{mIndex=(mIndex+1)%allItems.length;showItem();});
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open');});
document.addEventListener('keydown',e=>{if(!modal.classList.contains('open'))return;if(e.key==='Escape'){modal.classList.remove('open');e.stopImmediatePropagation();}if(e.key==='ArrowLeft')document.getElementById('mPrev').click();if(e.key==='ArrowRight')document.getElementById('mNext').click();});

// reading-level toggle
function updateReadBtns(){document.querySelectorAll('#readToggle .rt-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===readMode));}
function setRead(mode){readMode=mode;try{localStorage.setItem(SK('Read'),mode);}catch(e){}updateReadBtns();render();}
document.querySelectorAll('#readToggle .rt-btn').forEach(b=>b.addEventListener('click',()=>setRead(b.dataset.mode)));
document.getElementById('goFull').addEventListener('click',()=>setRead('full'));
// did-you-know toggle
document.getElementById('dykHead').addEventListener('click',()=>document.getElementById('dyk').classList.toggle('open'));
// glossary popover
const glossPop=document.getElementById('glossPop');
document.addEventListener('click',e=>{
  const gt=e.target.closest('.gloss-term');
  if(gt){const g=glossLC[gt.dataset.term];if(g){document.getElementById('glossTerm').textContent=g.term;document.getElementById('glossDef').textContent=g.def;glossPop.hidden=false;const r=gt.getBoundingClientRect();const pw=glossPop.offsetWidth,ph=glossPop.offsetHeight;let left=r.left+r.width/2-pw/2;left=Math.max(10,Math.min(window.innerWidth-pw-10,left));let top=r.top-ph-10;if(top<10)top=r.bottom+10;glossPop.style.left=left+'px';glossPop.style.top=top+'px';}return;}
  if(!e.target.closest('.gloss-pop'))glossPop.hidden=true;
});
document.getElementById('glossClose').addEventListener('click',()=>glossPop.hidden=true);
window.addEventListener('scroll',()=>{glossPop.hidden=true;},{passive:true});

/* ---- image lightbox ---- */
const lightbox=document.getElementById('qLightbox'),lbImg=document.getElementById('qlbImg'),lbCap=document.getElementById('qlbCap');
function openLightbox(){const st=stages[idx];if(!st.img)return;lbImg.src=IMG+st.img;lbImg.alt=st.title;lbCap.textContent=st.title;lightbox.classList.add('open');}
function closeLightbox(){lightbox.classList.remove('open');}
/* ---- reading view (two-pane fullscreen) ---- */
const readingCard=document.querySelector('.carousel-card');
const readingExit=document.getElementById('readingExit');
function syncRhOffset(){if(readingHeader&&readingCard.classList.contains('reading'))readingCard.style.setProperty('--rh-h',readingHeader.offsetHeight+'px');}
function enterReading(){readingCard.classList.add('reading');document.body.classList.add('reading-lock');requestAnimationFrame(syncRhOffset);}
function exitReading(){readingCard.classList.remove('reading');document.body.classList.remove('reading-lock');}
if(readingExit)readingExit.addEventListener('click',exitReading);
window.addEventListener('resize',syncRhOffset);
if(window.ResizeObserver&&readingHeader)new ResizeObserver(syncRhOffset).observe(readingHeader);
media.addEventListener('click',e=>{if(e.target.closest('.fs-btn')){enterReading();}else if(!huntState.active&&!e.target.closest('.hotspot')&&!media.querySelector('.hotspot')&&e.target.tagName==='IMG'){openLightbox();}});
document.getElementById('qlbClose').addEventListener('click',closeLightbox);
lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});

/* ---- pronunciation: prefer the recorded clip (stage.audio); fall back to Web Speech TTS ---- */
const audioBtn=document.querySelector('.audio-button');
let speaking=false;
let stageAudio=null;
function stopStageAudio(){if(stageAudio){stageAudio.pause();stageAudio.currentTime=0;stageAudio=null;}if(audioBtn)audioBtn.classList.remove('speaking');}
function speakMalayalam(){
  const st=stages[idx];const text=st.ml||st.tr;if(!text)return;
  if(!('speechSynthesis'in window)){audioBtn.classList.add('speaking');setTimeout(()=>audioBtn.classList.remove('speaking'),900);return;}
  if(speaking){speechSynthesis.cancel();return;}
  if(typeof stopHymnAudios==='function')stopHymnAudios();
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  const voices=speechSynthesis.getVoices();
  const ml=voices.find(v=>/^ml(-|_|$)/i.test(v.lang))||voices.find(v=>/^hi(-|_|$)/i.test(v.lang));
  if(ml){u.lang=ml.lang;u.voice=ml;}else{u.text=st.tr||text;u.lang='en-IN';}
  u.rate=.85;
  u.onstart=()=>{speaking=true;audioBtn.classList.add('speaking');};
  u.onend=u.onerror=()=>{speaking=false;audioBtn.classList.remove('speaking');};
  speechSynthesis.speak(u);
}
function playPronunciation(){
  const st=stages[idx];
  if(st.audio){
    if(stageAudio){stopStageAudio();return;}          // toggle off if already playing
    if(typeof stopHymnAudios==='function')stopHymnAudios();
    if('speechSynthesis'in window)speechSynthesis.cancel();
    stageAudio=new Audio(st.audio);
    audioBtn.classList.add('speaking');
    stageAudio.onended=stageAudio.onerror=function(ev){
      const failed=ev&&ev.type==='error';stageAudio=null;audioBtn.classList.remove('speaking');
      if(failed)speakMalayalam();                      // file missing/blocked → TTS fallback
    };
    stageAudio.play().catch(function(){stageAudio=null;audioBtn.classList.remove('speaking');speakMalayalam();});
    return;
  }
  speakMalayalam();                                    // no recording for this stage → TTS
}
if(audioBtn)audioBtn.addEventListener('click',playPronunciation);
if('speechSynthesis'in window)speechSynthesis.onvoiceschanged=()=>{};

// close overlays / handle keys
document.addEventListener('keydown',e=>{if(e.key==='Escape'){var m=document.getElementById('rhMenu');if(m&&!m.hidden){m.hidden=true;var b=document.getElementById('rhCompactBtn');if(b)b.setAttribute('aria-expanded','false');return;}
  // overlays own Escape first, in priority order — only fall through to exiting reading view if none are open
  if(!glossPop.hidden){glossPop.hidden=true;return;}
  if(lightbox.classList.contains('open')){closeLightbox();return;}
  if(modal.classList.contains('open'))return;  // modal's own handler closes it (stops propagation)
  if(readingCard&&readingCard.classList.contains('reading')){exitReading();return;}closeLightbox();}});
document.addEventListener('click',e=>{var m=document.getElementById('rhMenu');if(m&&!m.hidden&&!e.target.closest('.rh-compact')){m.hidden=true;var b=document.getElementById('rhCompactBtn');if(b)b.setAttribute('aria-expanded','false');}});
// dismiss the completion banner (and remember it)
document.getElementById('doneClose').addEventListener('click',()=>{try{localStorage.setItem(SK('DoneDismissed'),'1');}catch(e){}document.getElementById('doneBanner').hidden=true;});
// init
idx=Math.max(0,Math.min(stages.length-1,idx));
// Toggling INTO kids mode starts a clean slate — fresh intro, locked quizzes, empty treasure hunt
function resetKidsProgress(){
  try{localStorage.removeItem(SK('ShlomoIntro'));}catch(e){}
  try{localStorage.removeItem(SK('DoneDismissed'));}catch(e){}
  readStages=new Set();saveReadStages();
  quizDoneParts=new Set();
  hotspotTapped=false;
  treasures=new Set();saveTreasures();
  visited=new Set();saveVisited();
  snGuide={stage:-1,step:0};
  huntState.active=false;huntState.stage=null;
  quizState.key=null;quizState.started=false;quizState.qi=0;quizState.score=0;quizState.answered=false;quizState.order=null;
  finalQuizState.key=null;finalQuizState.started=false;finalQuizState.qi=0;finalQuizState.score=0;finalQuizState.answered=false;finalQuizState.order=null;
  mascotStage=-1;mascotOpen=false;mascotGreeted=false;
}
function setKids(v){const turningOn=!!v&&!kidsMode;kidsMode=!!v;try{localStorage.setItem(SK('Kids'),kidsMode?'1':'0');}catch(e){}if(kidsMode){if(turningOn)resetKidsProgress();mascotStage=-1;mascotOpen=false;}else{huntState.active=false;}updateModeBtns();render();}
function toggleKids(){setKids(!kidsMode);}
function updateModeBtns(){document.querySelectorAll('.kids-switch').forEach(function(t){t.setAttribute('aria-checked',kidsMode?'true':'false');});}
/* sticky mini-bar: show liturgy title once the intro scrolls above the top */
(function(){var mini=document.getElementById('miniBar');if(!mini||!('IntersectionObserver'in window))return;var titleEl=document.querySelector('.section-statement');var mt=mini.querySelector('.mini-title');if(mt&&titleEl)mt.textContent=titleEl.textContent;var anchor=document.querySelector('.lit-intro')||titleEl;if(!anchor)return;var io=new IntersectionObserver(function(es){var e=es[0];mini.classList.toggle('show',!e.isIntersecting&&e.boundingClientRect.top<=0);},{threshold:0});io.observe(anchor);})();
(function(){var t=document.getElementById('kidsToggle');if(t)t.addEventListener('click',toggleKids);})();
updateModeBtns();
updateReadBtns();
render();
