/**
 * LRCLIB API provider
 * Primary source for synced lyrics
 */

import { API } from './constants';

export interface LRCLibResult {
    id: number;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string | null;
    syncedLyrics: string | null;
}

export class LRCLib {
    private cache = new Map<string, { data: LRCLibResult[]; timestamp: number }>();
    private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    private getCacheKey(artist: string, title: string): string {
        return `${artist.toLowerCase()}|${title.toLowerCase()}`;
    }

    async search(artist: string, title: string): Promise<LRCLibResult[]> {
        const cacheKey = this.getCacheKey(artist, title);
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log('[LRCLIB] Using cached result');
            return cached.data;
        }

        const query = `${title} ${artist}`.trim();
        const url = `${API.BASE_URL}${API.SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}`;

        console.log(`[LRCLIB] Searching: "${query}"`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data: LRCLibResult[] = await response.json();

            // Cache the result
            this.cache.set(cacheKey, { data, timestamp: Date.now() });

            console.log(`[LRCLIB] Found ${data.length} results`);
            return data;

        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.log('[LRCLIB] Request timed out');
            } else {
                console.log('[LRCLIB] Error:', error);
            }
            return [];
        }
    }

    async get(artist: string, title: string, album?: string, duration?: number): Promise<LRCLibResult | null> {
        const params = new URLSearchParams();
        params.append('artist_name', artist);
        params.append('track_name', title);
        if (album) params.append('album_name', album);
        if (duration) params.append('duration', String(Math.round(duration)));

        const url = `${API.BASE_URL}${API.GET_ENDPOINT}?${params.toString()}`;

        console.log(`[LRCLIB] Getting exact match: "${title}" by "${artist}"`);

        try {
            const response = await fetch(url);

            if (response.status === 404) {
                console.log('[LRCLIB] No exact match found');
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data: LRCLibResult = await response.json();
            return data;

        } catch (error) {
            console.log('[LRCLIB] Error:', error);
            return null;
        }
    }

    findBestMatch(results: LRCLibResult[], artist: string, title: string): LRCLibResult | null {
        if (results.length === 0) return null;

        // Prioritize results with synced lyrics
        const withSynced = results.filter(r => r.syncedLyrics);
        if (withSynced.length > 0) {
            return withSynced[0];
        }

        // Return first result with any lyrics
        const withLyrics = results.filter(r => r.plainLyrics || r.syncedLyrics);
        return withLyrics[0] || results[0];
    }

    async getLyrics(artist: string, title: string, album?: string, duration?: number): Promise<{ synced: string | null; plain: string | null }> {
        // Try exact match first
        const exact = await this.get(artist, title, album, duration);
        if (exact && (exact.syncedLyrics || exact.plainLyrics)) {
            console.log('[LRCLIB] Got exact match');
            return {
                synced: exact.syncedLyrics,
                plain: exact.plainLyrics
            };
        }

        // Fall back to search
        const results = await this.search(artist, title);
        const best = this.findBestMatch(results, artist, title);

        if (best) {
            console.log(`[LRCLIB] Best match: "${best.trackName}" by "${best.artistName}"`);
            return {
                synced: best.syncedLyrics,
                plain: best.plainLyrics
            };
        }

        return { synced: null, plain: null };
    }
}
