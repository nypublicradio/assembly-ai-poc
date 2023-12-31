<script setup>
import { ref, watch, computed } from 'vue'
import {
  useCurrentEpisode,
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useIsPlayerMinimized,
  audioPlayerHeight
} from '~/composables/states'
// had to install howler.js locally and add this import to stop it from breaking the build
import { Howl, Howler } from 'howler'
const { $analytics } = useNuxtApp()
const currentEpisode = useCurrentEpisode()
//console.log('currentEpisode', currentEpisode)
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const isPlayerMinimized = useIsPlayerMinimized()
const showPlayer = ref(false)
const playerRef = ref()
const playerHeight = ref(audioPlayerHeight + 'px')
/*function that updated the global useIsEpisodePlaying */
const updateUseIsEpisodePlaying = e => {
  // $analytics.sendEvent('click_tracking', {
  //   event_category: 'Click Tracking - Audio Player play toggle button',
  //   component: 'Audio Player',
  //   event_label: `playing = ${e}`,
  // })
  isEpisodePlaying.value = e
}
/*function that updated the global useIsPlayerMinimized */
const updateUseIsPlayerMinimized = e => {
  // $analytics.sendEvent('click_tracking', {
  //   event_category: 'Click Tracking - Audio Player minimized',
  //   component: 'Audio Player',
  //   event_label: `minimized = ${e}`,
  // })
  isPlayerMinimized.value = e
}

// data vars to pass to VPersistentPlayer
const currentEpisodeData = computed(
  () => currentEpisode.value?.data[0].attributes
)
const currentEpisodeImage = computed(
  () =>
    currentEpisode.value?.included.find(include => include.type === 'image')
      .attributes
)
const currentEpisodeShow = computed(
  () =>
    currentEpisode.value?.included.find(include => include.type === 'show')
      .attributes
)

let delay = 0
// function that handles the logic for the persistent player to show and hide when the user changes the episode
const switchEpisode = () => {
  showPlayer.value = false
  setTimeout(() => {
    showPlayer.value = true
    delay = 1000
  }, delay)
}

watch(currentEpisode, () => {
  switchEpisode()
})

watch(togglePlayTrigger, () => {
  if (playerRef.value) playerRef.value.togglePlay()
})
let timer = null
let isInitialPing = true
const pingEvent = () => {
  const station = currentEpisodeData.value?.name
    ? currentEpisodeShow.value.name
    : null
  const title = currentEpisodeShow.value?.title
    ? currentEpisodeShow.value.title
    : null
  // $analytics.sendEvent('event_tracking', {
  //   event_category: 'Ping',
  //   component: 'Audio Player',
  //   event_label: `${station} - ${title}`,
  // })
}
watch(isEpisodePlaying, e => {
  if (isInitialPing) {
    pingEvent()
    isInitialPing = false
  }
  if (e) {
    timer = setInterval(() => {
      pingEvent()
    }, 60000)
  } else {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div>
    <transition name="player">
      <v-persistent-player-new
        v-if="showPlayer"
        data-style-mode="dark"
        ref="playerRef"
        :auto-play="true"
        :livestream="true"
        :title="currentEpisodeShow?.title"
        :title-link="currentEpisodeShow?.url"
        :description="currentEpisodeShow?.featured?.title"
        :station="currentEpisodeData?.name"
        image="329534"
        :file="currentEpisodeData?.['mobile-mp3']"
        :show-skip="false"
        :can-minimize="false"
        :can-expand="true"
        :showTrack="false"
        @togglePlay="updateUseIsEpisodePlaying"
        @is-minimized="updateUseIsPlayerMinimized"
      />
    </transition>
  </div>
</template>

<style lang="scss">
// slide in from bottom to top
.player-enter-active {
  transition: transform calc(var(--transition-duration) * 2) ease-out;
}

.player-leave-active {
  transition: transform calc(var(--transition-duration) * 2) ease-in;
}

.player-enter-from,
.player-leave-to {
  transform: translateY(v-bind(playerHeight));
}
</style>
