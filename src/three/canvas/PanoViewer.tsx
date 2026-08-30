import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, useTexture } from '@react-three/drei'
import { useReducedMotion } from 'motion/react'
import * as THREE from 'three'

import { panoramaUrl } from '@/data/tour'
import { useWebGLTier } from '@/hooks/useWebGL'
import { useIsCompact } from '@/hooks/useViewport'
import { Image } from '@/components/common/Image'
import { palette } from '@/lib/palette'
import { cn } from '@/lib/utils'

interface PanoViewerProps {
  panorama: string
  className?: string
  fallbackImageId: string
  fallbackAlt: string
}

/**
 * Drag-to-look viewer for a single 360° room.
 *
 * OrbitControls is the wrong tool here: it orbits a camera *around* a
 * target, whereas a panorama needs the camera pinned at the centre of
 * the sphere, turning in place. So this drives yaw and pitch directly
 * and keeps a little inertia after release, which is what makes the
 * room feel like it has mass.
 */
export function PanoViewer({
  panorama,
  className,
  fallbackImageId,
  fallbackAlt,
}: PanoViewerProps) {
  const tier = useWebGLTier()
  const compact = useIsCompact()
  const [ready, setReady] = useState(false)

  if (tier === 'unsupported') {
    return (
      <div className={cn('relative', className)}>
        <Image id={fallbackImageId} alt={fallbackAlt} className="size-full" priority />
        <p className="text-bone-muted absolute inset-x-0 bottom-4 text-center text-[10px] tracking-[0.2em] uppercase">
          360° view unavailable on this device
        </p>
      </div>
    )
  }

  return (
    /* `touch-pan-y` keeps vertical page scrolling working on a phone while
       still allowing a horizontal drag to turn the room; `touch-none`
       would trap the finger and make the page feel stuck. */
    <div data-lenis-prevent className={cn('relative touch-pan-y', className)}>
      <Canvas
        dpr={[1, tier === 'high' ? 2 : 1.5]}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        onCreated={() => setReady(true)}
        className={cn(
          'cursor-grab transition-opacity duration-1000 active:cursor-grabbing',
          ready ? 'opacity-100' : 'opacity-0',
        )}
      >
        <color attach="background" args={[palette.ink]} />
        <Suspense fallback={null}>
          <PanoRoom url={panoramaUrl(panorama, compact)} />
        </Suspense>
        <LookCamera />
      </Canvas>

      <p className="text-bone-muted/70 pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.22em] uppercase">
        Drag to look around
      </p>
    </div>
  )
}

function PanoRoom({ url }: { url: string }) {
  // Configured in useTexture's callback, not an effect — a JPEG panorama
  // must be tagged sRGB or it renders visibly washed out.
  const texture = useTexture(url, (t) => {
    const tex = Array.isArray(t) ? t[0] : t
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  })

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[10, 64, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  )
}

const DEG = Math.PI / 180

/**
 * Pointer-driven look camera.
 *
 * Declared with drei's <PerspectiveCamera> and driven through its ref,
 * so nothing mutates the camera handed out by `useThree`. Pitch is
 * clamped short of the poles, where an equirectangular projection
 * degenerates into a pinwheel.
 */
function LookCamera() {
  const camRef = useRef<THREE.PerspectiveCamera>(null)
  const { gl, size } = useThree()
  const reducedMotion = useReducedMotion() ?? false

  const state = useRef({
    yaw: 0,
    pitch: 0,
    velYaw: 0,
    velPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  })

  useLayoutEffect(() => {
    const el = gl.domElement
    const s = state.current

    const down = (e: PointerEvent) => {
      s.dragging = true
      s.lastX = e.clientX
      s.lastY = e.clientY
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!s.dragging) return
      s.velYaw = -(e.clientX - s.lastX) * 0.13
      s.velPitch = -(e.clientY - s.lastY) * 0.13
      s.lastX = e.clientX
      s.lastY = e.clientY
    }
    const up = (e: PointerEvent) => {
      s.dragging = false
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useFrame((_, delta) => {
    const cam = camRef.current
    if (!cam) return
    const s = state.current

    s.yaw += s.velYaw
    s.pitch += s.velPitch

    // Hold velocity while dragging, coast to rest after release.
    s.velYaw *= s.dragging ? 0.55 : Math.exp(-3.4 * delta)
    s.velPitch *= s.dragging ? 0.55 : Math.exp(-3.4 * delta)

    // A slow idle drift, so a still page is never completely inert.
    if (!s.dragging && !reducedMotion && Math.abs(s.velYaw) < 0.01) {
      s.yaw -= delta * 0.9
    }

    s.pitch = Math.max(-72, Math.min(72, s.pitch))

    cam.rotation.order = 'YXZ'
    cam.rotation.y = s.yaw * DEG
    cam.rotation.x = s.pitch * DEG
    cam.rotation.z = 0
  })

  // Widen the lens on narrow viewports so the room still reads.
  const aspect = size.width / size.height
  const fov = aspect < 0.9 ? 88 : aspect < 1.4 ? 78 : 70

  return <PerspectiveCamera ref={camRef} makeDefault fov={fov} near={0.1} far={40} position={[0, 0, 0]} />
}
