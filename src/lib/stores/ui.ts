import { writable } from 'svelte/store';

export const isFullScreen = writable(false);

export function toggleFullScreen() {
    isFullScreen.update(v => !v);
}

export interface ContextMenu {
    visible: boolean;
    x: number;
    y: number;
    items: {
        label: string;
        action: () => void;
        danger?: boolean;
    }[];
}

export const contextMenu = writable<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    items: []
});
