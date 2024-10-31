import { Physics } from '@react-three/rapier'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { Player } from './Player.jsx'
import { useGame } from '../stores/useGame.js'

const Experience = () => {
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

      <Player />
    </Physics>
  </>
}

export { Experience }