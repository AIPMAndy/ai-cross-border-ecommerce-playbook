document.addEventListener("DOMContentLoaded",function(){(function(){'use strict';
const data=window.PLAYBOOK_DATA; if(!data){document.body.insertAdjacentText('afterbegin','内容加载失败，请检查 data/site-data.js');return;}
const q=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const KEY='ai-cross-border-playbook-v1';
let state={cards:[],days:[]};let stageFilter='',caseType='全部';
function notify(s){if(q('storageStatus'))q('storageStatus').textContent=s;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));notify('已保存到当前浏览器。')}catch(e){notify('此浏览器限制本地保存，请使用“导出进度”备份。')}}
function load(){try{let raw=localStorage.getItem(KEY);if(!raw)return;let o=JSON.parse(raw);state.cards=Array.isArray(o.cards)?o.cards.filter(x=>typeof x==='string'&&data.cards.some(c=>c.id===x)):[];state.days=Array.isArray(o.days)?o.days.filter(x=>Number.isInteger(x)&&x>=1&&x<=30):[];}catch(e){notify('进度读取失败，可尝试导入上次备份。')}}
function cardHtml(c){let done=state.cards.includes(c.id);return `<article class="action-card ${done?'is-done':''}"><div class="action-header"><span class="action-id">${esc(c.id)} / ${esc(c.stage)}</span><label class="done-label"><input type="checkbox" data-card-check="${esc(c.id)}" ${done?'checked':''} aria-label="完成${esc(c.title)}">已完成</label></div><h3>${esc(c.title)}</h3><p class="action-goal">${esc(c.goal)}</p><details><summary>查看完整动作和验收</summary><ol>${c.steps.map(s=>`<li>${esc(s.replace(/^\d+\.\s*/,''))}</li>`).join('')}</ol><p class="deliverable"><strong>验收物：</strong>${esc(c.deliverable)}</p><p class="fallback"><b>卡住时：</b>${esc(c.when_stuck)}</p><a class="card-resource-link" href="${esc(c.template)}">对应记录模板 ↗</a> <a class="card-resource-link" href="${esc(c.deep_dive)}">具体实操教程 ↗</a></details></article>`;}
function renderCards(){const t=(q('cardSearch').value||'').trim().toLowerCase(),unfinished=q('cardUnfinished').checked;const list=data.cards.filter(c=>(!stageFilter||c.stage===stageFilter)&&(!unfinished||!state.cards.includes(c.id))&&(!t||[c.id,c.title,c.goal,c.stage,c.deliverable,c.when_stuck,...c.steps].join(' ').toLowerCase().includes(t)));q('cardList').innerHTML=list.map(cardHtml).join('');q('cardResultCount').textContent=`找到 ${list.length} / ${data.cards.length} 张操作卡`;q('cardEmpty').hidden=list.length!==0;const n=state.cards.length;q('cardProgress').textContent=`${n} / ${data.cards.length}`;q('cardBar').style.width=(n/data.cards.length*100).toFixed(1)+'%';}
function buildStagePills(){let stages=[...new Set(data.chapters.map(c=>c.stage))];q('stageFilter').innerHTML='<option value="">全部阶段</option>'+stages.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('');const make=(s)=>`<button type="button" class="stage-pill ${s===stageFilter?'active':''}" data-stage="${esc(s)}">${esc(s||'全部')}</button>`;q('stagePills').innerHTML=['',...stages].map(make).join('');}
function renderCases(){const list=data.cases.filter(c=>caseType==='全部'||caseType===c.type);q('caseList').innerHTML=list.map(c=>`<article class="case-card"><span class="case-tag ${c.type==='失败复盘'?'failure':''}">${esc(c.id)} / ${esc(c.type)}</span><h3>${esc(c.name)}</h3><span class="case-theme">${esc(c.theme)}</span><p>${esc(c.what_happened)}</p><p class="takeaway"><b>可借鉴：</b>${esc(c.reproduce)}</p><div class="case-footer"><small>${esc(c.evidence_note)} · 核对${esc(c.checked_on)}</small><a href="${esc(c.source_url)}" target="_blank" rel="noopener noreferrer">查看原始案例 ↗</a></div></article>`).join('');q('cases').querySelectorAll('.case-pill').forEach(b=>b.classList.toggle('active',b.dataset.caseType===caseType));}
function renderDays(){let incomplete=q('dayUnfinished').checked;let list=data.plan.filter(d=>!incomplete||!state.days.includes(d.day));q('dayList').innerHTML=list.map(d=>`<label class="day-card ${state.days.includes(d.day)?'checked':''}"><input type="checkbox" data-day-check="${d.day}" ${state.days.includes(d.day)?'checked':''}><div><b>DAY ${String(d.day).padStart(2,'0')} / ${esc(d.stage)}</b><strong>${esc(d.task)}</strong><span>验收：${esc(d.deliverable)}</span></div></label>`).join('');q('dayProgress').textContent=`${state.days.length} / 30`;q('dayBar').style.width=(state.days.length/30*100).toFixed(1)+'%';}
const defaults={price:39,cogs:11,shipping:8,tax:1.5,platformRate:8,paymentRate:3.2,fixedFee:.3,refundRate:5,cpa:7,other:.5,targetProfit:5,fixedMonthly:39};
const money=n=>!Number.isFinite(n)?'—':(n<0?'−$':'$')+Math.abs(n).toFixed(2);
function calc(values){const p=values.price, percentage=(values.platformRate+values.paymentRate+values.refundRate)/100,nonAd=values.cogs+values.shipping+values.tax+values.fixedFee+values.other+p*percentage,preAd=p-nonAd,net=preAd-values.cpa;return {preAd,net,breakEvenCPA:preAd,targetCPA:preAd-values.targetProfit,breakEvenROAS:preAd>0?p/preAd:Infinity,fixedBreakEven:net>0?Math.ceil(values.fixedMonthly/net):Infinity};}
function calcRead(){let v={};for(let k of Object.keys(defaults)){const el=q(k);if(!el||el.value.trim()===''||!el.checkValidity())return null;v[k]=Number(el.value);if(!Number.isFinite(v[k])||v[k]<0)return null;}return v;}
function renderStress(v){const p=v.price,tests=[['当前输入',{}],['售价下降10%',{price:p*0.9}],['物流增加 $3',{shipping:v.shipping+3}],['CPA 增加 $5',{cpa:v.cpa+5}],['三个冲击同时发生',{price:p*0.9,shipping:v.shipping+3,cpa:v.cpa+5}]];q('stressTable').innerHTML=tests.map(([name,change])=>{const n=calc({...v,...change}).net;return `<tr><td>${name}</td><td class="${n<0?'stress-loss':'stress-ok'}">${money(n)}</td></tr>`}).join('');}
function recalc(){let v=calcRead();if(!v){q('netStatus').textContent='请填写有效且非负的数值，费率不得超过100%。';for(let k of ['netProfit','preAdProfit','breakevenCpa','targetCpa','roas','breakEvenOrders'])q(k).textContent='—';q('calcAdvice').textContent='请先修正输入参数。';q('stressTable').innerHTML='<tr><td colspan="2">输入无效</td></tr>';return;}let r=calc(v);q('netProfit').textContent=money(r.net);q('netProfit').classList.toggle('negative',r.net<0);q('netStatus').textContent=r.net<0?'当前假设下每单亏损':r.net===0?'当前假设下每单刚好不亏':'按当前假设每单广告后贡献';q('preAdProfit').textContent=money(r.preAd);q('breakevenCpa').textContent=money(r.breakEvenCPA);q('targetCpa').textContent=money(r.targetCPA);q('roas').textContent=Number.isFinite(r.breakEvenROAS)?r.breakEvenROAS.toFixed(2)+'x':'不可达到';q('breakEvenOrders').textContent=Number.isFinite(r.fixedBreakEven)?r.fixedBreakEven+' 单':'不可达到';q('calcAdvice').textContent=r.preAd<=0?'广告前单笔贡献已经不为正：先调整售价、供货、物流或费用结构，广告不能修复负贡献。':r.net<=0?'广告获客费吃掉了贡献：先设损失上限，检查真实报价和渠道转化，不要扩大投放。':r.targetCPA<0?'当前成本结构不能达到你设定的每单目标利润。':'这一组假设的单笔贡献为正；下一步核对收款、交付、退货和真实订单成本。';renderStress(v);}
function backup(){const out={version:1,exported_at:new Date().toISOString(),cards:[...new Set(state.cards)],days:[...new Set(state.days)]};const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ai-commerce-progress.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function importBackup(file){if(!file)return;const reader=new FileReader();reader.onerror=()=>notify('备份读取失败。');reader.onload=()=>{try{let o=JSON.parse(reader.result);if(o.version!==1||!Array.isArray(o.cards)||!Array.isArray(o.days))throw Error('invalid');if(o.cards.some(x=>typeof x!=='string')||o.days.some(x=>!Number.isInteger(x)))throw Error('types');state.cards=[...new Set(o.cards)].filter(id=>data.cards.some(c=>c.id===id));state.days=[...new Set(o.days)].filter(n=>n>=1&&n<=30);save();renderCards();renderDays();notify('导入成功：'+state.cards.length+'张卡 / '+state.days.length+'天。');}catch(e){notify('导入失败：文件格式不支持或数据无效。')}};reader.readAsText(file);}
load();buildStagePills();renderCards();renderCases();renderDays();recalc();
q('cardList').addEventListener('change',e=>{const id=e.target?.dataset?.cardCheck;if(!id)return;state.cards=e.target.checked?[...new Set([...state.cards,id])]:state.cards.filter(x=>x!==id);save();renderCards();});
q('dayList').addEventListener('change',e=>{const n=Number(e.target?.dataset?.dayCheck);if(!n)return;state.days=e.target.checked?[...new Set([...state.days,n])]:state.days.filter(x=>x!==n);save();renderDays();});
q('cardSearch').addEventListener('input',renderCards);q('cardUnfinished').addEventListener('change',renderCards);q('dayUnfinished').addEventListener('change',renderDays);
q('stageFilter').addEventListener('change',e=>{stageFilter=e.target.value;buildStagePills();renderCards();});
q('stagePills').addEventListener('click',e=>{const btn=e.target.closest('[data-stage]');if(!btn)return;stageFilter=btn.dataset.stage;buildStagePills();renderCards();});
q('resetFilters').addEventListener('click',()=>{stageFilter='';q('cardSearch').value='';q('cardUnfinished').checked=false;buildStagePills();renderCards();});
q('cases').querySelector('.case-pills').addEventListener('click',e=>{const b=e.target.closest('[data-case-type]');if(!b)return;caseType=b.dataset.caseType;renderCases();});
q('exportProgress').addEventListener('click',backup);q('importProgress').addEventListener('change',e=>{importBackup(e.target.files[0]);e.target.value='';});
q('resetProgress').addEventListener('click',()=>{if(!confirm('确定清空本设备全部操作卡与30天打卡进度？建议先导出备份。'))return;state={cards:[],days:[]};save();renderCards();renderDays();});
q('profitForm').addEventListener('input',recalc);q('resetCalc').addEventListener('click',()=>{for(let [k,v]of Object.entries(defaults))q(k).value=v;recalc();});
q('copyCalc').addEventListener('click',async()=>{const v=calcRead();if(!v){q('netStatus').textContent='输入无效，无法复制。';return;}const r=calc(v);const s=`AI跨境电商单笔贡献测算（全部为输入假设，USD）\n售价 ${money(v.price)} / 广告前贡献 ${money(r.preAd)} / CPA ${money(v.cpa)} / 广告后贡献 ${money(r.net)} / CPA盈亏平衡 ${money(r.breakEvenCPA)} / 目标利润CPA上限 ${money(r.targetCPA)} / 月固定费用 ${money(v.fixedMonthly)} / 覆盖月固定费订单 ${Number.isFinite(r.fixedBreakEven)?r.fixedBreakEven:'不可达到'}\n数据来源：使用者输入，非真实订单或平台费率`;try{await navigator.clipboard.writeText(s);q('netStatus').textContent='测算已复制';}catch(e){const t=document.createElement('textarea');t.value=s;document.body.appendChild(t);t.select();try{document.execCommand('copy');q('netStatus').textContent='测算已复制（兼容模式）';}catch(e2){q('netStatus').textContent='复制失败，请手动记下结果';}t.remove();}});
q('mobileMenu').addEventListener('click',()=>{const nav=document.querySelector('.nav-links'),open=nav.classList.toggle('open');q('mobileMenu').setAttribute('aria-expanded',open?'true':'false');});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.nav-links').classList.remove('open');q('mobileMenu').setAttribute('aria-expanded','false');}));
window.PlaybookTest={calc,defaults,esc};

// V2 interactive qualification advisor: only recommends a research path, never grants eligibility.
function advise(e){e.preventDefault();const entity=q('advisorEntity').value,edge=q('advisorEdge').value,budget=q('advisorBudget').value,payment=q('advisorPayment').value,market=q('advisorMarket').value;
 let title='',actions=[],blockers=[],route='';
 if(entity==='none'){title='先做资格和需求验证，不要急着开店';route='research';blockers.push('经营主体和平台准入未确认');actions=['确定目标市场与用户场景','研究10条真实购买问题','查主体/平台/支付资格后再做付费动作'];}
 else if(edge==='supply'){title='优先验证 AI + B2B 采购询盘';route='b2b';actions=['向2家真实工厂索取同规格报价','研究5位潜在海外采购商的真实需求','制作英文能力页和个性化联系记录'];if(budget==='2')actions.push('若想做零售，再比较Amazon小批量与B2B现金占用');}
 else if(edge==='design'){title='先做原创样品；收款通过后再测试 POD';route='pod';actions=['核对图案、字体与授权','取得1个真实印刷样品并拍摄','询2份目标国家物流/退货报价'];}
 else if(edge==='content'){title='先用现有内容受众验证购买意图';route='content';actions=['收集3个已经出现的真实购买问题','用原创实拍内容测试需求而不是空做店铺','寻找有真实交付能力的合作供应商'];}
 else{title='先做零预算的需求研究';route='research';actions=['找30条真实需求和可买替代品','从20个商品缩到3个可询价候选','试算单位成本与支付资格'];}
 if(payment!=='verified')blockers.push('真实收款、提现和结账尚未验证；不能开放实际支付');
 if(market==='us')blockers.push('美国进口税费需要按真实商品/清关路径核对，不能默认小额包裹免税');
 if(market==='eu')blockers.push('欧盟消费品安全、产品信息和适用EU负责人要求必须逐SKU核实');
 if(market==='other')blockers.push('目标国家未定：本项目的美国/EU政策不能直接代替目的国规则');
 if(budget==='0')blockers.push('预算不足以验证样品/履约时，先完成免费调研；不要预付会员和广告');
 const links={research:['playbooks/02-demand.md','需求调研手册'],b2b:['playbooks/09-b2b-export.md','B2B行动手册'],pod:['playbooks/10-pod.md','POD行动手册'],content:['playbooks/07-first-visitors.md','内容验证手册']}[route];
 q('advisorResult').innerHTML=`<span class="advisor-overline">RECOMMENDED NEXT STEP · 不是平台资格批准</span><h3>${title}</h3><p><strong>下一步先完成：</strong></p><ol>${actions.map(a=>`<li>${a}</li>`).join('')}</ol><p><b>必须处理的阻塞点：</b></p><ul>${(blockers.length?blockers:['确认商品与目的国合规及收款状态已持续有效']).map(x=>`<li>${x}</li>`).join('')}</ul><a href="${links[0]}">${links[1]} ↗</a><a href="templates/launch-gates.csv">准入核验清单 ↗</a>`;
}
q('routeAdvisor').addEventListener('submit',advise);
function updateCash(){const fields=['cashUnits','cashCogs','cashFreight','cashSamples','cashAds','cashSetup','cashBuffer'];const v=fields.map(id=>{let el=q(id);return el.value.trim()===''||!el.checkValidity()?NaN:Number(el.value)});if(v.some(x=>!Number.isFinite(x)||x<0)||!Number.isInteger(v[0])){q('cashTotal').textContent='—';q('cashComment').textContent='请填写合法且非负的金额、整数件数与0–100%的缓冲比例。';return;}const [units,cogs,freight,samples,ads,setup,buffer]=v;const cost=(units*cogs+freight+samples+ads+setup)*(1+buffer/100);q('cashTotal').textContent=money(cost);q('cashComment').textContent=`${units}件样本开卖前预备现金（不含分期结算时间表）。这只是输入假设；需要实际报价和现金日历。`;}
q('cashForm').addEventListener('input',updateCash);updateCash();


const andyCopyBtn=q('copyAndyWechat');
if(andyCopyBtn){
  andyCopyBtn.addEventListener('click',async ()=>{
    const value='AIPMAndy';
    const status=q('andyCopyResult');
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(value);
      }else{
        const input=document.createElement('textarea');
        input.value=value;input.style.position='fixed';input.style.left='-9999px';
        document.body.appendChild(input);input.select();
        const ok=document.execCommand('copy');input.remove();
        if(!ok)throw new Error('copy blocked');
      }
      status.textContent='已复制微信号 AIPMAndy。添加时可备注“跨境电商”。';
    }catch(_error){
      status.textContent='无法自动复制。请手动复制上方微信号：AIPMAndy';
    }
  });
}

})();
});