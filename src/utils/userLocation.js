export const DEFAULT_USER_LOCATION = { latitude: 12.9165, longitude: 79.1325 };

const CACHE_KEY = 'nearzo_user_coords';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const isValidLocation = (location) =>
    Number.isFinite(Number(location?.latitude)) && Number.isFinite(Number(location?.longitude));

export function getCachedUserLocation() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!isValidLocation(parsed) || Date.now() - parsed.time > MAX_AGE_MS) return null;
        return { latitude: Number(parsed.latitude), longitude: Number(parsed.longitude) };
    } catch {
        return null;
    }
}

export function saveCachedUserLocation(location) {
    if (!isValidLocation(location)) return;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            time: Date.now(),
        }));
    } catch {
        // Ignore storage failures.
    }
}
