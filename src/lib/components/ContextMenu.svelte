<script lang="ts">
    import { contextMenu } from "$lib/stores/ui";
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";

    let menuElement: HTMLDivElement;

    // Close on click outside
    function handleClickOutside(event: MouseEvent) {
        if (
            $contextMenu.visible &&
            menuElement &&
            !menuElement.contains(event.target as Node)
        ) {
            contextMenu.update((m) => ({ ...m, visible: false }));
        }
    }

    // Close on any click (item selection)
    function handleItemClick(action: () => void) {
        action();
        contextMenu.update((m) => ({ ...m, visible: false }));
    }

    onMount(() => {
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    });
</script>

{#if $contextMenu.visible}
    <div
        class="context-menu"
        bind:this={menuElement}
        style="top: {$contextMenu.y}px; left: {$contextMenu.x}px;"
        transition:fade={{ duration: 100 }}
    >
        {#each $contextMenu.items as item}
            <button
                class="menu-item"
                class:danger={item.danger}
                on:click|stopPropagation={() => handleItemClick(item.action)}
            >
                {item.label}
            </button>
        {/each}
    </div>
{/if}

<style>
    .context-menu {
        position: fixed;
        background-color: var(--bg-elevated);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        padding: var(--spacing-xs);
        min-width: 160px;
        box-shadow: var(--shadow-md);
        z-index: 9999;
        display: flex;
        flex-direction: column;
    }

    .menu-item {
        text-align: left;
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: 0.875rem;
        color: var(--text-primary);
        border-radius: var(--radius-sm);
        transition: background-color var(--transition-fast);
    }

    .menu-item:hover {
        background-color: var(--bg-highlight);
    }

    .menu-item.danger {
        color: var(--error-color);
    }

    .menu-item.danger:hover {
        background-color: rgba(241, 94, 108, 0.1);
    }
</style>
