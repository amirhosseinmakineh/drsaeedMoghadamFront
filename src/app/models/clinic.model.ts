export type LanguageCode = 'fa' | 'en';
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
  title: LocalizedText;
  text: LocalizedText;
  image: ClinicImage;
}

export interface WorkSample {
  id: string;
  title: LocalizedText;
  service: LocalizedText;
  description: LocalizedText;
  result: LocalizedText;
  image: ClinicImage;
}

export interface DentalService {
  id: string;
  icon: string;
  image: ClinicImage;
  accent: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  summary: LocalizedText;
  longIntro: LocalizedText;
  duration: LocalizedText;
  cost: LocalizedText;
  idealFor: LocalizedText[];
  benefits: LocalizedText[];
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

export interface ClinicImage {
  src: string;
  alt?: LocalizedText;
  srcset?: string;
  sizes?: string;
  width: number;
  height: number;
}

export interface AuthDialogModel {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  gender: number;
  birthDate: string;
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

const paletteFor = (id: string): [string, string, string] => {
  const palettes: [string, string, string][] = [
    ['#fff8ec', '#e8d3ad', '#a8793f'],
    ['#fffaf2', '#efdcbc', '#b88a44'],
    ['#fff7ed', '#ead6bd', '#9f8565'],
    ['#fffbf4', '#f2e2c9', '#8f9d74']
  ];
  const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;

  return palettes[index];
};

const inlineClinicImage = (
  id: string,
  width = 640,
  height = 420,
  sizes = '(max-width: 640px) 76vw, (max-width: 980px) 70vw, 34vw'
): ClinicImage => {
  const [bg, soft, accent] = paletteFor(id);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
      <rect width="100%" height="100%" rx="42" fill="${bg}"/>
      <circle cx="${Math.round(width * 0.18)}" cy="${Math.round(height * 0.18)}" r="${Math.round(width * 0.22)}" fill="${soft}"/>
      <circle cx="${Math.round(width * 0.84)}" cy="${Math.round(height * 0.82)}" r="${Math.round(width * 0.20)}" fill="${soft}" opacity=".72"/>
      <path d="M${Math.round(width * 0.26)} ${Math.round(height * 0.36)}c${Math.round(width * 0.12)}-${Math.round(height * 0.22)} ${Math.round(width * 0.35)}-${Math.round(height * 0.24)} ${Math.round(width * 0.48)} 0 ${Math.round(width * 0.08)} ${Math.round(height * 0.15)} ${Math.round(width * 0.04)} ${Math.round(height * 0.38)}-${Math.round(width * 0.06)} ${Math.round(height * 0.44)}-${Math.round(width * 0.08)} ${Math.round(height * 0.04)}-${Math.round(width * 0.15)}-${Math.round(height * 0.03)}-${Math.round(width * 0.20)}-${Math.round(height * 0.15)}-${Math.round(width * 0.05)} ${Math.round(height * 0.12)}-${Math.round(width * 0.13)} ${Math.round(height * 0.19)}-${Math.round(width * 0.20)} ${Math.round(height * 0.15)}-${Math.round(width * 0.10)}-${Math.round(height * 0.06)}-${Math.round(width * 0.14)}-${Math.round(height * 0.29)}-${Math.round(width * 0.06)}-${Math.round(height * 0.44)}z" fill="#fffdf8" stroke="${accent}" stroke-width="6"/>
      <path d="M${Math.round(width * 0.28)} ${Math.round(height * 0.68)}c${Math.round(width * 0.12)} ${Math.round(height * 0.11)} ${Math.round(width * 0.32)} ${Math.round(height * 0.11)} ${Math.round(width * 0.44)} 0" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
      <path d="M${Math.round(width * 0.19)} ${Math.round(height * 0.78)}h${Math.round(width * 0.62)}" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity=".22"/>
    </svg>
  `.trim();

  return {
    src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    sizes,
    width,
    height
  };
};

const image = inlineClinicImage;

const portfolioImage = (path: string): ClinicImage =>
  inlineClinicImage(path, 720, 420, '(max-width: 640px) 100vw, (max-width: 980px) 92vw, 44vw');

const heroImage = (id: string): ClinicImage =>
  image(id, 760, 430, '(max-width: 640px) 76vw, (max-width: 980px) 70vw, 32vw');

export const NAV_ITEMS: NavItem[] = [
  { label: text('خانه', 'Home'), href: '/', icon: 'home' },
  { label: text('خدمات', 'Services'), href: '/services', icon: 'sparkle' },
  { label: text('درباره ما', 'About'), href: '/about', icon: 'doctor' },
  { label: text('تماس', 'Contact'), href: '/contact', icon: 'phone' }
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'digital-smile',
    title: text('درمان دقیق، طراحی لبخند طبیعی و مراقبت قابل اعتماد', 'Precise care, natural smile design and trustworthy dentistry'),
    text: text(
      'در کلینیک دندان‌پزشکی دکتر سعید مقدم، درمان‌های زیبایی و عمومی مثل ایمپلنت، لمینت، کامپوزیت، بلیچینگ، درمان ریشه و مراقبت لثه با معاینه دقیق و توضیح شفاف انجام می‌شود.',
      'At Dr. Saeed Moghaddam Dental Clinic, cosmetic and general dental treatments such as implants, veneers, composite, whitening, root canal therapy and gum care are planned with careful exams and clear guidance.'
    ),
    image: heroImage('photo-1606811971618-4486d14f3f99')
  },
  {
    id: 'calm-suite',
    title: text('قبل از تصمیم، مشکل، گزینه‌ها و مراقبت‌ها روشن می‌شود', 'Before any decision, the problem, options and care are clear'),
    text: text(
      'اگر درد دندان، نیاز به ایمپلنت، اصلاح طرح لبخند یا درمان لثه دارید، ابتدا شرایط دهان و دندان بررسی می‌شود و مسیر مناسب بدون وعده اغراق‌آمیز توضیح داده می‌شود.',
      'Whether you have tooth pain, need implants, want a smile makeover or require gum care, your oral condition is reviewed first and the suitable path is explained without exaggerated promises.'
    ),
    image: heroImage('photo-1629909615184-74f495363b67')
  },
  {
    id: 'mobile-first',
    title: text('از تماس اولیه تا پیگیری بعد از درمان، مسیر ساده است', 'From first call to aftercare, the path stays simple'),
    text: text(
      'درمان‌ها، توضیحات تخصصی، سوالات پرتکرار و فرم درخواست تماس کنار هم آمده‌اند تا مراجعه‌کننده سریع‌تر بداند برای کدام مسیر درمانی باید راهنمایی بگیرد.',
      'Services, treatment explanations, FAQs and the call request form are grouped together so patients quickly know which service they need guidance for.'
    ),
    image: heroImage('photo-1588776814546-1ffcf47267a5')
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
      'ایمپلنت دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم برای جایگزینی ریشه از دست رفته، بازگرداندن جویدن و حفظ فرم لبخند بررسی می‌شود.',
      'Implants restore chewing strength, smile aesthetics and help prevent neighboring teeth from shifting.'
    ),
    longIntro: text(
      'ایمپلنت دندان زمانی پیشنهاد می‌شود که ریشه طبیعی از دست رفته باشد و بیمار به جایگزینی ثابت، قابل تمیز کردن و نزدیک به عملکرد دندان طبیعی نیاز داشته باشد. در کلینیک دندان‌پزشکی دکتر سعید مقدم، قبل از کاشت ایمپلنت وضعیت لثه، حجم و کیفیت استخوان، فاصله تا سینوس یا عصب، عادت‌های بهداشتی، مصرف دخانیات، داروهای مهم و عکس‌های تشخیصی بررسی می‌شود. هدف درمان فقط پر کردن جای خالی نیست؛ ایمپلنت باید با روکش نهایی، خط لثه، قدرت جویدن و برنامه نگهداری بیمار هماهنگ باشد.',
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
      text('جایگزینی ثابت دندان از دست رفته بدون وابستگی به دندان‌های سالم کناری', 'Fixed missing-tooth replacement without relying on healthy neighboring teeth'),
      text('کمک به حفظ استخوان فک و فرم بافت نرم در ناحیه بی‌دندانی', 'Helps support jawbone and soft-tissue form in the missing-tooth area'),
      text('بازگرداندن قدرت جویدن با روکش طراحی‌شده بر اساس تماس‌های دندانی', 'Restores chewing with a crown designed around bite contacts'),
      text('قابل نگهداری بودن درمان با رعایت بهداشت اطراف ایمپلنت و مراجعات دوره‌ای', 'Maintainable treatment with implant hygiene and periodic reviews')
    ],
    steps: [
      { step: 1, title: text('معاینه، عکس و ارزیابی لثه', 'Exam, imaging and gum assessment'), description: text('فضای دندان از دست رفته، حجم استخوان، سلامت لثه و فاصله با ساختارهای حساس مثل سینوس یا عصب بررسی می‌شود.', 'The missing-tooth space, bone volume, gum health and distance from structures such as the sinus or nerve are evaluated.') },
      { step: 2, title: text('طرح درمان و آماده‌سازی', 'Treatment planning and preparation'), description: text('نیاز به کشیدن باقی‌مانده ریشه، پیوند استخوان، درمان لثه یا اصلاح بهداشت پیش از جراحی مشخص می‌شود.', 'Needs such as root removal, bone grafting, gum therapy or hygiene improvement are defined before surgery.') },
      { step: 3, title: text('کاشت ایمپلنت با پروتکل استریل', 'Implant placement with sterile protocol'), description: text('پایه ایمپلنت با بی‌حسی موضعی، کنترل خونریزی و رعایت اصول جراحی در موقعیت برنامه‌ریزی‌شده قرار می‌گیرد.', 'The implant fixture is placed under local anesthesia with bleeding control and surgical protocol in the planned position.') },
      { step: 4, title: text('دوره جوش خوردن و کنترل', 'Healing and integration review'), description: text('در زمان ترمیم، فشار مستقیم روی ایمپلنت کنترل می‌شود و روند جوش خوردن پایه با استخوان پایش می‌شود.', 'During healing, direct pressure on the implant is controlled and osseointegration is monitored.') },
      { step: 5, title: text('قالب‌گیری، روکش و نگهداری', 'Impression, crown and maintenance'), description: text('پس از آماده شدن پایه، اباتمنت و روکش متناسب با لثه و تماس دندانی ساخته و برنامه نگهداری دوره‌ای توضیح داده می‌شود.', 'After integration, the abutment and crown are made to fit gum form and bite contacts, followed by maintenance guidance.') }
    ],
    care: [
      text('در ۲۴ ساعت اول از دستکاری محل جراحی، شست‌وشوی شدید و غذای داغ خودداری کنید و داروها را طبق نسخه مصرف کنید.', 'For the first 24 hours, avoid manipulating the surgical area, vigorous rinsing and hot foods; take medications as prescribed.'),
      text('تا زمان اجازه دندان‌پزشک، روی ناحیه ایمپلنت فشار جویدن سنگین وارد نکنید و از دخانیات پرهیز کنید.', 'Avoid heavy chewing on the implant area until cleared by the dentist and avoid smoking.'),
      text('بعد از نصب روکش، مسواک، نخ یا برس بین‌دندانی مناسب اطراف ایمپلنت را روزانه انجام دهید.', 'After crown delivery, clean around the implant daily with the appropriate brush, floss or interdental brush.'),
      text('درد رو به افزایش، تورم، ترشح، بوی بد یا لق شدن هر قطعه نیاز به تماس و بررسی سریع دارد.', 'Increasing pain, swelling, discharge, bad odor or looseness of any component needs prompt review.')
    ],
    faqs: [
      { id: 'implant-1', question: text('آیا کاشت ایمپلنت دندان درد دارد؟', 'Is implant placement painful?'), answer: text('حین جراحی با بی‌حسی موضعی درد کنترل می‌شود. ناراحتی، تورم یا حساسیت خفیف تا چند روز طبیعی است، اما درد شدید یا رو به افزایش باید بررسی شود.', 'Local anesthesia controls pain during surgery. Mild discomfort, swelling or soreness for a few days is common, but severe or increasing pain needs review.') },
      { id: 'implant-2', question: text('ایمپلنت چند ماه طول می‌کشد تا به استخوان جوش بخورد؟', 'How long does implant integration take?'), answer: text('در بسیاری از موارد چند ماه زمان لازم است و این مدت به فک بالا یا پایین، کیفیت استخوان، پیوند استخوان، سلامت عمومی و رعایت مراقبت‌ها بستگی دارد.', 'Integration often takes several months and depends on jaw location, bone quality, grafting, general health and aftercare.') },
      { id: 'implant-3', question: text('چه کسانی قبل از ایمپلنت نیاز به پیوند استخوان دارند؟', 'Who may need bone grafting before implants?'), answer: text('اگر ارتفاع یا عرض استخوان کافی نباشد، دندان مدت طولانی از دست رفته باشد یا عفونت قبلی باعث تحلیل استخوان شده باشد، پیوند استخوان ممکن است در طرح درمان قرار بگیرد.', 'Bone grafting may be planned when bone height or width is insufficient, the tooth has been missing for a long time or previous infection caused bone loss.') },
      { id: 'implant-4', question: text('بعد از ایمپلنت چه علائمی هشداردهنده است؟', 'What warning signs should be checked after implants?'), answer: text('تب، تورم رو به افزایش، ترشح چرکی، بوی بد، درد شدید ماندگار یا لق شدن پایه، پیچ یا روکش باید سریع به کلینیک اطلاع داده شود.', 'Fever, increasing swelling, pus discharge, bad odor, persistent severe pain or looseness of the fixture, screw or crown should be reported promptly.') }
    ],
    relatedIds: ['root-canal', 'gum-treatment', 'laminate'],
    seo: {
      title: text('ایمپلنت دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Dental implants | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای ایمپلنت دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ مراحل کاشت، مدت جوش خوردن، مراقبت‌ها، علائم هشدار و عوامل موثر بر هزینه.', 'Dental implant guide at Dr. Saeed Moghaddam Dental Clinic: placement steps, healing time, aftercare, warning signs and cost factors.')
    }
  },
  {
    id: 'laminate',
    icon: 'sparkle',
    image: image('photo-1609840114035-3c981b782dfe'),
    accent: '#c9a26a',
    title: text('لمینت سرامیکی', 'Porcelain veneers'),
    subtitle: text('طراحی لبخند ظریف و طبیعی', 'Delicate natural smile design'),
    summary: text('لمینت سرامیکی در کلینیک دندان‌پزشکی دکتر سعید مقدم برای اصلاح رنگ، فرم و تناسب دندان‌های جلو با طراحی طبیعی لبخند بررسی می‌شود.', 'Veneers improve color, shape, size and harmony of front teeth without an overdone look.'),
    longIntro: text(
      'لمینت سرامیکی برای افرادی مناسب است که می‌خواهند رنگ، فرم، اندازه یا هماهنگی دندان‌های جلویی اصلاح شود اما نتیجه مصنوعی و اغراق‌آمیز نباشد. در کلینیک دندان‌پزشکی دکتر سعید مقدم، قبل از لمینت وضعیت پوسیدگی، مینای دندان، سلامت لثه، خط لبخند، فرم لب، رنگ پوست، عادت دندان‌قروچه و نیاز احتمالی به ارتودنسی بررسی می‌شود. انتخاب رنگ و میزان آماده‌سازی باید محافظه‌کارانه و قابل توضیح باشد، چون لمینت درمانی دقیق و معمولاً برگشت‌ناپذیر است.',
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
      text('اصلاح همزمان رنگ، فرم، طول و تناسب دندان‌های جلویی در طراحی لبخند', 'Improves color, shape, length and proportion of front teeth together'),
      text('مقاومت رنگی بالاتر سرامیک نسبت به کامپوزیت در مراقبت درست', 'Higher ceramic shade stability than composite with proper care'),
      text('امکان طراحی طبیعی بر اساس خط لبخند، فرم لب و نمایش لثه', 'Supports natural design based on smile line, lip form and gum display'),
      text('سطح صیقلی و قابل تمیز کردن که به سلامت لثه در حاشیه‌ها کمک می‌کند', 'Smooth cleanable surface that supports gum health around margins')
    ],
    steps: [
      { step: 1, title: text('معاینه زیبایی و سلامت دندان', 'Aesthetic and dental health exam'), description: text('پوسیدگی، ترمیم‌های قبلی، وضعیت لثه، ضخامت مینا، بایت و انتظار زیبایی بیمار بررسی می‌شود.', 'Decay, existing restorations, gum condition, enamel thickness, bite and aesthetic expectations are reviewed.') },
      { step: 2, title: text('طراحی لبخند و انتخاب رنگ', 'Smile design and shade selection'), description: text('رنگ نهایی با رنگ پوست، فرم صورت، خط لبخند و طبیعی بودن دندان‌ها مقایسه می‌شود.', 'Final shade is compared with skin tone, facial form, smile line and natural tooth appearance.') },
      { step: 3, title: text('آماده‌سازی محافظه‌کارانه', 'Conservative preparation'), description: text('در صورت نیاز، مقدار محدودی از مینا برای جاگیری سرامیک آماده می‌شود و قالب یا اسکن تهیه می‌شود.', 'If needed, limited enamel preparation is performed for ceramic fit and an impression or scan is taken.') },
      { step: 4, title: text('ساخت لابراتواری و بررسی تناسب', 'Lab fabrication and fit review'), description: text('لمینت‌ها با فرم و رنگ هماهنگ ساخته و قبل از چسباندن از نظر حاشیه، رنگ و تماس بررسی می‌شوند.', 'Veneers are fabricated with planned form and shade, then checked for margins, color and contacts before bonding.') },
      { step: 5, title: text('باندینگ و کنترل نهایی', 'Bonding and final control'), description: text('نصب با پروتکل چسباندن انجام می‌شود و تماس‌های دندانی، نخ‌پذیری و مراقبت‌های بعدی توضیح داده می‌شود.', 'Bonding follows adhesive protocol, then bite contacts, floss access and aftercare are explained.') }
    ],
    care: [
      text('از گاز زدن اجسام سخت، باز کردن بسته با دندان و شکستن آجیل یا یخ با دندان‌های لمینت‌شده خودداری کنید.', 'Avoid biting hard objects, opening packages with teeth and cracking nuts or ice with veneered teeth.'),
      text('اگر دندان‌قروچه یا فشار فکی دارید، نایت‌گارد طبق تشخیص دندان‌پزشک برای محافظت از سرامیک ضروری است.', 'If you grind or clench, a dentist-prescribed night guard is important to protect the ceramic.'),
      text('مسواک، نخ دندان و تمیز کردن حاشیه لثه باید دقیق انجام شود؛ لمینت جای بهداشت روزانه را نمی‌گیرد.', 'Brush, floss and clean gum margins carefully; veneers do not replace daily hygiene.'),
      text('حساسیت، گیر کردن نخ، شکستگی لبه یا تغییر رنگ حاشیه‌ها باید در معاینه دوره‌ای بررسی شود.', 'Sensitivity, floss catching, edge chipping or margin discoloration should be reviewed during checkups.')
    ],
    faqs: [
      { id: 'laminate-1', question: text('آیا لمینت دندان باعث پوسیدگی می‌شود؟', 'Do veneers cause tooth decay?'), answer: text('خود لمینت باعث پوسیدگی نیست. پوسیدگی زمانی خطرساز می‌شود که حاشیه‌ها درست بسته نشده باشند، بهداشت ضعیف باشد یا پوسیدگی قبلی درمان نشده باقی بماند.', 'Veneers do not cause decay by themselves. Risk rises when margins are poor, hygiene is weak or existing decay is not treated.') },
      { id: 'laminate-2', question: text('برای لمینت دندان چقدر تراش لازم است؟', 'How much preparation is needed for veneers?'), answer: text('میزان آماده‌سازی به فرم دندان، نامرتبی، رنگ پایه و نوع سرامیک بستگی دارد و باید تا حد ممکن در مینا و محافظه‌کارانه انجام شود.', 'Preparation depends on tooth form, alignment, base shade and ceramic type, and should be as conservative as possible within enamel.') },
      { id: 'laminate-3', question: text('آیا رنگ لمینت بعد از نصب تغییر می‌کند؟', 'Can veneer shade change after bonding?'), answer: text('سرامیک باکیفیت رنگ‌پذیری کمی دارد، اما انتخاب رنگ پس از چسباندن به‌سادگی قابل تغییر نیست؛ به همین دلیل انتخاب رنگ قبل از ساخت اهمیت زیادی دارد.', 'Quality ceramic has low staining, but shade is not easily changed after bonding, so pre-fabrication shade selection matters.') },
      { id: 'laminate-4', question: text('لمینت برای دندان‌قروچه مناسب است؟', 'Are veneers suitable for teeth grinding?'), answer: text('دندان‌قروچه کنترل‌نشده خطر لب‌پریدگی یا شکستگی را بالا می‌برد. در این شرایط ابتدا شدت فشار فکی بررسی و معمولاً نایت‌گارد توصیه می‌شود.', 'Uncontrolled grinding increases chipping or fracture risk. Bite force is assessed first and a night guard is often recommended.') }
    ],
    relatedIds: ['composite', 'whitening', 'orthodontics'],
    seo: {
      title: text('لمینت دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Porcelain veneers | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای لمینت دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ طراحی لبخند طبیعی، میزان تراش، انتخاب رنگ، مراقبت و ماندگاری.', 'Porcelain veneer guide at Dr. Saeed Moghaddam Dental Clinic: natural smile design, preparation, shade selection, care and longevity.')
    }
  },
  {
    id: 'composite',
    icon: 'brush',
    image: image('photo-1600170311833-c2cf5280ce49'),
    accent: '#d7a85d',
    title: text('کامپوزیت ونیر', 'Composite veneers'),
    subtitle: text('اصلاح سریع فرم و رنگ دندان', 'Fast shape and color enhancement'),
    summary: text('کامپوزیت ونیر در کلینیک دندان‌پزشکی دکتر سعید مقدم برای اصلاح محافظه‌کارانه لب‌پریدگی، فاصله‌های کوچک و فرم دندان بررسی می‌شود.', 'Composite veneers conservatively improve chips, small gaps, shape issues and unwanted tooth color.'),
    longIntro: text(
      'کامپوزیت ونیر راهکاری مستقیم و کم‌تهاجمی برای اصلاح برخی مشکلات فرم و رنگ دندان است؛ مثل لب‌پریدگی محدود، فاصله کوچک، نامنظمی خفیف یا نیاز به بازسازی ظریف لبه دندان. در کلینیک دندان‌پزشکی دکتر سعید مقدم، پیش از شروع درمان، بایت، سلامت لثه، پوسیدگی، کیفیت مینای دندان، رنگ پایه و عادت‌هایی مثل دندان‌قروچه بررسی می‌شود. کامپوزیت برای همه موارد جایگزین ارتودنسی یا لمینت نیست، اما در کیس مناسب می‌تواند نتیجه طبیعی، قابل ترمیم و محافظه‌کارانه ایجاد کند.',
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
      text('اصلاح فرم و لب‌پریدگی دندان معمولاً با حداقل تراش یا بدون تراش گسترده', 'Corrects shape and chips often with minimal or no extensive preparation'),
      text('قابل ترمیم بودن در صورت لب‌پریدگی محدود یا نیاز به پولیش مجدد', 'Repairable if limited chipping or repolishing is needed'),
      text('امکان اجرای مرحله‌ای و هماهنگ کردن فرم دندان با لبخند طبیعی', 'Can be delivered in stages and shaped to match a natural smile'),
      text('گزینه‌ای محافظه‌کارانه برای بعضی فاصله‌ها و بدفرمی‌های خفیف تا متوسط', 'A conservative option for selected gaps and mild to moderate shape issues')
    ],
    steps: [
      { step: 1, title: text('انتخاب کیس و بررسی بایت', 'Case selection and bite review'), description: text('فشارهای دندانی، دندان‌قروچه، سلامت لثه، پوسیدگی و مقدار اصلاح مورد نیاز بررسی می‌شود.', 'Bite forces, grinding, gum health, decay and the amount of needed correction are reviewed.') },
      { step: 2, title: text('انتخاب رنگ و طراحی فرم', 'Shade selection and form design'), description: text('رنگ کامپوزیت با دندان‌های طبیعی و هدف زیبایی هماهنگ می‌شود تا نتیجه بیش از حد سفید یا مصنوعی نباشد.', 'Composite shade is matched to natural teeth and aesthetic goals so the result is not overly white or artificial.') },
      { step: 3, title: text('آماده‌سازی سطح و لایه‌گذاری', 'Surface preparation and layering'), description: text('سطح دندان آماده و رزین کامپوزیت به صورت لایه‌ای فرم داده می‌شود تا ضخامت و تماس‌ها کنترل شوند.', 'The tooth surface is prepared and composite resin is layered to control thickness and contacts.') },
      { step: 4, title: text('تنظیم بایت و پولیش نهایی', 'Bite adjustment and final polish'), description: text('تماس‌های دندانی، لبه‌ها و سطح کامپوزیت تنظیم و پولیش می‌شود تا تمیز کردن و ماندگاری بهتر شود.', 'Bite contacts, edges and composite surface are adjusted and polished to improve cleaning and longevity.') },
      { step: 5, title: text('برنامه نگهداری و پولیش دوره‌ای', 'Maintenance and periodic polish'), description: text('مراقبت غذایی، بهداشت، زمان پولیش و علائم نیاز به ترمیم به بیمار توضیح داده می‌شود.', 'Diet, hygiene, polishing intervals and signs that need repair are explained.') }
    ],
    care: [
      text('روزانه مسواک نرم و نخ دندان استفاده کنید و از خمیر دندان‌های بسیار ساینده یا سفیدکننده قوی پرهیز کنید.', 'Use a soft toothbrush and floss daily, and avoid highly abrasive or strong whitening toothpastes.'),
      text('مصرف مکرر چای، قهوه، دخانیات و مواد رنگی می‌تواند سطح کامپوزیت را کدر یا رنگ‌پذیر کند.', 'Frequent tea, coffee, smoking and pigments can dull or stain the composite surface.'),
      text('از گاز زدن اجسام سخت، جویدن یخ و فشار دادن لبه‌های کامپوزیت خودداری کنید.', 'Avoid biting hard objects, chewing ice and putting heavy force on composite edges.'),
      text('پولیش دوره‌ای هر چند ماه تا یک سال، بسته به شرایط دهان، به حفظ درخشندگی و تشخیص لب‌پریدگی کمک می‌کند.', 'Periodic polishing every few months to a year, depending on oral condition, helps maintain shine and detect chips.')
    ],
    faqs: [
      { id: 'composite-1', question: text('کامپوزیت دندان چند سال دوام دارد؟', 'How long do composite veneers last?'), answer: text('ماندگاری عدد ثابت ندارد و به کیفیت اجرا، بهداشت، رژیم غذایی، دندان‌قروچه، فشارهای جویدن و پولیش دوره‌ای وابسته است.', 'Longevity is not fixed and depends on execution quality, hygiene, diet, grinding, bite forces and maintenance polishing.') },
      { id: 'composite-2', question: text('چرا کامپوزیت زرد یا کدر می‌شود؟', 'Why does composite stain or become dull?'), answer: text('تجمع پلاک، مصرف زیاد چای و قهوه، دخانیات، خمیر دندان ساینده و از بین رفتن پولیش سطحی می‌تواند باعث تغییر ظاهر شود؛ گاهی با پولیش تخصصی بهتر می‌شود.', 'Plaque, heavy tea and coffee, smoking, abrasive toothpaste and surface polish loss can change appearance; professional polishing may improve it.') },
      { id: 'composite-3', question: text('اگر کامپوزیت لب‌پر شود باید کامل تعویض شود؟', 'Does chipped composite need full replacement?'), answer: text('در بسیاری از موارد لب‌پریدگی محدود قابل ترمیم است، اما علت آن مثل بایت بلند یا دندان‌قروچه باید بررسی شود تا تکرار نشود.', 'Limited chips are often repairable, but the cause such as high bite or grinding should be checked to prevent recurrence.') },
      { id: 'composite-4', question: text('کامپوزیت بهتر است یا لمینت سرامیکی؟', 'Is composite better than porcelain veneers?'), answer: text('پاسخ به وضعیت دندان، هدف زیبایی، بودجه، میزان تغییر رنگ، بایت و انتظار ماندگاری بستگی دارد. در معاینه مشخص می‌شود کدام انتخاب منطقی‌تر است.', 'The answer depends on tooth condition, aesthetic goals, budget, discoloration, bite and longevity expectations. Examination defines the more logical option.') }
    ],
    relatedIds: ['laminate', 'whitening', 'orthodontics'],
    seo: {
      title: text('کامپوزیت دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Composite veneers | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای کامپوزیت دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ مزایا، مراحل، مراقبت، زرد شدن، ترمیم لب‌پریدگی و محدودیت‌ها.', 'Composite veneer guide at Dr. Saeed Moghaddam Dental Clinic: benefits, steps, care, staining, chip repair and limitations.')
    }
  },
  {
    id: 'orthodontics',
    icon: 'align',
    image: image('photo-1609840114035-3c981b782dfe'),
    accent: '#9f8565',
    title: text('ارتودنسی و نظم لبخند', 'Orthodontics and smile alignment'),
    subtitle: text('مرتب‌سازی دندان‌ها با برنامه مرحله‌ای', 'Step-by-step teeth alignment'),
    summary: text('ارتودنسی در کلینیک دندان‌پزشکی دکتر سعید مقدم برای مرتب‌سازی دندان‌ها، بهبود تماس‌های فکی و حفظ نتیجه با نگهدارنده بررسی می‌شود.', 'Orthodontics improves tooth alignment, bite contacts, easier cleaning and smile appearance.'),
    longIntro: text(
      'نامرتبی دندان‌ها فقط مسئله زیبایی نیست؛ تمیز کردن دندان‌ها سخت‌تر می‌شود، فشار جویدن می‌تواند روی بعضی دندان‌ها بیشتر شود و ریسک پوسیدگی یا التهاب لثه بالا برود. در کلینیک دندان‌پزشکی دکتر سعید مقدم، پیش از ارتودنسی شدت نامرتبی، روابط فکی، سلامت لثه، پوسیدگی‌های درمان‌نشده، سن، همکاری بیمار و هدف زیبایی بررسی می‌شود. درمان می‌تواند با روش ثابت، متحرک یا پلاک شفاف مطرح شود و بخش مهم آن نگهدارنده بعد از پایان درمان است.',
      'Crowded or misaligned teeth affect more than appearance; cleaning becomes harder, some teeth take more pressure and decay or gum inflammation risks increase. Orthodontic planning reviews crowding severity, jaw relationships, age, gum health and aesthetic goals before explaining the best method and stages.'
    ),
    duration: text('معمولاً چند ماه تا بیش از یک سال، بسته به شدت نامرتبی، نوع روش و همکاری بیمار', 'From several months to more than a year depending on complexity, method and patient cooperation'),
    cost: text('وابسته به نوع درمان، مدت و نیازهای جانبی', 'Depends on treatment type, duration and supporting needs'),
    idealFor: [
      text('نامرتبی، فاصله یا چرخش دندان‌ها', 'Crowding, gaps or rotated teeth'),
      text('مشکلات تماس دندان‌ها', 'Bite contact issues'),
      text('افراد آماده همکاری و مراجعات منظم', 'Patients ready for cooperation and regular visits')
    ],
    benefits: [
      text('مرتب‌تر شدن دندان‌ها و ساده‌تر شدن مسواک و نخ دندان در نواحی شلوغ', 'Better alignment and easier brushing and flossing in crowded areas'),
      text('بهبود تماس‌های دندانی و کاهش فشارهای نامتعادل روی بعضی دندان‌ها', 'Improves bite contacts and reduces uneven pressure on selected teeth'),
      text('کمک به طراحی دقیق‌تر لمینت، کامپوزیت یا درمان‌های ترمیمی بعدی', 'Supports more precise veneer, composite or restorative planning later'),
      text('حفظ نتیجه با نگهدارنده و پیگیری منظم پس از پایان درمان', 'Maintains results with retainers and regular post-treatment follow-up')
    ],
    steps: [
      { step: 1, title: text('تشخیص و عکس‌های ارتودنسی', 'Diagnosis and orthodontic records'), description: text('عکس، قالب یا اسکن، روابط فکی، سلامت لثه و پوسیدگی‌های احتمالی برای شروع ایمن بررسی می‌شود.', 'Images, impressions or scans, jaw relationships, gum health and possible decay are reviewed for safe start.') },
      { step: 2, title: text('انتخاب روش و توضیح محدودیت‌ها', 'Method selection and limits'), description: text('ثابت، متحرک یا شفاف بودن درمان، نیاز به کشیدن دندان یا درمان‌های جانبی و نقش همکاری بیمار مشخص می‌شود.', 'Fixed, removable or clear treatment, extraction or supporting needs and the role of cooperation are defined.') },
      { step: 3, title: text('نصب دستگاه یا تحویل پلاک', 'Appliance placement or aligner delivery'), description: text('براکت‌ها یا پلاک‌ها آماده می‌شوند و روش تمیز کردن، تغذیه و کنترل درد اولیه آموزش داده می‌شود.', 'Braces or aligners are prepared and cleaning, diet and early discomfort control are explained.') },
      { step: 4, title: text('تنظیم‌های دوره‌ای و پایش حرکت', 'Periodic adjustment and movement tracking'), description: text('حرکت دندان‌ها در جلسات منظم کنترل می‌شود و در صورت نیاز نیروها یا پلاک‌ها اصلاح می‌شوند.', 'Tooth movement is checked at regular visits and forces or aligners are adjusted if needed.') },
      { step: 5, title: text('نگهدارنده و تثبیت نتیجه', 'Retention and stability'), description: text('پس از پایان حرکت دندان‌ها، نگهدارنده برای کاهش احتمال برگشت نتیجه طبق دستور استفاده می‌شود.', 'After tooth movement ends, retainers are used as instructed to reduce relapse risk.') }
    ],
    care: [
      text('اطراف براکت، سیم یا پلاک شفاف را با مسواک، نخ مخصوص یا ابزار بین‌دندانی دقیق تمیز کنید.', 'Clean around brackets, wires or clear aligners carefully with toothbrush, special floss or interdental tools.'),
      text('غذاهای سفت و چسبنده می‌تواند باعث شکستگی براکت یا تغییر شکل سیم شود و روند درمان را عقب بیندازد.', 'Hard and sticky foods can break brackets or distort wires and delay treatment.'),
      text('جلسات تنظیم و کنترل را منظم انجام دهید؛ فاصله طولانی بین مراجعات کیفیت حرکت دندان را کم می‌کند.', 'Attend adjustment and review visits regularly; long gaps reduce tooth-movement quality.'),
      text('پس از پایان درمان، نگهدارنده را طبق دستور استفاده کنید چون برگشت دندان‌ها بدون ریتینر ممکن است.', 'Use retainers as instructed after treatment because relapse can happen without retention.')
    ],
    faqs: [
      { id: 'ortho-1', question: text('آیا ارتودنسی برای بزرگسالان هم انجام می‌شود؟', 'Can adults have orthodontic treatment?'), answer: text('بله، در صورت سلامت لثه، کنترل پوسیدگی‌ها و شرایط مناسب استخوان و دندان، بزرگسالان هم می‌توانند ارتودنسی انجام دهند.', 'Yes. Adults can have orthodontics when gum health, decay control and tooth-bone conditions are suitable.') },
      { id: 'ortho-2', question: text('ارتودنسی چقدر طول می‌کشد؟', 'How long does orthodontics take?'), answer: text('مدت درمان به شدت نامرتبی، نوع روش، سن، سلامت لثه و همکاری بیمار بستگی دارد و پس از معاینه دقیق‌تر توضیح داده می‌شود.', 'Duration depends on complexity, method, age, gum health and cooperation, and is explained more accurately after examination.') },
      { id: 'ortho-3', question: text('آیا ارتودنسی درد دارد؟', 'Is orthodontics painful?'), answer: text('در روزهای اول یا بعد از تنظیم‌ها احساس فشار و حساسیت طبیعی است و معمولاً با توصیه‌های ساده کنترل می‌شود؛ درد شدید یا زخم ماندگار باید بررسی شود.', 'Pressure and soreness in the first days or after adjustments are common and usually manageable; severe pain or persistent ulcers need review.') },
      { id: 'ortho-4', question: text('آیا دندان‌ها بعد از ارتودنسی برمی‌گردند؟', 'Can teeth shift back after orthodontics?'), answer: text('بله، اگر نگهدارنده طبق دستور استفاده نشود، برگشت بخشی از نتیجه ممکن است. ریتینر و پیگیری دوره‌ای بخش اصلی درمان است.', 'Yes. If retainers are not used as instructed, some relapse can occur. Retention and follow-up are an essential part of treatment.') }
    ],
    relatedIds: ['laminate', 'composite', 'pediatric'],
    seo: {
      title: text('ارتودنسی دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Orthodontics | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای ارتودنسی در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ مدت درمان، مراحل، مراقبت، درد اولیه و نقش نگهدارنده پس از درمان.', 'Orthodontic guide at Dr. Saeed Moghaddam Dental Clinic: duration, steps, care, early discomfort and retention.')
    }
  },
  {
    id: 'whitening',
    icon: 'sun',
    image: image('photo-1588776814546-1ffcf47267a5'),
    accent: '#c6a15b',
    title: text('سفید کردن دندان', 'Teeth whitening'),
    subtitle: text('روشن‌تر شدن کنترل‌شده لبخند', 'Controlled smile brightening'),
    summary: text('سفید کردن دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم با ارزیابی پوسیدگی، ترمیم‌ها و حساسیت انجام می‌شود تا روشن شدن رنگ کنترل‌شده باشد.', 'Professional whitening brightens teeth by several shades using a safer sensitivity-controlled protocol.'),
    longIntro: text(
      'سفید کردن دندان یا بلیچینگ برای روشن‌تر کردن رنگ دندان طبیعی استفاده می‌شود، نه برای تغییر رنگ روکش، لمینت یا کامپوزیت. در کلینیک دندان‌پزشکی دکتر سعید مقدم، پیش از بلیچینگ پوسیدگی، ترک دندان، حساسیت قبلی، التهاب لثه، جرم و رنگ ترمیم‌های قدیمی بررسی می‌شود. نتیجه درمان به جنس دندان، رنگ پایه، رژیم غذایی، مصرف دخانیات و مراقبت بعد از درمان وابسته است؛ بنابراین وعده سفید شدن غیرواقعی داده نمی‌شود و هدف روشن‌تر شدن ایمن و قابل کنترل است.',
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
      text('روشن‌تر شدن رنگ دندان طبیعی بدون تراش یا اضافه کردن ماده روی دندان', 'Brightens natural tooth shade without preparation or adding material'),
      text('بررسی پوسیدگی و حساسیت پیش از شروع برای کاهش عوارض قابل پیشگیری', 'Pre-treatment decay and sensitivity checks reduce preventable side effects'),
      text('کمک به انتخاب رنگ دقیق‌تر قبل از لمینت، کامپوزیت یا ترمیم‌های زیبایی', 'Helps with shade planning before veneers, composite or aesthetic restorations'),
      text('امکان برنامه‌ریزی نگهداری نتیجه با توصیه غذایی و بهداشتی متناسب با بیمار', 'Supports result maintenance with diet and hygiene guidance matched to the patient')
    ],
    steps: [
      { step: 1, title: text('ثبت رنگ پایه و معاینه', 'Baseline shade and exam'), description: text('رنگ فعلی دندان، پوسیدگی، ترک، حساسیت، ترمیم‌های قدیمی و التهاب لثه بررسی می‌شود.', 'Current shade, decay, cracks, sensitivity, old restorations and gum inflammation are checked.') },
      { step: 2, title: text('آماده‌سازی دهان', 'Oral preparation'), description: text('در صورت نیاز جرم‌گیری، اصلاح التهاب یا درمان پوسیدگی قبل از بلیچینگ انجام می‌شود.', 'Cleaning, gum care or decay treatment is completed before whitening if needed.') },
      { step: 3, title: text('محافظت لثه و اجرای کنترل‌شده', 'Gum protection and controlled whitening'), description: text('لثه محافظت می‌شود و ماده سفیدکننده با زمان و غلظت مناسب تحت کنترل استفاده می‌شود.', 'Gums are protected and whitening material is used with controlled timing and concentration.') },
      { step: 4, title: text('کنترل حساسیت و نتیجه', 'Sensitivity and result review'), description: text('حساسیت احتمالی، میزان روشن شدن و تفاوت رنگ با ترمیم‌های موجود بررسی می‌شود.', 'Possible sensitivity, brightness change and shade differences with existing restorations are reviewed.') },
      { step: 5, title: text('برنامه نگهداری رنگ', 'Shade maintenance plan'), description: text('توصیه‌های غذایی، بهداشتی و زمان مناسب تکرار درمان بر اساس شرایط بیمار توضیح داده می‌شود.', 'Diet, hygiene and suitable retreatment timing are explained based on the patient condition.') }
    ],
    care: [
      text('در روزهای اول مصرف چای، قهوه، نوشابه رنگی، دخانیات و غذاهای پررنگ را محدود کنید.', 'In the first days, limit tea, coffee, colored soda, smoking and strong pigments.'),
      text('حساسیت گذرا ممکن است رخ دهد؛ خمیر دندان ضدحساسیت یا توصیه دارویی فقط طبق نظر دندان‌پزشک استفاده شود.', 'Temporary sensitivity can occur; use desensitizing toothpaste or medication only as advised by the dentist.'),
      text('بلیچینگ رنگ روکش، لمینت، کامپوزیت یا پرکردگی را روشن نمی‌کند و ممکن است بعداً تعویض ترمیم لازم شود.', 'Whitening does not lighten crowns, veneers, composite or fillings, and restoration replacement may be needed later.'),
      text('تکرار بی‌رویه بلیچینگ یا محصولات خانگی نامطمئن می‌تواند به لثه و حساسیت دندان آسیب بزند.', 'Excessive whitening or unsafe home products can harm gums and increase tooth sensitivity.')
    ],
    faqs: [
      { id: 'white-1', question: text('آیا بلیچینگ به مینای دندان آسیب می‌زند؟', 'Does whitening damage enamel?'), answer: text('بلیچینگ استاندارد تحت نظر دندان‌پزشک معمولاً به مینای سالم آسیب نمی‌زند؛ استفاده خودسرانه، غلظت نامناسب یا تکرار زیاد می‌تواند خطر حساسیت و آسیب لثه را بالا ببرد.', 'Professional whitening under dental supervision usually does not damage healthy enamel; unsafe products, wrong concentration or overuse can increase sensitivity and gum risk.') },
      { id: 'white-2', question: text('ماندگاری سفید کردن دندان چقدر است؟', 'How long does whitening last?'), answer: text('ماندگاری به رنگ پایه دندان، مصرف چای و قهوه، دخانیات، بهداشت و رژیم غذایی بستگی دارد و برای هر فرد متفاوت است.', 'Longevity depends on baseline shade, tea and coffee, smoking, hygiene and diet, and varies by person.') },
      { id: 'white-3', question: text('آیا بلیچینگ رنگ کامپوزیت یا روکش را روشن می‌کند؟', 'Does whitening lighten composite or crowns?'), answer: text('خیر. مواد بلیچینگ فقط روی ساختار دندان طبیعی اثر دارند و رنگ ترمیم‌ها، روکش‌ها، لمینت یا کامپوزیت را تغییر نمی‌دهند.', 'No. Whitening materials affect natural tooth structure, not fillings, crowns, veneers or composite.') },
      { id: 'white-4', question: text('حساسیت بعد از بلیچینگ طبیعی است؟', 'Is sensitivity after whitening normal?'), answer: text('حساسیت موقت در برخی افراد طبیعی است و معمولاً کاهش می‌یابد. اگر درد شدید، سوختگی لثه یا حساسیت طولانی داشتید باید بررسی شوید.', 'Temporary sensitivity can be normal and usually decreases. Severe pain, gum burns or prolonged sensitivity should be checked.') }
    ],
    relatedIds: ['laminate', 'composite', 'gum-treatment'],
    seo: {
      title: text('سفید کردن دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Teeth whitening | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای بلیچینگ و سفید کردن دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ ایمنی مینا، حساسیت، ماندگاری و مراقبت بعد درمان.', 'Teeth whitening guide at Dr. Saeed Moghaddam Dental Clinic: enamel safety, sensitivity, longevity and aftercare.')
    }
  },
  {
    id: 'root-canal',
    icon: 'shield',
    image: image('photo-1606811971618-4486d14f3f99'),
    accent: '#b96f52',
    title: text('درمان ریشه', 'Root canal therapy'),
    subtitle: text('حفظ دندان طبیعی و کنترل درد', 'Saving the natural tooth and controlling pain'),
    summary: text('درمان ریشه در کلینیک دندان‌پزشکی دکتر سعید مقدم برای پاک‌سازی عفونت داخل دندان، کنترل درد و حفظ دندان طبیعی انجام می‌شود.', 'Root canal therapy cleans infection inside the tooth, reduces pain and helps avoid extraction.'),
    longIntro: text(
      'وقتی پالپ یا عصب داخل دندان به دلیل پوسیدگی عمیق، ترک، ضربه یا ترمیم قدیمی دچار التهاب یا عفونت شود، درد شبانه، حساسیت طولانی به سرما و گرما، تورم یا آبسه ممکن است ایجاد شود. در کلینیک دندان‌پزشکی دکتر سعید مقدم، درمان ریشه با تشخیص دقیق، عکس، پاک‌سازی کانال‌ها، ضدعفونی و پر کردن فضای داخلی انجام می‌شود تا دندان طبیعی تا حد امکان حفظ شود. بخش مهم درمان، ترمیم نهایی یا روکش مناسب است چون دندان عصب‌کشی‌شده بدون بازسازی مقاوم در معرض شکستگی قرار می‌گیرد.',
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
      text('حفظ دندان طبیعی به جای کشیدن، در صورتی که ساختار دندان قابل نگهداری باشد', 'Saves the natural tooth instead of extraction when tooth structure is restorable'),
      text('کاهش درد و کنترل عفونت داخل کانال‌های ریشه با پاک‌سازی و ضدعفونی', 'Reduces pain and controls infection inside root canals through cleaning and disinfection'),
      text('حفظ تماس‌های دندانی و جلوگیری از خالی ماندن فضای دندان کشیده‌شده', 'Preserves bite contacts and prevents an extraction gap from remaining'),
      text('آماده‌سازی دندان برای ترمیم یا روکش مقاوم و برگشت عملکرد جویدن', 'Prepares the tooth for a strong restoration or crown and functional chewing')
    ],
    steps: [
      { step: 1, title: text('تشخیص منبع درد', 'Pain source diagnosis'), description: text('شرح حال، تست‌های دندانی، بررسی لثه و عکس رادیوگرافی برای تشخیص دندان درگیر انجام می‌شود.', 'History, tooth tests, gum review and radiographs are used to identify the involved tooth.') },
      { step: 2, title: text('بی‌حسی و دسترسی به کانال‌ها', 'Anesthesia and canal access'), description: text('پس از بی‌حسی، پوسیدگی یا ترمیم معیوب برداشته و مسیر ورود به کانال‌های ریشه آماده می‌شود.', 'After anesthesia, decay or failed restoration is removed and access to root canals is prepared.') },
      { step: 3, title: text('پاک‌سازی، شکل‌دهی و ضدعفونی', 'Cleaning, shaping and disinfection'), description: text('کانال‌ها با ابزار و محلول‌های مناسب پاک‌سازی و شکل‌دهی می‌شوند تا بار میکروبی کاهش یابد.', 'Canals are cleaned, shaped and disinfected with suitable instruments and irrigants to reduce microbial load.') },
      { step: 4, title: text('پر کردن کانال ریشه', 'Root canal filling'), description: text('پس از کنترل علائم و خشک بودن کانال‌ها، فضای داخلی ریشه با ماده استاندارد پر و سیل می‌شود.', 'After symptom control and dry canals, the canal space is filled and sealed with standard material.') },
      { step: 5, title: text('ترمیم نهایی یا روکش', 'Final restoration or crown'), description: text('برای جلوگیری از نشت میکروبی و شکستگی، ترمیم مقاوم یا روکش بر اساس مقدار بافت باقی‌مانده برنامه‌ریزی می‌شود.', 'To prevent leakage and fracture, a strong restoration or crown is planned based on remaining tooth structure.') }
    ],
    care: [
      text('تا قبل از ترمیم نهایی یا روکش، با دندان درمان‌شده غذای سفت نجوید چون احتمال شکستگی وجود دارد.', 'Avoid chewing hard food on the treated tooth before final restoration or crown because fracture risk exists.'),
      text('درد خفیف چند روز اول می‌تواند طبیعی باشد، اما درد شدید، تورم، تب یا ترشح باید سریع اطلاع داده شود.', 'Mild soreness for a few days can be normal, but severe pain, swelling, fever or discharge should be reported quickly.'),
      text('اگر هنگام جویدن احساس بلندی یا ضربه روی دندان دارید، تنظیم ترمیم یا روکش باید بررسی شود.', 'If the tooth feels high or painful on chewing, restoration or crown adjustment should be checked.'),
      text('ترمیم نهایی را عقب نیندازید؛ نشت میکروبی یا شکستگی می‌تواند نتیجه درمان ریشه را تهدید کند.', 'Do not delay final restoration; microbial leakage or fracture can compromise root canal therapy.')
    ],
    faqs: [
      { id: 'root-1', question: text('آیا عصب‌کشی درد دارد؟', 'Is root canal therapy painful?'), answer: text('با بی‌حسی مناسب، درد حین درمان کنترل می‌شود. درد یا حساسیت بعد از درمان بیشتر به التهاب اطراف ریشه مربوط است و معمولاً کاهش می‌یابد.', 'With proper anesthesia, treatment pain is controlled. Post-treatment soreness is often related to inflammation around the root and usually decreases.') },
      { id: 'root-2', question: text('درد بعد از درمان ریشه چند روز طبیعی است؟', 'How long is pain after root canal normal?'), answer: text('حساسیت خفیف تا چند روز می‌تواند طبیعی باشد. درد شدید، درد رو به افزایش، تورم، تب یا ترشح نشانه نیاز به بررسی است.', 'Mild soreness for a few days can be normal. Severe or increasing pain, swelling, fever or discharge needs review.') },
      { id: 'root-3', question: text('آیا بعد از عصب‌کشی حتماً روکش لازم است؟', 'Is a crown always needed after root canal?'), answer: text('همیشه نه؛ اما دندان‌های عقب، دندان با تخریب زیاد یا دیواره‌های ضعیف معمولاً برای جلوگیری از شکستگی به روکش یا ترمیم مقاوم نیاز دارند.', 'Not always; back teeth, heavily damaged teeth or weak walls often need a crown or strong restoration to prevent fracture.') },
      { id: 'root-4', question: text('چرا دندان عصب‌کشی‌شده دوباره درد می‌گیرد؟', 'Why can a root-treated tooth hurt again?'), answer: text('بلند بودن ترمیم یا روکش، ترک دندان، عفونت باقی‌مانده یا نشت ترمیم می‌تواند علت باشد و با معاینه و عکس باید مشخص شود.', 'High restoration or crown, tooth crack, remaining infection or restoration leakage can be causes and need exam and imaging.') }
    ],
    relatedIds: ['implant', 'gum-treatment', 'whitening'],
    seo: {
      title: text('درمان ریشه دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Root canal therapy | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای درمان ریشه و عصب‌کشی در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ علائم، مراحل، درد بعد درمان، روکش و مراقبت.', 'Root canal guide at Dr. Saeed Moghaddam Dental Clinic: signs, steps, post-treatment pain, crown and care.')
    }
  },
  {
    id: 'pediatric',
    icon: 'heart',
    image: image('photo-1629909613654-28e377c37b09'),
    accent: '#c58d73',
    title: text('دندان‌پزشکی کودکان', 'Pediatric dentistry'),
    subtitle: text('تجربه آرام برای کودک و والدین', 'A calm experience for children and parents'),
    summary: text('دندان‌پزشکی کودکان در کلینیک دندان‌پزشکی دکتر سعید مقدم با تمرکز بر پیشگیری، درمان پوسیدگی و تجربه آرام کودک انجام می‌شود.', 'Children receive preventive and restorative care with simple communication, anxiety control and parent education.'),
    longIntro: text(
      'اولین تجربه‌های دندان‌پزشکی می‌تواند نگاه کودک به درمان را برای سال‌ها شکل دهد. در کلینیک دندان‌پزشکی دکتر سعید مقدم، معاینه کودک، آموزش مسواک و تغذیه، فلورایدتراپی، فیشورسیلانت، درمان پوسیدگی دندان شیری و پیگیری رشد دندان‌ها با زبان ساده و محیط آرام انجام می‌شود. والدین هم درباره اهمیت دندان شیری، زمان اولین مراجعه، مقدار مناسب خمیر دندان فلورایددار، عادت‌های دهانی و علائم درد یا عفونت راهنمایی می‌شوند.',
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
      text('ایجاد تجربه آرام و قابل فهم برای کودک به جای شروع درمان در شرایط درد و اضطراب', 'Creates a calm, understandable experience instead of starting care during pain and anxiety'),
      text('پیشگیری از پوسیدگی با آموزش والدین، فلورایدتراپی و فیشورسیلانت در موارد مناسب', 'Prevents decay with parent education, fluoride and sealants when suitable'),
      text('حفظ دندان‌های شیری برای جویدن، تکلم و نگهداری فضا تا رویش دندان دائمی', 'Preserves baby teeth for chewing, speech and space maintenance until permanent teeth erupt'),
      text('تشخیص زودهنگام عادت‌های دهانی، پوسیدگی‌های پنهان و نیاز احتمالی به پیگیری ارتودنسی', 'Early detection of oral habits, hidden cavities and possible orthodontic follow-up needs')
    ],
    steps: [
      { step: 1, title: text('آشنایی کودک و گرفتن شرح حال', 'Child introduction and history'), description: text('کودک با محیط آشنا می‌شود و والدین درباره درد، تغذیه، بهداشت، داروها و تجربه‌های قبلی توضیح می‌دهند.', 'The child becomes familiar with the environment and parents explain pain, diet, hygiene, medications and previous experiences.') },
      { step: 2, title: text('معاینه و ارزیابی ریسک پوسیدگی', 'Exam and decay-risk assessment'), description: text('دندان‌های شیری و دائمی، لثه، بهداشت، عادت‌ها و نیاز احتمالی به عکس بررسی می‌شود.', 'Baby and permanent teeth, gums, hygiene, habits and possible imaging needs are reviewed.') },
      { step: 3, title: text('آموزش به والدین و کودک', 'Parent and child education'), description: text('روش مسواک، مقدار خمیر دندان فلورایددار، کنترل خوراکی شیرین و زمان مراجعات توضیح داده می‌شود.', 'Brushing method, fluoride toothpaste amount, sugar control and visit timing are explained.') },
      { step: 4, title: text('پیشگیری یا درمان محافظه‌کارانه', 'Prevention or conservative care'), description: text('فلورایدتراپی، فیشورسیلانت یا درمان پوسیدگی بر اساس سن، همکاری کودک و شدت مشکل انجام می‌شود.', 'Fluoride, sealants or cavity care are completed based on age, cooperation and severity.') },
      { step: 5, title: text('پیگیری دوره‌ای', 'Periodic follow-up'), description: text('فاصله مراجعات با توجه به ریسک پوسیدگی، سن کودک و نیاز به آموزش دوباره تعیین می‌شود.', 'Follow-up interval is set by decay risk, child age and need for repeated education.') }
    ],
    care: [
      text('مسواک کودک باید با نظارت والدین انجام شود؛ مقدار خمیر دندان فلورایددار برای سن کودک طبق توصیه دندان‌پزشک باشد.', 'Children should brush under parent supervision; fluoride toothpaste amount should match dental advice for age.'),
      text('مصرف خوراکی شیرین، نوشیدنی شیرین و میان‌وعده‌های چسبنده را زمان‌بندی و محدود کنید.', 'Schedule and limit sugary foods, sweet drinks and sticky snacks.'),
      text('درد، تورم، آبسه یا تغییر رنگ دندان شیری را جدی بگیرید چون می‌تواند روی تغذیه و دندان دائمی اثر بگذارد.', 'Take pain, swelling, abscess or discoloration of baby teeth seriously because it can affect eating and permanent teeth.'),
      text('معاینه دوره‌ای حتی بدون درد، فرصت پیشگیری با فلوراید، سیلانت و آموزش دوباره را فراهم می‌کند.', 'Periodic exams even without pain allow prevention with fluoride, sealants and repeated education.')
    ],
    faqs: [
      { id: 'kid-1', question: text('اولین مراجعه کودک به دندان‌پزشکی چه زمانی باشد؟', 'When should the first child dental visit happen?'), answer: text('بهتر است اولین مراجعه حداکثر تا یک‌سالگی یا نزدیک زمان رویش اولین دندان انجام شود تا پیشگیری، تغذیه و روش بهداشت زودتر آموزش داده شود.', 'The first visit is best by age one or around first-tooth eruption so prevention, diet and hygiene can be taught early.') },
      { id: 'kid-2', question: text('آیا دندان شیری هم باید درمان شود؟', 'Do baby teeth need treatment?'), answer: text('بله. دندان شیری در جویدن، تکلم، رشد فک و حفظ فضا برای دندان دائمی نقش دارد و عفونت آن می‌تواند برای کودک درد و مشکل ایجاد کند.', 'Yes. Baby teeth support chewing, speech, jaw growth and space for permanent teeth, and infection can cause pain and problems.') },
      { id: 'kid-3', question: text('فلورایدتراپی کودکان از چه سنی لازم است؟', 'When is fluoride recommended for children?'), answer: text('زمان و فاصله فلورایدتراپی به سن، ریسک پوسیدگی، تغذیه و بهداشت کودک بستگی دارد و در معاینه مشخص می‌شود.', 'Fluoride timing and interval depend on age, decay risk, diet and hygiene, and are defined during examination.') },
      { id: 'kid-4', question: text('فیشورسیلانت برای کدام دندان کودک انجام می‌شود؟', 'Which teeth may need sealants?'), answer: text('فیشورسیلانت معمولاً برای شیارهای عمیق دندان‌های آسیای دائمی تازه رویش‌یافته و گاهی با تشخیص دندان‌پزشک برای دندان‌های شیری پرخطر استفاده می‌شود.', 'Sealants are usually used on deep grooves of newly erupted permanent molars and sometimes on high-risk baby teeth when indicated.') }
    ],
    relatedIds: ['orthodontics', 'root-canal', 'gum-treatment'],
    seo: {
      title: text('دندان‌پزشکی کودکان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Pediatric dentistry | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای دندان‌پزشکی کودکان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ اولین مراجعه، دندان شیری، فلوراید، فیشورسیلانت و پیشگیری.', 'Pediatric dentistry guide at Dr. Saeed Moghaddam Dental Clinic: first visit, baby teeth, fluoride, sealants and prevention.')
    }
  },
  {
    id: 'gum-treatment',
    icon: 'leaf',
    image: image('photo-1629909615184-74f495363b67'),
    accent: '#8f9d74',
    title: text('درمان لثه', 'Gum treatment'),
    subtitle: text('کنترل التهاب، خونریزی و بوی دهان', 'Managing inflammation, bleeding and breath concerns'),
    summary: text('درمان لثه در کلینیک دندان‌پزشکی دکتر سعید مقدم برای کنترل خونریزی، التهاب، جرم زیر لثه و حفظ پایه سالم دندان‌ها انجام می‌شود.', 'Gum health is the foundation for long-lasting cosmetic work, implants and natural teeth.'),
    longIntro: text(
      'خونریزی هنگام مسواک یا نخ دندان، بوی بد دهان، التهاب، تحلیل لثه، حساسیت ریشه یا لق شدن دندان‌ها نشانه‌هایی هستند که نباید نادیده گرفته شوند. در کلینیک دندان‌پزشکی دکتر سعید مقدم، درمان لثه با اندازه‌گیری وضعیت لثه، بررسی جرم و پلاک، آموزش بهداشت، جرم‌گیری و در صورت نیاز پاک‌سازی عمیق یا ارجاع تخصصی برنامه‌ریزی می‌شود. سلامت لثه پایه ماندگاری دندان طبیعی، ایمپلنت، لمینت، کامپوزیت و ترمیم‌های ساده است.',
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
      text('کاهش التهاب، خونریزی و بوی بد دهان با کنترل پلاک و جرم زیر لثه', 'Reduces inflammation, bleeding and bad breath by controlling plaque and deep calculus'),
      text('کمک به حفظ استخوان و بافت نگهدارنده دندان در مراحل قابل کنترل', 'Helps preserve bone and tooth-supporting tissue in controllable stages'),
      text('افزایش پیش‌بینی‌پذیری درمان‌های ایمپلنت، لمینت، کامپوزیت و ترمیم', 'Improves predictability of implants, veneers, composite and restorative care'),
      text('آموزش ابزار مناسب خانگی برای جلوگیری از برگشت التهاب لثه', 'Teaches suitable home tools to reduce gum inflammation recurrence')
    ],
    steps: [
      { step: 1, title: text('معاینه لثه و اندازه‌گیری پاکت', 'Gum exam and pocket measurement'), description: text('خونریزی، عمق پاکت، تحلیل لثه، جرم، لق شدن دندان و نیاز به عکس بررسی می‌شود.', 'Bleeding, pocket depth, recession, calculus, tooth mobility and imaging needs are reviewed.') },
      { step: 2, title: text('تشخیص شدت التهاب یا بیماری لثه', 'Inflammation or gum disease staging'), description: text('مشخص می‌شود مشکل در حد التهاب سطحی است یا به درمان عمیق‌تر و پیگیری جدی‌تر نیاز دارد.', 'It is defined whether the problem is superficial inflammation or needs deeper treatment and closer follow-up.') },
      { step: 3, title: text('آموزش بهداشت و ابزار خانگی', 'Hygiene coaching and home tools'), description: text('مسواک، نخ، برس بین‌دندانی یا دهان‌شویه مناسب بر اساس فرم دندان و لثه آموزش داده می‌شود.', 'Toothbrush, floss, interdental brush or mouthwash guidance is matched to tooth and gum form.') },
      { step: 4, title: text('جرم‌گیری یا پاک‌سازی عمیق', 'Scaling or deep cleaning'), description: text('پلاک و جرم بالا و زیر لثه با روش مناسب حذف می‌شود تا التهاب کنترل شود.', 'Plaque and calculus above and below the gumline are removed with the suitable method to control inflammation.') },
      { step: 5, title: text('ارزیابی مجدد و نگهداری', 'Re-evaluation and maintenance'), description: text('پاسخ لثه بررسی و فاصله مراجعات نگهدارنده با توجه به ریسک بیمار تعیین می‌شود.', 'Gum response is reviewed and maintenance intervals are set based on patient risk.') }
    ],
    care: [
      text('نخ دندان یا برس بین‌دندانی را روزانه و با روش درست استفاده کنید؛ خونریزی اولیه دلیل قطع بهداشت نیست.', 'Use floss or interdental brushes daily with proper technique; initial bleeding is not a reason to stop cleaning.'),
      text('مسواک نرم، فشار کنترل‌شده و تمیز کردن خط لثه برای کاهش پلاک ضروری است.', 'A soft toothbrush, controlled pressure and gumline cleaning are essential for plaque reduction.'),
      text('سیگار و قلیان روند بهبود لثه را مختل می‌کند و احتمال عود التهاب را بالا می‌برد.', 'Smoking compromises gum healing and increases inflammation recurrence risk.'),
      text('مراجعات نگهدارنده را حتی بدون درد انجام دهید، چون بیماری لثه همیشه با درد واضح همراه نیست.', 'Attend maintenance visits even without pain because gum disease is not always clearly painful.')
    ],
    faqs: [
      { id: 'gum-1', question: text('آیا خونریزی لثه هنگام مسواک طبیعی است؟', 'Is gum bleeding during brushing normal?'), answer: text('خونریزی تکرارشونده معمولاً طبیعی نیست و اغلب به التهاب ناشی از پلاک، جرم، روش غلط مسواک یا بیماری لثه مربوط است.', 'Repeated bleeding is usually not normal and is often related to plaque inflammation, calculus, incorrect brushing or gum disease.') },
      { id: 'gum-2', question: text('آیا جرم‌گیری باعث لق شدن یا تحلیل لثه می‌شود؟', 'Does scaling loosen teeth or cause gum recession?'), answer: text('جرم‌گیری اصولی دندان سالم را لق نمی‌کند. گاهی بعد از برداشتن جرم‌های زیاد، مشکل قبلی مثل تحلیل یا لقی واضح‌تر دیده می‌شود.', 'Proper scaling does not loosen healthy teeth. After heavy calculus removal, pre-existing recession or mobility may become more visible.') },
      { id: 'gum-3', question: text('تحلیل لثه قابل درمان است؟', 'Can gum recession be treated?'), answer: text('بسته به علت و شدت، می‌توان پیشرفت تحلیل را کنترل کرد و در بعضی موارد درمان‌های تخصصی مثل پیوند لثه مطرح می‌شود.', 'Depending on cause and severity, progression can be controlled and specialist treatments such as gum grafting may be considered.') },
      { id: 'gum-4', question: text('بیماری لثه چه زمانی خطرناک می‌شود؟', 'When does gum disease become serious?'), answer: text('لق شدن دندان، چرک، بوی بد مداوم، پاکت عمیق، تحلیل شدید یا خونریزی مکرر نشانه نیاز به بررسی جدی و پیگیری منظم است.', 'Tooth mobility, pus, persistent bad breath, deep pockets, severe recession or repeated bleeding indicate the need for serious review and maintenance.') }
    ],
    relatedIds: ['implant', 'whitening', 'root-canal'],
    seo: {
      title: text('درمان لثه | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Gum treatment | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای درمان لثه در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ خونریزی، جرم‌گیری، تحلیل لثه، مراقبت خانگی و مراجعات نگهدارنده.', 'Gum treatment guide at Dr. Saeed Moghaddam Dental Clinic: bleeding, scaling, recession, home care and maintenance visits.')
    }
  }
];

export const FEATURED_DENTAL_SERVICES = DENTAL_SERVICES.slice(0, 6);

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
    text: text('اطلاعات هر درمان، نمونه‌ها و فرم درخواست تماس کنار هم قرار گرفته‌اند تا بیمار سریع‌تر مسیر مناسب را پیدا کند.', 'Service information, treatment samples and the call request form sit together so patients can find the right path faster.')
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
    name: text('مریم ا.', 'Maryam A.'),
    service: text('لمینت سرامیکی', 'Porcelain veneers'),
    text: text('برای لمینت نگران رنگ خیلی سفید بودم. اول عکس دندان‌ها بررسی شد، چند نمونه رنگ دیدم و در نهایت نتیجه طبیعی‌تر از چیزی شد که تصور می‌کردم.', 'I was worried veneers would look too white. My photos were reviewed first, I saw shade samples, and the final result looked more natural than I expected.'),
    rating: 5
  },
  {
    id: 'reza',
    name: text('رضا ک.', 'Reza K.'),
    service: text('ایمپلنت دندان', 'Dental implants'),
    text: text('قبل از ایمپلنت نمی‌دانستم چند مرحله لازم است. بعد از بررسی عکس، زمان‌بندی و مراقبت‌ها را دقیق گفتند و همین باعث شد با خیال راحت‌تر شروع کنم.', 'Before my implant, I did not know how many steps were needed. After imaging, the timing and aftercare were explained clearly, which made it easier to start.'),
    rating: 5
  },
  {
    id: 'sara',
    name: text('سارا م.', 'Sara M.'),
    service: text('کامپوزیت ونیر', 'Composite veneers'),
    text: text('برای فاصله و فرم چند دندان مراجعه کردم. قبل از کار توضیح دادند کامپوزیت برای کدام دندان‌ها مناسب است و بعد از درمان هم روش مراقبت را یاد گرفتم.', 'I visited for gaps and shape correction on a few teeth. Before treatment, they explained which teeth were suitable for composite and taught me the care routine afterward.'),
    rating: 5
  },
  {
    id: 'hamid',
    name: text('حمید ر.', 'Hamid R.'),
    service: text('درمان ریشه', 'Root canal therapy'),
    text: text('با درد شبانه تماس گرفتم. در مراجعه اول علت درد مشخص شد و مرحله‌های درمان ریشه را ساده توضیح دادند، برای همین از روند کار نترسیدم.', 'I called because of night pain. At the first visit, the cause was found and the root canal steps were explained simply, so the process felt less stressful.'),
    rating: 5
  },
  {
    id: 'niloofar',
    name: text('نیلوفر ک.', 'Niloofar K.'),
    service: text('درمان لثه', 'Gum treatment'),
    text: text('خونریزی لثه را جدی نگرفته بودم. بعد از معاینه فهمیدم مشکل از التهاب است و روش مسواک، نخ دندان و زمان پیگیری را واضح گفتند.', 'I had not taken gum bleeding seriously. After the exam, I learned it was inflammation and got clear brushing, flossing and follow-up guidance.'),
    rating: 5
  }
];

export const GLOBAL_FAQS: FaqItem[] = [
  {
    id: 'first-step',
    question: text('اگر ندانم دقیقاً چه درمانی لازم دارم چه کنم؟', 'What if I do not know which treatment I need?'),
    answer: text('در فرم درخواست تماس، مشکل اصلی خود را کوتاه بنویسید؛ مثل درد، جای خالی دندان، تغییر رنگ یا اصلاح لبخند. مشاور برای راهنمایی اولیه و انتخاب مسیر مراجعه با شما تماس می‌گیرد.', 'Briefly describe your main concern in the call request form, such as pain, missing teeth, discoloration or smile correction. A consultant will call to guide the first step.')
  },
  {
    id: 'cost',
    question: text('هزینه درمان قبل از مراجعه مشخص می‌شود؟', 'Can treatment cost be defined before the visit?'),
    answer: text('برای بعضی خدمات می‌توان بازه حدودی گفت، اما هزینه دقیق بعد از معاینه، بررسی عکس، تعداد دندان‌ها و نوع درمان مشخص می‌شود.', 'A rough range may be possible for some services, but exact cost depends on exam, imaging, tooth count and treatment type.')
  },
  {
    id: 'call-back',
    question: text('بعد از ثبت شماره چه اتفاقی می‌افتد؟', 'What happens after I submit my number?'),
    answer: text('نام، شماره تماس و درمان مورد نظر شما ثبت می‌شود و مشاور کلینیک برای شنیدن توضیح کوتاه، پاسخ به سوال اولیه و هماهنگی مراجعه با شما تماس می‌گیرد.', 'Your name, phone number and selected service are saved, and a clinic consultant calls to hear your concern, answer initial questions and coordinate the visit.')
  },
  {
    id: 'urgent-pain',
    question: text('اگر درد دندان یا ورم داشته باشم کدام گزینه را انتخاب کنم؟', 'Which option should I choose for tooth pain or swelling?'),
    answer: text('در فرم، درمان ریشه یا درمان لثه را انتخاب کنید و در توضیح کوتاه شدت درد، ورم یا زمان شروع مشکل را بنویسید تا تماس اولیه دقیق‌تر انجام شود.', 'Select root canal or gum treatment in the form and describe pain severity, swelling or when it started so the first call can be more accurate.')
  }
];
