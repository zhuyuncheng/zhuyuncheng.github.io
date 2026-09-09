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
        if (incoming.length) base.selections[groupId] = incoming;
      }
    });
    base.routeOrders = input.routeOrders && typeof input.routeOrders === 'object' ? input.routeOrders : {};
    base.dayModes = input.dayModes && typeof input.dayModes === 'object' ? input.dayModes : {};
    base.completedStops = input.completedStops && typeof input.completedStops === 'object' ? input.completedStops : {};
    base.updatedAt = input.updatedAt || base.updatedAt;
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
