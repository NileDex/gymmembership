import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "(default)",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // Critical for Enterprise edition
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let isAuthActionPending = false;

export async function signInWithGoogle() {
  if (isAuthActionPending) return;
  isAuthActionPending = true;

  try {
    // We use signInWithRedirect to avoid popup blockers.
    // The Internal Assertion error "Pending promise was never set" usually happens 
    // when multiple auth actions are triggered before the first one completes.
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    isAuthActionPending = false;
    
    // Ignore common errors that don't need to be logged as "Uncaught"
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      return;
    }
    
    console.error("Error signing in with Google", error);
    throw error;
  }
}

export function logout() {
  return signOut(auth);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
