import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion, type MotionValue } from 'motion/react'
import * as THREE from 'three'

import { panoramaUrl, type TourStation } from '@/data/tour'
import { PanoSphere } from '@/three/scenes/PanoSphere'
import { TourCamera } from '@/three/controls/TourCamera'
import { PanoPostFX } from '@/three/effects/PanoPostFX'
import { useWebGLTier } from '@/hooks/useWebGL'
import { useIsCompact } from '@/hooks/useViewport'
import { Image } from '@/components/common/Image'
import { palette } from '@/lib/palette'
import { cn } from '@/lib/utils'

interface TourCanvasProps {
  stations: TourStation[]
  progress: MotionValue<number>
  className?: string
  /** Photo shown when WebGL is unavailable. */
  fallbackImageId: string
  fallbackAlt: string
}

/**
 * The scroll-driven photographic walkthrough.
 *
 * Real 360° captures on spheres, a camera that looks around each room
 * and pushes through into the next. Only the rooms adjacent to the
 * current one are mounted, so the visitor downloads two panoramas rather
 * than five before anything appears.
 */
export function TourCanvas({
  stations,
  progress,
  className,
  fallbackImageId,
  fallbackAlt,
}: TourCanvasProps) {
  const tier = useWebGLTier()
  const compact = useIsCompact()
  const reducedMotion = useReducedMotion() ?? false
  const [ready, setReady] = useState(false)

  if (tier === 'unsupported') {
    return (
      <div className={cn('relative', className)}>
        <Image id={fallbackImageId} alt={fallbackAlt} className="size-full" priority />
        <p className="text-bone-muted absolute inset-x-0 bottom-4 text-center text-[10px] tracking-[0.2em] uppercase">
          360° tour unavailable on this device
        </p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <Canvas
        dpr={[1, tier === 'high' ? 2 : 1.5]}
        gl={{
          antialias: false,
          toneMapping: THREE.NoToneMapping,
          powerPreference: 'high-performance',
        }}
        onCreated={() => setReady(true)}
        className={cn(
          'pointer-events-none transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
          ready ? 'opacity-100' : 'opacity-0',
        )}
      >
        <color attach="background" args={[palette.ink]} />

        <StationWindow stations={stations} progress={progress} compact={compact} />

        <TourCamera stations={stations} progress={progress} reducedMotion={reducedMotion} />
        <PanoPostFX tier={tier} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}

/**
 * Mounts only the current station and its neighbours.
 *
 * The active index is tracked in `useFrame` and written to state only
 * when it actually changes — four times across the whole tour — so
 * scrolling stays render-free while textures still load lazily.
 */
function StationWindow({
  stations,
  progress,
  compact,
}: {
  stations: TourStation[]
  progress: MotionValue<number>
  compact: boolean
}) {
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  useFrame(() => {
    const i = Math.min(
      stations.length - 1,
      Math.max(0, Math.floor(progress.get() * stations.length)),
    )
    if (i !== activeRef.current) {
      activeRef.current = i
      setActive(i)
    }
  })

  return (
    <>
      {stations.map((station, i) =>
        Math.abs(i - active) <= 1 ? (
          // Each station suspends independently, so a room still loading
          // never blanks the one currently on screen.
          <Suspense key={station.id} fallback={null}>
            <PanoSphere
              url={panoramaUrl(station.panorama, compact)}
              index={i}
              total={stations.length}
              progress={progress}
            />
          </Suspense>
        ) : null,
      )}
    </>
  )
}
