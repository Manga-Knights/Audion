<script lang="ts">
    import type { Track } from "$lib/api/tauri";
    import { formatDuration } from "$lib/api/tauri";
    import { playTracks, currentTrack, isPlaying } from "$lib/stores/player";

    export let tracks: Track[] = [];
    export let title: string = "Tracks";
    export let showAlbum: boolean = true;

    function handleTrackClick(index: number) {
        playTracks(tracks, index);
    }

    function handleTrackDoubleClick(index: number) {
        playTracks(tracks, index);
    }

    function isCurrentTrack(track: Track): boolean {
        return $currentTrack?.id === track.id;
    }
</script>

<div class="track-list">
    <header class="list-header">
        <span class="col-num">#</span>
        <span class="col-title">Title</span>
        {#if showAlbum}
            <span class="col-album">Album</span>
        {/if}
        <span class="col-duration">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path
                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                />
            </svg>
        </span>
    </header>

    <div class="list-body">
        {#each tracks as track, index}
            <button
                class="track-row"
                class:playing={isCurrentTrack(track)}
                on:click={() => handleTrackClick(index)}
                on:dblclick={() => handleTrackDoubleClick(index)}
            >
                <span class="col-num">
                    {#if isCurrentTrack(track) && $isPlaying}
                        <svg
                            class="playing-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="14"
                            height="14"
                        >
                            <path
                                d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                            />
                        </svg>
                    {:else}
                        {index + 1}
                    {/if}
                </span>
                <span class="col-title">
                    <span class="track-name truncate"
                        >{track.title || "Unknown Title"}</span
                    >
                    <span class="track-artist truncate"
                        >{track.artist || "Unknown Artist"}</span
                    >
                </span>
                {#if showAlbum}
                    <span class="col-album truncate">{track.album || "-"}</span>
                {/if}
                <span class="col-duration"
                    >{formatDuration(track.duration)}</span
                >
            </button>
        {:else}
            <div class="empty-state">
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="48"
                    height="48"
                >
                    <path
                        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                    />
                </svg>
                <h3>No tracks found</h3>
                <p>Add a music folder to get started</p>
            </div>
        {/each}
    </div>
</div>

<style>
    .track-list {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .list-header {
        display: grid;
        grid-template-columns: 48px 1fr 1fr 80px;
        gap: var(--spacing-md);
        padding: var(--spacing-sm) var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-subdued);
        position: sticky;
        top: 0;
        background-color: var(--bg-base);
        z-index: 1;
    }

    .list-header.no-album {
        grid-template-columns: 48px 1fr 80px;
    }

    .list-body {
        flex: 1;
        overflow-y: auto;
    }

    .track-row {
        display: grid;
        grid-template-columns: 48px 1fr 1fr 80px;
        gap: var(--spacing-md);
        padding: var(--spacing-sm) var(--spacing-md);
        align-items: center;
        border-radius: var(--radius-sm);
        transition: background-color var(--transition-fast);
        width: 100%;
        text-align: left;
    }

    .track-row:hover {
        background-color: var(--bg-highlight);
    }

    .track-row.playing {
        background-color: var(--bg-surface);
    }

    .track-row.playing .track-name {
        color: var(--accent-primary);
    }

    .col-num {
        text-align: center;
        color: var(--text-subdued);
        font-size: 0.875rem;
    }

    .track-row:hover .col-num:not(:has(.playing-icon)) {
        color: var(--text-primary);
    }

    .playing-icon {
        color: var(--accent-primary);
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    .col-title {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .track-name {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--text-primary);
    }

    .track-artist {
        font-size: 0.8125rem;
        color: var(--text-secondary);
    }

    .col-album {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    .col-album:hover {
        color: var(--text-primary);
        text-decoration: underline;
        cursor: pointer;
    }

    .col-duration {
        text-align: right;
        font-size: 0.875rem;
        color: var(--text-subdued);
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xl);
        color: var(--text-subdued);
        text-align: center;
        gap: var(--spacing-sm);
    }

    .empty-state h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .empty-state p {
        font-size: 0.875rem;
    }
</style>
