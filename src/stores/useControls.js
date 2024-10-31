import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useControls = create(
  subscribeWithSelector(
    set => ({
      controller_x: 0,
      controller_y: 0,
      jump: false,

      setPosition: (controller_x, controller_y) => set({ controller_x, controller_y }),
      setJump: jump => set({ jump }),
    })
  )
)

export { useControls }