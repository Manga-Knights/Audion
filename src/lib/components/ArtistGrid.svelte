<script lang="ts">
    import type { Artist } from "$lib/api/tauri";
    import { goToArtistDetail } from "$lib/stores/view";

    export let artists: Artist[] = [];

    function handleArtistClick(artist: Artist) {
        goToArtistDetail(artist.name);
    }

    function getArtistInitial(name: string): string {
        return name.charAt(0).toUpperCase();
    }
</script>

<div class="artist-grid">
    {#each artists as artist}
        <button class="artist-card" on:click={() => handleArtistClick(artist)}>
            <div class="artist-avatar">
                <span class="artist-initial"
                    >{getArtistInitial(artist.name)}</span
                >
            </div>
            <div class="artist-info">
                <span class="artist-name truncate">{artist.name}</span>
                <span class="artist-meta"
                    >{artist.album_count} albums • {artist.track_count} songs</span
                >
            </div>
        </button>
    {:else}
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
            </svg>
            <h3>No artists found</h3>
            <p>Add a music folder to see your artists</p>
        </div>
    {/each}
</div>

<style>
    .artist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        padding: var(--spacing-md);
    }

    .artist-card {
        background-color: var(--bg-elevated);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        transition: background-color var(--transition-normal);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-md);
    }

    .artist-card:hover {
        background-color: var(--bg-surface);
    }

    .artist-avatar {
        width: 140px;
        height: 140px;
        border-radius: var(--radius-full);
        background: linear-gradient(
            135deg,
            var(--accent-primary) 0%,
            #1a1a1a 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);
    }

    .artist-initial {
        font-size: 3rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .artist-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        width: 100%;
    }

    .artist-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .artist-meta {
        font-size: 0.8125rem;
        color: var(--text-secondary);
    }

    .empty-state {
        grid-column: 1 / -1;
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
