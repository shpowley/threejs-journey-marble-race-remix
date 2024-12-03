import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, } from '@react-three/fiber'
import { useXRInputSourceState, useXRSessionVisibilityState, useXRStore } from '@react-three/xr'
import { Image, Text, useTexture } from '@react-three/drei'

import { useStoreGame, GAME_STATES } from '../stores/useStoreGame.js'
import { useStoreWebXR, XR_CAMERA } from '../stores/useStoreWebXR.js'
import { RESOURCE, XR_MODE } from '../common/Constants.js'
import { HUDPanel } from './HUDPanel.jsx'
import { HandControls } from './HandControls.jsx'

const materials = {
  text: new THREE.MeshBasicMaterial({
    toneMapped: false,
    depthTest: false
  }),

  panel: new THREE.MeshBasicMaterial({
    depthTest: false,
    color: 0x000000,
    transparent: true,
    opacity: 0.2
  })
}

const geometries = {
  panel: new THREE.PlaneGeometry()
}

const HitTestInstructions = ({ position = [0, 0.05, 0] }) => {
  const phase = useStoreGame(state => state.phase)

  return phase === GAME_STATES.HIT_TEST &&
    <group position={position}>
      <HUDPanel
        width={0.33}
        height={0.14}
        material={materials.panel}
        geometry={geometries.panel}
      />

      <Text
        material={materials.text}
        font={RESOURCE.FONT_BEBAS_NEUE}
        fontSize={1}
        scale={0.018}
        maxWidth={24}
        textAlign='left'
        frustumCulled={false}
        position={[0, -0.003, 0.01]}

        text={`controllers only
1 - aim with the targeting reticle(s)
2 - choose a flat surface (floor, table, etc.)
3 - place obstacle course (controller trigger)
4 - start playing (A button)`}
      />
    </group>
}

// "XR CAMERA LOCK" BUTTON | GAME TIMER | "EXIT VR" BUTTON
const TimerPlusControls = ({ position = [0, 0.08, 0] }) => {
  const refs = {
    xr_camera_lock: useRef(),
    time: useRef(),
    exit: useRef()
  }

  const
    xr_store = useXRStore(),
    xr_mode = xr_store.getState()?.mode

  const phase = useStoreGame(state => state.phase)

  const
    xr_camera_lock = useStoreWebXR(state => state.xr_camera_lock),
    cycleXRCameraLock = useStoreWebXR(state => state.cycleXRCameraLock)

  const [texture_camera, texture_camera_lock, texture_camera_arrow] = useTexture([
    RESOURCE.IMAGE_CAMERA,
    RESOURCE.IMAGE_CAMERA_LOCK,
    RESOURCE.IMAGE_CAMERA_ARROW
  ])

  // UPDATE GAME TIMER
  useFrame(() => {
    const { phase, start_time, end_time } = useStoreGame.getState()

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
  }, [xr_camera_lock, xr_mode])

  // KEEPS THESE HUD ICONS ALWAYS DRAWN IN FRONT
  useEffect(() => {
    if (refs.xr_camera_lock.current) {
      refs.xr_camera_lock.current.material.depthTest = false
    }

    if (refs.exit.current) {
      refs.exit.current.material.depthTest = false
    }
  }, [])

  return [GAME_STATES.READY, GAME_STATES.PLAYING, GAME_STATES.ENDED].includes(phase) &&
    <group
      position={position}
      renderOrder={1000}
    >
      <HUDPanel
        material={materials.panel}
        geometry={geometries.panel}
      />

      {
        xr_mode === XR_MODE.VR &&
        <Image
          ref={refs.xr_camera_lock}
          url={RESOURCE.IMAGE_CAMERA_LOCK}
          toneMapped={false}
          transparent={true}
          scale={0.05}
          position={[-0.2, -0.0022, 0.01]}
          frustumCulled={false}

          onPointerDown={() => cycleXRCameraLock()}
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
        position={[0.2, -0.0022, 0.01]}
        frustumCulled={false}

        onPointerDown={() => xr_store.getState().session.end()}
        onPointerEnter={() => refs.exit.current.scale.setScalar(0.055)}
        onPointerLeave={() => refs.exit.current.scale.setScalar(0.05)}
      />
    </group>
}

const RestartButton = ({ position = [0, -0.05, 0] }) => {
  const
    phase = useStoreGame(state => state.phase),
    restartGame = useStoreGame(state => state.restartGame)

  return phase === GAME_STATES.ENDED &&
    <group
      position={position}
      onPointerDown={restartGame}
    >
      <HUDPanel
        height={0.14}
        material={materials.panel}
        geometry={geometries.panel}
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

const InterfaceHeadset = ({ inner_ref = null, ...props }) => {
  const [hud_visible, setHUDVisible] = useState(false)

  const xr_visibility = useXRSessionVisibilityState()

  const
    xr_store = useXRStore(),
    xr_mode = xr_store.getState()?.mode

  const hands = {
    right: useXRInputSourceState('hand', 'right'),
    left: useXRInputSourceState('hand', 'left')
  }

  useEffect(() => {
    setHUDVisible(xr_visibility ? true : false)
  }, [xr_visibility])

  return <group
    ref={inner_ref}
    visible={hud_visible}
    {...props}
  >
    <HitTestInstructions />
    <TimerPlusControls />
    <RestartButton />

    {
      xr_mode === XR_MODE.VR && (hands.left || hands.right) &&
      <HandControls hands={hands} />
    }
  </group>
}

export { InterfaceHeadset }