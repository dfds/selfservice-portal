# <b>@/dfds-ui/react-components/src</b>

Shared icons as React components within DFDS

## <b>Generating components from SVG sources</b>

When adding/removing icons to/from the `svgs` folder a new set of generated components should be created and
committed to the repository. To generate a new set run `yarn generate`

## <b>TODO</b>

List of features and things we would like to add:

- [x] Add folder containing the SVG sources from UX
- [x] Use `@svgr/cli` to generate the React components
- [ ] Support building "spritemaps" with SVG symbols
- [ ] Document the "magic" colors being replaced
- [ ] When publishing add SVGs to dist and then exclude src folder
- [ ] Ensure that tsconfig.json is not being publish as it can bring warnings for consumers
