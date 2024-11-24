<template>
    <div class="statshead" v-if="statItems.length">
        <div class="left">
            <StatItem
                v-for="item in statItems.slice(0, statItems.length - 1)"
                :key="item.cssclass"
                :value="item.value"
                :text="item.text"
                :icon="item.cssclass"
                :image="item.image"
            />
        </div>
        <div class="right">
            <StatItem
                :value="statItems[statItems.length - 1].value"
                :text="statItems[statItems.length - 1].text"
                :icon="statItems[statItems.length - 1].cssclass"
                :image="statItems[statItems.length - 1].image"
            />
        </div>
    </div>
    <div class="statsdates" v-if="date">
        <CalendarSvg />
        {{ date }}
    </div>
</template>

<script setup lang="ts">
import CalendarSvg from '@/assets/icons/calendar.svg'
import { getStats } from '@/requests/stats'
import { onMounted, ref } from 'vue'
import StatItem from './StatItem.vue'

interface StatItem {
    cssclass: string
    value: string
    text: string
    image?: string
}

const props = defineProps<{
    items?: StatItem[]
}>()

const statItems = ref<StatItem[]>([])
const date = ref<string | null>(null)

onMounted(async () => {
    if (props.items) {
        statItems.value = props.items
        return
    }

    const res = await getStats()
    if (res.status == 200) {
        statItems.value = res.data.stats
        date.value = res.data.dates
    }
})
</script>

<style lang="scss">
.statshead {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $larger;
    padding: 1rem;

    .left {
        display: flex;
        flex-wrap: wrap;
        gap: $larger;
    }

    // Special case for the stats cards, viewport is targeted when the flex-wrap happens
    @media only screen and (max-width: 1155px) {
        .left {
            width: 100%;
            flex-wrap: nowrap;

            .statitem {
                flex-shrink: 0;
            }

            .statitem.toptrack {
                flex-shrink: 1;
                width: 100%;
            }
        }
    }

    @include allPhones {
        .left,
        .right {
            .statitem {
                height: auto;
            }
        }

        .left {
            flex-wrap: wrap;

            .statitem {
                width: calc(50% - 1rem);
                aspect-ratio: unset;
                padding-top: 2.5rem;
            }

            .statitem.toptrack {
                width: 100%;
                padding-top: 4.5rem;
            }
        }

        .right {
            width: 100%;

            .statitem.topalbum {
                aspect-ratio: unset;
                width: 100%;
                padding-top: 4.5rem;
            }
        }
    }

    @include mediumPhones {
        gap: $large;

        .left {
            gap: $large;
        }

        .left,
        .right {
            .statitem {
                width: 100%;

                .itemcontent {
                    gap: $smaller;
                }
            }
        }
    }

    .streamduration {
        padding: 1rem;
    }
}

.statsdates {
    display: flex;
    align-items: center;
    gap: $small;
    color: $gray1;
    padding: 1rem;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 900;

    svg {
        width: 1.25rem;
    }
}
</style>
