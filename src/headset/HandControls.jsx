import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useXRInputSourceEvent } from '@react-three/xr'
import { Image } from '@react-three/drei'

import { GAME_STATES, useStoreGame } from '../stores/useStoreGame'
import { useStoreControls } from '../stores/useStoreControls'
import { useStoreRefs } from '../stores/useStoreRefs'
import { RESOURCE } from '../common/Constants'
import { SpatialJoystick } from './SpatialJoystick'

const helpers = {
  vec3: new THREE.Vector3()
}

const materials = {
  zone_disabled: new THREE.MeshBasicMaterial({
    depthTest: false,
    color: 0x000000,
    transparent: true,
    opacity: 0.05
  }),

  zone_enabled: new THREE.MeshBasicMaterial({
    depthTest: false,
    color: 0xfbff00,
    transparent: true,
    opacity: 0.15
  })
}

const geometries = {
  hand_zone: new THREE.IcosahedronGeometry(0.11, 3)
}

const HandControls = ({ hands }) => {
  const refs = {
    joystick_zone: useRef(),
    jump_zone: useRef(),
    virtual_joystick: useRef()
  }

  const data = {
    joystick_zone_is_active: useRef(false),     // LEFT HAND IS WITHIN THE "JOYSTICK ZONE"
    jump_zone_is_active: useRef(false)          // RIGHT HAND IS WITHIN THE "JUMP ZONE"
  }

  const xr_camera = useThree(state => state.camera)

  const spatial_joystick = useRef(new SpatialJoystick({
    camera: xr_camera,
    max_radius: 0.05,
    buffer_radius: 0.01
  }))

  const phase = useStoreGame(state => state.phase)

  const
    setPosition = useStoreControls(state => state.setPosition),
    setJump = useStoreControls(state => state.setJump)

  useXRInputSourceEvent(
    'all',
    'selectstart',

    e => {
      if (e.inputSource.hand) {
        if (e.inputSource.handedness === 'right' && data.jump_zone_is_active.current) {
          setJump(true)
          setTimeout(() => setJump(false), 200)
        }

        else if (e.inputSource.handedness === 'left' && data.joystick_zone_is_active.current) {
          spatial_joystick.current.pinchStart()
          setPosition(0, 0)
        }
      }
    },

    []
  )

  useXRInputSourceEvent(
    'all',
    'selectend',

    e => {
      if (e.inputSource.hand) {

        // SPATIAL JOYSTICK : PINCH END
        if (e.inputSource.handedness === 'left') {
          refs.virtual_joystick.current.visible = false
          spatial_joystick.current.pinchEnd()
          setPosition(0, 0)
        }
      }
    },

    []
  )

  useFrame(() => {
    if (spatial_joystick.current.active) {

      // SPATIAL JOYSTICK : PINCH MOVE
      const xr_space_joint = useStoreRefs.getState().xr_space_left_index

      if (xr_space_joint) {
        spatial_joystick.current.pinchMove(xr_space_joint)

        helpers.vec3.copy(spatial_joystick.current.displacement)
        setPosition(helpers.vec3.x, helpers.vec3.z)

        helpers.vec3.copy(spatial_joystick.current.origin)

        // COMMENT: OFFSETS OBTAINED USING TRIAL-AND-ERROR
        refs.virtual_joystick.current.position.set(
          helpers.vec3.x - 0.04,
          spatial_joystick.current.position.y,
          helpers.vec3.z + 0.47
        )

        refs.virtual_joystick.current.visible = true
      }
    }
  })

  if (!hands.left) {
    data.joystick_zone_is_active.current = false
  }

  useEffect(() => {
    if (refs.virtual_joystick.current) {
      refs.virtual_joystick.current.material.depthTest = false
    }
  }, [])

  // COMMENT:
  // - ACTIVATION BOUNDARIES ARE A BIT OFF, ESPECIALLY THE RIGHT-FINGER CURSOR / JUMP-ZONE
  // - UNSURE HOW TO MAKE ADJUSTMENTS
  return [GAME_STATES.READY, GAME_STATES.PLAYING, GAME_STATES.ENDED].includes(phase) &&
    <>
      {
        hands.left &&
        <>
          <Image
            name='virtual_joystick'
            ref={refs.virtual_joystick}
            url={RESOURCE.JOYSTICK.FOLLOW}
            scale={spatial_joystick.current.max_radius * 2}
            rotation={[-Math.PI * 0.5, 0, 0]}
            toneMapped={false}
            transparent={true}
            frustumCulled={false}
            side={THREE.DoubleSide}
            visible={false}
          />
          <mesh
            name='joystick_zone'
            ref={refs.joystick_zone}
            position={[-0.18, -0.16, 0.22]}
            geometry={geometries.hand_zone}
            material={materials.zone_disabled}

            onPointerEnter={e => {
              if (e?.internalPointer?.state.inputSource.handedness === 'left') {
                refs.joystick_zone.current.material = materials.zone_enabled
                data.joystick_zone_is_active.current = true
              }
            }}

            onPointerLeave={e => {
              if (e?.internalPointer?.state.inputSource.handedness === 'left') {
                refs.joystick_zone.current.material = materials.zone_disabled
                data.joystick_zone_is_active.current = false
              }
            }}
          />
        </>
      }

      {
        hands.right &&
        <mesh
          name='jump_zone'
          ref={refs.jump_zone}
          position={[0.18, -0.16, 0.22]}
          geometry={geometries.hand_zone}
          material={materials.zone_disabled}

          onPointerEnter={e => {
            if (e?.internalPointer?.state.inputSource.handedness === 'right') {
              refs.jump_zone.current.material = materials.zone_enabled
              data.jump_zone_is_active.current = true
            }
          }}

          onPointerLeave={e => {
            if (e?.internalPointer?.state.inputSource.handedness === 'right') {
              refs.jump_zone.current.material = materials.zone_disabled
              data.jump_zone_is_active.current = false
            }
          }}
        />
      }
    </>
}

export { HandControls }