import { Card } from '@mui/material';
import Grid from '@mui/material/Grid';

import MyDefinedRules from '../MyDefinedRules';
import AlertingDetails from '../AlertingDetails';
import UserBalanceCard from '../UserBalanceCard';
import OrderEntryComponent from '../OrderEntryComponent';
import { MyAccountsDetails } from '../MyAccountsDetails';
import TradingviewChartAndData from '../../../layouts/dashboard/TradingViewChartCard';

export function OverviewAnalyticsView() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <MyAccountsDetails
            />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <MyDefinedRules />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <AlertingDetails />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <TradingviewChartAndData />
            </Card>
          </Grid>
          <Grid item xs={12} md={4} >
            <Card sx={{ backgroundColor: "white", height: 670 }}  >
              <UserBalanceCard />
              <OrderEntryComponent />
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
