(function () {
  'use strict';

  const points = [
    {id:'a-beijing',type:'attraction',name:'北京出发 / 返程',lat:39.9042,lng:116.4074,address:'城市示意点，请用实际家庭地址导航',day:['d1','d14']},
    {id:'a-weifang',type:'attraction',name:'潍坊市区',lat:36.7069,lng:119.1618,address:'潍坊老家停留与车辆整备',day:['d1','d2','d3','d4','d13','d14']},
    {id:'a-penglai',type:'attraction',name:'蓬莱阁景区',lat:37.8250,lng:120.7505,address:'烟台市蓬莱区北关路 1 号',day:['d5']},
    {id:'a-penglai-ocean',type:'attraction',name:'蓬莱海洋极地世界',lat:37.8222,lng:120.7338,address:'烟台市蓬莱区海港路 88 号',note:'室内亲子备选；节假日先核对场次与票价',day:['d5']},
    {id:'a-sanxian',type:'attraction',name:'三仙山风景区',lat:37.8125,lng:120.7697,address:'烟台市蓬莱区海滨路 9 号',note:'园林建筑；面积较大，带娃建议只走核心区',day:['d5']},
    {id:'a-yantaishan',type:'attraction',name:'烟台山景区',lat:37.5455,lng:121.3980,address:'烟台市芝罘区历新路 7 号',day:['d6']},
    {id:'a-changyu',type:'attraction',name:'张裕酒文化博物馆',lat:37.5401,lng:121.3906,address:'烟台市芝罘区大马路 56 号',note:'室内备选；带宝宝不安排品酒环节',day:['d6']},
    {id:'a-fisher',type:'attraction',name:'烟台渔人码头',lat:37.5270,lng:121.4586,address:'烟台市莱山区滨海中路',day:['d6']},
    {id:'a-liugong',type:'attraction',name:'刘公岛客运中心',lat:37.5008,lng:122.1538,address:'威海市环翠区海滨北路 101-2 号',day:['d8']},
    {id:'a-haiyuan',type:'attraction',name:'海源公园',lat:37.5267,lng:122.1472,address:'威海市环翠区环海路',day:['d7']},
    {id:'a-huoju',type:'attraction',name:'火炬八街',lat:37.5284,lng:122.0583,address:'威海市环翠区火炬八街',day:['d8']},
    {id:'a-naxianghai',type:'attraction',name:'那香海钻石沙滩',lat:37.3630,lng:122.5717,address:'威海市荣成市环海路 6699 号',day:['d9']},
    {id:'a-olympic',type:'attraction',name:'青岛奥帆中心',lat:36.0605,lng:120.3976,address:'青岛市市南区燕儿岛路 1 号',day:['d10']},
    {id:'a-mayfourth',type:'attraction',name:'五四广场',lat:36.0627,lng:120.3843,address:'青岛市市南区东海西路',note:'免费夜景；可与奥帆中心连走',day:['d10','d12']},
    {id:'a-zhanqiao',type:'attraction',name:'青岛栈桥',lat:36.0610,lng:120.3197,address:'青岛市市南区太平路 12 号',day:['d11']},
    {id:'a-xiaoyushan',type:'attraction',name:'小鱼山公园',lat:36.0609,lng:120.3362,address:'青岛市市南区福山支路 24 号',day:['d11']},
    {id:'a-signalhill',type:'attraction',name:'信号山公园',lat:36.0664,lng:120.3310,address:'青岛市市南区龙山路 16 号甲',note:'老城俯瞰；有坡度，推车不如背带',day:['d11']},
    {id:'a-cathedral',type:'attraction',name:'圣弥厄尔教堂',lat:36.0710,lng:120.3205,address:'青岛市市南区浙江路 15 号',note:'老城建筑打卡；开放和礼仪活动需现场确认',day:['d11']},
    {id:'a-underwater',type:'attraction',name:'青岛海底世界',lat:36.0584,lng:120.3352,address:'青岛市市南区莱阳路 2 号',day:['d12']},
    {id:'a-polar',type:'attraction',name:'青岛极地海洋公园',lat:36.0762,lng:120.4495,address:'青岛市崂山区东海东路 60 号',note:'亲子互动更强；票价较高，建议只选一个海洋馆',day:['d12']},
    {id:'a-badaguan',type:'attraction',name:'八大关',lat:36.0523,lng:120.3518,address:'青岛市市南区武胜关支路',day:['d12']},
    {id:'a-yangma',type:'attraction',name:'养马岛环岛',lat:37.4665,lng:121.6802,address:'烟台市牟平区养马岛旅游度假区',note:'顺路备选 · 日落推荐 · 国庆尽量早到',day:['d6']},
    {id:'a-suo',type:'attraction',name:'所城里历史街区',lat:37.5420,lng:121.3978,address:'烟台市芝罘区所城里大街',note:'夜游推荐 · 适合短停',day:['d6']},
    {id:'a-banyue',type:'attraction',name:'威海半月湾',lat:37.5355,lng:122.1670,address:'威海市环翠区环海路半月湾',note:'清晨 / 日落推荐 · 大风取消',day:['d7','d9']},
    {id:'a-chengshan',type:'attraction',name:'成山头',lat:37.3850,lng:122.6950,address:'威海市荣成市成山镇',note:'值得专程 · 风大时取消',day:['d9']},
    {id:'a-jinshi',type:'attraction',name:'金石湾艺术园区',lat:37.2800,lng:122.4500,address:'威海市荣成市滨海大道',note:'家庭合照 · 草地海岸 · 预留 1.5–2 小时',day:['d9']},
    {id:'a-xiaomai',type:'attraction',name:'青岛小麦岛',lat:36.0562,lng:120.4234,address:'青岛市崂山区麦岛路',note:'日落推荐 · 大风取消',day:['d10','d12']},

    {id:'h-yantai-a',type:'hotel',name:'烟台百纳瑞汀酒店',lat:37.5402,lng:121.4069,address:'烟台市芝罘区大马路 3-1 号',day:['d5','d6']},
    {id:'h-yantai-b',type:'hotel',name:'烟台世茂希尔顿酒店',lat:37.5383,lng:121.4050,address:'烟台市芝罘区大马路 53 号',day:['d5','d6']},
    {id:'h-weihai-a',type:'hotel',name:'威海抱海大酒店',lat:37.4412,lng:122.1608,address:'威海市环翠区海滨中路 29 号',day:['d7','d8','d9']},
    {id:'h-weihai-b',type:'hotel',name:'威海蓝海御华大饭店',lat:37.4352,lng:122.1638,address:'威海市环翠区海滨中路 62-1 号',day:['d7','d8','d9']},
    {id:'h-qingdao-a',type:'hotel',name:'青岛栈桥海景亚朵酒店',lat:36.0660,lng:120.3157,address:'青岛市市南区中山路周边',day:['d10','d11','d12']},
    {id:'h-qingdao-b',type:'hotel',name:'青岛海景花园大酒店',lat:36.0552,lng:120.4266,address:'青岛市市南区彰化路 2 号',day:['d10','d11','d12']},

    {id:'c-cangzhou',type:'charge',name:'沧州天成郡府闪充站',lat:38.29712,lng:116.82767,address:'沧州市运河区永安南大道',note:'进城备选，出发前在比亚迪 App 核实',day:['d1','d14']},
    {id:'c-binzhou',type:'charge',name:'滨州黄河二路新立小区闪充站',lat:37.37222,lng:117.98165,address:'滨州市滨城区黄河二路彩虹湖',note:'4 把闪充枪；长途主补能候选',day:['d1','d14']},
    {id:'c-weifang',type:'charge',name:'潍坊恒信时代广场闪充站',lat:36.70908,lng:119.183,address:'潍坊市高新区东风东街 5058 号',note:'4 把闪充枪',day:['d2','d4','d5','d13']},
    {id:'c-penglai',type:'charge',name:'烟台北关路利群广场闪充站',lat:37.81656,lng:120.76124,address:'蓬莱区北关路 700 号',note:'2 把闪充枪',day:['d5']},
    {id:'c-yantai',type:'charge',name:'烟台电视台闪充站',lat:37.46067,lng:121.45297,address:'莱山区观海路 349 号',note:'4 把闪充枪',day:['d5','d6','d7']},
    {id:'c-weihai',type:'charge',name:'威海高铁北站闪充站',lat:37.49054,lng:122.0417,address:'威海高铁北站地面停车场',note:'4 把闪充枪',day:['d7','d8','d9','d10']},
    {id:'c-rongcheng',type:'charge',name:'比亚迪荣成兴飞闪充站',lat:37.10978,lng:122.40007,address:'荣成市凭海西路鑫通汽车城',note:'2 把闪充枪；荣成返程备选',day:['d9']},
    {id:'c-laixi',type:'charge',name:'青岛南京北路良茂凯悦闪充站',lat:36.86768,lng:120.53872,address:'青岛市莱西市南京北路 116 号',note:'威海—青岛途中候选',day:['d10']},
    {id:'c-qingdao',type:'charge',name:'青岛徐州路便民市场闪充站',lat:36.08459,lng:120.37884,address:'青岛市市南区徐州路 171 号',note:'4 把闪充枪',day:['d10','d11','d12','d13']},

    {id:'f-weifang',type:'food',name:'潍坊老城区餐饮区',lat:36.7104,lng:119.0998,address:'十笏园 / 城隍庙街周边',day:['d2']},
    {id:'f-penglai',type:'food',name:'蓬莱阁外餐饮区',lat:37.8169,lng:120.7556,address:'蓬莱阁东门—北关路周边；选定餐厅后请二次导航',note:'蓬莱小面、鲅鱼水饺；此点为餐饮片区中心',day:['d5']},
    {id:'f-yantai',type:'food',name:'烟台山—朝阳街餐饮区',lat:37.5428,lng:121.3971,address:'芝罘区朝阳街周边',day:['d6']},
    {id:'f-yantai-east',type:'food',name:'烟台莱山亲子餐饮区',lat:37.4638,lng:121.4475,address:'莱山区观海路商圈；选定餐厅后请二次导航',note:'停车、餐椅与宝宝餐更稳定',day:['d6','d7']},
    {id:'f-weihai',type:'food',name:'威海韩乐坊餐饮区',lat:37.4234,lng:122.1527,address:'环翠区韩乐坊',day:['d7','d8','d9']},
    {id:'f-weihai-mall',type:'food',name:'威高广场亲子餐饮区',lat:37.5134,lng:122.1202,address:'环翠区新威路威高广场；选定餐厅后请二次导航',note:'商场停车、母婴设施与儿童餐更可控',day:['d7','d8']},
    {id:'f-rongcheng',type:'food',name:'荣成城区海鲜家常菜区',lat:37.1636,lng:122.4158,address:'荣成市成山大道中段周边；选定餐厅后请二次导航',note:'问清海鲜计价单位与加工费',day:['d9']},
    {id:'f-qingdao',type:'food',name:'青岛老城家常菜区域',lat:36.0675,lng:120.3250,address:'市南区中山路—黄岛路周边',day:['d11']}
    ,{id:'f-qingdao-east',type:'food',name:'青岛香港中路亲子餐饮区',lat:36.0644,lng:120.3972,address:'市南区香港中路—奥帆商圈；选定餐厅后请二次导航',note:'商场餐厅、停车和宝宝餐更稳定',day:['d10','d11','d12']}
    ,{id:'e-weihai',type:'emergency',name:'威海市立医院',lat:37.5136,lng:122.1165,address:'威海市环翠区和平路 70 号',note:'出发前请核对儿科急诊与停车入口',day:['d7','d8','d9']}
    ,{id:'e-qingdao',type:'emergency',name:'青岛市妇女儿童医院',lat:36.1074,lng:120.3821,address:'青岛市市北区辽阳西路 217 号',note:'亲子旅行应急备选',day:['d10','d11','d12']}
    ,{id:'e-yantai',type:'emergency',name:'烟台毓璜顶医院',lat:37.5351,lng:121.3895,address:'烟台市芝罘区毓璜顶东路 20 号',note:'出发前核对儿科急诊',day:['d5','d6']}
  ];

  const route = [
    [39.9042,116.4074],[38.29712,116.82767],[37.37222,117.98165],[36.7069,119.1618],
    [37.8250,120.7505],[37.5402,121.4069],[37.5008,122.1538],[37.3630,122.5717],
    [37.5008,122.1538],[36.86768,120.53872],[36.0671,120.3826],[36.7069,119.1618],[39.9042,116.4074]
  ];
  const dayStops={d1:['a-beijing','a-weifang'],d5:['a-weifang','a-penglai','h-yantai-b'],d6:['h-yantai-b','a-yantaishan','a-fisher'],d7:['h-yantai-b','h-weihai-b','a-haiyuan'],d8:['h-weihai-b','a-liugong'],d9:['h-weihai-b','a-naxianghai'],d10:['h-weihai-b','h-qingdao-b','a-olympic'],d11:['h-qingdao-b','a-zhanqiao','a-xiaoyushan'],d12:['h-qingdao-b','a-underwater','a-badaguan'],d13:['h-qingdao-b','a-weifang'],d14:['a-weifang','a-beijing']};

  const symbol = { attraction:'景', hotel:'住', charge:'电', food:'食', emergency:'医' };
  let map;
  let routeLine;
  let activeDay = null;
  const markerById = {};
  const layersByType = { attraction:[], hotel:[], charge:[], food:[], emergency:[] };
  let activeFilter = 'all';
  let driving;
  let activeDrivingDay;

  function gaodeLink(point) {
    return 'https://uri.amap.com/search?keyword=' + encodeURIComponent(point.name + ' ' + point.address) + '&src=moulang-blog&callnative=1';
  }
  function gaodeNavigationLink(from,to){
    return 'https://uri.amap.com/navigation?from='+from.lng+','+from.lat+','+encodeURIComponent(from.name)+'&to='+to.lng+','+to.lat+','+encodeURIComponent(to.name)+'&mode=car&policy=1&src=moulang-blog&callnative=1';
  }
  function routeFallback(stops){
    return '<div class="route-fallback"><p>暂时未取到高德逐路段数据，可按已选顺序逐段导航：</p>'+stops.slice(0,-1).map(function(point,index){const next=stops[index+1];return '<a href="'+gaodeNavigationLink(point,next)+'" target="_blank" rel="noopener"><b>'+(index+1)+' · '+point.name+' → '+next.name+'</b><span>在高德打开这一段 ↗</span></a>';}).join('')+'</div>';
  }

  function initMap() {
    const mapEl = document.getElementById('shandong-map');
    if (!mapEl) return;
    if (typeof window.AMap !== 'undefined') return initAMap(mapEl);
    if (typeof window.L === 'undefined') return;
    map = L.map(mapEl, {scrollWheelZoom:false, zoomControl:true}).setView([37.1,120.1],7);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom:18,
      attribution:'Tiles &copy; Esri — Esri, HERE, Garmin, USGS, OpenStreetMap contributors'
    }).addTo(map);
    routeLine=L.polyline(route,{color:'#10233f',weight:4,opacity:.72,dashArray:'9 8'}).addTo(map);
    points.forEach(function(point){
      const icon = L.divIcon({className:'',html:'<div class="trip-marker trip-marker--'+point.type+'"><span>'+symbol[point.type]+'</span></div>',iconSize:[30,30],iconAnchor:[15,28],popupAnchor:[0,-26]});
      const popup = '<div class="map-popup"><h3>'+point.name+'</h3><p>'+point.address+'</p>'+(point.note?'<p>'+point.note+'</p>':'')+'<a href="'+gaodeLink(point)+'" target="_blank" rel="noopener">用高德打开 ↗</a></div>';
      const marker = L.marker([point.lat,point.lng],{icon:icon}).bindPopup(popup).addTo(map);
      marker.pointType = point.type; markerById[point.id]=marker; layersByType[point.type].push(marker);
    });
    fitAll();
  }

  function initAMap(mapEl) {
    map = new AMap.Map(mapEl,{zoom:7,center:[120.1,37.1],mapStyle:'amap://styles/whitesmoke'});
    map._amap=true;
    routeLine=new AMap.Polyline({path:route.map(function(p){return[p[1],p[0]];}),strokeColor:'#10233f',strokeWeight:4,strokeOpacity:.72,strokeStyle:'dashed',map:map});
    points.forEach(function(point){
      const marker=new AMap.Marker({position:[point.lng,point.lat],title:point.name,offset:new AMap.Pixel(-15,-28),content:'<div class="trip-marker trip-marker--'+point.type+'"><span>'+symbol[point.type]+'</span></div>',map:map});
      marker.pointType=point.type;marker.point=point;
      marker.on('click',function(){const info=new AMap.InfoWindow({content:'<div class="map-popup"><h3>'+point.name+'</h3><p>'+point.address+'</p>'+(point.note?'<p>'+point.note+'</p>':'')+'<a href="'+gaodeLink(point)+'" target="_blank" rel="noopener">用高德打开 ↗</a></div>',offset:new AMap.Pixel(0,-24)});info.open(map,marker.getPosition());});
      markerById[point.id]=marker;layersByType[point.type].push(marker);
    });
    map.setFitView();
  }

  function fitAll(){ if(map) {activeDay=null;setFilter('all');if(map._amap){routeLine.setPath(route.map(function(p){return[p[1],p[0]];}));map.setFitView();}else{routeLine.setLatLngs(route);map.fitBounds(L.latLngBounds(route),{padding:[28,28]});}} }
  function setFilter(type){
    activeFilter=type;
    if(!map)return;
    Object.keys(layersByType).forEach(function(key){ layersByType[key].forEach(function(marker){ const point=points.find(p=>markerById[p.id]===marker);const shouldShow=(type==='all'||type===key)&&(!activeDay||point.day.includes(activeDay)); if(map._amap) marker.setMap(shouldShow?map:null); else {if(shouldShow&&!map.hasLayer(marker))marker.addTo(map); if(!shouldShow&&map.hasLayer(marker))map.removeLayer(marker);} }); });
    document.querySelectorAll('.map-filter').forEach(function(btn){btn.classList.toggle('is-active',btn.dataset.filter===type);});
  }
  function focusPoint(id){
    const marker=markerById[id]; if(!map||!marker)return;
    activeDay=null;setFilter('all'); if(map._amap){map.setZoomAndCenter(14,[marker.getPosition().lng,marker.getPosition().lat]);}else{map.setView(marker.getLatLng(),14,{animate:true});marker.openPopup();} document.getElementById('route-map').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function focusDay(day){
    if(!map)return;
    const selected=points.filter(function(p){return p.day.indexOf(day)>-1;});
    if(!selected.length)return;
    const stops=(dayStops[day]||[]).map(id=>points.find(p=>p.id===id)).filter(Boolean);
    activeDay=day;setFilter('all');stops.forEach(p=>{if(map._amap)markerById[p.id].setMap(map);else markerById[p.id].addTo(map);}); if(map._amap){routeLine.setPath(stops.map(p=>[p.lng,p.lat]));map.setFitView(stops.map(p=>markerById[p.id]));}else{routeLine.setLatLngs(stops.map(p=>[p.lat,p.lng])); map.fitBounds(L.latLngBounds(selected.concat(stops).map(function(p){return[p.lat,p.lng];})),{padding:[45,45],maxZoom:11});}
    document.querySelectorAll('.day-card').forEach(function(card){card.classList.toggle('is-active',card.dataset.day===day);});
  }

  function planDrivingRoute(day,customIds){
    if(!map||!map._amap||!window.AMap||!AMap.Driving)return;
    const ids=customIds&&customIds.length?customIds:dayStops[day]; const panel=document.getElementById('driving-panel');
    if(!ids||ids.length<2){if(panel)panel.innerHTML='<p>这一天以老家休整或本地慢游为主，无需单独规划长距离驾车路线。</p>';return;}
    const stops=ids.map(function(id){return points.find(function(p){return p.id===id;});}).filter(Boolean);
    if(stops.length<2)return;
    activeDrivingDay=day;
    if(driving)driving.clear();
    if(panel)panel.innerHTML='<p>正在向高德请求实时驾车路线…</p>';
    driving=new AMap.Driving({map:map,panel:panel,policy:AMap.DrivingPolicy.LEAST_TIME,province:'京',ferry:1,showTraffic:true,hideMarkers:false});
    const originInput=document.getElementById('route-origin'); const customOrigin=originInput&&originInput.value.trim();
    const origin=customOrigin&&day==='d1'?{keyword:customOrigin}:new AMap.LngLat(stops[0].lng,stops[0].lat);
    const destination=new AMap.LngLat(stops[stops.length-1].lng,stops[stops.length-1].lat);
    const waypoints=stops.slice(1,-1).map(function(p){return new AMap.LngLat(p.lng,p.lat);});
    driving.search(origin,destination,{waypoints:waypoints},function(status,result){
      if(status!=='complete'){if(panel)panel.innerHTML=routeFallback(stops);return;}
      const first=result.routes&&result.routes[0]; if(first&&panel){const km=(first.distance/1000).toFixed(1);const mins=Math.round(first.time/60);const hours=Math.floor(mins/60);const remain=mins%60;panel.insertAdjacentHTML('afterbegin','<div class="driving-summary"><b>高德推荐：约 '+km+' km · '+hours+' 小时 '+remain+' 分</b><span>实时结果仅供出发前参考；国庆当天请再次刷新。</span></div>');}
    });
  }

  function initUI(){
    const toolbar=document.querySelector('.map-toolbar'); if(toolbar&&!toolbar.querySelector('[data-filter="emergency"]')){const b=document.createElement('button');b.className='map-filter';b.type='button';b.dataset.filter='emergency';b.innerHTML='<i class="map-dot map-dot--emergency"></i>医院';toolbar.append(b);b.addEventListener('click',function(){setFilter('emergency');});}
    document.querySelectorAll('.map-filter').forEach(function(btn){btn.addEventListener('click',function(){setFilter(btn.dataset.filter);});});
    const fit=document.getElementById('fit-all'); if(fit)fit.addEventListener('click',function(){setFilter('all');fitAll();});
    document.querySelectorAll('[data-focus-day],.day-card').forEach(function(el){el.addEventListener('click',function(){focusDay(el.dataset.focusDay||el.dataset.day);});});
    document.querySelectorAll('[data-map-id]').forEach(function(btn){btn.addEventListener('click',function(){focusPoint(btn.dataset.mapId);});});
    document.querySelectorAll('.stay-tab').forEach(function(tab){tab.addEventListener('click',function(){document.querySelectorAll('.stay-tab').forEach(function(t){t.classList.toggle('is-active',t===tab);});document.querySelectorAll('.stay-panel').forEach(function(p){p.classList.toggle('is-active',p.dataset.stayPanel===tab.dataset.stay);});});});
    document.querySelectorAll('[data-budget]').forEach(function(btn){btn.addEventListener('click',function(){const mode=btn.dataset.budget;document.querySelectorAll('[data-budget]').forEach(function(b){b.classList.toggle('is-active',b===btn);});document.querySelectorAll('#budget-breakdown dd').forEach(function(dd){dd.textContent=dd.dataset[mode];});document.getElementById('budget-total').textContent=mode==='comfort'?'¥17,000–23,000':'¥11,000–14,500';});});

    const checks=document.querySelectorAll('[data-check]');
    checks.forEach(function(box){box.checked=localStorage.getItem('roadtrip-'+box.dataset.check)==='1';box.addEventListener('change',function(){localStorage.setItem('roadtrip-'+box.dataset.check,box.checked?'1':'0');});});
    const reset=document.getElementById('reset-checklist');if(reset)reset.addEventListener('click',function(){checks.forEach(function(box){box.checked=false;localStorage.removeItem('roadtrip-'+box.dataset.check);});});
    const refresh=document.getElementById('refresh-driving-route');if(refresh)refresh.addEventListener('click',function(){planDrivingRoute(activeDrivingDay||'d1');});
  }

  window.addEventListener('trip:day',function(e){if(map)setTimeout(function(){if(map._amap)map.resize();else map.invalidateSize();focusDay(e.detail);planDrivingRoute(e.detail);},100);});
  window.addEventListener('trip:compose',function(e){
    if(!map||!e.detail||!e.detail.ids)return;
    const ids=e.detail.ids.filter(function(id,index,list){return id&&(index===0||id!==list[index-1]);});
    const stops=ids.map(function(id){return points.find(function(point){return point.id===id;});}).filter(Boolean);
    if(stops.length<2)return;
    activeDay=e.detail.day;setFilter('all');
    stops.forEach(function(point){if(map._amap)markerById[point.id].setMap(map);else markerById[point.id].addTo(map);});
    if(map._amap){routeLine.setPath(stops.map(function(point){return[point.lng,point.lat];}));map.setFitView(stops.map(function(point){return markerById[point.id];}));}
    else{routeLine.setLatLngs(stops.map(function(point){return[point.lat,point.lng];}));map.fitBounds(L.latLngBounds(stops.map(function(point){return[point.lat,point.lng];})),{padding:[38,38],maxZoom:12});}
    planDrivingRoute(e.detail.day,ids);
  });
  window.addEventListener('trip:point',function(e){focusPoint(e.detail);});
  window.addEventListener('trip:resize',function(){if(map)setTimeout(function(){if(map._amap)map.resize();else map.invalidateSize();},100);});
  window.addEventListener('DOMContentLoaded',function(){initMap();initUI();});
})();
