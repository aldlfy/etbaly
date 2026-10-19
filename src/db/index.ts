import Dexie, { type Table } from 'dexie';
import type { Exam, SchoolProfile, AssetBlob, QuestionBankItem } from './models';

export class ExamForgeDatabase extends Dexie {
  exams!: Table<Exam, string>;
  schoolProfiles!: Table<SchoolProfile, string>;
  assetBlobs!: Table<AssetBlob, string>;
  questionBank!: Table<QuestionBankItem, string>;

  constructor() {
    super('ExamForgeDB');
    this.version(1).stores({
      exams: 'id, title, schoolProfileId, createdAt, updatedAt',
      schoolProfiles: 'id, schoolName, createdAt',
      assetBlobs: 'id, name, createdAt',
      questionBank: 'id, subject, grade, difficulty, type, *tags, createdAt',
    });
  }
}

export const db = new ExamForgeDatabase();
