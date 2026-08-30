import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import type { MotionValue } from 'motion/react'
import * as THREE from 'three'

import type { TourKeyframe, TourStation } from '@/data/tour'

interface TourCameraProps {
  stations: TourStation[]
  /** 0 → 1 across the whole pinned tour. */
  progress: MotionValue<number>
  reducedMotion?: boolean
}

const DEG = Math.PI / 180

/**
 * Scroll-driven camera for the panorama walkthrough.
 *
 * Scroll maps onto a continuous path through every station's keyframes:
 * yaw and pitch swing the view around the real room, field of view
 * narrows as you lean in, and a small forward dolly pushes the camera
 * off the sphere's centre so the move reads as walking rather than
 * zooming.
 *
 * Angles are interpolated with shortest-arc wrapping, so a sweep across
 * the ±180° seam turns the short way instead of spinning the long way
 * round.
 *
 * The camera *chases* the target with frame-rate-independent damping.
 * Scroll inertia therefore becomes camera weight: a fast flick glides to
 * a stop instead of snapping. Everything is read from the MotionValue
 * inside `useFrame`, so scrolling triggers no React renders.
 */
export function TourCamera({ stations, progress, reducedMotion = false }: TourCameraProps) {
  const camRef = useRef<THREE.PerspectiveCamera>(null)
  const { size } = useThree()

  // Flatten every station's keyframes into one continuous track.
  const track = useMemo(() => stations.flatMap((s) => s.frames), [stations])

  const state = useRef({
    yaw: track[0].yaw,
    pitch: track[0].pitch,
    fov: track[0].fov,
    dolly: track[0].dolly,
    roll: track[0].roll ?? 0,
  })
  const pointer = useRef({ x: 0, y: 0 })

  // Widen the lens on tall, narrow viewports so a room still reads.
  const aspect = size.width / size.height
  const fovBoost = aspect < 0.8 ? 16 : aspect < 1.2 ? 8 : 0

  useFrame((s, delta) => {
    const cam = camRef.current
    if (!cam) return

    const t = reducedMotion ? 0 : THREE.MathUtils.clamp(progress.get(), 0, 1)

    // Position along the flattened keyframe track.
    const seg = t * (track.length - 1)
    const i = Math.min(Math.floor(seg), track.length - 2)
    const f = seg - i
    const a: TourKeyframe = track[i]
    const b: TourKeyframe = track[i + 1]

    // Ease within each segment. Without this the camera moves at constant
    // velocity and stops dead at every keyframe, which reads mechanical;
    // easing makes each move start and settle like an operator's hand.
    const e = smoothstep(f)

    const targetYaw = a.yaw + shortestArc(a.yaw, b.yaw) * e
    const targetPitch = THREE.MathUtils.lerp(a.pitch, b.pitch, e)
    const targetFov = THREE.MathUtils.lerp(a.fov, b.fov, e) + fovBoost
    const targetDolly = THREE.MathUtils.lerp(a.dolly, b.dolly, e)
    const targetRoll = THREE.MathUtils.lerp(a.roll ?? 0, b.roll ?? 0, e)

    const k = 1 - Math.exp(-4.2 * delta)
    state.current.yaw += (targetYaw - state.current.yaw) * k
    state.current.pitch += (targetPitch - state.current.pitch) * k
    state.current.fov += (targetFov - state.current.fov) * k
    state.current.dolly += (targetDolly - state.current.dolly) * k
    state.current.roll += (targetRoll - state.current.roll) * k

    // Pointer adds a small handheld drift on top of the scripted move.
    const swayX = reducedMotion ? 0 : pointer.current.x * 5.5
    const swayY = reducedMotion ? 0 : pointer.current.y * 3

    cam.rotation.order = 'YXZ'
    cam.rotation.y = (state.current.yaw + swayX) * DEG
    cam.rotation.x = (state.current.pitch + swayY) * DEG
    // A degree or two of dutch tilt — almost subliminal, but it is what
    // stops the move reading as a machine panning.
    cam.rotation.z = state.current.roll * DEG

    // Push along the view direction — genuine parallax, not a zoom.
    cam.position.set(0, 0, 0)
    cam.translateZ(-state.current.dolly)

    if (Math.abs(cam.fov - state.current.fov) > 0.01) {
      cam.fov = state.current.fov
      cam.updateProjectionMatrix()
    }

    pointer.current.x = s.pointer.x
    pointer.current.y = s.pointer.y
  })

  return <PerspectiveCamera ref={camRef} makeDefault fov={track[0].fov} near={0.1} far={40} />
}

/** Hermite ease-in-out across a single segment. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Signed shortest angular distance from `a` to `b`, in degrees. */
function shortestArc(a: number, b: number): number {
  return ((((b - a) % 360) + 540) % 360) - 180
}
