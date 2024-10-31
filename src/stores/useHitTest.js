import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useHitTest = create(
  subscribeWithSelector(
    set => ({
      // STORES WEBXR HIT-TEST RESULTS - mat4 (three.Matrix4) OR null
      hit_test_right: null,   // RIGHT-HAND or SCREEN
      hit_test_left: null,    // LEFT-HAND
    })
  )
)

export { useHitTest }