(function () {
  'use strict';
  function distance(a, b) {
    var rad = Math.PI / 180;
    var x = Math.sin((b.lat - a.lat) * rad / 2);
    var y = Math.sin((b.lng - a.lng) * rad / 2);
    return 12742 * Math.asin(Math.min(1, Math.sqrt(x*x + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*y*y)));
  }
  function clock(minutes) {
    return (minutes >= 1440 ? '次日 ' : '') + String(Math.floor(minutes / 60) % 24).padStart(2, '0') + ':' + String(Math.round(minutes % 60)).padStart(2, '0');
  }
  function simulate(pois, settings, metric, exactLegs) {
    var start = (settings.departure || '08:00').split(':');
    var time = Number(start[0])*60 + Number(start[1]);
    var low = settings.soc == null ? 90 : settings.soc;
    var high = low;
    var legs = pois.slice(1).map(function (p, i) { return distance(pois[i].route_target || pois[i].location, p.route_target || p.location)*1.3; });
    var sum = legs.reduce(function (a,b) { return a+b; }, 0);
    var total = metric ? metric.distanceKm : sum;
    var rows = [];
    var calculatedKm = 0;
    pois.forEach(function (poi, i) {
      var km = i ? (sum ? legs[i-1]/sum*total : 0) : 0;
      var drive = i ? (metric && sum ? legs[i-1]/sum*metric.durationSeconds/60 : km/(km > 60 ? 75 : 30)*60) : 0;
      var exact = i && exactLegs && exactLegs[i-1];
      if (exact) { km = exact.distanceKm; drive = exact.durationSeconds/60; }
      calculatedKm += km;
      time += drive;
      low -= km/400*100; high -= km/550*100;
      var arrivalRaw=time;
      var appointment=settings.appointments && settings.appointments[poi.id];
      if(i && Number.isFinite(appointment))time=Math.max(time,appointment);
      var stay = i === 0 || i === pois.length-1 ? 0 : ({ attraction:90, restaurant:60, charge:40, hotel:0, anchor:0 }[poi.type] || 30);
      if (i > 0 && i < pois.length-1 && settings.stays && Number.isFinite(settings.stays[poi.id])) stay = settings.stays[poi.id];
      var row = { id:poi.id, arrival:Math.round(time), low:low, high:high, km:km, stay:stay, exact:Boolean(exact),late:i&&Number.isFinite(appointment)?Math.max(0,Math.round(arrivalRaw-appointment)):0 };
      if (i && poi.type === 'charge') {
        low = Math.max(low, settings.target == null ? 80 : settings.target);
        high = Math.max(high, low);
      }
      time += stay + (stay && poi.type !== 'charge' ? 15 : 0);
      row.leave = Math.round(time);
      rows.push(row);
    });
    return { rows:rows, km:calculatedKm, end:Math.round(time), low:low, high:high };
  }
  if (typeof module !== 'undefined') module.exports = { simulate:simulate, clock:clock };
  if (typeof window === 'undefined' || !window.TripStore || !window.TripPlanner) return;
  var store = window.TripStore;
  var metrics = {};
  var legMetrics = {};
  function esc(s) { return String(s).replace(/[&<>"']/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function render() {
    var editor = document.getElementById('trip-day-editor');
    if (!editor) return;
    var previous = editor.querySelector('[data-simulation]');
    if (previous) previous.remove();
    var state = store.getState(), id = state.selectedDay;
    var day = store.data.days.find(function(d) { return d.id === id; });
    var ids = window.TripPlanner.routeForDay(id);
    var pois = ids.map(function(p) { return store.poiById[p]; }).filter(Boolean);
    var settings = Object.assign({ departure:day.start_time || '08:00', soc:90, target:80 }, state.daySettings[id]);
    settings.appointments={};
    Object.keys(state.bookings[id]||{}).forEach(function(key){var time=state.bookings[id][key].time;if(time && time.slice(0,10)===day.date){var parts=time.slice(11).split(':');settings.appointments[key]=Number(parts[0])*60+Number(parts[1]);}});
    var metric = metrics[JSON.stringify([id, ids])];
    var result = simulate(pois, settings, metric, legMetrics[JSON.stringify([id, ids])]);
    var section = document.createElement('section');
    section.className = 'trip-route-order trip-simulation'; section.dataset.simulation = '';
    section.innerHTML = '<h3>当天行程试算</h3><p>调整出发时间和电量，查看到达顺序与补能余量。</p>' +
      '<form style="display:flex;flex-wrap:wrap;gap:12px"><label>出发时间 <input name="departure" type="time" required value="'+esc(settings.departure)+'"></label>' +
      '<label>出发电量 % <input style="width:65px" name="soc" type="number" min="0" max="100" required value="'+settings.soc+'"></label>' +
      '<label>补能目标 % <input style="width:65px" name="target" type="number" min="0" max="100" required value="'+settings.target+'"></label><button type="submit">更新试算</button></form>' +
      '<p>'+ (metric ? '已接入高德结果；每站标明分段算路或粗估。到达时间包含停留预算，不代表未来实时路况。' : '尚无该路线高德结果：里程按直线距离 × 1.3 粗估，不能作为导航依据。') +'</p>' +
      '<p>预计 '+Math.round(result.km)+' km · '+clock(result.end)+' 到达终点</p>' +
      result.rows.map(function(row, i) {
        var risk = row.low < 20 ? ' · 电量可能低于 20%，优先安排补能' : '';
        if(row.late)risk+=' · 预计晚于预约 '+row.late+' 分钟';
        var nap = pois[i].type === 'attraction' && row.arrival < 870 && row.leave > 750 ? ' · 与 12:30–14:30 午睡重叠' : '';
        return '<div class="trip-simulation-stop"><button type="button" data-sim-poi="'+esc(row.id)+'">'+clock(row.arrival)+' '+esc(pois[i].name)+'</button><p><small>'+ (i ? (row.exact ? '高德分段' : '路段粗估')+' · '+Math.round(row.km)+' km · ' : '')+'到达电量估算 '+Math.round(row.low)+'–'+Math.round(row.high)+'%'+esc(risk+nap)+'</small></p>'+(i > 0 && i < pois.length-1 ? '<label>停留分钟 <input type="number" min="0" max="720" data-stay="'+esc(row.id)+'" value="'+row.stay+'"></label>' : '')+'</div>';
      }).join('') + '<small>按满电实际续航 400–550 km 试算；负值表示当前补能安排不可行。停留时长可修改，另加停车步行 15 分钟。补能后假设达到目标电量，需现场确认；已填写的当天预约时间参与排程，营业时间仍需核验。</small>';
    editor.appendChild(section);
    section.querySelector('form').onsubmit = function(event) {
      event.preventDefault();
      var form = event.currentTarget;
      store.setDaySettings(id, Object.assign({}, settings, { departure:form.elements.departure.value, soc:Number(form.elements.soc.value), target:Number(form.elements.target.value) }));
    };
    section.querySelectorAll('[data-stay]').forEach(function(input) {
      input.onchange = function() {
        if (!input.checkValidity() || input.value === '') return;
        settings.stays = Object.assign({}, settings.stays);
        settings.stays[input.dataset.stay] = Number(input.value);
        store.setDaySettings(id, settings);
      };
    });
    section.querySelectorAll('[data-sim-poi]').forEach(function(button) {
      button.onclick = function() { window.dispatchEvent(new CustomEvent('trip:openpoi', { detail:button.dataset.simPoi })); };
    });
    var plan = store.data.choice_plans[id];
    if (!plan) return;
    var compare = document.createElement('details');
    compare.innerHTML = '<summary>候选变化对比</summary><p>选择候选预览增减后的全天安排。两边均用同一粗估方法比较，不混用实时路线。采用后恢复当天推荐顺序。两餐在上方独立安排。</p><select aria-label="选择要比较的候选"><option value="">请选择候选</option>' + plan.groups.filter(function(g){return !/^food-/.test(g);}).map(function(groupId) {
      var group = store.data.choice_groups[groupId];
      return '<optgroup label="'+esc(group.title)+'">'+group.options.filter(function(o) { return o.id && store.poiById[o.id]; }).map(function(o) { return '<option value="'+esc(groupId+'|'+o.id)+'">'+esc(o.name)+'</option>'; }).join('')+'</optgroup>';
    }).join('')+'</select><div data-comparison aria-live="polite"></div>';
    section.appendChild(compare);
    compare.querySelector('select').onchange = function(event) {
      var panel = compare.querySelector('[data-comparison]');
      if (!event.target.value) { panel.innerHTML = ''; return; }
      var parts = event.target.value.split('|'), groupId = parts[0], poiId = parts[1];
      var selections = JSON.parse(JSON.stringify(state.selections));
      var chosen = (selections[groupId] || []).filter(function(key) { return key !== '__skip__'; });
      var group = store.data.choice_groups[groupId];
      var removing = chosen.indexOf(poiId) >= 0 && group.type !== '酒店';
      if (group.type === '酒店') chosen = [poiId];
      else if (removing) chosen = chosen.filter(function(key) { return key !== poiId; });
      else chosen.push(poiId);
      if (!chosen.length) chosen = [store.optionKey(group.options[0])];
      selections[groupId] = chosen;
      var draft = window.TripRoutes.recommended(store.data,Object.assign({},state,{selections:selections}),id);
      var baseline = simulate(pois, settings);
      var proposed = simulate(draft.map(function(key) { return store.poiById[key]; }), settings);
      function delta(n) { return (n >= 0 ? '+' : '')+Math.round(n); }
      var poi = store.poiById[poiId];
      panel.innerHTML = '<p>'+esc(removing ? '移除候选' : '采用候选')+'：'+esc(poi.name)+'</p><p>里程变化 '+delta(proposed.km-baseline.km)+' km · 终点到达变化 '+delta(proposed.end-baseline.end)+' 分钟</p><p>预计终点电量 '+Math.round(proposed.low)+'–'+Math.round(proposed.high)+'%</p><p>费用参考：'+esc(poi.price || '待确认')+'（尚未计入全程预算）</p><p>'+draft.map(function(key) { return esc(store.poiById[key].name); }).join(' → ')+'</p><button type="button">确认采用</button>';
      var apply=panel.querySelector('button');apply.onclick = function() { store.toggleChoice(groupId, poiId); };
      var check=document.createElement('button');check.type='button';check.textContent='用高德校核两条路线';panel.insertBefore(check,apply);
      var checkResult=document.createElement('p');checkResult.setAttribute('role','status');panel.insertBefore(checkResult,apply);
      check.onclick=async function(){
        check.disabled=true;checkResult.textContent='正在校核当前与候选路线…';
        try{
          var before=await window.TripMapPreview(ids,id),after=await window.TripMapPreview(draft,id);
          if(!panel.isConnected || compare.querySelector('select').value!==parts.join('|'))return;
          var proposedExact=simulate(draft.map(function(key){return store.poiById[key];}),settings,after);
          var baseExact=simulate(pois,settings,before);
          checkResult.textContent='高德校核：里程 '+delta(after.distanceKm-before.distanceKm)+' km；驾驶时间 '+delta((after.durationSeconds-before.durationSeconds)/60)+' 分钟；含停留到达变化 '+delta(proposedExact.end-baseExact.end)+' 分钟。'+(before.tolls!=null&&after.tolls!=null?'通行费差额 ¥'+delta(after.tolls-before.tolls):'通行费未返回。');
        }catch(error){checkResult.textContent='高德校核暂不可用，保留上方粗估与选择。';}finally{check.disabled=false;}
      };
    };
  }
  window.addEventListener('trip:statechange', render);
  window.addEventListener('trip:route-result', function(event) {
    if (event.detail.ids) metrics[JSON.stringify([event.detail.day, event.detail.ids])] = event.detail;
    render();
  });
  window.addEventListener('trip:route-start', function(event) {
    var key = JSON.stringify([event.detail.day, event.detail.ids]);
    delete metrics[key]; delete legMetrics[key]; render();
  });
  window.addEventListener('trip:leg-result', function(event) {
    var value = event.detail, key = JSON.stringify([value.day, value.ids]);
    if (!legMetrics[key]) legMetrics[key] = {};
    legMetrics[key][value.index] = value;
    render();
  });
  render();
})();
