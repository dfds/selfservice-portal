// mock console.warning for deprecated lifetime methods
// eslint-disable-next-line no-console
export const ignoreDeprecatedReactWarnings = () => {
  // eslint-disable-next-line no-console
  const orgConsoleWarn = console.warn
  jest.spyOn(console, 'warn').mockImplementation((message: string) => {
    const patternsToIgnore = ['componentWillReceiveProps has been renamed', 'componentWillUpdate has been renamed']
    if (!patternsToIgnore.some((p) => message.includes(p))) {
      orgConsoleWarn(message)
    }
  })
}
