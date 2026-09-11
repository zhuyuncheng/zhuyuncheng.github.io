'use strict';
const assert = require('assert');
const { simulate } = require('../assets/js/trip-simulation');
const poi = (id, type, lng) => ({ id, type, location: { lng, lat:36 } });
const route = [poi('a','anchor',119), poi('b','charge',120), poi('c','hotel',121)];
const metric = { distanceKm:400, durationSeconds:14400 };
const result = simulate(route, { departure:'08:00', soc:90, target:80 }, metric);
assert.equal(result.km, 400);
assert.equal(result.rows[1].low, 40);
assert.equal(result.rows[2].low, 30);
assert.equal(result.end, 760);
assert.equal(simulate(route, { departure:'09:00', soc:90, target:80 }, metric).end-result.end, 60);
assert.ok(simulate(route, { departure:'08:00', soc:10, target:80 }, metric).rows[1].low < 0);
assert.equal(simulate([route[0], route[0]], {soc:80}, null).km, 0);
const exact = simulate(route, { departure:'08:00', soc:90, target:80, stays:{b:60} }, metric, {
  0:{distanceKm:100,durationSeconds:3600}, 1:{distanceKm:150,durationSeconds:7200}
});
assert.equal(exact.km,250);
assert.equal(exact.rows[1].arrival,540);
assert.equal(exact.end,720);
assert.equal(exact.rows[2].low,42.5);
assert.equal(exact.rows[1].exact,true);
const waiting = simulate(route, {departure:'08:00',soc:90,appointments:{b:700}}, metric);
assert.equal(waiting.rows[1].arrival,700);
assert.equal(waiting.rows[1].late,0);
const late = simulate(route, {departure:'08:00',soc:90,appointments:{b:500}}, metric);
assert.ok(late.rows[1].late>0);
console.log('trip simulation OK: departure, charge, reserve and zero-distance cases');
