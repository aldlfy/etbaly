export interface MathSymbolItem {
  id: string;
  label: string;       // Displayed on the button
  latex: string;       // LaTeX template inserted
  tooltip: string;     // Arabic tooltip
  category: 'algebra' | 'calculus' | 'physics' | 'chemistry' | 'matrices' | 'greek';
}

export const ALGEBRA_PALETTE: MathSymbolItem[] = [
  { id: 'frac', label: 'a/b', latex: '\\frac{a}{b}', tooltip: 'كسر اعتيادي', category: 'algebra' },
  { id: 'sqrt', label: '√x', latex: '\\sqrt{x}', tooltip: 'جذر تربيعي', category: 'algebra' },
  { id: 'nroot', label: 'ⁿ√x', latex: '\\sqrt[n]{x}', tooltip: 'جذر نوني', category: 'algebra' },
  { id: 'power', label: 'xⁿ', latex: 'x^{n}', tooltip: 'قوة / أس', category: 'algebra' },
  { id: 'sub', label: 'xₙ', latex: 'x_{n}', tooltip: 'رمز سفلي', category: 'algebra' },
  { id: 'pm', label: '±', latex: '\\pm', tooltip: 'زائد أو ناقص', category: 'algebra' },
  { id: 'times', label: '×', latex: '\\times', tooltip: 'علامة الضرب', category: 'algebra' },
  { id: 'div', label: '÷', latex: '\\div', tooltip: 'علامة القسمة', category: 'algebra' },
  { id: 'abs', label: '|x|', latex: '|x|', tooltip: 'القيمة المطلقة', category: 'algebra' },
  { id: 'neq', label: '≠', latex: '\\neq', tooltip: 'لا يساوي', category: 'algebra' },
  { id: 'leq', label: '≤', latex: '\\le', tooltip: 'أصغر أو يساوي', category: 'algebra' },
  { id: 'geq', label: '≥', latex: '\\ge', tooltip: 'أكبر أو يساوي', category: 'algebra' },
];

export const CALCULUS_PALETTE: MathSymbolItem[] = [
  { id: 'int', label: '∫', latex: '\\int f(x) dx', tooltip: 'تكامل غير محدد', category: 'calculus' },
  { id: 'defint', label: '∫ₐᵇ', latex: '\\int_{a}^{b} f(x) dx', tooltip: 'تكامل محدد من a إلى b', category: 'calculus' },
  { id: 'lim', label: 'lim', latex: '\\lim_{x \\to 0} f(x)', tooltip: 'الغاية عند اقتراب x من الصفر', category: 'calculus' },
  { id: 'sum', label: '∑', latex: '\\sum_{i=1}^{n} x_i', tooltip: 'المجموع التراكمي', category: 'calculus' },
  { id: 'diff', label: 'dy/dx', latex: '\\frac{dy}{dx}', tooltip: 'المشتقة الأولى', category: 'calculus' },
  { id: 'diff2', label: 'd²y/dx²', latex: '\\frac{d^{2}y}{dx^{2}}', tooltip: 'المشتقة الثانية', category: 'calculus' },
  { id: 'inf', label: '∞', latex: '\\infty', tooltip: 'ما لا نهاية', category: 'calculus' },
  { id: 'partial', label: '∂f/∂x', latex: '\\frac{\\partial f}{\\partial x}', tooltip: 'المشتقة الجزئية', category: 'calculus' },
];

export const PHYSICS_PALETTE: MathSymbolItem[] = [
  { id: 'vec', label: 'F⃗', latex: '\\vec{F}', tooltip: 'متجه القوة', category: 'physics' },
  { id: 'unit_acc', label: 'm/s²', latex: '\\text{m/s}^{2}', tooltip: 'وحدة التسارع (متر/ثانية²)', category: 'physics' },
  { id: 'unit_n', label: 'N', latex: '\\text{N}', tooltip: 'نيوتن', category: 'physics' },
  { id: 'unit_j', label: 'J', latex: '\\text{J}', tooltip: 'جول (طاقة / شغل)', category: 'physics' },
  { id: 'unit_kg', label: 'kg', latex: '\\text{kg}', tooltip: 'كيلوغرام', category: 'physics' },
  { id: 'unit_v', label: 'V', latex: '\\text{V}', tooltip: 'فولت (فرق الجهد)', category: 'physics' },
  { id: 'unit_a', label: 'A', latex: '\\text{A}', tooltip: 'أمبير (التيار الكهربائي)', category: 'physics' },
  { id: 'unit_ohm', label: 'Ω', latex: '\\Omega', tooltip: 'أوم (المقاومة)', category: 'physics' },
  { id: 'unit_uf', label: 'μF', latex: '\\mu\\text{F}', tooltip: 'مايكروفاراد (سعة المتسعة)', category: 'physics' },
  { id: 'delta', label: 'Δt', latex: '\\Delta t', tooltip: 'التغير في الزمن', category: 'physics' },
];

export const CHEMISTRY_PALETTE: MathSymbolItem[] = [
  { id: 'reaction', label: 'A + B → C', latex: '2H_2 + O_2 \\longrightarrow 2H_2O', tooltip: 'معادلة كيميائية سهمية', category: 'chemistry' },
  { id: 'equil', label: '⇌', latex: 'N_2 + 3H_2 \\rightleftharpoons 2NH_3', tooltip: 'تفاعل انعكاسي في حالة اتزان', category: 'chemistry' },
  { id: 'heat_arrow', label: '→[Δ]', latex: 'CaCO_3 \\xrightarrow{\\Delta} CaO + CO_2 \\uparrow', tooltip: 'تفاعل بتأثير الحرارة وتصاعد غاز', category: 'chemistry' },
  { id: 'ion', label: 'Fe²⁺', latex: '\\text{Fe}^{2+} + 2e^{-} \\longrightarrow \\text{Fe}', tooltip: 'تفاعل نصفي تأكسد واختزال بالأيونات', category: 'chemistry' },
  { id: 'conc', label: '[H⁺]', latex: '[\\text{H}^+]', tooltip: 'تركيز أيونات الهيدروجين', category: 'chemistry' },
  { id: 'ph', label: 'pH', latex: '\\text{pH} = -\\log[\\text{H}^+]', tooltip: 'قانون الرقم الهيدروجيني', category: 'chemistry' },
];

export const MATRIX_PALETTE: MathSymbolItem[] = [
  { id: 'mat2x2', label: '[2×2]', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', tooltip: 'مصفوفة رتبة 2×2', category: 'matrices' },
  { id: 'det2x2', label: '|2×2|', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', tooltip: 'محدد مصفوفة رتبة 2×2', category: 'matrices' },
  { id: 'mat3x3', label: '[3×3]', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', tooltip: 'مصفوفة رتبة 3×3', category: 'matrices' },
];

export const GREEK_PALETTE: MathSymbolItem[] = [
  { id: 'alpha', label: 'α', latex: '\\alpha', tooltip: 'ألفا', category: 'greek' },
  { id: 'beta', label: 'β', latex: '\\beta', tooltip: 'بيتا', category: 'greek' },
  { id: 'gamma', label: 'γ', latex: '\\gamma', tooltip: 'غاما', category: 'greek' },
  { id: 'theta', label: 'θ', latex: '\\theta', tooltip: 'ثيتا (زاوية)', category: 'greek' },
  { id: 'lambda', label: 'λ', latex: '\\lambda', tooltip: 'لامبدا (طول موجي)', category: 'greek' },
  { id: 'pi', label: 'π', latex: '\\pi', tooltip: 'النسبة الثابتة باي', category: 'greek' },
  { id: 'omega', label: 'ω', latex: '\\omega', tooltip: 'أوميغا (تردد زاوي)', category: 'greek' },
  { id: 'sigma', label: 'σ', latex: '\\sigma', tooltip: 'سيغما', category: 'greek' },
];
