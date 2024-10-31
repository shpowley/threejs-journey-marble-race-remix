import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const CAMERA_OFFSET = -11

const Lights = ({ shadows = true, ref_xr_origin }) => {
  const ref_directional_light = useRef()

  useFrame((state, delta, xr_frame) => {
    if (shadows) {
      const position_z = xr_frame && ref_xr_origin && ref_xr_origin.current
        ? ref_xr_origin.current.position.z
        : state.camera.position.z

      ref_directional_light.current.position.z = position_z + 1 + CAMERA_OFFSET
      ref_directional_light.current.target.position.z = position_z + CAMERA_OFFSET
      ref_directional_light.current.target.updateMatrixWorld()
    }
  })

  return <>
    <directionalLight
      ref={ref_directional_light}
      castShadow={shadows}
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

export { Lights }