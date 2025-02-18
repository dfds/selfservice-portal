// memoization function inspired by moize. Can only remember last value
export function miniMoize(fn: (...args: any[]) => any): (...args: any[]) => any {
  let cache: any = null
  let cacheArgs: any = null
  function wrapper() {
    if (cacheArgs && eq(arguments)) {
      return cache
    }
    cache = fn(...arguments)
    cacheArgs = arguments
    return cache
  }

  function eq(arg: any) {
    if (arg.length !== cacheArgs.length) {
      return false
    }
    for (let i = 0; i < arg.length; i++) {
      if (arg[i] !== cacheArgs[i]) {
        return false
      }
    }
    return true
  }

  return wrapper
}
