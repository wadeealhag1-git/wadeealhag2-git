import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  increment,
  writeBatch
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { LogEntry, ForumComment, FeedbackMessage } from "../types";

// Initialize Firebase with the provided configuration
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// ------------------- ERROR HANDLING -------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ------------------- LOGS -------------------
export function subscribeLogs(onUpdate: (logs: LogEntry[]) => void) {
  const q = query(collection(db, "logs"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const logsList: LogEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      logsList.push({
        id: docSnap.id,
        type: data.type || "",
        name: data.name || "",
        info: data.info || "",
        score: data.score || "",
        timestamp: data.timestamp || ""
      });
    });
    onUpdate(logsList);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "logs");
  });
}

export async function addLog(log: Omit<LogEntry, "id">) {
  try {
    const colRef = collection(db, "logs");
    await addDoc(colRef, {
      ...log,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "logs");
  }
}

export async function clearAllLogs() {
  try {
    const colRef = collection(db, "logs");
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "logs");
  }
}

export async function seedDefaultLogs(defaultLogs: LogEntry[]) {
  try {
    const colRef = collection(db, "logs");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      defaultLogs.forEach((log) => {
        const docRef = doc(colRef);
        batch.set(docRef, {
          type: log.type,
          name: log.name,
          info: log.info,
          score: log.score,
          timestamp: log.timestamp,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "logs");
  }
}

// ------------------- FORUM -------------------
export function subscribeForum(onUpdate: (comments: ForumComment[]) => void) {
  const q = query(collection(db, "forumComments"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const commentsList: ForumComment[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      commentsList.push({
        id: docSnap.id,
        studentName: data.studentName || "",
        text: data.text || "",
        category: data.category || "مناقشة",
        timestamp: data.timestamp || "",
        likes: data.likes || 0
      });
    });
    onUpdate(commentsList);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "forumComments");
  });
}

export async function addForumComment(comment: Omit<ForumComment, "id">) {
  try {
    const colRef = collection(db, "forumComments");
    await addDoc(colRef, {
      ...comment,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "forumComments");
  }
}

export async function likeForumComment(id: string) {
  try {
    const docRef = doc(db, "forumComments", id);
    await updateDoc(docRef, {
      likes: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `forumComments/${id}`);
  }
}

export async function deleteForumComment(id: string) {
  try {
    const docRef = doc(db, "forumComments", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `forumComments/${id}`);
  }
}

export async function seedDefaultForumComments(defaultComments: ForumComment[]) {
  try {
    const colRef = collection(db, "forumComments");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      defaultComments.forEach((comment) => {
        const docRef = doc(colRef);
        batch.set(docRef, {
          studentName: comment.studentName,
          text: comment.text,
          category: comment.category,
          timestamp: comment.timestamp,
          likes: comment.likes,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "forumComments");
  }
}

// ------------------- FEEDBACK -------------------
export function subscribeFeedback(onUpdate: (messages: FeedbackMessage[]) => void) {
  const q = query(collection(db, "feedbackMessages"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const msgsList: FeedbackMessage[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      msgsList.push({
        id: docSnap.id,
        studentName: data.studentName || "",
        category: data.category || "مسألة",
        text: data.text || "",
        timestamp: data.timestamp || "",
        reply: data.reply || ""
      });
    });
    onUpdate(msgsList);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "feedbackMessages");
  });
}

export async function addFeedbackMessage(message: Omit<FeedbackMessage, "id">) {
  try {
    const colRef = collection(db, "feedbackMessages");
    await addDoc(colRef, {
      ...message,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "feedbackMessages");
  }
}

export async function replyFeedbackMessage(id: string, replyText: string) {
  try {
    const docRef = doc(db, "feedbackMessages", id);
    await updateDoc(docRef, {
      reply: replyText
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `feedbackMessages/${id}`);
  }
}

export async function deleteFeedbackMessage(id: string) {
  try {
    const docRef = doc(db, "feedbackMessages", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `feedbackMessages/${id}`);
  }
}

export async function seedDefaultFeedbackMessages(defaultFeedback: FeedbackMessage[]) {
  try {
    const colRef = collection(db, "feedbackMessages");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      defaultFeedback.forEach((msg) => {
        const docRef = doc(colRef);
        batch.set(docRef, {
          studentName: msg.studentName,
          category: msg.category,
          text: msg.text,
          timestamp: msg.timestamp,
          reply: msg.reply || "",
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "feedbackMessages");
  }
}

// ------------------- PASSWORDS -------------------
export function subscribePasswords(onUpdate: (passwords: Record<string, string>) => void) {
  const docRef = doc(db, "passwords", "lessonPasswords");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data().passwords || {});
    } else {
      onUpdate({});
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "passwords/lessonPasswords");
  });
}

export async function updatePasswords(passwords: Record<string, string>) {
  try {
    const docRef = doc(db, "passwords", "lessonPasswords");
    await setDoc(docRef, { passwords }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "passwords/lessonPasswords");
  }
}
