const memoryCache = new Map();
const inFlight = new Map();

const now = () => Date.now();

const readSession = (key) => {
    try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const writeSession = (key, value) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage can be unavailable in private mode; memory cache still helps.
    }
};

export async function cachedJson(key, fetcher, ttlMs = 15000) {
    const memoryHit = memoryCache.get(key);
    if (memoryHit && now() - memoryHit.time < ttlMs) {
        return memoryHit.data;
    }

    const storageHit = readSession(key);
    if (storageHit && now() - storageHit.time < ttlMs) {
        memoryCache.set(key, storageHit);
        return storageHit.data;
    }

    if (inFlight.has(key)) {
        return inFlight.get(key);
    }

    const request = fetcher()
        .then((data) => {
            const entry = { time: now(), data };
            memoryCache.set(key, entry);
            writeSession(key, entry);
            return data;
        })
        .finally(() => {
            inFlight.delete(key);
        });

    inFlight.set(key, request);
    return request;
}

export function clearFastCache(prefix = 'nearzo:api:') {
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) memoryCache.delete(key);
    }

    try {
        for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
        }
    } catch {
        // Ignore storage cleanup failures.
    }
}
