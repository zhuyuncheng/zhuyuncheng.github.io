(function () {
  'use strict';

  if (!window.TripStore) return;
  var store = window.TripStore;
  var data = store.data;
  var poiById = store.poiById;
  var routeMetrics = {};
  var activeView = 'journey';
  var draggedIndex = null;
  var planCollapsed = false;

  var dayList = document.getElementById('trip-day-list');
  var editor = document.getElementById('trip-day-editor');
  var todayPanel = document.querySelector('[data-view-panel="today"]');
  var planPanel = document.querySelector('[data-view-panel="plan"]');
  var catalogPanel = document.querySelector('[data-view-panel="catalog"]');
  var morePanel = document.querySelector('[data-view-panel="more"]');

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function dayById(dayId) {
    return data.days.find(function (day) { return day.id === dayId; });
  }

  function selections(groupId) {
    return store.groupSelections(groupId);
  }

  function recommendedRoute(dayId) {
    var plan = data.choice_plans[dayId];
    if (!plan) {
      var day = dayById(dayId);
      return (day && day.route ? day.route : []).slice();
    }
    var result = [];
    plan.sequence.forEach(function (token) {
      if (token.charAt(0) !== '@') {
        result.push(token);
        return;
      }
      selections(token.slice(1)).slice().sort(function (a, b) {
        return (a.route_priority || 999) - (b.route_priority || 999);
      }).forEach(function (option) {
        if (option && option.id) result.push(option.id);
      });
    });
    return result;
  }

  function routeForDay(dayId) {
    var state = store.getState();
    var saved = state.routeOrders[dayId];
    var recommended = recommendedRoute(dayId);
    if (!Array.isArray(saved) || saved.length < 2) return recommended;
    // A saved route may intentionally omit optional stops. Keep it when every
    // saved stop still belongs to today's current selection and the locked
    // start/end anchors are unchanged.
    var allowed = recommended.reduce(function (counts, id) {
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {});
    var valid = saved.every(function (id) {
      if (!allowed[id]) return false;
      allowed[id] -= 1;
      return true;
    });
    valid = valid && saved[0] === recommended[0] && saved[saved.length - 1] === recommended[recommended.length - 1];
    return valid ? saved.slice() : recommended;
  }

  function routeNames(ids) {
    return ids.map(function (id) { return poiById[id] ? poiById[id].name : id; });
  }

  function navLink(from, to) {
    if (!from || !to) return '#';
    var a = from.route_target || from.location;
    var b = to.route_target || to.location;
    return 'https://uri.amap.com/navigation?from=' + a.lng + ',' + a.lat + ',' + encodeURIComponent(from.name) +
      '&to=' + b.lng + ',' + b.lat + ',' + encodeURIComponent(to.name) +
      '&mode=car&policy=1&src=moulang-blog&callnative=1';
  }

  function dispatchRoute(dayId, scroll) {
    window.dispatchEvent(new CustomEvent('trip:route', {
      detail: { day: dayId, ids: routeForDay(dayId), scroll: Boolean(scroll) }
    }));
  }

  function selectedDay() {
    return store.getState().selectedDay || 'd1';
  }

  function selectDay(dayId, shouldScroll) {
    store.setSelectedDay(dayId);
    if (shouldScroll && editor) editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showView(view) {
    activeView = view;
    document.querySelectorAll('[data-view-panel]').forEach(function (panel) {
      var selected = panel.dataset.viewPanel === view;
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
    });
    document.querySelectorAll('[data-view]').forEach(function (button) {
      button.classList.toggle('is-active', button.dataset.view === view);
      button.setAttribute('aria-current', button.dataset.view === view ? 'page' : 'false');
    });
    if (view === 'journey') setTimeout(function () { dispatchRoute(selectedDay()); }, 80);
    if (view === 'plan') renderPlan();
    if (view === 'today') renderToday();
    if (view === 'catalog') renderCatalog();
    if (view === 'more') renderMore();
  }

  function modeLabel(mode) {
    return { normal: '正常节奏', baby: '宝宝状态低', rain: '下雨', traffic: '严重拥堵' }[mode] || '正常节奏';
  }

  function renderDays() {
    var active = selectedDay();
    dayList.innerHTML = data.days.map(function (day) {
      return '<button type="button" data-select-day="' + day.id + '" class="' + (day.id === active ? 'is-active' : '') + '">' +
        '<small>' + escapeHtml(day.label) + ' · D' + day.index + '</small><strong>' + escapeHtml(day.title) + '</strong></button>';
    }).join('');
    dayList.querySelectorAll('[data-select-day]').forEach(function (button) {
      button.onclick = function () { selectDay(button.dataset.selectDay); };
    });
  }

  function optionHtml(groupId, group, option, selectedKeys) {
    var key = store.optionKey(option);
    var selected = selectedKeys.indexOf(key) > -1;
    var poi = option.id ? poiById[option.id] : null;
    return '<article class="trip-choice ' + (selected ? 'is-selected' : '') + '">' +
      '<button type="button" class="trip-choice__toggle" data-choice-group="' + groupId + '" data-choice-key="' + key + '" aria-pressed="' + selected + '">' +
      '<span class="trip-choice__check">' + (selected ? '✓' : '+') + '</span><b>' + escapeHtml(option.name) + '</b>' +
      '<small>' + escapeHtml(option.meta) + '</small><em>优 · ' + escapeHtml(option.pro) + '</em><i>劣 · ' + escapeHtml(option.con) + '</i></button>' +
      (poi ? '<button type="button" class="trip-choice__detail" data-poi="' + poi.id + '">查看详情</button>' : '') +
      '</article>';
  }

  function routeStopHtml(id, index, ids) {
    var poi = poiById[id];
    if (!poi) return '';
    var locked = index === 0 || index === ids.length - 1;
    return '<li draggable="' + (!locked) + '" data-route-index="' + index + '" class="' + (locked ? 'is-locked' : '') + '">' +
      '<span class="trip-stop__index">' + (index + 1) + '</span><button type="button" class="trip-stop__name" data-poi="' + id + '">' +
      '<small>' + escapeHtml(poi.type + (poi.time_constraint ? ' · ' + poi.time_constraint : '')) + '</small><b>' + escapeHtml(poi.name) + '</b></button>' +
      '<div class="trip-stop__actions">' +
      (locked ? '<span title="起终点锁定">锁定</span>' :
        '<button type="button" data-route-up="' + index + '" aria-label="上移">↑</button>' +
        '<button type="button" data-route-down="' + index + '" aria-label="下移">↓</button>' +
        '<button type="button" data-route-remove="' + index + '" aria-label="删除">×</button>') +
      '</div></li>';
  }

  function bindPoiButtons(root) {
    root.querySelectorAll('[data-poi]').forEach(function (button) {
      button.onclick = function (event) {
        event.stopPropagation();
        window.dispatchEvent(new CustomEvent('trip:openpoi', { detail: button.dataset.poi }));
      };
    });
  }

  function persistMovedRoute(ids, from, to) {
    if (from <= 0 || from >= ids.length - 1 || to <= 0 || to >= ids.length - 1 || from === to) return;
    var item = ids.splice(from, 1)[0];
    ids.splice(to, 0, item);
    store.setRouteOrder(selectedDay(), ids);
  }

  function bindRouteSorter(root, ids) {
    root.querySelectorAll('[data-route-up]').forEach(function (button) {
      button.onclick = function () { persistMovedRoute(ids.slice(), Number(button.dataset.routeUp), Number(button.dataset.routeUp) - 1); };
    });
    root.querySelectorAll('[data-route-down]').forEach(function (button) {
      button.onclick = function () { persistMovedRoute(ids.slice(), Number(button.dataset.routeDown), Number(button.dataset.routeDown) + 1); };
    });
    root.querySelectorAll('[data-route-remove]').forEach(function (button) {
      button.onclick = function () {
        var next = ids.slice();
        next.splice(Number(button.dataset.routeRemove), 1);
        store.setRouteOrder(selectedDay(), next);
      };
    });
    root.querySelectorAll('[data-route-index]').forEach(function (item) {
      item.ondragstart = function () { draggedIndex = Number(item.dataset.routeIndex); item.classList.add('is-dragging'); };
      item.ondragend = function () { draggedIndex = null; item.classList.remove('is-dragging'); };
      item.ondragover = function (event) { if (draggedIndex != null) event.preventDefault(); };
      item.ondrop = function (event) {
        event.preventDefault();
        persistMovedRoute(ids.slice(), draggedIndex, Number(item.dataset.routeIndex));
      };
    });
    var reset = root.querySelector('[data-reset-route]');
    if (reset) reset.onclick = function () { store.setRouteOrder(selectedDay(), recommendedRoute(selectedDay())); };
    var build = root.querySelector('[data-build-route]');
    if (build) build.onclick = function () { dispatchRoute(selectedDay(), true); };
  }

  function renderEditor() {
    var day = dayById(selectedDay());
    if (!day) return;
    var state = store.getState();
    var plan = data.choice_plans[day.id];
    var mode = state.dayModes[day.id] || 'normal';
    var ids = routeForDay(day.id);
    var groups = plan ? plan.groups.map(function (groupId) {
      var group = data.choice_groups[groupId];
      var selectedKeys = state.selections[groupId] || [];
      return '<section class="trip-choice-group"><header><span>' + escapeHtml(group.type) + '</span><div><h3>' + escapeHtml(group.title) +
        '</h3><small>' + (group.type === '酒店' ? '单选 · 连住自动沿用' : '可多选 · 系统按推荐顺序编排') + '</small></div></header>' +
        '<div>' + group.options.map(function (option) { return optionHtml(groupId, group, option, selectedKeys); }).join('') + '</div></section>';
    }).join('') : '<div class="trip-empty">今天以团聚和休整为主，不需要复杂路线选择。</div>';

    editor.innerHTML = '<header class="trip-day-head"><div><p>DAY ' + String(day.index).padStart(2, '0') + ' · ' + escapeHtml(day.label) +
      '</p><h2>' + escapeHtml(day.title) + '</h2><span>' + escapeHtml(day.distance) + ' · ' + escapeHtml(day.base) + '</span></div><b>' + day.index + '<small>/14</small></b></header>' +
      '<div class="trip-modes"><span>今天的状态</span>' +
      [['normal','正常节奏'],['baby','宝宝状态低'],['rain','下雨'],['traffic','严重拥堵']].map(function (entry) {
        return '<button type="button" data-mode="' + entry[0] + '" class="' + (mode === entry[0] ? 'is-active' : '') + '">' + entry[1] + '</button>';
      }).join('') + '</div>' +
      (mode === 'rain' ? '<aside class="trip-alert"><b>雨天替代</b><p>' + escapeHtml(day.rain_plan) + '</p></aside>' : '') +
      (mode === 'baby' ? '<aside class="trip-alert"><b>宝宝状态低</b><p>只保留第一项主任务和午睡，下午候选全部视为可删项。</p></aside>' : '') +
      (mode === 'traffic' ? '<aside class="trip-alert"><b>严重拥堵</b><p>优先删除跨城绕行点，餐厅改选酒店 3 km 内，补能以顺路高速站为先。</p></aside>' : '') +
      groups +
      '<section class="trip-route-order"><header><div><small>ROUTE ORDER</small><h3>当天途经顺序</h3></div><button type="button" data-reset-route>恢复推荐</button></header>' +
      '<ol>' + ids.map(function (id, index) { return routeStopHtml(id, index, ids); }).join('') + '</ol>' +
      '<button type="button" class="trip-primary" data-build-route>按这个顺序规划精确路线</button></section>' +
      '<details class="trip-timeline"><summary>建议时间表 <small>午睡 ' + escapeHtml(day.nap) + '</small></summary>' +
      day.timeline.map(function (item) { return '<article><time>' + escapeHtml(item.time) + '</time><div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.detail) + '</p></div></article>'; }).join('') + '</details>' +
      '<details class="trip-day-notes"><summary>吃饭、停车与风险</summary><h3>吃什么</h3><p>' + escapeHtml(day.food_note) + '</p><h3>开车与停车</h3><p>' + escapeHtml(day.drive_note) + '</p></details>';

    editor.querySelectorAll('[data-choice-group]').forEach(function (button) {
      button.onclick = function () { store.toggleChoice(button.dataset.choiceGroup, button.dataset.choiceKey); };
    });
    editor.querySelectorAll('[data-mode]').forEach(function (button) {
      button.onclick = function () { store.setDayMode(day.id, button.dataset.mode); };
    });
    bindPoiButtons(editor);
    bindRouteSorter(editor, ids);
    dispatchRoute(day.id);
  }

  function planChecks(day, ids) {
    var warnings = [];
    var attractions = ids.filter(function (id) { return poiById[id] && poiById[id].type === 'attraction'; });
    if (ids.length > 7) warnings.push(['high', '停靠点较多，可能挤压午睡']);
    if (attractions.length > 3) warnings.push(['high', '当天超过 3 个景点，建议删除一个']);
    if (attractions.length && !ids.some(function (id) { return poiById[id] && poiById[id].type === 'restaurant'; })) warnings.push(['note', '有游玩安排但尚未落定具体餐厅']);
    if (/刘公岛/.test(routeNames(ids).join(''))) warnings.push(['note', '登岛受船班与海风影响，前夜复核']);
    if (/520|580/.test(day.distance) && !ids.some(function (id) { return poiById[id] && poiById[id].type === 'charge'; })) warnings.push(['high', '长途驾驶日尚未选择补能点']);
    if (ids.some(function (id) { var p = poiById[id]; return p && (!p.parking || !p.parking.entrance); })) warnings.push(['note', '有地点缺少停车入口']);
    if (ids.some(function (id) { var p = poiById[id]; return p && /出发前|当日|以现场/.test([p.hours, p.price, p.verified_at].join('')); })) warnings.push(['note', '营业、票价或停车需在出发前再次确认']);
    return warnings;
  }

  function renderPlan() {
    var totalKm = 0;
    var chargeCount = 0;
    var allWarnings = [];
    var cards = data.days.map(function (day) {
      var ids = routeForDay(day.id);
      var metric = routeMetrics[day.id];
      if (metric) totalKm += metric.distanceKm || 0;
      else {
        var match = day.distance.match(/\d+/);
        if (match) totalKm += Number(match[0]);
      }
      chargeCount += ids.filter(function (id) { return poiById[id] && poiById[id].type === 'charge'; }).length;
      var warnings = planChecks(day, ids);
      warnings.forEach(function (warning) { allWarnings.push([day.label, warning[0], warning[1]]); });
      return '<article class="trip-plan-day"><header><div><small>' + escapeHtml(day.label) + ' · D' + day.index + '</small><h3>' + escapeHtml(day.title) +
        '</h3></div><span>' + escapeHtml(metric ? metric.distanceKm.toFixed(1) + ' km · ' + metric.durationText : day.distance) + '</span></header>' +
        '<ol>' + ids.map(function (id, index) { var poi = poiById[id]; return poi ? '<li><i>' + (index + 1) + '</i><button type="button" data-poi="' + id + '">' + escapeHtml(poi.name) + '</button></li>' : ''; }).join('') + '</ol>' +
        (warnings.length ? '<div class="trip-plan-warnings">' + warnings.map(function (warning) { return '<span class="' + warning[0] + '">' + escapeHtml(warning[2]) + '</span>'; }).join('') + '</div>' : '') +
        '<footer><button type="button" data-edit-day="' + day.id + '">编辑当天</button><button type="button" data-map-day="' + day.id + '">查看地图</button></footer></article>';
    }).join('');
    planPanel.innerHTML = '<header class="trip-view-head"><div><p>MY FINAL PLAN</p><h2>我的最终方案</h2><span>选择、顺序与完成状态都保存在当前浏览器</span></div><div class="trip-plan-actions">' +
      '<button type="button" data-plan-action="reset">恢复推荐</button><button type="button" data-plan-action="export">导出 JSON</button><button type="button" data-plan-action="import">导入 JSON</button>' +
      '<button type="button" data-plan-action="share">复制分享链接</button><button type="button" data-plan-action="toggle">' + (planCollapsed ? '展开全部日期' : '收起全部日期') + '</button><button type="button" data-plan-action="print">打印</button></div></header>' +
      '<div class="trip-plan-stats"><span><small>行程</small><b>14 天 / 13 晚</b></span><span><small>当前估算里程</small><b>' + Math.round(totalKm) + ' km</b></span>' +
      '<span><small>补能停靠</small><b>' + chargeCount + ' 次</b></span><span><small>预算</small><b>' + escapeHtml(data.budget.balanced) + '</b></span></div>' +
      '<section class="trip-audit"><h3>方案检查 · ' + allWarnings.length + ' 项</h3>' +
      (allWarnings.length ? allWarnings.map(function (warning) { return '<p class="' + warning[1] + '"><b>' + warning[0] + '</b>' + escapeHtml(warning[2]) + '</p>'; }).join('') : '<p class="ok">当前没有明显冲突。</p>') + '</section>' +
      '<div class="trip-plan-grid"' + (planCollapsed ? ' hidden' : '') + '>' + cards + '</div>';
    bindPoiButtons(planPanel);
    planPanel.querySelectorAll('[data-edit-day]').forEach(function (button) {
      button.onclick = function () { selectDay(button.dataset.editDay); showView('journey'); };
    });
    planPanel.querySelectorAll('[data-map-day]').forEach(function (button) {
      button.onclick = function () { selectDay(button.dataset.mapDay); showView('journey'); setTimeout(function () { document.getElementById('trip-map-panel').scrollIntoView({ behavior: 'smooth' }); }, 100); };
    });
    var actions = planPanel.querySelectorAll('[data-plan-action]');
    actions.forEach(function (button) {
      button.onclick = function () {
        if (button.dataset.planAction === 'reset' && confirm('恢复官方推荐方案？旅行记录不会删除。')) store.reset();
        if (button.dataset.planAction === 'export') store.download();
        if (button.dataset.planAction === 'import') document.getElementById('trip-import-file').click();
        if (button.dataset.planAction === 'print') window.print();
        if (button.dataset.planAction === 'share') copyText(store.shareUrl(), button, '链接已复制');
        if (button.dataset.planAction === 'toggle') { planCollapsed = !planCollapsed; renderPlan(); }
      };
    });
  }

  function nextPending(ids, completed) {
    for (var i = 1; i < ids.length; i += 1) {
      if (!completed[ids[i]]) return { id: ids[i], index: i };
    }
    return null;
  }

  function nextByType(ids, completed, startIndex, type) {
    for (var i = Math.max(1, startIndex || 1); i < ids.length; i += 1) {
      var poi = poiById[ids[i]];
      if (poi && !completed[ids[i]] && poi.type === type) return poi;
    }
    return null;
  }

  function renderToday() {
    var state = store.getState();
    var day = dayById(state.selectedDay);
    var ids = routeForDay(day.id);
    var done = state.completedStops[day.id] || {};
    var next = nextPending(ids, done);
    var nextPoi = next ? poiById[next.id] : null;
    var fromPoi = next ? poiById[ids[Math.max(0, next.index - 1)]] : null;
    var realToday = store.currentTripDay();
    var mode = state.dayModes[day.id] || 'normal';
    var hospital = data.pois.find(function (poi) { return poi.type === 'hospital' && poi.days.indexOf(day.id) > -1; });
    var nextIndex = next ? next.index : 1;
    var nextMeal = nextByType(ids, done, nextIndex, 'restaurant');
    var nextCharge = nextByType(ids, done, nextIndex, 'charge');
    var hotel = ids.map(function (id) { return poiById[id]; }).filter(function (poi) { return poi && poi.type === 'hotel'; }).pop();
    var nextMetric = routeMetrics[day.id];
    todayPanel.innerHTML = '<header class="trip-view-head trip-today-head"><div><p>' + (realToday === day.id ? 'TODAY · 正在旅途中' : 'PREVIEW · 行前预演') +
      '</p><h2>' + escapeHtml(day.label) + ' · ' + escapeHtml(day.title) + '</h2><span>' + escapeHtml(day.distance) + '</span></div>' +
      '<label>切换日期<select id="today-day-select">' + data.days.map(function (item) { return '<option value="' + item.id + '"' + (item.id === day.id ? ' selected' : '') + '>' + item.label + ' · ' + item.title + '</option>'; }).join('') + '</select></label></header>' +
      '<div class="trip-today-grid"><section class="trip-next-stop">' +
      (nextPoi ? '<span>下一站 · ' + escapeHtml(nextPoi.type) + '</span><button type="button" data-poi="' + nextPoi.id + '"><h3>' + escapeHtml(nextPoi.name) + '</h3><p>' + escapeHtml(nextPoi.route_target.label) + ' · ' + escapeHtml(nextPoi.address) + '</p></button>' +
        '<a class="trip-nav-button" href="' + navLink(fromPoi, nextPoi) + '" target="_blank" rel="noopener">在高德导航下一站</a>' +
        '<div><button type="button" data-stop-status="done" data-stop-id="' + nextPoi.id + '">已完成</button><button type="button" data-stop-status="skip" data-stop-id="' + nextPoi.id + '">跳过可选项</button></div>' :
        '<span>今日路线</span><h3>今天的停靠点都处理完了</h3><p>回酒店休息，别为了补打卡继续加行程。</p>') + '</section>' +
      '<section class="trip-today-route"><header><h3>今日顺序</h3><button type="button" data-today-map>地图</button></header><ol>' +
      ids.map(function (id, index) { var poi = poiById[id]; return poi ? '<li class="' + (done[id] ? 'is-done' : '') + '"><i>' + (index + 1) + '</i><button type="button" data-poi="' + id + '">' + escapeHtml(poi.name) + '</button><small>' + (done[id] === 'skip' ? '已跳过' : done[id] ? '已完成' : '') + '</small></li>' : ''; }).join('') +
      '</ol></section><section class="trip-today-facts"><article><small>不可牺牲</small><b>午睡 ' + escapeHtml(day.nap) + '</b></article>' +
      '<article><small>当前状态</small><b>' + modeLabel(mode) + '</b></article>' +
      '<article><small>预计到达</small><b>' + escapeHtml(nextMetric ? '今日全程 ' + nextMetric.durationText : '以高德实时导航为准') + '</b></article>' +
      (nextPoi ? '<article><small>下一站停车</small><button type="button" data-poi="' + nextPoi.id + '">' + escapeHtml(nextPoi.parking.entrance || nextPoi.address) + '</button></article>' : '') +
      (nextMeal ? '<article><small>下一次吃饭</small><button type="button" data-poi="' + nextMeal.id + '">' + escapeHtml(nextMeal.name) + '</button><p>' + escapeHtml(nextMeal.price) + '</p></article>' : '<article><small>下一次吃饭</small><p>' + escapeHtml(day.food_note) + '</p></article>') +
      (nextCharge ? '<article><small>下一次补能</small><button type="button" data-poi="' + nextCharge.id + '">' + escapeHtml(nextCharge.name) + '</button><p>' + escapeHtml(nextCharge.summary) + '</p></article>' : '<article><small>下一次补能</small><p>今天路线没有固定补能点，出发前确认电量。</p></article>') +
      (hotel ? '<article><small>今晚酒店</small><button type="button" data-poi="' + hotel.id + '">' + escapeHtml(hotel.name) + '</button><p>' + escapeHtml(hotel.address) + '</p></article>' : '') +
      '<article><small>雨天备用</small><p>' + escapeHtml(day.rain_plan) + '</p></article>' +
      (hospital ? '<article><small>应急医院</small><button type="button" data-poi="' + hospital.id + '">' + escapeHtml(hospital.name) + '</button><p>' + escapeHtml(hospital.address) + '</p></article>' : '') + '</section></div>';
    todayPanel.querySelector('#today-day-select').onchange = function (event) { selectDay(event.target.value); };
    todayPanel.querySelectorAll('[data-stop-status]').forEach(function (button) {
      button.onclick = function () { store.setStopStatus(day.id, button.dataset.stopId, button.dataset.stopStatus); };
    });
    var mapButton = todayPanel.querySelector('[data-today-map]');
    if (mapButton) mapButton.onclick = function () { showView('journey'); setTimeout(function () { document.getElementById('trip-map-panel').scrollIntoView({ behavior: 'smooth' }); }, 100); };
    bindPoiButtons(todayPanel);
  }

  function renderCatalog(filter) {
    filter = filter || 'all';
    var types = [['all','全部'],['attraction','景点'],['restaurant','餐厅'],['hotel','酒店'],['charge','补能'],['hospital','医院']];
    var pois = data.pois.filter(function (poi) { return poi.type !== 'anchor' && (filter === 'all' || poi.type === filter); });
    catalogPanel.innerHTML = '<header class="trip-view-head"><div><p>PLACE LIBRARY</p><h2>地点图鉴</h2><span>' + data.pois.length + ' 个经过整理的路线节点</span></div></header>' +
      '<div class="trip-catalog-filters">' + types.map(function (item) { return '<button type="button" data-catalog-filter="' + item[0] + '" class="' + (filter === item[0] ? 'is-active' : '') + '">' + item[1] + '</button>'; }).join('') + '</div>' +
      '<div class="trip-catalog-grid">' + pois.map(function (poi) {
        var photo = poi.photos && poi.photos[0];
        return '<article><img loading="lazy" src="' + escapeHtml(photo ? photo.src : '/assets/images/travel/shandong-2026/place-placeholder.svg') + '" alt="' + escapeHtml(photo ? photo.alt : poi.name) + '" onerror="this.src=\'/assets/images/travel/shandong-2026/place-placeholder.svg\'">' +
          '<div><small>' + escapeHtml(poi.city + ' · ' + poi.type) + '</small><h3>' + escapeHtml(poi.name) + '</h3><p>' + escapeHtml(poi.summary) + '</p><button type="button" data-poi="' + poi.id + '">查看完整资料</button></div></article>';
      }).join('') + '</div>';
    catalogPanel.querySelectorAll('[data-catalog-filter]').forEach(function (button) {
      button.onclick = function () { renderCatalog(button.dataset.catalogFilter); };
    });
    bindPoiButtons(catalogPanel);
  }

  function copyText(value, button, success) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { button.textContent = success; });
    } else {
      window.prompt('复制下面的链接', value);
    }
  }

  function renderMore() {
    var journal = '';
    try { journal = localStorage.getItem('roadtrip-journal') || ''; } catch (error) {}
    morePanel.innerHTML = '<header class="trip-view-head"><div><p>TOOLS & BACKUP</p><h2>更多工具</h2><span>备份方案、记录旅途，也给意外留好退路</span></div></header>' +
      '<div class="trip-more-grid"><article><small>方案备份</small><h3>导出或导入选择</h3><p>JSON 可以保存到电脑，也可以人工提交到 GitHub 作为新默认方案。</p><button type="button" id="more-export">导出 JSON</button><label class="trip-file-label">导入 JSON<input id="more-import" type="file" accept="application/json"></label></article>' +
      '<article><small>亲子随身包</small><h3>尿裤、湿巾、水杯、熟悉主食</h3><p>加薄毯、换洗衣物、晕车袋和一个新玩具。每 90–120 分钟主动停车。</p></article>' +
      '<article><small>海边底线</small><h3>防风、防晒、防滑，不追浪</h3><p>宝宝不独自靠近礁石和浪线；海鲜熟透、剔刺后少量尝试。</p></article>' +
      '<article><small>信息时效</small><h3>资料核验于 ' + escapeHtml(data.trip.verified_at) + '</h3><p>国庆价格、营业、停车、船班和充电枪位均以出发前官方页面与 App 为准。</p></article></div>' +
      '<section class="trip-journal"><label for="trip-journal"><b>旅行记录 · 写给回来的自己</b><small>仅保存在本机，不进入分享链接</small></label><textarea id="trip-journal" rows="7" placeholder="今天宝宝最开心的瞬间……">' + escapeHtml(journal) + '</textarea><button type="button" id="save-journal">保存记录</button><span id="journal-result"></span></section>';
    morePanel.querySelector('#more-export').onclick = store.download;
    morePanel.querySelector('#more-import').onchange = function (event) {
      var file = event.target.files[0];
      if (!file) return;
      file.text().then(function (text) { store.importState(JSON.parse(text)); }).catch(function (error) { alert('导入失败：' + error.message); });
    };
    morePanel.querySelector('#save-journal').onclick = function () {
      try {
        localStorage.setItem('roadtrip-journal', morePanel.querySelector('#trip-journal').value);
        morePanel.querySelector('#journal-result').textContent = '已保存';
      } catch (error) {
        morePanel.querySelector('#journal-result').textContent = '浏览器未允许保存';
      }
    };
  }

  function renderAll(reason) {
    renderDays();
    renderEditor();
    if (activeView === 'today') renderToday();
    if (activeView === 'plan') renderPlan();
    var status = document.getElementById('trip-save-status');
    if (status) status.textContent = reason === 'reset' ? '已恢复推荐' : '已保存';
  }

  document.querySelectorAll('[data-view]').forEach(function (button) {
    button.onclick = function () { showView(button.dataset.view); };
  });
  var mobileMap = document.querySelector('[data-mobile-map]');
  if (mobileMap) mobileMap.onclick = function () {
    showView('journey');
    setTimeout(function () { document.getElementById('trip-map-panel').scrollIntoView({ behavior: 'smooth' }); }, 100);
  };
  var importFile = document.getElementById('trip-import-file');
  if (importFile) importFile.onchange = function () {
    var file = importFile.files && importFile.files[0];
    if (!file) return;
    file.text().then(function (text) {
      store.importState(JSON.parse(text));
      importFile.value = '';
    }).catch(function (error) {
      alert('导入失败：' + error.message);
      importFile.value = '';
    });
  };
  window.addEventListener('trip:statechange', function (event) { renderAll(event.detail.reason); });
  window.addEventListener('trip:route-result', function (event) {
    routeMetrics[event.detail.day] = event.detail;
    if (activeView === 'plan') renderPlan();
  });

  window.TripPlanner = {
    routeForDay: routeForDay,
    recommendedRoute: recommendedRoute,
    navLink: navLink,
    showView: showView,
    selectDay: selectDay
  };

  try {
    renderAll('init');
    showView(window.matchMedia('(max-width: 700px)').matches ? 'today' : 'journey');
  } catch (error) {
    var errorBox = document.getElementById('trip-runtime-error');
    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = '旅行执行台初始化失败：' + error.message;
    }
    throw error;
  }
})();
