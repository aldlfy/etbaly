import React from 'react';
import type { ExamHeaderData } from '@/features/exam-header/types';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '../types';

interface MiniHeaderProps {
  header: ExamHeaderData;
  pageNumber: number;
  totalPages: number;
  digitStyle?: DigitStyle;
}

export const MiniHeader: React.FC<MiniHeaderProps> = ({
  header,
  pageNumber,
  totalPages,
  digitStyle = 'eastern',
}) => {
  return (
    <div className="mini-header mb-4 pb-2 border-b-2 border-black flex items-center justify-between text-xs font-bold text-black select-none">
      <div className="flex items-center gap-2">
        <span>{header.ministry}</span>
        {header.schoolName && <span>• {header.schoolName}</span>}
      </div>

      <div className="text-center font-extrabold text-sm">
        <span>تابع أسئلة امتحان: {header.subject} ({header.grade})</span>
      </div>

      <div className="flex items-center gap-1.5 font-bold">
        <span>صفحة</span>
        <span>{formatDigits(pageNumber, digitStyle)}</span>
        <span>من</span>
        <span>{formatDigits(totalPages, digitStyle)}</span>
      </div>
    </div>
  );
};
