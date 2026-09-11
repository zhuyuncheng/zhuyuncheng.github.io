(function(root) {
  'use strict';
  var categories={food:'餐饮',tickets:'门票',charge:'补能',parking:'停车',tolls:'高速',other:'其他'};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function budget(data,state,hotelStays){var total=0,missing=0;data.days.forEach(function(day){Object.keys(categories).forEach(function(key){var n=(state.expenses[day.id]||{})[key];if(Number.isFinite(n))total+=n;else missing++;});});hotelStays.forEach(function(stay){if(stay.total==null)missing++;else total+=stay.total;});return {total:Math.round(total*100)/100,missing:missing};}
  function icsText(s){return String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
  function calendar(data,state,routes){
    var lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Moulang//Trip 2026//ZH','CALSCALE:GREGORIAN'];
    function event(uid,title,time,end,description,allDay){
      lines.push('BEGIN:VEVENT','UID:'+uid+'@moulang-trip','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z'),'SUMMARY:'+icsText(title));
      if(allDay)lines.push('DTSTART;VALUE=DATE:'+time,'DTEND;VALUE=DATE:'+end);
      else lines.push('DTSTART:'+new Date(time+':00+08:00').toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z'));
      lines.push('DESCRIPTION:'+icsText(description));
      if(!allDay)lines.push('BEGIN:VALARM','TRIGGER:-PT60M','ACTION:DISPLAY','DESCRIPTION:'+icsText(title),'END:VALARM');
      lines.push('END:VEVENT');
    }
    data.days.forEach(function(day){
      var names=(routes[day.id]||[]).map(function(id){return data.pois.find(function(p){return p.id===id;}).name;});
      var next=new Date(day.date+'T00:00:00Z');next.setUTCDate(next.getUTCDate()+1);
      event(day.id,day.title,day.date.replace(/-/g,''),next.toISOString().slice(0,10).replace(/-/g,''),names.join(' → '),true);
      Object.keys(state.bookings[day.id]||{}).forEach(function(id){var poi=data.pois.find(function(p){return p.id===id;}),b=state.bookings[day.id][id];if(!poi || (routes[day.id]||[]).indexOf(id)<0)return;if(b.time)event(day.id+'-'+id+'-visit','预约：'+poi.name,b.time,null,poi.address,false);if(b.cancel)event(day.id+'-'+id+'-cancel','取消期限：'+poi.name,b.cancel,null,'请在平台核对取消条款；此提醒不会自动取消订单。',false);});
    });
    lines.push('END:VCALENDAR');
    return lines.map(function(line){var out='',length=0;Array.from(line).forEach(function(c){var bytes=unescape(encodeURIComponent(c)).length;if(length+bytes>70){out+='\r\n ';length=1;}out+=c;length+=bytes;});return out;}).join('\r\n')+'\r\n';
  }
  function offlineHTML(data,routes,images,state){
    state=state||{daySettings:{},bookings:{},expenses:{}};
    var seen=new Set();
    var days=data.days.map(function(day){return '<section><h2>'+esc(day.date+' '+day.title)+'</h2><p>出发：'+esc((state.daySettings[day.id]||{}).departure||day.start_time)+'</p><ol>'+(routes[day.id]||[]).map(function(id){seen.add(id);var p=data.pois.find(function(p){return p.id===id;}),b=(state.bookings[day.id]||{})[id]||{};return '<li><a href="#'+esc(id)+'">'+esc(p.name)+'</a>'+(b.time?' · 预约 '+esc(b.time):'')+(b.cancel?' · 取消截止 '+esc(b.cancel):'')+'</li>';}).join('')+'</ol><p>午睡：'+esc(day.nap)+'；雨天：'+esc(day.rain_plan)+'</p><p>已填费用：'+Object.keys(state.expenses[day.id]||{}).map(function(k){return esc(categories[k])+' ¥'+state.expenses[day.id][k];}).join('；')+'</p></section>';}).join('');
    var details=Array.from(seen).map(function(id){var p=data.pois.find(function(p){return p.id===id;}),photo=p.photos&&p.photos[0];return '<article id="'+esc(id)+'"><h2>'+esc(p.name)+'</h2>'+(images[id]?'<figure><img src="'+images[id]+'" alt="'+esc(photo.alt)+'"><figcaption>'+esc(photo.credit+' · '+photo.license)+'</figcaption></figure>':'<p>本地点图片未嵌入</p>')+'<p>'+esc(p.summary)+'</p><p>'+esc(p.address)+'</p><p>价格：'+esc(p.price)+'；营业：'+esc(p.hours)+'</p><p>停车：'+esc(p.parking.entrance)+' '+esc(p.parking.notes)+'</p><p>带娃：'+esc(p.baby.stroller)+' '+esc(p.baby.meal)+'</p>'+Object.keys(p.guide||{}).map(function(key){return '<p>'+esc(Array.isArray(p.guide[key])?p.guide[key].join('、'):p.guide[key])+'</p>';}).join('')+'<p><a href="https://uri.amap.com/marker?position='+p.route_target.lng+','+p.route_target.lat+'&amp;name='+encodeURIComponent(p.name)+'">联网后高德定位</a></p></article>';}).join('');
    return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山东半岛离线行程册</title><style>body{font:17px/1.7 system-ui;margin:20px auto;padding:0 16px;max-width:860px;color:#173b2b;background:#f6f8f5}section,article{padding:20px;margin:16px 0;background:white;border:1px solid #dde5dc;border-radius:14px;overflow-wrap:anywhere}img{max-width:100%;height:auto}figure{margin:0}a{color:#176747}figcaption{font-size:13px}@media print{article{break-inside:avoid}}</style><h1>山东半岛离线行程册</h1><p>这是当前选择的快照；修改后请重新下载。正文、图片及样式可离线阅读，地图导航需联网。</p>'+days+details+'</html>';
  }
  var api={budget:budget,calendar:calendar,offlineHTML:offlineHTML};
  if(typeof module!=='undefined')module.exports=api;
  if(!root || !root.TripStore)return;
  var store=root.TripStore, data=store.data, budgetDay=null;
  function saveFile(name,text,mime){var url=URL.createObjectURL(new Blob([text],{type:mime}));var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
  function routes(){var state=store.getState(),out={};data.days.forEach(function(d){out[d.id]=root.TripRoutes.route(data,state,d.id);});return out;}
  function poiButton(id){return id?'<button type="button" data-ex-poi="'+esc(id)+'">查看 '+esc(store.poiById[id].name)+'</button>':'';}
  function bindPois(el){el.querySelectorAll('[data-ex-poi]').forEach(function(b){b.onclick=function(){window.dispatchEvent(new CustomEvent('trip:openpoi',{detail:b.dataset.exPoi}));};});}
  function mealDefaults(dayId){var state=store.getState();if(state.meals[dayId])return state.meals[dayId];var route=root.TripRoutes.route(data,state,dayId),food=route.find(function(id){return store.poiById[id].type==='restaurant';});return {lunch:{primary:food,after:food?route[Math.max(0,route.indexOf(food)-1)]:route[0]},dinner:{}};}
  function renderMeals(parent,dayId){
    var state=store.getState(),route=root.TripRoutes.route(data,state,dayId);if(route.length<2)return;
    var meals=mealDefaults(dayId),section=document.createElement('section');section.className='trip-execution';
    var anchors=route.slice(0,-1).filter(function(id){return store.poiById[id].type!=='restaurant';});
    if(!meals.dinner.after)meals.dinner.after=anchors[anchors.length-1];
    var citySet=new Set(route.map(function(id){return store.poiById[id].city;}));
    var restaurants=data.pois.filter(function(p){return p.type==='restaurant';}).sort(function(a,b){return Number(citySet.has(b.city))-Number(citySet.has(a.city));});
    function options(value){return '<option value="">不安排 / 自行解决</option>'+restaurants.map(function(p){return '<option value="'+p.id+'"'+(p.id===value?' selected':'')+'>'+esc((p.city?p.city+' · ':'')+p.name)+'</option>';}).join('');}
    section.innerHTML='<h3>午餐与晚餐</h3><p>主选进入路线，备用不增加停靠点。保存后替代旧版餐厅选择，并恢复当天推荐顺序；可在下方调整顺序。</p><form>'+['lunch','dinner'].map(function(slot){var meal=meals[slot]||{};return '<fieldset><legend>'+(slot==='lunch'?'午餐':'晚餐')+'</legend><label>主选<select name="'+slot+'">'+options(meal.primary)+'</select></label><label>备用<select name="'+slot+'Backup">'+options(meal.backup)+'</select></label><label>安排在哪站之后<select name="'+slot+'After">'+route.slice(0,-1).filter(function(id,i,a){return store.poiById[id].type!=='restaurant' && a.indexOf(id)===i;}).map(function(id){return '<option value="'+id+'"'+(id===(meal.after|| (slot==='dinner'?route[route.length-2]:route[0]))?' selected':'')+'>'+esc(store.poiById[id].name)+'</option>';}).join('')+'</select></label>'+poiButton(meal.primary)+poiButton(meal.backup)+(meal.primary?'<p>'+esc(store.poiById[meal.primary].price)+' · '+esc(store.poiById[meal.primary].guide.family_order)+'<br>营业与儿童椅信息请在详情中复核。</p>':'')+(meal.backup?'<button type="button" data-use-backup="'+slot+'">排队太久，改用备用</button>':'')+'</fieldset>';}).join('')+'<button type="submit">保存两餐并更新路线</button></form>';
    parent.insertBefore(section,parent.querySelector('.trip-route-order'));
    section.querySelector('form').onsubmit=function(e){e.preventDefault();var f=e.currentTarget.elements,out={};['lunch','dinner'].forEach(function(slot){out[slot]={primary:f[slot].value,backup:f[slot+'Backup'].value,after:f[slot+'After'].value};});store.setExecution('meals',dayId,out);};
    section.querySelectorAll('[data-use-backup]').forEach(function(b){b.onclick=function(){var slot=b.dataset.useBackup,meal=meals[slot],old=meal.primary;meal.primary=meal.backup;meal.backup=old;store.setExecution('meals',dayId,meals);};});bindPois(section);
  }
  function renderBudget(parent){
    var state=store.getState(),hotelStays=root.TripHotels.stays(data,state),sum=budget(data,state,hotelStays),section=document.createElement('section');section.className='trip-execution';
    section.innerHTML='<h3>全程费用台账</h3><p>已填写合计 ¥'+sum.total.toLocaleString('zh-CN')+' · '+sum.missing+' 项待填</p><p>住宿来自上方报价，其余费用按每天两大一小的合计填写。没有花费请填 0；空白表示未知。</p><label>日期<select data-budget-day>'+data.days.map(function(d){return '<option value="'+d.id+'"'+(d.id===state.selectedDay?' selected':'')+'>'+esc(d.label+' '+d.title)+'</option>';}).join('')+'</select></label><form data-expense-form></form>';
    parent.querySelector('.trip-hotel-budget').insertAdjacentElement('afterend',section);
    function dayForm(id){var values=store.getState().expenses[id]||{},form=section.querySelector('form');form.innerHTML=Object.keys(categories).map(function(key){return '<label>'+categories[key]+' ¥<input name="'+key+'" type="number" min="0" max="100000" step="0.01" placeholder="待填写" value="'+(values[key]==null?'':values[key])+'"></label>';}).join('')+'<button type="submit">保存当天费用</button>';form.onsubmit=function(e){e.preventDefault();var out={};Object.keys(categories).forEach(function(k){if(form.elements[k].value!=='')out[k]=Number(form.elements[k].value);});store.setExecution('expenses',id,out);};}
    budgetDay=budgetDay||state.selectedDay;
    section.querySelector('select').value=budgetDay;
    section.querySelector('select').onchange=function(e){budgetDay=e.target.value;dayForm(budgetDay);};dayForm(budgetDay);
  }
  function renderToday(parent,dayId){
    var el=document.createElement('section');el.className='trip-execution';var meals=mealDefaults(dayId);
    el.innerHTML='<h3>随手工具</h3><button type="button" data-edit-ex>调整两餐 / 出发时间</button><label>停车位置备忘（仅本机）<input data-parking maxlength="300" placeholder="例如 B2，C 区，电梯 3 号口"></label><button type="button" data-save-parking>保存停车位置</button><p role="status" data-parking-status></p>'+['lunch','dinner'].map(function(slot){var meal=meals[slot]||{};return meal.backup?'<p>'+(slot==='lunch'?'午餐':'晚餐')+'备用：'+poiButton(meal.backup)+'<button type="button" data-today-backup="'+slot+'">启用备用</button></p>':'';}).join('');parent.appendChild(el);
    var key='trip-parking-'+dayId;try{el.querySelector('input').value=localStorage.getItem(key)||'';}catch(e){}
    el.querySelector('[data-save-parking]').onclick=function(){try{localStorage.setItem(key,el.querySelector('input').value);el.querySelector('[data-parking-status]').textContent='已保存，仅本机可见';}catch(e){el.querySelector('[data-parking-status]').textContent='浏览器不允许保存，请手动记录';}};
    el.querySelector('[data-edit-ex]').onclick=function(){root.TripPlanner.showView('journey');};
    el.querySelectorAll('[data-today-backup]').forEach(function(b){b.onclick=function(){var meal=meals[b.dataset.todayBackup],old=meal.primary;meal.primary=meal.backup;meal.backup=old;store.setExecution('meals',dayId,meals);};});bindPois(el);
  }
  async function downloadOffline(button){
    button.disabled=true;var snapshot=store.getState(),map=routes(),images={},ids=Array.from(new Set(Object.values(map).flat())),fail=0;
    try{
      for(var i=0;i<ids.length;i++){
        button.textContent='保存图片 '+(i+1)+' / '+ids.length;var p=store.poiById[ids[i]],photo=p.photos&&p.photos[0];if(!photo){fail++;continue;}
        var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},6000);
        try{var url=new URL(photo.src,location.href);if(url.origin!==location.origin)throw Error('非本地图片');var response=await fetch(url.href,{signal:controller.signal});if(!response.ok)throw Error('图片缺失');var blob=await response.blob();if(!blob.type.startsWith('image/'))throw Error('图片类型无效');images[p.id]=await new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=reject;reader.readAsDataURL(blob);});}catch(e){fail++;}finally{clearTimeout(timer);}
      }
      var credits='<section><h2>图片来源</h2>'+ids.filter(function(id){return images[id];}).map(function(id){var p=store.poiById[id],photo=p.photos[0];return '<p>'+esc(p.name)+' · '+esc(photo.credit)+' · '+esc(photo.license)+' · '+esc(photo.source||'本项目素材')+'</p>';}).join('')+'</section>';
      saveFile('山东半岛-离线行程册.html',offlineHTML(data,map,images,snapshot).replace('</html>',credits+'</html>'),'text/html;charset=utf-8');button.textContent=fail?'已下载，'+fail+' 张图片未嵌入（正文完整）':'离线行程册已下载';
    }catch(e){button.textContent='下载失败，请重试';}finally{button.disabled=false;}
  }
  function renderMore(parent){
    var old=parent.querySelector('[data-ex-tools]');if(old)old.remove();var el=document.createElement('section');el.dataset.exTools='';el.className='trip-execution';var state=store.getState();
    el.innerHTML='<h3>预订与行前工具</h3><p>此处仅记录计划，未填写默认待预订。更换候选后，旧记录保留但不加入当前日历。</p><button type="button" data-calendar>下载行程与预约日历</button><button type="button" data-offline>下载离线行程册（含图片）</button><p>日历时间按北京时间保存。离线行程册可脱网打开；修改选择后重新下载，实时地图需联网。</p><label>管理日期<select data-booking-day>'+data.days.map(function(d){return '<option value="'+d.id+'"'+(d.id===state.selectedDay?' selected':'')+'>'+esc(d.label+' '+d.title)+'</option>';}).join('')+'</select></label><div data-booking-list></div>';
    parent.appendChild(el);
    function bookingForm(dayId){
      var list=el.querySelector('[data-booking-list]'),current=store.getState(),ids=Array.from(new Set(root.TripRoutes.route(data,current,dayId))).filter(function(id){return ['attraction','restaurant','hotel'].indexOf(store.poiById[id].type)>=0;});
      ids.forEach(function(id){if(store.poiById[id].type==='hotel' && current.hotelBudgets[id]){current.bookings[dayId]=current.bookings[dayId]||{};current.bookings[dayId][id]=Object.assign({},current.bookings[dayId][id],{status:current.hotelBudgets[id].status});}});
      list.innerHTML=ids.length?ids.map(function(id){var b=(current.bookings[dayId]||{})[id]||{};return '<form data-booking="'+id+'"><h4>'+esc(store.poiById[id].name)+'</h4><label>状态<select name="status">'+[['pending','待预订'],['booked','已预订'],['confirmed','已确认']].map(function(s){return '<option value="'+s[0]+'"'+((b.status||'pending')===s[0]?' selected':'')+'>'+s[1]+'</option>';}).join('')+'</select></label><label>预约时间（北京时间）<input type="datetime-local" name="time" min="2026-01-01T00:00" max="2026-12-31T23:59" value="'+esc(b.time)+'"></label><label>免费取消截止（北京时间）<input type="datetime-local" name="cancel" min="2026-01-01T00:00" max="2026-12-31T23:59" value="'+esc(b.cancel)+'"></label><button type="submit">保存预约</button><span role="status"></span></form>';}).join(''):'<p>当天没有需要记录预订的已选地点。</p>';
      list.querySelectorAll('form').forEach(function(form){form.onsubmit=function(e){e.preventDefault();var values=Object.assign({},store.getState().bookings[dayId]),f=form.elements;values[form.dataset.booking]={status:f.status.value,time:f.time.value,cancel:f.cancel.value};var saved=store.setExecution('bookings',dayId,values);form.querySelector('[role=status]').textContent=saved?'已保存':'仅本次会话有效，请导出备份';};});
    }
    el.querySelector('[data-booking-day]').onchange=function(e){bookingForm(e.target.value);};bookingForm(state.selectedDay);
    el.querySelector('[data-calendar]').onclick=function(){saveFile('山东半岛行程.ics',calendar(data,store.getState(),routes()),'text/calendar;charset=utf-8');};
    el.querySelector('[data-offline]').onclick=function(){downloadOffline(this);};
  }
  root.TripExecution={renderMeals:renderMeals,renderBudget:renderBudget,renderToday:renderToday,renderMore:renderMore};
})(typeof window!=='undefined'?window:null);
