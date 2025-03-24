import { Box, Flex, Text, Select, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import PieChart from "components/charts/PieChart";
import { VSeparator } from "components/separator/Separator";
import { useState, useEffect } from "react";
import { UserState } from "contexts/UserContext";
import { getDataMonth } from "api/api";
import { getDatesInMonth } from "util/date";

export default function Conversion(props) {
  const { ...rest } = props;
  const { user, deviceId } = UserState();
  const [pieChartData, setPieChartData] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDay = new Date();
  const dates = getDatesInMonth(currentDay.getMonth(), currentDay.getFullYear());
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.deviceId) return;
      setIsLoading(true);
      setError(null);

      try {
        const month = currentDay.getMonth() + 1;
        const year = currentDay.getFullYear();

        const airResponse = await getDataMonth("air", month, year, deviceId);

        if (airResponse?.averagedData) {
          const processedAirData = dates.map(date => {
            const dayData = airResponse.averagedData.find(d => d.date === date);
            return dayData ? dayData.average : 0;
          });


          let cleanDays = 0; 
          let unCleanDays = 0;
          
          processedAirData.forEach(day => {
            if (day > 400 && day <= 1000) {
              cleanDays++;
            } else if( day > 1000 && day < 5000) {
              unCleanDays++;
            }
          }); 

          let toxicDays = processedAirData.length - cleanDays - unCleanDays;

          setPieChartData(
            [cleanDays, unCleanDays , toxicDays]
          )

        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  },[user])

  const pieChartOptions = {
    labels: ["An toàn", "Ô nhiễm", "Độc hại"],
    colors: ["#7bde7c", "#ff6962", "#b09bd7"],
    chart: {
      width: "50px",
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    hover: { mode: null },
    plotOptions: {
      donut: {
        expandOnClick: false,
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    fill: {
      colors: ["#7bde7c", "#ff6962", "#b09bd7"],
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
  };
  
  
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardColor = useColorModeValue("white", "navy.700");
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "unset"
  );
  return (
    <Card p='20px' align='center' direction='column' w='100%' {...rest}>
      <Flex
        px={{ base: "0px", "2xl": "10px" }}
        justifyContent='space-between'
        alignItems='center'
        w='100%'
        mb='8px'>
        <Text color={textColor} fontSize='md' fontWeight='600' mt='4px'>
          Thống kê chất lượng không khí trong tháng
        </Text>
       
      </Flex>

      <PieChart
        h='100%'
        w='100%'
        chartData={pieChartData}
        chartOptions={pieChartOptions}
      />
      <Card
        bg={cardColor}
        flexDirection='row'
        boxShadow={cardShadow}
        justifyContent='center'
        w='100%'
        p='15px'
        px='20px'
        mt='15px'
        mx='auto'>
        <Flex direction='column' py='5px'>
          <Flex align='center'>
            <Box h='8px' w='8px' bg='#7bde7c' borderRadius='50%' me='4px' />
            <Text
              fontSize='xs'
              color='secondaryGray.600'
              fontWeight='700'
              mb='5px'>
              An toàn
            </Text>
          </Flex>
          <Text fontSize='lg' color={textColor} fontWeight='700'>
            {(isLoading) ? "Đang tải..." : pieChartData[0]}
          </Text>
        </Flex>
        
        <VSeparator mx={{ base: "60px", xl: "60px", "2xl": "60px" }} />
        
        <Flex direction='column' py='5px' me='10px'>
          <Flex align='center'>
            <Box h='8px' w='8px' bg='#ff6962' borderRadius='50%' me='4px' />
            <Text
              fontSize='xs'
              color='secondaryGray.600'
              fontWeight='700'
              mb='5px'>
              Ô nhiễm
            </Text>
          </Flex>
          <Text fontSize='lg' color={textColor} fontWeight='700'>
            {(isLoading) ? "Đang tải..." : pieChartData[1]}
          </Text>
        </Flex>

        <VSeparator mx={{ base: "60px", xl: "60px", "2xl": "60px" }} />
        
        <Flex direction='column' py='5px' me='10px'>
          <Flex align='center'>
            <Box h='8px' w='8px' bg='#b09bd7' borderRadius='50%' me='4px' />
            <Text
              fontSize='xs'
              color='secondaryGray.600'
              fontWeight='700'
              mb='5px'>
              Độc hại
            </Text>
          </Flex>
          <Text fontSize='lg' color={textColor} fontWeight='700'>
          {(isLoading) ? "Đang tải..." : pieChartData[2]}
          </Text>
        </Flex>
      </Card>
    </Card>
  );
}
