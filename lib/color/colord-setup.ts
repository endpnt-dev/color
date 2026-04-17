import { extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import labPlugin from 'colord/plugins/lab'
import lchPlugin from 'colord/plugins/lch'
import hwbPlugin from 'colord/plugins/hwb'
import harmoniesPlugin from 'colord/plugins/harmonies'
import a11yPlugin from 'colord/plugins/a11y'
import mixPlugin from 'colord/plugins/mix'
import namesPlugin from 'colord/plugins/names'

// Extend colord with all necessary plugins
extend([
  cmykPlugin,
  labPlugin,
  lchPlugin,
  hwbPlugin,
  harmoniesPlugin,
  a11yPlugin,
  mixPlugin,
  namesPlugin,
])

// Re-export the configured colord
export { colord } from 'colord'