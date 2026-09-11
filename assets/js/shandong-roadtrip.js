(function () {
  'use strict';
  if (!window.TripStore) return;

  var data = TripStore.data;
  var poiById = TripStore.poiById;
  var mapElement = document.getElementById('shandong-map');
  var panel = document.getElementById('driving-panel');
  var legList = document.getElementById('route-leg-list');
  var map = null;
  var markers = {};
  var markerGroups = {};
  var routeLine = null;
  var driving = null;
  var activeIds = [];
  var activeDay = 'd1';
  var activeFilter = 'all';
  var requestToken = 0;
  var markerSymbols = { attraction: '景', restaurant: '食', hotel: '住', charge: '电', hospital: '医', anchor: '点' };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function coordinates(poi) {
    return poi.route_target || poi.location;
  }

  function navLink(from, to) {
    if (window.TripPlanner) return TripPlanner.navLink(from, to);
    var a = coordinates(from), b = coordinates(to);
    return 'https://uri.amap.com/navigation?from=' + a.lng + ',' + a.lat + ',' + encodeURIComponent(from.name) +
      '&to=' + b.lng + ',' + b.lat + ',' + encodeURIComponent(to.name) + '&mode=car&policy=1&src=moulang-blog&callnative=1';
  }

  function policyValue() {
    var value = document.getElementById('route-policy').value;
    if (!window.AMap) return 0;
    if (value === 'traffic') return AMap.DrivingPolicy.LEAST_TIME || 0;
    if (value === 'toll') return AMap.DrivingPolicy.LEAST_FEE || 1;
    return AMap.DrivingPolicy.LEAST_TIME || 0;
  }

  function durationText(seconds) {
    var minutes = Math.max(1, Math.round(seconds / 60));
    var hours = Math.floor(minutes / 60);
    return (hours ? hours + ' 小时 ' : '') + (minutes % 60) + ' 分';
  }

  function amapPopup(poi) {
    return '<div class="trip-map-popup"><small>' + escapeHtml(poi.city + ' · ' + poi.type) + '</small><h3>' + escapeHtml(poi.name) +
      '</h3><p>' + escapeHtml(poi.address) + '</p><button type="button" data-popup-poi="' + poi.id + '">查看完整资料</button></div>';
  }

  function markerHtml(poi) {
    return '<div class="trip-marker trip-marker--' + poi.type + '"><span>' + (markerSymbols[poi.type] || '点') + '</span></div>';
  }

  function addMarkerToGroup(type, marker) {
    if (!markerGroups[type]) markerGroups[type] = [];
    markerGroups[type].push(marker);
  }

  function initAMap() {
    map = new AMap.Map(mapElement, {
      zoom: 7,
      center: [120.1, 37.1],
      mapStyle: 'amap://styles/whitesmoke',
      scrollWheel: false,
      resizeEnable: true
    });
    map.__isAMap = true;
    data.pois.forEach(function (poi) {
      var marker = new AMap.Marker({
        position: [poi.location.lng, poi.location.lat],
        title: poi.name,
        offset: new AMap.Pixel(-16, -30),
        content: markerHtml(poi),
        map: map
      });
      marker.poi = poi;
      marker.on('click', function () {
        var info = new AMap.InfoWindow({ content: amapPopup(poi), offset: new AMap.Pixel(0, -25) });
        info.open(map, marker.getPosition());
        setTimeout(function () {
          var button = document.querySelector('[data-popup-poi="' + poi.id + '"]');
          if (button) button.onclick = function () { window.dispatchEvent(new CustomEvent('trip:openpoi', { detail: poi.id })); };
        }, 10);
      });
      markers[poi.id] = marker;
      addMarkerToGroup(poi.type, marker);
    });
    map.setFitView();
  }

  function initLeaflet() {
    if (!window.L) {
      mapElement.innerHTML = '<div class="trip-map-error"><b>地图暂时无法加载</b><p>路线和高德分段入口仍可使用。</p></div>';
      return;
    }
    map = L.map(mapElement, { scrollWheelZoom: false }).setView([37.1, 120.1], 7);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles © Esri, HERE, Garmin, USGS, OpenStreetMap contributors'
    }).addTo(map);
    data.pois.forEach(function (poi) {
      var icon = L.divIcon({ className: '', html: markerHtml(poi), iconSize: [32, 32], iconAnchor: [16, 30] });
      var marker = L.marker([poi.location.lat, poi.location.lng], { icon: icon }).addTo(map);
      marker.poi = poi;
      marker.bindPopup(amapPopup(poi)).on('popupopen', function () {
        var button = document.querySelector('[data-popup-poi="' + poi.id + '"]');
        if (button) button.onclick = function () { window.dispatchEvent(new CustomEvent('trip:openpoi', { detail: poi.id })); };
      });
      markers[poi.id] = marker;
      addMarkerToGroup(poi.type, marker);
    });
  }

  function setMarkerVisible(marker, visible) {
    if (!map) return;
    if (map.__isAMap) marker.setMap(visible ? map : null);
    else if (visible && !map.hasLayer(marker)) marker.addTo(map);
    else if (!visible && map.hasLayer(marker)) map.removeLayer(marker);
  }

  function applyFilter() {
    Object.keys(markerGroups).forEach(function (type) {
      markerGroups[type].forEach(function (marker) {
        var inRoute = !activeIds.length || activeIds.indexOf(marker.poi.id) > -1;
        var typeMatch = activeFilter === 'all' || type === activeFilter;
        setMarkerVisible(marker, inRoute && typeMatch);
      });
    });
    document.querySelectorAll('[data-map-filter]').forEach(function (button) {
      button.classList.toggle('is-active', button.dataset.mapFilter === activeFilter);
    });
  }

  function drawFallback(ids) {
    if (!map) return;
    var path = ids.map(function (id) {
      var point = coordinates(poiById[id]);
      return map.__isAMap ? [point.lng, point.lat] : [point.lat, point.lng];
    });
    if (routeLine) {
      if (map.__isAMap) routeLine.setMap(null);
      else map.removeLayer(routeLine);
    }
    if (map.__isAMap) {
      routeLine = new AMap.Polyline({ map: map, path: path, strokeColor: '#1f7654', strokeWeight: 4, strokeStyle: 'dashed' });
      map.setFitView(ids.map(function (id) { return markers[id]; }).filter(Boolean));
    } else if (path.length > 1) {
      routeLine = L.polyline(path, { color: '#1f7654', weight: 4, opacity: 0.8, dashArray: '8 8' }).addTo(map);
      map.fitBounds(routeLine.getBounds(), { padding: [35, 35], maxZoom: 12 });
    }
  }

  function fallbackLegs(ids, message) {
    panel.innerHTML = '<div class="trip-route-fallback"><b>' + escapeHtml(message) + '</b><p>停靠点已经保留，可逐段在高德中打开。</p></div>';
    legList.innerHTML = ids.slice(0, -1).map(function (id, index) {
      var from = poiById[id], to = poiById[ids[index + 1]];
      return legCard(from, to, null, index);
    }).join('');
  }

  function legCard(from, to, result, index) {
    var route = result && result.routes && result.routes[0];
    var roads = route ? uniqueRoads(route.steps || []).slice(0, 4).join(' → ') : '等待高德返回道路数据';
    var distance = route ? (route.distance / 1000).toFixed(1) + ' km' : '距离待算';
    var duration = route ? durationText(route.time) : '时间待算';
    var toll = route && route.tolls != null ? ' · 预计收费 ¥' + Math.round(route.tolls) : '';
    return '<article class="trip-leg"><header><i>' + (index + 1) + '</i><div><small>' + escapeHtml(from.name) + ' →</small><h3>' + escapeHtml(to.name) + '</h3></div></header>' +
      '<p><b>' + distance + ' · ' + duration + toll + '</b></p><p>' + escapeHtml(roads || '按高德实时路线行驶') + '</p>' +
      '<p class="trip-leg__arrival">到达：' + escapeHtml(to.route_target.label) + ' · ' + escapeHtml(to.address) + '</p>' +
      '<footer><button type="button" data-poi="' + to.id + '">地点详情</button><a href="' + navLink(from, to) + '" target="_blank" rel="noopener">高德导航这一段 ↗</a></footer></article>';
  }

  function uniqueRoads(steps) {
    var seen = {};
    return steps.map(function (step) { return step.road || step.instruction || ''; }).filter(function (road) {
      if (!road || seen[road]) return false;
      seen[road] = true;
      return true;
    });
  }

  function bindLegDetails() {
    legList.querySelectorAll('[data-poi]').forEach(function (button) {
      button.onclick = function () { window.dispatchEvent(new CustomEvent('trip:openpoi', { detail: button.dataset.poi })); };
    });
  }

  function cacheKey(from, to) {
    return 'trip-leg-v3:' + from.id + ':' + to.id + ':' + document.getElementById('route-policy').value;
  }

  function readLegCache(from, to) {
    try {
      var cached = JSON.parse(sessionStorage.getItem(cacheKey(from, to)) || 'null');
      if (cached && Date.now() - cached.savedAt < 600000) return cached.result;
    } catch (error) {}
    return null;
  }

  function writeLegCache(from, to, result) {
    try { sessionStorage.setItem(cacheKey(from, to), JSON.stringify({ savedAt: Date.now(), result: result })); } catch (error) {}
  }

  function publishLeg(ids, index, result) {
    var route = result && result.routes && result.routes[0];
    if (!route) return;
    window.dispatchEvent(new CustomEvent('trip:leg-result', { detail: {
      day: activeDay, ids: ids.slice(), index: index,
      distanceKm: route.distance / 1000, durationSeconds: route.time,
      policy: document.getElementById('route-policy').value
    } }));
  }

  function calculateLegs(ids, token, index, html) {
    if (token !== requestToken) return;
    if (index >= ids.length - 1) {
      legList.innerHTML = html.join('');
      bindLegDetails();
      return;
    }
    var from = poiById[ids[index]], to = poiById[ids[index + 1]];
    var cached = readLegCache(from, to);
    if (cached) {
      publishLeg(ids, index, cached);
      html.push(legCard(from, to, cached, index));
      calculateLegs(ids, token, index + 1, html);
      return;
    }
    var service = new AMap.Driving({ policy: policyValue(), ferry: 1, extensions: 'all' });
    var settled = false;
    var timeout = setTimeout(function () {
      if (settled || token !== requestToken) return;
      settled = true;
      html.push(legCard(from, to, null, index));
      calculateLegs(ids, token, index + 1, html);
    }, 8000);
    service.search(new AMap.LngLat(coordinates(from).lng, coordinates(from).lat), new AMap.LngLat(coordinates(to).lng, coordinates(to).lat), function (status, result) {
      if (settled || token !== requestToken) return;
      settled = true;
      clearTimeout(timeout);
      if (status === 'complete') writeLegCache(from, to, result);
      if (status === 'complete') publishLeg(ids, index, result);
      html.push(legCard(from, to, status === 'complete' ? result : null, index));
      setTimeout(function () { calculateLegs(ids, token, index + 1, html); }, 120);
    });
  }

  function routeErrorMessage(result) {
    var local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
    if (local) return '本地地址可能不在高德白名单，已切换为路线示意';
    if (result && result.info) return '高德算路失败：' + result.info;
    return '高德暂时没有返回道路数据';
  }

  function planRoute(dayId, ids) {
    activeDay = dayId;
    activeIds = ids.filter(function (id) { return poiById[id]; });
    requestToken += 1;
    window.dispatchEvent(new CustomEvent('trip:route-start',{detail:{day:dayId,ids:activeIds.slice()}}));
    if(activeIds.length>18){drawFallback(activeIds);fallbackLegs(activeIds,'停靠点超过高德途经点限制，请减少至 18 个以内；已保留所有点位。');return;}
    var token = requestToken;
    applyFilter();
    drawFallback(activeIds);
    if (activeIds.length < 2) {
      fallbackLegs(activeIds, '今天不需要单独规划驾车路线');
      return;
    }
    if (!map || !map.__isAMap || !window.AMap) {
      fallbackLegs(activeIds, '高德地图未加载，当前显示可用的兜底路线');
      return;
    }
    if (!AMap.Driving) {
      panel.innerHTML = '<p>正在加载高德路线服务…</p>';
      AMap.plugin('AMap.Driving', function () { planRoute(dayId, ids); });
      return;
    }
    if (driving) driving.clear();
    if (routeLine) routeLine.setMap(null);
    panel.innerHTML = '<p>正在计算完整路线和分段道路…</p>';
    legList.innerHTML = '<div class="trip-route-loading">正在逐段核对里程、道路与到达入口</div>';
    driving = new AMap.Driving({ map: map, policy: policyValue(), ferry: 1, extensions: 'all', showTraffic: true, hideMarkers: false });
    var points = activeIds.map(function (id) { return poiById[id]; });
    var originInput = document.getElementById('route-origin');
    var originText = originInput && originInput.value.trim();
    var origin = originText && dayId === 'd1' ? { keyword: originText, city: '北京' } :
      new AMap.LngLat(coordinates(points[0]).lng, coordinates(points[0]).lat);
    var destination = new AMap.LngLat(coordinates(points[points.length - 1]).lng, coordinates(points[points.length - 1]).lat);
    var waypoints = points.slice(1, -1).map(function (poi) { return new AMap.LngLat(coordinates(poi).lng, coordinates(poi).lat); });
    var settled = false;
    var routeTimeout = setTimeout(function () {
      if (settled || token !== requestToken) return;
      settled = true;
      drawFallback(activeIds);
      fallbackLegs(activeIds, '高德算路超时，已切换为可继续使用的路线示意');
    }, 12000);
    driving.search(origin, destination, { waypoints: waypoints }, function (status, result) {
      if (settled || token !== requestToken) return;
      settled = true;
      clearTimeout(routeTimeout);
      if (status !== 'complete') {
        drawFallback(activeIds);
        fallbackLegs(activeIds, routeErrorMessage(result));
        return;
      }
      var route = result.routes && result.routes[0];
      if (!route) return;
      var roads = uniqueRoads(route.steps || []).slice(0, 8);
      var metric = {
        day: dayId,
        ids: activeIds.slice(),
        distanceKm: route.distance / 1000,
        durationText: durationText(route.time),
        durationSeconds: route.time,
        tolls: route.tolls || 0,
        roads: roads
      };
      panel.innerHTML = '<div class="trip-driving-summary"><small>高德实时结果</small><h3>' + metric.distanceKm.toFixed(1) + ' km · ' + metric.durationText +
        '</h3><p>' + escapeHtml(roads.join(' → ') || '路线已绘制到地图') + '</p><span>预计收费 ¥' + Math.round(metric.tolls) + ' · 国庆当天请再次刷新</span></div>';
      window.dispatchEvent(new CustomEvent('trip:route-result', { detail: metric }));
      calculateLegs(activeIds, token, 0, []);
    });
  }

  function focusPoi(id) {
    var marker = markers[id], poi = poiById[id];
    if (!map || !marker || !poi) return;
    activeIds = [];
    activeFilter = 'all';
    applyFilter();
    if (map.__isAMap) {
      map.setZoomAndCenter(15, [poi.location.lng, poi.location.lat]);
      marker.emit('click');
    } else {
      map.setView([poi.location.lat, poi.location.lng], 15);
      marker.openPopup();
    }
  }

  window.TripMapPreview = function(ids, dayId) {
    return new Promise(function(resolve,reject){
      if(!window.AMap || !AMap.Driving || ids.length<2 || ids.length>18){reject(new Error('高德路线服务不可用或点数超限'));return;}
      var service=new AMap.Driving({policy:policyValue(),ferry:1,extensions:'all'}),settled=false;
      var timer=setTimeout(function(){if(!settled){settled=true;reject(new Error('高德校核超时'));}},9000);
      var points=ids.map(function(id){var c=coordinates(poiById[id]);return new AMap.LngLat(c.lng,c.lat);});
      var originInput=document.getElementById('route-origin');
      var origin=dayId==='d1' && originInput && originInput.value.trim()?{keyword:originInput.value.trim(),city:'北京'}:points[0];
      service.search(origin,points[points.length-1],{waypoints:points.slice(1,-1)},function(status,result){
        if(settled)return;settled=true;clearTimeout(timer);
        var r=result && result.routes && result.routes[0];
        if(status!=='complete'||!r){reject(new Error('高德未返回可用路线'));return;}
        resolve({distanceKm:r.distance/1000,durationSeconds:r.time,tolls:r.tolls==null?null:r.tolls});
      });
    });
  };

  if (mapElement) {
    if (window.AMap) initAMap();
    else initLeaflet();
  }
  document.querySelectorAll('[data-map-filter]').forEach(function (button) {
    button.onclick = function () { activeFilter = button.dataset.mapFilter; applyFilter(); };
  });
  document.getElementById('fit-all').onclick = function () {
    if (!map) return;
    activeIds = [];
    activeFilter = 'all';
    applyFilter();
    if (map.__isAMap) map.setFitView();
    else map.fitBounds(L.latLngBounds(data.pois.map(function (poi) { return [poi.location.lat, poi.location.lng]; })), { padding: [25, 25] });
  };
  document.getElementById('refresh-driving-route').onclick = function () { planRoute(activeDay, activeIds); };
  document.getElementById('route-policy').onchange = function () { planRoute(activeDay, activeIds); };
  window.addEventListener('trip:route', function (event) {
    planRoute(event.detail.day, event.detail.ids);
    if (event.detail.scroll) document.getElementById('trip-map-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  window.addEventListener('trip:focuspoi', function (event) { focusPoi(event.detail); });
  window.addEventListener('resize', function () {
    if (!map) return;
    setTimeout(function () { if (map.__isAMap) map.resize(); else map.invalidateSize(); }, 80);
  });
})();
