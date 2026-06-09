import assert from 'node:assert/strict';
import test from 'node:test';
import { coerceListFieldValue, ensureArrayItemsHaveId, getSectionListField } from './section-content-normalization';

test('getSectionListField maps list-based section types', () => {
  assert.equal(getSectionListField('projects'), 'items');
  assert.equal(getSectionListField('skills'), 'categories');
  assert.equal(getSectionListField('summary'), null);
});

test('coerceListFieldValue accepts valid array payload', () => {
  const payload = JSON.stringify([{ id: 'proj-1', name: 'Project A' }]);
  const result = coerceListFieldValue(payload, 'items');
  assert.ok(Array.isArray(result));
  assert.equal(result?.length, 1);
  assert.equal((result?.[0] as any).id, 'proj-1');
});

test('coerceListFieldValue decodes double-encoded array payload', () => {
  const payload = JSON.stringify(JSON.stringify([{ id: 'proj-2', name: 'Project B' }]));
  const result = coerceListFieldValue(payload, 'items');
  assert.ok(Array.isArray(result));
  assert.equal(result?.length, 1);
  assert.equal((result?.[0] as any).id, 'proj-2');
});

test('coerceListFieldValue rejects plain string payload', () => {
  const result = coerceListFieldValue('just some text', 'items');
  assert.equal(result, null);
});

test('coerceListFieldValue rejects object-form non-array items payload', () => {
  const payload = JSON.stringify({ items: { id: 'oops' } });
  const result = coerceListFieldValue(payload, 'items');
  assert.equal(result, null);
});

test('ensureArrayItemsHaveId adds missing ids for object items', () => {
  const result = ensureArrayItemsHaveId([{ name: 'No ID' }, { id: 'keep-me', name: 'Has ID' }]);
  assert.equal(result.length, 2);
  assert.ok((result[0] as any).id);
  assert.equal((result[1] as any).id, 'keep-me');
});
