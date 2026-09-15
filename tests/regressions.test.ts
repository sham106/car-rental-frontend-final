import assert from 'node:assert/strict';
import { test } from 'node:test';
import { html } from '../src/utils/html.ts';
import { addDays, getTodayString, isValidDateString, validateDateSelection, calculateRentalDays } from '../src/utils/dateUtils.ts';
const start = addDays(getTodayString(), 30);
const end = addDays(start, 3);

// Booking/permission regression coverage moved to backend/tests/test_fleet.py and database.mjs.
test('date validation rejects impossible and malformed dates, including invalid leap days', () => {
  for (const date of ['2027-02-29', '2030-02-31', '2030-13-01', '2030-1-01', 'not-a-date']) assert.equal(isValidDateString(date), false);
  assert.equal(isValidDateString('2028-02-29'), true);
  assert.equal(validateDateSelection('2030-02-31', '2030-03-03').isValid, false);
  assert.equal(calculateRentalDays(start, start), 1);
  assert.equal(calculateRentalDays(start, end), 3);
});

test('printed customer input is rendered as text, including closing tags and scripts', () => {
  const unsafe = '<img src=x onerror="alert(1)">&';
  const output = html`<p>${unsafe}</p>`;
  assert.equal(output, '<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;</p>');
});

