'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const head = read('_includes/head.html');
const page = read('_posts/2026-09-07-shandong-peninsula-family-ev-road-trip.html');
const desktop = read('assets/css/roadtrip.css');
const mobile = read('assets/css/roadtrip-mobile.css');

assert.ok(page.includes('class="roadtrip trip-v3"'), '旅行页必须保留隔离样式根节点 .trip-v3');
assert.ok(page.includes('roadtrip: true'), '旅行页必须显式启用专用资源');
assert.ok(head.includes("site.time | date: '%s'"), '旅行资源必须携带构建版本号，避免缓存混用');

[
  '/assets/css/roadtrip.css',
  '/assets/css/roadtrip-mobile.css',
  '/assets/js/trip-store.js',
  '/assets/js/shandong-roadtrip.js',
  '/assets/js/trip-details.js',
  '/assets/js/trip-planner.js'
].forEach((asset) => assert.ok(head.includes(asset), `head 未加载 ${asset}`));

assert.ok(desktop.length > 18000, '桌面样式文件异常变短，可能被误覆盖');
assert.ok(mobile.length > 3000, '移动样式文件异常变短，可能被误覆盖');
assert.ok(desktop.startsWith('.trip-v3{'), '旅行主题变量必须限制在 .trip-v3 内');
assert.ok(!desktop.includes(':root{'), '旅行页不得覆盖全站 :root 变量');
assert.ok(!/position::|border:px|border-radius:none/.test(desktop), '旅行样式含无效声明');

[
  '.trip-hero', '.trip-topbar', '.trip-workspace', '.trip-day-editor',
  '.trip-map-panel', '.trip-plan-grid', '.trip-today-grid', '.trip-catalog-grid',
  '.trip-drawer-layer', '.trip-route-order'
].forEach((selector) => assert.ok(desktop.includes(selector), `关键样式缺失: ${selector}`));

assert.ok(mobile.includes('@media(max-width:700px)'), '移动端主断点缺失');
assert.ok(mobile.includes('.trip-mobile-nav'), '移动端底部导航样式缺失');
assert.ok(mobile.includes('overflow-x:hidden'), '移动端横向溢出保护缺失');

console.log('roadtrip UI contract OK: scoped CSS, versioned assets, desktop/mobile selectors present');
