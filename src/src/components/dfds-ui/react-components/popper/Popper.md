Poppers are small portals of content that are opened when pressing on their anchor Element. It is possible to interact with other elements on the page while `Popper` is open. Popper is closed once the `anchorEl` prop is unset or the user clicks outside the area of the `Popper` content.

## Props

| Name        | Type                 | Required | Default | Description                                     |
| ----------- | -------------------- | -------- | ------- | ----------------------------------------------- |
| anchorEl    | HTMLElment \| null   | X        | -       | HTML element that the Popper will be anchor to. |
| setAnchorEl | React.setStateAction | X        | -       | setStateAction to set the anchorEl              |
| id          | string               |          | -       | For accessibility to use with aria-describedby  |
| placement   | string               |          | -       | Placement of the Popper in                      |
| className   | string               |          | -       | CSS class name set on MaterialPopper            |

Available placement values are as follows:`top-start`,`top`,`top-end`,`left-start`,`left`,`left-end`,`right-start`,`right`,`right-end`,`bottom-start`,`bottom`,`bottom-end`

## Usage

1. Import the component

```jsx
import { Popper } from '@/components/dfds-ui/react-components'
```

2. Set up state to store the anchor element in, the popper will show once the anchor element is set:

```jsx
// prettier-ignore
const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
```

3. Declare logic that will set the anchor element once the trigger is actioned:

```jsx
const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(event.currentTarget)
}
```

4. Attach the logic to the element that should be the anchor elment:

```jsx
<button onClick={handleClick}>Open popper</button>
```

5. Add `Popper` to jsx and pass `anchorEl` and `setAnchorEl` to it:

```jsx
<Popper anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
  <div>Some Content</div>
</Popper>
```
