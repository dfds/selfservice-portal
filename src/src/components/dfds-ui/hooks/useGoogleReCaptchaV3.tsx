import { useCallback, useEffect } from 'react'
import useScript from './useScript'

declare global {
  interface Window {
    grecaptcha: any
  }
}

export type GoogleReCaptchaV3Options = {
  /**
   * The `sitekey` to use with reCAPTCHA v3.
   * https://developers.google.com/recaptcha/docs/v3
   */
  siteKey: string
  /**
   * Disable ReCaptcha preventing the script from loading and return undefined from the execute function.
   * This is useful when consumer needs to conditionally enable or disable ReCaptcha
   */
  disabled?: boolean
}

export function useGoogleReCaptchaV3({ siteKey, disabled = false }: GoogleReCaptchaV3Options) {
  // Load ReCaptcha script.
  const [loaded, error] = useScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`, disabled)

  useEffect(() => {
    if (loaded && !disabled) {
      // eslint-disable-next-line no-console
      console.log('Google ReCaptcha script loaded!')
    }
    if (error) throw new Error('Google ReCaptcha script failed to load')
  }, [loaded, error, disabled])

  const executeReCaptcha = useCallback(
    async (action?: string): Promise<string | undefined> => {
      if (!window) {
        throw new Error('ERROR: NOT A WEB BROWSER')
      }

      if (disabled) {
        return Promise.resolve(undefined)
      }

      const { grecaptcha } = window

      if (!grecaptcha) {
        throw new Error('ERROR: SCRIPT NOT AVAILABLE')
      }

      return new Promise((resolve) => {
        // Invoke the ReCaptcha check.
        grecaptcha.ready(() => {
          grecaptcha.execute(siteKey, { action }).then((token: string) => {
            resolve(token)
          })
        })
      })
    },
    [siteKey, disabled]
  )

  return executeReCaptcha
}
