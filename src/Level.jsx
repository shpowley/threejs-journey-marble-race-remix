import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const
  FONT_BEBAS_NEUE = './bebas-neue-v9-latin-regular.woff',
  MODEL_HAMBURGER = './hamburger.glb'

const helper_vec3 = new THREE.Vector3()

const box_geometry = new THREE.BoxGeometry(1, 1, 1)

const
  material_floor_1 = new THREE.MeshStandardMaterial({ color: 'limegreen' }),    // START / END BLOCKS
  material_floor_2 = new THREE.MeshStandardMaterial({ color: 'greenyellow' }),  // REGULAR BLOCKS
  material_obstacle = new THREE.MeshStandardMaterial({ color: 'orangered' }),
  material_wall = new THREE.MeshStandardMaterial({ color: 'slategray' })

const getRandomSpeed = () => {
  return (Math.random() + 0.2) * (Math.random() > 0.5 ? 1 : -1)
}

// STARTING BLOCK : 'FLOATING' GAME TITLE + FLOOR
const BlockStart = ({ position = [0, 0, 0] }) => {
  return <group position={position}>
    <Float
      floatIntensity={0.25}
      rotationIntensity={0.25}
    >
      <Text
        font={FONT_BEBAS_NEUE}
        scale={0.5}
        maxWidth={0.25}
        lineHeight={0.75}
        textAlign='right'
        position={[0.75, 0.7, 0]}
        rotation-y={-0.25}
      >
        <meshBasicMaterial toneMapped={false} />
        Marble Race
      </Text>
    </Float>

    <mesh
      material={material_floor_1}
      geometry={box_geometry}
      position={[0, -0.1, 0]}
      scale={[4, 0.2, 4]}
      receiveShadow
    />
  </group>
}

// END BLOCK : FINISH LINE TEXT + FLOOR + 3D HAMBURGER 'GOAL'
const BlockEnd = ({ position = [0, 0, 0] }) => {
  const hamburger = useGLTF(MODEL_HAMBURGER)

  hamburger.scene.children.forEach(child => {
    if (child.isMesh) {
      child.castShadow = true
    }
  })

  return <group position={position}>
    <Text
      font={FONT_BEBAS_NEUE}
      scale={1}
      position={[0, 2.25, 2]}
    >
      <meshBasicMaterial toneMapped={false} />
      FINISH
    </Text>

    <mesh
      material={material_floor_1}
      geometry={box_geometry}
      position={[0, 0, 0]}
      scale={[4, 0.3, 4]}
      receiveShadow
    />

    <RigidBody
      type='fixed'
      colliders='hull'
      position={[0, 0.25, 0]}
      restitution={0.2}
      friction={0}
    >
      <primitive
        object={hamburger.scene}
        scale={0.2}
      />
    </RigidBody>
  </group>
}

// USES useEffect / setAngvel() INSTEAD OF useFrame / setNextKinematicRotation() FROM ORIGINAL LESSON
const BlockSpinner = ({ position = [0, 0, 0] }) => {
  const ref_spinner = useRef()
  const [spin_speed] = useState(() => getRandomSpeed())

  useEffect(() => {
    ref_spinner.current.setAngvel(helper_vec3.set(0, spin_speed, 0))
  }, [])

  return <group position={position}>
    <mesh
      material={material_floor_2}
      geometry={box_geometry}
      position={[0, -0.1, 0]}
      scale={[4, 0.2, 4]}
      receiveShadow
    />

    <RigidBody
      type='kinematicVelocity' // REQUIRED FOR setAngvel()
      position={[0, 0.3, 0]}
      restitution={0.2}
      friction={0}
      ref={ref_spinner}
    >
      <mesh
        material={material_obstacle}
        geometry={box_geometry}
        scale={[3.5, 0.3, 0.3]}
        castShadow
        receiveShadow
      />
    </RigidBody>
  </group>
}

const BlockLimbo = ({ position = [0, 0, 0] }) => {
  const ref_limbo = useRef()
  const [time_offset] = useState(() => Math.random() * Math.PI * 2)

  useFrame(state => {
    if (ref_limbo.current) {
      const time = state.clock.getElapsedTime()
      const y = Math.sin(time + time_offset) + 1.15

      ref_limbo.current.setNextKinematicTranslation(helper_vec3.set(position[0], position[1] + y, position[2]))
    }
  })

  return <group position={position}>
    <mesh
      material={material_floor_2}
      geometry={box_geometry}
      position={[0, -0.1, 0]}
      scale={[4, 0.2, 4]}
      receiveShadow
    />

    <RigidBody
      type='kinematicPosition'
      position={[0, 0.3, 0]}
      restitution={0.2}
      friction={0}
      ref={ref_limbo}
    >
      <mesh
        material={material_obstacle}
        geometry={box_geometry}
        scale={[3.5, 0.3, 0.3]}
        castShadow
        receiveShadow
      />
    </RigidBody>
  </group>
}

const BlockAxe = ({ position = [0, 0, 0] }) => {
  const ref_axe = useRef()
  const [time_offset] = useState(() => Math.random() * Math.PI * 2)

  useFrame(state => {
    if (ref_axe.current) {
      const time = state.clock.getElapsedTime()
      const x = Math.sin(time + time_offset) * 1.25

      ref_axe.current.setNextKinematicTranslation(helper_vec3.set(position[0] + x, position[1] + 0.75, position[2]))
    }
  })

  return <group position={position}>
    <mesh
      material={material_floor_2}
      geometry={box_geometry}
      position={[0, -0.1, 0]}
      scale={[4, 0.2, 4]}
      receiveShadow
    />

    <RigidBody
      type='kinematicPosition'
      position={[0, 0.75, 0]}
      restitution={0.2}
      friction={0}
      ref={ref_axe}
    >
      <mesh
        material={material_obstacle}
        geometry={box_geometry}
        scale={[1.5, 1.5, 0.3]}
        castShadow
        receiveShadow
      />
    </RigidBody>
  </group>
}

const Bounds = ({ length = 1 }) => {
  return <>
    <RigidBody
      type='fixed'
      restitution={0.2}
      friction={0}
    >
      {/* RIGHT WALL */}
      <mesh
        geometry={box_geometry}
        material={material_wall}
        castShadow
        scale={[0.3, 1.5, 4 * length]}
        position={[2.15, 0.75, -(length * 2) + 2]}
      />

      {/* LEFT WALL */}
      <mesh
        geometry={box_geometry}
        material={material_wall}
        receiveShadow
        scale={[0.3, 1.5, 4 * length]}
        position={[-2.15, 0.75, -(length * 2) + 2]}
      />

      {/* BACK WALL */}
      <mesh
        geometry={box_geometry}
        material={material_wall}
        receiveShadow
        scale={[4, 1.5, 0.3]}
        position={[0, 0.75, -(length * 4) + 2]}
      />

      {/* FLOOR */}
      <CuboidCollider
        args={[2, 0.1, 2 * length]}
        position={[0, -0.1, -(length * 2) + 2]}
        restitution={0.2}
        friction={1}
      />
    </RigidBody>
  </>
}

const Level = ({
  count = 5,
  types = [BlockSpinner, BlockLimbo, BlockAxe],
  seed = 0
}) => {
  const blocks = useMemo(() => {
    const blocks = []

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      blocks.push(type)
    }

    return blocks
  }, [count, types, seed])

  return <>
    <BlockStart />

    {
      blocks.map((Block, index) => <Block
        key={index}
        position={[0, 0, -(index + 1) * 4]}
      />)
    }

    <BlockEnd position={[0, 0, -(count + 1) * 4]} />
    <Bounds length={count + 2} />
  </>
}

export {
  Level,
  BlockStart,
  BlockEnd,
  BlockSpinner,
  BlockLimbo,
  BlockAxe
}