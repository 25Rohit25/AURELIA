import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import type { MotionValue } from 'motion/react'
import * as THREE from 'three'

interface ScrollCameraProps {
  /** 0 → 1 scroll progress for the pinned section. */
  progress: MotionValue<number>
  /** Freeze the flight and hold the opening frame. */
  reducedMotion?: boolean
}

/**
 * Scroll-driven camera flight through the suite.
 *
 * Scroll position maps to distance along a Catmull-Rom spline, so the
 * camera sweeps a continuous curve — from a wide shot at the foot of the
 * bed, past the bed, and in toward the window — rather than snapping
 * between fixed viewpoints.
 *
 * Two details do most of the work:
 *
 *  - The camera *chases* the spline point with frame-rate-independent
 *    damping instead of being assigned to it. Scroll inertia therefore
 *    reads as camera weight, and a fast flick glides to a stop rather
 *    than teleporting.
 *  - A small pointer-driven offset adds handheld parallax, so the shot
 *    never feels locked to a rail even while the visitor is still.
 *
 * Reading the MotionValue inside `useFrame` keeps the whole flight off
 * the React render path — no component re-renders while scrolling.
 *
 * The camera is declared with drei's <PerspectiveCamera> rather than by
 * mutating the default camera, so `fov` stays a prop and responsive
 * framing needs no imperative assignment.
 */
export function ScrollCamera({ progress, reducedMotion = false }: ScrollCameraProps) {
  const camRef = useRef<THREE.PerspectiveCamera>(null)
  const { size } = useThree()

  const pointer = useRef({ x: 0, y: 0 })
  const current = useRef(new THREE.Vector3(2.8, 1.9, 4.4))
  const lookAt = useRef(new THREE.Vector3(0, 1.0, -0.8))
  // Scratch vectors are written every frame, so they live in a ref:
  // mutating a useMemo result is disallowed, and allocating per frame
  // would churn the GC at 60fps.
  const scratch = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() })

  const { path, targets } = useMemo(() => {
    const path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(2.8, 1.9, 4.4),
        new THREE.Vector3(1.3, 1.45, 2.3),
        new THREE.Vector3(-1.4, 1.25, 0.7),
        new THREE.Vector3(-2.0, 1.6, -1.5),
        new THREE.Vector3(0.2, 1.2, -2.3),
      ],
      false,
      'catmullrom',
      0.5,
    )
    const targets = [
      new THREE.Vector3(0, 1.0, -0.8),
      new THREE.Vector3(0, 0.95, -1.0),
      new THREE.Vector3(0.3, 0.85, -1.2),
      new THREE.Vector3(0.8, 1.0, -0.6),
      new THREE.Vector3(0, 0.9, -0.3),
    ]
    return { path, targets }
  }, [])

  // Widen the lens on tall, narrow viewports so the room still reads.
  const aspect = size.width / size.height
  const fov = aspect < 0.85 ? 62 : aspect < 1.3 ? 52 : 44

  useFrame((state, delta) => {
    const cam = camRef.current
    if (!cam) return

    const t = reducedMotion ? 0 : THREE.MathUtils.clamp(progress.get(), 0, 1)
    const s = scratch.current

    path.getPointAt(t, s.pos)

    // Piecewise-lerp the look-at target across the same 0→1 range.
    const seg = t * (targets.length - 1)
    const i = Math.min(Math.floor(seg), targets.length - 2)
    s.target.copy(targets[i]).lerp(targets[i + 1], seg - i)

    if (!reducedMotion) {
      // Handheld parallax, scaled down as the camera closes in so the
      // tight shots stay steady.
      const sway = 0.34 * (1 - t * 0.6)
      s.pos.x += pointer.current.x * sway
      s.pos.y += pointer.current.y * sway * 0.5
    }

    // Frame-rate-independent damping: the 1 - e^(-k·dt) form gives the
    // same settling time at 30fps and 144fps.
    const k = 1 - Math.exp(-3.2 * delta)
    current.current.lerp(s.pos, k)
    lookAt.current.lerp(s.target, k)

    cam.position.copy(current.current)
    cam.lookAt(lookAt.current)

    // Track the pointer in normalised device coordinates.
    pointer.current.x = state.pointer.x
    pointer.current.y = state.pointer.y
  })

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      fov={fov}
      near={0.1}
      far={100}
      position={[2.8, 1.9, 4.4]}
    />
  )
}
