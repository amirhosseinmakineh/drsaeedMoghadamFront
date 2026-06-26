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

const PUBLIC_IMAGE_SIZES = {
  default: '(max-width: 640px) 76vw, (max-width: 980px) 70vw, 34vw',
  hero: '(max-width: 640px) 76vw, (max-width: 980px) 70vw, 32vw',
  portfolio: '(max-width: 640px) 100vw, (max-width: 980px) 92vw, 44vw'
} as const;

const PUBLIC_IMAGES = {
  clinic: { src: '/1.png', width: 1361, height: 1156 },
  laminate: { src: '/2.png', width: 1310, height: 1200 },
  composite: { src: '/3.png', width: 1310, height: 1201 },
  whitening: { src: '/5.png', width: 1310, height: 1201 }
} as const;

export type PublicClinicImageKey = keyof typeof PUBLIC_IMAGES;

export const publicClinicImage = (
  key: PublicClinicImageKey,
  sizes: string = PUBLIC_IMAGE_SIZES.default
): ClinicImage => ({
  ...PUBLIC_IMAGES[key],
  sizes
});

const image = publicClinicImage;

const portfolioImage = (key: PublicClinicImageKey): ClinicImage =>
  publicClinicImage(key, PUBLIC_IMAGE_SIZES.portfolio);

const heroImage = (key: PublicClinicImageKey): ClinicImage =>
  publicClinicImage(key, PUBLIC_IMAGE_SIZES.hero);

export const NAV_ITEMS: NavItem[] = [
  { label: text('خانه', 'Home'), href: '/', icon: 'home' },
  { label: text('خدمات', 'Services'), href: '/services', icon: 'sparkle' },
  { label: text('درباره ما', 'About'), href: '/about', icon: 'doctor' },
  { label: text('تماس', 'Contact'), href: '/contact', icon: 'phone' }
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'digital-smile',
    title: text('طراحی لبخند طبیعی با کامپوزیت، لمینت و بلیچینگ', 'Natural smile design with composite, veneers and bleaching'),
    text: text(
      'در کلینیک دندان‌پزشکی دکتر سعید مقدم، خدمات زیبایی دندان روی سه مسیر کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان متمرکز است و هر تصمیم بعد از معاینه، بررسی سلامت لثه و توضیح محدودیت‌ها گرفته می‌شود.',
      'At Dr. Saeed Moghaddam Dental Clinic, cosmetic dental care focuses on composite veneers, porcelain veneers and professional bleaching, with each decision made after examination, gum-health review and clear discussion of limits.'
    ),
    image: heroImage('clinic')
  },
  {
    id: 'calm-suite',
    title: text('زیبایی دندان با انتظار واقع‌بینانه و مراقبت ایمن', 'Cosmetic dentistry with realistic expectations and safe care'),
    text: text(
      'در انتخاب بین کامپوزیت، لمینت و بلیچینگ، وضعیت پوسیدگی، مینای دندان، حساسیت، رنگ ترمیم‌های قبلی، بایت و عادت‌هایی مثل دندان‌قروچه بررسی می‌شود تا درمان بیش از حد یا پرخطر پیشنهاد نشود.',
      'When choosing between composite, veneers and bleaching, decay, enamel, sensitivity, existing restoration shade, bite and habits such as grinding are reviewed so excessive or risky treatment is not suggested.'
    ),
    image: heroImage('laminate')
  },
  {
    id: 'mobile-first',
    title: text('از انتخاب رنگ تا مراقبت بعد درمان، مسیر شفاف است', 'From shade selection to aftercare, the path stays clear'),
    text: text(
      'توضیحات هر خدمت شامل کاربرد، مراحل، مراقبت‌ها، موارد احتیاط و پرسش‌های پرتکرار است تا مراجعه‌کننده پیش از ثبت درخواست تماس، تصویر دقیق‌تری از درمان داشته باشد.',
      'Each service explains indications, steps, aftercare, precautions and common questions so patients understand the treatment more clearly before requesting a call.'
    ),
    image: heroImage('whitening')
  }
];

export const STATS: StatItem[] = [
  { value: text('۳ خدمت زیبایی', '3 cosmetic services'), label: text('کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان', 'Composite veneers, porcelain veneers and dental bleaching') },
  { value: text('استاندارد سلامت', 'Health-first standards'), label: text('معاینه، کنترل حساسیت و بررسی سلامت لثه پیش از درمان', 'Exam, sensitivity control and gum-health review before care') },
  { value: text('پاسخگویی', 'Call back'), label: text('ثبت شماره برای راهنمایی اولیه و انتخاب مسیر مناسب', 'Leave your number for initial guidance and service selection') }
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
    image: portfolioImage('laminate')
  },
  {
    id: 'whitening-shade',
    title: text('نمونه بلیچینگ دندان', 'Dental bleaching sample'),
    service: text('بلیچینگ دندان', 'Dental bleaching'),
    description: text(
      'برای روشن‌تر شدن کنترل‌شده رنگ دندان طبیعی، رنگ پایه، حساسیت، سلامت لثه و ترمیم‌های قبلی قبل از بلیچینگ بررسی می‌شود.',
      'For controlled brightening of natural teeth, baseline shade, sensitivity, gum health and existing restorations are reviewed before bleaching.'
    ),
    result: text('روشن‌تر شدن طبیعی بدون تغییر رنگ ترمیم‌ها یا وعده غیرواقعی', 'Natural brightening without changing restorations or making unrealistic promises'),
    image: portfolioImage('whitening')
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
    image: portfolioImage('composite')
  }
];

export const DENTAL_SERVICES: DentalService[] = [
{
    id: 'composite',
    icon: 'brush',
    image: image('composite'),
    accent: '#d7a85d',
    title: text('کامپوزیت ونیر', 'Composite veneers'),
    subtitle: text('اصلاح سریع فرم و رنگ دندان', 'Fast shape and color enhancement'),
    summary: text('کامپوزیت ونیر می‌تواند لب‌پریدگی، فاصله‌های کوچک و فرم نامنظم دندان را با روشی محافظه‌کارانه‌تر اصلاح کند؛ البته انتخاب کیس و مراقبت بعد درمان تعیین‌کننده است.', 'Composite veneers can conservatively improve chips, small gaps and shape concerns, with case selection and aftercare defining predictability.'),
    longIntro: text(
      'کامپوزیت ونیر راهکاری مستقیم و کم‌تهاجمی برای اصلاح برخی مشکلات فرم و رنگ دندان است؛ مثل لب‌پریدگی محدود، فاصله کوچک، نامنظمی خفیف یا نیاز به بازسازی ظریف لبه دندان. پیش از شروع، بایت، سلامت لثه، پوسیدگی، کیفیت مینای دندان، رنگ پایه، ترمیم‌های قبلی، بهداشت دهان و عادت‌هایی مثل دندان‌قروچه بررسی می‌شود. مطابق اصول سلامت دهان، کامپوزیت برای همه موارد جایگزین لمینت یا بلیچینگ نیست و باید درباره رنگ‌پذیری، لب‌پریدگی احتمالی، نیاز به پولیش دوره‌ای و مراقبت غذایی توضیح شفاف داده شود.',
      'Composite veneers are a direct, minimally invasive option for selected shape and shade concerns such as limited chips, small gaps, mild irregularity or edge rebuilding. Bite, gum health, decay, enamel quality, baseline shade, previous restorations, hygiene and habits such as grinding are reviewed first. In line with oral-health principles, composite is not a replacement for veneers or bleaching in every case, and staining, possible chipping, periodic polishing and diet-related care must be explained clearly.'
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
    relatedIds: ['laminate', 'whitening'],
    seo: {
      title: text('کامپوزیت دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Composite veneers | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای کامپوزیت دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ مزایا، مراحل، مراقبت، زرد شدن، ترمیم لب‌پریدگی و محدودیت‌ها.', 'Composite veneer guide at Dr. Saeed Moghaddam Dental Clinic: benefits, steps, care, staining, chip repair and limitations.')
    }
  },
{
    id: 'laminate',
    icon: 'sparkle',
    image: image('laminate'),
    accent: '#c9a26a',
    title: text('لمینت سرامیکی', 'Porcelain veneers'),
    subtitle: text('طراحی لبخند ظریف و طبیعی', 'Delicate natural smile design'),
    summary: text('لمینت سرامیکی برای اصلاح رنگ، فرم و تناسب دندان‌های جلو به کار می‌رود؛ قبل از آن سلامت دندان، لثه، بایت و میزان تراش لازم بررسی می‌شود.', 'Porcelain veneers improve front-tooth shade, shape and proportion after tooth health, gums, bite and preparation needs are reviewed.'),
    longIntro: text(
      'لمینت سرامیکی برای افرادی مناسب است که می‌خواهند رنگ، فرم، اندازه یا هماهنگی دندان‌های جلویی اصلاح شود اما نتیجه مصنوعی و اغراق‌آمیز نباشد. پیش از لمینت، پوسیدگی فعال، کیفیت مینا، سلامت لثه، حساسیت دندان، خط لبخند، فرم لب، رنگ پوست، بایت و عادت دندان‌قروچه بررسی می‌شود. مطابق اصول پذیرفته‌شده سلامت دهان، انتخاب رنگ و میزان آماده‌سازی باید محافظه‌کارانه، قابل توضیح و متناسب با شرایط فرد باشد، چون لمینت درمانی دقیق و معمولاً برگشت‌ناپذیر است.',
      'Porcelain veneers suit people who want better shade, shape, size or harmony of front teeth without an artificial look. Active decay, enamel quality, gum health, sensitivity, smile line, lip form, skin tone, bite and grinding habits are reviewed first. In line with accepted oral-health principles, shade selection and preparation should be conservative, explainable and matched to the patient because veneer treatment is precise and usually irreversible.'
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
    relatedIds: ['composite', 'whitening'],
    seo: {
      title: text('لمینت دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Porcelain veneers | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای لمینت دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ طراحی لبخند طبیعی، میزان تراش، انتخاب رنگ، مراقبت و ماندگاری.', 'Porcelain veneer guide at Dr. Saeed Moghaddam Dental Clinic: natural smile design, preparation, shade selection, care and longevity.')
    }
  },
{
    id: 'whitening',
    icon: 'sun',
    image: image('whitening'),
    accent: '#c6a15b',
    title: text('بلیچینگ دندان', 'Dental bleaching'),
    subtitle: text('روشن‌تر شدن کنترل‌شده لبخند', 'Controlled smile brightening'),
    summary: text('بلیچینگ دندان برای روشن‌تر شدن رنگ دندان طبیعی است؛ پیش از آن پوسیدگی، التهاب لثه، ترمیم‌های قدیمی و حساسیت دندان بررسی می‌شود.', 'Dental bleaching brightens natural tooth shade after decay, gum inflammation, old restorations and sensitivity are reviewed.'),
    longIntro: text(
      'بلیچینگ دندان برای روشن‌تر کردن رنگ دندان طبیعی استفاده می‌شود، نه برای تغییر رنگ روکش، لمینت، کامپوزیت یا پرکردگی‌ها. پیش از بلیچینگ، پوسیدگی، ترک دندان، حساسیت قبلی، التهاب لثه، جرم، تحلیل لثه، بارداری یا شرایط پزشکی مهم و رنگ ترمیم‌های قدیمی بررسی می‌شود. مطابق راهنماهای پذیرفته‌شده سلامت دهان، درمان باید تحت نظر دندان‌پزشک، با محافظت لثه، کنترل غلظت و زمان تماس ماده، و آموزش مراقبت بعد درمان انجام شود تا خطر حساسیت و تحریک بافت نرم کاهش یابد.',
      'Dental bleaching lightens natural tooth structure, not crowns, veneers, composite or fillings. Decay, cracks, previous sensitivity, gum inflammation, calculus, recession, pregnancy or relevant medical conditions and existing restoration shade are reviewed first. In line with accepted oral-health guidance, bleaching should be dentist-supervised with gum protection, controlled concentration and contact time, plus aftercare instructions to reduce sensitivity and soft-tissue irritation.'
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
    relatedIds: ['composite', 'laminate'],
    seo: {
      title: text('بلیچینگ دندان | کلینیک دندان‌پزشکی دکتر سعید مقدم', 'Dental bleaching | Dr. Saeed Moghaddam Dental Clinic'),
      description: text('راهنمای بلیچینگ دندان در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ ایمنی مینا، حساسیت، ماندگاری، محدودیت روی ترمیم‌ها و مراقبت بعد درمان.', 'Dental bleaching guide at Dr. Saeed Moghaddam Dental Clinic: enamel safety, sensitivity, longevity, restoration limits and aftercare.')
    }
  }
];

export const FEATURED_DENTAL_SERVICES = DENTAL_SERVICES;

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
    text: text('اطلاعات کامپوزیت، لمینت و بلیچینگ، نمونه‌ها و فرم درخواست تماس کنار هم قرار گرفته‌اند تا بیمار سریع‌تر مسیر مناسب را پیدا کند.', 'Composite, veneer and bleaching information, samples and the call request form sit together so patients can find the right path faster.')
  },
  {
    id: 'phone-lead',
    icon: 'phone',
    title: text('درخواست تماس برای راهنمایی', 'Call request for guidance'),
    text: text('اگر درباره انتخاب بین کامپوزیت، لمینت یا بلیچینگ سؤال دارید، شماره خود را ثبت می‌کنید تا برای راهنمایی اولیه تماس گرفته شود.', 'If you have questions about choosing composite, veneers or bleaching, leave your number for an initial guidance call.')
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
    service: text('بلیچینگ دندان', 'Dental bleaching'),
    text: text('برای بلیچینگ نگران حساسیت بودم. قبل از شروع، وضعیت لثه و ترمیم‌ها بررسی شد و توضیح دادند که نتیجه روی دندان طبیعی اثر دارد، نه روی کامپوزیت یا روکش.', 'I was worried about bleaching sensitivity. Before starting, my gums and restorations were checked and they explained that results affect natural teeth, not composite or crowns.'),
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
    service: text('لمینت سرامیکی', 'Porcelain veneers'),
    text: text('برای لمینت، اول درباره میزان تراش، رنگ مناسب و مراقبت بعد از نصب صحبت شد. همین شفافیت باعث شد انتظارم از نتیجه واقعی‌تر باشد.', 'For veneers, the preparation amount, suitable shade and aftercare were discussed first. That clarity made my expectations more realistic.'),
    rating: 5
  },
  {
    id: 'niloofar',
    name: text('نیلوفر ک.', 'Niloofar K.'),
    service: text('کامپوزیت ونیر', 'Composite veneers'),
    text: text('برای کامپوزیت، درباره رنگ‌پذیری، پولیش دوره‌ای و پرهیز از فشار روی لبه‌ها توضیح کامل گرفتم؛ نتیجه طبیعی بود و مراقبت‌ها را می‌دانستم.', 'For composite veneers, staining, periodic polishing and avoiding force on the edges were explained clearly; the result looked natural and I knew the care routine.'),
    rating: 5
  }
];

export const GLOBAL_FAQS: FaqItem[] = [
  {
    id: 'first-step',
    question: text('اگر ندانم دقیقاً چه درمانی لازم دارم چه کنم؟', 'What if I do not know which treatment I need?'),
    answer: text('در فرم درخواست تماس، هدف خود را کوتاه بنویسید؛ مثل اصلاح رنگ، فرم دندان، فاصله‌های کوچک یا انتخاب بین کامپوزیت، لمینت و بلیچینگ. مشاور برای راهنمایی اولیه با شما تماس می‌گیرد.', 'Briefly describe your goal in the call request form, such as shade improvement, tooth shape, small gaps or choosing between composite, veneers and bleaching. A consultant will call to guide the first step.')
  },
  {
    id: 'cost',
    question: text('هزینه درمان قبل از مراجعه مشخص می‌شود؟', 'Can treatment cost be defined before the visit?'),
    answer: text('برای بعضی خدمات می‌توان بازه حدودی گفت، اما هزینه دقیق بعد از معاینه، تعداد دندان‌ها، وضعیت ترمیم‌های قبلی، نیاز به آماده‌سازی و نوع درمان مشخص می‌شود.', 'A rough range may be possible for some services, but exact cost depends on exam, tooth count, existing restorations, preparation needs and treatment type.')
  },
  {
    id: 'call-back',
    question: text('بعد از ثبت شماره چه اتفاقی می‌افتد؟', 'What happens after I submit my number?'),
    answer: text('نام، شماره تماس و درمان مورد نظر شما ثبت می‌شود و مشاور کلینیک برای شنیدن توضیح کوتاه، پاسخ به سوال اولیه و هماهنگی مراجعه با شما تماس می‌گیرد.', 'Your name, phone number and selected service are saved, and a clinic consultant calls to hear your concern, answer initial questions and coordinate the visit.')
  },
  {
    id: 'health-check',
    question: text('اگر پوسیدگی، التهاب لثه یا حساسیت داشته باشم می‌توانم درمان زیبایی انجام دهم؟', 'Can I have cosmetic treatment if I have decay, gum inflammation or sensitivity?'),
    answer: text('ابتدا باید معاینه انجام شود. در بسیاری از موارد، پوسیدگی، التهاب فعال یا حساسیت شدید باید پیش از کامپوزیت، لمینت یا بلیچینگ کنترل شود تا درمان ایمن‌تر و قابل پیش‌بینی‌تر باشد.', 'An exam is needed first. In many cases, decay, active inflammation or severe sensitivity should be controlled before composite, veneers or bleaching so treatment is safer and more predictable.')
  }
];
