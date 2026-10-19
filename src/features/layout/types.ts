export type PageSize = 'A4' | 'A3' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginPreset = 'narrow' | 'standard' | 'wide' | 'custom';
export type BaseFont = 'cairo' | 'amiri' | 'tajawal' | 'noto';
export type DigitStyle = 'eastern' | 'western';

export interface PageMargins {
  top: number;    // mm
  right: number;  // mm
  bottom: number; // mm
  left: number;   // mm
}

export interface ExamPageSettings {
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
  marginPreset: MarginPreset;
  columns: 1 | 2;
  baseFont: BaseFont;
  fontSizePt: number;
  lineSpacing: number;
  digitStyle: DigitStyle;
  showPageNumbers: boolean;
  repeatMiniHeaderOnSubsequentPages: boolean;
  columnRule: boolean; // draw line between 2 columns
}

export const MARGIN_PRESETS: Record<Exclude<MarginPreset, 'custom'>, PageMargins> = {
  narrow: { top: 8, right: 8, bottom: 8, left: 8 },
  standard: { top: 12, right: 12, bottom: 12, left: 12 },
  wide: { top: 20, right: 20, bottom: 20, left: 20 },
};

export const DEFAULT_PAGE_SETTINGS: ExamPageSettings = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: MARGIN_PRESETS.standard,
  marginPreset: 'standard',
  columns: 1,
  baseFont: 'cairo',
  fontSizePt: 12,
  lineSpacing: 1.4,
  digitStyle: 'eastern',
  showPageNumbers: true,
  repeatMiniHeaderOnSubsequentPages: true,
  columnRule: true,
};

export interface PageChunk {
  pageNumber: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  questionIds: string[];
}
