import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'

import { Experience } from './Experience.jsx'
import { Interface } from './Interface.jsx'
import { CAMERA_DEFAULTS } from '../common/Constants.js'

const RenderViewDesktop = () => <KeyboardControls
  map={[
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] }
  ]}
>
  <Canvas
    shadows
    camera={CAMERA_DEFAULTS}
  >
    <Experience />
  </Canvas>

  <Interface />
</KeyboardControls>

export { RenderViewDesktop }