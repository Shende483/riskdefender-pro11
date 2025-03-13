import { Helmet } from 'react-helmet-async';
import { CONFIG } from '../config-global';
import SubscriptionPage from '../sections/broker/SubscriptionPage';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Users - ${CONFIG.appName}`}</title>
      </Helmet>

      <SubscriptionPage />
    </>
  );
}
