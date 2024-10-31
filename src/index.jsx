import { createRoot } from 'react-dom/client'
import { isMobile, isBrowser, isWearable } from 'react-device-detect'

import { RenderViewDesktop } from './desktop/RenderViewDesktop'
import { RenderViewMobile } from './mobile/RenderViewMobile'
import { RenderViewHeadset } from './headset/RenderViewHeadset'

const root = createRoot(document.getElementById('root'))

if (isBrowser) {
  console.log("DESKTOP")
  root.render(<RenderViewDesktop />)
}
else if (isMobile) {
  console.log("MOBILE DEVICE")
  root.render(<RenderViewMobile />)
}
else if (isWearable) {
  console.log("XR-HEADSET")
  root.render(<RenderViewHeadset />)
}