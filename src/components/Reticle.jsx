import { useCallback, useEffect, } from 'react'

import { ReticleMesh } from './ReticleMesh'
import { useHitTest } from '../stores/useHitTest'
import { HANDEDNESS } from '../common/HitTest'

const Reticle = ({ ref_reticle, handedness, ...props }) => {
  const updateReticle = useCallback(hit_test_mat4 => {
    if (ref_reticle.current) {
      let reticle_is_valid = false

      if (hit_test_mat4) {
        hit_test_mat4.decompose(
          ref_reticle.current.position,
          ref_reticle.current.quaternion,
          ref_reticle.current.scale
        )

        reticle_is_valid = true
      }

      ref_reticle.current.visible = reticle_is_valid
    }
  }, [])

  useEffect(() => {
    const cleanupHitTest = useHitTest.subscribe(
      state => updateReticle(
        handedness === HANDEDNESS.LEFT
          ? state.hit_test_left
          : state.hit_test_right
      )
    )

    return () => {
      cleanupHitTest()
    }
  }, [])

  return <ReticleMesh
    inner_ref={ref_reticle}
    visible={false}
    {...props}
  />
}

export { Reticle }