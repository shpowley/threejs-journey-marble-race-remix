import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useXRSessionVisibilityState } from '@react-three/xr'
import { RigidBody, useRapier } from '@react-three/rapier'

import { useGame, GAME_STATES } from '../stores/useGame.js'
import { useControls } from '../stores/useControls.js'

const
  PLAYER_POSITION_OFFSET_CONSTANTS = {
    PORTRAIT: {
      x: 0,
      y: 0.65,
      z: 3.1
    },

    LANDSCAPE: {
      x: 0,
      y: 0.65,
      z: 2.1
    }
  },

  TARGET_OFFSET_CONSTANTS = {
    PORTRAIT: {
      x: 0,
      y: 0.25,
      z: 0
    },

    LANDSCAPE: {
      x: 0,
      y: 0.35,
      z: 0
    }
  },

  PLAYER_OFFSET = {
    x: 0,
    y: 0,
    z: 0
  },

  TARGET_OFFSET = {
    x: 0,
    y: 0,
    z: 0
  }

const helper_vec3 = new THREE.Vector3()

const orientationChange = () => {
  if (['portrait-primary', 'portrait-secondary'].includes(screen.orientation.type)) {
    PLAYER_OFFSET.y = PLAYER_POSITION_OFFSET_CONSTANTS.PORTRAIT.y
    PLAYER_OFFSET.z = PLAYER_POSITION_OFFSET_CONSTANTS.PORTRAIT.z
    TARGET_OFFSET.y = TARGET_OFFSET_CONSTANTS.PORTRAIT.y
  }
  else {
    PLAYER_OFFSET.y = PLAYER_POSITION_OFFSET_CONSTANTS.LANDSCAPE.y
    PLAYER_OFFSET.z = PLAYER_POSITION_OFFSET_CONSTANTS.LANDSCAPE.z
    TARGET_OFFSET.y = TARGET_OFFSET_CONSTANTS.LANDSCAPE.y
  }
}

const PlayerMobile = () => {
  const ref_player = useRef()

  const xr_visibility = useXRSessionVisibilityState()

  const [smoothed_camera_position] = useState(() => new THREE.Vector3(0, 10, 10))
  const [smoothed_camera_target] = useState(() => new THREE.Vector3())

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

    if (hit.timeOfImpact < 0.15) {
      ref_player.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
    }
  }

  const resetGame = () => {
    ref_player.current.setTranslation({ x: 0, y: 1, z: 0 })
    ref_player.current.setLinvel({ x: 0, y: 0, z: 0 })
    ref_player.current.setAngvel({ x: 0, y: 0, z: 0 })
  }

  useEffect(() => {
    // SUBSCRIBE TO THE JUMP KEY
    // - HANDLED HERE, INSTEAD OF useFrame(), OTHERWISE "IMPULSE" WOULD BE CALLED EVERY FRAME
    const cleanupSubscribeJump = useControls.subscribe(
      state => state.jump,

      pressed => {
        if (pressed) {
          jump()
        }
      }
    )

    // SUBSCRIBE TO ANY KEY TO START GAME
    const cleanupSubscribeAnyKey = useControls.subscribe(() => startGame())

    // SUBSCRIBE TO GAME PHASES
    const cleanupSubscribeGameState = useGame.subscribe(
      state => state.phase,

      phase => {
        if (phase === GAME_STATES.READY) {
          resetGame()
        }
      }
    )

    // ORIENTATION CHANGE LISTENER TO REPOSITION PLAYER CAMERA
    screen.orientation.addEventListener('change', orientationChange)
    orientationChange()

    // CLEANUP - HELPS WITH HOT RELOADING
    return () => {
      cleanupSubscribeJump()
      cleanupSubscribeAnyKey()
      cleanupSubscribeGameState()
      screen.orientation.removeEventListener('change', orientationChange)
    }
  }, [])

  useFrame((state, delta) => {
    if (!ref_player.current) {
      return
    }

    // MOVE BALL | ROLL: applyTorqueImpulse | PUSH: applyImpulse
    const { controller_x, controller_y } = useControls.getState()

    const
      impulse = { x: 0, y: 0, z: 0 },
      torque = { x: 0, y: 0, z: 0 },
      impulse_strength = 0.6 * delta,
      torque_strength = 0.2 * delta

    if (controller_x) {
      impulse.x += impulse_strength * controller_x
      torque.z -= torque_strength * controller_x
    }

    if (controller_y) {
      impulse.z -= impulse_strength * controller_y
      torque.x -= torque_strength * controller_y
    }

    ref_player.current.applyImpulse(impulse) // ALLOWS SLIGHT MOVEMENT WHILE IN THE AIR (NOTICEABLE IN MANY GAMES)
    ref_player.current.applyTorqueImpulse(torque)

    // CAMERA AND CAMERA TARGET
    const position_player = ref_player.current.translation()

    if (!xr_visibility) {
      helper_vec3.set(position_player.x, position_player.y + PLAYER_OFFSET.y, position_player.z + PLAYER_OFFSET.z)
      smoothed_camera_position.lerp(helper_vec3, 5 * delta)
      state.camera.position.copy(smoothed_camera_position)

      helper_vec3.set(position_player.x, position_player.y + TARGET_OFFSET.y, position_player.z)
      smoothed_camera_target.lerp(helper_vec3, 5 * delta)
      state.camera.lookAt(smoothed_camera_target)
    }

    // GAME PHASE - END OF THE MAZE
    if (position_player.z < -(block_count * 4 + 2)) {
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

export { PlayerMobile }