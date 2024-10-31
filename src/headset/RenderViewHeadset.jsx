import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'

import { ExperienceHeadset } from './ExperienceHeadset.jsx'
import { XR_MODE } from '../common/Constants.js'

const xr_store = createXRStore({
  domOverlay: false,
  foveation: false
})

const RenderViewHeadset = () => {
  return <>
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

      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [2.5, 4, 6]
      }}
    >
      <XR store={xr_store}>
        <ExperienceHeadset />
      </XR>
    </Canvas>
  </>
}

export { RenderViewHeadset }