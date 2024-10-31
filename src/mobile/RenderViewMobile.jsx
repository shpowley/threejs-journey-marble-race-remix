import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'

import { ExperienceMobile } from './ExperienceMobile.jsx'
import { InterfaceMobile } from './InterfaceMobile.jsx'
import { CAMERA_DEFAULTS } from '../common/Constants.js'

const xr_store = createXRStore({
  handTracking: false,
  layers: false,
  meshDetection: false,
  planeDetection: false
})

const RenderViewMobile = () => <>
  <Canvas
    shadows
    camera={CAMERA_DEFAULTS}
  >
    <XR store={xr_store}>
      <ExperienceMobile />
    </XR>
  </Canvas>

  <InterfaceMobile store={xr_store} />
</>

export { RenderViewMobile }