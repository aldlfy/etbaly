export interface SampleQuestion {
  id: string;
  category: 'algebra' | 'calculus' | 'mechanics' | 'circuits' | 'chemistry' | 'english';
  categoryLabel: string;
  title: string;
  direction: 'rtl' | 'ltr';
  marks: number;
  content: string; // HTML with math formulas
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  // --- 1. ALGEBRA (5 questions) ---
  {
    id: 'alg-1',
    category: 'algebra',
    categoryLabel: 'الجبر والحساب',
    title: 'حل المعادلة التربيعية باستخدام القانون العام (الدستور)',
    direction: 'rtl',
    marks: 10,
    content: `جد مجموعة حل المعادلة التربيعية الآتية في مجموعة الأعداد الحقيقية $\\mathbb{R}$ باستخدام القانون العام (الدستور):
<div class="my-2 text-center">$2x^2 - 4x - 6 = 0$</div>
ثم تحقق من صحة الحل بضرب الجذرين وجمعهما مستخدماً العلاقات:
<div class="my-2 text-center">$x_1 + x_2 = -\\frac{b}{a} \\quad , \\quad x_1 \\cdot x_2 = \\frac{c}{a}$</div>`
  },
  {
    id: 'alg-2',
    category: 'algebra',
    categoryLabel: 'الجبر والحساب',
    title: 'تبسيط المقادير الجبرية والكسور النسبية',
    direction: 'rtl',
    marks: 10,
    content: `ضع المقدار الجبري الآتي في أبسط صورة ممكنة:
<div class="my-2 text-center">$\\frac{x^3 - 8}{x^2 - 4} \\div \\frac{x^2 + 2x + 4}{2x + 4}$</div>
موضحاً خطوات تحليل فرق بين مكعبين وفرق بين مربعين.`
  },
  {
    id: 'alg-3',
    category: 'algebra',
    categoryLabel: 'الجبر والحساب',
    title: 'حل متباينة القيمة المطلقة بيانيا وجبريا',
    direction: 'rtl',
    marks: 10,
    content: `حل متباينة القيمة المطلقة الآتية ومثّل مجموعة الحل على مستقيم الأعداد:
<div class="my-2 text-center">$|2x - 5| \\le 7$</div>`
  },
  {
    id: 'alg-4',
    category: 'algebra',
    categoryLabel: 'الجبر والحساب',
    title: 'المتتابعات الحسابية والهندسية',
    direction: 'rtl',
    marks: 10,
    content: `متتابعة حسابية حدها الثالث يساوي $9$ وحدها السابع يساوي $-3$. جد الحد الأول $a$ والأساس $d$، ثم اكتب الحدود الخمسة الأولى للمتتابعة مستخدماً القانون:
<div class="my-2 text-center">$u_n = a + (n - 1)d$</div>`
  },
  {
    id: 'alg-5',
    category: 'algebra',
    categoryLabel: 'الجبر والحساب',
    title: 'المصفوفات والمحددات وحل نظام خطي (طريقة كرامر)',
    direction: 'rtl',
    marks: 10,
    content: `باستخدام طريقة كرامر (المحددات)، جد قيمتي $x$ و $y$ للنظام الخطي الآتي:
<div class="my-2 text-center">$\\begin{cases} 3x + 2y = 12 \\\\ 5x - y = 7 \\end{cases}$</div>
حيث $\\Delta = \\begin{vmatrix} 3 & 2 \\\\ 5 & -1 \\end{vmatrix}$ و $x = \\frac{\\Delta_x}{\\Delta}$ و $y = \\frac{\\Delta_y}{\\Delta}$.`
  },

  // --- 2. CALCULUS (5 questions) ---
  {
    id: 'calc-1',
    category: 'calculus',
    categoryLabel: 'التفاضل والتكامل',
    title: 'إيجاد غايات الدوال الكسرية والمثلثية',
    direction: 'rtl',
    marks: 10,
    content: `احسب كلاً من الغايات الرياضية الآتية:
<div class="my-2 text-center">
(أ) $\\lim_{x \\to 2} \\frac{x^2 - 4}{x^2 - 3x + 2} \\qquad$ (ب) $\\lim_{x \\to 0} \\frac{\\sin(5x)}{\\tan(2x)}$
</div>`
  },
  {
    id: 'calc-2',
    category: 'calculus',
    categoryLabel: 'التفاضل والتكامل',
    title: 'قواعد الاشتقاق وقاعدة السلسلة (Chain Rule)',
    direction: 'rtl',
    marks: 10,
    content: `إذا كانت $y = (3x^2 - 5x + 1)^4$، فجد المشتقة الأولى $\\frac{dy}{dx}$ والمشتقة الثانية $\\frac{d^2y}{dx^2}$ عند النقطة $x = 1$.`
  },
  {
    id: 'calc-3',
    category: 'calculus',
    categoryLabel: 'التفاضل والتكامل',
    title: 'تطبيقات المشتقة (معادلة مماس المنحني والعمودي عليه)',
    direction: 'rtl',
    marks: 10,
    content: `جد معادلة المستقيم المماس ومعادلة المستقيم العمودي على المماس لمنحني الدالة $f(x) = x^3 - 3x + 2$ عند النقطة التي إحداثيها السيني $x = 2$.`
  },
  {
    id: 'calc-4',
    category: 'calculus',
    categoryLabel: 'التفاضل والتكامل',
    title: 'التكامل غير المحدد للدوال الجبرية',
    direction: 'rtl',
    marks: 10,
    content: `أوجد ناتج كل من التكاملات غير المحددة الآتية:
<div class="my-2 text-center">
(أ) $\\int (4x^3 - 6x^2 + 2x - 5) dx \\qquad$ (ب) $\\int x \\sqrt{x^2 + 9} dx$
</div>`
  },
  {
    id: 'calc-5',
    category: 'calculus',
    categoryLabel: 'التفاضل والتكامل',
    title: 'التكامل المحدد وحساب المساحة تحت المنحني',
    direction: 'rtl',
    marks: 10,
    content: `احسب المساحة المحددة بمنحني الدالة $y = 4 - x^2$ ومحور السينات على الفترة $[-2, 2]$ مستخدماً التكامل المحدد:
<div class="my-2 text-center">$A = \\int_{-2}^{2} (4 - x^2) dx$</div>`
  },

  // --- 3. PHYSICS MECHANICS (5 questions) ---
  {
    id: 'mech-1',
    category: 'mechanics',
    categoryLabel: 'الميكانيكا والحركة',
    title: 'تحليل المتجهات ومحصلة قوتين متعامدتين',
    direction: 'rtl',
    marks: 10,
    content: `تؤثر قوتان متعامدتان على جسم كتلته $m = 5\\text{ kg}$، مقدارهما $F_1 = 30\\text{ N}$ باتجاه الشرق و $F_2 = 40\\text{ N}$ باتجاه الشمال.
<br/>1- احسب مقدار القوة المحصلة $\\vec{F}_R = \\sqrt{F_1^2 + F_2^2}$.
<br/>2- جد اتجاه القوة المحصلة باستخدام $\\tan \\theta = \\frac{F_2}{F_1}$.
<br/>3- احسب تسارع الجسم $\\vec{a}$ بوحدة $\\text{m/s}^2$ وفق قانون نيوتن الثاني $\\vec{F} = m \\vec{a}$.`
  },
  {
    id: 'mech-2',
    category: 'mechanics',
    categoryLabel: 'الميكانيكا والحركة',
    title: 'معادلات الحركة الخطية بتسارع منتظم',
    direction: 'rtl',
    marks: 10,
    content: `انطلقت سيارة من السكون بتسارع منتظم مقداره $a = 2.5\\text{ m/s}^2$. احسب:
<br/>(أ) سرعة السيارة بعد مرور $t = 8\\text{ s}$ مستخدماً $v_f = v_i + a t$.
<br/>(ب) المسافة التي قطعتها السيارة خلال هذا الزمن مستخدماً $\\Delta x = v_i t + \\frac{1}{2} a t^2$.`
  },
  {
    id: 'mech-3',
    category: 'mechanics',
    categoryLabel: 'الميكانيكا والحركة',
    title: 'حركة المقذوفات في بعدين تحت تأثير الجاذبية',
    direction: 'rtl',
    marks: 10,
    content: `قذفت كرة بسرعة ابتدائية $v_0 = 50\\text{ m/s}$ وبزاوية $\\theta = 37^\\circ$ فوق الأفق. بافتراض $g = 10\\text{ m/s}^2$ و $\\sin 37^\\circ = 0.6$:
<br/>1- جد أقصى ارتفاع $H = \\frac{v_0^2 \\sin^2 \\theta}{2g}$ تصل إليه الكرة.
<br/>2- احسب زمن التحليق الكلي $T = \\frac{2 v_0 \\sin \\theta}{g}$.
<br/>3- جد المدى الأفقي $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$.`
  },
  {
    id: 'mech-4',
    category: 'mechanics',
    categoryLabel: 'الميكانيكا والحركة',
    title: 'الشغل والطاقة وقانون حفظ الطاقة الميكانيكية',
    direction: 'rtl',
    marks: 10,
    content: `يسقط جسم كتلته $m = 2\\text{ kg}$ سقوطاً حراً من ارتفاع $h = 20\\text{ m}$ عن سطح الأرض.
<br/>أثبت أن الطاقة الميكانيكية الكلية $E = K + U$ محفوظة عند:
<br/>(أ) قمة الارتفاع ($v = 0$).
<br/>(ب) لحظة اصطدام الجسم بسطح الأرض.`
  },
  {
    id: 'mech-5',
    category: 'mechanics',
    categoryLabel: 'الميكانيكا والحركة',
    title: 'الزخم الخطي والتصادم المرن في بعد واحد',
    direction: 'rtl',
    marks: 10,
    content: `اصطدمت كرة كتلتها $m_1 = 3\\text{ kg}$ تتحرك بسرعة $v_1 = 4\\text{ m/s}$ بكرة ثانية ساكنة كتلتها $m_2 = 2\\text{ kg}$. فإذا التحمت الكرتان بعد التصادم مباشرة، فما هي سرعتهما المشتركة $V$ بتطبيق قانون حفظ الزخم:
<div class="my-2 text-center">$m_1 v_1 + m_2 v_2 = (m_1 + m_2) V$</div>`
  },

  // --- 4. PHYSICS CIRCUITS (5 questions) ---
  {
    id: 'circ-1',
    category: 'circuits',
    categoryLabel: 'الدوائر الكهربائية',
    title: 'قانون أوم وربط المقاومات على التوالي والتوازي',
    direction: 'rtl',
    marks: 10,
    content: `ثلاث مقاومات قيمها $R_1 = 3\\,\\Omega$ و $R_2 = 6\\,\\Omega$ و $R_3 = 9\\,\\Omega$ مربوطة على التوالي مع مصدر فرق جهد مقداره $V = 36\\text{ V}$.
<br/>(أ) احسب المقاومة المكافئة $R_{\\text{eq}} = R_1 + R_2 + R_3$.
<br/>(ب) جد التيار الكلي المنساب في الدائرة $I = \\frac{V}{R_{\\text{eq}}}$.
<br/>(ج) احسب فرق الجهد عبر طرفي كل مقاومة.`
  },
  {
    id: 'circ-2',
    category: 'circuits',
    categoryLabel: 'الدوائر الكهربائية',
    title: 'ربط المتسعات والطاقة المختزنة في المجال الكهربائي',
    direction: 'rtl',
    marks: 10,
    content: `متسعتان سعتاهما $C_1 = 4\\,\\mu\\text{F}$ و $C_2 = 12\\,\\mu\\text{F}$ مربوطتان على التوازي مع بطارية فرق جهدها $V = 100\\text{ V}$.
<br/>1- احسب السعة المكافئة للمجموعة $C_{\\text{eq}} = C_1 + C_2$.
<br/>2- جد الشحنة المختزنة في أي من صفيحتي كل متسعة $Q = C \\cdot V$.
<br/>3- احسب الطاقة الكلية المختزنة في المجموعة $P.E = \\frac{1}{2} C_{\\text{eq}} V^2$ بوحدة الجول ($J$).`
  },
  {
    id: 'circ-3',
    category: 'circuits',
    categoryLabel: 'الدوائر الكهربائية',
    title: 'قانون كيرشوف للتيارات والجهود في الدوائر المعقدة',
    direction: 'rtl',
    marks: 10,
    content: `في دائرة كهربائية ذات حلقتين مغلقتين، اكتب معادلتي كيرشوف للجهد $\\sum V = 0$ وللتيارات عند العقدة $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$، موضحاً إشارات القوة الدافعة الكهربائية $\\mathcal{E}$ وهبوط الجهد $I R$.`
  },
  {
    id: 'circ-4',
    category: 'circuits',
    categoryLabel: 'الدوائر الكهربائية',
    title: 'دوائر التيار المتناوب (RLC) وعامل القدرة',
    direction: 'rtl',
    marks: 10,
    content: `دائرة تيار متناوب متوالية الربط تحتوي على مقاومة $R = 40\\,\\Omega$ ومحث رادته الحثية $X_L = 80\\,\\Omega$ ومتسعة رادتها السعوية $X_C = 50\\,\\Omega$.
<br/>احسب:
<br/>1- الممانعة الكلية للدائرة $Z = \\sqrt{R^2 + (X_L - X_C)^2}$.
<br/>2- زاوية فرق الطور $\\tan \\phi = \\frac{X_L - X_C}{R}$ وما هي خواص الدائرة؟
<br/>3- عامل القدرة $\\text{pf} = \\cos \\phi$.`
  },
  {
    id: 'circ-5',
    category: 'circuits',
    categoryLabel: 'الدوائر الكهربائية',
    title: 'القدرة الكهربائية المستهلكة وقانون جول',
    direction: 'rtl',
    marks: 10,
    content: `مدفأة كهربائية مقاومة سلك التسخين فيها $R = 22\\,\\Omega$ وتعمل على فرق جهد $V = 220\\text{ V}$.
<br/>احسب القدرة المستهلكة في المدفأة بوحدتي الواط ($\text{W}$) والكيلوواط ($\text{kW}$) باستخدام العلاقات:
<div class="my-2 text-center">$P = \\frac{V^2}{R} = I^2 R = I V$</div>
ثم جد كمية الحرارة المتولدة خلال نصف ساعة.`
  },

  // --- 5. CHEMISTRY (5 questions) ---
  {
    id: 'chem-1',
    category: 'chemistry',
    categoryLabel: 'الكيمياء والتفاعلات',
    title: 'موازنة معادلات التأكسد والاختزال بطريقة نصف التفاعل',
    direction: 'rtl',
    marks: 10,
    content: `وازن معادلة التأكسد والاختزال الآتية في وسط حمضي بطريقة أنصاف التفاعلات:
<div class="my-2 text-center">$\\text{Fe}^{2+} + \\text{MnO}_4^{-} \\longrightarrow \\text{Fe}^{3+} + \\text{Mn}^{2+}$</div>
موضحاً العامل المؤكسد والعامل المختزل وتغير أعداد التأكسد.`
  },
  {
    id: 'chem-2',
    category: 'chemistry',
    categoryLabel: 'الكيمياء والتفاعلات',
    title: 'ثابت الاتزان الكيميائي (Kc و Kp) وقاعدة لوشاتليه',
    direction: 'rtl',
    marks: 10,
    content: `للتفاعل الغازي المتزن الآتي:
<div class="my-2 text-center">$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) + 92\\text{ kJ}$</div>
1- اكتب علاقة ثابت الاتزان بدلالة التراكيز المولارية $K_c = \\frac{[\\text{NH}_3]^2}{[\\text{N}_2][\\text{H}_2]^3}$.
<br/>2- بيّن تأثير كل من العوامل الآتية على حالة الاتزان وقيمة $K_c$:
<br/>(أ) زيادة الضغط المسلط على خليط التفاعل.
<br/>(ب) خفض درجة الحرارة.`
  },
  {
    id: 'chem-3',
    category: 'chemistry',
    categoryLabel: 'الكيمياء والتفاعلات',
    title: 'حسابات الأس الهيدروجيني (pH) للأحماض والقواعد الضعيفة',
    direction: 'rtl',
    marks: 10,
    content: `احسب قيمة $\\text{pH}$ لمحلول حامض الخليك (حمض ضعيف) تركيزه $0.1\\text{ M}$ علماً أن ثابت تفكك الحامض $K_a = 1.8 \\times 10^{-5}$، مستخدماً الفرضية:
<div class="my-2 text-center">$\\text{CH}_3\\text{COOH} \\rightleftharpoons \\text{CH}_3\\text{COO}^- + \\text{H}^+$</div>
<div class="my-2 text-center">$[\\text{H}^+] = \\sqrt{K_a \\cdot C_a} \\quad , \\quad \\text{pH} = -\\log[\\text{H}^+]$</div>`
  },
  {
    id: 'chem-4',
    category: 'chemistry',
    categoryLabel: 'الكيمياء والتفاعلات',
    title: 'الكيمياء الحرارية وقانون هس (Hess\'s Law)',
    direction: 'rtl',
    marks: 10,
    content: `احسب انثالبي التكوين القياسية $\\Delta H_f^\\circ$ لغاز أول أكسيد الكربون $\\text{CO}(g)$ استناداً إلى المعادلات الحرارية الآتية بتطبيق قانون هس:
<div class="my-2 text-center">
1) $\\text{C}(s) + \\text{O}_2(g) \\longrightarrow \\text{CO}_2(g) \\quad \\Delta H_1 = -393.5\\text{ kJ}$
<br/>
2) $\\text{CO}(g) + \\frac{1}{2}\\text{O}_2(g) \\longrightarrow \\text{CO}_2(g) \\quad \\Delta H_2 = -283.0\\text{ kJ}$
</div>`
  },
  {
    id: 'chem-5',
    category: 'chemistry',
    categoryLabel: 'الكيمياء والتفاعلات',
    title: 'الخلايا الجلفانية وجهد الخلية القياسي (E°cell)',
    direction: 'rtl',
    marks: 10,
    content: `احسب جهد الخلية القياسي $E^\\circ_{\\text{cell}}$ لخلية دانيال الجلفانية المكونة من قطب الخارصين المغمور في محلول كبريتات الخارصين وقطب النحاس المغمور في محلول كبريتات النحاس:
<div class="my-2 text-center">$\\text{Zn}(s) + \\text{Cu}^{2+}(aq) \\longrightarrow \\text{Zn}^{2+}(aq) + \\text{Cu}(s)$</div>
علماً أن جهود الاختزال القياسية: $E^\\circ(\\text{Zn}^{2+}/\\text{Zn}) = -0.76\\text{ V}$ و $E^\\circ(\\text{Cu}^{2+}/\\text{Cu}) = +0.34\\text{ V}$، مستخدماً القانون $E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$.`
  },

  // --- 6. ENGLISH LANGUAGE (5 questions) ---
  {
    id: 'eng-1',
    category: 'english',
    categoryLabel: 'اللغة الإنجليزية',
    title: 'Reading Comprehension Passage with Linked Questions',
    direction: 'ltr',
    marks: 15,
    content: `<div class="font-sans leading-relaxed">
<h4 class="font-bold underline mb-2">Q1. Reading Comprehension: Read the following passage carefully, then answer the questions below:</h4>
<p class="mb-3 text-justify">
Artificial intelligence (AI) has rapidly transformed modern society, influencing education, medicine, and engineering. In classrooms, adaptive software analyzes student performance to provide tailored learning materials. However, educators emphasize that while technology provides powerful tools, critical thinking, ethical understanding, and human empathy remain skills that only passionate teachers can nurture.
</p>
<ol class="list-decimal ps-5 space-y-1.5 font-medium">
  <li>How does adaptive software support individual student learning in classrooms?</li>
  <li>Why cannot artificial intelligence replace human teachers entirely?</li>
  <li>Find a word in the text that means: "to care for and encourage the growth of something".</li>
  <li>Give a suitable title to the passage.</li>
</ol>
</div>`
  },
  {
    id: 'eng-2',
    category: 'english',
    categoryLabel: 'اللغة الإنجليزية',
    title: 'Grammar: Conditional Sentences (If-Clauses)',
    direction: 'ltr',
    marks: 10,
    content: `<div class="font-sans">
<h4 class="font-bold mb-2">Q2. Complete the following sentences using the correct form of the verbs in brackets:</h4>
<ol class="list-decimal ps-5 space-y-2">
  <li>If Ali (study) __________ harder during the semester, he would have passed the ministerial examination with distinction.</li>
  <li>Unless you (submit) __________ your scientific project before Thursday, the system will reject your grade.</li>
  <li>If water freezes at $0^\\circ\\text{C}$, its density (decrease) __________.</li>
</ol>
</div>`
  },
  {
    id: 'eng-3',
    category: 'english',
    categoryLabel: 'اللغة الإنجليزية',
    title: 'Error Identification & Grammatical Correction',
    direction: 'ltr',
    marks: 10,
    content: `<div class="font-sans">
<h4 class="font-bold mb-2">Q3. Identify the grammatical error in each sentence and rewrite it correctly:</h4>
<ol class="list-decimal ps-5 space-y-2">
  <li>Neither the teacher nor the students <u>was</u> present in the laboratory yesterday.</li>
  <li>She has been working in Baghdad University <u>since</u> five years.</li>
  <li>Although he had a high fever, <u>but</u> he attended the physics exam.</li>
</ol>
</div>`
  },
  {
    id: 'eng-4',
    category: 'english',
    categoryLabel: 'اللغة الإنجليزية',
    title: 'Sentence Unscrambling & Syntax Ordering',
    direction: 'ltr',
    marks: 10,
    content: `<div class="font-sans">
<h4 class="font-bold mb-2">Q4. Reorder the words to form coherent, grammatically sound English sentences:</h4>
<ol class="list-decimal ps-5 space-y-2">
  <li>[ the / gravity / according / accelerate / all / objects / to / rate / at / same ].</li>
  <li>[ solving / requires / complex / mathematical / concentration / problems / high ].</li>
  <li>[ been / has / discovered / new / a / antibiotic / scientists / by / Iraqi ].</li>
</ol>
</div>`
  },
  {
    id: 'eng-5',
    category: 'english',
    categoryLabel: 'اللغة الإنجليزية',
    title: 'Passive Voice in Scientific Contexts',
    direction: 'ltr',
    marks: 10,
    content: `<div class="font-sans">
<h4 class="font-bold mb-2">Q5. Rewrite the following laboratory statements in the Passive Voice:</h4>
<ol class="list-decimal ps-5 space-y-2">
  <li>The chemist heated the mixture in a crucible at $300^\\circ\\text{C}$.</li>
  <li>The lab technician will calibrate the electronic balance before the measurement.</li>
  <li>Students must record all experimental observations in the logbook.</li>
</ol>
</div>`
  },
];
