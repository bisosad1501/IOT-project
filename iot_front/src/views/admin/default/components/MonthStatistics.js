import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Icon, useColorModeValue, Text } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import LineChart from "components/charts/LineChart";
import { MdBarChart } from "react-icons/md";
import { UserState } from "contexts/UserContext";
import { getDataMonth } from "api/api";
import { getDatesInMonth, formatDate } from "util/date"; // New function to get dates in month

const MonthStatistics = (props) => {
  const { ...rest } = props;
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const iconColor = useColorModeValue("brand.500", "white");
  const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bgHover = useColorModeValue({ bg: "secondaryGray.400" }, { bg: "whiteAlpha.50" });
  const bgFocus = useColorModeValue({ bg: "secondaryGray.300" }, { bg: "whiteAlpha.100" });

  const [chartData, setChartData] = useState([
    {
      name: "Chất lượng không khí (ppm)",
      data: [],
    },
    {
      name: "Độ sáng (lux)",
      data: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, deviceId } = UserState();
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

        const [airResponse, lightResponse] = await Promise.all([
          getDataMonth("air", month, year, deviceId),
          getDataMonth("light", month, year, deviceId)
        ]);

        if (airResponse?.averagedData && lightResponse?.averagedData) {
          const processedAirData = dates.map(date => {
            const dayData = airResponse.averagedData.find(d => d.date === date);
            return dayData ? dayData.average : 0;
          });

          const processedLightData = dates.map(date => {
            const dayData = lightResponse.averagedData.find(d => d.date === date);
            return dayData ? dayData.average : 0;
          });


          setChartData([
            {
              name: "Chất lượng không khí (ppm)",
              data: processedAirData,
            },
            {
              name: "Độ sáng (lux)",
              data: processedLightData,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      stacked: false,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    tooltip: {
      theme: "dark",
      x: {
        formatter: function(value) {
          return formatDate(dates[value - 1]); 
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: dates.map(formatDate),
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: {
          text: "Chất lượng không khí (ppm)",
          style: {
            color: "#4318FF",
            fontFamily: "Montserrat"
          }
        },
        labels: {
          style: {
            colors: "#A3AED0",
            fontFamily: "Montserrat"
          },
        }
      },
      {
        opposite: true,
        title: {
          text: "Độ sáng (lux)",
          style: {
            color: "#39B8FF",
            fontFamily: "Montserrat"
          }
        },
        labels: {
          style: {
            colors: "#A3AED0",
            fontFamily: "Montserrat"
          },
        }
      }
    ],
    legend: { show: true },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
   
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        colorStops: [
          [
            { offset: 0, color: "#4318FF", opacity: 1 },
            { offset: 100, color: "rgba(67, 24, 255, 0.28)", opacity: 1 },
          ],
          [
            { offset: 0, color: "#39B8FF", opacity: 1 },
            { offset: 100, color: "rgba(57, 184, 255, 0.28)", opacity: 1 },
          ],
        ],
      },
    },

    stroke: {
      width: 5,
      curve: "smooth",
    },
  };

  return (
    <Card
      justifyContent="center"
      align="center"
      direction="column"
      w="100%"
      mb="0px"
      {...rest}
    >
      <Flex justify="space-between" ps="0px" pe="20px" pt="5px">
        <Flex align="center" w="100%">
          <Text
            me='auto'
            color={textColor}
            fontSize='xl'
            fontWeight='700'
            lineHeight='100%'>
            Thống kê tháng
          </Text>
          <Button
            ms="auto"
            align="center"
            justifyContent="center"
            bg={bgButton}
            _hover={bgHover}
            _focus={bgFocus}
            _active={bgFocus}
            w="37px"
            h="37px"
            lineHeight="100%"
            borderRadius="10px"
            {...rest}
          >
            <Icon as={MdBarChart} color={iconColor} w="24px" h="24px" />
          </Button>
        </Flex>
      </Flex>
      <Box minH="260px" minW="75%" mt="auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <LineChart chartData={chartData} chartOptions={chartOptions} />
        )}
      </Box>
    </Card>
  );
};

export default MonthStatistics;
