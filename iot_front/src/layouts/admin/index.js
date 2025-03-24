// Chakra imports
import {
  Portal, Box, useDisclosure,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin.js';
// Layout components
import Navbar from 'components/navbar/NavbarAdmin.js';
import Sidebar from 'components/sidebar/Sidebar.js';
import { SidebarContext } from 'contexts/SidebarContext';
import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import routes from 'routes.js';
import { UserState } from "contexts/UserContext";
import useSocket from '../../connectBroker/connectSocket';


// Custom Chakra theme
export default function Dashboard(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const getRoute = () => {
    return window.location.pathname !== '/admin/full-screen-maps';
  };
  const {
    user,
    air, setAir,
    light, setLight,
    Switch, setSwitch,
    led, setLed,
    toggle, setToggle,
    deviceId, setDeviceId,
    devices, setDevices,
  } = UserState();
  

  const { sendDeviceId } = useSocket({
    setAir, setLight, setSwitch, setLed, setToggle, deviceId, setDevices, user  // Thay bằng deviceId thực tế
  });

  

  // // Hàm chọn thiết bị
  // const handleSelectDevice = (device) => {
  //   setSelectedDevice(device);
  // };

  // useSocket({ setAir, setLight, setSwitch, setLed, setToggle, deviceId, setDevices, user });

  //xem dashboard của device khác
  let handleChangeDevice = (deviceId) => {
    setDeviceId(deviceId)
    sendDeviceId(deviceId)
  }

  const getActiveRoute = (routes) => {
    let activeRoute = 'SmartAgri';
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].items);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].items);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveNavbar = getActiveNavbar(routes[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].secondary;
        }
      }
    }
    return activeNavbar;
  };
  const getActiveNavbarText = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveNavbar = getActiveNavbarText(routes[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbarText(routes[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].messageNavbar;
        }
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routes) => {
    return routes.map((route, key) => {
      if (route.layout === '/admin') {
        return (
          <Route path={`${route.path}`} element={route.component} key={key} />
        );
      }
      if (route.collapse) {
        return getRoutes(route.items);
      } else {
        return null;
      }
    });
  };
  document.documentElement.dir = 'ltr';
  const { onOpen } = useDisclosure();
  document.documentElement.dir = 'ltr';

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const hoverColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      <Box>
        <SidebarContext.Provider
          value={{
            toggleSidebar,
            setToggleSidebar,
          }}
        >
          <Sidebar routes={routes} display="none" {...rest} />
          <Box
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
            transitionDuration=".2s, .2s, .35s"
            transitionProperty="top, bottom, width"
            transitionTimingFunction="linear, linear, ease"
          >
            <Portal>
              <Box>
                <Navbar
                  onOpen={onOpen}
                  logoText={'Nhóm 4'}
                  brandText={getActiveRoute(routes)}
                  secondary={getActiveNavbar(routes)}
                  message={getActiveNavbarText(routes)}
                  fixed={fixed}
                  {...rest}
                />
              </Box>
            </Portal>

            {getRoute() ? (
              <Box
                mx="auto"
                p={{ base: '20px', md: '30px' }}
                pe="20px"
                minH="100vh"
                pt="50px"
              >
                <Routes>
                  {getRoutes(routes)}
                  <Route
                    path="/"
                    element={<Navigate to="/admin/default" replace />}
                  />
                </Routes>

                <VStack align="stretch" spacing={4}>
                  {Object.entries(devices).map(([key, value]) => (
                    <HStack
                      key={key} // Sử dụng key từ Object.entries
                      justifyContent="space-between"
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      bg={deviceId === key ? hoverColor :  bgColor }
                      // boxShadow={}
                      onClick={() => handleChangeDevice(key)}
                      cursor="pointer"
                      _hover={{
                        bg: hoverColor,
                      }}
                    >
                      <Text fontWeight="medium">{key}</Text>
                      <Badge colorScheme={value.status === 'online' ? 'green' : 'red'}>
                        {value.status.charAt(0).toUpperCase() + value.status.slice(1)}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ) : null}


            {/* list device */}


            <Box>
              <Footer />
            </Box>
          </Box>
        </SidebarContext.Provider>
      </Box>
    </Box>
  );
}
