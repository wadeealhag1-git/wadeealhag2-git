export interface Question {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  questions: Question[];
}

export interface LogEntry {
  id: string;
  type: string; // e.g. "تسجيل دخول للطلاب" | "تسجيل خروج" | "اختبار رصد مهارة"
  name: string;
  info: string;
  score: string;
  timestamp: string;
}

export interface ForumComment {
  id: string;
  studentName: string;
  text: string;
  category: "فائدة" | "استفسار" | "شكر" | "مناقشة";
  timestamp: string;
  likes: number;
}

export interface FeedbackMessage {
  id: string;
  studentName: string;
  category: "مسألة" | "مهارة" | "تقنية" | "أخرى";
  text: string;
  timestamp: string;
  reply?: string;
}
