import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from '../theme/styles';
import { DashboardLayout } from '../layouts/dashboard';

export const HomePage = lazy(() => import('../pages/home'));
export const BlogPage = lazy(() => import('../pages/blog'));
export const SubscriptionPage = lazy(() => import('../sections/broker/SubscriptionPage'));
export const SignInPage = lazy(() => import('../pages/sign-in'));
export const SignUpPage = lazy(() => import('../pages/sign-up'));
export const ProfileUpdate = lazy(() => import('../pages/profile-update'));
export const ForgetPassword = lazy(() => import('../pages/forget-password'));
export const ProductsPage = lazy(() => import('../pages/products'));
export const Page404 = lazy(() => import('../pages/page-not-found'));
export const ConnectBrokerPage = lazy(() => import('../sections/broker/ConnectBrokerPage'));
export const MarketTypeDetails = lazy(
  () => import('../Admin/component/marketType/MarketTypeDetails')
);
export const BrokerDetails = lazy(
  () => import('../Admin/component/brokermanagement/BrokerManagementDetails')
);
export const PlanManage = lazy(() => import('../Admin/component/plan/PlanForm'));
export const TradingRule = lazy(() => import('../Admin/component/tradingrule/TradingRule'));

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'subscription', element: <SubscriptionPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'broker', element: <ConnectBrokerPage /> },
        { path: 'admin/marketdetails', element: <MarketTypeDetails /> },
        { path: 'admin/brokerdetails', element: <BrokerDetails /> },
        { path: 'admin/plan', element: <PlanManage /> },
        { path: 'admin/tradingrule', element: <TradingRule /> },
      ],
    },
    {
      path: 'sign-in',
      element: <SignInPage />,
    },
    {
      path: '/sign-up',
      element: <SignUpPage />,
    },
    {
      path: '/profile',
      element: <ProfileUpdate />,
    },
    {
      path: '/forget-password',
      element: <ForgetPassword />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
