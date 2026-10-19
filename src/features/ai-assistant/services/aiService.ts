import type { AIQuestionRequest, AIQuestionResponse } from '../types';
import type { QuestionData } from '@/features/questions/types';
import { supabase } from '@/lib/supabase';

/**
 * Intelligent curriculum templates for client-side generation / offline fallback
 */
function generateCurriculumFallback(req: AIQuestionRequest): QuestionData {
  const qId = 'ai-q-' + Date.now();

  switch (req.questionType) {
    case 'multi_part':
      return {
        id: qId,
        type: 'multi_part',
        prompt: `أجب عن الفرعين الآتيين في مادة ${req.subject} (${req.topic || 'المفاهيم العامة'}):`,
        marks: req.difficulty === 'hard' ? 25 : 20,
        direction: 'rtl',
        parts: [
          {
            id: 'p1',
            letter: 'أ',
            content: `اشرح المبدأ الأساسي لـ "${req.topic || 'الظاهرة'}" مبيناً الصيغة الرياضية $f(x) = \\int_0^t v(s) ds$ ووحدات القياس الدولية.`,
            marks: 10,
          },
          {
            id: 'p2',
            letter: 'ب',
            content: `إذا كانت القيمة المعطاة $k = 4.5\\times 10^3\\text{ N/m}$، احسب مقدار الاستطالة $\\Delta x$ عندما تؤثر قوة مقدارها $F = 90\\text{ N}$.`,
            marks: 10,
          },
        ],
      };

    case 'mcq':
      return {
        id: qId,
        type: 'mcq',
        prompt: `اختر الإجابة الصحيحة من بين الأقواس لما يأتي في مادة ${req.subject}:`,
        marks: 10,
        direction: 'rtl',
        mcqLayout: 'horizontal',
        mcqOptions: [
          { id: 'opt1', letter: 'أ', text: '$E_k = \\frac{1}{2} m v^2$' },
          { id: 'opt2', letter: 'ب', text: '$E_k = m \\cdot g \\cdot h$' },
          { id: 'opt3', letter: 'ج', text: '$E_k = \\frac{v^2}{2m}$' },
          { id: 'opt4', letter: 'د', text: '$E_k = m \\cdot v$' },
        ],
      };

    case 'calculation':
      return {
        id: qId,
        type: 'calculation',
        prompt: `مسألة في ${req.subject} (${req.topic || 'التطبيقات الحسابية'}): يتحرك جسم كتلته $m = 12\\text{ kg}$ بسرعة ابتدائية $v_0 = 10\\text{ m/s}$ بتسارع منتظم $a = 2.5\\text{ m/s}^2$. احسب المسافة المقطوعة $d$ والسرعة النهائية $v_f$ بعد مرور زمن $t = 6\\text{ s}$ مبيناً خطوات الحل بالقانون الرياضي:`,
        marks: 15,
        direction: 'rtl',
        answerSpaceType: 'dotted_lines',
        answerSpaceLines: 6,
      };

    case 'true_false':
      return {
        id: qId,
        type: 'true_false',
        prompt: `بيّن صحة أو خطأ العبارات الآتية مع تصحيح الخطأ إن وجد في ${req.subject}:`,
        marks: 15,
        direction: 'rtl',
        tfStatements: [
          { id: 'tf1', text: `تتناسب القوة المؤثرة طردياً مع التسارع المكتسب وفق قانون نيوتن الثاني: $\\vec{F} = m \\cdot \\vec{a}$.`, marks: 5 },
          { id: 'tf2', text: `تزداد المقاومة الكهربائية لسلك موصل بنقصان طوله وثبوت مساحة مقطعه العرضي.`, marks: 5 },
          { id: 'tf3', text: `الطاقة الكلية لنظام معزول تبقى ثابتة وتتحول من شكل لآخر.`, marks: 5 },
        ],
      };

    case 'essay':
    default:
      return {
        id: qId,
        type: 'essay',
        prompt: `علل ما يأتي تعليلاً علمياً دقيقاً في موضوع (${req.topic || req.subject}): ما هو سبب حدوث هذه الظاهرة وفق القوانين العلمية المعتمدة؟ مع ذكر مثالين واقعيين يدعمان إجابتك.`,
        marks: 15,
        direction: 'rtl',
      };
  }
}

/**
 * Generate question by calling the backend worker or fallback engine
 */
export async function generateAIQuestion(
  req: AIQuestionRequest,
  workerUrl = 'https://examforge-ai-proxy.workers.dev'
): Promise<AIQuestionResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // If online with token, try calling the worker proxy
    if (token && workerUrl && !workerUrl.includes('example')) {
      try {
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req),
        });

        if (response.ok) {
          const generatedJson = (await response.json()) as QuestionData;
          return {
            success: true,
            question: {
              ...generatedJson,
              id: 'ai-q-' + Date.now(),
            },
          };
        }
      } catch (networkErr) {
        console.warn('Worker call failed, falling back to client engine:', networkErr);
      }
    }

    // Client-side fallback
    const fallbackQuestion = generateCurriculumFallback(req);
    return {
      success: true,
      question: fallbackQuestion,
      usedFallback: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل توليد السؤال';
    return {
      success: false,
      error: msg,
    };
  }
}
