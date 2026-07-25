import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'
import { spawnSync } from 'node:child_process'

// For tauri config
const isProd = process.env.NODE_ENV === 'production'
const internalHost = process.env.TAURI_DEV_HOST ?? 'localhost'

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  // Note: This feature is required to use the Next.js Image component in SSG mode.
  // See https://nextjs.org/docs/messages/export-image-api for different workarounds.
  images: {
    unoptimized: true,
  },
  // Configure assetPrefix or else the server won't properly resolve your assets.
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
  reactCompiler: true,
  // `@serwist/next` always adds a `webpack()` hook to the config, even when
  // `disable: true` skips its actual work. Next.js 16 refuses to run
  // Turbopack (the `next dev` default) against a config with a webpack hook
  // unless a Turbopack config — even an empty one — is also present.
  turbopack: {},
}

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ??
  crypto.randomUUID()

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  // Serwist defaults this to `true`, which force-reloads the page the instant
  // the browser regains connectivity. This app is a live debate timer — a
  // forced reload mid-speech would wipe the running timer's in-memory state.
  // Updates must apply silently on next open instead.
  reloadOnOnline: false,
  // Serwist's webpack plugin doesn't support Turbopack (see the `build` script
  // in package.json), so disable it in dev to avoid the incompatibility
  // warning/breakage for local `pnpm dev`, where offline testing isn't a
  // concern anyway.
  disable: !isProd,
  additionalPrecacheEntries: ['/', '/settings', '/demo', '/licences'].map((url) => ({
    url,
    revision,
  })),
})

export default withSerwist(nextConfig)
