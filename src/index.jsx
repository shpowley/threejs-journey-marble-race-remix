import { createRoot } from 'react-dom/client'
import { isMobile, isBrowser, isWearable } from 'react-device-detect'

import { RenderViewDesktop } from './desktop/RenderViewDesktop'
import { RenderViewMobile } from './mobile/RenderViewMobile'
import { RenderViewHeadset } from './headset/RenderViewHeadset'
import { parameterEnabled } from './common/Utils'

const root = createRoot(document.getElementById('root'))
const mode_override = parameterEnabled("mode") // OVERRIDE 'react-device-detect' WITH PARAM KEY APPENDED TO THE URL (e.g. <url>?mode='')

console.info(
  `%c* OVERRIDE THE DETECTED DEVICE TYPE by appending 'desktop'|'mobile'|'hmd' to the url *

  ex. https://marble-race-remix.vercel.app/?mode=hmd

  'desktop' = desktop browser + keyboard controls
  'mobile' = mobile device with touch controls
  'hmd' = head-mounted display (e.g. oculus headset)`,
  'color:lime'
)

let valid_mode = true

if (mode_override) {
  if (mode_override === 'desktop') {
    root.render(<RenderViewDesktop />)
  }
  else if (mode_override === 'mobile') {
    root.render(<RenderViewMobile />)
  }
  else if (mode_override === 'hmd') {
    root.render(<RenderViewHeadset />)
  }
  else {
    console.warn('INVALID MODE SPECIFIED')
    valid_mode = false
  }
}
else {
  if (isBrowser) {
    root.render(<RenderViewDesktop />)
  }
  else if (isMobile) {
    root.render(<RenderViewMobile />)
  }
  else if (isWearable) {
    root.render(<RenderViewHeadset />)
  }
  else {
    console.warn('INVALID DEVICE DETECTED')
    valid_mode = false
  }
}

if (!valid_mode) {
  root.render(<div>INVALID DEVICE</div>)
}