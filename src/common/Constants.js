import { Vector3 } from 'three'

const RESOURCE = {
  FONT_BEBAS_NEUE: '/bebas-neue-v9-latin-regular.woff',
  MODEL_HAMBURGER: '/hamburger.glb',
  ICON_FULLSCREEN: '/fullscreen.svg',
  ICON_FULLSCREEN_EXIT: '/fullscreen_exit.svg',
  ICON_XR_MODE: '/ar_view.svg',
  ICON_XR_EXIT: '/close.svg',
  IMAGE_EXIT_TO_APP: '/exit_to_app.webp',
  IMAGE_CAMERA: '/camera.webp',
  IMAGE_CAMERA_LOCK: '/camera_locked.webp',
  IMAGE_CAMERA_ARROW: '/camera_arrow.webp',

  JOYSTICK: {
    ORIGIN: '/joystick/joystick_origin.webp',
    FOLLOW: '/joystick/joystick_follow.webp',
    KNOB: '/joystick/joystick_knob.webp'
  }
}

const XR_MODE = {
  AR: 'immersive-ar',
  VR: 'immersive-vr'
}

const CAMERA_DEFAULTS = {
  fov: 45,
  near: 0.01,
  far: 200,
  position: [2.5, 4, 6],
  scale: new Vector3(1, 1, 1)
}

export { RESOURCE, XR_MODE, CAMERA_DEFAULTS }