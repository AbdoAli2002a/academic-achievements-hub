// بيانات تجريبية - ستُستبدل بقاعدة البيانات في المرحلة 2
export type Rank = "professor" | "associate" | "lecturer" | "assistant";
export type DepartmentKey = "artEd" | "musicEd" | "homeEc" | "eduTech" | "eduMedia";
export type BadgeKey = "topPublisher" | "communityService" | "excellence" | "research" | "teaching";

export interface FacultyMember {
  id: string;
  nameAr: string;
  nameEn: string;
  rank: Rank;
  department: DepartmentKey;
  specialtyAr: string;
  specialtyEn: string;
  bioAr: string;
  bioEn: string;
  email: string;
  phone?: string;
  avatar?: string;
  initials: string;
  publicationsCount: number;
  citationsCount: number;
  awardsCount: number;
  yearsExp: number;
  badges: BadgeKey[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  year: number;
  type: "publication" | "award" | "event" | "certificate";
  titleAr: string;
  titleEn: string;
}

export interface Department {
  key: DepartmentKey;
  icon: string;
  color: string;
}

export const departments: Department[] = [
  { key: "artEd", icon: "Palette", color: "from-pink-500/10 to-rose-500/10" },
  { key: "musicEd", icon: "Music2", color: "from-purple-500/10 to-indigo-500/10" },
  { key: "homeEc", icon: "Home", color: "from-amber-500/10 to-orange-500/10" },
  { key: "eduTech", icon: "MonitorPlay", color: "from-blue-500/10 to-cyan-500/10" },
  { key: "eduMedia", icon: "Radio", color: "from-emerald-500/10 to-teal-500/10" },
];

export const facultyMembers: FacultyMember[] = [
  {
    id: "fm-001",
    nameAr: "د. أحمد محمد السيد",
    nameEn: "Dr. Ahmed M. El-Sayed",
    rank: "professor",
    department: "eduTech",
    specialtyAr: "تكنولوجيا التعليم والتعلم الإلكتروني",
    specialtyEn: "Educational Technology & E-Learning",
    bioAr: "أستاذ بقسم تكنولوجيا التعليم، له العديد من الأبحاث المحكمة في مجالات التعلم الإلكتروني والذكاء الاصطناعي في التعليم.",
    bioEn: "Professor of Educational Technology with numerous peer-reviewed publications in e-learning and AI in education.",
    email: "ahmed.elsayed@faculty.edu",
    phone: "+20 100 000 0001",
    initials: "أم",
    publicationsCount: 42,
    citationsCount: 318,
    awardsCount: 6,
    yearsExp: 18,
    badges: ["topPublisher", "excellence", "research"],
    timeline: [
      { year: 2024, type: "publication", titleAr: "نشر 8 أبحاث محكّمة دولية", titleEn: "Published 8 international peer-reviewed papers" },
      { year: 2023, type: "award", titleAr: "جائزة الجامعة للتميز العلمي", titleEn: "University Scientific Excellence Award" },
      { year: 2022, type: "event", titleAr: "رئاسة مؤتمر التعلم الإلكتروني", titleEn: "Chaired the E-Learning Conference" },
      { year: 2020, type: "certificate", titleAr: "زمالة دولية في الذكاء الاصطناعي التعليمي", titleEn: "International Fellowship in Educational AI" },
    ],
  },
  {
    id: "fm-002",
    nameAr: "أ.د. منى عبد الله إبراهيم",
    nameEn: "Prof. Mona A. Ibrahim",
    rank: "professor",
    department: "artEd",
    specialtyAr: "نقد فني وفنون تشكيلية معاصرة",
    specialtyEn: "Art Criticism & Contemporary Visual Arts",
    bioAr: "أستاذ النقد الفني، عضو لجان تحكيم دولية، ومؤلفة لعدد من الكتب في الفن المعاصر.",
    bioEn: "Professor of Art Criticism, international jury member, author of several books on contemporary art.",
    email: "mona.ibrahim@faculty.edu",
    initials: "من",
    publicationsCount: 35,
    citationsCount: 267,
    awardsCount: 9,
    yearsExp: 22,
    badges: ["excellence", "communityService", "teaching"],
    timeline: [
      { year: 2024, type: "award", titleAr: "تكريم وزارة الثقافة", titleEn: "Ministry of Culture Recognition" },
      { year: 2023, type: "publication", titleAr: "كتاب: الفن التشكيلي في القرن 21", titleEn: "Book: Visual Arts in the 21st Century" },
      { year: 2022, type: "event", titleAr: "معرض دولي بالقاهرة", titleEn: "International exhibition in Cairo" },
    ],
  },
  {
    id: "fm-003",
    nameAr: "د. خالد رمضان عثمان",
    nameEn: "Dr. Khaled R. Othman",
    rank: "associate",
    department: "musicEd",
    specialtyAr: "تربية موسيقية وعلم الصوتيات",
    specialtyEn: "Music Education & Acoustics",
    bioAr: "أستاذ مساعد بقسم التربية الموسيقية، باحث في الموسيقى التراثية وتقنيات التدريس الحديثة.",
    bioEn: "Associate Professor of Music Education, researcher in heritage music and modern teaching techniques.",
    email: "khaled.othman@faculty.edu",
    initials: "خر",
    publicationsCount: 24,
    citationsCount: 142,
    awardsCount: 3,
    yearsExp: 12,
    badges: ["research", "communityService"],
    timeline: [
      { year: 2024, type: "publication", titleAr: "بحث مشترك مع جامعة باريس السوربون", titleEn: "Joint research with Sorbonne University" },
      { year: 2023, type: "event", titleAr: "ورشة تراث الموسيقى العربية", titleEn: "Arabic Music Heritage Workshop" },
    ],
  },
  {
    id: "fm-004",
    nameAr: "د. هدى مصطفى الجندي",
    nameEn: "Dr. Hoda M. El-Gendi",
    rank: "associate",
    department: "homeEc",
    specialtyAr: "تغذية إكلينيكية واقتصاد منزلي",
    specialtyEn: "Clinical Nutrition & Home Economics",
    bioAr: "أستاذ مساعد، متخصصة في برامج التوعية الغذائية المجتمعية وأبحاث سلامة الغذاء.",
    bioEn: "Associate Professor specializing in community nutrition awareness and food safety research.",
    email: "hoda.gendi@faculty.edu",
    initials: "هم",
    publicationsCount: 28,
    citationsCount: 195,
    awardsCount: 5,
    yearsExp: 14,
    badges: ["topPublisher", "communityService"],
    timeline: [
      { year: 2024, type: "award", titleAr: "جائزة خدمة المجتمع للعام", titleEn: "Community Service Award of the Year" },
      { year: 2023, type: "publication", titleAr: "5 أبحاث في مجلات Q1", titleEn: "5 papers in Q1 journals" },
    ],
  },
  {
    id: "fm-005",
    nameAr: "د. سارة محمود علي",
    nameEn: "Dr. Sara M. Ali",
    rank: "lecturer",
    department: "eduTech",
    specialtyAr: "تصميم الواقع الافتراضي التعليمي",
    specialtyEn: "Educational VR Design",
    bioAr: "مدرس بقسم تكنولوجيا التعليم، باحثة شابة متميزة في تطبيقات الواقع الافتراضي بالتعليم.",
    bioEn: "Lecturer in Educational Technology, distinguished young researcher in VR applications in education.",
    email: "sara.ali@faculty.edu",
    initials: "سم",
    publicationsCount: 14,
    citationsCount: 67,
    awardsCount: 2,
    yearsExp: 6,
    badges: ["research"],
    timeline: [
      { year: 2024, type: "award", titleAr: "جائزة الباحث الشاب", titleEn: "Young Researcher Award" },
      { year: 2023, type: "publication", titleAr: "أول بحث في مجلة IEEE", titleEn: "First IEEE journal publication" },
    ],
  },
  {
    id: "fm-006",
    nameAr: "د. يوسف إبراهيم حسن",
    nameEn: "Dr. Youssef I. Hassan",
    rank: "lecturer",
    department: "eduMedia",
    specialtyAr: "إعلام تربوي وإنتاج المحتوى الرقمي",
    specialtyEn: "Educational Media & Digital Content Production",
    bioAr: "مدرس بقسم الإعلام التربوي، خبير في إنتاج المحتوى التعليمي الرقمي والبودكاست.",
    bioEn: "Lecturer in Educational Media, expert in digital educational content and podcast production.",
    email: "youssef.hassan@faculty.edu",
    initials: "يإ",
    publicationsCount: 11,
    citationsCount: 48,
    awardsCount: 1,
    yearsExp: 5,
    badges: ["teaching"],
    timeline: [
      { year: 2024, type: "event", titleAr: "إطلاق بودكاست تربوي", titleEn: "Launched educational podcast" },
      { year: 2023, type: "certificate", titleAr: "شهادة Adobe Certified Expert", titleEn: "Adobe Certified Expert" },
    ],
  },
];

export const facultyStats = {
  members: 87,
  publications: 642,
  departments: 5,
  awards: 124,
};

export const getMembersByDepartment = (key: DepartmentKey) =>
  facultyMembers.filter((m) => m.department === key);

export const getMemberById = (id: string) =>
  facultyMembers.find((m) => m.id === id);
