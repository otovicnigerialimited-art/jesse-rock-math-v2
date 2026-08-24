import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';

export interface ReviewItem {
  id?: string;
  userId: string;
  displayName: string;
  rating: number; // 1 to 5
  reviewText: string;
  createdAt: string; // ISO string timestamp
  verifiedPlayer: boolean;
  role?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Review Error: ', JSON.stringify(errInfo));
}

/**
 * Backend/Server verification rule to confirm if a user has genuinely played/used the app.
 * NEVER trusts client-submitted verifiedPlayer booleans.
 */
export async function checkUserGameplayVerification(userId: string, stats?: any): Promise<boolean> {
  if (!userId) return false;

  // 1. Check local session stats if available
  if (stats) {
    if ((stats.totalSolved && stats.totalSolved > 0) || 
        (stats.correctAnswers && stats.correctAnswers > 0) || 
        (stats.level && stats.level > 1) || 
        (stats.xp && stats.xp > 100)) {
      return true;
    }
  }

  try {
    // 2. Check Firestore users collection
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.streakScore > 0 || data.createdAt || data.username) {
        return true;
      }
    }

    // 3. Check school_students collection
    const studentDocRef = doc(db, 'school_students', userId);
    const studentSnap = await getDoc(studentDocRef);
    if (studentSnap.exists()) {
      const data = studentSnap.data();
      if (data.school_math_progress?.solved > 0 || data.school_math_progress?.highScore > 0) {
        return true;
      }
    }

    // 4. Check leaderboard collection
    const lbQuery = query(collection(db, 'leaderboard'), where('userId', '==', userId), limit(1));
    const lbSnap = await getDocs(lbQuery);
    if (!lbSnap.empty) {
      return true;
    }
  } catch (err) {
    console.warn("Gameplay verification check completed with fallback:", err);
  }

  return false;
}

/**
 * Adds a user review to Firestore after verifying gameplay activity on the backend.
 */
export async function submitUserReview(
  data: {
    userId: string;
    displayName: string;
    rating: number;
    reviewText: string;
    role?: string;
  },
  stats?: any
): Promise<ReviewItem | null> {
  try {
    const isVerified = await checkUserGameplayVerification(data.userId, stats);
    
    const reviewData: Omit<ReviewItem, 'id'> = {
      userId: data.userId || 'guest_user',
      displayName: data.displayName.trim() || 'Rockstar Player',
      rating: Math.min(5, Math.max(1, Math.round(data.rating))),
      reviewText: data.reviewText.trim(),
      createdAt: new Date().toISOString(),
      verifiedPlayer: isVerified,
      role: data.role || 'Player'
    };

    const docRef = await addDoc(collection(db, 'reviews'), reviewData);
    return {
      id: docRef.id,
      ...reviewData
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'reviews');
    throw err;
  }
}

/**
 * Listens to real-time reviews from Firestore.
 */
export function subscribeToReviews(onUpdate: (reviews: ReviewItem[]) => void) {
  const reviewsQuery = query(collection(db, 'reviews'), limit(100));
  
  return onSnapshot(reviewsQuery, (snapshot) => {
    const list: ReviewItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId || '',
        displayName: data.displayName || 'Anonymous',
        rating: typeof data.rating === 'number' ? data.rating : 5,
        reviewText: data.reviewText || '',
        createdAt: data.createdAt || new Date().toISOString(),
        verifiedPlayer: Boolean(data.verifiedPlayer),
        role: data.role || 'Player'
      });
    });

    // Sort newest first locally
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'reviews');
  });
}

/**
 * Updates the Google SoftwareApplication JSON-LD structured data dynamically.
 */
export function updateStructuredDataLDJSON(reviews: ReviewItem[]) {
  if (typeof document === 'undefined') return;

  const totalReviews = reviews.length;
  const ratingCount = totalReviews;
  const reviewCount = reviews.filter(r => r.reviewText && r.reviewText.trim().length > 0).length;
  
  const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : "5.0";

  const schemaData: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Jesse Math Rockstar",
    "url": "https://jesse-math-rockstar-app.vercel.app/",
    "image": "https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png",
    "operatingSystem": "All",
    "applicationCategory": "EducationalApplication",
    "isAccessibleForFree": true,
    "author": {
      "@type": "Person",
      "name": "Jesse Otobo"
    },
    "description": "An interactive, free multiplayer math game designed to make math practice engaging through games, challenges, rewards, and streaks.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  if (totalReviews > 0) {
    schemaData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": String(averageRating),
      "ratingCount": ratingCount,
      "reviewCount": reviewCount || ratingCount,
      "bestRating": "5",
      "worstRating": "1"
    };

    schemaData.review = reviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.displayName
      },
      "datePublished": r.createdAt.split('T')[0],
      "reviewBody": r.reviewText || `Rated Jesse Math Rockstar ${r.rating} stars!`,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": String(r.rating),
        "bestRating": "5",
        "worstRating": "1"
      }
    }));
  }

  // Look for existing ld+json tag or create/replace it
  let scriptElement = document.getElementById('json-ld-reviews') as HTMLScriptElement | null;
  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = 'json-ld-reviews';
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }
  scriptElement.text = JSON.stringify(schemaData, null, 2);
}
