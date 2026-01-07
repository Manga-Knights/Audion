<script lang="ts">
    import { currentView } from "$lib/stores/view";
    import { tracks, albums, artists } from "$lib/stores/library";

    import TrackList from "./TrackList.svelte";
    import AlbumGrid from "./AlbumGrid.svelte";
    import AlbumDetail from "./AlbumDetail.svelte";
    import ArtistGrid from "./ArtistGrid.svelte";
    import ArtistDetail from "./ArtistDetail.svelte";
    import PlaylistView from "./PlaylistView.svelte";
    import PlaylistDetail from "./PlaylistDetail.svelte";
</script>

<main class="main-view">
    {#if $currentView.type === "tracks"}
        <div class="view-container">
            <header class="view-header">
                <h1>All Tracks</h1>
            </header>
            <div class="view-content">
                <TrackList tracks={$tracks} showAlbum={true} />
            </div>
        </div>
    {:else if $currentView.type === "albums"}
        <div class="view-container">
            <header class="view-header">
                <h1>Albums</h1>
            </header>
            <div class="view-content">
                <AlbumGrid albums={$albums} />
            </div>
        </div>
    {:else if $currentView.type === "album-detail" && $currentView.id}
        <div class="view-container no-padding">
            <AlbumDetail albumId={$currentView.id} />
        </div>
    {:else if $currentView.type === "artists"}
        <div class="view-container">
            <header class="view-header">
                <h1>Artists</h1>
            </header>
            <div class="view-content">
                <ArtistGrid artists={$artists} />
            </div>
        </div>
    {:else if $currentView.type === "artist-detail" && $currentView.name}
        <div class="view-container no-padding">
            <ArtistDetail artistName={$currentView.name} />
        </div>
    {:else if $currentView.type === "playlists"}
        <div class="view-container no-padding">
            <PlaylistView />
        </div>
    {:else if $currentView.type === "playlist-detail" && $currentView.id}
        <div class="view-container no-padding">
            <PlaylistDetail playlistId={$currentView.id} />
        </div>
    {:else}
        <div class="view-container">
            <div class="empty-state">
                <h2>Select a view from the sidebar</h2>
            </div>
        </div>
    {/if}
</main>

<style>
    .main-view {
        flex: 1;
        overflow: hidden;
        background-color: var(--bg-base);
    }

    .view-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .view-container.no-padding .view-content {
        padding: 0;
    }

    .view-header {
        padding: var(--spacing-lg) var(--spacing-md);
        flex-shrink: 0;
    }

    .view-header h1 {
        font-size: 2rem;
        font-weight: 700;
    }

    .view-content {
        flex: 1;
        overflow-y: auto;
    }

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-subdued);
    }
</style>
