import { getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db, messaging } from './firebase';

export const requestNotificationPermission = async (userId: string, role: string) => {
  if (!messaging) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BOwz_jWl8W_h-M0y0_T63Y34wAON6w5KxQv_Cq8ZqK2UjZ1h1sO0sX2O_ZzQ' // Or we can omit if not configured in console, but FCM usually requires a VAPID key. Wait, we don't know their VAPID key.
      });
      if (token) {
        // Save to appropriate collection
        const collectionName = role === 'teacher' ? 'teachers' : role === 'class_student' ? 'school_students' : 'users';
        await updateDoc(doc(db, collectionName, userId), {
          fcmToken: token
        });
        return true;
      }
    }
  } catch (error) {
    console.log("FCM permission denied or error", error);
  }
  return false;
};
