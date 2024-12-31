import {NavItem} from './nav-item/nav-item';

export const navItems: NavItem[] = [
  // {
  //   navCap: 'Home',
  // },
  {
    displayName: 'Dashboard',
    iconName: 'layout-dashboard',
    route: '/dashboard',
  },
  {
    navCap: 'Administraton',
  },
  {
    displayName: 'Configurations',
    iconName: 'rosette',
    route: '/ui-components/general-settings',
  },
  {
    displayName: 'Commerçants',
    iconName: 'rosette',
    route: '/ui-components/merchant-management',
  },
  {
    displayName: 'Armateurs',
    iconName: 'rosette',
    route: '/ui-components/shipowner-management',
  },
  {
    navCap: 'Ventes',
  },
  {
    displayName: 'Ventes aux enchères',
    iconName: 'list',
    route: '/ui-components/sales',
  },
  {
    displayName: 'Achats commerçants',
    iconName: 'list',
    route: '/ui-components/merchantPurchases',
  },
  {
    displayName: 'Balance',
    iconName: 'scale',
    route: '/ui-components/balance',
  },
  {
    displayName: 'Caisses vides',
    iconName: 'box-multiple',
    route: '/ui-components/boxes',
  },
  {
    navCap: 'Règlements',
  },
  {
    displayName: 'Commissionnaire',
    iconName: 'lock',
    route: '/ui-components/commissionaryPayment',
  },
  {
    displayName: 'Commerçant',
    iconName: 'lock',
    route: '/ui-components/merchantPayment',
  },
  {
    displayName: 'Producteur',
    iconName: 'lock',
    route: '/ui-components/producerPayment',
  },{
    displayName: 'Caisse',
    iconName: 'lock',
    route: '/ui-components/cashTransaction',
  },
  //  {
  //   displayName: 'Lists',
  //   iconName: 'list',
  //   route: '/ui-components/lists',
  //  },
  // {
  //   displayName: 'Menu',
  //   iconName: 'layout-navbar-expand',
  //   route: '/ui-components/menu',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'tooltip',
  //   route: '/ui-components/tooltips',
  // },
  // {
  //   navCap: 'Auth',
  // },
  // {
  //   displayName: 'Login',
  //   iconName: 'lock',
  //   route: '/authentication/login',
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'user-plus',
  //   route: '/authentication/register',
  // },
  // {
  //   navCap: 'Extra',
  // },
  // {
  //   displayName: 'Icons',
  //   iconName: 'mood-smile',
  //   route: '/extra/icons',
  // },
  // {
  //   displayName: 'Sample Page',
  //   iconName: 'aperture',
  //   route: '/extra/sample-page',
  // },
];
