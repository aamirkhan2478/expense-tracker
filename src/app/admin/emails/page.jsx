"use client";

import Layout from "@/components/Layout";
import CustomBox from "@/components/CustomBox";
import axiosInstance from "@/utils/axiosInstance";
import {
  Box, Button, Flex, Grid, GridItem, Heading, Text, Badge, Stack, Input,
  Select, Switch, FormControl, FormLabel, useColorModeValue, useToast,
  Divider, Skeleton, Icon, Tooltip, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Tabs, TabList,
  Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Alert, AlertIcon, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiMail, FiSettings, FiEye, FiSend, FiRefreshCw, FiAlertTriangle,
  FiCheckCircle, FiClock, FiToggleLeft, FiToggleRight, FiShield, FiLock,
} from "react-icons/fi";

const MotionBox = motion(Box);

const ALL_TEMPLATES = [
  { key: "welcome", label: "Welcome", icon: "👋", phase: 1, description: "Sent on new user registration." },
  { key: "verify-email", label: "Email Verification", icon: "✉️", phase: 1, description: "Sent to verify new account emails." },
  { key: "password-reset", label: "Password Reset", icon: "🔑", phase: 1, description: "Sent when user requests password reset." },
  { key: "budget-warning", label: "Budget Warning (80%)", icon: "⚠️", phase: 1, description: "Sent when category budget reaches 80%." },
  { key: "budget-exceeded", label: "Budget Exceeded", icon: "🔴", phase: 1, description: "Sent when category budget is exceeded." },
  { key: "monthly-report", label: "Monthly Report", icon: "📊", phase: 1, description: "Monthly financial summary report." },
  { key: "failed-login", label: "Failed Login Alert", icon: "🚫", phase: 1, description: "Alert for failed login attempts." },
  { key: "login-notification", label: "Login Notification", icon: "🔐", phase: 2, description: "Alert for new device logins." },
  { key: "large-expense-alert", label: "Large Expense Alert", icon: "💸", phase: 2, description: "Alert when a single expense exceeds threshold." },
  { key: "upcoming-reminder", label: "Upcoming Reminder", icon: "📅", phase: 2, description: "Reminder for upcoming recurring payments." },
  { key: "weekly-spending-summary", label: "Weekly Summary", icon: "📈", phase: 2, description: "Weekly financial activity summary." },
  { key: "recurring-batch-summary", label: "Recurring Batch Summary", icon: "🔄", phase: 2, description: "Report after recurring transactions process." },
  { key: "overspending-alert", label: "Overspending Alert", icon: "⚡", phase: 2, description: "Alert for unusual spending patterns." },
  { key: "savings-milestone", label: "Savings Milestone", icon: "🎉", phase: 2, description: "Celebration when savings goals are reached." },
  { key: "bulk-import-summary", label: "Bulk Import Summary", icon: "📥", phase: 2, description: "Report after CSV/Excel data imports." },
];

export default function AdminEmailsPage() {
  const toast = useToast();
  const { isOpen: isPreviewOpen, onOpen: openPreview, onClose: closePreview } = useDisclosure();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logFilter, setLogFilter] = useState({ status: "", type: "" });

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const tableBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    setUser(stored);
    setTestEmail(stored.email || "");
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await axiosInstance.get("/api/admin/emails/settings");
      setSettings(r.data.settings || {});
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!user?.id) return;
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ user: user.id, page: logPage, limit: 20 });
      if (logFilter.status) params.set("status", logFilter.status);
      if (logFilter.type) params.set("type", logFilter.type);
      const r = await axiosInstance.get(`/api/admin/emails?${params}`);
      setLogs(r.data.data || []);
      setLogsTotal(r.data.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLogsLoading(false);
    }
  }, [user?.id, logPage, logFilter]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSettings();
      setLoading(false);
    };
    init();
  }, [fetchSettings]);

  useEffect(() => {
    if (user?.id) fetchLogs();
  }, [user?.id, fetchLogs]);

  const handleToggleTemplate = async (key, enabled) => {
    try {
      await axiosInstance.post("/api/admin/emails/settings", {
        enabledTemplates: { [key]: enabled },
      });
      setSettings((prev) => ({
        ...prev,
        enabledTemplates: { ...(prev?.enabledTemplates || {}), [key]: enabled },
      }));
      toast({ title: `${enabled ? "Enabled" : "Disabled"} ${key}`, status: "success", duration: 2000, isClosable: true, position: "top-right" });
    } catch {
      toast({ title: "Failed to update setting", status: "error", duration: 2000, isClosable: true, position: "top-right" });
    }
  };

  const handleSaveThresholds = async (data) => {
    try {
      await axiosInstance.post("/api/admin/emails/settings", data);
      toast({ title: "Thresholds updated", status: "success", duration: 2000, isClosable: true, position: "top-right" });
    } catch {
      toast({ title: "Failed to save", status: "error", duration: 2000, isClosable: true, position: "top-right" });
    }
  };

  const handlePreview = async (templateKey) => {
    setPreviewTemplate(templateKey);
    setPreviewLoading(true);
    openPreview();
    try {
      const r = await fetch(`/api/admin/emails?preview=${templateKey}`);
      const html = await r.text();
      setPreviewHtml(html);
    } catch (err) {
      setPreviewHtml(`<p style="color:red">Preview failed: ${err.message}</p>`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTestEmail = async (templateKey) => {
    if (!user?.id) return;
    try {
      await axiosInstance.post(`/api/admin/emails?user=${user.id}`, {
        action: "test",
        templateType: templateKey,
        testEmail: testEmail || user.email,
      });
      toast({ title: `Test email sent for "${templateKey}"`, description: `Sent to ${testEmail || user.email}`, status: "success", duration: 3000, isClosable: true, position: "top-right" });
    } catch (err) {
      toast({ title: "Test email failed", description: err.response?.data?.error || err.message, status: "error", duration: 3000, isClosable: true, position: "top-right" });
    }
  };

  const handleRetry = async (jobId) => {
    if (!user?.id) return;
    try {
      await axiosInstance.post(`/api/admin/emails?user=${user.id}`, { action: "retry", jobId });
      toast({ title: "Email queued for retry", status: "success", duration: 2000, isClosable: true, position: "top-right" });
      fetchLogs();
    } catch {
      toast({ title: "Retry failed", status: "error", duration: 2000, isClosable: true, position: "top-right" });
    }
  };

  const handleRetryAll = async () => {
    if (!user?.id) return;
    try {
      const r = await axiosInstance.post(`/api/admin/emails?user=${user.id}`, { action: "retry-all-failed" });
      toast({ title: r.data.message, status: "success", duration: 3000, isClosable: true, position: "top-right" });
      fetchLogs();
    } catch {
      toast({ title: "Retry all failed", status: "error", duration: 2000, isClosable: true, position: "top-right" });
    }
  };

  const StatusBadge = ({ status }) => {
    const colorMap = { sent: "green", queued: "blue", failed: "red", bounced: "orange" };
    return <Badge colorScheme={colorMap[status] || "gray"} borderRadius="full" px={2} fontSize="xs">{status}</Badge>;
  };

  const TemplateCard = ({ tpl }) => {
    const isEnabled = settings?.enabledTemplates?.[tpl.key] !== false;
    return (
      <MotionBox
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        bg={bgCard}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        p={5}
        boxShadow="sm"
        _hover={{ boxShadow: "md" }}
        transition={{ duration: 0.2 }}
      >
        <Flex align="flex-start" justify="space-between" mb={3}>
          <Flex align="center" gap={3}>
            <Text fontSize="24px">{tpl.icon}</Text>
            <Box>
              <Text fontWeight="700" fontSize="sm">{tpl.label}</Text>
              <Badge colorScheme={tpl.phase === 2 ? "teal" : "purple"} fontSize="10px" borderRadius="full">
                Phase {tpl.phase}
              </Badge>
            </Box>
          </Flex>
          <Switch
            isChecked={isEnabled}
            onChange={(e) => handleToggleTemplate(tpl.key, e.target.checked)}
            colorScheme="teal"
            size="md"
          />
        </Flex>
        <Text fontSize="12px" color={mutedText} mb={4}>{tpl.description}</Text>
        <Flex gap={2}>
          <Button size="xs" leftIcon={<FiEye />} variant="outline" colorScheme="teal" borderRadius="lg" onClick={() => handlePreview(tpl.key)}>
            Preview
          </Button>
          <Button size="xs" leftIcon={<FiSend />} variant="outline" colorScheme="blue" borderRadius="lg" onClick={() => handleTestEmail(tpl.key)}>
            Test
          </Button>
        </Flex>
      </MotionBox>
    );
  };

  if (loading) {
    return (
      <Layout>
        <CustomBox>
          <Stack spacing={4}>
            <Skeleton height="40px" width="260px" borderRadius="xl" />
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }} gap={4}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} height="160px" borderRadius="2xl" />)}
            </Grid>
          </Stack>
        </CustomBox>
      </Layout>
    );
  }

  if (!user?.id || user?.role !== "admin") {
    return (
      <Layout>
        <CustomBox>
          <Flex direction="column" align="center" justify="center" py={16} gap={4}>
            <Icon as={FiLock} boxSize={12} color="red.400" />
            <Heading size="md" textAlign="center">
              {!user?.id ? "Access Denied" : "Admin Access Required"}
            </Heading>
            <Text fontSize="sm" color={mutedText} textAlign="center" maxW="400px">
              {!user?.id
                ? "Please log in to access this page."
                : "You do not have permission to access this page. Only administrators can manage email settings."}
            </Text>
          </Flex>
        </CustomBox>
      </Layout>
    );
  }

  const phase1Templates = ALL_TEMPLATES.filter((t) => t.phase === 1);
  const phase2Templates = ALL_TEMPLATES.filter((t) => t.phase === 2);

  return (
    <Layout>
      <CustomBox>
        <Stack spacing={8}>
          {/* Header */}
          <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" fontWeight="bold" mb={1}>Email Management</Heading>
              <Text fontSize="sm" color={mutedText}>Configure, preview, and monitor all email notifications</Text>
            </Box>
            <Flex gap={3} align="center">
              <Text fontSize="sm" color={mutedText}>Test recipient:</Text>
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                size="sm"
                borderRadius="xl"
                focusBorderColor="teal.400"
                w="220px"
              />
            </Flex>
          </Flex>

          <Tabs colorScheme="teal" variant="soft-rounded">
            <TabList flexWrap="wrap" gap={2}>
              <Tab><Icon as={FiToggleRight} mr={2} />Templates</Tab>
              <Tab><Icon as={FiSettings} mr={2} />Global Settings</Tab>
              <Tab><Icon as={FiMail} mr={2} />Delivery Logs</Tab>
            </TabList>

            <TabPanels mt={6}>
              {/* ── Tab 1: Templates ── */}
              <TabPanel p={0}>
                <Stack spacing={6}>
                  <Box>
                    <Flex align="center" gap={2} mb={4}>
                      <Icon as={FiShield} color="purple.500" />
                      <Text fontWeight="700" color="purple.500">Phase 1 — Core Emails</Text>
                    </Flex>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }} gap={4}>
                      {phase1Templates.map((tpl) => <TemplateCard key={tpl.key} tpl={tpl} />)}
                    </Grid>
                  </Box>
                  <Divider />
                  <Box>
                    <Flex align="center" gap={2} mb={4}>
                      <Icon as={FiShield} color="teal.500" />
                      <Text fontWeight="700" color="teal.500">Phase 2 — Retention & Convenience</Text>
                    </Flex>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }} gap={4}>
                      {phase2Templates.map((tpl) => <TemplateCard key={tpl.key} tpl={tpl} />)}
                    </Grid>
                  </Box>
                </Stack>
              </TabPanel>

              {/* ── Tab 2: Global Settings ── */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={6}>
                    <Text fontWeight="700" mb={4}>💸 Alert Thresholds</Text>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Large Expense Threshold ($)</FormLabel>
                        <NumberInput
                          defaultValue={settings?.largeExpenseThreshold ?? 500}
                          min={1}
                          onBlur={(e) => handleSaveThresholds({ largeExpenseThreshold: Number(e.target.value) })}
                        >
                          <NumberInputField borderRadius="xl" focusBorderColor="teal.400" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Overspending Alert Threshold ($)</FormLabel>
                        <NumberInput
                          defaultValue={settings?.overspendingAlertThreshold ?? 1000}
                          min={1}
                          onBlur={(e) => handleSaveThresholds({ overspendingAlertThreshold: Number(e.target.value) })}
                        >
                          <NumberInputField borderRadius="xl" focusBorderColor="teal.400" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </Stack>
                  </Box>

                  <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={6}>
                    <Text fontWeight="700" mb={4}>⏱️ Schedule Configuration</Text>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Reminder Check Schedule (cron)</FormLabel>
                        <Input
                          defaultValue={settings?.reminderSchedule ?? "0 9 * * *"}
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          onBlur={(e) => handleSaveThresholds({ reminderSchedule: e.target.value })}
                          fontFamily="mono"
                          fontSize="sm"
                        />
                        <Text fontSize="xs" color={mutedText} mt={1}>Default: daily at 9am UTC</Text>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Weekly Summary Schedule (cron)</FormLabel>
                        <Input
                          defaultValue={settings?.weeklySummarySchedule ?? "0 9 * * 1"}
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          onBlur={(e) => handleSaveThresholds({ weeklySummarySchedule: e.target.value })}
                          fontFamily="mono"
                          fontSize="sm"
                        />
                        <Text fontSize="xs" color={mutedText} mt={1}>Default: Monday 9am UTC</Text>
                      </FormControl>
                    </Stack>
                  </Box>
                </Grid>
              </TabPanel>

              {/* ── Tab 3: Delivery Logs ── */}
              <TabPanel p={0}>
                <Stack spacing={4}>
                  <Flex gap={3} align="center" flexWrap="wrap">
                    <Select
                      placeholder="All statuses"
                      value={logFilter.status}
                      onChange={(e) => setLogFilter((p) => ({ ...p, status: e.target.value }))}
                      size="sm"
                      borderRadius="xl"
                      w="160px"
                    >
                      <option value="queued">Queued</option>
                      <option value="sent">Sent</option>
                      <option value="failed">Failed</option>
                    </Select>
                    <Select
                      placeholder="All types"
                      value={logFilter.type}
                      onChange={(e) => setLogFilter((p) => ({ ...p, type: e.target.value }))}
                      size="sm"
                      borderRadius="xl"
                      w="200px"
                    >
                      {ALL_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </Select>
                    <Button size="sm" leftIcon={<FiRefreshCw />} onClick={fetchLogs} variant="outline" colorScheme="teal" borderRadius="xl">Refresh</Button>
                    <Button size="sm" leftIcon={<FiAlertTriangle />} onClick={handleRetryAll} colorScheme="red" variant="outline" borderRadius="xl" ml="auto">
                      Retry All Failed
                    </Button>
                  </Flex>

                  {logsLoading ? (
                    <Stack spacing={2}>{[...Array(5)].map((_, i) => <Skeleton key={i} height="48px" borderRadius="xl" />)}</Stack>
                  ) : logs.length === 0 ? (
                    <Alert status="info" borderRadius="xl">
                      <AlertIcon />No email logs found matching your filters.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="sm" variant="simple">
                        <Thead bg={tableBg}>
                          <Tr>
                            <Th>Type</Th>
                            <Th>To</Th>
                            <Th>Subject</Th>
                            <Th>Status</Th>
                            <Th>Date</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {logs.map((log) => (
                            <Tr key={log._id} _hover={{ bg: tableBg }}>
                              <Td>
                                <Badge variant="subtle" colorScheme="teal" borderRadius="md" fontSize="10px">
                                  {log.type}
                                </Badge>
                              </Td>
                              <Td fontSize="xs" maxW="160px" isTruncated>{log.to}</Td>
                              <Td fontSize="xs" maxW="200px" isTruncated>{log.subject}</Td>
                              <Td><StatusBadge status={log.status} /></Td>
                              <Td fontSize="xs" color={mutedText}>
                                {log.createdAt ? new Date(log.createdAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : "—"}
                              </Td>
                              <Td>
                                {log.status === "failed" && (
                                  <Tooltip label={log.errorMessage || "Unknown error"}>
                                    <Button size="xs" leftIcon={<FiRefreshCw />} onClick={() => handleRetry(log.jobId)} colorScheme="orange" variant="outline" borderRadius="lg">
                                      Retry
                                    </Button>
                                  </Tooltip>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Pagination */}
                  {logsTotal > 20 && (
                    <Flex justify="center" gap={2}>
                      <Button size="sm" isDisabled={logPage <= 1} onClick={() => setLogPage((p) => p - 1)} variant="outline" borderRadius="xl">← Prev</Button>
                      <Text fontSize="sm" alignSelf="center" color={mutedText}>Page {logPage} of {Math.ceil(logsTotal / 20)}</Text>
                      <Button size="sm" isDisabled={logPage >= Math.ceil(logsTotal / 20)} onClick={() => setLogPage((p) => p + 1)} variant="outline" borderRadius="xl">Next →</Button>
                    </Flex>
                  )}
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </CustomBox>

      {/* ── Email Preview Modal ── */}
      <Modal isOpen={isPreviewOpen} onClose={closePreview} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            <Flex align="center" gap={2}>
              <FiEye />
              <Text>Preview: {previewTemplate}</Text>
              <Badge colorScheme="teal" ml={2} borderRadius="full">HTML</Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            {previewLoading ? (
              <Flex align="center" justify="center" h="400px">
                <Stack align="center">
                  <FiClock size={32} />
                  <Text color={mutedText}>Loading preview…</Text>
                </Stack>
              </Flex>
            ) : (
              <iframe
                srcDoc={previewHtml}
                title={`Preview: ${previewTemplate}`}
                style={{ width: "100%", height: "600px", border: "none", borderRadius: "0 0 16px 16px" }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
