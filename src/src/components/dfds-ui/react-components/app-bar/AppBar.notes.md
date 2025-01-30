## Props

### AppBar

| Name            |  Values          |  Description                                                                | Required |
| --------------- | ---------------- | --------------------------------------------------------------------------- | -------- |
| leftActions     |  React.ReactNode |  Items displayed next to the logo in desktop mode                           |          |
|  actions        | React.ReactNode  |  Items displayed in the center in desktop mode                              |          |
|  className      |  string          |                                                                             |          |
|  logoProps      |  any             |  Props to be applied to the Logo component                                  |          |
|  menuBreakpoint |  any             |  Screen width at which appbar should toggle between desktop and mobile mode |          |
|  hasMenuButton  |  boolean         | Whether appbar has menu button                                              |          |

### AppBarItem

| Name         |  Values            |  Description                                                      | Required |
| ------------ | ------------------ | ----------------------------------------------------------------- | -------- |
|  id          |  string            | Id of the item                                                    | X        |
|  title       | string             | Label of the item, required if icon not provided                  |          |
|  LeadingIcon |  React.ElementType | Icon element to display before the label                          |          |
| TrailingIcon |  React.ElementType | Icon element to display after the label                           |          |
|  Icon        |  React.ElementType |  Icon element to be used as label, required if title not provided |          |
|  children    |  React.ReactNode   | Child items displayed in a popper                                 |          |
| divider      |  string            | Display divider at the start, end or both sides                   |          |
