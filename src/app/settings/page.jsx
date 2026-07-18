"use client";

import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import { useSettings, CURRENCIES, formatMoney } from "@/hooks/useSettings";
import { exportToJSON, exportAllData } from "@/utils/exportData";
import axiosInstance from "@/utils/axiosInstance";
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
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Skeleton,
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
  FiDownload,
  FiFileText,
  FiDatabase,
  FiBell,
  FiToggleLeft,
  FiToggleRight,
  FiShield,
  FiMail,
} from "react-icons/fi";

const MotionBox = motion(Box);

const NOTIFICATION_TYPES = [
  { key: "loginNotification", label: "Login Notification", description: "Alert on new device login", icon: "🔐" },
  { key: "largeExpenseAlert", label: "Large Expense Alert", description: "Single expense over threshold", icon: "💸" },
  { key: "upcomingReminder", label: "Upcoming Reminder", description: "Recurring payment due soon", icon: "📅" },
  { key: "weeklySummary", label: "Weekly Summary", description: "Weekly financial activity", icon: "📈" },
  { key: "budgetWarning", label: "Budget Warning", description: "80% category budget used", icon: "⚠️" },
  { key: "budgetExceeded", label: "Budget Exceeded", description: "Category budget exceeded", icon: "🔴" },
  { key: "recurringBatchSummary", label: "Recurring Batch", description: "After recurring transactions process", icon: "🔄" },
  { key: "overspendingAlert", label: "Overspending Alert", description: "Unusual spending patterns", icon: "⚡" },
  { key: "savingsMilestone", label: "Savings Milestone", description: "Savings goal celebration", icon: "🎉" },
  { key: "bulkImportSummary", label: "Bulk Import", description: "CSV/Excel import result", icon: "📥" },
  { key: "failedLogin", label: "Failed Login Alert", description: "Failed login attempt", icon: "🚫" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const WEEK_DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, isReady } = useSettings();
  const toast = useToast();
  const [localCurrency, setLocalCurrency] = useState(settings.currencyCode);
  const [localDateFormat, setLocalDateFormat] = useState(settings.dateFormat);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(settings.itemsPerPage);
  const [notifPrefs, setNotifPrefs] = useState(null);
  const [notifLoading, setNotifLoading] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

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

  useEffect(() => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    if (!user?.id) { setNotifLoading(false); return; }
    axiosInstance.get(`/api/user/preferences?user=${user.id}`)
      .then((r) => setNotifPrefs(r.data.preferences || {}))
      .catch(() => toast({ title: "Failed to load notification preferences", status: "error", duration: 3000, isClosable: true, position: "top-right" }))
      .finally(() => setNotifLoading(false));
  }, []);

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

  const handleSaveNotif = async () => {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    if (!user?.id) return;
    setSavingNotif(true);
    try {
      await axiosInstance.post("/api/user/preferences", { user: user.id, preferences: notifPrefs });
      toast({ title: "Notification preferences saved", status: "success", duration: 3000, isClosable: true, position: "top-right" });
    } catch {
      toast({ title: "Failed to save notification preferences", status: "error", duration: 3000, isClosable: true, position: "top-right" });
    } finally {
      setSavingNotif(false);
    }
  };

  const handleToggle = (key) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev?.[key] }));
  };

  const handleExportAll = async () => {
    try {
      const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
      const [incomeRes, expenseRes, categoryRes] = await Promise.all([
        axiosInstance.get(`/api/income?user=${user.id || ""}&limit=9999&page=1`),
        axiosInstance.get(`/api/expense?user=${user.id || ""}&limit=9999&page=1`),
        axiosInstance.get(`/api/category?user=${user.id || ""}`),
      ]);

      exportAllData({
        incomes: incomeRes.data?.data || [],
        expenses: expenseRes.data?.data || [],
        categories: categoryRes.data?.categories || [],
        settings,
      });

      toast({
        title: "Export complete",
        description: "Your data has been downloaded as JSON.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Could not fetch data for export.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
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

            {/* Data Export */}
            <GridItem>
              <SettingCard
                icon={FiDatabase}
                title="Data Export"
                description="Download your data for backup or analysis"
              >
                <Stack spacing={3}>
                  <Text fontSize="sm" color={mutedText}>
                    Export all your financial data as a JSON backup file.
                  </Text>
                  <Button
                    leftIcon={<FiFileText />}
                    size="md"
                    variant="outline"
                    colorScheme="teal"
                    borderRadius="xl"
                    onClick={handleExportAll}
                  >
                    Export All (JSON)
                  </Button>
                  <Text fontSize="xs" color={mutedText}>
                    CSV exports are available on the Income and Expense pages.
                  </Text>
                </Stack>
              </SettingCard>
            </GridItem>
          </Grid>

          <Divider />

          {/* ── Email Notifications Section ── */}
          <Box>
            <Flex align="center" gap={3} mb={6}>
              <Flex
                w={12}
                h={12}
                borderRadius="xl"
                bg="teal.50"
                _dark={{ bg: "teal.900" }}
                align="center"
                justify="center"
              >
                <Icon as={FiBell} color="teal.500" boxSize={6} />
              </Flex>
              <Box>
                <Heading size="md" fontWeight="bold">
                  Email Notifications
                </Heading>
                <Text fontSize="sm" color={mutedText}>
                  Control which emails you receive and configure thresholds
                </Text>
              </Box>
            </Flex>

            {notifLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {[...Array(6)].map((_, i) => <Skeleton key={i} height="100px" borderRadius="2xl" />)}
              </SimpleGrid>
            ) : notifPrefs ? (
              <Stack spacing={6}>
                {/* Notification Type Toggles */}
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }} gap={4}>
                  {NOTIFICATION_TYPES.map((nt) => (
                    <MotionBox
                      key={nt.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      bg={bgCard}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="2xl"
                      p={4}
                      boxShadow="sm"
                      _hover={{ boxShadow: "md" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Flex align="center" justify="space-between">
                        <Flex align="center" gap={3}>
                          <Text fontSize="20px">{nt.icon}</Text>
                          <Box>
                            <Text fontWeight="600" fontSize="sm">{nt.label}</Text>
                            <Text fontSize="11px" color={mutedText}>{nt.description}</Text>
                          </Box>
                        </Flex>
                        <Switch
                          isChecked={notifPrefs[nt.key] !== false}
                          onChange={() => handleToggle(nt.key)}
                          colorScheme="teal"
                          size="md"
                        />
                      </Flex>
                    </MotionBox>
                  ))}
                </Grid>

                {/* Configuration Fields */}
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={6} boxShadow="sm">
                    <Text fontWeight="700" mb={4}>💸 Thresholds</Text>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Spending Alert Threshold ($)</FormLabel>
                        <NumberInput
                          value={notifPrefs.spendingAlertThreshold ?? 1000}
                          min={1}
                          onChange={(_, val) => setNotifPrefs((p) => ({ ...p, spendingAlertThreshold: val }))}
                        >
                          <NumberInputField borderRadius="xl" focusBorderColor="teal.400" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="xs" color={mutedText} mt={1}>Triggers overspending alert beyond this amount</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Large Expense Threshold ($)</FormLabel>
                        <NumberInput
                          value={notifPrefs.largeExpenseThreshold ?? 500}
                          min={1}
                          onChange={(_, val) => setNotifPrefs((p) => ({ ...p, largeExpenseThreshold: val }))}
                        >
                          <NumberInputField borderRadius="xl" focusBorderColor="teal.400" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="xs" color={mutedText} mt={1}>Single expenses above this trigger an alert</Text>
                      </FormControl>
                    </Stack>
                  </Box>

                  <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={6} boxShadow="sm">
                    <Text fontWeight="700" mb={4}>⏱️ Timing & Scheduling</Text>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Reminder Timing</FormLabel>
                        <Select
                          value={notifPrefs.reminderDaysBefore ?? 3}
                          onChange={(e) => setNotifPrefs((p) => ({ ...p, reminderDaysBefore: Number(e.target.value) }))}
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                        >
                          <option value={1}>1 day before</option>
                          <option value={3}>3 days before</option>
                          <option value={7}>7 days before</option>
                        </Select>
                        <Text fontSize="xs" color={mutedText} mt={1}>How early to remind about upcoming payments</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Weekly Summary Day</FormLabel>
                        <Select
                          value={notifPrefs.weeklySummaryDay ?? 1}
                          onChange={(e) => setNotifPrefs((p) => ({ ...p, weeklySummaryDay: Number(e.target.value) }))}
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                        >
                          {WEEK_DAYS.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </Select>
                        <Text fontSize="xs" color={mutedText} mt={1}>Day of the week for your weekly summary email</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Timezone</FormLabel>
                        <Select
                          value={notifPrefs.timezone || "UTC"}
                          onChange={(e) => setNotifPrefs((p) => ({ ...p, timezone: e.target.value }))}
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                        >
                          {TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </Select>
                        <Text fontSize="xs" color={mutedText} mt={1}>Used for scheduling email delivery times</Text>
                      </FormControl>
                    </Stack>
                  </Box>
                </Grid>

                <Flex justify="flex-end">
                  <Button
                    leftIcon={<FiCheckCircle />}
                    size="md"
                    bg="teal.500"
                    color="white"
                    _hover={{ bg: "teal.400", transform: "translateY(-1px)" }}
                    _active={{ bg: "teal.600" }}
                    borderRadius="xl"
                    boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                    onClick={handleSaveNotif}
                    isLoading={savingNotif}
                    loadingText="Saving..."
                  >
                    Save Notification Preferences
                  </Button>
                </Flex>
              </Stack>
            ) : (
              <Text fontSize="sm" color={mutedText}>Could not load notification preferences. Please try again later.</Text>
            )}
          </Box>

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
