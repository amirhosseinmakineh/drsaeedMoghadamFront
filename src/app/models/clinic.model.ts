export type LanguageCode = 'fa' | 'en';
export type ThemeMode = 'light' | 'dark';
export type AuthDialogMode = 'login' | 'register';

export interface LocalizedText {
  fa: string;
  en: string;
}

export interface NavItem {
  label: LocalizedText;
  href: string;
  icon: string;
}

export interface SeoMeta {
  title: LocalizedText;
  description: LocalizedText;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export interface TreatmentStep {
  step: number;
  title: LocalizedText;
  description: LocalizedText;
}

export interface StatItem {
  value: LocalizedText;
  label: LocalizedText;
}

export interface HeroSlide {
  id: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  text: LocalizedText;
  image: string;
}

export interface WorkSample {
  id: string;
  title: LocalizedText;
  service: LocalizedText;
  description: LocalizedText;
  result: LocalizedText;
  image: string;
}

export interface DentalService {
  id: string;
  icon: string;
  image: string;
  accent: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  summary: LocalizedText;
  longIntro: LocalizedText;
  duration: LocalizedText;
  cost: LocalizedText;
  idealFor: LocalizedText[];
  benefits: LocalizedText[];
  userValue: LocalizedText[];
  steps: TreatmentStep[];
  care: LocalizedText[];
  faqs: FaqItem[];
  relatedIds: string[];
  seo: SeoMeta;
}

export interface BenefitCard {
  id: string;
  icon: string;
  title: LocalizedText;
  text: LocalizedText;
}

export interface Testimonial {
  id: string;
  name: LocalizedText;
  service: LocalizedText;
  text: LocalizedText;
  rating: number;
}

export interface LeadFormModel {
  fullName: string;
  phone: string;
  serviceId: string;
  preferredDate?: Date;
  message: string;
}

export interface ContactFormModel {
  fullName: string;
  phone: string;
  serviceId: string;
  preferredDate?: Date;
  message: string;
}

export interface AuthDialogModel {
  fullName: string;
  phone: string;
  password: string;
  acceptCarePolicy: boolean;
}

export interface DatePickerDay {
  label: string;
  iso: string;
  weekday: string;
  disabled: boolean;
  outsideMonth?: boolean;
  ariaLabel?: string;
}

export const text = (fa: string, en: string): LocalizedText => ({ fa, en });
export const pickText = (value: LocalizedText, language: LanguageCode): string => value[language];

const image = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=760&q=45`;

const portfolioImage = (path: string): string =>
  `https://labkhanddental.com/wp-content/uploads/${path}`;

export const NAV_ITEMS: NavItem[] = [
  { label: text('خانه', 'Home'), href: '/', icon: 'home' },
  { label: text('خدمات', 'Services'), href: '/services', icon: 'sparkle' },
  { label: text('درباره ما', 'About'), href: '/about', icon: 'doctor' },
  { label: text('تماس', 'Contact'), href: '/contact', icon: 'phone' }
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'digital-smile',
    eyebrow: text('کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Dr. Saeed Moghaddam Dental Clinic'),
    title: text('درمان دقیق، طراحی لبخند طبیعی و مراقبت قابل اعتماد', 'Precise care, natural smile design and trustworthy dentistry'),
    text: text(
      'در کلینیک دندان‌پزشکی دکتر سعید مقدم، درمان‌های زیبایی و عمومی مثل ایمپلنت، لمینت، کامپوزیت، بلیچینگ، درمان ریشه و مراقبت لثه با معاینه دقیق و توضیح شفاف انجام می‌شود.',
      'At Dr. Saeed Moghaddam Dental Clinic, cosmetic and general dental treatments such as implants, veneers, composite, whitening, root canal therapy and gum care are planned with careful exams and clear guidance.'
    ),
    image: image('photo-1606811971618-4486d14f3f99')
  },
  {
    id: 'calm-suite',
    eyebrow: text('مشاوره قبل از درمان', 'Pre-treatment consultation'),
    title: text('قبل از تصمیم، مشکل، گزینه‌ها و مراقبت‌ها روشن می‌شود', 'Before any decision, the problem, options and care are clear'),
    text: text(
      'اگر درد دندان، نیاز به ایمپلنت، اصلاح طرح لبخند یا درمان لثه دارید، ابتدا شرایط دهان و دندان بررسی می‌شود و مسیر مناسب بدون وعده اغراق‌آمیز توضیح داده می‌شود.',
      'Whether you have tooth pain, need implants, want a smile makeover or require gum care, your oral condition is reviewed first and the suitable path is explained without exaggerated promises.'
    ),
    image: image('photo-1629909615184-74f495363b67')
  },
  {
    id: 'mobile-first',
    eyebrow: text('تجربه آرام مراجعه‌کننده', 'Calm patient experience'),
    title: text('از تماس اولیه تا پیگیری بعد از درمان، مسیر ساده است', 'From first call to aftercare, the path stays simple'),
    text: text(
      'خدمات، توضیحات درمان، سوالات پرتکرار و فرم درخواست تماس کنار هم آمده‌اند تا مراجعه‌کننده سریع‌تر بداند برای چه خدمتی باید راهنمایی بگیرد.',
      'Services, treatment explanations, FAQs and the call request form are grouped together so patients quickly know which service they need guidance for.'
    ),
    image: image('photo-1588776814546-1ffcf47267a5')
  }
];

export const STATS: StatItem[] = [
  { value: text('زیبایی و درمان', 'Cosmetic and care'), label: text('طراحی لبخند، ترمیم و درمان‌های ضروری دندان', 'Smile design, restorative and essential dental treatments') },
  { value: text('۸ مسیر درمان', '8 care paths'), label: text('از ایمپلنت و لمینت تا درمان ریشه و لثه', 'From implants and veneers to root canal and gum care') },
  { value: text('پاسخگویی', 'Call back'), label: text('ثبت شماره برای تماس مشاور و راهنمایی اولیه', 'Leave your number for an initial consultant call') }
];

export const WORK_SAMPLES: WorkSample[] = [
  {
    id: 'natural-veneer',
    title: text('نمونه لمینت سرامیکی', 'Porcelain veneer sample'),
    service: text('لمینت دندان', 'Dental veneers'),
    description: text(
      'برای اصلاح رنگ و فرم دندان‌های جلو، انتخاب رنگ، تناسب خط لبخند و سلامت بافت لثه قبل از شروع درمان بررسی می‌شود.',
      'For front-tooth shade and shape correction, color choice, smile-line proportion and gum health are reviewed before treatment starts.'
    ),
    result: text('ظاهر روشن‌تر و هماهنگ‌تر با فرم طبیعی دندان‌ها', 'A brighter look aligned with natural tooth form'),
    image: portfolioImage('2025/05/laminet-1.webp')
  },
  {
    id: 'implant-rehab',
    title: text('نمونه ایمپلنت دندان', 'Dental implant sample'),
    service: text('ایمپلنت دندان', 'Dental implants'),
    description: text(
      'در درمان ایمپلنت، وضعیت استخوان، لثه و فضای دندان از دست رفته بررسی می‌شود تا جایگزینی ثابت و قابل اتکا انجام شود.',
      'For implant treatment, bone, gum and missing-tooth space are reviewed so the fixed replacement is reliable.'
    ),
    result: text('بازگرداندن عملکرد جویدن و فرم لبخند', 'Restored chewing function and smile form'),
    image: portfolioImage('2025/11/implant-portfolio-3.webp')
  },
  {
    id: 'composite-shape',
    title: text('نمونه کامپوزیت دندان', 'Dental composite sample'),
    service: text('کامپوزیت ونیر', 'Composite veneer'),
    description: text(
      'کامپوزیت برای اصلاح محافظه‌کارانه فرم، فاصله یا شکستگی‌های محدود دندان‌های جلو استفاده می‌شود و مراقبت بعد از آن اهمیت زیادی دارد.',
      'Composite is used for conservative correction of front-tooth shape, gaps or limited chips, with aftercare playing an important role.'
    ),
    result: text('فرم منظم‌تر بدون تغییر اغراق‌آمیز لبخند', 'Cleaner shape without an exaggerated smile change'),
    image: portfolioImage('2025/09/photo_2025-09-24_20-04-56.webp')
  }
];

export const DENTAL_SERVICES: DentalService[] = [
  {
    id: 'implant',
    icon: 'tooth',
    image: image('photo-1606811841689-23dfddce3e95'),
    accent: '#b88a44',
    title: text('ایمپلنت دندان', 'Dental implants'),
    subtitle: text('جایگزینی پایدار دندان از دست رفته', 'Stable replacement for missing teeth'),
    summary: text(
      'ایمپلنت برای بازگرداندن قدرت جویدن، زیبایی لبخند و جلوگیری از جابه‌جایی دندان‌های اطراف طراحی می‌شود.',
      'Implants restore chewing strength, smile aesthetics and help prevent neighboring teeth from shifting.'
    ),
    longIntro: text(
      'ایمپلنت دندان زمانی پیشنهاد می‌شود که ریشه طبیعی از دست رفته باشد و بیمار به راهکاری ثابت، قابل اعتماد و شبیه دندان طبیعی نیاز داشته باشد. پیش از شروع، وضعیت لثه، استخوان، عادت‌های بهداشتی، داروهای مصرفی و عکس‌های تشخیصی بررسی می‌شود تا طرح درمان برای همان بیمار نوشته شود. هدف ما فقط پر کردن جای خالی دندان نیست؛ باید جویدن، تلفظ، فرم صورت و آرامش بیمار هم بهتر شود.',
      'Dental implants are recommended when the natural root is missing and the patient needs a fixed, reliable and natural-looking solution. Before treatment, gum health, bone volume, hygiene habits, medications and diagnostic images are reviewed so the plan fits the individual. The goal is not only to fill a gap; chewing, speech, facial support and patient confidence should improve too.'
    ),
    duration: text('از چند هفته تا چند ماه، بسته به استخوان و نیاز درمانی', 'From a few weeks to several months depending on bone and clinical needs'),
    cost: text('پس از معاینه، عکس و مشخص شدن نوع قطعه اعلام می‌شود', 'Defined after exam, imaging and implant system selection'),
    idealFor: [
      text('افراد دارای یک یا چند دندان از دست رفته', 'People missing one or more teeth'),
      text('بیمارانی که پروتز متحرک برایشان آزاردهنده است', 'Patients uncomfortable with removable dentures'),
      text('افرادی که به دنبال راهکاری ثابت و طولانی‌مدت هستند', 'People looking for a fixed long-term solution')
    ],
    benefits: [
      text('کمک به جویدن طبیعی‌تر', 'Helps restore natural chewing'),
      text('حفظ فرم صورت و لبخند', 'Supports facial shape and smile'),
      text('عدم تراش دندان‌های سالم مجاور', 'Avoids shaving healthy neighboring teeth'),
      text('پایداری بالا با مراقبت درست', 'High stability with proper care')
    ],
    userValue: [
      text('می‌دانید چرا ایمپلنت برای شما مناسب یا نامناسب است.', 'You understand why implants are or are not suitable for you.'),
      text('مراحل درمان، فاصله جلسات و مراقبت‌ها شفاف توضیح داده می‌شود.', 'Treatment stages, visit intervals and care instructions are explained clearly.'),
      text('نتیجه نهایی برای عملکرد و زیبایی همزمان طراحی می‌شود.', 'The final result is designed for both function and aesthetics.')
    ],
    steps: [
      { step: 1, title: text('معاینه و عکس', 'Exam and imaging'), description: text('لثه، استخوان و فضای دندان از دست رفته بررسی می‌شود.', 'Gums, bone and the missing tooth space are evaluated.') },
      { step: 2, title: text('طرح درمان اختصاصی', 'Personal plan'), description: text('نوع ایمپلنت، زمان‌بندی و نیاز به درمان‌های مکمل مشخص می‌شود.', 'Implant system, timing and any supporting treatments are defined.') },
      { step: 3, title: text('جراحی کنترل‌شده', 'Controlled surgery'), description: text('کاشت با بی‌حسی مناسب و پروتکل استریل انجام می‌شود.', 'Placement is done with proper anesthesia and sterile protocol.') },
      { step: 4, title: text('روکش و پیگیری', 'Crown and follow-up'), description: text('پس از آماده شدن پایه، روکش و مراقبت دوره‌ای انجام می‌شود.', 'After integration, the crown and maintenance visits are completed.') }
    ],
    care: [
      text('مسواک و نخ دندان مخصوص اطراف ایمپلنت را منظم انجام دهید.', 'Clean around the implant regularly with suitable brush and floss.'),
      text('در صورت درد، التهاب یا لق شدن قطعه سریع تماس بگیرید.', 'Call promptly if you notice pain, swelling or looseness.'),
      text('معاینه دوره‌ای برای حفظ سلامت لثه ضروری است.', 'Regular checkups are essential for gum health.')
    ],
    faqs: [
      { id: 'implant-1', question: text('آیا ایمپلنت درد دارد؟', 'Is implant treatment painful?'), answer: text('با بی‌حسی مناسب، درد حین کار کنترل می‌شود و ناراحتی بعد از آن معمولاً با مراقبت و دارو قابل مدیریت است.', 'With proper anesthesia, treatment pain is controlled and post-care discomfort is usually manageable.') },
      { id: 'implant-2', question: text('همه افراد می‌توانند ایمپلنت انجام دهند؟', 'Can everyone get implants?'), answer: text('خیر. سلامت لثه، حجم استخوان، دیابت کنترل‌شده، مصرف دخانیات و همکاری بیمار در تصمیم نهایی مهم است.', 'No. Gum health, bone volume, controlled diabetes, smoking and patient cooperation matter.') }
    ],
    relatedIds: ['root-canal', 'gum-treatment', 'laminate'],
    seo: {
      title: text('ایمپلنت دندان | کاشت دندان در کلینیک دکتر سعید مقدم', 'Dental implants | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای کامل ایمپلنت دندان، مراحل کاشت، مزایا، مراقبت‌ها و عوامل موثر بر هزینه.', 'Complete guide to dental implants, placement steps, benefits, aftercare and cost factors.')
    }
  },
  {
    id: 'laminate',
    icon: 'sparkle',
    image: image('photo-1609840114035-3c981b782dfe'),
    accent: '#c9a26a',
    title: text('لمینت سرامیکی', 'Porcelain veneers'),
    subtitle: text('طراحی لبخند ظریف و طبیعی', 'Delicate natural smile design'),
    summary: text('لمینت برای اصلاح رنگ، فرم، اندازه و هماهنگی دندان‌های جلویی با حداقل اغراق ظاهری استفاده می‌شود.', 'Veneers improve color, shape, size and harmony of front teeth without an overdone look.'),
    longIntro: text(
      'لمینت سرامیکی برای افرادی مناسب است که لبخندی روشن‌تر، مرتب‌تر و هماهنگ‌تر می‌خواهند اما ظاهر مصنوعی را دوست ندارند. در طراحی لمینت، فرم لب، رنگ پوست، خط لبخند، میزان نمایش لثه و سلامت دندان‌ها بررسی می‌شود. ما قبل از درمان درباره محدودیت‌ها، نیاز به تراش، انتخاب رنگ و مراقبت‌های بعدی شفاف صحبت می‌کنیم.',
      'Porcelain veneers suit people who want a brighter, more balanced smile without an artificial look. Lip shape, skin tone, smile line, gum display and tooth health are considered. Before treatment, preparation limits, shade selection and aftercare are explained clearly.'
    ),
    duration: text('معمولاً ۱۰ تا ۱۴ روز پس از آماده‌سازی', 'Usually 10 to 14 days after preparation'),
    cost: text('وابسته به تعداد دندان، جنس سرامیک و طراحی لبخند', 'Depends on tooth count, ceramic type and smile design details'),
    idealFor: [
      text('تغییر رنگ مقاوم به بلیچینگ', 'Discoloration resistant to whitening'),
      text('لب‌پریدگی یا بدفرمی خفیف تا متوسط', 'Mild to moderate chips or shape issues'),
      text('افراد با انتظار زیبایی طبیعی', 'People expecting natural aesthetics')
    ],
    benefits: [
      text('رنگ پایدارتر نسبت به درمان‌های مستقیم', 'More stable shade than direct options'),
      text('فرم‌دهی دقیق لبخند', 'Precise smile shaping'),
      text('سطح صاف و درخشان', 'Smooth glossy surface'),
      text('هماهنگی با چهره', 'Facial harmony')
    ],
    userValue: [
      text('قبل از انتخاب رنگ، نتیجه با چهره شما سنجیده می‌شود.', 'Shade selection is checked against your face.'),
      text('هدف لبخند طبیعی است، نه دندان‌های یکدست و غیرواقعی.', 'The goal is a natural smile, not unrealistic uniform teeth.'),
      text('مراقبت‌ها برای ماندگاری نتیجه به زبان ساده گفته می‌شود.', 'Care rules are explained simply for long-term results.')
    ],
    steps: [
      { step: 1, title: text('تحلیل لبخند', 'Smile analysis'), description: text('عکس، فرم صورت و انتظار شما بررسی می‌شود.', 'Photos, facial form and expectations are reviewed.') },
      { step: 2, title: text('طراحی و آماده‌سازی', 'Design and preparation'), description: text('در صورت نیاز آماده‌سازی محافظه‌کارانه انجام می‌شود.', 'Conservative preparation is done if needed.') },
      { step: 3, title: text('ساخت سرامیک', 'Ceramic fabrication'), description: text('رنگ و فرم نهایی با لابراتوار هماهنگ می‌شود.', 'Final shade and shape are coordinated with the lab.') },
      { step: 4, title: text('نصب و آموزش مراقبت', 'Bonding and care'), description: text('لمینت‌ها نصب و نکات نگهداری توضیح داده می‌شود.', 'Veneers are bonded and care guidance is provided.') }
    ],
    care: [
      text('از شکستن اجسام سخت با دندان خودداری کنید.', 'Avoid biting hard objects.'),
      text('در صورت دندان‌قروچه، نایت‌گارد می‌تواند لازم باشد.', 'A night guard may be needed for grinding.'),
      text('معاینه و پولیش دوره‌ای به حفظ ظاهر کمک می‌کند.', 'Regular checks and polishing help maintain appearance.')
    ],
    faqs: [
      { id: 'laminate-1', question: text('آیا لمینت باعث پوسیدگی می‌شود؟', 'Do veneers cause decay?'), answer: text('خود لمینت باعث پوسیدگی نیست؛ بهداشت نامناسب و چسبندگی آسیب‌دیده می‌تواند مشکل ایجاد کند.', 'Veneers do not cause decay by themselves; poor hygiene or damaged margins can create problems.') },
      { id: 'laminate-2', question: text('رنگ لمینت قابل تغییر است؟', 'Can veneer color be changed?'), answer: text('پس از نصب، رنگ سرامیک تغییر جدی نمی‌کند؛ انتخاب رنگ باید قبل از ساخت دقیق انجام شود.', 'After bonding, ceramic shade does not significantly change, so selection must be careful before fabrication.') }
    ],
    relatedIds: ['composite', 'whitening', 'orthodontics'],
    seo: {
      title: text('لمینت دندان | طراحی لبخند طبیعی', 'Porcelain veneers | Natural smile design'),
      description: text('همه چیز درباره لمینت دندان، طراحی لبخند، انتخاب رنگ، مراقبت‌ها و هزینه‌های وابسته به معاینه.', 'Everything about veneers, smile design, shade selection, aftercare and exam-based costs.')
    }
  },
  {
    id: 'composite',
    icon: 'brush',
    image: image('photo-1600170311833-c2cf5280ce49'),
    accent: '#d7a85d',
    title: text('کامپوزیت ونیر', 'Composite veneers'),
    subtitle: text('اصلاح سریع فرم و رنگ دندان', 'Fast shape and color enhancement'),
    summary: text('کامپوزیت برای اصلاح محافظه‌کارانه لب‌پریدگی، فاصله‌های کوچک، بدفرمی و رنگ نامطلوب دندان‌ها کاربرد دارد.', 'Composite veneers conservatively improve chips, small gaps, shape issues and unwanted tooth color.'),
    longIntro: text(
      'کامپوزیت ونیر راهکاری مستقیم و نسبتاً سریع برای بهتر شدن لبخند است. در این درمان، ماده هم‌رنگ دندان روی سطح دندان شکل داده و پولیش می‌شود. نتیجه خوب به انتخاب کیس، مهارت فرم‌دهی، کیفیت پولیش و مراقبت بیمار وابسته است. این درمان برای همه مشکلات جایگزین ارتودنسی یا لمینت نیست، اما در موارد مناسب می‌تواند تغییر چشمگیر و محافظه‌کارانه ایجاد کند.',
      'Composite veneers are a direct and relatively fast way to improve a smile. Tooth-colored resin is shaped and polished on the tooth surface. Good results depend on case selection, artistic shaping, polish quality and patient care. It is not a replacement for orthodontics or porcelain veneers in every case, but it can create meaningful conservative change.'
    ),
    duration: text('اغلب ۱ تا ۲ جلسه', 'Often 1 to 2 visits'),
    cost: text('وابسته به تعداد دندان و میزان اصلاح فرم', 'Depends on tooth count and shaping complexity'),
    idealFor: [
      text('اصلاح فاصله‌های کوچک', 'Small gap correction'),
      text('لب‌پریدگی و بدفرمی محدود', 'Minor chips and shape issues'),
      text('افرادی که درمان کم‌تهاجمی می‌خواهند', 'People wanting a minimally invasive option')
    ],
    benefits: [
      text('سرعت بالای اجرا', 'Fast delivery'),
      text('حفظ بیشتر بافت دندان', 'Preserves more tooth structure'),
      text('قابلیت ترمیم در آینده', 'Repairable in the future'),
      text('هزینه منعطف‌تر نسبت به سرامیک', 'More flexible cost than ceramic')
    ],
    userValue: [
      text('پیش از شروع می‌دانید کامپوزیت برای مشکل شما کافی هست یا نه.', 'You know whether composite is enough for your case before starting.'),
      text('فرم نهایی با لبخند و صورت هماهنگ می‌شود.', 'Final shape is matched to your smile and face.'),
      text('محدودیت‌های رنگ‌پذیری و مراقبت صادقانه توضیح داده می‌شود.', 'Staining limits and care needs are explained honestly.')
    ],
    steps: [
      { step: 1, title: text('بررسی لبخند', 'Smile review'), description: text('رنگ، فرم و تماس دندان‌ها ارزیابی می‌شود.', 'Color, shape and bite contacts are evaluated.') },
      { step: 2, title: text('انتخاب رنگ', 'Shade selection'), description: text('رنگ مناسب با دندان‌ها و چهره انتخاب می‌شود.', 'A matching shade is selected.') },
      { step: 3, title: text('فرم‌دهی', 'Layering and shaping'), description: text('کامپوزیت مرحله‌ای شکل داده می‌شود.', 'Composite is layered and shaped step by step.') },
      { step: 4, title: text('پولیش', 'Polishing'), description: text('سطح نهایی برای درخشندگی و تمیز شدن بهتر پولیش می‌شود.', 'The final surface is polished for shine and easier cleaning.') }
    ],
    care: [
      text('مصرف زیاد چای، قهوه و دخانیات می‌تواند روی رنگ اثر بگذارد.', 'Heavy tea, coffee and smoking can affect color.'),
      text('پولیش دوره‌ای ظاهر کامپوزیت را بهتر نگه می‌دارد.', 'Periodic polishing keeps composite looking better.'),
      text('از فشارهای شدید روی لبه‌ها پرهیز کنید.', 'Avoid heavy pressure on edges.')
    ],
    faqs: [
      { id: 'composite-1', question: text('کامپوزیت چند سال دوام دارد؟', 'How long do composite veneers last?'), answer: text('ماندگاری به بهداشت، رژیم غذایی، فشار دندان‌ها و پولیش دوره‌ای بستگی دارد.', 'Longevity depends on hygiene, diet, bite forces and maintenance polishing.') },
      { id: 'composite-2', question: text('آیا کامپوزیت برگشت‌پذیر است؟', 'Is composite reversible?'), answer: text('در بسیاری موارد تراش کم یا بدون تراش است، اما تصمیم دقیق پس از معاینه مشخص می‌شود.', 'Many cases need little or no preparation, but the exact decision follows examination.') }
    ],
    relatedIds: ['laminate', 'whitening', 'orthodontics'],
    seo: {
      title: text('کامپوزیت دندان | اصلاح طرح لبخند سریع', 'Composite veneers | Fast smile enhancement'),
      description: text('مزایا، مراحل، مراقبت و محدودیت‌های کامپوزیت دندان برای اصلاح فرم و رنگ لبخند.', 'Benefits, steps, care and limits of composite veneers for smile shape and color.')
    }
  },
  {
    id: 'orthodontics',
    icon: 'align',
    image: image('photo-1609840114035-3c981b782dfe'),
    accent: '#9f8565',
    title: text('ارتودنسی و نظم لبخند', 'Orthodontics and smile alignment'),
    subtitle: text('مرتب‌سازی دندان‌ها با برنامه مرحله‌ای', 'Step-by-step teeth alignment'),
    summary: text('ارتودنسی به بهبود نظم دندان‌ها، تماس‌های فکی، تمیز شدن راحت‌تر و زیبایی لبخند کمک می‌کند.', 'Orthodontics improves tooth alignment, bite contacts, easier cleaning and smile appearance.'),
    longIntro: text(
      'وقتی دندان‌ها نامرتب باشند، فقط ظاهر لبخند تحت تاثیر قرار نمی‌گیرد؛ تمیز کردن سخت‌تر، فشار روی بعضی دندان‌ها بیشتر و احتمال پوسیدگی یا التهاب لثه بالاتر می‌شود. در ارتودنسی، ابتدا شدت نامرتبی، روابط فکی، سن، سلامت لثه و هدف زیبایی بررسی می‌شود. سپس روش مناسب و مسیر مرحله‌ای برای بیمار توضیح داده می‌شود.',
      'Crowded or misaligned teeth affect more than appearance; cleaning becomes harder, some teeth take more pressure and decay or gum inflammation risks increase. Orthodontic planning reviews crowding severity, jaw relationships, age, gum health and aesthetic goals before explaining the best method and stages.'
    ),
    duration: text('حدود ۶ تا ۱۸ ماه، بسته به شدت نامرتبی', 'About 6 to 18 months depending on complexity'),
    cost: text('وابسته به نوع درمان، مدت و نیازهای جانبی', 'Depends on treatment type, duration and supporting needs'),
    idealFor: [
      text('نامرتبی، فاصله یا چرخش دندان‌ها', 'Crowding, gaps or rotated teeth'),
      text('مشکلات تماس دندان‌ها', 'Bite contact issues'),
      text('افراد آماده همکاری و مراجعات منظم', 'Patients ready for cooperation and regular visits')
    ],
    benefits: [
      text('تمیز کردن راحت‌تر دندان‌ها', 'Easier cleaning'),
      text('بهبود زیبایی لبخند', 'Improved smile aesthetics'),
      text('کاهش فشار نامتعادل', 'Reduced uneven pressure'),
      text('کمک به درمان‌های زیبایی بعدی', 'Supports later cosmetic treatments')
    ],
    userValue: [
      text('می‌فهمید چرا گاهی قبل از لمینت یا کامپوزیت، نظم دندان مهم است.', 'You learn why alignment can matter before veneers or composite.'),
      text('در هر مرحله هدف و تغییرات قابل انتظار مشخص است.', 'Goals and expected changes are clear at every stage.'),
      text('مسیر درمان با سبک زندگی شما هماهنگ می‌شود.', 'The plan is matched to your lifestyle.')
    ],
    steps: [
      { step: 1, title: text('بررسی فک و دندان', 'Bite and tooth review'), description: text('عکس‌ها، تماس دندان‌ها و میزان نامرتبی بررسی می‌شود.', 'Images, bite contacts and crowding are reviewed.') },
      { step: 2, title: text('انتخاب روش', 'Method selection'), description: text('روش ثابت، متحرک یا شفاف بر اساس شرایط بررسی می‌شود.', 'Fixed, removable or clear options are considered.') },
      { step: 3, title: text('شروع حرکت کنترل‌شده', 'Controlled movement'), description: text('حرکت دندان‌ها به شکل مرحله‌ای پایش می‌شود.', 'Tooth movement is monitored in stages.') },
      { step: 4, title: text('نگهدارنده', 'Retention'), description: text('پس از پایان، نگهدارنده برای حفظ نتیجه توصیه می‌شود.', 'After completion, retainers help maintain the result.') }
    ],
    care: [
      text('بهداشت اطراف براکت یا پلاک را دقیق انجام دهید.', 'Clean carefully around braces or aligners.'),
      text('مراجعات منظم روی کیفیت نتیجه اثر مستقیم دارد.', 'Regular visits directly affect quality.'),
      text('پس از درمان، نگهدارنده را طبق دستور استفاده کنید.', 'Use retainers as instructed.')
    ],
    faqs: [
      { id: 'ortho-1', question: text('آیا ارتودنسی فقط برای کودکان است؟', 'Is orthodontics only for children?'), answer: text('خیر. بزرگسالان هم در صورت سلامت لثه و شرایط مناسب می‌توانند از ارتودنسی سود ببرند.', 'No. Adults can benefit if gum health and clinical conditions are suitable.') },
      { id: 'ortho-2', question: text('آیا بعد از ارتودنسی دندان‌ها برمی‌گردند؟', 'Can teeth shift back?'), answer: text('بدون نگهدارنده احتمال برگشت وجود دارد؛ نگهداری بخش مهم درمان است.', 'Without retainers, relapse can happen; retention is an essential part of treatment.') }
    ],
    relatedIds: ['laminate', 'composite', 'pediatric'],
    seo: {
      title: text('ارتودنسی دندان | نظم لبخند و اصلاح تماس‌ها', 'Orthodontics | Smile alignment and bite correction'),
      description: text('راهنمای ارتودنسی، مراحل مرتب‌سازی دندان‌ها، مراقبت و نقش نگهدارنده پس از درمان.', 'Orthodontic guide, alignment stages, care and the role of retainers after treatment.')
    }
  },
  {
    id: 'whitening',
    icon: 'sun',
    image: image('photo-1588776814546-1ffcf47267a5'),
    accent: '#c6a15b',
    title: text('سفید کردن دندان', 'Teeth whitening'),
    subtitle: text('روشن‌تر شدن کنترل‌شده لبخند', 'Controlled smile brightening'),
    summary: text('بلیچینگ حرفه‌ای رنگ دندان را با پروتکل ایمن‌تر و کنترل حساسیت، چند درجه روشن‌تر می‌کند.', 'Professional whitening brightens teeth by several shades using a safer sensitivity-controlled protocol.'),
    longIntro: text(
      'سفید کردن دندان برای تغییر رنگ‌های سطحی و برخی رنگ‌رفتگی‌های داخلی کاربرد دارد. قبل از شروع، پوسیدگی، ترک، حساسیت، ترمیم‌های قدیمی و سلامت لثه بررسی می‌شود. باید بدانید بلیچینگ رنگ روکش، لمینت یا کامپوزیت را روشن نمی‌کند و نتیجه نهایی به جنس دندان و سبک زندگی بستگی دارد.',
      'Whitening treats surface stains and some internal discoloration. Before starting, decay, cracks, sensitivity, old restorations and gum health are checked. It is important to know that whitening does not lighten crowns, veneers or composite, and the result depends on tooth structure and lifestyle.'
    ),
    duration: text('اغلب ۱ جلسه یا برنامه خانگی کنترل‌شده', 'Often 1 visit or a controlled home plan'),
    cost: text('بر اساس روش، شدت تغییر رنگ و نیازهای قبل درمان', 'Based on method, stain severity and pre-treatment needs'),
    idealFor: [
      text('تغییر رنگ ناشی از چای، قهوه یا سن', 'Staining from tea, coffee or age'),
      text('افراد با دندان و لثه سالم', 'People with healthy teeth and gums'),
      text('کسانی که تغییر طبیعی و کنترل‌شده می‌خواهند', 'Those wanting a natural controlled change')
    ],
    benefits: [
      text('افزایش درخشندگی لبخند', 'Brighter smile'),
      text('درمان غیرتهاجمی', 'Non-invasive treatment'),
      text('قابل تکرار با فاصله مناسب', 'Repeatable with proper intervals'),
      text('آمادگی بهتر برای طراحی لبخند', 'Useful before smile design')
    ],
    userValue: [
      text('قبل از درمان می‌فهمید آیا رنگ دندان شما به بلیچینگ پاسخ می‌دهد.', 'You know whether your tooth color is likely to respond.'),
      text('حساسیت احتمالی و راه کنترل آن توضیح داده می‌شود.', 'Possible sensitivity and control methods are explained.'),
      text('انتظار واقع‌بینانه از میزان روشن شدن دارید.', 'You get realistic expectations for brightness change.')
    ],
    steps: [
      { step: 1, title: text('ارزیابی رنگ و سلامت', 'Shade and health check'), description: text('رنگ پایه و مشکلات احتمالی بررسی می‌شود.', 'Base shade and possible issues are checked.') },
      { step: 2, title: text('آماده‌سازی', 'Preparation'), description: text('در صورت نیاز جرم‌گیری یا اصلاح التهاب انجام می‌شود.', 'Cleaning or gum care is done if needed.') },
      { step: 3, title: text('اجرای بلیچینگ', 'Whitening'), description: text('مواد سفیدکننده با پروتکل کنترل‌شده استفاده می‌شود.', 'Whitening material is used with a controlled protocol.') },
      { step: 4, title: text('راهنمای تثبیت رنگ', 'Shade maintenance'), description: text('توصیه‌های غذایی و مراقبتی برای حفظ نتیجه داده می‌شود.', 'Diet and care guidance helps maintain the result.') }
    ],
    care: [
      text('تا مدت کوتاهی مصرف رنگدانه‌های قوی را محدود کنید.', 'Limit strong pigments for a short period.'),
      text('خمیر دندان ضد حساسیت می‌تواند کمک کند.', 'Desensitizing toothpaste can help.'),
      text('نتیجه با سبک زندگی و بهداشت بهتر ماندگارتر می‌شود.', 'Results last longer with better lifestyle and hygiene.')
    ],
    faqs: [
      { id: 'white-1', question: text('بلیچینگ به مینای دندان آسیب می‌زند؟', 'Does whitening damage enamel?'), answer: text('اگر با تشخیص درست و پروتکل استاندارد انجام شود، درمانی کنترل‌شده و کم‌تهاجمی است.', 'With proper diagnosis and standard protocol, it is controlled and minimally invasive.') },
      { id: 'white-2', question: text('چرا رنگ روکش‌ها روشن نمی‌شود؟', 'Why do crowns not whiten?'), answer: text('مواد ترمیمی و سرامیکی به مواد بلیچینگ مثل مینای طبیعی پاسخ نمی‌دهند.', 'Restorative and ceramic materials do not respond like natural enamel.') }
    ],
    relatedIds: ['laminate', 'composite', 'gum-treatment'],
    seo: {
      title: text('سفید کردن دندان | بلیچینگ حرفه‌ای', 'Teeth whitening | Professional bleaching'),
      description: text('اطلاعات کامل سفید کردن دندان، بلیچینگ، مراقبت بعد درمان و کنترل حساسیت.', 'Complete information on whitening, bleaching, aftercare and sensitivity control.')
    }
  },
  {
    id: 'root-canal',
    icon: 'shield',
    image: image('photo-1606811971618-4486d14f3f99'),
    accent: '#b96f52',
    title: text('درمان ریشه', 'Root canal therapy'),
    subtitle: text('حفظ دندان طبیعی و کنترل درد', 'Saving the natural tooth and controlling pain'),
    summary: text('درمان ریشه برای پاک‌سازی عفونت داخل دندان، کاهش درد و جلوگیری از کشیدن دندان انجام می‌شود.', 'Root canal therapy cleans infection inside the tooth, reduces pain and helps avoid extraction.'),
    longIntro: text(
      'وقتی عصب دندان درگیر عفونت یا التهاب شدید می‌شود، درد، حساسیت طولانی، تورم یا آبسه ممکن است ایجاد شود. درمان ریشه با هدف پاک‌سازی کانال‌ها، ضدعفونی و پر کردن فضای داخلی انجام می‌شود تا دندان طبیعی حفظ شود. بعد از درمان، گاهی روکش یا ترمیم مقاوم برای جلوگیری از شکستگی لازم است.',
      'When the tooth pulp becomes infected or severely inflamed, pain, lingering sensitivity, swelling or abscess can occur. Root canal therapy cleans, disinfects and seals the inner space so the natural tooth can be saved. A strong restoration or crown may be needed afterwards to prevent fracture.'
    ),
    duration: text('معمولاً ۱ تا ۲ جلسه', 'Usually 1 to 2 visits'),
    cost: text('وابسته به تعداد کانال، شدت عفونت و ترمیم نهایی', 'Depends on canal count, infection severity and final restoration'),
    idealFor: [
      text('درد ضربان‌دار یا حساسیت طولانی', 'Throbbing pain or lingering sensitivity'),
      text('آبسه یا تورم اطراف دندان', 'Abscess or swelling around a tooth'),
      text('دندان قابل نگهداری با ساختار کافی', 'Teeth with enough structure to save')
    ],
    benefits: [
      text('حفظ دندان طبیعی', 'Saves the natural tooth'),
      text('کنترل درد و عفونت', 'Controls pain and infection'),
      text('جلوگیری از جابه‌جایی دندان‌ها', 'Helps prevent shifting'),
      text('امکان بازسازی عملکرد', 'Allows functional restoration')
    ],
    userValue: [
      text('علت درد و نیاز واقعی به درمان توضیح داده می‌شود.', 'The reason for pain and real treatment need are explained.'),
      text('می‌دانید بعد از درمان چه ترمیمی لازم است.', 'You know what restoration is needed afterwards.'),
      text('مراقبت‌های هشداردهنده برای عفونت یا شکستگی را می‌شناسید.', 'You recognize warning care points for infection or fracture.')
    ],
    steps: [
      { step: 1, title: text('تشخیص', 'Diagnosis'), description: text('تست دندان و عکس برای تعیین منبع درد انجام می‌شود.', 'Tooth tests and imaging identify the pain source.') },
      { step: 2, title: text('پاک‌سازی کانال', 'Canal cleaning'), description: text('فضای داخلی دندان پاک‌سازی و ضدعفونی می‌شود.', 'The inner canal space is cleaned and disinfected.') },
      { step: 3, title: text('پر کردن ریشه', 'Sealing'), description: text('کانال‌ها با ماده مناسب پر می‌شوند.', 'Canals are filled with suitable material.') },
      { step: 4, title: text('ترمیم نهایی', 'Final restoration'), description: text('برای جلوگیری از شکستگی، ترمیم یا روکش بررسی می‌شود.', 'A filling or crown is considered to prevent fracture.') }
    ],
    care: [
      text('تا ترمیم نهایی، فشار زیاد روی دندان وارد نکنید.', 'Avoid heavy pressure until the final restoration.'),
      text('درد شدید، تورم یا تب را سریع اطلاع دهید.', 'Report severe pain, swelling or fever promptly.'),
      text('ترمیم نهایی را به تعویق نیندازید.', 'Do not delay the final restoration.')
    ],
    faqs: [
      { id: 'root-1', question: text('آیا درمان ریشه یعنی دندان مرده است؟', 'Does root canal mean the tooth is dead?'), answer: text('دندان عصب داخلی را از دست می‌دهد، اما با ترمیم مناسب می‌تواند همچنان عملکرد داشته باشد.', 'The inner pulp is removed, but with proper restoration the tooth can still function.') },
      { id: 'root-2', question: text('بعد از درمان درد طبیعی است؟', 'Is pain after treatment normal?'), answer: text('حساسیت خفیف تا چند روز ممکن است رخ دهد؛ درد شدید یا تورم نیاز به تماس سریع دارد.', 'Mild soreness for a few days can happen; severe pain or swelling needs prompt contact.') }
    ],
    relatedIds: ['implant', 'gum-treatment', 'whitening'],
    seo: {
      title: text('درمان ریشه دندان | کنترل درد و عفونت', 'Root canal therapy | Pain and infection control'),
      description: text('علائم نیاز به درمان ریشه، مراحل عصب‌کشی، مراقبت‌ها و ترمیم نهایی دندان.', 'Signs, root canal steps, care and final restoration guidance.')
    }
  },
  {
    id: 'pediatric',
    icon: 'heart',
    image: image('photo-1629909613654-28e377c37b09'),
    accent: '#c58d73',
    title: text('دندان‌پزشکی کودکان', 'Pediatric dentistry'),
    subtitle: text('تجربه آرام برای کودک و والدین', 'A calm experience for children and parents'),
    summary: text('درمان و پیشگیری کودکان با زبان ساده، کنترل اضطراب و آموزش به والدین انجام می‌شود.', 'Children receive preventive and restorative care with simple communication, anxiety control and parent education.'),
    longIntro: text(
      'اولین تجربه‌های دندان‌پزشکی می‌تواند نگاه کودک به درمان را برای سال‌ها شکل دهد. در بخش کودکان، تلاش می‌شود معاینه، آموزش مسواک، فلورایدتراپی، فیشورسیلانت و درمان پوسیدگی با آرامش و توضیح قابل فهم انجام شود. والدین نیز درباره تغذیه، عادت‌های دهانی و زمان مراجعات راهنمایی می‌شوند.',
      'Early dental experiences can shape a child’s attitude for years. Pediatric care focuses on calm exams, brushing education, fluoride, fissure sealants and cavity treatment with child-friendly explanations. Parents receive guidance on diet, oral habits and checkup timing.'
    ),
    duration: text('بر اساس سن کودک و نوع درمان', 'Based on child age and treatment type'),
    cost: text('پس از معاینه و تعیین شدت پوسیدگی یا درمان پیشگیرانه', 'After exam and defining decay severity or preventive needs'),
    idealFor: [
      text('کودکان با پوسیدگی یا درد', 'Children with cavities or pain'),
      text('کودکان نیازمند پیشگیری منظم', 'Children needing regular prevention'),
      text('والدینی که آموزش مراقبت خانگی می‌خواهند', 'Parents wanting home-care guidance')
    ],
    benefits: [
      text('کاهش ترس کودک از درمان', 'Reduces dental fear'),
      text('پیشگیری از پوسیدگی‌های عمیق‌تر', 'Prevents deeper decay'),
      text('آموزش بهداشت متناسب با سن', 'Age-based hygiene education'),
      text('حفظ دندان‌های شیری تا زمان مناسب', 'Maintains baby teeth until the right time')
    ],
    userValue: [
      text('والدین دقیق می‌دانند در خانه چه کاری انجام دهند.', 'Parents know exactly what to do at home.'),
      text('درمان با زبان قابل فهم برای کودک توضیح داده می‌شود.', 'Treatment is explained in child-friendly language.'),
      text('هدف ساختن تجربه مثبت و پیشگیری از درمان‌های سخت‌تر است.', 'The goal is a positive experience and prevention of harder treatments.')
    ],
    steps: [
      { step: 1, title: text('آشنایی و معاینه', 'Friendly exam'), description: text('کودک با محیط آشنا می‌شود و دندان‌ها بررسی می‌شوند.', 'The child meets the environment and teeth are checked.') },
      { step: 2, title: text('آموزش والد و کودک', 'Parent and child education'), description: text('روش مسواک، تغذیه و عادت‌ها توضیح داده می‌شود.', 'Brushing, diet and habits are explained.') },
      { step: 3, title: text('پیشگیری یا درمان', 'Prevention or treatment'), description: text('فلوراید، سیلانت یا درمان پوسیدگی انجام می‌شود.', 'Fluoride, sealants or cavity care are completed.') },
      { step: 4, title: text('پیگیری', 'Follow-up'), description: text('زمان مراجعات بعدی بر اساس ریسک پوسیدگی تعیین می‌شود.', 'Next visits are set based on decay risk.') }
    ],
    care: [
      text('مصرف خوراکی شیرین را محدود و زمان‌بندی کنید.', 'Limit and schedule sugary snacks.'),
      text('مسواک کودک تا سن مناسب با نظارت والدین باشد.', 'Brushing should be supervised until the right age.'),
      text('درد یا تورم دندان شیری را جدی بگیرید.', 'Take baby-tooth pain or swelling seriously.')
    ],
    faqs: [
      { id: 'kid-1', question: text('دندان شیری هم نیاز به درمان دارد؟', 'Do baby teeth need treatment?'), answer: text('بله. دندان شیری در جویدن، صحبت کردن و حفظ فضا برای دندان دائمی نقش دارد.', 'Yes. Baby teeth help chewing, speech and maintaining space for permanent teeth.') },
      { id: 'kid-2', question: text('اولین مراجعه کودک چه زمانی باشد؟', 'When should the first dental visit happen?'), answer: text('بهتر است از سن پایین و قبل از درد، معاینه و آموزش پیشگیرانه انجام شود.', 'Early visits before pain are best for prevention and education.') }
    ],
    relatedIds: ['orthodontics', 'root-canal', 'gum-treatment'],
    seo: {
      title: text('دندان‌پزشکی کودکان | درمان آرام و پیشگیری', 'Pediatric dentistry | Calm care and prevention'),
      description: text('خدمات دندان‌پزشکی کودکان، پیشگیری، فلوراید، درمان پوسیدگی و آموزش والدین.', 'Pediatric dental services, prevention, fluoride, cavity care and parent education.')
    }
  },
  {
    id: 'gum-treatment',
    icon: 'leaf',
    image: image('photo-1629909615184-74f495363b67'),
    accent: '#8f9d74',
    title: text('درمان لثه', 'Gum treatment'),
    subtitle: text('کنترل التهاب، خونریزی و بوی دهان', 'Managing inflammation, bleeding and breath concerns'),
    summary: text('سلامت لثه پایه ماندگاری درمان‌های زیبایی، ایمپلنت و دندان‌های طبیعی است.', 'Gum health is the foundation for long-lasting cosmetic work, implants and natural teeth.'),
    longIntro: text(
      'خونریزی، بوی بد دهان، تحلیل لثه یا لق شدن دندان‌ها نشانه‌هایی هستند که نباید نادیده گرفته شوند. درمان لثه از آموزش بهداشت و جرم‌گیری تخصصی تا درمان‌های عمیق‌تر متفاوت است. اگر لثه سالم نباشد، نتیجه لمینت، کامپوزیت، ایمپلنت و حتی ترمیم‌های ساده هم قابل پیش‌بینی نخواهد بود.',
      'Bleeding, bad breath, recession or loose teeth should not be ignored. Gum care ranges from hygiene coaching and professional cleaning to deeper treatments. Without healthy gums, veneers, composite, implants and even simple restorations become less predictable.'
    ),
    duration: text('از یک جلسه تا چند مرحله درمانی', 'From one visit to several treatment stages'),
    cost: text('وابسته به شدت التهاب، جرم زیر لثه و نیازهای تکمیلی', 'Depends on inflammation severity, deep calculus and supporting needs'),
    idealFor: [
      text('خونریزی هنگام مسواک یا نخ دندان', 'Bleeding during brushing or flossing'),
      text('بوی بد دهان یا التهاب لثه', 'Bad breath or gum inflammation'),
      text('افراد پیش از ایمپلنت یا درمان زیبایی', 'People before implants or cosmetic care')
    ],
    benefits: [
      text('کاهش التهاب و خونریزی', 'Less inflammation and bleeding'),
      text('افزایش پیش‌بینی‌پذیری درمان‌ها', 'More predictable treatments'),
      text('کمک به حفظ دندان‌ها', 'Helps preserve teeth'),
      text('بهبود بوی دهان', 'Improves breath concerns')
    ],
    userValue: [
      text('علت خونریزی یا التهاب به زبان ساده مشخص می‌شود.', 'The cause of bleeding or inflammation is explained simply.'),
      text('می‌آموزید چطور در خانه از برگشت مشکل پیشگیری کنید.', 'You learn how to prevent recurrence at home.'),
      text('پیش از درمان‌های زیبایی، پایه سلامت دهان محکم می‌شود.', 'The health foundation is strengthened before cosmetic care.')
    ],
    steps: [
      { step: 1, title: text('اندازه‌گیری و بررسی', 'Assessment'), description: text('عمق پاکت، خونریزی و جرم بررسی می‌شود.', 'Pocket depth, bleeding and calculus are reviewed.') },
      { step: 2, title: text('آموزش بهداشت', 'Hygiene coaching'), description: text('ابزار و روش مناسب برای خانه توضیح داده می‌شود.', 'Suitable tools and home techniques are explained.') },
      { step: 3, title: text('پاک‌سازی تخصصی', 'Professional cleaning'), description: text('جرم و التهاب با روش مناسب کنترل می‌شود.', 'Calculus and inflammation are managed with the right method.') },
      { step: 4, title: text('نگهداری', 'Maintenance'), description: text('برنامه پیگیری بر اساس ریسک فرد تنظیم می‌شود.', 'Maintenance timing is set by individual risk.') }
    ],
    care: [
      text('نخ دندان یا ابزار بین‌دندانی را روزانه استفاده کنید.', 'Use floss or interdental tools daily.'),
      text('سیگار و قلیان روند بهبود لثه را مختل می‌کند.', 'Smoking can compromise gum healing.'),
      text('مراجعات نگهدارنده را حتی بدون درد انجام دهید.', 'Attend maintenance visits even without pain.')
    ],
    faqs: [
      { id: 'gum-1', question: text('خونریزی لثه طبیعی است؟', 'Is gum bleeding normal?'), answer: text('خیر. خونریزی تکرارشونده معمولاً نشانه التهاب یا مشکل بهداشتی است و باید بررسی شود.', 'No. Repeated bleeding usually signals inflammation or hygiene problems and should be checked.') },
      { id: 'gum-2', question: text('جرم‌گیری به دندان آسیب می‌زند؟', 'Does cleaning damage teeth?'), answer: text('جرم‌گیری اصولی به دندان سالم آسیب نمی‌زند و برای کنترل التهاب ضروری است.', 'Proper cleaning does not damage healthy teeth and is essential for inflammation control.') }
    ],
    relatedIds: ['implant', 'whitening', 'root-canal'],
    seo: {
      title: text('درمان لثه | کنترل خونریزی و التهاب', 'Gum treatment | Bleeding and inflammation control'),
      description: text('علائم بیماری لثه، مراحل درمان، مراقبت خانگی و نقش سلامت لثه در درمان‌های دندان‌پزشکی.', 'Gum disease signs, treatment steps, home care and the role of gum health in dentistry.')
    }
  }
];

export const BENEFIT_CARDS: BenefitCard[] = [
  {
    id: 'honest-plan',
    icon: 'shield',
    title: text('تشخیص و توضیح شفاف', 'Clear diagnosis and guidance'),
    text: text('پیش از شروع درمان، دلیل مشکل، گزینه‌های ممکن، محدودیت‌ها و مراقبت‌های لازم به زبان ساده توضیح داده می‌شود.', 'Before treatment starts, the problem, possible options, limitations and care needs are explained in simple language.')
  },
  {
    id: 'graphic-ui',
    icon: 'sparkle',
    title: text('تمرکز روی سلامت و زیبایی طبیعی', 'Focused on health and natural aesthetics'),
    text: text('در درمان‌های زیبایی مثل لمینت و کامپوزیت، سلامت دندان و هماهنگی لبخند با چهره همزمان در نظر گرفته می‌شود.', 'For cosmetic treatments such as veneers and composite, tooth health and smile harmony are considered together.')
  },
  {
    id: 'care-access',
    icon: 'tooth',
    title: text('دسترسی ساده به مسیر درمان', 'Simple access to care paths'),
    text: text('اطلاعات هر خدمت، نمونه درمان‌ها و فرم درخواست تماس کنار هم قرار گرفته‌اند تا بیمار سریع‌تر مسیر مناسب را پیدا کند.', 'Service information, treatment samples and the call request form sit together so patients can find the right path faster.')
  },
  {
    id: 'phone-lead',
    icon: 'phone',
    title: text('درخواست تماس برای راهنمایی', 'Call request for guidance'),
    text: text('اگر درباره ایمپلنت، زیبایی، درد دندان یا درمان لثه سؤال دارید، شماره خود را ثبت می‌کنید تا برای راهنمایی اولیه تماس گرفته شود.', 'If you have questions about implants, cosmetic care, tooth pain or gum treatment, leave your number for an initial guidance call.')
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'maryam',
    name: text('مریم احمدی', 'Maryam Ahmadi'),
    service: text('لمینت سرامیکی', 'Porcelain veneers'),
    text: text('قبل از شروع درباره رنگ، فرم و محدودیت‌های لمینت کامل صحبت شد. نتیجه برای من طبیعی و هماهنگ با صورتم است.', 'Before starting, shade, shape and veneer limitations were explained clearly. The result feels natural and fits my face.'),
    rating: 5
  },
  {
    id: 'reza',
    name: text('رضا کاظمی', 'Reza Kazemi'),
    service: text('ایمپلنت دندان', 'Dental implants'),
    text: text('برای ایمپلنت اول شرایط استخوان و لثه بررسی شد و بعد مراحل درمان را توضیح دادند. همین باعث شد با آرامش تصمیم بگیرم.', 'For my implant, bone and gum condition were checked first and the steps were explained, which helped me decide calmly.'),
    rating: 5
  },
  {
    id: 'sara',
    name: text('سارا محمدی', 'Sara Mohammadi'),
    service: text('کامپوزیت ونیر', 'Composite veneers'),
    text: text('کامپوزیت برای اصلاح فرم چند دندان انجام شد، نه تغییر اغراق‌آمیز. توضیح مراقبت‌ها بعد از درمان هم خیلی کمک کرد.', 'Composite was done to refine a few tooth shapes, not create an exaggerated change. The aftercare guidance was very helpful.'),
    rating: 5
  },
  {
    id: 'hamid',
    name: text('حمید رضایی', 'Hamid Rezaei'),
    service: text('درمان ریشه', 'Root canal therapy'),
    text: text('با درد مراجعه کردم و بعد از معاینه علت درد مشخص شد. مرحله‌های درمان ریشه ساده و قابل فهم توضیح داده شد.', 'I came in with pain and the cause was identified after examination. The root canal steps were explained simply and clearly.'),
    rating: 5
  },
  {
    id: 'niloofar',
    name: text('نیلوفر کریمی', 'Niloofar Karimi'),
    service: text('درمان لثه', 'Gum treatment'),
    text: text('برای خونریزی لثه مراجعه کردم. روش صحیح مراقبت روزانه و نیاز به جرم‌گیری تخصصی بدون ترساندن توضیح داده شد.', 'I visited for gum bleeding. Daily care technique and the need for professional cleaning were explained without fear-based messaging.'),
    rating: 5
  }
];

export const GLOBAL_FAQS: FaqItem[] = [
  {
    id: 'first-step',
    question: text('برای انتخاب خدمت از کجا شروع کنم؟', 'Where should I start when choosing a service?'),
    answer: text('اگر مطمئن نیستید به کدام درمان نیاز دارید، فرم درخواست تماس را پر کنید تا درباره علائم، هدف درمان و مسیر مراجعه راهنمایی اولیه بگیرید.', 'If you are unsure which treatment you need, submit the call request form for initial guidance about symptoms, treatment goals and visit path.')
  },
  {
    id: 'cost',
    question: text('هزینه خدمات چطور مشخص می‌شود؟', 'How are costs defined?'),
    answer: text('هزینه دقیق فقط بعد از معاینه، بررسی عکس، تعداد دندان‌ها و نوع مواد قابل اعلام است.', 'Exact cost is defined only after exam, imaging, tooth count and material selection.')
  },
  {
    id: 'language',
    question: text('سایت دو زبانه است؟', 'Is the website bilingual?'),
    answer: text('بله. محتوای اصلی، ناوبری و فرم‌ها به فارسی و انگلیسی قابل مشاهده هستند.', 'Yes. Main content, navigation and forms are available in Persian and English.')
  },
  {
    id: 'dark',
    question: text('تم سایت چه رنگی است؟', 'What is the site theme?'),
    answer: text('سایت هم حالت روشن با رنگ‌های تمیز و آرام دارد و هم حالت تاریک برای خوانایی بهتر در محیط کم‌نور.', 'The site supports both a clean calm light mode and a dark mode for better readability in low light.')
  }
];
