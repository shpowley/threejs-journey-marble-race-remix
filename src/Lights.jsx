import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const CAMERA_OFFSET = -11

export default function Lights() {
  const ref_light = useRef()

  useFrame(state => {
    ref_light.current.position.z = state.camera.position.z + 1 + CAMERA_OFFSET
    ref_light.current.target.position.z = state.camera.position.z + CAMERA_OFFSET
    ref_light.current.target.updateMatrixWorld()
  })

  return <>
    <directionalLight
      ref={ref_light}
      castShadow
      position={[4, 4, 1]}
      intensity={4.5}
      shadow-mapSize={[1024, 1024]}
      shadow-camera-near={1}
      shadow-camera-far={10}
      shadow-camera-top={10}
      shadow-camera-right={10}
      shadow-camera-bottom={-10}
      shadow-camera-left={-10}
    />
    <ambientLight intensity={1.5} />
  </>
}