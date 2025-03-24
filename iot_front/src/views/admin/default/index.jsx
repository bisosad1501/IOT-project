import {
  Box,
  GridItem,
  Icon,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";

import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React from "react";
import useSocket from '../../../connectBroker/connectSocket';

import {
  MdAttachMoney,
  MdDeviceHub,
  MdSunny,
  MdCloud,
} from "react-icons/md";

import Tasks from "views/admin/default/components/Tasks";
import TotalSpent from "views/admin/default/components/TotalSpent";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import MonthStatistics from "./components/MonthStatistics";
import PieCard from "./components/PieCard";
import { UserState } from "contexts/UserContext";
// import { ChatState } from "../context/chat.provider";
import { getLatestData } from "api/api";
// import { connectUser } from "../../../connectBroker/connectBroker";

export default function UserReports() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
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

  // React.useEffect(() => {
  //   connectUser("dev001", setAir, setLight);
  // }, []);
  useSocket({ setAir, setLight, setSwitch, setLed, setToggle, deviceId, setDevices, user});

  //xem dashboard của device khác
  let handleChangeDevice = (deviceId) =>{
    setDeviceId(deviceId)
  }
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        gap='20px'
        mb='20px'>

        <MiniStatistics
          startContent={
            <>
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdDeviceHub} color={brandColor} />
              }
            />
            {devices[deviceId].status}
            </>
          }
          name='Thiết bị kết nối'
          value={deviceId}
          
        />
        

        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdCloud} color={brandColor} />
              }
            />
          }
          name='Chất luợng không khí'
          value={(air !== null && devices[deviceId].status === 'online')? air : "Loading..."}

        />

        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdSunny} color={brandColor} />
              }
            />
          }
          name='Độ sáng'
          value={(light !== null && devices[deviceId].status === 'online') ? light : "Loading..."}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
        <TotalSpent />
        <WeeklyRevenue />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>
        <MonthStatistics />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3, xl: 3 }} gap='20px' mb='20px'>
        <Tasks />
        <GridItem colSpan={{ base: 1, md: 2, xl: 2 }}>
          <PieCard />
        </GridItem>

      </SimpleGrid>
    </Box>
  );
}
