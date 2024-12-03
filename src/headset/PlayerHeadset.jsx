import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import { useXRInputSourceState } from '@react-three/xr'

import { useStoreGame, GAME_STATES } from '../stores/useStoreGame.js'
import { useStoreWebXR, XR_CAMERA } from '../stores/useStoreWebXR.js'
import { useStoreControls } from '../stores/useStoreControls.js'
import { XR_MODE } from '../common/Constants.js'

const helpers = {
  phase: null,
  vec3: new THREE.Vector3(),
  position_player: new THREE.Vector3(),
  position_xr_camera: new THREE.Vector3(),
  impulse: new THREE.Vector3(),
  torque: new THREE.Vector3(),
  impulse_strength: 0,
  torque_strength: 0,
  input_pressed: false,
  jump_pressed: false,
  is_jumping: false,

  controller: {
    x: 0,
    y: 0
  }
}

const PlayerHeadset = ({ ref_xr_origin, xr_mode }) => {
  const ref_player = useRef()

  const
    [smoothed_camera_position] = useState(new THREE.Vector3(10, 10, 10)),
    [smoothed_camera_target] = useState(new THREE.Vector3())

  const hands = {
    right: useXRInputSourceState('hand', 'right'),
    left: useXRInputSourceState('hand', 'left')
  }

  const controllers = {
    left: useXRInputSourceState('controller', 'left'),
    right: useXRInputSourceState('controller', 'right')
  }

  const
    thumbstick_left = controllers.left?.gamepad?.['xr-standard-thumbstick'],
    a_button = controllers.right?.gamepad?.['a-button']

  const { rapier, world } = useRapier()

  const
    startGame = useStoreGame(state => state.startGame),
    endGame = useStoreGame(state => state.endGame),
    restartGame = useStoreGame(state => state.restartGame),
    block_count = useStoreGame(state => state.block_count)

  const xr_camera_lock = useStoreWebXR(state => state.xr_camera_lock)

  const jump = useCallback(() => {
    const origin = ref_player.current.translation()
    origin.y -= 0.31

    const direction = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(origin, direction)
    const hit = world.castRay(ray, 10, true)

    if (hit && hit.timeOfImpact < 0.05) {
      ref_player.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
      helpers.is_jumping = true

      setTimeout(() => helpers.is_jumping = false, 200)
    }
  }, [])

  const resetGame = useCallback(() => {
    ref_player.current.setTranslation({ x: 0, y: 1, z: 0 })
    ref_player.current.setLinvel({ x: 0, y: 0, z: 0 })
    ref_player.current.setAngvel({ x: 0, y: 0, z: 0 })
  }, [])

  useEffect(() => {

    // SUBSCRIBE TO GAME PHASES
    const cleanupSubscribeGameState = useStoreGame.subscribe(
      state => state.phase,

      phase => {
        helpers.phase = phase

        if (phase === GAME_STATES.READY) {
          resetGame()
        }
      }
    )

    // CLEANUP - HELPS WITH HOT RELOADING
    return () => {
      cleanupSubscribeGameState()
    }
  }, [])

  useFrame((state, delta, xr_frame) => {
    if (!ref_player.current || helpers.phase === GAME_STATES.HIT_TEST) {
      return
    }

    // MOVE BALL | ROLL: applyTorqueImpulse | PUSH: applyImpulse
    helpers.impulse.set(0, 0, 0)
    helpers.torque.set(0, 0, 0)
    helpers.impulse_strength = 0.6 * delta
    helpers.torque_strength = 0.2 * delta
    helpers.input_pressed = false

    if (hands.left) {
      helpers.controller.x = useStoreControls.getState().controller_x,
        helpers.controller.y = useStoreControls.getState().controller_y
    }
    else {
      helpers.controller.x = thumbstick_left?.xAxis ?? 0,
        helpers.controller.y = thumbstick_left?.yAxis ?? 0
    }

    if (helpers.controller.x) {
      helpers.impulse.x += helpers.impulse_strength * helpers.controller.x
      helpers.torque.z -= helpers.torque_strength * helpers.controller.x
      helpers.input_pressed = true
    }

    if (helpers.controller.y) {
      helpers.impulse.z = helpers.impulse_strength * helpers.controller.y
      helpers.torque.x = helpers.torque_strength * helpers.controller.y
      helpers.input_pressed = true
    }

    if (!helpers.is_jumping) {
      helpers.jump_pressed = hands.right
        ? useStoreControls.getState().jump
        : a_button?.state === 'pressed'

      if (helpers.jump_pressed) {
        jump()
        helpers.input_pressed = true
      }
    }

    ref_player.current.applyImpulse(helpers.impulse) // ALLOWS SLIGHT MOVEMENT WHILE IN THE AIR (NOTICEABLE IN MANY GAMES)
    ref_player.current.applyTorqueImpulse(helpers.torque)

    // CAMERA AND CAMERA TARGET
    helpers.position_player.copy(ref_player.current.translation())

    if (xr_frame) {

      // IMMERSIVE VR
      if (xr_mode === XR_MODE.VR) {

        helpers.vec3.set(
          helpers.position_player.x,

          xr_camera_lock === XR_CAMERA.UNLOCKED
            ? helpers.position_player.y - 0.3
            : helpers.position_player.y + 0.65,

          helpers.position_player.z + 2.25
        )

        if (xr_camera_lock !== XR_CAMERA.UNLOCKED) {
          helpers.position_xr_camera.copy(ref_xr_origin.current.children[0].position)
          helpers.position_xr_camera.y *= 2

          // XR CAMERA LOCK ALL AXES (USER-SELECTED MODE ..THIS IS THE DEFAULT)
          if (xr_camera_lock === XR_CAMERA.LOCK_ALL_AXES) {
            helpers.vec3.sub(helpers.position_xr_camera)
          }

          // XR CAMERA LOCK VERTICAL AXIS ONLY (USER-SELECTED MODE)
          else if (xr_camera_lock === XR_CAMERA.LOCK_Y_AXIS) {
            helpers.vec3.y -= helpers.position_xr_camera.y
          }
        }

        smoothed_camera_position.lerp(helpers.vec3, 5 * delta)
        ref_xr_origin.current.position.copy(smoothed_camera_position)
      }

      // MIXED REALITY / AUGMENTED REALITY
      // ELSE IF xr_mode = XR_MODE.AR ..DON'T USE THE CHASE-CAM AT ALL
    }
    else {
      helpers.vec3.set(
        helpers.position_player.x,
        helpers.position_player.y + 0.65,
        helpers.position_player.z + 2.25
      )

      smoothed_camera_position.lerp(helpers.vec3, 5 * delta)
      state.camera.position.copy(smoothed_camera_position)

      helpers.vec3.set(
        helpers.position_player.x,
        helpers.position_player.y + 0.25,
        helpers.position_player.z
      )

      smoothed_camera_target.lerp(helpers.vec3, 5 * delta)
      state.camera.lookAt(smoothed_camera_target)
    }

    // GAME PHASE - START
    if (helpers.phase !== GAME_STATES.PLAYING && helpers.input_pressed) {
      startGame()
    }

    // GAME PHASE - END OF THE MAZE
    else if (helpers.position_player.z < -(block_count * 4 + 2)) {
      endGame()
    }

    // GAME PHASE - FALLEN OFF THE MAZE OR "EXPLODED" OFF PLATFORM
    else if (helpers.position_player.y < -4 || helpers.position_player.y > 10) {
      restartGame()
    }
  })

  return <RigidBody
    ref={ref_player}
    canSleep={false}
    position={[0, 1, 0]}
    colliders='ball'
    restitution={0.2}
    friction={1}
    linearDamping={0.5}
    angularDamping={0.5}
  >
    <mesh castShadow>
      <icosahedronGeometry args={[0.3, 1]} />

      <meshStandardMaterial
        flatShading
        color='mediumpurple'
      />
    </mesh>
  </RigidBody>
}

export { PlayerHeadset }