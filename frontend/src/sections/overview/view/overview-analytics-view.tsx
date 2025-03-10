import Grid from '@mui/material/Grid';

import MyDefinedRules from '../MyDefinedRules';
import AlertingDetails from '../AlertingDetails';
import UserBalanceCard from '../UserBalanceCard';
import { MyAccountsDetails } from '../MyAccountsDetails';
import OrderEntryComponent from '../OrderEntryComponent';
import { DashboardContent } from '../../../layouts/dashboard';

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
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <Grid container spacing={3}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <AlertingDetails />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ height: 600 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <DashboardContent />
          </Grid>
          <Grid item xs={12} md={4} sx={{border: '1px solid black', borderRadius: '10px'}}>
            <UserBalanceCard />
            <OrderEntryComponent />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
