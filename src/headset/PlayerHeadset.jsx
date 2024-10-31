import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import { useXRInputSourceState } from '@react-three/xr'

import { useGame, GAME_STATES } from '../stores/useGame.js'
import { XR_MODE } from '../common/Constants.js'

const helpers = {
  vec3: new THREE.Vector3(),
  is_jumping: false,
  phase: null
}

const PlayerHeadset = ({ ref_xr_origin, xr_mode }) => {
  const ref_player = useRef()

  const [smoothed_camera_position] = useState(() => new THREE.Vector3(10, 10, 10))
  const [smoothed_camera_target] = useState(() => new THREE.Vector3())

  const
    controller_right = useXRInputSourceState('controller', 'right'),
    controller_left = useXRInputSourceState('controller', 'left')

  const { rapier, world } = useRapier()

  const
    startGame = useGame(state => state.startGame),
    endGame = useGame(state => state.endGame),
    restartGame = useGame(state => state.restartGame),
    block_count = useGame(state => state.block_count)

  const jump = () => {
    const origin = ref_player.current.translation()
    origin.y -= 0.31

    const direction = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(origin, direction)
    const hit = world.castRay(ray, 10, true)

    if (hit && hit.timeOfImpact < 0.15) {
      ref_player.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
      helpers.is_jumping = true

      setTimeout(() => helpers.is_jumping = false, 300)
    }
  }

  const resetGame = () => {
    ref_player.current.setTranslation({ x: 0, y: 1, z: 0 })
    ref_player.current.setLinvel({ x: 0, y: 0, z: 0 })
    ref_player.current.setAngvel({ x: 0, y: 0, z: 0 })
  }

  useEffect(() => {

    // SUBSCRIBE TO GAME PHASES
    const cleanupSubscribeGameState = useGame.subscribe(
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
    if (!ref_player.current) {
      return
    }

    // MOVE BALL | ROLL: applyTorqueImpulse | PUSH: applyImpulse
    const
      thumbstick_left = controller_left?.gamepad?.['xr-standard-thumbstick'],
      a_button = controller_right?.gamepad?.['a-button']

    const
      impulse = { x: 0, y: 0, z: 0 },
      torque = { x: 0, y: 0, z: 0 },
      impulse_strength = 0.6 * delta,
      torque_strength = 0.2 * delta,
      controller_x = thumbstick_left?.xAxis ?? 0,
      controller_y = thumbstick_left?.yAxis ?? 0

    let input_pressed = false

    if (controller_x) {
      impulse.x += impulse_strength * controller_x
      torque.z -= torque_strength * controller_x
      input_pressed = true
    }

    if (controller_y) {
      impulse.z = impulse_strength * controller_y
      torque.x = torque_strength * controller_y
      input_pressed = true
    }

    if (!helpers.is_jumping && a_button?.state === 'pressed') {
      jump()
      input_pressed = true
    }

    ref_player.current.applyImpulse(impulse) // ALLOWS SLIGHT MOVEMENT WHILE IN THE AIR (NOTICEABLE IN MANY GAMES)
    ref_player.current.applyTorqueImpulse(torque)

    // CAMERA AND CAMERA TARGET
    const position_player = ref_player.current.translation()

    if (xr_frame) {
      if (xr_mode === XR_MODE.VR) {
        const xr_camera_pos = ref_xr_origin.current?.children[0].position

        helpers.vec3.set(
          position_player.x - xr_camera_pos.x,
          position_player.y - xr_camera_pos.y - 0.3,
          position_player.z - xr_camera_pos.z + 2.25
        )

        smoothed_camera_position.lerp(helpers.vec3, 5 * delta)
        ref_xr_origin.current?.position.copy(smoothed_camera_position)
      }
      // ELSE IF xr_mode = XR_MODE.AR ..DON'T USE THE CHASE-CAM
    }
    else {
      helpers.vec3.set(position_player.x, position_player.y + 0.65, position_player.z + 2.25)
      smoothed_camera_position.lerp(helpers.vec3, 5 * delta)
      state.camera.position.copy(smoothed_camera_position)

      helpers.vec3.set(position_player.x, position_player.y + 0.25, position_player.z)
      smoothed_camera_target.lerp(helpers.vec3, 5 * delta)
      state.camera.lookAt(smoothed_camera_target)
    }

    // GAME PHASE - START
    if (helpers.phase !== GAME_STATES.PLAYING && input_pressed) {
      startGame()
    }

    // GAME PHASE - END OF THE MAZE
    else if (position_player.z < -(block_count * 4 + 2)) {
      endGame()
    }

    // GAME PHASE - FALLEN OFF THE MAZE OR "EXPLODED" OFF PLATFORM
    else if (position_player.y < -4 || position_player.y > 10) {
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