'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, '_data/travel/shandong_2026.yml'), 'utf8'));
const storeSource = fs.readFileSync(path.join(root, 'assets/js/trip-store.js'), 'utf8');
const poiById = Object.fromEntries(data.pois.map((poi) => [poi.id, poi]));

function compileRoute(dayId, selections) {
  const plan = data.choice_plans[dayId];
  if (!plan) return [];
  const result = [];
  plan.sequence.forEach((token) => {
    if (!token.startsWith('@')) return result.push(token);
    const groupId = token.slice(1);
    const chosen = selections[groupId] || [];
    chosen.forEach((id) => { if (id !== '__skip__') result.push(id); });
  });
  return result;
}

function makeStore(entries = {}, hash = '', now = '2026-09-22T12:00:00+08:00') {
  const memory = new Map(Object.entries(entries));
  const NativeDate = Date;
  class FixedDate extends NativeDate {
    constructor(value) { super(value === undefined ? now : value); }
    static now() { return new NativeDate(now).valueOf(); }
  }
  const window = { dispatchEvent() {} };
  const context = {
    window,
    document: {
      getElementById: () => ({ textContent: JSON.stringify(data) }),
      documentElement: { classList: { add() {} } },
      createElement: () => ({ click() {}, remove() {} }),
      body: { appendChild() {} }
    },
    localStorage: {
      getItem: (key) => memory.has(key) ? memory.get(key) : null,
      setItem: (key, value) => memory.set(key, value)
    },
    location: { hash, origin: 'https://zhuyuncheng.github.io', pathname: '/travel/test/' },
    Intl,
    Date: FixedDate,
    JSON,
    Blob,
    URL,
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    atob,
    btoa,
    encodeURIComponent,
    decodeURIComponent,
    console
  };
  vm.runInNewContext(storeSource, context, { filename: 'trip-store.js' });
  return { store: window.TripStore, memory };
}

assert.strictEqual(data.schema_version, 3);
assert.strictEqual(data.days.length, 14, '应包含 D1–D14');
assert.strictEqual(data.pois.filter((poi) => poi.type === 'attraction').length, 25);
assert.strictEqual(data.pois.filter((poi) => poi.type === 'hotel').length, 6);
assert.strictEqual(data.pois.filter((poi) => poi.type === 'charge').length, 9);
assert.strictEqual(data.pois.filter((poi) => poi.type === 'hospital').length, 3);

data.pois.forEach((poi) => {
  assert.ok(poi.id && poi.name && poi.type, `POI 基础字段缺失: ${poi.id}`);
  assert.ok(Number.isFinite(poi.location.lng) && Number.isFinite(poi.location.lat), `POI 坐标无效: ${poi.id}`);
  assert.ok(Number.isFinite(poi.route_target.lng) && Number.isFinite(poi.route_target.lat), `导航落点无效: ${poi.id}`);
  assert.ok(Array.isArray(poi.photos) && poi.photos.length, `图片信息缺失: ${poi.id}`);
});

Object.entries(data.choice_groups).forEach(([groupId, group]) => {
  assert.ok(['single', 'multi'].includes(group.mode), `候选模式无效: ${groupId}`);
  group.options.forEach((option) => {
    assert.ok(option.id === null || option.id === '__skip__' || poiById[option.id], `候选 POI 不存在: ${groupId}/${option.id}`);
  });
});

Object.entries(data.choice_plans).forEach(([dayId, plan]) => {
  assert.ok(data.days.some((day) => day.id === dayId), `未知日期方案: ${dayId}`);
  plan.groups.forEach((groupId) => assert.ok(data.choice_groups[groupId], `未知候选组: ${groupId}`));
  plan.sequence.forEach((token) => {
    if (token.startsWith('@')) assert.ok(data.choice_groups[token.slice(1)], `路线候选组不存在: ${token}`);
    else assert.ok(poiById[token], `路线 POI 不存在: ${token}`);
  });
});

const defaultRoutes = Object.keys(data.choice_plans).map((dayId) => compileRoute(dayId, data.defaults));
defaultRoutes.forEach((route) => {
  assert.ok(route.length >= 2, '默认路线至少应有起终点');
  assert.ok(poiById[route[0]] && poiById[route[route.length - 1]], '默认路线起终点必须有效');
});

// 默认方案、酒店单选与景点多选。
let runtime = makeStore();
assert.deepStrictEqual(JSON.parse(JSON.stringify(runtime.store.getState().selections)), data.defaults);
runtime.store.toggleChoice('hotel-yantai', 'h-yantai-b');
assert.deepStrictEqual(Array.from(runtime.store.getState().selections['hotel-yantai']), ['h-yantai-b']);
runtime.store.toggleChoice('attraction-penglai', 'a-sanxian');
assert.ok(runtime.store.getState().selections['attraction-penglai'].includes('a-sanxian'));

// 手动路线顺序持久化。
runtime.store.setRouteOrder('d5', ['a-weifang', 'a-penglai', 'h-yantai-a']);
const savedState = JSON.parse(runtime.memory.get('trip-plan-v3'));
assert.deepStrictEqual(savedState.routeOrders.d5, ['a-weifang', 'a-penglai', 'h-yantai-a']);

// 旧版选择迁移。
runtime = makeStore({ 'trip-choice-v2-hotel-yantai': JSON.stringify('h-yantai-b') });
assert.deepStrictEqual(Array.from(runtime.store.getState().selections['hotel-yantai']), ['h-yantai-b']);

// 导入状态与损坏输入防护。
const exported = runtime.store.getState();
exported.selectedDay = 'd9';
runtime.store.importState(exported);
assert.strictEqual(runtime.store.getState().selectedDay, 'd9');
assert.throws(() => runtime.store.importState({ tripId: 'wrong-trip' }));

// 分享数据可还原，且不包含住址或旅行日记。
const shareUrl = runtime.store.shareUrl();
const encoded = shareUrl.split('#plan=')[1].replace(/-/g, '+').replace(/_/g, '/');
const shareText = decodeURIComponent(Array.from(Buffer.from(encoded, 'base64')).map((byte) => `%${byte.toString(16).padStart(2, '0')}`).join(''));
const shared = JSON.parse(shareText);
assert.strictEqual(shared.tripId, data.trip.id);
assert.ok(!('journal' in shared) && !('homeAddress' in shared) && !('beijingAddress' in shared));

// 上海时区日期映射。
assert.strictEqual(makeStore({}, '', '2026-09-23T08:00:00+08:00').store.currentTripDay(), 'd1');
assert.strictEqual(makeStore({}, '', '2026-10-06T08:00:00+08:00').store.currentTripDay(), 'd14');
assert.strictEqual(makeStore({}, '', '2026-10-07T08:00:00+08:00').store.currentTripDay(), null);

// 路线冲突判定的核心边界：过多景点与长途无补能。
function detectRouteConflicts(day, route) {
  const attractions = route.filter((id) => poiById[id] && poiById[id].type === 'attraction');
  return {
    overloaded: route.length > 7 || attractions.length > 3,
    missingCharge: /520|580/.test(day.distance) && !route.some((id) => poiById[id] && poiById[id].type === 'charge')
  };
}
assert.strictEqual(detectRouteConflicts(data.days[0], ['a-beijing', 'a-weifang']).missingCharge, true);
assert.strictEqual(detectRouteConflicts(data.days[0], defaultRoutes[0]).missingCharge, false);
assert.strictEqual(detectRouteConflicts(data.days[0], ['a-beijing', 'a-penglai', 'a-sanxian', 'a-yantaishan', 'a-underwater', 'r-yantai', 'c-yantai', 'h-yantai-a']).overloaded, true);

console.log(`trip data OK: ${data.days.length} days, ${data.pois.length} POIs, ${Object.keys(data.choice_groups).length} groups`);
