// Player store - manages audio playback state
import { writable, derived, get } from 'svelte/store';
import type { Track } from '$lib/api/tauri';
import { getAudioSrc } from '$lib/api/tauri';

// Current track
export const currentTrack = writable<Track | null>(null);

// Playing state
export const isPlaying = writable(false);

// Queue
export const queue = writable<Track[]>([]);
export const queueIndex = writable(0);

// Volume (0-1)
export const volume = writable(1);

// Current time and duration
export const currentTime = writable(0);
export const duration = writable(0);

// Shuffle and repeat
export const shuffle = writable(false);
export const repeat = writable<'none' | 'one' | 'all'>('none');

// Audio element reference (set from PlayerBar component)
let audioElement: HTMLAudioElement | null = null;

export function setAudioElement(element: HTMLAudioElement): void {
    audioElement = element;

    // Sync volume
    const vol = get(volume);
    audioElement.volume = vol;

    // Set up event listeners
    audioElement.addEventListener('ended', handleTrackEnd);
    audioElement.addEventListener('timeupdate', () => {
        currentTime.set(audioElement?.currentTime ?? 0);
    });
    audioElement.addEventListener('durationchange', () => {
        duration.set(audioElement?.duration ?? 0);
    });
    audioElement.addEventListener('play', () => isPlaying.set(true));
    audioElement.addEventListener('pause', () => isPlaying.set(false));
}

// Play a specific track
export async function playTrack(track: Track): Promise<void> {
    currentTrack.set(track);

    if (audioElement) {
        try {
            const src = await getAudioSrc(track.path);
            audioElement.src = src;
            await audioElement.play();
        } catch (error) {
            console.error('Failed to play track:', error);
        }
    }
}

// Play a list of tracks starting at index
export function playTracks(tracks: Track[], startIndex: number = 0): void {
    queue.set(tracks);
    queueIndex.set(startIndex);

    if (tracks.length > 0 && startIndex < tracks.length) {
        playTrack(tracks[startIndex]);
    }
}

// Play/Pause toggle
export function togglePlay(): void {
    if (!audioElement) return;

    if (audioElement.paused) {
        audioElement.play().catch(console.error);
    } else {
        audioElement.pause();
    }
}

// Next track
export function nextTrack(): void {
    const q = get(queue);
    let idx = get(queueIndex);
    const rep = get(repeat);
    const shuf = get(shuffle);

    if (q.length === 0) return;

    if (rep === 'one') {
        // Repeat current track
        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(console.error);
        }
        return;
    }

    if (shuf) {
        // Random next track
        idx = Math.floor(Math.random() * q.length);
    } else {
        // Sequential next
        idx = idx + 1;
    }

    if (idx >= q.length) {
        if (rep === 'all') {
            idx = 0;
        } else {
            // Stop at end
            isPlaying.set(false);
            return;
        }
    }

    queueIndex.set(idx);
    playTrack(q[idx]);
}

// Previous track
export function previousTrack(): void {
    const q = get(queue);
    let idx = get(queueIndex);

    if (q.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (audioElement && audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
        return;
    }

    idx = idx - 1;
    if (idx < 0) {
        idx = get(repeat) === 'all' ? q.length - 1 : 0;
    }

    queueIndex.set(idx);
    playTrack(q[idx]);
}

// Seek to position (0-1)
export function seek(position: number): void {
    if (!audioElement) return;
    const dur = audioElement.duration;
    if (dur && isFinite(dur)) {
        audioElement.currentTime = position * dur;
    }
}

// Set volume (0-1)
export function setVolume(vol: number): void {
    volume.set(vol);
    if (audioElement) {
        audioElement.volume = vol;
    }
}

// Toggle shuffle
export function toggleShuffle(): void {
    shuffle.update(s => !s);
}

// Cycle repeat mode
export function cycleRepeat(): void {
    repeat.update(r => {
        if (r === 'none') return 'all';
        if (r === 'all') return 'one';
        return 'none';
    });
}

// Handle track end
function handleTrackEnd(): void {
    nextTrack();
}

// Progress as percentage (0-1)
export const progress = derived(
    [currentTime, duration],
    ([$currentTime, $duration]) => {
        if (!$duration || $duration === 0) return 0;
        return $currentTime / $duration;
    }
);
