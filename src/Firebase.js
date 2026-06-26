// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────
// Firebase init. SKIP THIS FILE if you already initialize Firebase elsewhere
// (e.g. for Auth in app/context/AuthContext.jsx) — just point analytics.js's
// `import { db } from '../../firebase'` at your existing file instead.
// ─────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Put these in a .env file (Vite: VITE_*, CRA: REACT_APP_*) — never hardcode keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Avoid "Firebase App already exists" error if this file gets imported twice
// or if your AuthContext also calls initializeApp().
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;