import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { Box, Link } from '@mui/material';

import { Main } from './main';
import { layoutClasses } from '../classes';
import { NavMobile } from './nav';
import { navData } from '../config-nav-dashboard';
import { Iconify } from '../../components/iconify';
import { Searchbar } from '../components/searchbar';
import { _langs, _notifications } from '../../_mock';
import { _workspaces } from '../config-nav-workspace';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { AccountPopover } from '../components/account-popover';
import { LanguagePopover } from '../components/language-popover';
import { NotificationsPopover } from '../components/notifications-popover';
import HeaderLogo from '../components/header-logo';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();

  const [navOpen, setNavOpen] = useState(false);

  const layoutQuery: Breakpoint = 'lg';

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={navData}
                  open={navOpen}
                  onClose={() => setNavOpen(false)}
                  workspaces={_workspaces}
                />
              </>
            ),
            rightArea: (
              <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
                <HeaderLogo />
                <Box gap={1} display="flex" alignItems="center">
                <Link href="/sign-in" border={1} p={1} borderRadius={1}>Sign in</Link>
                  <Searchbar />
                  <LanguagePopover data={_langs} />
                  <NotificationsPopover data={_notifications} />
                  <AccountPopover
                    data={[
                      {
                        label: 'Home',
                        href: '/',
                        icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
                      },
                      {
                        label: 'Profile Update',
                        href: '/profile',
                        icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
                      },
                      {
                        label: 'Settings',
                        href: '#',
                        icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
                      },
                    ]}
                  />
                </Box>
              </Box>
            ),
          }}
        />
      }

      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-nav-vertical-width': '300px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
      }}
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}
