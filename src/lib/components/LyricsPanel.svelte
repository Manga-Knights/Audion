<script lang="ts">
    import { onMount } from "svelte";
    import {
        lyricsData,
        lyricsLoading,
        lyricsError,
        lyricsVisible,
        activeLine,
        initLyricsSync,
        destroyLyricsSync,
    } from "$lib/stores/lyrics";
    import { currentTrack } from "$lib/stores/player";

    let lyricsContainer: HTMLDivElement;
    let lineElements: HTMLDivElement[] = [];

    // Scroll to active line
    $: if ($activeLine >= 0 && lineElements[$activeLine] && lyricsContainer) {
        const element = lineElements[$activeLine];
        const containerHeight = lyricsContainer.clientHeight;
        const elementTop = element.offsetTop;
        const elementHeight = element.clientHeight;

        // Center the active line
        const scrollTo = elementTop - containerHeight / 2 + elementHeight / 2;
        lyricsContainer.scrollTo({
            top: scrollTo,
            behavior: "smooth",
        });
    }

    onMount(() => {
        initLyricsSync();
        return () => destroyLyricsSync();
    });
</script>

{#if $lyricsVisible}
    <aside class="lyrics-panel">
        <header class="lyrics-header">
            <h3>Lyrics</h3>
            <button class="close-btn" on:click={() => lyricsVisible.set(false)}>
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                >
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                </svg>
            </button>
        </header>

        <div class="lyrics-content" bind:this={lyricsContainer}>
            {#if $lyricsLoading}
                <div class="lyrics-status">
                    <div class="loading-spinner"></div>
                    <span>Searching for lyrics...</span>
                </div>
            {:else if $lyricsError && !$lyricsData}
                <div class="lyrics-status">
                    <svg
                        viewBox="0 0 24 24"
                        width="48"
                        height="48"
                        fill="currentColor"
                    >
                        <path
                            d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        />
                    </svg>
                    <span>No lyrics found</span>
                    {#if $currentTrack}
                        <span class="lyrics-track-info">
                            {$currentTrack.title || "Unknown"} - {$currentTrack.artist ||
                                "Unknown"}
                        </span>
                    {/if}
                </div>
            {:else if $lyricsData && $lyricsData.lines.length > 0}
                <div class="lyrics-lines">
                    {#each $lyricsData.lines as line, i}
                        {@const distance = Math.abs(i - $activeLine)}
                        <div
                            class="lyric-line"
                            class:active={i === $activeLine}
                            class:near={distance === 1}
                            class:mid={distance === 2}
                            class:far={distance >= 3}
                            class:past={i < $activeLine}
                            bind:this={lineElements[i]}
                        >
                            {#if line.words && line.words.length > 0}
                                {#each line.words as word}
                                    <span class="lyric-word">{word.word} </span>
                                {/each}
                            {:else}
                                {line.text}
                            {/if}
                        </div>
                    {/each}
                </div>
            {:else if !$currentTrack}
                <div class="lyrics-status">
                    <svg
                        viewBox="0 0 24 24"
                        width="48"
                        height="48"
                        fill="currentColor"
                    >
                        <path
                            d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        />
                    </svg>
                    <span>Play a track to see lyrics</span>
                </div>
            {/if}
        </div>

        {#if $lyricsData}
            <footer class="lyrics-footer">
                <span class="lyrics-source">
                    Source: {$lyricsData.source === "cache"
                        ? "Cached"
                        : $lyricsData.source === "lrclib"
                          ? "LRCLIB"
                          : "Musixmatch"}
                </span>
            </footer>
        {/if}
    </aside>
{/if}

<style>
    .lyrics-panel {
        width: 350px;
        min-width: 300px;
        max-width: 400px;
        height: 100%;
        background: linear-gradient(
            180deg,
            var(--bg-elevated) 0%,
            var(--bg-base) 100%
        );
        border-left: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .lyrics-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }

    .lyrics-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--radius-full);
        color: var(--text-secondary);
        transition: all var(--transition-fast);
    }

    .close-btn:hover {
        color: var(--text-primary);
        background-color: var(--bg-highlight);
    }

    .lyrics-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-xl) var(--spacing-md);
        scroll-behavior: smooth;
    }

    .lyrics-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: var(--spacing-md);
        color: var(--text-subdued);
        text-align: center;
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--bg-highlight);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .lyrics-track-info {
        font-size: 0.75rem;
        opacity: 0.7;
        margin-top: var(--spacing-sm);
    }

    .lyrics-lines {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        padding-bottom: 50%;
        padding-top: var(--spacing-xl);
    }

    .lyric-line {
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.4);
        transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
        cursor: default;
        filter: blur(0px);
    }

    /* Distance-based blur effect like Apple Music */
    .lyric-line.near {
        color: rgba(255, 255, 255, 0.5);
        filter: blur(0.5px);
    }

    .lyric-line.mid {
        color: rgba(255, 255, 255, 0.35);
        filter: blur(1px);
    }

    .lyric-line.far {
        color: rgba(255, 255, 255, 0.25);
        filter: blur(1.5px);
    }

    .lyric-line.active {
        color: var(--text-primary);
        font-size: 1.35rem;
        font-weight: 700;
        filter: blur(0px);
        transform: scale(1.02);
    }

    .lyric-line.past.near {
        color: rgba(255, 255, 255, 0.45);
        filter: blur(0.8px);
    }

    .lyric-line.past.mid {
        color: rgba(255, 255, 255, 0.3);
        filter: blur(1.2px);
    }

    .lyric-line.past.far {
        color: rgba(255, 255, 255, 0.2);
        filter: blur(2px);
    }

    .lyric-word {
        display: inline;
        transition: color 0.15s ease;
    }

    .lyrics-footer {
        padding: var(--spacing-sm) var(--spacing-md);
        border-top: 1px solid var(--border-color);
        flex-shrink: 0;
    }

    .lyrics-source {
        font-size: 0.7rem;
        color: var(--text-subdued);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
