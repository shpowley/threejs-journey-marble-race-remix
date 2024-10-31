import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useXRStore } from '@react-three/xr'
import { Image, Text, useTexture } from '@react-three/drei'

import { useGame, GAME_STATES } from '../stores/useGame.js'
import { useWebXR, XR_CAMERA } from '../stores/useWebXR.js'
import { HUDPanel } from './HUDPanel.jsx'
import { RESOURCE, XR_MODE } from '../common/Constants.js'

const materials = {
  text: new THREE.MeshBasicMaterial({
    toneMapped: false,
    depthTest: false
  }),

  panel: new THREE.MeshBasicMaterial({
    depthTest: false,
    color: '#000',
    transparent: true,
    opacity: 0.2
  })
}

const panel_geometry = new THREE.PlaneGeometry()

const InterfaceHeadset = ({ inner_ref = null, xr_mode = XR_MODE.VR, ...props }) => {
  const refs = {
    xr_camera_lock: useRef(),
    time: useRef(),
    exit: useRef()
  }

  const
    restartGame = useGame(state => state.restartGame),
    phase = useGame(state => state.phase)

  const
    xr_camera_lock = useWebXR(state => state.xr_camera_lock),
    cycleXRCameraLock = useWebXR(state => state.cycleXRCameraLock)

  const [texture_camera, texture_camera_lock, texture_camera_arrow] = useTexture([
    RESOURCE.IMAGE_CAMERA,
    RESOURCE.IMAGE_CAMERA_LOCK,
    RESOURCE.IMAGE_CAMERA_ARROW
  ])

  const xr_store = useXRStore()

  // UPDATE GAME TIMER
  useFrame(() => {
    const { phase, start_time, end_time } = useGame.getState()

    let elapsed_time = 0

    switch (phase) {
      case GAME_STATES.READY:
        refs.time.current.text = '0.00'
        return

      case GAME_STATES.PLAYING:
        elapsed_time = Date.now() - start_time
        break

      case GAME_STATES.ENDED:
        elapsed_time = end_time - start_time
        break

      case GAME_STATES.HIT_TEST:
        return
    }

    // CONVERT TO SECONDS
    elapsed_time /= 1000
    elapsed_time = elapsed_time.toFixed(2)

    // UPDATE THE TIME DISPLAY
    if (refs.time.current) {
      refs.time.current.text = elapsed_time
    }
  })

  // SWAPS XR CAMERA LOCK ICON BASE ON ZUSTAND GLOBAL STATE
  useEffect(() => {
    if (refs.xr_camera_lock.current) {
      switch (xr_camera_lock) {
        case XR_CAMERA.LOCK_ALL_AXES:
          refs.xr_camera_lock.current.material.map = texture_camera_lock
          break

        case XR_CAMERA.LOCK_Y_AXIS:
          refs.xr_camera_lock.current.material.map = texture_camera_arrow
          break

        case XR_CAMERA.UNLOCKED:
          refs.xr_camera_lock.current.material.map = texture_camera
          break
      }

      refs.xr_camera_lock.current.material.depthTest = false
    }
  }, [xr_camera_lock])

  // KEEPS THESE HUD ICONS ALWAYS DRAWN IN FRONT
  useEffect(() => {
    if (refs.xr_camera_lock.current) {
      refs.xr_camera_lock.current.material.depthTest = false
    }

    if (refs.exit.current) {
      refs.exit.current.material.depthTest = false
    }
  }, [])

  return <group
    ref={inner_ref}
    {...props}
  >
    {/* HIT-TEST INSTRUCTIONS */}
    {
      phase === GAME_STATES.HIT_TEST &&
      <group position={[0, 0.05, 0]}>
        <HUDPanel
          width={0.33}
          height={0.14}
          material={materials.panel}
          geometry={panel_geometry}
        />

        <Text
          material={materials.text}
          font={RESOURCE.FONT_BEBAS_NEUE}
          fontSize={1}
          scale={0.018}
          maxWidth={24}
          textAlign='left'
          frustumCulled={false}
          position={[0, -0.0045, 0.01]}

          text={`1 - aim with the targeting reticle(s)
2 - choose a flat surface (floor, table, etc.)
3 - place obstacle course (controller trigger)
4 - start playing (A button)`}
        />
      </group>
    }

    {/* "XR CAMERA LOCK" BUTTON | GAME TIMER | "EXIT VR" BUTTON */}
    {
      [GAME_STATES.READY, GAME_STATES.PLAYING, GAME_STATES.ENDED].includes(phase) &&
      <group
        position={[0, 0.1, 0]}
        renderOrder={1000}
      >
        <HUDPanel
          material={materials.panel}
          geometry={panel_geometry}
        />

        {
          xr_mode === XR_MODE.VR &&
          <Image
            ref={refs.xr_camera_lock}
            texture={texture_camera_lock}
            toneMapped={false}
            transparent={true}
            scale={0.05}
            position={[-0.22, -0.0022, 0.01]}
            frustumCulled={false}

            onClick={() => cycleXRCameraLock()}
            onPointerEnter={() => refs.xr_camera_lock.current.scale.setScalar(0.055)}
            onPointerLeave={() => refs.xr_camera_lock.current.scale.setScalar(0.05)}
          />
        }

        <Text
          ref={refs.time}
          material={materials.text}
          font={RESOURCE.FONT_BEBAS_NEUE}
          fontSize={1}
          scale={0.06}
          textAlign='center'
          frustumCulled={false}
          position={[0, -0.0045, 0.01]}
          text='0.00'
        />

        <Image
          ref={refs.exit}
          url={RESOURCE.IMAGE_EXIT_TO_APP}
          toneMapped={false}
          transparent={true}
          scale={0.05}
          position={[0.22, -0.0022, 0.01]}
          frustumCulled={false}

          onClick={() => xr_store.getState().session.end()}
          onPointerEnter={() => refs.exit.current.scale.setScalar(0.055)}
          onPointerLeave={() => refs.exit.current.scale.setScalar(0.05)}
        />
      </group>
    }

    {/* RESTART BUTTON */}
    {
      phase === GAME_STATES.ENDED &&
      <group
        position={[0, -0.05, 0]}
        onClick={restartGame}
      >
        <HUDPanel
          height={0.14}
          material={materials.panel}
          geometry={panel_geometry}
        />

        <Text
          material={materials.text}
          font={RESOURCE.FONT_BEBAS_NEUE}
          fontSize={1}
          scale={0.11}
          textAlign='center'
          frustumCulled={false}
          position={[0, -0.0045, 0.01]}
          text='RESTART'
        />
      </group>
    }
  </group>
}

export { InterfaceHeadset }