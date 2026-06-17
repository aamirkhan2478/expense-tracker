"use client";

import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import { useSettings, CURRENCIES, formatMoney } from "@/hooks/useSettings";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  Select,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Divider,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiGlobe,
  FiCalendar,
  FiList,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";

const MotionBox = motion(Box);

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, isReady } = useSettings();
  const toast = useToast();
  const [localCurrency, setLocalCurrency] = useState(settings.currencyCode);
  const [localDateFormat, setLocalDateFormat] = useState(settings.dateFormat);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(settings.itemsPerPage);

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    if (isReady) {
      setLocalCurrency(settings.currencyCode);
      setLocalDateFormat(settings.dateFormat);
      setLocalItemsPerPage(settings.itemsPerPage);
    }
  }, [isReady, settings.currencyCode, settings.dateFormat, settings.itemsPerPage]);

  const handleSave = () => {
    const selected = CURRENCIES.find((c) => c.code === localCurrency);
    updateSettings({
      currencyCode: localCurrency,
      currency: selected?.symbol || "$",
      dateFormat: localDateFormat,
      itemsPerPage: Number(localItemsPerPage),
    });
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleReset = () => {
    resetSettings();
    setLocalCurrency("USD");
    setLocalDateFormat("MM/DD/YYYY");
    setLocalItemsPerPage(5);
    toast({
      title: "Settings reset",
      description: "All settings have been restored to defaults.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const SettingCard = ({ icon, title, description, children }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      bg={bgCard}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      p={6}
      boxShadow="sm"
      _hover={{ boxShadow: "md" }}
      transition={{ duration: 0.2 }}
    >
      <Flex align="center" gap={3} mb={4}>
        <Flex
          w={10}
          h={10}
          borderRadius="xl"
          bg="teal.50"
          _dark={{ bg: "teal.900" }}
          align="center"
          justify="center"
        >
          <Icon as={icon} color="teal.500" boxSize={5} />
        </Flex>
        <Box>
          <Text fontWeight="bold" fontSize="md">
            {title}
          </Text>
          <Text fontSize="sm" color={mutedText}>
            {description}
          </Text>
        </Box>
      </Flex>
      {children}
    </MotionBox>
  );

  if (!isReady) {
    return (
      <Layout>
        <CustomBox>
          <Stack spacing={6}>
            <Skeleton height="40px" width="200px" />
            <Skeleton height="200px" borderRadius="2xl" />
          </Stack>
        </CustomBox>
      </Layout>
    );
  }

  return (
    <Layout>
      <CustomBox>
        <Stack spacing={8}>
          {/* Header */}
          <Box>
            <Heading size="lg" fontWeight="bold" mb={1}>
              Settings
            </Heading>
            <Text fontSize="sm" color={mutedText}>
              Manage your preferences and customize your experience
            </Text>
          </Box>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            {/* Currency */}
            <GridItem>
              <SettingCard
                icon={FiDollarSign}
                title="Currency"
                description="Choose your preferred currency symbol"
              >
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Select Currency
                  </FormLabel>
                  <Select
                    value={localCurrency}
                    onChange={(e) => setLocalCurrency(e.target.value)}
                    borderRadius="xl"
                    focusBorderColor="teal.400"
                    size="lg"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} — {c.name} ({c.code})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <Box mt={4} p={3} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="xl">
                  <Text fontSize="xs" color={mutedText} mb={1}>
                    Preview
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                    {formatMoney(1250.5, { currency: CURRENCIES.find((c) => c.code === localCurrency)?.symbol || "$" })}
                  </Text>
                </Box>
              </SettingCard>
            </GridItem>

            {/* Date Format */}
            <GridItem>
              <SettingCard
                icon={FiCalendar}
                title="Date Format"
                description="Choose how dates are displayed"
              >
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Select Format
                  </FormLabel>
                  <Select
                    value={localDateFormat}
                    onChange={(e) => setLocalDateFormat(e.target.value)}
                    borderRadius="xl"
                    focusBorderColor="teal.400"
                    size="lg"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (06/17/2026)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (17/06/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-17)</option>
                    <option value="MMM DD, YYYY">MMM DD, YYYY (Jun 17, 2026)</option>
                    <option value="DD MMM, YYYY">DD MMM, YYYY (17 Jun, 2026)</option>
                  </Select>
                </FormControl>
                <Box mt={4} p={3} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="xl">
                  <Text fontSize="xs" color={mutedText} mb={1}>
                    Preview
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </Box>
              </SettingCard>
            </GridItem>

            {/* Items Per Page */}
            <GridItem>
              <SettingCard
                icon={FiList}
                title="Items Per Page"
                description="How many records to show per page"
              >
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Select Limit
                  </FormLabel>
                  <Select
                    value={localItemsPerPage}
                    onChange={(e) => setLocalItemsPerPage(Number(e.target.value))}
                    borderRadius="xl"
                    focusBorderColor="teal.400"
                    size="lg"
                  >
                    <option value={5}>5 items</option>
                    <option value={10}>10 items</option>
                    <option value={20}>20 items</option>
                    <option value={50}>50 items</option>
                  </Select>
                </FormControl>
                <SimpleGrid columns={3} spacing={2} mt={4}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                      key={i}
                      h={2}
                      borderRadius="full"
                      bg={i <= localItemsPerPage / 5 ? "teal.400" : "gray.200"}
                    />
                  ))}
                </SimpleGrid>
              </SettingCard>
            </GridItem>

            {/* Region Info */}
            <GridItem>
              <SettingCard
                icon={FiGlobe}
                title="Region Info"
                description="Your current timezone and locale"
              >
                <Stack spacing={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color={mutedText}>
                      Timezone
                    </Text>
                    <Badge colorScheme="teal" borderRadius="full" px={3}>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color={mutedText}>
                      Locale
                    </Text>
                    <Badge colorScheme="teal" borderRadius="full" px={3}>
                      {Intl.DateTimeFormat().resolvedOptions().locale}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color={mutedText}>
                      Currency Code
                    </Text>
                    <Badge colorScheme="teal" borderRadius="full" px={3}>
                      {localCurrency}
                    </Badge>
                  </Flex>
                </Stack>
              </SettingCard>
            </GridItem>
          </Grid>

          <Divider />

          {/* Actions */}
          <Flex gap={4} direction={{ base: "column", sm: "row" }}>
            <Button
              leftIcon={<FiCheckCircle />}
              size="lg"
              bg="teal.500"
              color="white"
              _hover={{ bg: "teal.400", transform: "translateY(-1px)" }}
              _active={{ bg: "teal.600" }}
              borderRadius="xl"
              boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
              onClick={handleSave}
              flex={{ sm: 1 }}
            >
              Save Changes
            </Button>
            <Button
              leftIcon={<FiRefreshCw />}
              size="lg"
              variant="outline"
              colorScheme="gray"
              borderRadius="xl"
              onClick={handleReset}
              flex={{ sm: 1 }}
            >
              Reset to Defaults
            </Button>
          </Flex>
        </Stack>
      </CustomBox>
    </Layout>
  );
}

function Skeleton({ height, width, borderRadius }) {
  return (
    <Box
      h={height}
      w={width || "100%"}
      bg="gray.100"
      borderRadius={borderRadius || "lg"}
      animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
    />
  );
}
