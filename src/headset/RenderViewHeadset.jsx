import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'

import { ExperienceHeadset } from './ExperienceHeadset.jsx'
import { HandWithPointer } from './HandWithPointer.jsx'
import { CAMERA_DEFAULTS, XR_MODE } from '../common/Constants.js'

const xr_store = createXRStore({
  domOverlay: false,
  hitTest: true,

  hand: HandWithPointer
})

const RenderViewHeadset = () => <>
  <div id='div_buttons'>
    {
      navigator.xr.isSessionSupported(XR_MODE.AR) &&
      <button onClick={() => {
        xr_store.enterAR()
      }}>
        Enter AR
      </button>
    }

    {
      navigator.xr.isSessionSupported(XR_MODE.VR) &&
      <button onClick={() => {
        xr_store.enterVR()
      }}>
        Enter VR
      </button>
    }
  </div>

  <Canvas
    shadows
    camera={CAMERA_DEFAULTS}
  >
    <XR store={xr_store}>
      <ExperienceHeadset />
    </XR>
  </Canvas>
</>

export { RenderViewHeadset }