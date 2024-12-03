import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { IfInSessionMode, useXRSessionVisibilityState, useXRStore, XROrigin } from '@react-three/xr'
import { Physics } from '@react-three/rapier'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { InterfaceHeadset } from './InterfaceHeadset.jsx'
import { PlayerHeadset } from './PlayerHeadset.jsx'
import { HitTestConfigHeadset, HitTestHeadset } from './HitTestHeadset.jsx'
import { GAME_STATES, useStoreGame } from '../stores/useStoreGame.js'
import { XR_MODE } from '../common/Constants.js'

const XR_SCALE = {
  VR: 2.0,
  AR: 30.0
}

const BOARD = {
  POSITION_DEFAULT: [0, 0, 0],
  ROTATION_DEFAULT: [0, 0, 0]
}

const ExperienceHeadset = () => {
  const refs = {
    xr_origin: useRef(),
    hud: useRef(),
    game_board: useRef()
  }

  const
    [board_position, setBoardPosition] = useState(BOARD.POSITION_DEFAULT),
    [board_rotation, setBoardRotation] = useState(BOARD.ROTATION_DEFAULT),
    [camera_restore, setCameraRestore] = useState()

  const camera = useThree(state => state.camera)

  const xr_visibility = useXRSessionVisibilityState()

  const
    xr_store = useXRStore(),
    xr_mode = xr_store.getState()?.mode

  const
    block_count = useStoreGame(state => state.block_count),
    block_seed = useStoreGame(state => state.block_seed)

  const handlerHitTest = result => {
    setBoardPosition(result)

    if (refs.game_board.current) {
      refs.game_board.current.visible = true
    }
  }

  useEffect(() => {
    // XR MODE
    if (xr_visibility) {
      if (xr_mode === XR_MODE.AR) {
        xr_store.setController(HitTestConfigHeadset)
        useStoreGame.setState({ phase: GAME_STATES.HIT_TEST })

        if (refs.game_board.current) {
          refs.game_board.current.visible = false
        }
      }
    }

    // NON-XR MODE
    else {
      // STOPS HIT-TESTING
      xr_store.setController()

      if (camera_restore) {
        camera.copy(camera_restore)
      }

      const game_phase = useStoreGame.getState().phase

      if (game_phase === GAME_STATES.HIT_TEST) {
        useStoreGame.setState({ phase: GAME_STATES.READY })
      }

      setBoardPosition(BOARD.POSITION_DEFAULT)
      setBoardRotation(BOARD.ROTATION_DEFAULT)

      if (refs.game_board.current) {
        refs.game_board.current.visible = true
      }
    }
  }, [xr_visibility])

  useEffect(() => {
    setCameraRestore(camera.clone())

    if (refs.xr_origin.current && refs.hud.current) {
      // camera.add(refs.hud.current)
      refs.xr_origin.current.children[0].add(refs.hud.current) // PREFERRED
    }
  }, [])

  return <>
    <color
      attach="background"
      args={[0xbdedfc]}
    />

    <XROrigin
      ref={refs.xr_origin}
      position={xr_mode === XR_MODE.AR ? [0, 0, 16] : [0, 0, 0]}
      scale={xr_mode === XR_MODE.AR ? XR_SCALE.AR : XR_SCALE.VR}
    />

    <IfInSessionMode allow={XR_MODE.AR}>
      <HitTestHeadset
        hitTestSuccess={handlerHitTest}
        ref_game_board={refs.game_board}
      />
    </IfInSessionMode>

    <InterfaceHeadset
      inner_ref={refs.hud}
      position={[0, 0, -0.5]}
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