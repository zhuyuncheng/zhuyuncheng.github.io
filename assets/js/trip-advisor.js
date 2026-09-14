(function(root){
  'use strict';
  var names={light:'轻松版',standard:'标准版',rich:'丰富版'};
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function km(a,b){
    a=a.route_target||a.location;b=b.route_target||b.location;
    var r=Math.PI/180,x=Math.sin((b.lat-a.lat)*r/2),y=Math.sin((b.lng-a.lng)*r/2);
    return 12742*Math.asin(Math.min(1,Math.sqrt(x*x+Math.cos(a.lat*r)*Math.cos(b.lat*r)*y*y)))*1.3;
  }
  function estimate(data,ids,settings,config){
    var by=Object.fromEntries(data.pois.map(function(p){return [p.id,p];})),distance=0,drive=0;
    var parts=(settings.departure||'08:00').split(':'),start=Number(parts[0])*60+Number(parts[1]),time=start,nap=false;
    ids.forEach(function(id,i){if(i){var leg=km(by[ids[i-1]],by[id]),minutes=leg/(leg>60?75:30)*60;distance+=leg;drive+=minutes;time+=minutes;}
      if(i && i<ids.length-1){var p=by[id],v=settings.stays&&settings.stays[id];if(settings.mealTimes&&Number.isFinite(settings.mealTimes[id]))time=Math.max(time,settings.mealTimes[id]);time+=Number.isFinite(v)?v:(config.minutes[id]||({restaurant:60,charge:40,hotel:0}[p.type]||0));if(p.type!=='charge' && p.type!=='hotel')time+=15;if(!nap&&(settings.napAtHotel?(p.type==='hotel'&&id===ids[0]):p.type==='restaurant')){time+=settings.napMinutes||0;nap=true;}}
    });
    return {km:Math.round(distance),drive:Math.round(drive),total:Math.round(time-start)};
  }
  function insertion(data,ids,poiId){
    var by=Object.fromEntries(data.pois.map(function(p){return [p.id,p];}));
    if(ids.indexOf(poiId)>=0)return {existing:true};
    var best=null;
    ids.slice(1).forEach(function(id,i){var delta=Math.max(0,km(by[ids[i]],by[poiId])+km(by[poiId],by[id])-km(by[ids[i]],by[id]));if(!best||delta<best.km)best={km:delta,after:ids[i],before:id};});
    return best;
  }
  function packagePlan(data,state,dayId,level,config,routes){
    var recipe=config.presets[dayId];if(!recipe || !names[level])return null;
    var next=clone(state),selected=recipe[level].slice();next.selections[recipe.group]=selected;
    // A shared group can affect another day; invalidate only routes that reference it.
    Object.keys(data.choice_plans).forEach(function(id){if(data.choice_plans[id].sequence.indexOf('@'+recipe.group)>=0)delete next.routeOrders[id];});
    next.meals[dayId]={lunch:{primary:dayId==='d5'&&level==='light'?'f-yantai':recipe.lunch,after:selected[0]},dinner:{primary:recipe.dinner,after:selected[selected.length-1]}};
    if(dayId==='d10')next.meals[dayId].lunch={};
    next.daySettings[dayId]=Object.assign({},next.daySettings[dayId],{napMinutes:dayId==='d10'?0:120});
    next.daySettings[dayId].departure=next.daySettings[dayId].departure||data.days.find(function(d){return d.id===dayId;}).start_time||'08:00';
    next.daySettings[dayId].mealTimes={};
    ['lunch','dinner'].forEach(function(slot){var id=next.meals[dayId][slot].primary;if(id)next.daySettings[dayId].mealTimes[id]=slot==='lunch'?690:1020;});
    next.daySettings[dayId].stays=Object.assign({},next.daySettings[dayId].stays);
    selected.forEach(function(id){next.daySettings[dayId].stays[id]=level==='light'?Math.min(config.minutes[id]||90,90):config.minutes[id]||90;});
    var ids=routes.recommended(data,next,dayId);next.routeOrders[dayId]=ids;
    return {state:next,ids:ids,note:recipe.note,level:level};
  }
  function hotelImpact(data,state,groupId,hotelId,routes,config){
    var next=clone(state);next.selections[groupId]=[hotelId];var rows=[],total=0;
    Object.keys(data.choice_plans).forEach(function(dayId){if(data.choice_plans[dayId].sequence.indexOf('@'+groupId)<0)return;
      delete next.routeOrders[dayId];
      ['lunch','dinner'].forEach(function(slot){var meal=next.meals[dayId]&&next.meals[dayId][slot];if(meal&&data.choice_groups[groupId].options.some(function(o){return o.id===meal.after;}))meal.after=hotelId;});
      var ids=routes.route(data,next,dayId),m=estimate(data,ids,next.daySettings[dayId]||{},config);
      total+=m.km;rows.push({day:dayId,ids:ids,metric:m});
    });return {state:next,rows:rows,km:total};
  }
  function lastMile(p,config){
    var g=p.guide||{},parking=p.parking||{},baby=p.baby||{},e=config.evidence[p.id];
    return '<section class="trip-advisor-mile"><h3>下车之后 · 最后一公里</h3><p class="trip-advisor-disclaimer">现有坐标仅作候选定位，未逐一核实车行入口。步行距离、无障碍入口与车位到房间时间：待确认。</p>'+[
      ['停车落点（待复核）',parking.entrance||p.address],
      ['费用 / 限高', (parking.fee||'待确认')+' / '+(parking.height_limit==='—'?'待确认':parking.height_limit||'待确认')],
      ['步行与推车',baby.stroller||'待核实无障碍通道'],
      ['游览顺序（规划建议）',g.visit_route||g.fit||g.use_case||'停车 → 确认入口 → 卫生间 / 休息点 → 主任务 → 原停车点'],
      ['厕所与休息', (baby.toilet||'位置待确认')+'；休息点、母婴室具体位置待现场导览确认。'],
      ['离场与找车','下车先拍停车分区、车位号和入口；离场先核对出口是否通往原停车场，勿默认景区出口与入口重合。'],
      ['晚上短走（规划建议）','如安排夜游，建议只走照明良好的开放路段，预留原路返回时间；不确定出口和车位时不继续深入。']
    ].map(function(row){return '<p><strong>'+esc(row[0])+'</strong><br>'+esc(row[1])+'</p>';}).join('')+
      (e?'<p>本次查阅 '+esc(config.reviewed_at)+'：'+esc(e.text)+' <a href="'+esc(e.source)+'" target="_blank" rel="noopener">来源</a></p>':'<p>资料依据：现有地点库；本次未新增现场核验。</p>')+
      '<a href="https://uri.amap.com/search?keyword='+encodeURIComponent(p.name+' 停车场')+'&amp;src=moulang-blog&amp;callnative=1" target="_blank" rel="noopener">高德查停车场（先核对再导航）</a></section>';
  }
  var api={estimate:estimate,packagePlan:packagePlan,hotelImpact:hotelImpact,lastMile:lastMile,insertion:insertion};
  if(typeof module!=='undefined')module.exports=api;
  if(!root || !root.TripStore)return;
  var store=root.TripStore,data=store.data,node=document.getElementById('shandong-advisor-data');if(!node)return;
  var config=JSON.parse(node.textContent),routes=root.TripRoutes,openHotels=new Set(),openChecks=new Set();
  function poiLink(id){return '<button type="button" data-advisor-poi="'+esc(id)+'">'+esc(store.poiById[id].name)+'</button>';}
  function bind(el){el.querySelectorAll('[data-advisor-poi]').forEach(function(b){b.onclick=function(){root.dispatchEvent(new CustomEvent('trip:openpoi',{detail:b.dataset.advisorPoi}));};});el.querySelectorAll('img').forEach(function(img){img.onerror=function(){img.onerror=null;img.src='/assets/images/travel/shandong-2026/place-placeholder.svg';img.alt='图片暂不可用，资料插画';var caption=img.parentNode.querySelector('figcaption');if(caption)caption.textContent='原图暂不可用，已切换资料插画（非实拍）';};});}
  function metricText(m){return m.km+' km · 驾驶约 '+m.drive+' 分钟 · 全日约 '+Math.floor(m.total/60)+' 小时 '+m.total%60+' 分钟';}
  function disclaimer(){return '<p class="trip-advisor-disclaimer">以下为统一口径粗估：坐标直线距离 × 1.3，按长段 75 / 短段 30 km/h 估时，不是实际道路或未来路况。步行、排队及停车可能增加耗时。</p>';}
  function cards(ids,dayId){
    var state=store.getState(),route=routes.route(data,state,dayId),before=store.poiById[route[0]],after=store.poiById[route[route.length-1]];
    return ids.map(function(id){var p=store.poiById[id],g=p.guide||{},opt;
      Object.values(data.choice_groups).some(function(group){opt=group.options.find(function(o){return o.id===id;});return !!opt;});
      var detour=insertion(data,route,id),photo=p.photos&&p.photos[0];
      return '<article>'+(photo?'<figure><img loading="lazy" src="'+esc(photo.src)+'" alt="'+esc(photo.alt)+'"><figcaption>'+esc(photo.credit+' · '+photo.license)+' <a href="'+esc(photo.source||p.links.amap)+'" target="_blank" rel="noopener">图片来源</a></figcaption></figure>':'')+poiLink(id)+'<p>原资料价格参考：'+esc(p.price)+'（票种、实际报价待核验）</p><dl>'+[
        ['适合你们',g.why||g.fit||g.use_case||g.family_order||p.summary],
        ['不选的理由',opt&&opt.con||g.queue_plan||'营业、车位或宝宝状态不合适时保留备用'],
        ['带娃',p.baby.stroller+'；'+p.baby.meal],
        ['时间',p.type==='attraction'?'规划停留 '+(config.minutes[id]||90)+' 分钟；步行公里数待核实':p.duration],
        ['停车',p.parking.entrance+'；'+p.parking.fee],
        ['备用与取舍',g.backup||g.queue_plan||g.booking_check||g.fallback||'未核验具体备用，请在详情中复查'],
        ['绕行参考',p.type==='hotel'?'请看“我的方案”的整段住宿基地比较':detour==null?'当天无固定起终点':detour.existing?'已经在当前路线中':Math.round(detour.km)+' km：插在 '+store.poiById[detour.after].name+' → '+store.poiById[detour.before].name+' 之间（几何最省绕行，不保证符合饭点与开放时间）'],
        ['现场待确认',p.type==='restaurant'?'儿童椅、营业、排队、去刺少盐做法':p.type==='hotel'?'停车、电梯、早餐、床围、洗衣、取消条款':p.type==='charge'?'比亚迪 App 枪位、权益、停车费；不能由免费判断值得绕行':'推车入口、厕所、休息点和开放区域']
      ].map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd>';}).join('')+'</dl></article>';
    }).join('');
  }
  function renderEditor(parent,dayId){
    var state=store.getState(),section=document.createElement('section');section.className='trip-advisor';
    section.innerHTML='<h3>先选节奏，再选地点</h3><p>保留当前酒店与补能选择。三档是可编辑的规划建议，不保证营业、船班或午睡条件。</p>'+
      (config.presets[dayId]?'<div class="trip-advisor-actions">'+Object.keys(names).map(function(k){return '<button type="button" data-package="'+k+'">预览'+names[k]+'</button>';}).join('')+'</div><div data-package-preview aria-live="polite"></div>':'<p>今天以团圆、整备或跨城为主，不为凑满三档新增景点。请沿用当前安排，单独选择餐饮与补能。</p>')+
      '<details><summary>并排比较候选（含餐厅）</summary><label>候选类别<select data-advisor-group></select></label><div class="trip-advisor-grid" data-advisor-cards></div></details>';
    parent.insertBefore(section,parent.querySelector('.trip-choice-group')||parent.querySelector('.trip-route-order'));
    var plan=data.choice_plans[dayId],groups=plan?plan.groups.filter(function(k){return !/^food-/.test(k);}):[];
    var select=section.querySelector('select');select.innerHTML=groups.map(function(k){return '<option value="'+esc(k)+'">'+esc(data.choice_groups[k].title)+'</option>';}).join('')+'<option value="meals">午餐 / 晚餐（当天相关城市）</option>';
    function compare(){var ids;if(select.value==='meals'){
      var selected=routes.route(data,store.getState(),dayId),cities=new Set(selected.map(function(id){return store.poiById[id].city;}).filter(Boolean));
      ids=data.pois.filter(function(p){return p.type==='restaurant'&&(cities.has(p.city)||(p.days||[]).indexOf(dayId)>=0);}).map(function(p){return p.id;});
    }else ids=data.choice_groups[select.value].options.map(function(o){return o.id;}).filter(function(id){return store.poiById[id];});
      var box=section.querySelector('[data-advisor-cards]');box.innerHTML=ids.length?cards(ids,dayId):'<p>当天没有已核实的相关候选，可在两餐选择器查看全部餐厅。</p>';bind(box);
    }select.onchange=compare;compare();
    section.querySelectorAll('[data-package]').forEach(function(button){button.onclick=function(){
      var current=store.getState(),draft=packagePlan(data,current,dayId,button.dataset.package,config,routes),old=routes.route(data,current,dayId),m=estimate(data,draft.ids,draft.state.daySettings[dayId],config),base=estimate(data,old,current.daySettings[dayId]||{},config),box=section.querySelector('[data-package-preview]');
      var added=draft.ids.filter(function(id){return old.indexOf(id)<0;}),removed=old.filter(function(id){return draft.ids.indexOf(id)<0;});
      box.innerHTML='<h4>'+names[draft.level]+' · 采用前预览</h4><p>'+esc(draft.note)+'</p>'+disclaimer()+'<p>'+metricText(m)+'；相对当前 '+(m.km-base.km>=0?'+':'')+(m.km-base.km)+' km / '+(m.total-base.total>=0?'+':'')+(m.total-base.total)+' 分钟</p><p>增加：'+(added.map(poiLink).join(' ')||'无')+'<br>移除：'+(removed.map(poiLink).join(' ')||'无')+'</p><ol>'+draft.ids.map(function(id){return '<li>'+poiLink(id)+'</li>';}).join('')+'</ol><p>午睡预留：'+(draft.state.daySettings[dayId].napMinutes||0)+' 分钟（餐后休息预算，不代表已安排回房或具备睡眠条件）。主选两餐会替换，备用需重新指定；酒店、补能和其他日期的手动选择不变。费用以候选详情和已填写报价为准。</p>'+(m.total>600?'<p class="trip-advisor-warning">全日超过 10 小时，建议减项或改轻松版。</p>':'')+'<button type="button" data-adopt>确认采用'+names[draft.level]+'</button><button type="button" data-cancel>取消预览</button>';
      box.insertAdjacentHTML('afterbegin','<p>饭点预算：午餐不早于 11:30，晚餐不早于 17:00；不是营业保证或已预约。提前到达的等待时间计入全日估时。若存在已填预约，采用后请在下方试算检查冲突。</p>');
      bind(box);box.querySelector('[data-cancel]').onclick=function(){box.innerHTML='';};box.querySelector('[data-adopt]').onclick=function(){store.importState(draft.state);};
    };});
  }
  function renderHotels(parent){
    var el=document.createElement('section');el.className='trip-advisor';var state=store.getState();
    el.innerHTML='<h3>选住宿基地，而不只是选房间</h3><p>按当前已选景点、两餐和补能比较连续住宿，包含入住及退房换城日。更换酒店会同步相关日期，并重置这些天的手动排序；请先预览。</p>'+disclaimer();
    Object.keys(data.choice_groups).filter(function(k){return data.choice_groups[k].type==='酒店';}).forEach(function(groupId){
      var group=data.choice_groups[groupId],part=document.createElement('details');part.innerHTML='<summary>'+esc(group.title)+' · 两个基地对比</summary><div class="trip-advisor-grid"></div>';part.open=openHotels.has(groupId);part.ontoggle=function(){if(part.open)openHotels.add(groupId);else if(part.isConnected)openHotels.delete(groupId);};el.appendChild(part);
      group.options.forEach(function(o){var p=store.poiById[o.id],impact=hotelImpact(data,state,groupId,o.id,routes,config),article=document.createElement('article'),quote=state.hotelBudgets[o.id]||{},stays=root.TripHotels.stays(data,impact.state).filter(function(s){return s.id===o.id;}),nights=stays.reduce(function(n,s){return n+s.nights;},0);
        article.innerHTML=poiLink(p.id)+'<p>'+esc(o.pro)+'<br>取舍：'+esc(o.con)+'</p><p>'+nights+' 晚 · '+(Number.isFinite(quote.nightly)?'已填报价合计 ¥'+Math.round(quote.nightly*(quote.rooms||1)*nights):'报价待填，不能按 0 元比较')+'</p><p>关联日程总里程粗估 '+impact.km+' km（不是只算酒店距离）</p><ul>'+impact.rows.map(function(row){var attraction=row.ids.map(function(id){return store.poiById[id];}).find(function(v){return v.type==='attraction';});return '<li>'+esc(row.day.toUpperCase())+'：'+row.metric.km+' km；首个景点回房往返额外参考 '+(attraction?Math.round(km(p,attraction)*2)+' km':'当天无主景点')+'</li>';}).join('')+'</ul><p>'+esc(p.guide.nap_cost)+'；以上是位置比较，未承诺实际车程。是否回房午睡请结合当天预约决定。</p><details><summary>入住前确认清单（本机保存）</summary>'+['停车费及入口限高','车位到房间电梯及步行','早餐是否含两大一小','婴儿床与床围预留','无烟房及安静朝向','洗衣与烘干','免费取消截止与条款'].map(function(text,i){return '<label><input type="checkbox" data-hotel-check="'+i+'"'+((state.hotelChecks[p.id]||[]).indexOf(i)>=0?' checked':'')+'> '+text+' · 已向酒店确认</label>';}).join('')+'</details><button type="button" data-hotel-preview>预览更换影响</button><div data-hotel-confirm></div>';
        part.querySelector('.trip-advisor-grid').appendChild(article);bind(article);
        article.insertAdjacentHTML('beforeend','<details><summary>核对酒店到每日主景点</summary>'+impact.rows.map(function(row){var target=row.ids.map(function(id){return store.poiById[id];}).find(function(p){return p.type==='attraction';});if(!target)return '';return '<p>'+esc(row.day.toUpperCase())+'：'+esc(target.name)+'<br><a href="'+esc(root.TripPlanner.navLink(p,target))+'" target="_blank" rel="noopener">高德核对酒店 → 景点的实际路线</a></p>';}).join('')+'<p>这里只查询位置关系，不表示入住日已能提前进房，也不默认退房后可以回房午睡。</p></details>');
        var checks=article.querySelector('details');checks.open=openChecks.has(p.id);checks.ontoggle=function(){if(checks.open)openChecks.add(p.id);else if(checks.isConnected)openChecks.delete(p.id);};
        article.querySelectorAll('[data-hotel-check]').forEach(function(input){input.onchange=function(){var next=store.getState(),values=next.hotelChecks[p.id]||[],n=Number(input.dataset.hotelCheck);next.hotelChecks[p.id]=input.checked?Array.from(new Set(values.concat(n))):values.filter(function(v){return v!==n;});store.importState(next);};});
        article.querySelector('[data-hotel-preview]').onclick=function(){var box=article.querySelector('[data-hotel-confirm]');box.innerHTML='<p>将应用到 '+impact.rows.map(function(r){return r.day.toUpperCase();}).join('、')+'，保留各日景点、两餐和补能；相关手动顺序恢复推荐，完成记录保留。未核实的服务不能因选择酒店变成已确认。</p><button type="button">确认更换整段住宿</button>';box.querySelector('button').onclick=function(){store.importState(impact.state);};};
      });
    });parent.appendChild(el);
  }
  root.TripAdvisor=Object.assign(api,{renderEditor:renderEditor,renderHotels:renderHotels,lastMile:function(p){return lastMile(p,config);}});
})(typeof window!=='undefined'?window:null);
