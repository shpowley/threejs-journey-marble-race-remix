import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'

import { useStoreGame, GAME_STATES } from '../stores/useStoreGame.js'

const helpers = {
  vec3: new THREE.Vector3(),
  position_player: new THREE.Vector3(),
  impulse: new THREE.Vector3(),
  torque: new THREE.Vector3(),
  impulse_strength: 0,
  torque_strength: 0,
  keys: null,

  jump: {
    origin: new THREE.Vector3(),
    direction: { x: 0, y: -1, z: 0 },
    ray: null,
    hit: null
  }
}

const Player = () => {
  const ref_player = useRef()

  const
    [smoothed_camera_position] = useState(new THREE.Vector3(10, 10, 10)),
    [smoothed_camera_target] = useState(new THREE.Vector3())

  const [subscribeKeys, getKeys] = useKeyboardControls()
  const { rapier, world } = useRapier()

  const
    startGame = useStoreGame(state => state.startGame),
    endGame = useStoreGame(state => state.endGame),
    restartGame = useStoreGame(state => state.restartGame),
    block_count = useStoreGame(state => state.block_count)

  const jump = useCallback(() => {
    helpers.jump.origin.copy(ref_player.current.translation())
    helpers.jump.origin.y -= 0.31
    helpers.jump.ray = new rapier.Ray(helpers.jump.origin, helpers.jump.direction)
    helpers.jump.hit = world.castRay(helpers.jump.ray, 10, true)

    if (helpers.jump.hit.timeOfImpact < 0.15) {
      ref_player.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
    }
  }, [])

  const resetGame = useCallback(() => {
    ref_player.current.setTranslation({ x: 0, y: 1, z: 0 })
    ref_player.current.setLinvel({ x: 0, y: 0, z: 0 })
    ref_player.current.setAngvel({ x: 0, y: 0, z: 0 })
  }, [])

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
    const cleanupSubscribeGameState = useStoreGame.subscribe(
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
    helpers.keys = getKeys()
    helpers.impulse.set(0, 0, 0)
    helpers.torque.set(0, 0, 0)
    helpers.impulse_strength = 0.6 * delta
    helpers.torque_strength = 0.2 * delta

    if (helpers.keys.forward) {
      helpers.impulse.z -= helpers.impulse_strength
      helpers.torque.x -= helpers.torque_strength
    }

    if (helpers.keys.backward) {
      helpers.impulse.z += helpers.impulse_strength
      helpers.torque.x += helpers.torque_strength
    }

    if (helpers.keys.left) {
      helpers.impulse.x -= helpers.impulse_strength
      helpers.torque.z += helpers.torque_strength
    }

    if (helpers.keys.right) {
      helpers.impulse.x += helpers.impulse_strength
      helpers.torque.z -= helpers.torque_strength
    }

    ref_player.current.applyImpulse(helpers.impulse) // ALLOWS SLIGHT MOVEMENT WHILE IN THE AIR (NOTICEABLE IN MANY GAMES)
    ref_player.current.applyTorqueImpulse(helpers.torque)

    // CAMERA AND CAMERA TARGET
    helpers.position_player.copy(ref_player.current.translation())

    helpers.vec3.set(helpers.position_player.x, helpers.position_player.y + 0.65, helpers.position_player.z + 2.25)
    smoothed_camera_position.lerp(helpers.vec3, 5 * delta)
    state.camera.position.copy(smoothed_camera_position)

    helpers.vec3.set(helpers.position_player.x, helpers.position_player.y + 0.25, helpers.position_player.z)
    smoothed_camera_target.lerp(helpers.vec3, 5 * delta)
    state.camera.lookAt(smoothed_camera_target)

    // GAME PHASE - END OF THE MAZE
    if (helpers.position_player.z < -(block_count * 4 + 2)) {
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

export { Player }