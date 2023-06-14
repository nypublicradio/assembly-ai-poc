<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Howl, Howler } from 'howler'
import { useSwipe } from '@vueuse/core'
import soundAnimGif from '/audioAnim.gif'

const props = defineProps({
  autoPlay: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: null
  },
  descriptionLink: {
    type: String,
    default: null
  },
  file: {
    type: String,
    default: null
  },
  livestream: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  showDownload: {
    type: Boolean,
    default: false
  },
  showSkip: {
    type: Boolean,
    default: true
  },
  hideDownloadMobile: {
    type: Boolean,
    default: true
  },
  hideSkipMobile: {
    type: Boolean,
    default: true
  },
  showTrack: {
    type: Boolean,
    default: true
  },
  station: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: null
  },
  titleLink: {
    type: String,
    default: null
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  canMinimize: {
    type: Boolean,
    default: false
  },
  canExpand: {
    type: Boolean,
    default: false
  },
  canExpandWithSwipe: {
    type: Boolean,
    default: false
  },
  canUnexpandWithSwipe: {
    type: Boolean,
    default: false
  },
  volume: {
    type: Number,
    default: 100
  }
})
let interval = null
const currentSeconds = ref(0)
const durationSeconds = ref(0)

const buffered = ref(0)
const volume = ref(props.volume)

const loading = ref(props.isLoading)
const playing = ref(null)
const muted = ref(props.isMuted)
const currentFile = ref(null)

const isMinimized = ref(false)
const isExpanded = ref(false)
const showCaptions = ref(false)

let sound = null

const emit = defineEmits([
  'togglePlay',
  'volume-toggle-mute',
  'volume-change',
  'load-error',
  'ahead-15',
  'back-15',
  'scrub-timeline-change',
  'scrub-timeline-end',
  'download',
  'image-click',
  'description-click',
  'title-click',
  'sound-ended',
  'sound-loaded',
  'sound-looping',
  'timeline-click',
  'is-minimized',
  'is-expanded',
  'swipe-up',
  'swipe-down'
])

//swipe setup
const playerRef = ref(null)
const { direction, lengthY } = useSwipe(playerRef, {
  passive: true,
  onSwipe() {
    if (props.canExpand && props.canExpandWithSwipe) {
      if (direction.value === 'up' && lengthY.value > 100) {
        isExpanded.value = true
        emit('swipe-up')
      }
    }
    if (props.canExpand && props.canUnexpandWithSwipe) {
      if (direction.value === 'down' && lengthY.value < -100) {
        isExpanded.value = false
        emit('swipe-down')
      }
    }
  }
})

onMounted(() => {
  // keyboard accessibility
  window.addEventListener('keydown', event => {
    switch (event.code) {
      case 'ArrowUp':
        if (volume.value < 100 && sound) {
          volume.value++
        }
        break
      case 'ArrowDown':
        if (volume.value > 0 && sound) {
          volume.value--
        }
        break
      case 'ArrowLeft':
        goBack15()
        break
      case 'ArrowRight':
        goAhead15()
        break
    }
  })

  /*   window.addEventListener('keyup', (event) => {
    // checks to see if the play-button is focused/active element, because then, hitting the Space or Enter key will toggle play by simulating a click as a normal browser feature... thus, we can bypass the following keyup event listeners in that case.
    var isPlayButtonActive =
      document.getElementsByClassName('the-play-button')[0] ===
      document.activeElement
    if (!isPlayButtonActive) {
      switch (event.code) {
        case 'Space':
          togglePlay()
          break
        case 'Enter':
          togglePlay()
          break
      }
    }
  }) */

  // auto play
  props.autoPlay ? togglePlay() : null
})

onBeforeUnmount(() => {
  // stop the audio
  sound ? sound.unload() : null
})

const convertTime = val => {
  const hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
  return hhmmss.indexOf('00:') === 0 ? hhmmss.substr(3) : hhmmss
}
const download = () => {
  emit('download')
  window.open(props.file, '_blank')
}
const goAhead15 = () => {
  if (sound) {
    emit('ahead-15')
    sound.seek(sound.seek() + 15)
    updateCurrentSeconds()
  }
}
const goBack15 = () => {
  if (sound) {
    emit('back-15')
    sound.seek() > 15 ? sound.seek(sound.seek() - 15) : sound.seek(0.1)
    updateCurrentSeconds()
  }
}

const togglePlay = () => {
  if (!sound || !currentFile.value === props.file) {
    // destoy old sound if one exists
    sound ? sound.unload() : null
    currentFile.value = props.file
    loading.value = true
    sound = new Howl({
      src: [props.file],
      html5: true,
      preload: true,
      onload: function () {
        emit('sound-loaded')
        loading.value = false
        durationSeconds.value = sound.duration()
      },
      onloaderror: function (id, errorCode) {
        emit('load-error', [id, errorCode])
      },
      onend: function () {
        emit('sound-ended')
        if (props.loop) {
          emit('sound-looping')
          sound.seek(0.1)
          sound.play()
        } else {
          sound.unload()
        }
      }
    })
  }
  // Play or pause the sound.
  if (sound && sound.playing()) {
    emit('togglePlay', false)
    playing.value = false
    sound.pause()
    clearDurationInterval()
  } else {
    playing.value = true
    emit('togglePlay', true)
    startDurationInterval()
    sound.play()
  }
  // Change global volume init
  Howler.volume(volume.value)
}

const volumeToggleMute = e => {
  emit('volume-toggle-mute', e)
  muted.value = !muted.value
  sound.mute(muted.value)
}

const volumeChange = e => {
  if (sound) {
    emit('volume-change', e)
    sound.volume(e / 100)
    volume.value = e
  }
}
const updateCurrentSeconds = () => {
  currentSeconds.value = sound.seek()
}

const startDurationInterval = () => {
  interval = setInterval(() => {
    updateCurrentSeconds()
  }, 1000)
}
const clearDurationInterval = () => {
  clearInterval(interval)
}

let onceFlag = null
let scrubWhenPaused = false
const scrubTimelineEnd = e => {
  emit('scrub-timeline-end', e)
  const percentUnit = durationSeconds.value / 100
  sound.seek(e * percentUnit)
  if (!scrubWhenPaused && !playing.value) {
    togglePlay()
  } else {
    // to update the time
    updateCurrentSeconds()
  }
  onceFlag = null
}
const scrubTimelineChange = e => {
  // update currentSeconds from the Slider change event, that passes the value to the Slider.
  currentSeconds.value = (e * durationSeconds.value) / 100
  if (!onceFlag) {
    emit('scrub-timeline-change', e)
    onceFlag = true
    if (playing.value) {
      togglePlay()
      scrubWhenPaused = false
    } else {
      scrubWhenPaused = true
    }
  }
}

const timelineClick = e => {
  emit('timeline-click', e)
  scrubTimelineEnd(e)
}
// exposed method to handle the minimize toggle
const toggleMinimize = e => {
  emit('is-minimized', e)
  isMinimized.value = e
}
const toggleExpanded = e => {
  emit('is-expanded', e)
  isExpanded.value = e
}

defineExpose({
  togglePlay,
  toggleMinimize
})
</script>

<template>
  <div
    ref="playerRef"
    class="persistent-player"
    :class="[{ minimized: isMinimized }, { expanded: isExpanded }]"
  >
    <div v-if="props.canMinimize" class="maximize-btn-holder">
      <Button
        title="maximize Player"
        class="maximize-btn p-button-icon-only"
        :class="{ show: isMinimized }"
        aria-label="maximize player"
        @click="toggleMinimize(!isMinimized)"
      >
        <img v-if="playing" :src="soundAnimGif" alt="sounds wave animation" />
        <slot v-else name="chevronUp"><i class="pi pi-chevron-up"></i></slot>
      </Button>
    </div>
    <div class="player-container">
      <div class="player-controls">
        <v-track-info
          :livestream="props.livestream"
          :station="props.station"
          :image="props.image"
          :title="props.title"
          :title-link="props.titleLink"
          :description="props.description"
          :description-link="props.descriptionLink"
          :buffered="buffered"
          :current-seconds="currentSeconds"
          :duration-seconds="durationSeconds"
          @scrub-timeline-change="scrubTimelineChange"
          @scrub-timeline-end="scrubTimelineEnd"
          @timeline-click="timelineClick"
          @image-click="emit('image-click')"
          @description-click="emit('description-click')"
          @title-click="emit('title-click')"
        />
        <v-volume-control
          class="hideOnMobile"
          :disabled="!currentFile"
          :volume="volume"
          :is-muted="muted"
          @volume-toggle-mute="volumeToggleMute"
          @volume-change="volumeChange"
        >
          <template #volumeOn>
            <slot name="volumeOn"></slot>
          </template>
          <template #volumeOff>
            <slot name="volumeOff"></slot>
          </template>
        </v-volume-control>
        <Button
          title="toggle closed captioning"
          class="closed-caption-icon p-button-icon-only p-button-text p-button-secondary"
          :class="{ [`hideOnMobile`]: props.hideSkipMobile }"
          aria-label="toggle closed captioning"
          @click="showCaptions = !showCaptions"
        >
          <slot name="captions">
            <svg
              v-if="!showCaptions"
              class="closed-caption-icon"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <defs></defs>
              <path
                class="cls-1"
                d="m18.21,13.88c-.68.39-1.41.42-1.99.08-.7-.41-1.1-1.28-1.1-2.38s.4-1.97,1.1-2.38c.58-.34,1.3-.31,1.99.08.25.14.54.18.82.1.28-.08.51-.26.66-.51s.18-.54.1-.82-.26-.51-.51-.66c-1.37-.78-2.88-.81-4.14-.08-1.37.8-2.19,2.39-2.19,4.26s.82,3.46,2.2,4.26c.61.35,1.28.53,1.96.53.73,0,1.47-.2,2.18-.6.52-.3.7-.96.41-1.48-.29-.52-.96-.7-1.48-.41Z"
              />
              <path
                class="cls-1"
                d="m7.39,9.2c.58-.34,1.31-.31,1.99.08.52.29,1.18.12,1.48-.4.3-.52.11-1.18-.4-1.48-1.37-.78-2.88-.81-4.14-.08-1.37.8-2.19,2.39-2.19,4.26s.82,3.46,2.2,4.26c.61.35,1.28.53,1.96.53.73,0,1.47-.2,2.18-.6.25-.14.43-.38.51-.65s.04-.57-.1-.82c-.3-.52-.96-.7-1.48-.41-.68.39-1.4.42-1.99.08-.7-.41-1.1-1.28-1.1-2.38s.4-1.97,1.1-2.38Z"
              />
              <path
                class="cls-1"
                d="m19.93,1.96H4.02s-.22,0-.22,0C1.67,2.08,0,3.85,0,5.99v11.19C0,19.4,1.8,21.21,4.02,21.21h15.9c2.22,0,4.03-1.81,4.03-4.03V5.99c0-2.22-1.81-4.03-4.03-4.03Zm1.86,15.22c0,1.03-.83,1.86-1.86,1.86H4.02c-1.03,0-1.86-.83-1.86-1.86V5.99c0-.96.75-1.78,1.7-1.85h.16s15.9,0,15.9,0c1.03,0,1.86.83,1.86,1.86v11.19Z"
              />
            </svg>
            <svg
              v-else
              class="closed-caption-icon"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <defs></defs>
              <path
                class="cls-1"
                d="m19.93,1.96H4.02s-.22,0-.22,0C1.67,2.08,0,3.85,0,5.99v11.19C0,19.4,1.8,21.21,4.02,21.21h15.9c2.22,0,4.03-1.81,4.03-4.03V5.99c0-2.22-1.81-4.03-4.03-4.03ZM7.39,13.96c.58.34,1.31.31,1.99-.08.52-.29,1.18-.11,1.48.41.14.25.18.54.1.82s-.26.51-.51.65c-.71.4-1.45.6-2.18.6-.68,0-1.35-.18-1.96-.53-1.37-.8-2.2-2.39-2.2-4.26s.82-3.46,2.19-4.26c1.26-.73,2.77-.7,4.14.08.52.3.7.96.4,1.48-.3.52-.96.7-1.48.4-.68-.39-1.41-.42-1.99-.08-.7.41-1.1,1.27-1.1,2.38s.4,1.97,1.1,2.38Zm11.89,1.81c-.71.4-1.45.6-2.18.6-.68,0-1.35-.18-1.96-.53-1.38-.8-2.2-2.39-2.2-4.26s.82-3.46,2.19-4.26c1.26-.73,2.77-.7,4.14.08.25.14.43.38.51.66s.04.57-.1.82-.38.43-.66.51c-.28.08-.57.04-.82-.1-.68-.39-1.41-.42-1.99-.08-.7.41-1.1,1.27-1.1,2.38s.4,1.97,1.1,2.38c.58.34,1.31.31,1.99-.08.52-.29,1.18-.11,1.48.41.29.52.11,1.18-.41,1.48Z"
              />
            </svg>
          </slot>
        </Button>
        <Button
          v-if="props.showSkip && !props.livestream"
          title="Go Back 15 Seconds"
          class="player-back-15-icon p-button-icon-only p-button-text p-button-secondary"
          :class="{ [`hideOnMobile`]: props.hideSkipMobile }"
          aria-label="go back 15 seconds"
          @click="goBack15"
        >
          <slot name="prev"><i class="pi pi-replay"></i></slot>
        </Button>
        <Button
          :disabled="loading"
          :title="playing ? 'Pause' : props.livestream ? 'Listen Live' : 'Play'"
          class="the-play-button play-button p-button-icon-only"
          :aria-label="playing ? 'Pause button' : 'Play button'"
          @click="togglePlay"
        >
          <slot v-if="!playing && !loading" name="play"
            ><i class="pi pi-play"></i
          ></slot>
          <slot v-if="playing && !loading" name="pause"
            ><i class="pi pi-pause"></i
          ></slot>
          <slot v-if="loading" name="loading"
            ><i class="pi pi-spin pi-spinner"></i
          ></slot>
        </Button>
        <Button
          v-if="props.showSkip && !props.livestream"
          title="Go Ahead 15 Seconds"
          class="player-ahead-15-icon p-button-icon-only p-button-text p-button-secondary"
          :class="{ [`hideOnMobile`]: props.hideSkipMobile }"
          aria-label="go ahead 15 seconds"
          @click="goAhead15"
        >
          <slot name="skip">
            <i class="pi pi-refresh"></i>
          </slot>
        </Button>
        <Button
          v-if="props.showDownload && !props.livestream"
          title="Download"
          tabindex="0"
          class="player-download-icon p-button-icon-only p-button-text p-button-secondary"
          :class="{ [`hideOnMobile`]: props.hideDownloadMobile }"
          aria-label="download"
          @click="download"
          @keypress.space.enter="download"
        >
          <slot name="download">
            <i class="pi pi-download download-icon"></i>
          </slot>
        </Button>
        <Button
          v-if="props.canMinimize"
          title="Minimize Player"
          class="minimize-btn p-button-icon-only p-button-text p-button-secondary"
          aria-label="minimize player"
          @click="toggleMinimize(!isMinimized)"
        >
          <slot name="chevronDown">
            <i class="pi pi-chevron-down"></i>
          </slot>
        </Button>
        <Button
          v-if="props.canExpand && !isExpanded"
          title="Expand Player"
          class="expand-btn p-button-icon-only p-button-text p-button-secondary"
          :class="{ show: isExpanded }"
          aria-label="expand player"
          @click="toggleExpanded(!isExpanded)"
        >
          <slot name="chevronUp"><i class="pi pi-chevron-up"></i></slot>
        </Button>
      </div>
      <Transition name="expand">
        <livestream-closed-captions v-if="showCaptions" :playing="playing" />
      </Transition>
    </div>
    <Transition name="expand-delay">
      <div
        v-if="isExpanded"
        class="expanded-view"
        :class="!showCaptions ? 'no-captions' : ''"
      >
        <div class="expanded-content-holder">
          <div class="header">
            <slot name="expanded-header">
              <div class="flex">
                <Button
                  class="p-button-icon-only p-button-text p-button-secondary"
                  @click="toggleExpanded(!isExpanded)"
                >
                  <slot name="unexpanded-button-icon">
                    <i class="pi pi-chevron-down" />
                  </slot>
                </Button>
                <div class="header-content">
                  <slot name="header-content"></slot>
                </div>
              </div>
            </slot>
          </div>
          <slot name="expanded-content">
            <livestream-transcript />
          </slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
$container-breakpoint-md: useBreakpointOrFallback('md', 768px);

.persistent-player {
  container-type: inline-size;
  bottom: 0;
  left: 0;
  height: var(--persistent-player-height);
  position: fixed;
  z-index: 999;
  width: 100%;
  padding: 8px 16px 8px 8px;
  color: var(--text-color);
  background-color: var(--darkblue);
  transition: bottom 0.25s, height calc(var(--transition-duration) * 2);
  -webkit-transition: bottom 0.25s, height calc(var(--transition-duration) * 2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  .closed-caption-icon {
    margin-left: -9px;
    height: 17px;
    margin-top: 1px;
    width: 20px;
    svg path {
      fill: white;
    }
  }
  &.minimized {
    bottom: calc(
      calc(var(--persistent-player-height) * -1) -
        var(--persistent-player-height-buffer)
    );
  }
  &.expanded {
    top: 0;
    height: 100%;
  }
  .p-button:focus {
    box-shadow: none !important;
  }
  .maximize-btn-holder {
    position: absolute;
    display: block;
    right: 0;
    left: 0;
    margin: auto;
    top: calc(-40px - var(--persistent-player-height-buffer));
    width: 40px;
    height: 40px;
    overflow: hidden;

    .maximize-btn.p-button {
      position: absolute;
      display: block;
      right: 0px;
      top: 44px;
      padding: 0.4rem 0.2rem !important;
      width: 40px;
      height: 40px;
      border-radius: 4px 4px 0 0;
      background-color: var(--persistent-player-maximize-btn-bg);
      pointer-events: none;
      transition: top 0.1s;
      -webkit-transition: top 0.1s;
      color: var(--persistent-player-maximize-btn-color);
      &.show {
        transition: top 0.5s;
        -webkit-transition: top 0.5s;
        top: 1px;
        pointer-events: all;
      }

      &:hover {
        background-color: var(--persistent-player-maximize-btn-bg-hover);
      }

      .pi {
        font-size: 0.7rem;
      }

      img {
        width: 100%;
        height: auto;
      }
    }
  }

  .player-controls {
    display: flex;
    align-items: center;
    gap: 16px;

    .play-button {
      min-width: var(--persistent-player-play-button-width);
      min-height: var(--persistent-player-play-button-height);
      border-radius: var(--persistent-player-play-button-radius);
    }
    .minimize-btn,
    .expand-btn {
      position: absolute;
      right: 0;
      left: 0;
      margin: auto;
      top: 3px;
      padding: 0.4rem 0.2rem !important;
      background-color: var(--persistent-player-minimize-btn-bg);
      color: var(--persistent-player-minimize-btn-color);
      .pi {
        font-size: 0.7rem;
      }
    }
    .p-button-text {
      border-radius: var(--persistent-player-text-button-radius);
      color: var(--persistent-player-text-button-color);
      &:hover {
        color: var(--persistent-player-text-button-color-hover) !important;
      }
    }
  }

  a,
  a:visited,
  a:active {
    color: var(--persistent-player-text-button-color);

    text-decoration: none;

    &:hover {
      text-decoration: none;
      color: var(--persistent-player-text-button-color-hover) !important;
    }
  }
  .player-container {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 99;
    background: var(--darkblue);
  }
  .expanded-view {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 162px;
    background: var(--darkblue);
    overflow-y: scroll;
    &.no-captions {
      bottom: 84px;
    }
    .expanded-content-holder {
      .header {
        position: sticky;
        top: 0;
        background-color: var(--persistent-player-bg);
        padding: 5px 0;
      }
      .pi-chevron-down {
        position: fixed;
      }
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      height: inherit;
    }
  }
  .hideOnMobile {
    @container (max-width: #{$container-breakpoint-md}) {
      display: none;
    }
  }
}

//expand-delay
.expand-delay-enter-active {
  transition: opacity calc(var(--transition-duration) * 2) ease-out;
}
.expand-delay-leave-active {
  transition: opacity calc(var(--transition-duration) * 2) ease-in;
}
.expand-delay-enter-from,
.expand-delay-leave-to {
  opacity: 0;
}
//expand
.expand-enter-active {
  transition: opacity calc(var(--transition-duration) * 2) ease-out;
  transition-delay: calc(var(--transition-duration) * 2.25);
}
.expand-leave-active {
  transition: opacity 0s ease-in;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
