import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// USED IN CONJUNCTION WITH THE HEADSET VR CAMERA (SEE /headset/PlayerHeadset.jsx)
const XR_CAMERA = {
  LOCK_ALL_AXES: 0,
  LOCK_Y_AXIS: 1,
  UNLOCKED: 2
}

const useWebXR = create(
  subscribeWithSelector(
    set => ({
      xr_camera_lock: XR_CAMERA.LOCK_ALL_AXES,

      cycleXRCameraLock: () => {
        set(state => {

          switch (state.xr_camera_lock) {
            case XR_CAMERA.LOCK_ALL_AXES:
              return { xr_camera_lock: XR_CAMERA.LOCK_Y_AXIS }

            case XR_CAMERA.LOCK_Y_AXIS:
              return { xr_camera_lock: XR_CAMERA.UNLOCKED }

            case XR_CAMERA.UNLOCKED:
              return { xr_camera_lock: XR_CAMERA.LOCK_ALL_AXES }
          }
        })

        return {}
      }
    })
  )
)

export { useWebXR, XR_CAMERA }