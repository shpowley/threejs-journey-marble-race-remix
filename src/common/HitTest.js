import * as THREE from 'three'

import { useStoreHitTest } from '../stores/useStoreHitTest'

const HANDEDNESS = {
  LEFT: 'left',
  RIGHT: 'right',
  SCREEN: 'none'
}

const helper_mat4 = new THREE.Matrix4()

// HIT-TEST RESULT STORED IN ZUSTAND STORE
function onResults(handedness, results, getWorldMatrix) {
  if (results && results.length > 0 && results[0]) {
    getWorldMatrix(helper_mat4, results[0])

    // LEFT
    if (handedness === HANDEDNESS.LEFT) {
      useStoreHitTest.setState({ hit_test_left: helper_mat4.clone() })
    }

    // RIGHT || SCREEN
    else {
      useStoreHitTest.setState({ hit_test_right: helper_mat4.clone() })
    }
  }
}

// TEST IF HIT-TEST SURFACE IS FLAT AND NOT TOO HIGH
const validateSurface = ref_reticle => {
  if (ref_reticle.current) {
    if (ref_reticle.current.position.y < 50) {
      const direction = new THREE.Vector3()

      ref_reticle.current.getWorldDirection(direction)
      direction.normalize()

      const dot_product = Math.abs(direction.dot(THREE.Object3D.DEFAULT_UP))

      if (dot_product < 0.05) {
        return ref_reticle.current.position.clone()
      }
    }
  }

  return null
}

export { HANDEDNESS, onResults, validateSurface }