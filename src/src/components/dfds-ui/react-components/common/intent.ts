import { theme } from '@dfds-ui/theme'

export type Intent = 'info' | 'critical' | 'success' | 'warning' | 'none'

export function getIntentColor(intent: Intent = 'info', muted = false) {
  switch (intent) {
    case 'none':
      return theme.colors.surface.secondary
    case 'info':
      return muted ? theme.colors.status.infomuted : theme.colors.status.info
    case 'critical':
      return muted ? theme.colors.status.alertmuted : theme.colors.status.alert
    case 'success':
      return muted ? theme.colors.status.successmuted : theme.colors.status.success
    case 'warning':
      return muted ? theme.colors.status.warningmuted : theme.colors.status.warning
  }
}

export function getIntentTextColor(intent: Intent) {
  switch (intent) {
    case 'none':
      return theme.colors.text.dark.primary
    case 'info':
    case 'critical':
    case 'success':
    case 'warning':
      return theme.colors.text.light.primary
  }
}
