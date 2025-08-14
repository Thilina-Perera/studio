
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'reimburseai-7st5r',
  appId: '1:1898523107:web:035c2d98bafd0f43e1d8d6',
  storageBucket: 'reimburseai-7st5r.appspot.com',
  apiKey: 'AIzaSyD8Op8xh9i0LQ8syRy_Egb-UNk2oMfMBZw',
  authDomain: 'reimburseai-7st5r.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '1898523107',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
