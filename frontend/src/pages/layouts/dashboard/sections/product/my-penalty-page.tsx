import { Helmet } from 'react-helmet-async';

import { CONFIG } from '../../../../../config-global';
import MyPenaltyHistory from './view/my-penalty-history';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Products - ${CONFIG.appName}`}</title>
      </Helmet>

      <MyPenaltyHistory/>
    </>
  );
}
