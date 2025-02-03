# <b>react-components</b>

Collection of React components

## <b>Install</b>

Install with npm:

```bash
npm install --save @/dfds-ui/react-components/src
```

Install with yarn:

```bash
yarn add @/dfds-ui/react-components/src
```

## <b>Development</b>

### <b>Naming conventions</b>

| Prop        | Values               | Description                                                                                 |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------- |
| Size        | small, medium, large | Use `Size` when a prop controls the size of the component. Use t-shirt styles for values.   |
| Align       | left, right, center  | Use `Align` when a prop controls the horizontal alignment of the component                  |
| Orientation | horizontal, vertical | Use `Orientation` when a prop control the direction the component (or children) will expand |
| Variation   | (what makes sense)   | Use `Variation` when a component supports different variations.                             |

### <b>Using yarn link when developing</b>

A common problem when using `yarn link` is that you end of with multiple versions of packages (eg. react). This is
because dependencies are resolved upwards from within the symlinked `react-components` folder.

#### <b>webpack</b>

If you are using `webpack` you can try setting `resolve.symlinks` to `false` in your `webpack.config.js` to only resolve
dependencies from the apps `node_modules` folder.

#### <b>Gatsby</b>

Gatsby uses webpack under the hood, so in order to set `resolve.symlinks` add the following to the `gatsby-node.js` file

```js
exports.onCreateWebpackConfig = ({ getConfig, actions, stage }) => {
  const config = getConfig()
  config.resolve.symlinks = false
  actions.replaceWebpackConfig(config)
}
```
