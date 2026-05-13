import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Win32 GetFinalPathNameByHandle — returns canonical NTFS path.
// JS realpathSync does NOT normalize C:\Inetpub vs C:\inetpub casing on Windows.
const nativeRealpath: ((p: string) => string) | undefined =
  (fs.realpathSync as unknown as Record<string, unknown>).native as
  | ((p: string) => string)
  | undefined;

// Cache realpath results — same dir always maps to same canonical path.
const mkCachedRealpath = (fn: (p: string) => string) => {
  const cache = new Map<string, string>();
  return (p: string): string => {
    if (cache.has(p)) return cache.get(p)!;
    try {
      const r = fn(p);
      cache.set(p, r);
      return r;
    } catch {
      cache.set(p, p);
      return p;
    }
  };
};

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  compress: true,

  // Skip ESLint/TypeScript errors during build — run separately in CI
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {},

  webpack: (config, { dev }) => {
    if (process.platform === "win32" && nativeRealpath) {
      const realpath = mkCachedRealpath(nativeRealpath);

      // Normalize the import CONTEXT (directory of the importing file) before
      // enhanced-resolve resolves the module path. This ensures relative imports
      // like ../../shared/lib/app-router-context from C:\inetpub\...\navigation.js
      // and from C:\Inetpub\...\navigation.js both resolve to the same canonical
      // path — preventing duplicate module instances in the webpack bundle that
      // break AppRouterContext / LayoutRouterContext invariants.
      config.plugins = config.plugins ?? [];
      config.plugins.push({
        apply(compiler: { hooks: { normalModuleFactory: { tap: Function } } }) {
          compiler.hooks.normalModuleFactory.tap("WinCaseNormalizer", (nmf: { hooks: { beforeResolve: { tap: Function } } }) => {
            nmf.hooks.beforeResolve.tap("WinCaseNormalizer", (resolveData: { context?: string }) => {
              if (resolveData?.context && path.isAbsolute(resolveData.context)) {
                resolveData.context = realpath(resolveData.context);
              }
            });
          });
        },
      });
    }

    config.resolve.symlinks = true;

    // Use memory cache in prod to avoid Windows filesystem snapshot failures
    if (!dev) {
      config.cache = { type: "memory" };
    }

    return config;
  },
};

export default nextConfig;
