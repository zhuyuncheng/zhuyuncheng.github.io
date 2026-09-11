(function () {
  'use strict';

  var STORAGE_KEY = 'trip-plan-v3';
  var SCHEMA_VERSION = 3;
  var dataNode = document.getElementById('shandong-trip-data');
  if (!dataNode) return;

  var data;
  try {
    data = JSON.parse(dataNode.textContent);
  } catch (error) {
    document.documentElement.classList.add('trip-data-error');
    return;
  }

  var poiById = {};
  (data.pois || []).forEach(function (poi) { poiById[poi.id] = poi; });

  function optionKey(option) {
    return option && option.id ? option.id : '__skip__';
  }

  function initialSelections() {
    var result = {};
    Object.keys(data.choice_groups || {}).forEach(function (groupId) {
      var group = data.choice_groups[groupId];
      result[groupId] = data.defaults && Array.isArray(data.defaults[groupId])
        ? data.defaults[groupId].slice()
        : (group.options && group.options.length ? [optionKey(group.options[0])] : []);
    });
    return result;
  }

  function tripDayForNow() {
    var formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    var today = formatter.format(new Date());
    var match = (data.days || []).find(function (day) { return (day.date || day.iso_date) === today; });
    return match ? match.id : null;
  }

  function defaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      tripId: data.trip.id,
      selectedDay: tripDayForNow() || 'd1',
      selections: initialSelections(),
      routeOrders: {},
      dayModes: {},
      completedStops: {},
      daySettings: {},
      hotelBudgets: {},
      meals: {},
      expenses: {},
      bookings: {},
      updatedAt: new Date().toISOString()
    };
  }

  function safeRead(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function migrateV2(base) {
    Object.keys(data.choice_groups || {}).forEach(function (groupId) {
      var legacy = safeRead('trip-choice-v2-' + groupId);
      if (!legacy) return;
      try {
        var parsed = JSON.parse(legacy);
        base.selections[groupId] = Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        base.selections[groupId] = [legacy];
      }
    });
    return base;
  }

  function normalize(input) {
    var base = defaultState();
    if (!input || input.tripId !== data.trip.id) return migrateV2(base);
    base.selectedDay = (data.days || []).some(function (day) { return day.id === input.selectedDay; }) ? input.selectedDay : base.selectedDay;
    Object.keys(base.selections).forEach(function (groupId) {
      var group = data.choice_groups[groupId];
      var valid = (group.options || []).map(optionKey);
      var incoming = input.selections && input.selections[groupId];
      if (Array.isArray(incoming)) {
        incoming = incoming.filter(function (key) { return valid.indexOf(key) > -1; });
        incoming = incoming.filter(function(key,index) { return incoming.indexOf(key) === index; });
        if (group.type === '酒店') incoming = incoming.slice(0,1);
        if (incoming.length) base.selections[groupId] = incoming;
      }
    });
    base.routeOrders = input.routeOrders && typeof input.routeOrders === 'object' ? input.routeOrders : {};
    base.dayModes = input.dayModes && typeof input.dayModes === 'object' ? input.dayModes : {};
    base.completedStops = input.completedStops && typeof input.completedStops === 'object' ? input.completedStops : {};
    base.updatedAt = input.updatedAt || base.updatedAt;
    (data.days || []).forEach(function(day) {
      var meals = input.meals && input.meals[day.id];
      if (meals && typeof meals==='object') {
        base.meals[day.id]={};
        ['lunch','dinner'].forEach(function(slot){
          var v=meals[slot] || {}, out={};
          ['primary','backup'].forEach(function(key){if(poiById[v[key]] && poiById[v[key]].type==='restaurant')out[key]=v[key];});
          if(poiById[v.after])out.after=v.after;
          base.meals[day.id][slot]=out;
        });
      }
      var expenses=input.expenses && input.expenses[day.id];
      if(expenses && typeof expenses==='object') {
        base.expenses[day.id]={};
        ['food','tickets','charge','parking','tolls','other'].forEach(function(key){var n=expenses[key];if(Number.isFinite(n)&&n>=0&&n<=100000)base.expenses[day.id][key]=n;});
      }
      var bookings=input.bookings && input.bookings[day.id];
      if(bookings && typeof bookings==='object') {
        base.bookings[day.id]={};
        Object.keys(bookings).forEach(function(id){
          if(!poiById[id] || !bookings[id] || typeof bookings[id]!=='object')return;
          var v=bookings[id], out={status:'pending'};
          if(['pending','booked','confirmed'].indexOf(v.status)>=0)out.status=v.status;
          ['time','cancel'].forEach(function(key){if(typeof v[key]==='string' && /^2026-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v[key]) && !isNaN(Date.parse(v[key]+':00+08:00')))out[key]=v[key];});
          base.bookings[day.id][id]=out;
        });
      }
    });
    Object.keys(input.hotelBudgets || {}).forEach(function (id) {
      if (!poiById[id] || poiById[id].type !== 'hotel') return;
      var entry = input.hotelBudgets[id];
      if (!entry || typeof entry !== 'object') return;
      var normalized = { rooms:1, status:'pending' };
      if (Number.isFinite(entry.nightly) && entry.nightly >= 0 && entry.nightly <= 100000) normalized.nightly = entry.nightly;
      if (Number.isInteger(entry.rooms) && entry.rooms >= 1 && entry.rooms <= 10) normalized.rooms = entry.rooms;
      if (['pending','booked','confirmed'].indexOf(entry.status) >= 0) normalized.status = entry.status;
      base.hotelBudgets[id] = normalized;
    });
    Object.keys(input.daySettings || {}).forEach(function (id) {
      if (!(data.days || []).some(function (day) { return day.id === id; })) return;
      var value = input.daySettings[id];
      if (!value || typeof value !== 'object') return;
      base.daySettings[id] = {};
      base.daySettings[id].stays = {};
      Object.keys(value.stays || {}).forEach(function (poiId) {
        var minutes = value.stays[poiId];
        if (poiById[poiId] && Number.isFinite(minutes) && minutes >= 0 && minutes <= 720) base.daySettings[id].stays[poiId] = minutes;
      });
      if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value.departure || '')) base.daySettings[id].departure = value.departure;
      ['soc', 'target'].forEach(function (key) {
        if (Number.isFinite(value[key]) && value[key] >= 0 && value[key] <= 100) base.daySettings[id][key] = value[key];
      });
    });
    return base;
  }

  function readSharedState() {
    var hash = location.hash.replace(/^#/, '');
    if (hash.indexOf('plan=') !== 0) return null;
    try {
      var encoded = hash.slice(5).replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(Array.prototype.map.call(atob(encoded), function (char) {
        return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  var stored;
  try { stored = JSON.parse(safeRead(STORAGE_KEY) || 'null'); } catch (error) { stored = null; }
  var shared = readSharedState();
  var state = normalize(shared || stored);

  function emit(reason) {
    state.updatedAt = new Date().toISOString();
    var saved = safeWrite(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('trip:statechange', {
      detail: { reason: reason || 'update', state: getState(), saved: saved }
    }));
    return saved;
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  function groupSelections(groupId) {
    var group = data.choice_groups[groupId];
    if (!group) return [];
    var keys = state.selections[groupId] || [];
    return keys.map(function (key) {
      return group.options.find(function (option) { return optionKey(option) === key; });
    }).filter(Boolean);
  }

  function setSelectedDay(dayId) {
    state.selectedDay = dayId;
    emit('day');
  }

  function setDaySettings(dayId, settings) {
    var next = getState();
    next.daySettings[dayId] = settings;
    state = normalize(next);
    emit('day-settings');
  }

  function setHotelBudget(id, budget) {
    var next = getState();
    next.hotelBudgets[id] = budget;
    Object.keys(next.bookings).forEach(function(dayId){
      if(next.bookings[dayId][id])next.bookings[dayId][id].status=budget.status;
    });
    state = normalize(next);
    emit('hotel-budget');
  }

  function setExecution(field,dayId,value) {
    if(['meals','expenses','bookings'].indexOf(field)<0)return;
    var next=getState();next[field][dayId]=value;
    if(field==='bookings')Object.keys(value || {}).forEach(function(id){
      if(poiById[id] && poiById[id].type==='hotel' && value[id])next.hotelBudgets[id]=Object.assign({},next.hotelBudgets[id],{status:value[id].status});
    });
    if(field==='meals')delete next.routeOrders[dayId];
    state=normalize(next);return emit(field);
  }

  function toggleChoice(groupId, key) {
    var group = data.choice_groups[groupId];
    if (!group) return;
    var isSingle = group.type === '酒店';
    var keys = (state.selections[groupId] || []).slice();
    if (isSingle || key === '__skip__') {
      keys = [key];
    } else {
      keys = keys.filter(function (item) { return item !== '__skip__'; });
      var index = keys.indexOf(key);
      if (index > -1) keys.splice(index, 1);
      else keys.push(key);
      if (!keys.length) keys = [optionKey(group.options[0])];
    }
    state.selections[groupId] = keys;
    Object.keys(data.choice_plans || {}).forEach(function (dayId) {
      if (data.choice_plans[dayId].groups.indexOf(groupId) >= 0 || data.choice_plans[dayId].sequence.indexOf('@' + groupId) >= 0) delete state.routeOrders[dayId];
    });
    delete state.routeOrders[state.selectedDay];
    emit('choice');
  }

  function setRouteOrder(dayId, ids) {
    state.routeOrders[dayId] = ids.slice();
    emit('route-order');
  }

  function setDayMode(dayId, mode) {
    state.dayModes[dayId] = mode;
    emit('mode');
  }

  function setStopStatus(dayId, stopId, status) {
    if (!state.completedStops[dayId]) state.completedStops[dayId] = {};
    state.completedStops[dayId][stopId] = status;
    emit('stop-status');
  }

  function reset() {
    state = defaultState();
    safeWrite(STORAGE_KEY, JSON.stringify(state));
    emit('reset');
  }

  function publicState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      tripId: data.trip.id,
      selectedDay: state.selectedDay,
      selections: state.selections,
      routeOrders: state.routeOrders,
      dayModes: state.dayModes,
      completedStops: state.completedStops,
      daySettings: state.daySettings,
      hotelBudgets: state.hotelBudgets,
      meals: state.meals,
      expenses: state.expenses,
      bookings: state.bookings,
      updatedAt: state.updatedAt
    };
  }

  function download() {
    var blob = new Blob([JSON.stringify(publicState(), null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'shandong-trip-plan-2026.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function importState(input) {
    if (!input || input.tripId !== data.trip.id) throw new Error('这不是山东半岛 2026 行程配置');
    if (input.schemaVersion && input.schemaVersion > SCHEMA_VERSION) throw new Error('方案版本高于当前页面，请先更新页面');
    state = normalize(input);
    emit('import');
  }

  function shareUrl() {
    var json = encodeURIComponent(JSON.stringify(publicState())).replace(/%([0-9A-F]{2})/g, function (_, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
    var encoded = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return location.origin + location.pathname + '#plan=' + encoded;
  }

  window.TripStore = {
    data: data,
    poiById: poiById,
    getState: getState,
    groupSelections: groupSelections,
    optionKey: optionKey,
    setSelectedDay: setSelectedDay,
    setDaySettings: setDaySettings,
    setHotelBudget: setHotelBudget,
    setExecution: setExecution,
    toggleChoice: toggleChoice,
    setRouteOrder: setRouteOrder,
    setDayMode: setDayMode,
    setStopStatus: setStopStatus,
    reset: reset,
    download: download,
    importState: importState,
    shareUrl: shareUrl,
    currentTripDay: tripDayForNow
  };
})();
