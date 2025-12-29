// PostCSS configuration
//
// Next.js relies on PostCSS to process Tailwind CSS directives during
// development and build.  The previous version of this file referenced
// the `@tailwindcss/postcss` plugin, which is no longer a valid plugin
// name as of Tailwind v4 and resulted in Tailwind directives being
// ignored.  Instead we register the `tailwindcss` plugin directly.
// Autoprefixer is provided automatically by Next.js, so there is no
// need to include it explicitly.
// The PostCSS configuration used by the Next.js frontend.
//
// Tailwind CSS v3 relies on PostCSS to apply its styles.  When using
// Tailwind v4 the package name changes to `@tailwindcss/postcss`, but
// our project pins Tailwind to the stable v3 release.  Therefore we
// register the `tailwindcss` plugin directly here.  Note that
// Next.js provides `autoprefixer` automatically, so there is no need
// to add it explicitly.  This configuration simply tells Next.js
// which plugins to apply during the build.
// PostCSS configuration for Next.js + Tailwind v4
//
// Tailwind CSS v4 no longer exposes its PostCSS plugin as `tailwindcss`.
// Instead the plugin has been moved to the `@tailwindcss/postcss` package.  If
// you continue to reference `tailwindcss` here you will see build errors
// complaining about an unknown PostCSS plugin.  Registering the
// `@tailwindcss/postcss` plugin fixes those errors and allows Tailwind
// directives (`@tailwind base`, etc.) to be processed correctly.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
