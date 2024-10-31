import { createRoot } from 'react-dom/client'
import { isMobile, isBrowser, isWearable } from 'react-device-detect'

import { RenderViewDesktop } from './desktop/RenderViewDesktop'
import { RenderViewMobile } from './mobile/RenderViewMobile'
import { RenderViewHeadset } from './headset/RenderViewHeadset'

const root = createRoot(document.getElementById('root'))

if (isBrowser) {
  root.render(<RenderViewDesktop />)
}
else if (isMobile) {
  root.render(<RenderViewMobile />)
}
else if (isWearable) {
  root.render(<RenderViewHeadset />)
}