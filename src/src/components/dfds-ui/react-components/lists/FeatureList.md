## Feature list

### Usage

<!-- prettier-ignore -->
```jsx
import { FeatureList } from '@/components/dfds-ui/react-components'

<FeatureList icon={<IconOfChoice />} items={arrayOfItems} iconColor={optionalIconColorAsString} />
```

### Props

|  Name     | Type               | Default value | Required | Description                                |
| --------- | ------------------ | ------------- | -------- | ------------------------------------------ |
|  icon     | any                | -             | X        | Icon to display in front of each list item |
| iconColor | string             | -             |          | Color of the icon in front of each item    |
|  textTag  | React.ElementType  | p             |          | Tag wrapping text content in each item     |
|  as       |  React.ElementType | div           |          | Component's root tag                       |
