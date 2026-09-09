(function () {
  'use strict';
  if (!window.TripStore) return;

  var layer = document.getElementById('trip-drawer-layer');
  var drawer = layer && layer.querySelector('.trip-drawer');
  var content = document.getElementById('trip-drawer-title') ? document.getElementById('trip-drawer-title').parentNode : null;
  var lastFocus = null;
  var previousHash = '';
  var openId = null;
  if (!layer || !drawer) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function typeName(type) {
    return { attraction: '景点', restaurant: '餐厅', hotel: '酒店', charge: '闪充站', hospital: '医院', anchor: '路线锚点' }[type] || type;
  }

  function infoRows(poi) {
    var rows = [
      ['建议停留', poi.duration],
      ['价格参考', poi.price],
      ['开放 / 营业', poi.hours],
      ['最佳时间', poi.best_time],
      ['客流判断', poi.crowd_risk]
    ];
    return rows.map(function (row) {
      return '<div><dt>' + escapeHtml(row[0]) + '</dt><dd>' + escapeHtml(row[1] || '出发前复核') + '</dd></div>';
    }).join('');
  }

  function linksHtml(poi) {
    var links = [];
    if (poi.links.official) links.push(['官方页面', poi.links.official]);
    if (poi.links.amap) links.push(['高德查看', poi.links.amap]);
    if (poi.links.ctrip) links.push(['携程查价', poi.links.ctrip]);
    if (poi.links.meituan) links.push(['美团查看', poi.links.meituan]);
    return links.map(function (link) {
      return '<a href="' + escapeHtml(link[1]) + '" target="_blank" rel="noopener">' + escapeHtml(link[0]) + ' ↗</a>';
    }).join('');
  }

  function photosHtml(poi) {
    var photos = poi.photos && poi.photos.length ? poi.photos : [{
      src: '/assets/images/travel/shandong-2026/place-placeholder.svg',
      alt: poi.name + '资料封面',
      credit: '穆朗旅行执行台',
      license: '原创占位插画'
    }];
    return photos.map(function (photo, index) {
      return '<figure class="' + (index === 0 ? 'is-active' : '') + '" data-drawer-photo="' + index + '">' +
        '<img src="' + escapeHtml(photo.src) + '" alt="' + escapeHtml(photo.alt || poi.name) + '" loading="' + (index ? 'lazy' : 'eager') + '">' +
        '<figcaption>' + escapeHtml(photo.credit || '') + (photo.license ? ' · ' + escapeHtml(photo.license) : '') +
        (photo.alt && /非实拍/.test(photo.alt) ? '<b>资料插画，非现场实拍</b>' : '') + '</figcaption></figure>';
    }).join('');
  }

  function render(poi) {
    drawer.innerHTML = '<button type="button" class="trip-drawer-close" data-close-drawer aria-label="关闭">×</button>' +
      '<div class="trip-drawer-gallery">' + photosHtml(poi) + '</div>' +
      '<div class="trip-drawer-body"><header><small>' + escapeHtml(poi.city + ' · ' + typeName(poi.type)) + '</small>' +
      '<h2 id="trip-drawer-title">' + escapeHtml(poi.name) + '</h2><p>' + escapeHtml(poi.summary) + '</p></header>' +
      '<div class="trip-drawer-tabs" role="tablist"><button type="button" class="is-active" data-detail-tab="overview">总览</button>' +
      '<button type="button" data-detail-tab="family">带娃</button><button type="button" data-detail-tab="parking">停车</button><button type="button" data-detail-tab="source">核验</button></div>' +
      '<section data-detail-panel="overview"><dl class="trip-detail-list">' + infoRows(poi) + '</dl>' +
      '<div class="trip-address"><small>导航目的地</small><b>' + escapeHtml(poi.route_target.label) + '</b><p>' + escapeHtml(poi.address) + '</p></div></section>' +
      '<section data-detail-panel="family" hidden><div class="trip-detail-cards"><article><small>推车</small><p>' + escapeHtml(poi.baby.stroller) +
      '</p></article><article><small>背带</small><p>' + escapeHtml(poi.baby.carrier) + '</p></article><article><small>卫生间</small><p>' +
      escapeHtml(poi.baby.toilet) + '</p></article><article><small>吃饭</small><p>' + escapeHtml(poi.baby.meal) + '</p></article></div></section>' +
      '<section data-detail-panel="parking" hidden><div class="trip-address"><small>停车入口</small><b>' + escapeHtml(poi.parking.entrance) +
      '</b><p>费用：' + escapeHtml(poi.parking.fee) + '</p><p>限高：' + escapeHtml(poi.parking.height_limit) + '</p><p>' + escapeHtml(poi.parking.notes) + '</p></div></section>' +
      '<section data-detail-panel="source" hidden><p class="trip-verified">核验时间：' + escapeHtml(poi.verified_at) +
      '</p><ul>' + (poi.sources || []).map(function (source) { return '<li>' + escapeHtml(source) + '</li>'; }).join('') + '</ul>' +
      '<p>节假日期间门票、营业、停车和充电状态可能变化，点击下方平台入口复核。</p></section>' +
      '<footer class="trip-drawer-links">' + linksHtml(poi) + '<button type="button" data-drawer-map="' + poi.id + '">地图定位</button></footer></div>';

    drawer.querySelectorAll('[data-close-drawer]').forEach(function (button) { button.onclick = close; });
    drawer.querySelectorAll('[data-detail-tab]').forEach(function (button) {
      button.onclick = function () {
        drawer.querySelectorAll('[data-detail-tab]').forEach(function (tab) { tab.classList.toggle('is-active', tab === button); });
        drawer.querySelectorAll('[data-detail-panel]').forEach(function (panel) { panel.hidden = panel.dataset.detailPanel !== button.dataset.detailTab; });
      };
    });
    drawer.querySelectorAll('img').forEach(function (image) {
      image.onerror = function () {
        image.onerror = null;
        image.src = '/assets/images/travel/shandong-2026/place-placeholder.svg';
        var caption = image.closest('figure').querySelector('figcaption');
        caption.textContent = '原图暂时不可用 · 已切换资料插画';
      };
    });
    var mapButton = drawer.querySelector('[data-drawer-map]');
    if (mapButton) mapButton.onclick = function () {
      window.dispatchEvent(new CustomEvent('trip:focuspoi', { detail: poi.id }));
      close();
      if (window.TripPlanner) window.TripPlanner.showView('journey');
      setTimeout(function () { document.getElementById('trip-map-panel').scrollIntoView({ behavior: 'smooth' }); }, 80);
    };
  }

  function open(id, fromHash) {
    var poi = window.TripStore.poiById[id];
    if (!poi) return;
    if (openId === id && !layer.hidden) return;
    lastFocus = document.activeElement;
    previousHash = location.hash;
    openId = id;
    render(poi);
    layer.hidden = false;
    document.body.classList.add('trip-drawer-open');
    if (!fromHash) history.pushState({ poi: id }, '', '#poi=' + encodeURIComponent(id));
    setTimeout(function () { var closeButton = drawer.querySelector('[data-close-drawer]'); if (closeButton) closeButton.focus(); }, 20);
  }

  function close() {
    if (layer.hidden) return;
    layer.hidden = true;
    document.body.classList.remove('trip-drawer-open');
    openId = null;
    if (location.hash.indexOf('#poi=') === 0) history.replaceState(null, '', previousHash || location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openFromHash() {
    var match = location.hash.match(/^#poi=([^&]+)/);
    if (match) open(decodeURIComponent(match[1]), true);
    else if (!layer.hidden) close();
  }

  layer.querySelectorAll('[data-close-drawer]').forEach(function (button) { button.onclick = close; });
  window.addEventListener('trip:openpoi', function (event) { open(event.detail); });
  window.addEventListener('hashchange', openFromHash);
  window.addEventListener('popstate', openFromHash);
  document.addEventListener('keydown', function (event) {
    if (layer.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      var focusable = Array.prototype.slice.call(drawer.querySelectorAll('button,a[href],[tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  openFromHash();
  window.TripDetails = { open: open, close: close };
})();
