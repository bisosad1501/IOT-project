import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  Checkbox,
  Spinner
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import { UserState } from "contexts/UserContext";
import useSocket from '../../../../connectBroker/connectSocket';



// Assets
import { MdDragIndicator } from "react-icons/md";
import { useState, useEffect } from 'react';

export default function Conversion(props) {
  const { ...rest } = props;

  const [loadingLed, setLoadingLed] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);

  const {
    Switch, setSwitch,
    led, setLed,
    toggle, setToggle,
    setAir,
    setLight,
    deviceId, setDeviceId,
    loading, setLoading,
    setDevices,user
  } = UserState();

  useEffect(() => {
    setLoadingLed(false); 
  }, [led]);

  useEffect(() => {
    setLoadingSwitch(false); 
  }, [Switch]);

  useEffect(() => {
    setLoadingToggle(false); 
  }, [toggle]);

  const { send } = useSocket({
    setAir, setLight, setSwitch, setLed, setToggle, deviceId, setDevices, user  // Thay bằng deviceId thực tế
  });
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorDisabled = useColorModeValue("secondaryGray.100", "secondaryGray.900");
  const boxBg = useColorModeValue("secondaryGray.300", "navy.700");

  let handleControl = (topic, e) => {
    let data = null;
    if (topic === 'switch') {
      data = e ? "chedo0" : "chedo1";
      setLoadingSwitch(true);
    }
    else if (topic === 'led') {
      data = e ? "led1" : "led0"
      setLoadingLed(true);
    }
    else {
      data = e ? "mai1" : "mai0"
      setLoadingToggle(true);
    }
    send(deviceId, topic, data);
    // setLoading(true);
  }

  return (
    <Card p='20px' align='center' direction='column' w='100%' {...rest}>
      <Flex alignItems='center' w='100%' mb='30px'>
        <Text color={textColor} fontSize='lg' fontWeight='700'>
          Bảng điều khiển
        </Text>
      </Flex>
      <Box px='11px'>
        <Flex mb='20px'>
          <Checkbox
            me='16px'
            isDisabled={loadingSwitch}
            isChecked={Switch == 0 ? true : false}
            onChange={(e) => handleControl('switch', e.target.checked)}
            colorScheme='brandScheme'
          />
          <Text
            fontWeight='bold'
            color={textColor}
            fontSize='md'
            textAlign='start'>
            Bật chế độ thủ công
          </Text>
          {loadingSwitch && <Spinner size="sm" ml="8px" />}
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
      </Box>

      <Box px='11px'>
        <Flex mb='20px'>
          {/* Second checkbox */}
          <Checkbox
            me='16px'
            isDisabled={Switch == 1 ? true : false || loadingLed}
            isChecked={led == 1 ? true : false}
            colorScheme='brandScheme'
            onChange={(e) => handleControl('led', e.target.checked)}

          />
          <Text
            fontWeight='bold'
            color={Switch == 1 ? textColorDisabled : textColor}
            fontSize='md'
            textAlign='start'>
            Bật đèn
          </Text>
          {loadingLed && <Spinner size="sm" ml="8px" />}
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
      </Box>

      <Box px='11px'>
        <Flex mb='20px'>
          {/* Third checkbox */}
          <Checkbox
            me='16px'
            isDisabled={Switch == 1 ? true : false || loadingToggle}
            isChecked={toggle == 1 ? true : false}
            colorScheme='brandScheme'
            onChange={(e) => handleControl('toggle', e.target.checked)}

          />
          <Text
            fontWeight='bold'
            color={Switch == 1 ? textColorDisabled : textColor}
            fontSize='md'
            textAlign='start'>
            Bật mái che
          </Text>
          {loadingToggle && <Spinner size="sm" ml="8px" />}
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
      </Box>
    </Card>
  );
}
