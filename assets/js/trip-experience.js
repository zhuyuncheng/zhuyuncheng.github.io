(function(root){
  'use strict';
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function snapshot(data,state,routes,dayId){
    return {version:1,trip:data.trip.id,generated:new Date().toISOString(),days:data.days.filter(function(d){return !dayId||d.id===dayId;}).map(function(d){var ids=routes.route(data,state,d.id),meals={};['lunch','dinner'].forEach(function(slot){var meal=state.meals[d.id]&&state.meals[d.id][slot];if(meal&&ids.indexOf(meal.primary)>=0)meals[slot]=meal.primary;});return {id:d.id,route:ids,meals:meals,departure:(state.daySettings[d.id]||{}).departure||d.start_time||'08:00'};})};
  }
  function validateSnapshot(input,data){
    if(!input||input.version!==1||input.trip!==data.trip.id||!Array.isArray(input.days)||!input.days.length||input.days.length>14)throw Error('分享内容或版本无效');
    var by=Object.fromEntries(data.pois.map(function(p){return [p.id,p];})),seen=new Set();
    if(typeof input.generated!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(input.generated)||!Number.isFinite(Date.parse(input.generated)))throw Error('分享时间无效');
    return {version:1,trip:data.trip.id,generated:input.generated,days:input.days.map(function(d){
      if(!d||!data.days.some(function(day){return day.id===d.id;})||seen.has(d.id)||!Array.isArray(d.route)||d.route.length>24||!d.route.every(function(id){return typeof id==='string'&&by[id];})||!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.departure))throw Error('分享日期或路线损坏');
      var meals={};['lunch','dinner'].forEach(function(slot){var id=d.meals&&d.meals[slot];if(id&&d.route.indexOf(id)>=0&&by[id].type==='restaurant')meals[slot]=id;});
      seen.add(d.id);return {id:d.id,route:d.route.slice(),meals:meals,departure:d.departure};
    })};
  }
  function wishOptions(data,state,id,routes,advisor,config){
    var poi=data.pois.find(function(p){return p.id===id;});if(!poi||poi.type!=='attraction')return [];
    return data.days.filter(function(day){var plan=data.choice_plans[day.id];return plan&&((poi.days||[]).indexOf(day.id)>=0||plan.groups.some(function(k){return data.choice_groups[k].options.some(function(o){return o.id===id;});}));}).map(function(day){
      var old=routes.route(data,state,day.id),next=clone(state);if(old.indexOf(id)<0)next.extraStops[day.id]=Array.from(new Set((next.extraStops[day.id]||[]).concat(id)));
      delete next.routeOrders[day.id];var ids=routes.route(data,next,day.id),settings=next.daySettings[day.id]||{},a=advisor.estimate(data,old,settings,config),b=advisor.estimate(data,ids,settings,config);
      return {day:day.id,state:next,ids:ids,existing:old.indexOf(id)>=0,delta:b.km-a.km,minutes:b.total-a.total,total:b.total};
    }).sort(function(a,b){return a.delta-b.delta||a.minutes-b.minutes;});
  }
  function mealOptions(data,state,dayId,slot,preference,routes,advisor,config){
    var old=routes.route(data,state,dayId);if(old.length<2)return [];
    var by=Object.fromEntries(data.pois.map(function(p){return [p.id,p];})),anchors=old.slice(0,-1).filter(function(id){return by[id].type!=='restaurant';}),at=slot==='lunch'?(anchors.find(function(id){return by[id].type==='attraction';})||anchors[0]):anchors[anchors.length-1];
    var oldMeal=old.find(function(id){return by[id].type==='restaurant';}),base=advisor.estimate(data,old,state.daySettings[dayId]||{},config);
    return data.pois.filter(function(p){return p.type==='restaurant';}).map(function(p){
      var next=clone(state);next.meals[dayId]=next.meals[dayId]||{lunch:{primary:oldMeal,after:at},dinner:{}};
      next.meals[dayId][slot]=Object.assign({},next.meals[dayId][slot],{primary:p.id,after:at});delete next.routeOrders[dayId];
      var ids=routes.route(data,next,dayId),m=advisor.estimate(data,ids,next.daySettings[dayId]||{},config),g=p.guide||{},dishes=(g.signature_dishes||[]).join('、');
      var knownStaple=/米饭|面|饺|粥|蒸蛋/.test(dishes),local=/海鲜|鲅|鲍|朝天锅|排骨|蛤/.test(dishes),parking=!/待|现场|复核|—/.test((p.parking.fee||'待')+(p.parking.notes||'待'));
      var bonus=preference==='baby'&&knownStaple?5:preference==='local'&&local?5:preference==='parking'&&parking?5:0;
      return {poi:p,state:next,ids:ids,delta:m.km-base.km,minutes:m.total-base.total,score:m.km-base.km-bonus,reason:preference==='baby'?(knownStaple?'菜单资料含常见主食；口味和儿童椅待确认':'未找到明确主食资料，先联系店家'):preference==='local'?(local?'菜单资料有地方菜关键词':'以现有菜单为准'):preference==='parking'?'按停车资料完整度辅助排序，不保证有车位':'按当天完整路线几何增量排序'};
    }).sort(function(a,b){return a.score-b.score;}).slice(0,4);
  }
  function outing(data,state,dayId,mode,routes,advisor,config){
    var ids=routes.route(data,state,dayId),by=Object.fromEntries(data.pois.map(function(p){return [p.id,p];}));
    if(ids.length<2||ids[0]!==ids[ids.length-1]||by[ids[0]].type!=='hotel')return null;
    var next=clone(state);next.outingModes[dayId]=mode;delete next.routeOrders[dayId];
    next.daySettings[dayId]=Object.assign({},next.daySettings[dayId],{napMinutes:120,napAtHotel:mode==='return'});
    var proposed=routes.route(data,next,dayId),a=advisor.estimate(data,ids,state.daySettings[dayId]||{},config),b=advisor.estimate(data,proposed,next.daySettings[dayId],config);
    return {state:next,ids:proposed,delta:b.km-a.km,minutes:b.total-a.total,mode:mode};
  }
  var api={snapshot:snapshot,validateSnapshot:validateSnapshot,wishOptions:wishOptions,mealOptions:mealOptions,outing:outing,esc:esc};
  if(typeof module!=='undefined')module.exports=api;
  if(root)root.TripExperienceCore=api;
  if(!root||!root.TripStore)return;
  var store=root.TripStore,data=store.data,routes=root.TripRoutes,advisor=root.TripAdvisor,config=JSON.parse(document.getElementById('shandong-advisor-data').textContent);
  function poiButton(id){return '<button type="button" data-exp-poi="'+esc(id)+'">'+esc(store.poiById[id].name)+'</button>';}
  function bind(el){el.querySelectorAll('[data-exp-poi]').forEach(function(b){b.onclick=function(){root.dispatchEvent(new CustomEvent('trip:openpoi',{detail:b.dataset.expPoi}));};});}
  function preview(box,option){
    if(!option||option.ids.length>18){box.innerHTML='<p>当前无法生成可用方案或途经点过多，请先减少停靠点。</p>';return;}
    box.innerHTML='<p>相对当前：'+(option.delta>=0?'+':'')+option.delta+' km / '+(option.minutes>=0?'+':'')+option.minutes+' 分钟。仅为几何与停留预算粗估，不是实际导航；采用后恢复当天推荐排序，已有手动删减会重新编排。</p><ol>'+option.ids.map(function(id){return '<li>'+poiButton(id)+'</li>';}).join('')+'</ol>'+(option.total>600?'<p>全日预算超过 10 小时，建议减少其他景点；本次不会自动替你删除。</p>':'')+'<button type="button" data-confirm>确认采用</button><button type="button" data-dismiss>取消</button>';
    bind(box);box.querySelector('[data-dismiss]').onclick=function(){box.innerHTML='';};box.querySelector('[data-confirm]').onclick=function(){store.importState(option.state);box.innerHTML='<p>已采用，路线与方案已更新。</p>';};
  }
  function catalog(parent){
    var el=document.createElement('section');el.className='trip-experience';el.innerHTML='<h3>我想去的地方</h3><p>先收藏，再预览放在哪天。推荐只在已有候选适配日中比较，不跨城市硬塞；采用不会自动删除其他景点。</p><label>选择景点<select data-wish-select>'+data.pois.filter(function(p){return p.type==='attraction';}).map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></label><button type="button" data-wish-add>加入想去清单</button><div data-wishes></div>';
    parent.insertBefore(el,parent.querySelector('.trip-catalog-grid'));function draw(){
      var state=store.getState(),box=el.querySelector('[data-wishes]');box.innerHTML=state.wishes.length?state.wishes.map(function(id){var options=wishOptions(data,state,id,routes,advisor,config),planned=data.days.filter(function(d){return routes.route(data,state,d.id).indexOf(id)>=0;}).map(function(d){return d.id.toUpperCase();});return '<article>'+poiButton(id)+'<p>当前已安排：'+(planned.join('、')||'尚未安排')+'</p><button type="button" data-wish-remove="'+id+'">取消收藏</button>'+options.slice(0,3).map(function(o){return '<button type="button" data-wish-day="'+o.day+'" data-wish-id="'+id+'">'+o.day.toUpperCase()+' · '+(o.existing?'当天已有':(o.delta>=0?'+':'')+o.delta+' km')+' · 预览</button>';}).join('')+(options.length?'':'<p>尚无适配日期，保留收藏，不自动安排到团圆日。</p>')+'<div data-wish-preview="'+id+'"></div></article>';}).join(''):'<p>还没有收藏。</p>';bind(box);
      box.querySelectorAll('[data-wish-remove]').forEach(function(b){b.onclick=function(){var n=store.getState();n.wishes=n.wishes.filter(function(id){return id!==b.dataset.wishRemove;});store.importState(n);draw();};});
      box.querySelectorAll('[data-wish-day]').forEach(function(b){b.onclick=function(){var option=wishOptions(data,store.getState(),b.dataset.wishId,routes,advisor,config).find(function(o){return o.day===b.dataset.wishDay;});preview(box.querySelector('[data-wish-preview="'+b.dataset.wishId+'"]'),option);};});
    }el.querySelector('[data-wish-add]').onclick=function(){var n=store.getState();n.wishes=Array.from(new Set(n.wishes.concat(el.querySelector('select').value)));store.importState(n);draw();};draw();
  }
  function editor(parent,dayId){
    var el=document.createElement('section');el.className='trip-experience';el.innerHTML='<h3>吃饭跟着路线走</h3><p>午餐优先快稳，晚餐兼顾酒店；排序参考现有菜单资料，不保证营业、车位或宝宝餐。</p><label>饭点<select data-meal-slot><option value="lunch">午餐</option><option value="dinner">晚餐</option></select></label><label>更在意<select data-meal-pref><option value="detour">少绕路</option><option value="local">当地特色</option><option value="baby">宝宝主食</option><option value="parking">停车资料</option></select></label><button type="button" data-meal-find>找四个顺路候选</button><div data-meal-results></div><h3>酒店午睡双模式</h3><p>只适用于起终点同一家酒店的连续入住日。不默认入住前、退房后还能用房。</p><button type="button" data-outing="return">预览中午回房版</button><button type="button" data-outing="away">预览白天不回房版</button><div data-outing-preview></div>';
    parent.appendChild(el);
    el.querySelector('[data-meal-find]').onclick=function(){var options=mealOptions(data,store.getState(),dayId,el.querySelector('[data-meal-slot]').value,el.querySelector('[data-meal-pref]').value,routes,advisor,config),box=el.querySelector('[data-meal-results]');box.innerHTML=options.length?options.map(function(o,i){var g=o.poi.guide||{};return '<article>'+poiButton(o.poi.id)+'<p>'+esc(o.reason)+'</p><p>菜单参考：'+esc((g.signature_dishes||[]).join('、')||'待核验')+'</p><p>两大一小点单建议：'+esc(g.family_order||o.poi.baby.meal)+'</p><p>'+esc(o.poi.price)+'；儿童椅、少盐及停车请确认。</p><button type="button" data-food-preview="'+i+'">预览路线变化（'+(o.delta>=0?'+':'')+o.delta+' km）</button><div data-food-result="'+i+'"></div></article>';}).join(''):'<p>当天没有固定路线，请保留家庭用餐安排。</p>';bind(box);box.querySelectorAll('[data-food-preview]').forEach(function(b){b.onclick=function(){preview(box.querySelector('[data-food-result="'+b.dataset.foodPreview+'"]'),options[Number(b.dataset.foodPreview)]);};});};
    el.querySelectorAll('[data-outing]').forEach(function(b){b.onclick=function(){var option=outing(data,store.getState(),dayId,b.dataset.outing,routes,advisor,config),box=el.querySelector('[data-outing-preview]');preview(box,option);if(option)box.insertAdjacentHTML('afterbegin','<p>'+(option.mode==='return'?'午餐后回酒店，休息预算移到酒店站；若没有后续外出，终点酒店就是回房站。不会自动删景点，请注意下午是否过满。':'取消中途回房站，保留餐后 120 分钟休息预算。休息地点和睡眠条件未知，不能把车内或餐厅当成已确定的午睡场所。')+'</p>');};});
  }
  function play(p,container){
    if(p.type!=='attraction')return;
    var el=document.createElement('section');el.className='trip-experience';var guide=p.guide||{},deep=config.minutes[p.id]||150;
    el.innerHTML='<h3>这里具体怎么玩</h3><p>玩法为规划建议，不代表开放项目或门票承诺；30 分钟不是大型景区完整游览。</p>'+[[30,'路过版','只保留一个主画面，不追求完整游线；收费场所先判断短停是否值得购票。'],[90,'慢游版','按宝宝兴趣选一段游线，途中安排休息，不为了拍照催赶。'],[Math.max(150,deep),'深入版','参考完整游线，演出和预约以当天信息为准，宝宝疲惫就提前退出。']].map(function(v){return '<article><h4>'+v[1]+' · '+v[0]+' 分钟预算</h4><p>'+esc(v[2])+'</p></article>';}).join('')+'<p>值得看：'+esc(guide.why||p.summary)+'</p><p>游线：'+esc(guide.visit_route||'按现场开放区域择短线')+'</p><p>宝宝参与建议：由家人陪伴观察颜色、声音和形状，让宝宝指出最喜欢的一个画面；不预设一定有互动设施。</p><p>家庭记录：'+esc(guide.photo_spots||'主景观旁合影')+'；留一张背影、一段宝宝自己的声音，不必处处摆拍。</p><label>应用到已安排日期<select data-play-day></select></label><label>停留预算<select data-play-minutes><option value="30">30 分钟</option><option value="90">90 分钟</option><option value="'+Math.max(150,deep)+'">深入 '+Math.max(150,deep)+' 分钟</option></select></label><button type="button" data-play-apply>保存这站的玩法时长</button><p role="status" data-play-status></p>';
    container.appendChild(el);var days=data.days.filter(function(d){return routes.route(data,store.getState(),d.id).indexOf(p.id)>=0;}),select=el.querySelector('[data-play-day]');select.innerHTML=days.map(function(d){return '<option value="'+d.id+'">'+esc(d.label+' '+d.title)+'</option>';}).join('');el.querySelector('button').disabled=!days.length;
    if(!days.length)el.querySelector('[data-play-status]').textContent='尚未安排到路线，请先在想去清单中选日期。';
    el.querySelector('[data-play-apply]').onclick=function(){var n=store.getState(),id=select.value;if(!id)return;n.daySettings[id]=n.daySettings[id]||{};n.daySettings[id].stays=Object.assign({},n.daySettings[id].stays);n.daySettings[id].stays[p.id]=Number(el.querySelector('[data-play-minutes]').value);store.importState(n);el.querySelector('[data-play-status]').textContent='已保存，行程试算同步更新';};
  }
  function sharing(parent){
    var el=document.createElement('section');el.className='trip-experience';el.innerHTML='<h3>发给家人的微信行程卡</h3><p>只读快照，不实时同步，不含私人日记、订单、地址输入或费用。链接可转发，请只分享给信任的人。</p><label>分享范围<select data-family-scope><option value="">全程 14 天</option>'+data.days.map(function(d){return '<option value="'+d.id+'">'+esc(d.label+' '+d.title)+'</option>';}).join('')+'</select></label><button type="button" data-family-create>生成只读链接</button><div data-family-output></div>';
    parent.insertBefore(el,parent.firstChild);el.querySelector('button').onclick=function(){var snap=snapshot(data,store.getState(),routes,el.querySelector('select').value),encoded=btoa(unescape(encodeURIComponent(JSON.stringify(snap)))),meta=document.getElementById('trip-family-base'),base=meta?meta.dataset.url:'https://zhuyuncheng.github.io/travel/family/';var url=base+'#family='+encodeURIComponent(encoded),box=el.querySelector('[data-family-output]');
      box.innerHTML='<label>复制到微信<input readonly value="'+esc(url)+'"></label><button type="button" data-family-copy>复制链接</button><button type="button" data-family-native>系统分享</button><a href="'+esc(url)+'" target="_blank" rel="noopener">打开只读卡 / 生成海报</a><p role="status"></p><p>微信内可复制链接发送，或在只读卡中保存海报后发群。系统分享是否出现微信由手机决定，本站不能自动发群。本地新增页面部署后链接才可被家人访问。</p>';
      box.querySelector('[data-family-copy]').onclick=async function(){try{await navigator.clipboard.writeText(url);box.querySelector('[role=status]').textContent='已复制，可粘贴到微信';}catch(e){box.querySelector('input').focus();box.querySelector('input').select();box.querySelector('[role=status]').textContent='请长按或手动复制上方链接';}};
      box.querySelector('[data-family-native]').onclick=async function(){try{if(!navigator.share)throw Error();await navigator.share({title:'山东半岛家庭行程',text:'我们的只读行程快照',url:url});}catch(e){box.querySelector('[role=status]').textContent=e&&e.name==='AbortError'?'已取消分享':'此浏览器不支持系统分享，请复制链接发送微信';}};
    };
  }
  root.TripExperience={catalog:catalog,editor:editor,play:play,sharing:sharing};
})(typeof window!=='undefined'?window:null);
