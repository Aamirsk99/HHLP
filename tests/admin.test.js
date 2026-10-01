// Clinic admin (admin/js/core.js): loads in Node and carries the rebrand over to existing data.
const test = require('node:test');
const assert = require('node:assert');
const A = require('../admin/js/core.js');

test('new clinic admin data is branded The Prime Fit', () => {
  const admin = A.createAdmin(A.memoryStorage());
  assert.strictEqual(admin.state.settings.clinic, 'The Prime Fit');
});

test('saved data with the old default clinic name is renamed; a custom name is kept', () => {
  const old = A.memoryStorage();
  const s = A.defaultState(); s.settings.clinic = 'Hindivine Healthcare';
  old.setItem(A.KEY, JSON.stringify(s));
  assert.strictEqual(A.createAdmin(old).state.settings.clinic, 'The Prime Fit');

  const custom = A.memoryStorage();
  const c = A.defaultState(); c.settings.clinic = 'Prime Fit Kolkata';
  custom.setItem(A.KEY, JSON.stringify(c));
  assert.strictEqual(A.createAdmin(custom).state.settings.clinic, 'Prime Fit Kolkata');
});
