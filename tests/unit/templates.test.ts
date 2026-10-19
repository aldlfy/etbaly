import { describe, it, expect } from 'vitest';
import { SAMPLE_EXAM_TEMPLATES } from '@/features/templates/data/sampleExams';

describe('Phase 8: Pre-configured Ministerial Exam Templates Library', () => {
  it('provides a curated library of rich ministerial exam templates', () => {
    expect(SAMPLE_EXAM_TEMPLATES.length).toBeGreaterThanOrEqual(3);

    const subjects = SAMPLE_EXAM_TEMPLATES.map((t) => t.subject);
    expect(subjects).toContain('الفيزياء');
    expect(subjects).toContain('الرياضيات');
    expect(subjects).toContain('الكيمياء');
  });

  it('validates Physics template structure, KaTeX math formulas and marks', () => {
    const phys = SAMPLE_EXAM_TEMPLATES.find((t) => t.subject === 'الفيزياء');
    expect(phys).toBeDefined();
    expect(phys?.exam.metadata.totalMarks).toBe(100);
    expect(phys?.exam.questions).toBeDefined();
    expect(phys?.exam.questions?.length).toBe(5);

    // Verify formulas
    const q1 = phys?.exam.questions?.[0];
    expect(q1?.type).toBe('multi_part');
    expect(q1?.parts?.[1].content).toContain('$');

    const q3 = phys?.exam.questions?.[2];
    expect(q3?.type).toBe('calculation');
    expect(q3?.answerSpaceType).toBe('dotted_lines');
  });

  it('validates Mathematics template calculus and geometry structure', () => {
    const math = SAMPLE_EXAM_TEMPLATES.find((t) => t.subject === 'الرياضيات');
    expect(math).toBeDefined();
    expect(math?.exam.metadata.grade).toBe('السادس العلمي');
    expect(math?.exam.questions?.length).toBe(5);

    // Q2 should be calculation with grid answer space
    const q2 = math?.exam.questions?.[1];
    expect(q2?.type).toBe('calculation');
    expect(q2?.answerSpaceType).toBe('grid_box');
    expect(q2?.prompt).toContain('\\int');
  });

  it('validates Chemistry template formulas and mhchem notation', () => {
    const chem = SAMPLE_EXAM_TEMPLATES.find((t) => t.subject === 'الكيمياء');
    expect(chem).toBeDefined();
    expect(chem?.exam.metadata.grade).toBe('الثالث المتوسط');
    expect(chem?.exam.questions?.length).toBe(5);

    // Q3 should be MCQ with chemical reaction equations
    const q3 = chem?.exam.questions?.[2];
    expect(q3?.type).toBe('mcq');
    expect(q3?.mcqOptions?.[0].text).toContain('\\ce{');
  });
});
