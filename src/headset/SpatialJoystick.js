import * as THREE from 'three'

const SPATIAL_MODE = {
  CYLINDER: 1,
  SPHERE: 2
}

/** SPATIAL VIRTUAL JOYSTICK WITH "FOLLOW MODE"
 * - INSPIRED BY MANAPOTION 2D VIRTUAL JOYSTICK, REFACTORED SOMEWHAT FOR 3D SPACE
 */
class SpatialJoystick {
  #camera

  #max_radius
  #buffer_radius

  #follow_mode_enabled

  #displacement_mode = SPATIAL_MODE.CYLINDER

  #is_active = false
  #origin_initialized = false

  #pos_origin = new THREE.Vector3()
  #pos_current = new THREE.Vector3()
  #displacement = new THREE.Vector3() // normalized -1 to 1

  #helper_vec3 = new THREE.Vector3()
  #helper_xz = new THREE.Vector2()
  #helper_length = 0

  /**
   * @param camera (required) three.js webxr camera
   * @param max_radius spatial joystick interactive origin volume
   * @param buffer_radius extends #max_radius, acting as a buffer-zone before triggering follow-mode
   * @param follow_mode if enabled, joystick origin "follows" movement exceeding the interactive volume
   */
  constructor({ camera = null, max_radius = 1.0, buffer_radius = 0.2, follow_mode = true }) {
    this.#camera = camera
    this.#max_radius = max_radius
    this.#buffer_radius = buffer_radius
    this.#follow_mode_enabled = follow_mode
  }

  #transformToCameraSpace(xr_space) {
    this.#helper_vec3.setFromMatrixPosition(xr_space.matrixWorld) // Object3D base class world position
    this.#helper_vec3.applyMatrix4(this.#camera.matrixWorldInverse) // determines position relative to the camera
  }

  #moveCylindrical() {

    // PART 1: x/z-vector components : side-to-side + forward-back
    this.#helper_xz.set(this.#displacement.x, this.#displacement.z)
    this.#helper_length = this.#helper_xz.length()

    if (this.#helper_length > this.#max_radius) {
      if (this.#follow_mode_enabled && this.#helper_length > (this.#max_radius + this.#buffer_radius)) {
        this.#helper_vec3.copy(this.#displacement)
        this.#helper_vec3.normalize().multiplyScalar(this.#helper_length - this.#max_radius - this.#buffer_radius)

        this.#pos_origin.set(
          this.#pos_origin.x + this.#helper_vec3.x,
          this.#pos_origin.y,
          this.#pos_origin.z + this.#helper_vec3.z
        )
      }

      // MIN OR MAX DISPLACEMENT
      this.#helper_xz.normalize()

      this.#displacement.set(
        this.#helper_xz.x,
        this.#displacement.y,
        this.#helper_xz.y
      )
    }
    else {
      this.#displacement.set(
        this.#displacement.x / this.#max_radius,
        this.#displacement.y,
        this.#displacement.z / this.#max_radius
      )
    }

    // PART 2: y-vector component : up-down
    this.#helper_length = Math.abs(this.#displacement.y)

    if (this.#helper_length > this.#max_radius) {
      if (this.#follow_mode_enabled && this.#helper_length > (this.#max_radius + this.#buffer_radius)) {
        this.#pos_origin.setY(this.#pos_origin.y + (this.#helper_length - this.#max_radius  - this.#buffer_radius) * Math.sign(this.#displacement.y))
      }

      // MIN OR MAX DISPLACEMENT
      this.#displacement.setY(Math.sign(this.#displacement.y))
    }
    else {
      // "SYMMETRIC MIN-MAX NORMALIZATION" FROM [-1 TO 1]
      this.#displacement.setY(this.#displacement.y / this.#max_radius)
    }
  }

  #moveSpherical() {
    this.#helper_length = this.#displacement.length()

    if (this.#displacement.length() > this.#max_radius) {
      if (this.#follow_mode_enabled && this.#helper_length > (this.#max_radius + this.#buffer_radius)) {
        this.#helper_vec3.copy(this.#displacement)
        this.#helper_vec3.normalize().multiplyScalar(this.#helper_length - this.#max_radius - this.#buffer_radius)
        this.#pos_origin.add(this.#helper_vec3)
      }

      this.#displacement.normalize()
    }
    else {
      // "SYMMETRIC MIN-MAX NORMALIZATION" FROM [-1 TO 1]
      this.#displacement.divideScalar(this.#max_radius)
    }
  }

  pinchStart() {
    this.#is_active = true
    this.#origin_initialized = false
    this.#displacement.set(0, 0, 0)
  }

  pinchEnd() {
    this.#is_active = false
    this.#origin_initialized = false
    this.#pos_origin.set(0, 0, 0)
    this.#pos_current.set(0, 0, 0)
    this.#displacement.set(0, 0, 0)
  }

  pinchMove(xr_space) {
    if (!this.#is_active) return
    this.#transformToCameraSpace(xr_space)

    this.#pos_current.copy(this.#helper_vec3)

    // COMMENT: originally in pinchStart(), but moved here due to <XRSpace> drift displacement..
    if (!this.#origin_initialized) {
      this.#pos_origin.copy(this.#helper_vec3)
      this.#displacement.set(0, 0, 0)
      this.#origin_initialized = true
      return
    }

    this.#displacement.subVectors(this.#pos_current, this.#pos_origin)

    // "CYLINDRICAL" MODE
    // - x/z plane can be envisioned as a circle, allowing full [-1 to 1] displacement
    // - y-axis is cylinder height, allowing separate [-1 to 1] displacement
    if (this.#displacement_mode === SPATIAL_MODE.CYLINDER) {
      this.#moveCylindrical()
    }

    // "SPHERICAL" MODE
    // - normalized along x/y/z (the original implementation)
    // - much simpler, but more appropriate for omni-directional control
    else {
      this.#moveSpherical()
    }
  }

  get max_radius() {
    return this.#max_radius
  }

  get buffer_radius() {
    return this.#buffer_radius
  }

  get follow_mode() {
    return this.#follow_mode_enabled
  }

  get active() {
    return this.#is_active
  }

  get origin() {
    return this.#pos_origin
  }

  get position() {
    return this.#pos_current
  }

  get displacement() {
    return this.#displacement
  }
}

export { SpatialJoystick }