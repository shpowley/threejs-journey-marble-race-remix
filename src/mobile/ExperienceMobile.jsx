import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { IfInSessionMode, useXRSessionVisibilityState, useXRStore, XRDomOverlay, XROrigin } from '@react-three/xr'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { PlayerMobile } from './PlayerMobile.jsx'
import { InterfaceMobile } from './InterfaceMobile.jsx'
import { HitTestMobile } from './HitTestMobile.jsx'
import { GAME_STATES, useStoreGame } from '../stores/useStoreGame.js'
import { useStoreWebXR } from '../stores/useStoreWebXR.js'
import { XR_MODE } from '../common/Constants.js'

const BOARD = {
  POSITION_DEFAULT: [0, 0, 0],
  ROTATION_DEFAULT: [0, 0, 0]
}

const ExperienceMobile = () => {
  const refs = {
    game_board: useRef()
  }

  const
    [board_position, setBoardPosition] = useState(BOARD.POSITION_DEFAULT),
    [board_rotation, setBoardRotation] = useState(BOARD.ROTATION_DEFAULT),
    [camera_restore, setCameraRestore] = useState(),
    [play_button_visible, setARPlayButtonVisible] = useState(false)

  const camera = useThree(state => state.camera)

  const
    block_count = useStoreGame(state => state.block_count),
    block_seed = useStoreGame(state => state.block_seed)

  const xr_visibility = useXRSessionVisibilityState()
  const xr_store = useXRStore()

  const handlerHitTest = result => {
    setBoardPosition(result)

    if (refs.game_board.current) {
      refs.game_board.current.visible = true
      setARPlayButtonVisible(true)
    }
  }

  useEffect(() => {

    // XR MODE (AR ONLY)
    if (xr_visibility) {
      useStoreGame.setState({ phase: GAME_STATES.HIT_TEST })
      useStoreWebXR.setState({ xr_visibility: xr_visibility })
      setARPlayButtonVisible(false)

      if (refs.game_board.current) {
        refs.game_board.current.visible = false
      }
    }

    // NON-XR MODE
    else {
      useStoreWebXR.setState({ xr_visibility: null })

      // ATTEMPTS TO RESTORE CAMERA, OTHERWISE VISUALLY SQUISHED
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
  }, [])

  return <>
    <color
      attach="background"
      args={[0xbdedfc]}
    />

    <XROrigin
      position={[0, -5, 8]}
      scale={10.0}
    />

    <IfInSessionMode allow={XR_MODE.AR}>
      <HitTestMobile hitTestSuccess={handlerHitTest} />

      <XRDomOverlay>
        <InterfaceMobile
          store={xr_store}
          xr_visibility={xr_visibility}
          xr_overlay={true}
          ar_play_button_visible={play_button_visible}
        />
      </XRDomOverlay>
    </IfInSessionMode>

    <group
      ref={refs.game_board}
      position={board_position}
      rotation={board_rotation}
    >
      <Physics debug={false} >
        <Lights shadows={!xr_visibility} />

        <Level
          count={block_count}
          seed={block_seed}
        />

        <PlayerMobile />
      </Physics>
    </group>
  </>
}

export { ExperienceMobile }