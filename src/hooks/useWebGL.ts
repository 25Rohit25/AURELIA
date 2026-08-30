import { useState } from 'react'

export type WebGLTier = 'unsupported' | 'low' | 'high'

/**
 * Probes WebGL availability and rough GPU capability.
 *
 * The site must never hand a client a blank rectangle on a machine
 * without WebGL, and must not run bloom + depth-of-field on weak
 * integrated graphics. Everything 3D reads this before deciding what
 * to render.
 *
 * The probe is synchronous and its answer cannot change mid-session, so
 * it runs once, is cached at module scope, and is read through a lazy
 * `useState` initialiser. Doing it in an effect instead would set state
 * during mount and trigger a cascading re-render on every 3D section.
 */
let cachedTier: WebGLTier | undefined

function probeWebGLTier(): WebGLTier {
  if (typeof document === 'undefined') return 'unsupported'

  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null

    if (!gl) return 'unsupported'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : ''
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number

    // Software rasterisers and older integrated chips get the cheap path.
    // Intel Arc is a discrete part, so it is excluded from the match.
    const weak = /swiftshader|llvmpipe|software|microsoft basic|intel(?!.*arc)/i.test(renderer)

    // Release the probe context immediately rather than waiting for GC.
    gl.getExtension('WEBGL_lose_context')?.loseContext()

    return weak || maxTextureSize < 8192 ? 'low' : 'high'
  } catch {
    return 'unsupported'
  }
}

export function useWebGLTier(): WebGLTier {
  const [tier] = useState<WebGLTier>(() => {
    cachedTier ??= probeWebGLTier()
    return cachedTier
  })
  return tier
}
