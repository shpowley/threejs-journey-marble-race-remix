const HUDPanel = ({ height = 0.07, material = null }) => {
  if (!material) return null

  return <mesh
    position={[0, 0, 0]}
    material={material}
  >
    <planeGeometry args={[1.0, height]} />
  </mesh>
}

export { HUDPanel }