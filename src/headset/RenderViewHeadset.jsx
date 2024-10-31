import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'

import { ExperienceHeadset } from './ExperienceHeadset.jsx'

const xr_store = createXRStore()

const RenderViewHeadset = () => {
  return <>
    <div id='div_buttons'>
      <button onClick={() => xr_store.enterVR()}>
        Enter VR
      </button>
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