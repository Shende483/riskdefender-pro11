import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import { SvgColor } from '../../components/svg-color';

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Trading Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'My Account',
     path: "#",
    icon: <SubscriptionsIcon />,
    subItems: [
      {
        title: 'Add Broker',
        path: 'add-broker/subscription',
        icon: <SubscriptionsIcon />,
      },
      {
        title: 'Add Broker Rules',
        path: 'add-broker-rules',
        icon: <SubscriptionsIcon />,
      },
       {
        title: 'Update Broker Rules',
        path: 'update-broker-rules',
        icon: <SubscriptionsIcon />,
      },
      {
        title: 'Renew Broker',
        path: 'renew-broker/subcription',
        icon: <SubscriptionsIcon />,
      },
       {
        title: 'Delete Brokers',
        path: 'delete-broker',
        icon: <SubscriptionsIcon />,
      },
    ],
  },

  {
    title: 'My Trading Journal',
     path: "#",
    icon: icon('ic-user'),
    subItems: [
        {
        title: 'Download Trading Journal',
        path: 'download-trading-journal',
        icon: <SubscriptionsIcon />,
      },
     
      {
        title: 'Add Trading Journals',
        path: 'renew-trading-journal/subscription',
        icon: <SubscriptionsIcon />,
      },
    
    ],
  },

 {
    title: 'My Market Alerts',
     path: "#",
    icon: icon('ic-user'),
    subItems: [
      {
        title: 'Add Alerts',
        path: 'renew-alerts/subscription',
        icon: <SubscriptionsIcon />,
      }
    ],
  },


   {
    title: 'Payment History',
     path: "#",
    icon: icon('ic-user'),
    subItems: [
  {
    title: 'Penalty History',
    path: '/penalty-history',
    icon: icon('ic-cart'),
  },
 {
    title: 'Add Broker History',
    path: '/penalty-history',
    icon: icon('ic-cart'),
  },
   {
    title: 'Renew plan History',
    path: '/penalty-history',
    icon: icon('ic-cart'),
  },
  ],
  },


  {
    title: 'Delete Plan',
    path: '/blog',
    icon: icon('ic-blog'),
  },
  
  // Removed duplicate "Delete Plan" entry
];