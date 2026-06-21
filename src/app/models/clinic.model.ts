export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  image: string;
  heroImage: string;
  beforeImage: string;
  afterImage: string;
  icon: string;
  price: string;
  duration: string;
  features: string[];
  steps: TreatmentStep[];
  faqs: FaqItem[];
}

export interface TreatmentStep {
  step: number;
  title: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  beforeImage: string;
  afterImage: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface BookingStep {
  step: number;
  title: string;
  description: string;
}

export interface DoctorInfo {
  name: string;
  title: string;
  image: string;
  bio: string;
  specialties: string[];
  education: string[];
  experience: string;
  certifications: string[];
  awards: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  image: string;
  service: string;
}

export interface WhyUsItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}
