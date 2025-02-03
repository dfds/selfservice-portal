/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { storiesOf } from '@storybook/react'
import { AppBar, AppBarProvider, AppBarDrawer, AppBarItem, MenuPopOverContext } from './'
import { ListIcon, ListText } from './../lists'
import { BuFreightShipping, BuAboutDfds, MoreHorizontal, BuPax, BuLogistics } from '@/dfds-ui/icons/src/system'
import { Account, Settings, Search } from '@/dfds-ui/icons/src/system'
import { theme, useBreakpoint } from '@/dfds-ui/theme/src'
import notes from './AppBar.notes.md'
import AppBarIconButton from './AppBarIconButton'
import AppBarListItem from './AppBarListItem'

const stories = storiesOf('Hydro UI/AppBar', module)

stories.add(
  'AppBar composed',
  () => {
    const { lessThan } = useBreakpoint()

    const businessUnits = [
      {
        name: 'Passenger Ferries',
        icon: BuPax,
      },
      {
        name: 'Freight Shipping',
        icon: BuFreightShipping,
      },
      {
        name: 'Logistics Solutions',
        icon: BuLogistics,
      },
      {
        name: 'About DFDS',
        icon: BuAboutDfds,
      },
    ]

    const [businessUnit, setBusinessUnit] = React.useState(businessUnits[0].name)
    return (
      <div>
        <AppBarProvider>
          <AppBar
            logoProps={{
              logoContainerProps: { as: 'a', href: 'en/freight-shipping' },
            }}
            leftActions={
              <AppBarItem divider="end" title={businessUnit} id="main">
                <MenuPopOverContext.Consumer>
                  {(context) => {
                    return (
                      <>
                        {businessUnits.map(({ name, icon }) => (
                          <AppBarListItem
                            key={name}
                            selected={name === businessUnit}
                            clickable
                            onClick={() => {
                              context!.handlePopoverClose()
                              setBusinessUnit(name)
                            }}
                          >
                            <ListIcon size="large" color={theme.colors.primary.main} icon={icon} />
                            <ListText>{name}</ListText>
                          </AppBarListItem>
                        ))}
                      </>
                    )
                  }}
                </MenuPopOverContext.Consumer>
              </AppBarItem>
            }
            actions={
              <>
                <AppBarIconButton icon={Search} ariaLabel="Search" />
                <AppBarIconButton icon={Account} ariaLabel="Account" />
                {lessThan('m') ? (
                  <AppBarItem id="more" Icon={MoreHorizontal} title="More" placement="bottom-end">
                    <MenuPopOverContext.Consumer>
                      {(context) => {
                        return (
                          <>
                            <AppBarListItem
                              clickable
                              onClick={() => {
                                context!.handlePopoverClose()
                              }}
                            >
                              <ListIcon size="large" icon={Settings} />
                              <ListText>Settings</ListText>
                            </AppBarListItem>
                          </>
                        )
                      }}
                    </MenuPopOverContext.Consumer>
                  </AppBarItem>
                ) : (
                  <AppBarIconButton icon={Settings} ariaLabel="Settings" />
                )}
              </>
            }
          >
            <AppBarItem title="Content1" id="content1" isActive />
            <AppBarItem title="Content2" id="content2" />
            <AppBarItem title="Content3" id="content3" />
            <AppBarItem title="Identity" id="main">
              <MenuPopOverContext.Consumer>
                {(context) => {
                  return (
                    <>
                      <AppBarListItem
                        clickable
                        onClick={() => {
                          context!.handlePopoverClose()
                        }}
                      >
                        <ListText>Logistics Solutions</ListText>
                      </AppBarListItem>
                      <AppBarListItem
                        clickable
                        onClick={() => {
                          context!.handlePopoverClose()
                        }}
                      >
                        <ListText>Freight Shipping</ListText>
                      </AppBarListItem>
                      <AppBarListItem
                        clickable
                        onClick={() => {
                          context!.handlePopoverClose()
                        }}
                      >
                        <ListText>Passenger Ferries</ListText>
                      </AppBarListItem>
                    </>
                  )
                }}
              </MenuPopOverContext.Consumer>
            </AppBarItem>
            <AppBarItem title="Features" id="features" />
          </AppBar>
          <AppBarDrawer>
            <AppBarListItem clickable>
              <ListText>Logistics Solutions</ListText>
            </AppBarListItem>
            <AppBarListItem clickable>
              <ListText>Freight Shipping</ListText>
            </AppBarListItem>
            <AppBarListItem clickable>
              <ListText>Passenger Ferries</ListText>
            </AppBarListItem>
          </AppBarDrawer>
        </AppBarProvider>
      </div>
    )
  },
  { notes, layout: 'fullscreen' }
)
