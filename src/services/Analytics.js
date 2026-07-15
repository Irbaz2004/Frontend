// app/services/analytics.js
// ─────────────────────────────────────────────────────────────────────────
// Tracks two things into Firestore:
//   1. Website visits  -> collection "visits"   + running total in analytics/summary.totalVisits
//   2. App installs     -> collection "installs" + running total in analytics/summary.totalInstalls
//
// Adjust the import path below if your Firebase init file lives somewhere else.
// ─────────────────────────────────────────────────────────────────────────
import { db } from '../Firebase';
import {
    collection,
    addDoc,
    doc,
    setDoc,
    increment,
    serverTimestamp,
} from 'firebase/firestore';

const SUMMARY_DOC_REF = doc(db, 'analytics', 'summary');

/** Stable per-browser-session id, so you can dedupe / group events later if needed. */
function getSessionId() {
    try {
        let id = sessionStorage.getItem('nearzo_session_id');
        if (!id) {
            id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            sessionStorage.setItem('nearzo_session_id', id);
        }
        return id;
    } catch {
        return 'unknown-session';
    }
}

/** Very rough device classification — good enough for dashboards. */
function getDeviceType() {
    const ua = navigator.userAgent || '';
    if (/mobile/i.test(ua) && !/ipad/i.test(ua)) return 'mobile';
    if (/ipad|tablet/i.test(ua)) return 'tablet';
    return 'desktop';
}

/**
 * Call this once per page load (e.g. in LandingPage's mount effect)
 * to log a website visit and bump the running total.
 *
 * @param {string} page - logical page name, e.g. "landing"
 */
export async function trackPageVisit(page = 'landing') {
    try {
        await addDoc(collection(db, 'visits'), {
            page,
            path: window.location.pathname,
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            device: getDeviceType(),
            sessionId: getSessionId(),
            timestamp: serverTimestamp(),
        });

        // setDoc with merge:true creates the summary doc on first ever call,
        // and just increments it on every call after that.
        await setDoc(
            SUMMARY_DOC_REF,
            {
                totalVisits: increment(1),
                lastVisitAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (err) {
        // Never let analytics break the actual app
        console.error('Analytics: failed to track page visit', err);
    }
}

/**
 * Call this whenever a PWA install prompt resolves.
 *
 * @param {'accepted'|'dismissed'} outcome - result of the native install prompt
 * @param {string} source - where the install was triggered from, e.g. "navbar_button", "landing_banner"
 */
export async function trackAppInstall(outcome, source = 'unknown') {
    try {
        await addDoc(collection(db, 'installs'), {
            outcome,
            source,
            userAgent: navigator.userAgent,
            device: getDeviceType(),
            sessionId: getSessionId(),
            timestamp: serverTimestamp(),
        });

        // Only count it toward the "installs" total if the user actually accepted it.
        if (outcome === 'accepted') {
            await setDoc(
                SUMMARY_DOC_REF,
                {
                    totalInstalls: increment(1),
                    lastInstallAt: serverTimestamp(),
                },
                { merge: true }
            );
        }
    } catch (err) {
        console.error('Analytics: failed to track app install', err);
    }
}