import { Canvas } from '@react-three/fiber'

import {
  XR, XRDomOverlay, XROrigin, createXRStore,
  IfInSessionMode
} from '@react-three/xr'

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
        far: 200
      }}
    >
      <XR store={xr_store}>
        <ExperienceMobile />

        <IfInSessionMode allow={'immersive-ar'}>
          <XROrigin
            position={[10, 5, -5]}
            scale={5.0}
          />

          <XRDomOverlay id='xr_dom'>
            <InterfaceMobile
              store={xr_store}
              xr_overlay={true}
            />
          </XRDomOverlay>
        </IfInSessionMode>
      </XR>
    </Canvas>

    <InterfaceMobile store={xr_store} />
  </>
}

export { RenderViewMobile }