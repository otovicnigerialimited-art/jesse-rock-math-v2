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

export const postHomework = async (assignment: Omit<HomeworkAssignment, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'homework'), {
    ...assignment,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const listenToClassHomework = (classCode: string, callback: (homework: HomeworkAssignment[]) => void) => {
  if (!classCode) return () => {};
  
  const q = query(
    collection(db, 'homework'),
    where('classCode', '==', classCode),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const assignments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HomeworkAssignment[];
    callback(assignments);
  });
};

export const deleteHomework = async (id: string) => {
  await deleteDoc(doc(db, 'homework', id));
};
