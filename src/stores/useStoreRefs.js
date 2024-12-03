import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// STORES REACT "REFS"
// e.g. HandWithPointer.jsx > useStoreRefs.setState({ xr_space_left_index: refs.index_finger.current })
const useStoreRefs = create(
  subscribeWithSelector(
    set => ({
      xr_space_left_index: null
    })
  )
)

export { useStoreRefs }