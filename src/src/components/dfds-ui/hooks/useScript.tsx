import { useState, useEffect } from 'react'

type State = 'PENDING' | 'LOADED' | 'ERROR'

type Callback = (state: State) => void

class Script {
  state: State
  listeners: Callback[]

  constructor(src: string) {
    this.state = 'PENDING'
    this.listeners = []
    const script = document.createElement('script')
    script.src = src
    script.async = true

    const load = () => {
      this.state = 'LOADED'
      script.removeEventListener('load', load)
      this.emitState()
    }

    const error = () => {
      this.state = 'ERROR'
      script.removeEventListener('error', error)
      this.emitState()
    }

    script.addEventListener('load', load)
    script.addEventListener('error', error)
    document.body.appendChild(script)
  }

  onStateChange(cb: Callback) {
    this.listeners.push(cb)
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== cb)
    }
  }

  private emitState() {
    for (const cb of this.listeners) {
      cb(this.state)
    }
  }
}

const scripts = new Map<string, Script>()

/**
 * Hook for loading external script
 * @param {string} src - The URL of the script
 * @param {boolean} [doNotLoad=false] - If set to true the script will not be loaded
 *  This can be handy because hooks can not be called conditionally by the consumer
 */
function useScript(src: string, doNotLoad = false) {
  // Keeping track of script loaded and error state
  const [state, setState] = useState({
    loaded: false,
    error: false,
  })

  useEffect(() => {
    // If doNotLoad we return early so the script will not be loaded
    if (doNotLoad) {
      setState({
        loaded: true,
        error: false,
      })
      return
    }

    // If scripts already includes src it means that the script was already
    // loaded by another instance of the hook, so no need to load again
    const script = scripts.get(src) || (scripts.set(src, new Script(src)).get(src) as Script)

    if (script.state === 'LOADED') {
      setState({
        loaded: true,
        error: false,
      })
      return
    }

    return script.onStateChange((state) => {
      if (state === 'ERROR') {
        scripts.delete(src)
        setState({
          loaded: true,
          error: true,
        })
      } else {
        setState({
          loaded: true,
          error: false,
        })
      }
    })
  }, [src, doNotLoad])

  return [state.loaded, state.error]
}

export default useScript
