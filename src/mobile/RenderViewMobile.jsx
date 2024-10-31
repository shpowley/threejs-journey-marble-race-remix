import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'

import { ExperienceMobile } from './ExperienceMobile.jsx'
import { InterfaceMobile } from './InterfaceMobile.jsx'

const xr_store = createXRStore({
  handTracking: false,
  layers: false,
  meshDetection: false,
  planeDetection: false
})

const RenderViewMobile = () => {
  return <>
    <Canvas
      shadows

      camera={{
        fov: 45,
        near: 0.1,
        far: 1000
      }}
    >
      <XR store={xr_store}>
        <ExperienceMobile />
      </XR>
    </Canvas>

    <InterfaceMobile store={xr_store} />
  </>
}

export { RenderViewMobile }