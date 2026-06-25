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
  apiKey: "AIzaSyDwn0K3scp_8IrL9K8Iy_-XAVxDKIq2UuQ",
  authDomain: "nearzo-f778f.firebaseapp.com",
  projectId: "nearzo-f778f",
  storageBucket: "nearzo-f778f.firebasestorage.app",
  messagingSenderId: "155581311852",
  appId: "1:155581311852:web:aafbb80744fc282e7c2149"
};


// Avoid "Firebase App already exists" error if this file gets imported twice
// or if your AuthContext also calls initializeApp().
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;