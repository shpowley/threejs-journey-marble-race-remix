import ReactDOM from 'react-dom/client'
import { isMobile, isBrowser } from 'react-device-detect'

import { RenderViewDesktop } from './desktop/RenderViewDesktop'
import { RenderViewMobile } from './mobile/RenderViewMobile'

const root = ReactDOM.createRoot(document.getElementById('root'))

if (isBrowser) {
  root.render(<RenderViewDesktop />)
}
else if (isMobile) {
  root.render(<RenderViewMobile />)
}