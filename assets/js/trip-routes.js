(function(root) {
  'use strict';
  function recommended(data, state, dayId) {
    var byId = Object.fromEntries(data.pois.map(function(p){return [p.id,p];}));
    var day = data.days.find(function(d){return d.id===dayId;});
    var plan = data.choice_plans[dayId];
    var result = [];
    if (!plan) result = day && day.route ? day.route.slice() : [];
    else plan.sequence.forEach(function(token) {
      if (token[0] !== '@') { if(byId[token]) result.push(token); return; }
      var groupId = token.slice(1), group = data.choice_groups[groupId];
      group.options.filter(function(o){return (state.selections[groupId] || []).indexOf(o.id || '__skip__')>=0 && byId[o.id];})
        .sort(function(a,b){return (a.route_priority || 0)-(b.route_priority || 0);}).forEach(function(o){result.push(o.id);});
    });
    var meals = state.meals && state.meals[dayId];
    if (!meals || result.length<2) return result;
    result = result.filter(function(id){return byId[id].type!=='restaurant';});
    ['dinner','lunch'].forEach(function(slot){
      var meal = meals[slot];
      if (!meal || !byId[meal.primary] || byId[meal.primary].type!=='restaurant') return;
      var at = result.indexOf(meal.after);
      if (at<0) at = slot==='dinner' ? result.length-2 : Math.min(1,result.length-2);
      result.splice(Math.min(at+1,result.length-1),0,meal.primary);
    });
    return result;
  }
  function route(data,state,dayId) {
    var rec = recommended(data,state,dayId), saved = state.routeOrders[dayId];
    if (!Array.isArray(saved) || saved.length<2 || saved[0]!==rec[0] || saved[saved.length-1]!==rec[rec.length-1]) return rec;
    var counts = {};
    rec.forEach(function(id){counts[id]=(counts[id]||0)+1;});
    return saved.every(function(id){if(!counts[id]) return false; counts[id]--;return true;}) ? saved.slice() : rec;
  }
  function stopKey(ids,index) { return ids[index]+'@'+ids.slice(0,index+1).filter(function(id){return id===ids[index];}).length; }
  function status(done,ids,index) { var key=stopKey(ids,index);return Object.prototype.hasOwnProperty.call(done,key)?done[key]:(ids.indexOf(ids[index])===index?done[ids[index]]:null); }
  var api={recommended:recommended,route:route,stopKey:stopKey,status:status};
  if(typeof module!=='undefined')module.exports=api;
  if(root)root.TripRoutes=api;
})(typeof window!=='undefined'?window:null);
