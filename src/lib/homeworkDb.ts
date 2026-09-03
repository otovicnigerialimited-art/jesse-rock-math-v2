import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface HomeworkAssignment {
  id?: string;
  teacherId: string;
  classCode: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: any;
  type: string;
}

const LOCAL_STORAGE_KEY_PREFIX = 'jesse_math_homework_';

const getLocalHomework = (classCode: string): HomeworkAssignment[] => {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${classCode.toUpperCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalHomework = (classCode: string, assignments: HomeworkAssignment[]) => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${classCode.toUpperCase()}`, JSON.stringify(assignments));
  } catch (e) {
    console.warn('Failed to save homework locally', e);
  }
};

export const postHomework = async (assignment: Omit<HomeworkAssignment, 'id' | 'createdAt'>) => {
  const normClassCode = assignment.classCode ? assignment.classCode.toUpperCase().trim() : 'DEMO';
  const newAssignment: HomeworkAssignment = {
    ...assignment,
    classCode: normClassCode,
    id: `hw-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now()
  };

  // 1. Immediately cache locally so the UI updates instantly with zero latency
  const currentLocal = getLocalHomework(normClassCode);
  const updatedLocal = [newAssignment, ...currentLocal.filter(a => a.id !== newAssignment.id)];
  saveLocalHomework(normClassCode, updatedLocal);

  // 2. Persist to Firestore
  try {
    const docRef = await addDoc(collection(db, 'homework'), {
      ...assignment,
      classCode: normClassCode,
      createdAt: serverTimestamp()
    });
    newAssignment.id = docRef.id;
    return docRef.id;
  } catch (err: any) {
    console.warn('Firestore write to /homework encountered an issue, stored locally:', err);
    // Also attempt write to homework_assignments collection
    try {
      const docRef2 = await addDoc(collection(db, 'homework_assignments'), {
        ...assignment,
        classCode: normClassCode,
        createdAt: serverTimestamp()
      });
      newAssignment.id = docRef2.id;
      return docRef2.id;
    } catch (err2) {
      console.warn('Firestore fallback write also failed, retaining local copy:', err2);
    }
    return newAssignment.id || 'local-saved';
  }
};

export const listenToClassHomework = (classCode: string, callback: (homework: HomeworkAssignment[]) => void) => {
  if (!classCode) return () => {};
  
  const normClassCode = classCode.toUpperCase().trim();
  
  // Provide immediate cached results first
  const initialLocal = getLocalHomework(normClassCode);
  if (initialLocal.length > 0) {
    callback(initialLocal);
  }

  try {
    const q = query(
      collection(db, 'homework'),
      where('classCode', '==', normClassCode),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const assignments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HomeworkAssignment[];
        
        // Merge with any local assignments
        const merged = [...assignments];
        const existingIds = new Set(assignments.map(a => a.id));
        for (const localItem of initialLocal) {
          if (localItem.id && !existingIds.has(localItem.id)) {
            merged.push(localItem);
          }
        }
        saveLocalHomework(normClassCode, merged);
        callback(merged);
      },
      (error) => {
        console.warn('Firestore homework subscription error, falling back to local storage:', error.message);
        callback(getLocalHomework(normClassCode));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up homework snapshot listener:', err);
    callback(getLocalHomework(normClassCode));
    return () => {};
  }
};

export const deleteHomework = async (id: string, classCode?: string) => {
  if (classCode) {
    const normClassCode = classCode.toUpperCase().trim();
    const current = getLocalHomework(normClassCode);
    saveLocalHomework(normClassCode, current.filter(a => a.id !== id));
  }
  try {
    await deleteDoc(doc(db, 'homework', id));
  } catch (err) {
    console.warn('Error deleting homework doc in firestore:', err);
  }
};

