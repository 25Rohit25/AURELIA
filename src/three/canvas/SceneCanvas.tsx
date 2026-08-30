import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, Preload } from '@react-three/drei'
import { useReducedMotion, type MotionValue } from 'motion/react'
import * as THREE from 'three'

import { HDRI_URL, SUITE_MODEL_URL } from '@/three/config'
import { SuiteRoom } from '@/three/scenes/SuiteRoom'
import { SuiteModel } from '@/three/models/SuiteModel'
import { PostFX } from '@/three/effects/PostFX'
import { Hotspot } from '@/three/scenes/Hotspot'
import { ScrollCamera } from '@/three/controls/ScrollCamera'
import { useWebGLTier } from '@/hooks/useWebGL'
import { Image } from '@/components/common/Image'
import { palette } from '@/lib/palette'
import { cn } from '@/lib/utils'

interface SceneCanvasProps {
  /** Photo shown if WebGL is unavailable, so the section is never blank. */
  fallbackImageId: string
  fallbackAlt: string
  className?: string
  showHotspots?: boolean
  /**
   * `scroll`  — camera flies a spline driven by `progress` (needs `progress`).
   * `orbit`   — visitor drags to look around.
   * `ambient` — camera drifts on its own, pointer events ignored.
   */
  mode?: 'scroll' | 'orbit' | 'ambient'
  progress?: MotionValue<number>
}

/**
 * The single entry point for 3D on the site.
 *
 * Product code renders <SceneCanvas /> and never touches R3F directly.
 * Everything defensive lives here: the WebGL capability gate, the
 * reduced-motion gate, the Suspense boundary, and the photographic
 * fallback for machines that cannot render at all.
 */
export function SceneCanvas({
  fallbackImageId,
  fallbackAlt,
  className,
  showHotspots = true,
  mode = 'orbit',
  progress,
}: SceneCanvasProps) {
  const tier = useWebGLTier()
  const reducedMotion = useReducedMotion() ?? false
  const [ready, setReady] = useState(false)

  // No WebGL: show the photograph instead of an empty rectangle.
  if (tier === 'unsupported') {
    return (
      <div className={cn('relative', className)}>
        <Image id={fallbackImageId} alt={fallbackAlt} className="size-full" priority />
        <p className="text-bone-muted absolute inset-x-0 bottom-4 text-center text-[10px] tracking-[0.2em] uppercase">
          3D tour unavailable on this device
        </p>
      </div>
    )
  }

  const scrollDriven = mode === 'scroll' && progress

  return (
    <div className={cn('relative', className)}>
      <Canvas
        shadows
        // Cap DPR: a 3x retina display renders 9x the pixels for no visible gain.
        dpr={[1, tier === 'high' ? 2 : 1.5]}
        gl={{
          antialias: tier === 'high',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [2.8, 1.9, 4.4], fov: 44, near: 0.1, far: 100 }}
        onCreated={() => setReady(true)}
        className={cn(
          'transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
          ready ? 'opacity-100' : 'opacity-0',
          mode !== 'orbit' && 'pointer-events-none',
        )}
      >
        <color attach="background" args={[palette.ink]} />
        <fog attach="fog" args={[palette.ink, 12, 26]} />

        <Suspense fallback={null}>
          {/* Warm late-afternoon key through the window aperture. */}
          <directionalLight
            position={[-4, 5.5, -7]}
            intensity={3.4}
            color="#ffcf9a"
            castShadow
            shadow-mapSize={tier === 'high' ? [2048, 2048] : [1024, 1024]}
            shadow-bias={-0.0004}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
          />
          <ambientLight intensity={0.25} color="#b8c4d0" />

          {SUITE_MODEL_URL ? <SuiteModel url={SUITE_MODEL_URL} /> : <SuiteRoom />}

          {showHotspots && (
            <>
              <Hotspot position={[0, 1.35, -1.2]} label="Hand-turned linen" />
              <Hotspot position={[-2.3, 2.2, -3.3]} label="West-facing aperture" />
              <Hotspot position={[1.85, 0.95, -1.5]} label="Bronze practicals" />
            </>
          )}

          <ContactShadows
            position={[0, 0.002, 0]}
            opacity={0.5}
            scale={14}
            blur={2.6}
            far={4}
            resolution={tier === 'high' ? 1024 : 512}
          />

          {/* Vendored CC0 HDRI — no external CDN at runtime. */}
          <Environment files={HDRI_URL} environmentIntensity={0.6} />

          <PostFX tier={tier} reducedMotion={reducedMotion} />
          <Preload all />
        </Suspense>

        {scrollDriven ? (
          <ScrollCamera progress={progress} reducedMotion={reducedMotion} />
        ) : (
          <OrbitControls
            makeDefault
            target={[0, 1.0, -0.6]}
            // Must stay enabled even in ambient mode: drei only calls
            // controls.update() while enabled, and autoRotate runs inside it.
            // Input is gated per-interaction instead.
            enabled
            enableRotate={mode === 'orbit'}
            enableZoom={mode === 'orbit'}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minDistance={2.6}
            maxDistance={7.5}
            // Keep the camera inside the room and above the floor.
            minPolarAngle={0.55}
            maxPolarAngle={Math.PI / 2.05}
            minAzimuthAngle={-0.75}
            maxAzimuthAngle={0.75}
            autoRotate={mode === 'ambient' && !reducedMotion}
            autoRotateSpeed={0.22}
          />
        )}
      </Canvas>

      {mode === 'orbit' && (
        <p className="text-bone-muted/70 pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.22em] uppercase">
          Drag to look around
        </p>
      )}
    </div>
  )
}
