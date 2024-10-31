import { useEffect, useRef, useState } from 'react'
import { useXRSessionVisibilityState, useXRStore, XROrigin } from '@react-three/xr'
import { Physics } from '@react-three/rapier'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { InterfaceHeadset } from './InterfaceHeadset.jsx'
import { PlayerHeadset } from './PlayerHeadset.jsx'
import { useGame } from '../stores/useGame.js'
import { XR_MODE } from '../common/Constants.js'

const XR_SCALE = {
  VR: 2.0,
  AR: 30.0
}

const BOARD_POSITION = {
  DEFAULT: [0, 0, 0],
  AR: [10, 5, -5]
}

const BOARD_ROTATION = {
  DEFAULT: [0, 0, 0],
  AR: [0, Math.PI * 0.3, 0]
}

const ExperienceHeadset = () => {
  const refs = {
    xr_origin: useRef(),
    hud: useRef(),
    game_board: useRef()
  }

  const
    [board_position, setBoardPosition] = useState(BOARD_POSITION.DEFAULT),
    [board_rotation, setBoardRotation] = useState(BOARD_ROTATION.DEFAULT)

  const xr_visibility = useXRSessionVisibilityState()
  const xr_mode = useXRStore().getState()?.mode

  const
    block_count = useGame(state => state.block_count),
    block_seed = useGame(state => state.block_seed)

  useEffect(() => {
    if (xr_visibility) {
      if (xr_mode === XR_MODE.AR) {
        setBoardPosition(BOARD_POSITION.AR)
      }

      if (refs.hud.current) {
        refs.hud.current.visible = true
      }
    }
    else {
      setBoardPosition(BOARD_POSITION.DEFAULT)

      if (refs.hud.current) {
        refs.hud.current.visible = false
      }
    }
  }, [xr_visibility])

  // ATTACHES "HUD" MESHES TO HEADSET / XR-CAMERA
  useEffect(() => {
    if (refs.xr_origin.current && refs.hud.current) {
      // camera.add(refs.hud.current)
      refs.xr_origin.current.children[0].add(refs.hud.current) // PREFERRED
    }
  }, [])

  return <>
    <color
      attach="background"
      args={['#bdedfc']}
    />

    <XROrigin
      ref={refs.xr_origin}
      position={xr_mode === XR_MODE.AR ? [0, 0, 16] : [0, 0, 0]}
      scale={xr_mode === XR_MODE.AR ? XR_SCALE.AR : XR_SCALE.VR}
    />

    <InterfaceHeadset
      inner_ref={refs.hud}
      position={[0, 0, -0.5]}
      visible={false}
    />

    <group
      ref={refs.game_board}
      position={board_position}
      rotation={board_rotation}
    >
      <Physics debug={false} >
        <Lights
          ref_xr_origin={refs.xr_origin}
          shadows={!xr_visibility || xr_mode === XR_MODE.VR}
        />

        <Level
          count={block_count}
          seed={block_seed}
        />

        <PlayerHeadset
          ref_xr_origin={refs.xr_origin}
          xr_mode={xr_mode}
        />
      </Physics>
    </group>
  </>
}

export { ExperienceHeadset }