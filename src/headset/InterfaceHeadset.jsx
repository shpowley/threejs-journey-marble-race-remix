import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

import { useGame, GAME_STATES } from '../stores/useGame.js'
import { HUDPanel } from './HUDPanel.jsx'
import { RESOURCE } from '../common/Constants.js'

const materials = {
  text: new THREE.MeshBasicMaterial({
    toneMapped: false,
    depthTest: false
  }),

  panel: new THREE.MeshBasicMaterial({
    depthTest: false,
    color: '#000',
    transparent: true,
    opacity: 0.2
  })
}

const InterfaceHeadset = ({ inner_ref = null, ...props }) => {
  const refs = {
    time: useRef(),
    restart_panel: useRef()
  }

  const
    restartGame = useGame(state => state.restartGame),
    phase = useGame(state => state.phase)

  // UPDATE GAME TIMER
  useFrame(() => {
    const { phase, start_time, end_time } = useGame.getState()

    let elapsed_time = 0

    if (phase === GAME_STATES.PLAYING) {
      elapsed_time = Date.now() - start_time
    }
    else if (phase === GAME_STATES.ENDED) {
      elapsed_time = end_time - start_time
    }
    else {
      refs.time.current.text = '0.00'
      return
    }

    // CONVERT TO SECONDS
    elapsed_time /= 1000
    elapsed_time = elapsed_time.toFixed(2)

    // UPDATE THE TIME DISPLAY
    if (refs.time.current) {
      refs.time.current.text = elapsed_time
    }
  })

  return <group
    ref={inner_ref}
    {...props}
  >

    {/* GAME TIMER */}
    <group position={[0, 0.12, 0]}>
      <HUDPanel material={materials.panel} />

      <Text
        ref={refs.time}
        material={materials.text}
        font={RESOURCE.FONT_BEBAS_NEUE}
        fontSize={0.06}
        textAlign='center'
        frustumCulled={false}
        position={[0, -0.0065, 0.01]}
        text='0.00'
      />
    </group>

    {/* RESTART BUTTON */}
    {
      phase === GAME_STATES.ENDED &&
      <group
        ref={refs.restart_panel}
        position={[0, -0.05, 0]}
        onClick={restartGame}
      >
        <HUDPanel
          height={0.14}
          material={materials.panel}
        />

        <Text
          material={materials.text}
          font={RESOURCE.FONT_BEBAS_NEUE}
          fontSize={0.11}
          textAlign='center'
          frustumCulled={false}
          position={[0, -0.0065, 0.01]}
          text='RESTART'
        />
      </group>
    }
  </group>
}

export { InterfaceHeadset }