import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdHome,
  MdLock,
} from 'react-icons/md';

import MainDashboard from 'views/admin/default';
import DataTables from 'views/admin/dataTables';
import SignInCentered from 'views/auth/signIn';

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },

  {
    name: 'Đăng nhập bằng tài khoản khác',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
];

export default routes;
