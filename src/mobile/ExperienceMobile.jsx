import { useRef, useState } from 'react'
import { Physics } from '@react-three/rapier'
import { IfInSessionMode, useXRSessionVisibilityState, useXRStore, XRDomOverlay, XROrigin } from '@react-three/xr'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { PlayerMobile } from './PlayerMobile.jsx'
import { InterfaceMobile } from './InterfaceMobile.jsx'
import { useGame } from '../stores/useGame.js'
import { XR_MODE } from '../common/Constants.js'

const BOARD_POSITION = {
  DEFAULT: [0, 0, 0],
  AR: [0, -3, -7]
}

const BOARD_ROTATION = {
  DEFAULT: [0, 0, 0],
  AR: [0, Math.PI * 0.3, 0]
}

const ExperienceMobile = () => {
  const refs = {
    game_board: useRef()
  }

  const
    [board_position, setBoardPosition] = useState(BOARD_POSITION.DEFAULT),
    [board_rotation, setBoardRotation] = useState(BOARD_ROTATION.DEFAULT)

  const
    block_count = useGame(state => state.block_count),
    block_seed = useGame(state => state.block_seed)

  const xr_visibility = useXRSessionVisibilityState()
  const xr_store = useXRStore()

  return <>
    <color
      attach="background"
      args={['#bdedfc']}
    />

    <XROrigin
      position={[0, -5, 8]}
      scale={10.0}
    />

    <IfInSessionMode allow={XR_MODE.AR}>
      <XRDomOverlay>
        <InterfaceMobile
          store={xr_store}
          xr_overlay={true}
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