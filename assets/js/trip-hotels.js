(function () {
  'use strict';
  function stays(data, state) {
    var hotels = {};
    data.pois.forEach(function(p) { if (p.type === 'hotel') hotels[p.id] = p; });
    var result = [];
    data.days.slice(0,-1).forEach(function(day, index) {
      var plan = data.choice_plans[day.id];
      var token = plan && plan.sequence[plan.sequence.length-1];
      var ids = token && token[0] === '@' ? state.selections[token.slice(1)] || [] : [token];
      var id = ids.find(function(key) { return hotels[key]; });
      if (!id) return;
      var last = result[result.length-1];
      if (last && last.id === id && last.checkout === day.date) {
        last.nights++; last.checkout = data.days[index+1].date; last.days.push(day.id);
      } else result.push({ id:id, checkin:day.date, checkout:data.days[index+1].date, nights:1, days:[day.id] });
    });
    result.forEach(function(stay) {
      var budget = (state.hotelBudgets || {})[stay.id] || {};
      stay.total = Number.isFinite(budget.nightly) ? Math.round(budget.nightly*(budget.rooms || 1)*stay.nights*100)/100 : null;
    });
    return result;
  }
  if (typeof module !== 'undefined') module.exports = { stays:stays };
  if (typeof window === 'undefined' || !window.TripStore) return;
  var store = window.TripStore;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function render(root) {
    var state = store.getState(), items = stays(store.data,state);
    var section = document.createElement('section');
    section.className = 'trip-audit trip-hotel-budget';
    var total = items.reduce(function(n,s) { return n+(s.total || 0); },0);
    var missing = items.filter(function(s){return s.total === null;}).length;
    section.innerHTML = '<h3>住宿安排与预算</h3><p>酒店 '+items.reduce(function(n,s){return n+s.nights;},0)+' 晚 · 已填写部分 ¥'+total.toLocaleString('zh-CN')+(missing ? ' · 还有 '+missing+' 段住宿未填价格' : ' · 全部酒店已填预算')+'</p><p>每晚价格请填写你查到的含税报价；早餐、停车等未包含费用另计。标记预订状态不会向酒店下单。</p>' +
      items.map(function(stay) {
        var poi = store.poiById[stay.id], budget = state.hotelBudgets[stay.id] || {};
        var groupId = Object.keys(store.data.choice_groups).find(function(key) { return store.data.choice_groups[key].type === '酒店' && store.data.choice_groups[key].options.some(function(o){return o.id===stay.id;}); });
        var group = store.data.choice_groups[groupId];
        return '<article><h4><button type="button" data-hotel-poi="'+esc(stay.id)+'">'+esc(poi.name)+'</button></h4><p>'+stay.checkin+' 入住 → '+stay.checkout+' 退房 · '+stay.nights+' 晚 · '+(stay.total===null ? '费用待填写' : '¥'+stay.total.toLocaleString('zh-CN'))+'</p>' +
          '<label>连住酒店 <select data-hotel-group="'+esc(groupId)+'">'+group.options.map(function(o){return '<option value="'+esc(o.id)+'"'+(o.id===stay.id?' selected':'')+'>'+esc(o.name)+'</option>';}).join('')+'</select></label>'+
          '<p>'+esc(poi.guide && poi.guide.nap_cost || poi.summary)+'</p><p>资料参考：'+esc(poi.price)+'，非实时房价</p>'+
          '<form data-hotel-budget="'+esc(stay.id)+'"><label>每间每晚 ¥ <input name="nightly" type="number" min="0" max="100000" step="0.01" placeholder="待填写" value="'+(budget.nightly == null ? '' : budget.nightly)+'"></label><label>房间数 <input name="rooms" type="number" min="1" max="10" required value="'+(budget.rooms || 1)+'"></label><label>预订状态 <select name="status">'+[['pending','待预订'],['booked','已预订'],['confirmed','已电话确认']].map(function(s){return '<option value="'+s[0]+'"'+((budget.status || 'pending')===s[0]?' selected':'')+'>'+s[1]+'</option>';}).join('')+'</select></label><button type="submit">保存住宿信息</button></form>'+
          '<p>相关日期 '+stay.days.map(function(dayId){return '<button type="button" data-hotel-day="'+dayId+'">'+esc(dayId.toUpperCase())+'</button>';}).join(' ')+'</p></article>';
      }).join('');
    root.querySelector('.trip-plan-stats').insertAdjacentElement('afterend',section);
    section.querySelectorAll('[data-hotel-budget]').forEach(function(form){form.onsubmit=function(e){e.preventDefault();var v=form.elements;store.setHotelBudget(form.dataset.hotelBudget,{nightly:v.nightly.value===''?null:Number(v.nightly.value),rooms:Number(v.rooms.value),status:v.status.value});};});
    section.querySelectorAll('[data-hotel-group]').forEach(function(select){select.onchange=function(){store.toggleChoice(select.dataset.hotelGroup,select.value);};});
    section.querySelectorAll('[data-hotel-poi]').forEach(function(button){button.onclick=function(){window.dispatchEvent(new CustomEvent('trip:openpoi',{detail:button.dataset.hotelPoi}));};});
    section.querySelectorAll('[data-hotel-day]').forEach(function(button){button.onclick=function(){window.TripPlanner.selectDay(button.dataset.hotelDay);window.TripPlanner.showView('journey');};});
  }
  window.TripHotels = { render:render, stays:stays };
})();
