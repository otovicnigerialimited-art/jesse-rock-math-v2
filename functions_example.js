// TO DEPLOY THIS CLOUD FUNCTION (Requires Blaze Plan):
// 1. Run: npm install -g firebase-tools
// 2. Run: firebase init functions
// 3. Replace functions/index.js with this code.
// 4. Run: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendHomeworkNotification = functions.firestore
  .document('homework/{homeworkId}')
  .onCreate(async (snap, context) => {
    const homework = snap.data();
    
    // Get all students in this class
    const studentsSnapshot = await admin.firestore().collection('school_students')
      .where('classCode', '==', homework.classCode)
      .get();
      
    const tokens = [];
    studentsSnapshot.forEach(doc => {
      const student = doc.data();
      if (student.fcmToken) {
        tokens.push(student.fcmToken);
      }
    });

    if (tokens.length === 0) return null;

    const payload = {
      notification: {
        title: 'New Homework Assigned! 📚',
        body: `${homework.title} is due on ${homework.dueDate}. Tap to start!`,
        icon: 'https://jesse-math-rockstar-app.vercel.app/icon.png',
        clickAction: 'https://jesse-math-rockstar-app.vercel.app/?tab=homework'
      }
    };

    return admin.messaging().sendToDevice(tokens, payload);
  });
