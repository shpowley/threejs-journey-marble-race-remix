import { useCallback, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { XROrigin } from '@react-three/xr'
import { Physics } from '@react-three/rapier'

import { Lights } from '../Lights.jsx'
import { Level } from '../Level.jsx'
import { InterfaceHeadset } from './InterfaceHeadset.jsx'
import { PlayerHeadset } from './PlayerHeadset.jsx'
import { useGame } from '../stores/useGame.js'


const ExperienceHeadset = () => {
  const refs = {
    xr_origin: useRef(),
    hud: useRef()
  }

  const
    block_count = useGame(state => state.block_count),
    block_seed = useGame(state => state.block_seed)

  // THREE.JS XR 'sessionstart' AND 'sessionend' EVENTS
  const renderer_xr = useThree(state => state.gl.xr)

  const handlers = {
    XRSessionStart: useCallback(() => {
      if (refs.hud.current) {
        refs.hud.current.visible = true
      }
    }),

    XRSessionEnd: useCallback(() => {
      if (refs.hud.current) {
        refs.hud.current.visible = false
      }
    })
  }

  useEffect(() => {
    renderer_xr.addEventListener('sessionstart', handlers.XRSessionStart)
    renderer_xr.addEventListener('sessionend', handlers.XRSessionEnd)

    if (refs.xr_origin.current && refs.hud.current) {
      // camera.add(refs.hud.current)
      refs.xr_origin.current.children[0].add(refs.hud.current) // PREFERRED
    }

    return () => {
      renderer_xr.removeEventListener('sessionstart', handlers.XRSessionStart)
      renderer_xr.removeEventListener('sessionend', handlers.XRSessionEnd)
    }
  }, [])

  return <>
    <color
      attach="background"
      args={['#bdedfc']}
    />

    <XROrigin
      ref={refs.xr_origin}
      scale={2.0}
    />

    <InterfaceHeadset
      inner_ref={refs.hud}
      position={[0, 0, -0.5]}
      visible={false}
    />

    <Physics debug={false} >
      <Lights />

      <Level
        count={block_count}
        seed={block_seed}
      />

      <PlayerHeadset ref_xr_origin={refs.xr_origin} />
    </Physics>
  </>
}

export { ExperienceHeadset }