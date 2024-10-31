import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js'

const reticle = {
  geometry: BufferGeometryUtils.mergeGeometries([
    new THREE.RingGeometry(0.05, 0.06, 30),
    new THREE.CircleGeometry(0.007, 12)
  ]).rotateX(Math.PI * 0.5),

  material: new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: '#ffffff'
  })
}

const ReticleMesh = props => {
  return <mesh
    ref={props.inner_ref}
    geometry={reticle.geometry}
    material={reticle.material}
    {...props}
  />
}

export { ReticleMesh }