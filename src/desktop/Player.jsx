import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'

import { useGame, GAME_STATES } from '../stores/useGame.js'

const helper_vec3 = new THREE.Vector3()

const Player = () => {
  const ref_player = useRef()

  const [smoothed_camera_position] = useState(() => new THREE.Vector3(10, 10, 10))
  const [smoothed_camera_target] = useState(() => new THREE.Vector3())

  const [subscribeKeys, getKeys] = useKeyboardControls()
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
    const cleanupSubscribeJump = subscribeKeys(
      state => state.jump,

      pressed => {
        if (pressed) {
          jump()
        }
      }
    )

    // SUBSCRIBE TO ANY KEY TO START GAME
    const cleanupSubscribeAnyKey = subscribeKeys(() => startGame())

    // SUBSCRIBE TO GAME PHASES
    const cleanupSubscribeGameState = useGame.subscribe(
      state => state.phase,

      phase => {
        if (phase === GAME_STATES.READY) {
          resetGame()
        }
      }
    )

    // CLEANUP - HELPS WITH HOT RELOADING
    return () => {
      cleanupSubscribeJump()
      cleanupSubscribeAnyKey()
      cleanupSubscribeGameState()
    }
  }, [])

  useFrame((state, delta) => {
    if (!ref_player.current) {
      return
    }

    // MOVE BALL | ROLL: applyTorqueImpulse | PUSH: applyImpulse
    const keys = getKeys()

    const
      impulse = { x: 0, y: 0, z: 0 },
      torque = { x: 0, y: 0, z: 0 },
      impulse_strength = 0.6 * delta,
      torque_strength = 0.2 * delta

    if (keys.forward) {
      impulse.z -= impulse_strength
      torque.x -= torque_strength
    }

    if (keys.backward) {
      impulse.z += impulse_strength
      torque.x += torque_strength
    }

    if (keys.left) {
      impulse.x -= impulse_strength
      torque.z += torque_strength
    }

    if (keys.right) {
      impulse.x += impulse_strength
      torque.z -= torque_strength
    }

    ref_player.current.applyImpulse(impulse) // ALLOWS SLIGHT MOVEMENT WHILE IN THE AIR (NOTICEABLE IN MANY GAMES)
    ref_player.current.applyTorqueImpulse(torque)

    // CAMERA AND CAMERA TARGET
    const position_player = ref_player.current.translation()

    helper_vec3.set(position_player.x, position_player.y + 0.65, position_player.z + 2.25)
    smoothed_camera_position.lerp(helper_vec3, 5 * delta)
    state.camera.position.copy(smoothed_camera_position)

    helper_vec3.set(position_player.x, position_player.y + 0.25, position_player.z)
    smoothed_camera_target.lerp(helper_vec3, 5 * delta)
    state.camera.lookAt(smoothed_camera_target)

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

export { Player }