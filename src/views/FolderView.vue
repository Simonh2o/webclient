<template>
    <div class="folder-view v-scroll-page" style="height: 100%" :class="{ isSmall, isMedium, is_alt_layout }">
        <NoItems
            :flag="folder.tracks.length === 0 && folder.dirs.length === 0"
            :title="folder.query === '' ? 'Folder is empty' : 'No results found'"
            :description="
                folder.query === ''
                    ? 'The folder you are trying to access has no indexed tracks. Please add tracks to this folder and try again'
                    : `
      No tracks or folders in this immediate directory matched the query: '${folder.query}'`
            "
            :icon="FolderSvg"
        />
        <DynamicScroller
            id="contentscroller"
            :items="scrollerItems"
            :min-item-size="64"
            class="scroller"
            style="height: 100%"
        >
            <template #before v-if="is_alt_layout || isMedium || isSmall">
                <Folder />
            </template>

            <template #default="{ item, index, active }">
                <DynamicScrollerItem
                    :item="item"
                    :active="active"
                    :size-dependencies="[item.props]"
                    :data-index="index"
                >
                    <component
                        :is="item.component"
                        :key="index"
                        v-bind="item.props"
                        @playThis="playFromPage(item.props.index - 1)"
                    ></component>
                </DynamicScrollerItem>
            </template>
        </DynamicScroller>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router'

import { isMedium, isSmall, track_limit } from '@/stores/content-width'
import useFolder from '@/stores/pages/folder'
import useQueue from '@/stores/queue'
import useTracklist from '@/stores/queue/tracklist'
import useSettings from '@/stores/settings'

import { dropSources } from '@/enums'
import { Track, subPath } from '@/interfaces'
import { createTrackProps } from '@/utils'
import updatePageTitle from '@/utils/updatePageTitle'

import FolderSvg from '@/assets/icons/folder.svg'
import FolderList from '@/components/FolderView/FolderList.vue'
import Folder from '@/components/nav/Titles/Folder.vue'
import NoItems from '@/components/shared/NoItems.vue'
import SongItem from '@/components/shared/SongItem.vue'
import { xl } from '@/composables/useBreakpoints'
import AlbumsFetcher from '@/components/ArtistView/AlbumsFetcher.vue'
import { getFiles } from '@/requests/folders'

const queue = useQueue()
const folder = useFolder()
const settings = useSettings()
const tracklist = useTracklist()

const is_alt_layout = computed(() => settings.is_alt_layout || !xl)

interface ScrollerItem {
    id: any
    component: typeof FolderList | typeof SongItem | typeof AlbumsFetcher
    props: any
}

class songItem {
    id: string | undefined
    props: any
    component = SongItem

    constructor(track: Track) {
        this.id = track.filepath
        this.props = { ...createTrackProps(track), source: dropSources.folder }
    }
}

const scrollerItems = computed(() => {
    const items: ScrollerItem[] = []

    if (folder.dirs.length) {
        items.push({
            id: 'folder-list',
            component: FolderList,
            props: {
                folders: folder.dirs,
            },
        })
    }

    folder.tracks.forEach(track => {
        items.push(new songItem(track))
    })

    if (folder.tracks.length >= track_limit.value) {
        items.push({
            id: Math.random(),
            component: AlbumsFetcher,
            props: {
                fetch_callback: () => folder.fetchAll(folder.path),
            },
        })
    }

    return items
})

async function playFromPage(index: number) {
    let tracks = folder.allTracks

    if (folder.trackTotal !== folder.allTracks.length) {
        const { tracks: newTracks } = await getFiles(folder.path, 0, -1, true, {
            sorttracksby: folder.trackSortBy,
            tracksort_reverse: folder.trackSortReverse,
            sortfoldersby: folder.folderSortBy,
            foldersort_reverse: folder.folderSortReverse,
        })
        tracks = newTracks
    }

    tracklist.setFromFolder(folder.path, tracks)
    queue.play(index)
}

onBeforeRouteUpdate((to, from) => {
    folder
        .fetchAll(to.params.path as string, true)

        .then(() => {
            folder.resetQuery()
        })
        .then(async () => {
            await nextTick()

            document.getElementById('contentscroller')?.scrollTo({
                top: 0,
            })
        })
})

onBeforeRouteLeave(() => {
    folder.resetAll()
})

onMounted(() => {
    updatePageTitle('Folders')
})
</script>

<style lang="scss">
.folder-view.is_alt_layout {
    .scroller {
        padding-top: 0 !important;
    }

    .scroller > div.vue-recycle-scroller__slot:first-child {
        padding: 1rem 0;
        background-color: $body;
        position: sticky;
        top: 0;
        z-index: 1;
    }
}
</style>
