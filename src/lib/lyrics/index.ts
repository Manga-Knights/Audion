/**
 * Lyrics Manager
 * Combines LRCLIB and Musixmatch to fetch lyrics
 */

import { LRCLib } from './lrclib';
import { Musixmatch } from './musixmatch';
import { FILTER_WORDS } from './constants';

export interface LyricLine {
    time: number;
    text: string;
    words?: { word: string; time: number }[];
}

export interface LyricsResult {
    lines: LyricLine[];
    source: 'lrclib' | 'musixmatch' | 'cache';
    hasWordSync: boolean;
    raw: string;
}

class LyricsManager {
    private lrclib = new LRCLib();
    private musixmatch = new Musixmatch(null, true); // enhanced for word-by-word

    /**
     * Parse LRC format string into structured lyrics
     */
    parseLRC(lrcString: string): LyricLine[] {
        if (!lrcString) return [];

        const lines = lrcString.split('\n');
        const lyrics: LyricLine[] = [];

        for (const line of lines) {
            // Match [mm:ss.xx] or [mm:ss]
            const match = line.match(/\[(\d+):(\d+)\.?(\d+)?\]\s*(.*)/);
            if (!match) continue;

            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const centiseconds = match[3] ? parseInt(match[3].padEnd(2, '0')) : 0;
            const text = match[4].trim();

            if (!text) continue;

            const time = minutes * 60 + seconds + centiseconds / 100;
            const lyricLine: LyricLine = { time, text };

            // Parse word-level timing if present: <mm:ss.xx>word
            const wordTimings = this.parseWordTimings(text, time);
            if (wordTimings.length > 0 && wordTimings.some(w => w.time !== time)) {
                lyricLine.words = wordTimings;
                // Clean text from timing tags
                lyricLine.text = wordTimings.map(w => w.word).join(' ');
            }

            lyrics.push(lyricLine);
        }

        return lyrics.sort((a, b) => a.time - b.time);
    }

    /**
     * Parse word-level timings from enhanced LRC
     */
    private parseWordTimings(text: string, lineTime: number): { word: string; time: number }[] {
        const words: { word: string; time: number }[] = [];
        const regex = /<(\d+):(\d+)\.(\d+)>([^<]+)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const centiseconds = parseInt(match[3].padEnd(2, '0'));
            const word = match[4].trim();

            words.push({
                word,
                time: minutes * 60 + seconds + centiseconds / 100
            });
        }

        return words;
    }

    /**
     * Clean title for better search results
     */
    cleanTitle(title: string): string {
        if (!title) return '';

        let cleaned = title.toLowerCase();

        // Remove common video markers in brackets
        cleaned = cleaned.replace(/\[.*?(?:official|lyric|lyrics|video|audio|mv|music|hd|4k).*?\]/gi, '');
        cleaned = cleaned.replace(/\(.*?(?:official|lyric|lyrics|video|audio|mv|music|hd|4k).*?\)/gi, '');

        // Remove filter words
        const filterSet = new Set(FILTER_WORDS.BASIC.map(w => w.toLowerCase()));
        cleaned = cleaned.split(/\s+/)
            .filter(word => !filterSet.has(word))
            .join(' ');

        return cleaned.trim();
    }

    /**
     * Fetch lyrics from all sources
     */
    async fetchLyrics(
        title: string | null,
        artist: string | null,
        album?: string | null,
        duration?: number | null
    ): Promise<LyricsResult | null> {
        const cleanedTitle = this.cleanTitle(title || '');
        const cleanedArtist = artist || 'Unknown Artist';

        if (!cleanedTitle) {
            console.log('[LyricsManager] No title provided');
            return null;
        }

        console.log(`[LyricsManager] Fetching lyrics for: "${cleanedTitle}" by "${cleanedArtist}"`);

        // Try LRCLIB first (free, fast, reliable)
        try {
            const lrcResult = await this.lrclib.getLyrics(
                cleanedArtist,
                cleanedTitle,
                album || undefined,
                duration || undefined
            );

            if (lrcResult.synced) {
                console.log('[LyricsManager] Got synced lyrics from LRCLIB');
                const lines = this.parseLRC(lrcResult.synced);
                return {
                    lines,
                    source: 'lrclib',
                    hasWordSync: false,
                    raw: lrcResult.synced
                };
            }
        } catch (error) {
            console.log('[LyricsManager] LRCLIB error:', error);
        }

        // Try Musixmatch as fallback
        try {
            const searchTerm = `${cleanedTitle} ${cleanedArtist}`;
            const mxResult = await this.musixmatch.getLrc(searchTerm);

            if (mxResult?.synced) {
                console.log('[LyricsManager] Got lyrics from Musixmatch');
                const lines = this.parseLRC(mxResult.synced);
                const hasWordSync = lines.some(l => l.words && l.words.length > 0);

                return {
                    lines,
                    source: 'musixmatch',
                    hasWordSync,
                    raw: mxResult.synced
                };
            }
        } catch (error) {
            console.log('[LyricsManager] Musixmatch error:', error);
        }

        console.log('[LyricsManager] No lyrics found');
        return null;
    }
}

// Export singleton instance
export const lyricsManager = new LyricsManager();

// Re-export types
export { LRCLib } from './lrclib';
export { Musixmatch } from './musixmatch';
