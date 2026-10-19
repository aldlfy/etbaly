import { describe, it, expect } from 'vitest';
import { db } from '@/db';

describe('IndexedDB Dexie Schema', () => {
  it('instantiates ExamForgeDB database instance with expected tables', () => {
    expect(db.name).toBe('ExamForgeDB');
    expect(db.tables.map(t => t.name)).toEqual(
      expect.arrayContaining(['exams', 'schoolProfiles', 'assetBlobs', 'questionBank'])
    );
  });
});
