import { Physics } from '@react-three/rapier'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { Player } from './Player.jsx'
import { useStoreGame } from '../stores/useStoreGame.js'

const Experience = () => {
  const
    block_count = useStoreGame(state => state.block_count),
    block_seed = useStoreGame(state => state.block_seed)

  return <>
    <color
      attach="background"
      args={[0xbdedfc]}
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