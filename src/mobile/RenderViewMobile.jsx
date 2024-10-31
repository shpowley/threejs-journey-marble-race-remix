import { Canvas } from '@react-three/fiber'

import ExperienceMobile from './ExperienceMobile.jsx'
import InterfaceMobile from './InterfaceMobile.jsx'

const RenderViewMobile = () => {
  return <>
    <Canvas
      shadows

      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [2.5, 4, 6]
      }}
    >
      <ExperienceMobile />
    </Canvas>

    <InterfaceMobile />
  </>
}

export { RenderViewMobile }