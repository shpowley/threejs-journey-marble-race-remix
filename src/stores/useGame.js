import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const GAME_STATES = {
  READY: 0,
  PLAYING: 1,
  ENDED: 2,
  HIT_TEST: 3
}

const useGame = create(
  subscribeWithSelector(
    set => ({
      start_time: 0,
      end_time: 0,
      block_count: 10,
      block_seed: 0,
      phase: GAME_STATES.READY,

      startGame: () => {
        set(state => {
          if (state.phase === GAME_STATES.READY) {
            return {
              phase: GAME_STATES.PLAYING,
              start_time: Date.now(),
            }
          }

          return {}
        })
      },

      restartGame: () => {
        set(state => {
          if (state.phase === GAME_STATES.PLAYING || state.phase === GAME_STATES.ENDED) {
            return {
              phase: GAME_STATES.READY,
              block_seed: state.block_seed + 1,
            }
          }

          return {}
        })
      },

      endGame: () => {
        set(state => {
          if (state.phase === GAME_STATES.PLAYING) {
            return {
              phase: GAME_STATES.ENDED,
              end_time: Date.now(),
            }
          }

          return {}
        })
      }
    })
  )
)

export { useGame, GAME_STATES }