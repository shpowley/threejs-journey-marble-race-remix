import { Physics } from '@react-three/rapier'

import Lights from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { PlayerMobile } from './PlayerMobile.jsx'
import { useGame } from '../stores/useGame.js'

export default function ExperienceMobile() {
  const
    block_count = useGame(state => state.block_count),
    block_seed = useGame(state => state.block_seed)

  return <>
    <color
      attach="background"
      args={['#bdedfc']}
    />

    <Physics debug={false} >
      <Lights />

      <Level
        count={block_count}
        seed={block_seed}
      />

      <PlayerMobile />
    </Physics>
  </>
}