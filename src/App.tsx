import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Lock,
  Unlock,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  ShieldCheck,
  FileSpreadsheet,
  Trash2,
  Key,
  BookOpen,
  Activity,
  Award,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
  Search,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  Send,
  ThumbsUp,
  SlidersHorizontal,
  Filter,
  Sparkles,
  MessageCircle,
  FileText
} from "lucide-react";
import { syllabusData } from "./data";
import { Lesson, Question, LogEntry, ForumComment, FeedbackMessage } from "./types";

// Helper for Arabic digits conversion
function toArabicDigits(num: number | string): string {
  if (num === null || num === undefined) return "";
  const arabicZero = "٠".charCodeAt(0);
  return num.toString().replace(/[0-9]/g, (d) =>
    String.fromCharCode(arabicZero + parseInt(d))
  );
}

// Helper for Arabic numbers normalization
function toEnglishDigits(str: string): string {
  const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/[٠-٩]/g, (d) =>
    arabicNums.indexOf(d).toString()
  );
}

export default function App() {
  // Screens state
  const [screen, setScreen] = useState<"welcome" | "dashboard" | "quiz" | "result" | "admin">("welcome");
  const [studentName, setStudentName] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  
  // Dashboard navigation tabs
  const [dashboardTab, setDashboardTab] = useState<"lessons" | "forum" | "feedback">("lessons");

  // Admin Panel Tab
  const [adminTab, setAdminTab] = useState<"passwords" | "logs" | "forum" | "feedback">("passwords");
  const [adminRepliesState, setAdminRepliesState] = useState<Record<string, string>>({});

  // Advanced Filtering States for lessons directory
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [topicFilter, setTopicFilter] = useState<"all" | "millions" | "operations" | "rounding" | "roots" | "algebra">("all");

  // Custom Quiz Generator states
  const [customSelectedLessons, setCustomSelectedLessons] = useState<string[]>([]);
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(10);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<number>(5);

  // Forum States
  const [forumComments, setForumComments] = useState<ForumComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentCategory, setNewCommentCategory] = useState<ForumComment["category"]>("مناقشة");

  // Feedback States
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [newFeedbackText, setNewFeedbackText] = useState("");
  const [newFeedbackCategory, setNewFeedbackCategory] = useState<FeedbackMessage["category"]>("مسألة");

  // Persisted state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  
  // Current active quiz state
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizActive, setQuizActive] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Modals / password unlock state
  const [lessonToUnlock, setLessonToUnlock] = useState<Lesson | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Stats derived from logs
  const [studentStats, setStudentStats] = useState({ completedCount: 0, avgScore: 0 });

  // Init data and state on mount
  useEffect(() => {
    // Read/Initialize Passwords
    const savedPasswords = localStorage.getItem("lessonPasswords");
    let currentPwds: Record<string, string> = {};
    if (savedPasswords) {
      try {
        currentPwds = JSON.parse(savedPasswords);
      } catch (e) {
        currentPwds = {};
      }
    }
    // Set defaults if empty
    if (Object.keys(currentPwds).length === 0) {
      for (let i = 1; i <= 16; i++) {
        currentPwds["L" + i] = "١٢٣" + toArabicDigits(i);
      }
      localStorage.setItem("lessonPasswords", JSON.stringify(currentPwds));
    }
    setPasswords(currentPwds);

    // Read/Initialize Logs
    const savedLogs = localStorage.getItem("wadeehAdminSystemLogs");
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        setLogs([]);
      }
    }

    // Load active session if any
    const savedSessionName = localStorage.getItem("activeStudentName");
    if (savedSessionName) {
      setStudentName(savedSessionName);
    }

    // Load Forum Comments
    const savedComments = localStorage.getItem("wadeehForumComments");
    if (savedComments) {
      try {
        setForumComments(JSON.parse(savedComments));
      } catch (e) {
        setForumComments([]);
      }
    } else {
      const defaultComments: ForumComment[] = [
        {
          id: "fc1",
          studentName: "أحمد بن علي",
          text: "منصة رائعة جداً يا أستاذ وديع! درس مراجعة الأعداد الكبيرة ضمن المليارات سهل علي فهم ترتيب الخانات والقيمة المكانية.",
          category: "شكر",
          timestamp: new Date(Date.now() - 3600000 * 4).toLocaleString("ar-YE", { hour12: true }),
          likes: 5
        },
        {
          id: "fc2",
          studentName: "خالد اليماني",
          text: "شباب، عندي سؤال: في درس الأسس والجذور، الرقم ٥ أس ٣ كيف نحسبه؟ هل هو ٥ ضرب ٣ أم ٥ ثلاث مرات؟",
          category: "استفسار",
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString("ar-YE", { hour12: true }),
          likes: 3
        },
        {
          id: "fc3",
          studentName: "محمد الهاشمي",
          text: "يا خالد، ٥ أس ٣ تعني ٥ ضرب ٥ ضرب ٥ وتساوي ١٢٥. لأن الأس هو تكرار الضرب للأساس بعدد مرات الأس.",
          category: "مناقشة",
          timestamp: new Date(Date.now() - 3600000).toLocaleString("ar-YE", { hour12: true }),
          likes: 8
        },
        {
          id: "fc4",
          studentName: "علي الكبسي",
          text: "فائدة يا زملائي: لحساب القيمة المكانية لعدد بسهولة، نضع أصفاراً مكان كل الخانات الواقعة على يمين الرقم المطلوب.",
          category: "فائدة",
          timestamp: new Date(Date.now() - 1800000).toLocaleString("ar-YE", { hour12: true }),
          likes: 4
        }
      ];
      setForumComments(defaultComments);
      localStorage.setItem("wadeehForumComments", JSON.stringify(defaultComments));
    }

    // Load Feedback Messages
    const savedFeedback = localStorage.getItem("wadeehFeedbackMessages");
    if (savedFeedback) {
      try {
        setFeedbackMessages(JSON.parse(savedFeedback));
      } catch (e) {
        setFeedbackMessages([]);
      }
    } else {
      const defaultFeedback: FeedbackMessage[] = [
        {
          id: "fb1",
          studentName: "سفيان العبسي",
          category: "مسألة",
          text: "أستاذ وديع، لم أفهم السؤال الخامس في درس ترتيب العمليات، لماذا الضرب يسبق الطرح بالرغم من أن الطرح في الأول؟",
          timestamp: new Date(Date.now() - 3600000 * 12).toLocaleString("ar-YE", { hour12: true }),
          reply: "أهلاً يا بني سفيان. لأن قوة العمليات في الرياضيات تعطي الأسبقية دائماً للضرب والقسمة على الجمع والطرح، حتى لو جاء الطرح في البداية."
        }
      ];
      setFeedbackMessages(defaultFeedback);
      localStorage.setItem("wadeehFeedbackMessages", JSON.stringify(defaultFeedback));
    }
  }, []);

  // Recalculate student statistics based on logs when name or logs change
  useEffect(() => {
    if (!studentName) {
      setStudentStats({ completedCount: 0, avgScore: 0 });
      return;
    }

    const studentLogs = logs.filter(
      (l) => l.name === studentName && l.type === "اختبار رصد مهارة"
    );

    // Get unique lessons completed
    const completedLessonTitles = new Set(studentLogs.map((l) => l.info));

    // Calculate average score
    let sumScore = 0;
    let count = 0;
    studentLogs.forEach((l) => {
      // Parse e.g. "٨ من ١٠" or similar
      const match = l.score.match(/(\d+|[٠-٩]+)\s*من/);
      if (match) {
        const num = parseInt(toEnglishDigits(match[1]));
        sumScore += num;
        count++;
      }
    });

    const avg = count > 0 ? Math.round((sumScore / (count * 10)) * 100) : 0;
    setStudentStats({
      completedCount: completedLessonTitles.size,
      avgScore: avg
    });
  }, [studentName, logs]);

  // Timer interval control
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (quizActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setQuizActive(false);
            if (interval) clearInterval(interval);
            alert("⏰ انتهى الوقت الكلي المحدد للدرس! سيتم رصد وحفظ نتيجتك الحالية تلقائياً.");
            finishQuizAndSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerIntervalId(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizActive]);

  // Save logs helper
  const saveLog = (type: string, name: string, info: string, score: string) => {
    const newEntry: LogEntry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      type,
      name,
      info,
      score,
      timestamp: new Date().toLocaleString("ar-YE", { hour12: true })
    };

    const updated = [...logs, newEntry];
    setLogs(updated);
    localStorage.setItem("wadeehAdminSystemLogs", JSON.stringify(updated));
  };

  // Student enters platform
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) {
      alert("الرجاء كتابة اسمك الثلاثي أولاً لكي نتمكن من رصد درجاتك.");
      return;
    }
    setStudentName(trimmed);
    localStorage.setItem("activeStudentName", trimmed);
    saveLog("تسجيل دخول للطلاب", trimmed, "سجل حضور للمنصة الحية", "-");
    setScreen("dashboard");
  };

  // Exit student session
  const handleExitPlatform = () => {
    if (confirm("هل تود تسجيل الخروج الكامل من المنصة التفاعلية؟")) {
      saveLog("تسجيل خروج", studentName, "خرج من نظام الفهرس", "-");
      setStudentName("");
      localStorage.removeItem("activeStudentName");
      setScreen("welcome");
    }
  };

  // Access administrative control
  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === "7730") {
      setScreen("admin");
      setAdminPasswordInput("");
    } else {
      alert("❌ خطأ أمني في كلمة المرور! يرجى مراجعة الأستاذ وديع الحاج.");
    }
  };

  // Click on a lesson card
  const handleLessonClick = (lesson: Lesson) => {
    if (!studentName) {
      alert("يرجى إدخال اسمك الثلاثي أولاً بوضوح للوصول إلى المواد الدراسية.");
      return;
    }
    setLessonToUnlock(lesson);
    setPasswordInput("");
    setPasswordError("");
  };

  // Unlock password match check
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonToUnlock) return;

    const correctPwd = passwords[lessonToUnlock.id] || "١٢٣";
    const cleanedInput = passwordInput.trim();

    // Support both English and Arabic digits
    const normalInput = toEnglishDigits(cleanedInput);
    const normalCorrect = toEnglishDigits(correctPwd);

    if (normalInput === normalCorrect || cleanedInput === correctPwd) {
      const lesson = lessonToUnlock;
      setLessonToUnlock(null);
      launchQuiz(lesson);
    } else {
      setPasswordError("⚠️ الرمز السري خاطئ! يرجى الاستفسار من الأستاذ وديع الحاج.");
    }
  };

  // Launch Quiz setup
  const launchQuiz = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setTimeLeft(300); // 5 minutes (300 seconds)
    setQuizActive(true);
    setScreen("quiz");
  };

  // Navigate Questions
  const handleQuestionNavigate = (dir: number) => {
    if (!selectedLesson) return;
    const newIdx = currentQuestionIndex + dir;
    if (newIdx >= 0 && newIdx < selectedLesson.questions.length) {
      setCurrentQuestionIndex(newIdx);
    }
  };

  // Select Option
  const handleSelectOption = (optionIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  // Exit active quiz warning
  const handleExitQuizConfirm = () => {
    if (confirm("هل تود العودة لقائمة الدروس؟ لن يتم حفظ أو رصد إجابات هذا الاختبار الحالي.")) {
      setQuizActive(false);
      setSelectedLesson(null);
      setScreen("dashboard");
    }
  };

  // Calc score and save log
  const finishQuizAndSubmit = () => {
    if (!selectedLesson) return;
    setQuizActive(false);

    let calculatedScore = 0;
    const total = selectedLesson.questions.length;

    for (let i = 0; i < total; i++) {
      if (quizAnswers[i] !== undefined && quizAnswers[i] === selectedLesson.questions[i].correct) {
        calculatedScore++;
      }
    }

    const pct = Math.round((calculatedScore / total) * 100);
    const scoreStr = `${toArabicDigits(calculatedScore)} من ${toArabicDigits(total)} (${toArabicDigits(pct)}%)`;

    saveLog("اختبار رصد مهارة", studentName, selectedLesson.title, scoreStr);
    setScreen("result");
  };

  // Get current student's performance logs
  const getStudentCurrentLessonScore = () => {
    if (!selectedLesson) return { score: 0, total: 10, pct: 0 };
    let score = 0;
    const total = selectedLesson.questions.length;
    for (let i = 0; i < total; i++) {
      if (quizAnswers[i] !== undefined && quizAnswers[i] === selectedLesson.questions[i].correct) {
        score++;
      }
    }
    return {
      score,
      total,
      pct: Math.round((score / total) * 100)
    };
  };

  // Guidance texts based on percentage
  const getGuidanceText = (pct: number) => {
    if (pct === 100) {
      return "ما شاء الله! درجة كاملة تدل على عبقرية متأصلة وفهم ممتاز. أنت فخر ومثال حي للتفوق والامتياز بمدارس النهضة الحديثة! استمر في هذا التفوق الباهر وعقبال العلامات المكتملة في كل المواد.";
    } else if (pct >= 80) {
      return "أداء ممتاز جداً وبطل رياضي رائع! لقد استطعت تجاوز المهارات بامتياز ودرجتك مشرفة للغاية. اقرأ توضيحات المسائل القليلة التي أخطأت فيها لتصل للدرجة الكاملة مئة بالمئة في المرة القادمة.";
    } else if (pct >= 50) {
      return "جهد رائع ومبارك! لقد اجتزت الاختبار بنجاح، ومستواك جيد. لكن ننصحك بمراجعة 'توضيح الحل التربوي' للأسئلة التي لم توفق فيها لتنمية مهاراتك بشكل أعمق وتحقيق درجات ممتازة في المستقبل.";
    } else {
      return "لا بأس يا بطل، الأخطاء هي مجرد خطوات على طريق التعلم والتفوق الحقيقي! نوصيك بالهدوء وإعادة قراءة صندوق 'توضيح الحل التربوي' لكل مسألة بتمعن، وسجل ملاحظاتك ثم أعد المحاولة. نثق بقدرتك على التفوق في المرة القادمة!";
    }
  };

  // Admin section: Update passwords
  const handleUpdatePassword = (lessonId: string, newPwd: string) => {
    const updated = { ...passwords, [lessonId]: newPwd };
    setPasswords(updated);
    localStorage.setItem("lessonPasswords", JSON.stringify(updated));
  };

  // Admin section: Wipe logs
  const handleWipeLogs = () => {
    if (confirm("تحذير أمني هام: هل أنت متأكد من مسح جميع سجلات كشوفات حضور ودرجات الطلاب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
      setLogs([]);
      localStorage.removeItem("wadeehAdminSystemLogs");
      alert("تم مسح السجلات والكشوفات بنجاح.");
    }
  };

  // Admin section: Export Excel (CSV)
  const handleDownloadCSV = () => {
    if (logs.length === 0) {
      alert("لا توجد بيانات مسجلة للتصدير حالياً.");
      return;
    }
    // UTF-8 BOM to display Arabic correctly in Excel
    let csv = "\uFEFFنوع الحركة,اسم الطالب المتردد,البيان والدرس الحسابي,النتيجة المرصودة,التاريخ والوقت\n";
    logs.forEach((l) => {
      csv += `"${l.type}","${l.name}","${l.info}","${l.score}","${l.timestamp}"\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `كشف_درجات_وحضور_الطلاب_الأستاذ_وديع_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Forum Comment
  const handleAddForumComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: ForumComment = {
      id: "comment_" + Date.now(),
      studentName: studentName || "زائر مجهول",
      text: newCommentText.trim(),
      category: newCommentCategory,
      timestamp: new Date().toLocaleString("ar-YE", { hour12: true }),
      likes: 0
    };

    const updated = [newComment, ...forumComments];
    setForumComments(updated);
    localStorage.setItem("wadeehForumComments", JSON.stringify(updated));
    setNewCommentText("");
    saveLog("مشاركة في المنتدى", studentName || "زائر مجهول", `أضاف تعليقاً في ساحة النقاش (${newCommentCategory})`, "-");
  };

  // Like comment
  const handleLikeComment = (id: string) => {
    const updated = forumComments.map((comment) => {
      if (comment.id === id) {
        return { ...comment, likes: comment.likes + 1 };
      }
      return comment;
    });
    setForumComments(updated);
    localStorage.setItem("wadeehForumComments", JSON.stringify(updated));
  };

  // Submit Feedback Message
  const handleAddFeedbackMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;

    const newMsg: FeedbackMessage = {
      id: "feedback_" + Date.now(),
      studentName: studentName || "زائر مجهول",
      category: newFeedbackCategory,
      text: newFeedbackText.trim(),
      timestamp: new Date().toLocaleString("ar-YE", { hour12: true })
    };

    const updated = [newMsg, ...feedbackMessages];
    setFeedbackMessages(updated);
    localStorage.setItem("wadeehFeedbackMessages", JSON.stringify(updated));
    setNewFeedbackText("");
    saveLog("إرسال استفسار خاص", studentName || "زائر مجهول", `أرسل استفساراً خاصاً للمعلم حول: ${newFeedbackCategory}`, "-");
    alert("✅ تم إرسال رسالتك وتساؤلك بنجاح إلى الأستاذ وديع الحاج. سيقوم الأستاذ بمراجعة السؤال والرد عليه، ويمكنك تصفح الردود هنا في أي وقت!");
  };

  // Admin replies to feedback messages
  const handleAdminReplyFeedback = (id: string, replyText: string) => {
    if (!replyText.trim()) return;
    const updated = feedbackMessages.map((msg) => {
      if (msg.id === id) {
        return { ...msg, reply: replyText.trim() };
      }
      return msg;
    });
    setFeedbackMessages(updated);
    localStorage.setItem("wadeehFeedbackMessages", JSON.stringify(updated));
  };

  // Delete comment (admin tool)
  const handleDeleteForumComment = (id: string) => {
    if (confirm("هل تريد بالتأكيد حذف هذا التعليق؟")) {
      const updated = forumComments.filter((c) => c.id !== id);
      setForumComments(updated);
      localStorage.setItem("wadeehForumComments", JSON.stringify(updated));
    }
  };

  // Delete message (admin tool)
  const handleDeleteFeedbackMessage = (id: string) => {
    if (confirm("هل تريد بالتأكيد حذف هذه الرسالة؟")) {
      const updated = feedbackMessages.filter((m) => m.id !== id);
      setFeedbackMessages(updated);
      localStorage.setItem("wadeehFeedbackMessages", JSON.stringify(updated));
    }
  };

  // Launch custom quiz generator
  const handleLaunchCustomQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSelectedLessons.length === 0) {
      alert("⚠️ الرجاء اختيار درس واحد على الأقل لتوليد الاختبار المخصص!");
      return;
    }

    // Accumulate all questions from selected lessons
    const pooledQuestions: Question[] = [];
    customSelectedLessons.forEach((lessonId) => {
      const lesson = syllabusData.find((l) => l.id === lessonId);
      if (lesson) {
        pooledQuestions.push(...lesson.questions);
      }
    });

    if (pooledQuestions.length === 0) {
      alert("⚠️ لا توجد أسئلة متوفرة في الدروس المحددة!");
      return;
    }

    // Shuffle pooled questions
    const shuffled = [...pooledQuestions].sort(() => Math.random() - 0.5);

    // Slice to desired question count
    const limit = Math.min(customQuestionCount, shuffled.length);
    const selectedQuestions = shuffled.slice(0, limit);

    // Create a virtual lesson
    const virtualLesson: Lesson = {
      id: "custom_quiz",
      title: `اختبار مخصص ذكي (${toArabicDigits(customSelectedLessons.length)} دروس - ${toArabicDigits(limit)} أسئلة)`,
      questions: selectedQuestions
    };

    setSelectedLesson(virtualLesson);
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setTimeLeft(customTimerMinutes > 0 ? customTimerMinutes * 60 : 99999); // 0 means untimed (99999 seconds)
    setQuizActive(true);
    setScreen("quiz");

    saveLog("توليد اختبار مخصص", studentName || "زائر مجهول", `بدأ اختبار مخصص لعدد ${limit} أسئلة من ${customSelectedLessons.length} دروس منتقاة`, "-");
  };

  // Get score values
  const { score: currentScore, total: currentTotal, pct: currentPct } = getStudentCurrentLessonScore();

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased relative overflow-hidden flex flex-col justify-between" dir="rtl">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none"></div>

      {/* HEADER SECTION */}
      <header className="max-w-5xl w-full mx-auto px-4 pt-6 pb-2 z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-md text-white">
              <GraduationCap className="w-8 h-8" />
            </div>
            
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 tracking-tight">
                منصة التفوق الرياضي الرقمية
              </h1>
              <p className="text-sm md:text-lg text-slate-300 font-medium mt-1">
                تحت إشراف الأستاذ القدير: <span className="text-amber-400 font-bold">وديع الحاج</span>
              </p>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-800 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-inner text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              رياض ومدارس النهضة الحديثة – مادة الرياضيات – الصف السادس
            </div>
          </div>
        </div>
      </header>

      {/* MAIN SCREEN ROUTING */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex-grow z-10 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          
          {/* 1. WELCOME / SIGN IN SCREEN */}
          {screen === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
              id="welcomeScreen"
            >
              <div className="max-w-md mx-auto text-center">
                <h2 className="text-xl md:text-2xl font-bold text-sky-400 mb-3 flex items-center justify-center gap-2">
                  <span>مرحباً بك يا بطل الرياضيات!</span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  يسعدنا انضمامك إلينا لمراجعة مهارات وحل أسئلة الوحدة الأولى الشاملة والمطورة لرصد وتنمية مستواك العلمي الحقيقي.
                </p>

                <form onSubmit={handleStudentLogin} className="space-y-4 text-right">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">
                      اسم الطالب الثلاثي الكافي:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="أدخل اسمك الثلاثي بوضوح لرصد درجتك..."
                        className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3.5 pr-11 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-right"
                        required
                      />
                      <User className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-4 rounded-xl shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    <span>دخول المنصة وعرض الفهرس التفاعلي</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </form>

                {/* Secure Administration Badge Section */}
                <div className="mt-12 pt-6 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 justify-center mb-3 text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-sm">🔒 نظام الإدارة والتحكم</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    خاص بالأستاذ وديع الحاج لإدارة رموز حماية الدروس ومراجعة الكشوفات والنتائج الحية.
                  </p>
                  
                  <form onSubmit={handleAdminAccess} className="flex gap-2">
                    <input
                      type="password"
                      placeholder="أدخل رمز الدخول السري..."
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="flex-grow bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-center font-bold"
                    />
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                    >
                      دخول الإدارة
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. MAIN DASHBOARD / LESSONS INDEX SCREEN */}
          {screen === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="dashboardScreen"
            >
              {/* Student info and active stats bar */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">المستكشف الذكي النشط:</span>
                    <h3 className="text-sm md:text-base font-extrabold text-indigo-300">
                      {studentName}
                    </h3>
                  </div>
                </div>

                {/* Dashboard statistics badges */}
                <div className="flex items-center gap-6">
                  <div className="text-center md:text-right">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 justify-center md:justify-end">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      الدروس المنجزة:
                    </span>
                    <div className="text-base font-extrabold text-purple-300">
                      {toArabicDigits(studentStats.completedCount)} / {toArabicDigits(16)}
                    </div>
                  </div>

                  <div className="text-center md:text-right border-r border-slate-800 pr-6">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 justify-center md:justify-end">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      متوسط درجاتك:
                    </span>
                    <div className="text-base font-extrabold text-emerald-400">
                      {toArabicDigits(studentStats.avgScore)}٪
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExitPlatform}
                  className="bg-slate-950/60 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>

              {/* TAB BAR FOR DASHBOARD SCREENS */}
              <div className="flex flex-wrap items-center justify-center bg-slate-900/60 border border-white/5 p-1.5 rounded-2xl gap-1">
                <button
                  onClick={() => setDashboardTab("lessons")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    dashboardTab === "lessons"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/15"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>📚 الفهرس والدروس</span>
                </button>

                <button
                  onClick={() => setDashboardTab("forum")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    dashboardTab === "forum"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/15"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 ساحة نقاش العباقرة</span>
                </button>

                <button
                  onClick={() => setDashboardTab("feedback")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    dashboardTab === "feedback"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/15"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>✉️ تواصل مباشر مع المعلم</span>
                </button>
              </div>

              {/* RENDERING DYNAMIC ACTIVE TAB CONTENT */}
              <AnimatePresence mode="wait">
                
                {/* TAB 1: SYLLABUS LESSONS INDEX WITH ADVANCED FILTERS */}
                {dashboardTab === "lessons" && (
                  <motion.div
                    key="lessons_tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Advanced Filtering Options Panel */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 md:p-5 space-y-4 text-right">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <h3 className="text-xs md:text-sm font-extrabold text-indigo-300 flex items-center gap-1.5">
                          <SlidersHorizontal className="w-4 h-4" />
                          <span>خيارات التصفية والبحث المتقدم للدروس:</span>
                        </h3>
                        <span className="text-[10px] text-slate-500 font-bold">
                          يتطابق حالياً {toArabicDigits(syllabusData.filter((lesson) => {
                            const titleMatch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
                            const hasPlayedThis = logs.some((l) => l.name === studentName && l.info === lesson.title && l.type === "اختبار رصد مهارة");
                            let statusMatch = true;
                            if (statusFilter === "completed") statusMatch = hasPlayedThis;
                            if (statusFilter === "pending") statusMatch = !hasPlayedThis;
                            let topicMatch = true;
                            if (topicFilter !== "all") {
                              const num = parseInt(lesson.id.replace("L", ""));
                              if (topicFilter === "millions") topicMatch = num <= 2;
                              else if (topicFilter === "operations") topicMatch = [3, 4, 5, 7].includes(num);
                              else if (topicFilter === "rounding") topicMatch = [6, 9].includes(num);
                              else if (topicFilter === "roots") topicMatch = [8, 10, 11].includes(num);
                              else if (topicFilter === "algebra") topicMatch = num >= 12;
                            }
                            return titleMatch && statusMatch && topicMatch;
                          }).length)} درساً
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        {/* Search field */}
                        <div className="md:col-span-5 relative">
                          <input
                            type="text"
                            placeholder="ابحث باسم الدرس (مثلاً: ملايين، ضرب، قوى)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 pr-10 text-white text-xs md:text-sm font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all text-right"
                          />
                          <Search className="absolute right-3.5 top-3 text-slate-500 w-4 h-4" />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Status Filter buttons */}
                        <div className="md:col-span-7 flex flex-wrap gap-1.5 justify-start md:justify-end">
                          <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              statusFilter === "all"
                                ? "bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 shadow-sm"
                                : "bg-slate-950/50 border border-slate-900 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            كل الحالات
                          </button>
                          <button
                            onClick={() => setStatusFilter("completed")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              statusFilter === "completed"
                                ? "bg-emerald-600/20 border border-emerald-500/50 text-emerald-300"
                                : "bg-slate-950/50 border border-slate-900 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            منجز بنجاح ✅
                          </button>
                          <button
                            onClick={() => setStatusFilter("pending")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              statusFilter === "pending"
                                ? "bg-amber-600/20 border border-amber-500/50 text-amber-300"
                                : "bg-slate-950/50 border border-slate-900 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            قيد الانتظار ⏳
                          </button>
                        </div>
                      </div>

                      {/* Topic categories filter strip */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5" />
                          موضوع الوحدة:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: "all", label: "الكل" },
                            { id: "millions", label: "١- الأعداد والمليارات" },
                            { id: "operations", label: "٢- العمليات والخصائص" },
                            { id: "rounding", label: "٣- التقريب والتحليل" },
                            { id: "roots", label: "٤- الأسس والجذور" },
                            { id: "algebra", label: "٥- المعادلات والرموز" }
                          ].map((topic) => (
                            <button
                              key={topic.id}
                              onClick={() => setTopicFilter(topic.id as any)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                topicFilter === topic.id
                                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                                  : "bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-slate-300"
                              }`}
                            >
                              {topic.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bento-style Grid for filtered 16 lessons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {syllabusData.filter((lesson) => {
                        const titleMatch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
                        const hasPlayedThis = logs.some(
                          (l) => l.name === studentName && l.info === lesson.title && l.type === "اختبار رصد مهارة"
                        );
                        let statusMatch = true;
                        if (statusFilter === "completed") {
                          statusMatch = hasPlayedThis;
                        } else if (statusFilter === "pending") {
                          statusMatch = !hasPlayedThis;
                        }

                        let topicMatch = true;
                        if (topicFilter !== "all") {
                          const lessonNum = parseInt(lesson.id.replace("L", ""));
                          if (topicFilter === "millions") {
                            topicMatch = lessonNum <= 2;
                          } else if (topicFilter === "operations") {
                            topicMatch = [3, 4, 5, 7].includes(lessonNum);
                          } else if (topicFilter === "rounding") {
                            topicMatch = [6, 9].includes(lessonNum);
                          } else if (topicFilter === "roots") {
                            topicMatch = [8, 10, 11].includes(lessonNum);
                          } else if (topicFilter === "algebra") {
                            topicMatch = lessonNum >= 12;
                          }
                        }

                        return titleMatch && statusMatch && topicMatch;
                      }).length === 0 ? (
                        <div className="col-span-1 md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 font-bold space-y-2">
                          <p className="text-sm">🔍 لا توجد دروس مطابقة لخيارات التصفية الحالية في المنصة.</p>
                          <p className="text-xs text-slate-600">جرب كتابة عبارات بحث بديلة أو إعادة تعيين الفلاتر من الأعلى.</p>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                              setTopicFilter("all");
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-xl mt-4 cursor-pointer font-bold transition-all"
                          >
                            مسح جميع الفلاتر
                          </button>
                        </div>
                      ) : (
                        syllabusData.filter((lesson) => {
                          const titleMatch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
                          const hasPlayedThis = logs.some(
                            (l) => l.name === studentName && l.info === lesson.title && l.type === "اختبار رصد مهارة"
                          );
                          let statusMatch = true;
                          if (statusFilter === "completed") {
                            statusMatch = hasPlayedThis;
                          } else if (statusFilter === "pending") {
                            statusMatch = !hasPlayedThis;
                          }

                          let topicMatch = true;
                          if (topicFilter !== "all") {
                            const lessonNum = parseInt(lesson.id.replace("L", ""));
                            if (topicFilter === "millions") {
                              topicMatch = lessonNum <= 2;
                            } else if (topicFilter === "operations") {
                              topicMatch = [3, 4, 5, 7].includes(lessonNum);
                            } else if (topicFilter === "rounding") {
                              topicMatch = [6, 9].includes(lessonNum);
                            } else if (topicFilter === "roots") {
                              topicMatch = [8, 10, 11].includes(lessonNum);
                            } else if (topicFilter === "algebra") {
                              topicMatch = lessonNum >= 12;
                            }
                          }

                          return titleMatch && statusMatch && topicMatch;
                        }).map((lesson, idx) => {
                          const hasPlayedThis = logs.some(
                            (l) => l.name === studentName && l.info === lesson.title && l.type === "اختبار رصد مهارة"
                          );
                          
                          return (
                            <motion.div
                              key={lesson.id}
                              whileHover={{ scale: 1.01, translateY: -2 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleLessonClick(lesson)}
                              className={`relative group cursor-pointer bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-900 border ${
                                hasPlayedThis ? "border-emerald-500/30 shadow-md shadow-emerald-500/5" : "border-slate-800/80 hover:border-indigo-500/30"
                              } rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300 min-h-[140px]`}
                            >
                              {/* Left vertical visual strip depending on completion */}
                              <div className={`absolute top-0 bottom-0 right-0 w-1 rounded-r-2xl ${
                                hasPlayedThis ? "bg-emerald-500" : "bg-indigo-600/50 group-hover:bg-indigo-500"
                              }`}></div>

                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h3 className="text-sm md:text-base font-extrabold text-slate-100 group-hover:text-indigo-300 transition-colors leading-relaxed">
                                    {lesson.title}
                                  </h3>
                                  {hasPlayedThis && (
                                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      تم الإنجاز
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  يحتوي على {toArabicDigits(10)} أسئلة مطورة لقياس الفهم ورصد المهارة الرياضية بدقة.
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-950">
                                <span className="text-[10px] text-slate-500 font-semibold">المقرر: الصف السادس</span>
                                
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                  <span>فتح الاختبار</span>
                                  <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}


                {/* TAB 3: DISCUSSION MODULE (وحدة تعليق ومناقشة) */}
                {dashboardTab === "forum" && (
                  <motion.div
                    key="forum_tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 md:p-8 text-right space-y-6 shadow-2xl"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-extrabold text-indigo-300 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                        <span>ساحة نقاش عباقرة الرياضيات بمدارس النهضة:</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        تفاعل وشارك معرفتك! ساحة نقاش حية تتيح للطلاب كتابة الفوائد الرياضية، طرح استفسارات حول الدروس الـ ١٦، أو تدوين رسائل تفوق وتشجيع، والتفاعل بالإعجابات لتعزيز المشاركة الإيجابية.
                      </p>
                    </div>

                    {/* Submit Comment Form */}
                    <form onSubmit={handleAddForumComment} className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300">
                          اكتب مشاركتك أو استفسارك هنا:
                        </label>
                        <textarea
                          rows={3}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="اكتب فكرتك الحسابية أو تساؤلك لمناقشته مع زملائك..."
                          className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-right leading-relaxed"
                          maxLength={300}
                          required
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                        {/* Category selection tag badges */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs font-bold text-slate-500 shrink-0">تصنيف المنشور:</span>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { id: "مناقشة", label: "💬 نقاش" },
                              { id: "فائدة", label: "💡 فائدة" },
                              { id: "استفسار", label: "❓ استفسار" },
                              { id: "شكر", label: "🎉 تشجيع" }
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setNewCommentCategory(cat.id as any)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  newCommentCategory === cat.id
                                    ? "bg-indigo-600/30 border border-indigo-500 text-indigo-300"
                                    : "bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-300"
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Submit button */}
                        <button
                          type="submit"
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 h-[40px]"
                        >
                          <Send className="w-4 h-4" />
                          <span>نشر المشاركة</span>
                        </button>
                      </div>
                    </form>

                    {/* Comments Feed List */}
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {forumComments.length === 0 ? (
                        <div className="bg-slate-950/40 p-10 rounded-2xl text-center text-slate-500 font-bold text-xs">
                          لا توجد مشاركات في ساحة النقاش حالياً. كن أول من يكتب تساؤلاً أو فائدة!
                        </div>
                      ) : (
                        forumComments.map((comment) => {
                          // Category styling map
                          const badges: Record<string, { bg: string; text: string; label: string }> = {
                            "فائدة": { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", label: "💡 فائدة رياضية" },
                            "استفسار": { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400", label: "❓ استفسار" },
                            "شكر": { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", label: "🎉 فخر وشكر" },
                            "مناقشة": { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", label: "💬 مناقشة" }
                          };
                          const badge = badges[comment.category] || badges["مناقشة"];

                          return (
                            <div key={comment.id} className="bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-2xl p-4 space-y-3 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs">
                                    {comment.studentName.slice(0, 1)}
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-xs text-slate-200">{comment.studentName}</h4>
                                    <span className="text-[9px] text-slate-500 block font-mono">{comment.timestamp}</span>
                                  </div>
                                </div>

                                <span className={`inline-block px-2 py-0.5 border rounded-full text-[9px] font-bold ${badge.bg} ${badge.text}`}>
                                  {badge.label}
                                </span>
                              </div>

                              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                                {comment.text}
                              </p>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
                                <button
                                  onClick={() => handleLikeComment(comment.id)}
                                  className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 text-[10px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>أعجبني ({toArabicDigits(comment.likes)})</span>
                                </button>
                                
                                <span className="text-[9px] text-slate-600 font-bold">مدارس النهضة الحديثة</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: DIRECT TEACHER FEEDBACK & DISCUSSIONS */}
                {dashboardTab === "feedback" && (
                  <motion.div
                    key="feedback_tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 md:p-8 text-right space-y-6 shadow-2xl"
                  >
                    <div>
                      <h3 className="text-base md:text-lg font-extrabold text-indigo-300 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-400" />
                        <span>مراسلة وتواصل مباشر واستشارة المعلم:</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        هل تواجه صعوبة في مهارة معينة بالوحدة الأولى؟ أرسل استشارتك أو مسألتك الصعبة مباشرة إلى الأستاذ القدير وديع الحاج، وسيقوم المعلم بالرد والتعقيب عليها تربوياً، لتجدها محفوظة في صندوق رسائلك أدناه.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Form Container */}
                      <form onSubmit={handleAddFeedbackMessage} className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl space-y-4">
                        <h4 className="text-xs font-black text-slate-200 border-b border-slate-900 pb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>تعبئة استمارة التواصل الخاصة:</span>
                        </h4>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-300">
                            نوع الاستفسار الرياضي:
                          </label>
                          <select
                            value={newFeedbackCategory}
                            onChange={(e) => setNewFeedbackCategory(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-right cursor-pointer font-bold"
                          >
                            <option value="مسألة">سؤال في مسألة لم أفهمها</option>
                            <option value="مهارة">صعوبة في مهارة معينة</option>
                            <option value="تقنية">مشكلة تقنية في تشغيل الموقع</option>
                            <option value="أخرى">كلمة شكر وتقدير للمعلم</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-300">
                            مضمون الرسالة أو السؤال الحسابي:
                          </label>
                          <textarea
                            rows={4}
                            value={newFeedbackText}
                            onChange={(e) => setNewFeedbackText(e.target.value)}
                            placeholder="اكتب المسألة أو الملاحظة بوضوح ليتمكن الأستاذ من كتابة رد تربوي مفصل لك..."
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-right leading-relaxed"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال الرسالة للأستاذ وديع</span>
                        </button>
                      </form>

                      {/* Inbox / Response list container */}
                      <div className="lg:col-span-7 space-y-4">
                        <h4 className="text-xs font-black text-slate-400 flex items-center gap-1.5 justify-between">
                          <span>📬 تساؤلاتك الموجهة وردود الأستاذ وديع:</span>
                          <span className="text-[10px] text-slate-500">خاص بك فقط</span>
                        </h4>

                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                          {feedbackMessages.filter(m => m.studentName === studentName).length === 0 ? (
                            <div className="bg-slate-950/40 p-8 rounded-2xl text-center text-slate-500 font-bold text-xs space-y-1">
                              <p>صندوق بريدك الشخصي فارغ.</p>
                              <p className="text-[10px] text-slate-600 font-normal">عندما ترسل تساؤلاً، سيظهر هنا مباشرة مع ردود الأستاذ فور كتابتها.</p>
                            </div>
                          ) : (
                            feedbackMessages.filter(m => m.studentName === studentName).map((msg) => (
                              <div key={msg.id} className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                                  <span className="bg-slate-900 px-2.5 py-1 rounded-lg text-[9px] font-extrabold text-indigo-400">
                                    الموضوع: {msg.category === "مسألة" ? "مسألة حسابية" : msg.category === "مهارة" ? "صعوبة مهارة" : msg.category === "تقنية" ? "عطل تقني" : "رسالة عامة"}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                                </div>

                                <div className="text-xs text-slate-300 leading-relaxed font-semibold">
                                  <span className="text-slate-500 font-bold">سؤالك: </span>
                                  {msg.text}
                                </div>

                                {msg.reply ? (
                                  <div className="bg-amber-500/10 border-r-4 border-amber-500 p-3 rounded-xl space-y-1 text-xs text-amber-300 leading-relaxed font-medium">
                                    <span className="font-extrabold text-amber-400 flex items-center gap-1">
                                      <span>👨‍🏫 رد الأستاذ وديع الحاج التربوي:</span>
                                    </span>
                                    <p className="text-slate-200 mt-1">{msg.reply}</p>
                                  </div>
                                ) : (
                                  <div className="bg-slate-900/80 p-2.5 rounded-xl text-[10px] text-slate-500 font-bold text-center border border-dashed border-slate-800">
                                    ⏳ جاري مراجعة الرسالة وكتابة الرد التربوي من الأستاذ...
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

          {/* 3. DYNAMIC INTERACTIVE QUIZ SCREEN */}
          {screen === "quiz" && selectedLesson && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl space-y-6"
              id="quizScreen"
            >
              {/* Quiz Header with Timer and title */}
              <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-extrabold text-sky-400">
                    {selectedLesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    جاري المراجعة ورصد الأداء في مادة الرياضيات
                  </p>
                </div>

                {/* Highly visual Timer countdown container */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold px-4 py-2 rounded-xl text-sm md:text-base tracking-widest shadow-inner">
                    <Clock className="w-5 h-5 animate-pulse text-rose-500" />
                    <span>
                      {toArabicDigits(Math.floor(timeLeft / 60) < 10 ? "0" + Math.floor(timeLeft / 60) : Math.floor(timeLeft / 60))}
                      :
                      {toArabicDigits(timeLeft % 60 < 10 ? "0" + (timeLeft % 60) : timeLeft % 60)}
                    </span>
                  </div>
                  <span className="text-xs text-rose-500 hidden md:inline font-bold">المتبقي من الوقت</span>
                </div>
              </div>

              {/* JUMP TO QUESTION MATRIX */}
              <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 flex flex-wrap items-center justify-center gap-2">
                {selectedLesson.questions.map((_, index) => {
                  const isAnswered = quizAnswers[index] !== undefined;
                  const isActive = currentQuestionIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-9 h-9 text-xs rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-500/30 scale-105"
                          : isAnswered
                          ? "bg-emerald-900/30 border border-emerald-500/40 text-emerald-300"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {toArabicDigits(index + 1)}
                    </button>
                  );
                })}
              </div>

              {/* QUESTION DISPLAYER BOX */}
              <div className="bg-slate-950/80 border border-slate-800 p-5 md:p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                  <span className="bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold">
                    السؤال {toArabicDigits(currentQuestionIndex + 1)} من {toArabicDigits(selectedLesson.questions.length)}
                  </span>
                  
                  {quizAnswers[currentQuestionIndex] !== undefined ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> تم تحديد إجابة
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 animate-bounce" /> في انتظار إجابتك
                    </span>
                  )}
                </div>

                <div className="text-base md:text-lg font-bold text-slate-100 leading-relaxed text-right">
                  {selectedLesson.questions[currentQuestionIndex].text}
                </div>

                {/* Option selections list */}
                <div className="grid grid-cols-1 gap-3">
                  {selectedLesson.questions[currentQuestionIndex].options.map((opt, oIdx) => {
                    const isSelected = quizAnswers[currentQuestionIndex] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full text-right p-4 rounded-xl border font-bold text-sm md:text-base transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg"
                            : "bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <span className="leading-relaxed">{opt}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-indigo-400 bg-indigo-500" : "border-slate-700 bg-slate-950 group-hover:border-slate-500"
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation and Submission Buttons */}
              <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleQuestionNavigate(-1)}
                    disabled={currentQuestionIndex === 0}
                    className="flex-grow md:flex-grow-0 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:text-slate-600 disabled:opacity-50 px-5 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <button
                    onClick={() => handleQuestionNavigate(1)}
                    disabled={currentQuestionIndex === selectedLesson.questions.length - 1}
                    className="flex-grow md:flex-grow-0 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:text-slate-600 disabled:opacity-50 px-5 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>التالي</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={handleExitQuizConfirm}
                    className="flex-grow md:flex-grow-0 bg-slate-950/40 hover:bg-rose-950/15 border border-slate-800 text-slate-400 hover:text-rose-400 px-5 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    📋 قائمة الدروس
                  </button>

                  {/* Submit score on the last question or show anytime? Let's show as option or force on final question */}
                  <button
                    onClick={finishQuizAndSubmit}
                    className="flex-grow md:flex-grow-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-6 py-3.5 rounded-xl text-sm md:text-base shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>إنهاء ورصد النتيجة</span>
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. PERFORMANCE RESULT & EXPLANATORY REPORT SCREEN */}
          {screen === "result" && selectedLesson && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="resultScreen"
            >
              {/* Score Display Card */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"></div>

                <div className="max-w-md mx-auto space-y-4">
                  <div className="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20 mb-2">
                    <Award className="w-10 h-10" />
                  </div>

                  <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    {currentPct >= 85 ? "مستوى متميز وعبقري! 🎉" : currentPct >= 50 ? "ناجح ومستواك جيد جداً 👍" : "تحتاج إلى مراجعة النشاط والملخص 📚"}
                  </h2>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    يا بطل الرياضيات المثابر، لقد أتممت مراجعة أسئلة درس:
                    <br />
                    <span className="text-indigo-300 font-extrabold block text-base mt-1">
                      [ {selectedLesson.title} ]
                    </span>
                  </p>

                  {/* Score box */}
                  <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl inline-block min-w-[200px]">
                    <span className="text-xs text-slate-500 block mb-1">الدرجة المرصودة</span>
                    <span className="text-2xl md:text-3xl font-black text-amber-400">
                      {toArabicDigits(currentScore)}
                    </span>
                    <span className="text-slate-400 text-lg mx-1">/</span>
                    <span className="text-slate-400 text-lg">
                      {toArabicDigits(currentTotal)}
                    </span>
                    
                    <span className="block text-xs text-emerald-400 font-bold mt-2">
                      معدل النجاح: {toArabicDigits(currentPct)}٪
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    تم رصد نتيجتك وحفظها تلقائياً في قاعدة بيانات ومحاضر الأستاذ وديع الحاج بنجاح.
                  </p>
                </div>
              </div>

              {/* REPORT CARD Breakdown with Solutions */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl space-y-6">
                <div className="pb-3 border-b border-slate-800 text-right">
                  <h3 className="text-base md:text-lg font-bold text-sky-400 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span>📊 تقرير الأداء المطور وتوضيح الحلول</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    راجع الحلول المعتمدة لتثبيت مهاراتك والتعلم من الأخطاء إن وجدت.
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedLesson.questions.map((q, qidx) => {
                    const studentAnsIdx = quizAnswers[qidx];
                    const isCorrect = studentAnsIdx !== undefined && studentAnsIdx === q.correct;
                    const studentAnsText = studentAnsIdx !== undefined ? q.options[studentAnsIdx] : "لم يتم الحل (سؤال متخطى)";
                    const correctAnsText = q.options[q.correct];

                    return (
                      <div
                        key={qidx}
                        className={`border rounded-2xl p-4 md:p-5 space-y-3 bg-slate-950/40 text-right ${
                          isCorrect ? "border-emerald-500/20" : "border-rose-500/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm md:text-base font-extrabold text-slate-100 leading-relaxed">
                            <strong>السؤال {toArabicDigits(qidx + 1)}:</strong> {q.text}
                          </h4>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400">إجابتك:</span>{" "}
                            <span className={isCorrect ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {studentAnsText}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                              <span className="text-slate-400">الإجابة الصحيحة:</span>{" "}
                              <span className="text-emerald-400 font-bold">
                                {correctAnsText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Pedagogical Explanation Box */}
                        <div className="bg-slate-900/80 p-3.5 rounded-xl border-r-4 border-indigo-500 text-xs md:text-sm text-slate-300 leading-relaxed shadow-sm">
                          <div className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4" />
                            <span>توضيح الحل التربوي:</span>
                          </div>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Educational Guidance Box */}
                <div className="bg-indigo-950/20 border border-indigo-800/40 p-5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm md:text-base text-indigo-300 flex items-center gap-2 justify-center md:justify-start">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span>🎯 التوجيه والإرشاد التربوي المعتمد</span>
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed text-right md:text-center">
                    {getGuidanceText(currentPct)}
                  </p>
                </div>

                {/* Action button to return */}
                <button
                  onClick={() => setScreen("dashboard")}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>العودة إلى الفهرس الرئيسي للدروس</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 5. SECURE ADMINISTRATION & COMMAND CENTER */}
          {screen === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl space-y-8"
              id="adminScreen"
            >
              <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b border-slate-800 gap-4">
                <div className="text-right">
                  <h2 className="text-lg md:text-xl font-extrabold text-amber-400 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" />
                    <span>لوحة تحكم الأستاذ وديع الحاج</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    إدارة رموز حماية الدروس والاطلاع المباشر على كشوفات حركة الطلاب المترددين ودرجاتهم.
                  </p>
                </div>

                <button
                  onClick={() => setScreen("welcome")}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>رجوع للرئيسية</span>
                </button>
              </div>

              {/* ADMIN PANEL TABS NAVIGATION */}
              <div className="flex flex-wrap items-center justify-center bg-slate-950/60 border border-white/5 p-1.5 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setAdminTab("passwords")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === "passwords"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>🔑 رموز حماية الدروس</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab("logs")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === "logs"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>📊 كشف الطلاب والدرجات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab("forum")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === "forum"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 رقابة منتدى العباقرة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab("feedback")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === "feedback"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>📬 صندوق الردود التربوية ({toArabicDigits(feedbackMessages.filter(m => !m.reply).length)} معلق)</span>
                </button>
              </div>

              {/* RENDER DYNAMIC ADMIN TAB CONTENT */}
              <AnimatePresence mode="wait">
                
                {/* ADMIN TAB 1: 16 LESSON PASSWORDS UPDATE CENTER */}
                {adminTab === "passwords" && (
                  <motion.div
                    key="admin_passwords"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm md:text-base font-extrabold text-indigo-300 flex items-center gap-2">
                      <Key className="w-4.5 h-4.5 text-amber-400" />
                      <span>🔒 تعديل وتحديث رموز حماية الدروس الـ ١٦ الفورية:</span>
                    </h3>
                    
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 max-h-[300px] overflow-y-auto space-y-3 shadow-inner">
                      {syllabusData.map((lesson) => {
                        const currentPwd = passwords[lesson.id] || "";
                        return (
                          <div
                            key={lesson.id}
                            className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/60 p-3 rounded-xl hover:border-slate-750 transition-all text-right"
                          >
                            <span className="text-xs font-extrabold text-slate-200 text-center sm:text-right w-full sm:w-auto">
                              {lesson.title}:
                            </span>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                value={currentPwd}
                                onChange={(e) => handleUpdatePassword(lesson.id, e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-center font-bold text-amber-400 focus:outline-none focus:border-indigo-500 flex-grow"
                              />
                              <button
                                onClick={() => alert(`✅ تم تحديث كلمة مرور الدرس [${lesson.title}] بنجاح في قاعدة البيانات المحلية!`)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                              >
                                تحديث
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ADMIN TAB 2: LIVE LOGS VIEW */}
                {adminTab === "logs" && (
                  <motion.div
                    key="admin_logs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <h3 className="text-sm md:text-base font-extrabold text-indigo-300 flex items-center gap-2">
                        <FileSpreadsheet className="w-4.5 h-4.5 text-amber-400" />
                        <span>📊 كشف حركة حضور واختبارات الطلاب المترددين على المنصة:</span>
                      </h3>
                      
                      {/* Action buttons inside tab */}
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleDownloadCSV}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>تحميل Excel (CSV)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleWipeLogs}
                          className="bg-rose-950/60 hover:bg-rose-900/40 border border-rose-900/50 text-rose-300 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>مسح السجلات</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                      <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                        <table className="w-full text-xs md:text-sm text-right border-collapse">
                          <thead className="sticky top-0 bg-slate-950 z-20">
                            <tr className="bg-slate-900 border-b border-slate-800">
                              <th className="p-3 font-bold text-indigo-400 text-center">نوع الحركة</th>
                              <th className="p-3 font-bold text-indigo-400">اسم الطالب المتردد</th>
                              <th className="p-3 font-bold text-indigo-400">البيان والدرس الحسابي</th>
                              <th className="p-3 font-bold text-indigo-400 text-center">النتيجة المرصودة</th>
                              <th className="p-3 font-bold text-indigo-400 text-center">التاريخ والوقت</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                                  لا توجد سجلات حضور أو درجات للطلاب مسجلة حالياً في النظام المحلي.
                                </td>
                              </tr>
                            ) : (
                              [...logs].reverse().map((log) => (
                                <tr
                                  key={log.id}
                                  className="border-b border-slate-900/60 hover:bg-slate-900/30 transition-all font-semibold text-xs"
                                >
                                  <td className="p-3 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                                      log.type === "اختبار رصد مهارة"
                                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                        : log.type === "توليد اختبار مخصص"
                                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    }`}>
                                      {log.type}
                                    </span>
                                  </td>
                                  <td className="p-3 font-bold text-slate-200">{log.name}</td>
                                  <td className="p-3 text-slate-300">{log.info}</td>
                                  <td className="p-3 text-center">
                                    <span className={log.score !== "-" ? "text-amber-400 font-black" : "text-slate-500"}>
                                      {log.score}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                    {log.timestamp}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ADMIN TAB 3: FORUM COMMENTS MODERATION (رقابة المنتدى وحذف المشاركات) */}
                {adminTab === "forum" && (
                  <motion.div
                    key="admin_forum"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm md:text-base font-extrabold text-indigo-300 flex items-center gap-2">
                      <MessageSquare className="w-4.5 h-4.5 text-amber-400" />
                      <span>💬 رقابة ومراجعة مشاركات وتعليقات ساحة نقاش الطلاب:</span>
                    </h3>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 max-h-[350px] overflow-y-auto space-y-3">
                      {forumComments.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 font-bold text-xs">
                          لا توجد أي تعليقات منشورة حالياً في منتدى الطلاب.
                        </div>
                      ) : (
                        forumComments.map((comment) => (
                          <div key={comment.id} className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl flex items-start justify-between gap-4 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-200">{comment.studentName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({comment.timestamp})</span>
                                <span className="bg-indigo-900/40 text-indigo-300 border border-indigo-900 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  {comment.category}
                                </span>
                              </div>
                              <p className="text-slate-300 leading-relaxed font-semibold">{comment.text}</p>
                              <span className="text-[10px] text-slate-500 block">👍 إعجابات الطلاب: {toArabicDigits(comment.likes)}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteForumComment(comment.id)}
                              className="bg-rose-950/40 hover:bg-rose-900/30 border border-rose-900 text-rose-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0"
                            >
                              حذف المنشور
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ADMIN TAB 4: HELPDESK REPLIES MANAGER (صندوق الإجابات للطلاب) */}
                {adminTab === "feedback" && (
                  <motion.div
                    key="admin_feedback"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm md:text-base font-extrabold text-indigo-300 flex items-center gap-2">
                      <MessageCircle className="w-4.5 h-4.5 text-amber-400" />
                      <span>📬 صندوق الاستشارات الأكاديمية والأسئلة المرسلة من الطلاب:</span>
                    </h3>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 max-h-[350px] overflow-y-auto space-y-4">
                      {feedbackMessages.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 font-bold text-xs">
                          لا توجد استفسارات أو رسائل تواصل مرسلة من الطلاب حالياً.
                        </div>
                      ) : (
                        feedbackMessages.map((msg) => {
                          const replyDraftText = adminRepliesState[msg.id] || "";
                          return (
                            <div key={msg.id} className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-3 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-200 text-sm">{msg.studentName}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">({msg.timestamp})</span>
                                  <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded text-[9px] font-bold">
                                    الموضوع: {msg.category === "مسألة" ? "مسألة حسابية" : msg.category === "مهارة" ? "صعوبة مهارة" : msg.category === "تقنية" ? "عطل تقني" : "رسالة عامة"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteFeedbackMessage(msg.id)}
                                  className="text-rose-400 hover:text-rose-300 font-bold"
                                >
                                  حذف الرسالة
                                </button>
                              </div>

                              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-slate-300 leading-relaxed font-semibold">
                                <span className="text-slate-500 font-extrabold">الرسالة المستلمة: </span>
                                {msg.text}
                              </div>

                              {/* Teacher Reply Section */}
                              <div className="pt-2">
                                {msg.reply ? (
                                  <div className="bg-indigo-950/20 border border-indigo-900/60 p-3 rounded-xl space-y-1">
                                    <p className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                                      <span>👨‍🏫 رد الأستاذ وديع المدون مسبقاً:</span>
                                    </p>
                                    <p className="text-slate-200 font-medium leading-relaxed mt-1">{msg.reply}</p>
                                    
                                    <div className="pt-2 flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="تعديل الرد وتحديثه..."
                                        value={replyDraftText}
                                        onChange={(e) => setAdminRepliesState({ ...adminRepliesState, [msg.id]: e.target.value })}
                                        className="flex-grow bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!replyDraftText.trim()) return;
                                          handleAdminReplyFeedback(msg.id, replyDraftText);
                                          setAdminRepliesState({ ...adminRepliesState, [msg.id]: "" });
                                          alert("✅ تم تحديث الرد التربوي المكتوب للطالب بنجاح!");
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                                      >
                                        تحديث الرد
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-amber-400">
                                      👨‍🏫 تفضل بصياغة الرد التربوي للتعليم الفوري للطالب:
                                    </label>
                                    <div className="flex gap-2">
                                      <textarea
                                        rows={2}
                                        placeholder="اكتب توضيح الحل أو المساعدة للطالب ليتعلم ويتحسن مستواه..."
                                        value={replyDraftText}
                                        onChange={(e) => setAdminRepliesState({ ...adminRepliesState, [msg.id]: e.target.value })}
                                        className="flex-grow bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!replyDraftText.trim()) {
                                            alert("يرجى كتابة نص الرد أولاً!");
                                            return;
                                          }
                                          handleAdminReplyFeedback(msg.id, replyDraftText);
                                          setAdminRepliesState({ ...adminRepliesState, [msg.id]: "" });
                                          alert("✅ تم إرسال وحفظ الرد التربوي بنجاح! سيتمكن الطالب من قراءته فوراً.");
                                        }}
                                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer self-end h-[42px]"
                                      >
                                        إرسال الرد
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* ADMIN ACTIONS CONTROL BAR */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setScreen("welcome")}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-3 px-6 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>العودة للشاشة الرئيسية</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-6 mt-12 bg-slate-950/80 border-t border-slate-900 z-10 text-xs text-slate-500 font-medium">
        <div className="max-w-md mx-auto space-y-1">
          <p>© جميع الحقوق محفوظة لمنصة الأستاذ وديع الحاج - {toArabicDigits(2026)}م</p>
          <p className="text-[10px] text-slate-600">تطوير المنظومة الذكية لمراجعة مهارات الرياضيات الأساسية بالصفوف العليا</p>
        </div>
      </footer>

      {/* RENDER MODAL FOR LESSON PASSWORD ENTRANCE */}
      <AnimatePresence>
        {lessonToUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm text-right space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setLessonToUnlock(null)}
                className="absolute left-4 top-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pb-2 border-b border-slate-800">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 inline-block mb-2 border border-indigo-500/20">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm md:text-base text-slate-200">
                  الدرس مغلق بأمر الإشراف التربوي
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  [ {lessonToUnlock.title} ]
                </p>
              </div>

              <form onSubmit={handleUnlockSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    أدخل الرمز السري المخصص للبدء:
                  </label>
                  <input
                    type="text"
                    placeholder="اكتب الرمز هنا..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-center font-extrabold text-amber-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    autoFocus
                    required
                  />
                </div>

                {passwordError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-rose-400 text-[10px] font-bold flex items-center gap-1.5 leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    تأكيد الرمز وبدء الاختبار
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonToUnlock(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                رمز المرور الافتراضي للدرس {lessonToUnlock.id.replace("L", "")} هو <strong>١٢٣{toArabicDigits(lessonToUnlock.id.replace("L", ""))}</strong>
                <br />
                أو تواصل مع الأستاذ وديع الحاج 776063283 للحصول عليه.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
