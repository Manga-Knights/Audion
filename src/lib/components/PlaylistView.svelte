<script lang="ts">
    import { playlists, loadPlaylists } from "$lib/stores/library";
    import { goToPlaylistDetail } from "$lib/stores/view";
    import { createPlaylist } from "$lib/api/tauri";

    let newPlaylistName = "";
    let isCreating = false;
    let showCreateForm = false;

    async function handleCreatePlaylist() {
        if (!newPlaylistName.trim()) return;

        isCreating = true;
        try {
            await createPlaylist(newPlaylistName.trim());
            await loadPlaylists();
            newPlaylistName = "";
            showCreateForm = false;
        } catch (error) {
            console.error("Failed to create playlist:", error);
        } finally {
            isCreating = false;
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleCreatePlaylist();
        } else if (e.key === "Escape") {
            showCreateForm = false;
            newPlaylistName = "";
        }
    }
</script>

<div class="playlist-view">
    <header class="view-header">
        <h1>Playlists</h1>
        <button
            class="btn-secondary"
            on:click={() => (showCreateForm = !showCreateForm)}
        >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            New Playlist
        </button>
    </header>

    {#if showCreateForm}
        <div class="create-form animate-slide-up">
            <input
                type="text"
                bind:value={newPlaylistName}
                on:keydown={handleKeyDown}
                placeholder="Playlist name..."
                autofocus
            />
            <button
                class="btn-primary"
                on:click={handleCreatePlaylist}
                disabled={isCreating || !newPlaylistName.trim()}
            >
                {isCreating ? "Creating..." : "Create"}
            </button>
            <button
                class="btn-secondary"
                on:click={() => {
                    showCreateForm = false;
                    newPlaylistName = "";
                }}
            >
                Cancel
            </button>
        </div>
    {/if}

    <div class="playlist-grid">
        {#each $playlists as playlist}
            <button
                class="playlist-card"
                on:click={() => goToPlaylistDetail(playlist.id)}
            >
                <div class="playlist-cover">
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="48"
                        height="48"
                    >
                        <path
                            d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
                        />
                    </svg>
                </div>
                <div class="playlist-info">
                    <span class="playlist-name truncate">{playlist.name}</span>
                    <span class="playlist-type">Playlist</span>
                </div>
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
                        d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
                    />
                </svg>
                <h3>No playlists yet</h3>
                <p>Create your first playlist to organize your music</p>
            </div>
        {/each}
    </div>
</div>

<style>
    .playlist-view {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: var(--spacing-md);
    }

    .view-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-lg);
    }

    .view-header h1 {
        font-size: 2rem;
        font-weight: 700;
    }

    .create-form {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
        padding: var(--spacing-md);
        background-color: var(--bg-elevated);
        border-radius: var(--radius-md);
    }

    .create-form input {
        flex: 1;
        padding: var(--spacing-sm) var(--spacing-md);
        background-color: var(--bg-surface);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-color);
    }

    .create-form input:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    .playlist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--spacing-lg);
        flex: 1;
        overflow-y: auto;
    }

    .playlist-card {
        background-color: var(--bg-elevated);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        transition: background-color var(--transition-normal);
        text-align: left;
    }

    .playlist-card:hover {
        background-color: var(--bg-surface);
    }

    .playlist-cover {
        width: 100%;
        aspect-ratio: 1;
        border-radius: var(--radius-sm);
        background: linear-gradient(
            135deg,
            var(--bg-highlight) 0%,
            var(--bg-surface) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-subdued);
        margin-bottom: var(--spacing-md);
        box-shadow: var(--shadow-md);
    }

    .playlist-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .playlist-name {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .playlist-type {
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
