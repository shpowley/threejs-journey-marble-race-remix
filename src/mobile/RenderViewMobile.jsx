import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'

import { ExperienceMobile } from './ExperienceMobile.jsx'
import { InterfaceMobile } from './InterfaceMobile.jsx'
import { CAMERA_DEFAULTS } from '../common/Constants.js'
import { useStoreWebXR } from '../stores/useStoreWebXR.js'

const xr_store = createXRStore({
  handTracking: false,
  layers: false,
  meshDetection: false,
  planeDetection: false
})

const RenderViewMobile = () => {
  // HELPS PREVENT RENDERING DUPLICATE <InterfaceMobile> DOM OVERLAYS DURING ANDROID-XR SESSION
  const xr_visibility = useStoreWebXR(state => state.xr_visibility)

  return <>
    <Canvas
      shadows
      camera={CAMERA_DEFAULTS}
    >
      <XR store={xr_store}>
        <ExperienceMobile />
      </XR>
    </Canvas>

    {
      !xr_visibility &&
      <InterfaceMobile store={xr_store} />
    }
  </>
}

export { RenderViewMobile }