"use client";

import Layout from "@/components/Layout";
import CustomBox from "@/components/CustomBox";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import {
  Box, Button, Flex, Grid, Heading, Text, Badge, Stack, Input, Select,
  Switch, useColorModeValue, useToast, Skeleton, Icon, Tooltip,
  Divider, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Alert, AlertIcon,
  SimpleGrid, Progress,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiMail, FiSettings, FiSend, FiRefreshCw, FiAlertTriangle,
  FiCheckCircle, FiClock, FiBarChart2, FiUsers, FiShield,
  FiPaperclip, FiToggleRight, FiLock,
} from "react-icons/fi";

const MotionBox = motion(Box);

const ALL_TEMPLATES = [
  { key: "welcome", label: "Welcome", icon: "👋", phase: 1 },
  { key: "verify-email", label: "Email Verification", icon: "✉️", phase: 1 },
  { key: "password-reset", label: "Password Reset", icon: "🔑", phase: 1 },
  { key: "budget-warning", label: "Budget Warning (80%)", icon: "⚠️", phase: 1 },
  { key: "budget-exceeded", label: "Budget Exceeded", icon: "🔴", phase: 1 },
  { key: "monthly-report", label: "Monthly Report", icon: "📊", phase: 1 },
  { key: "failed-login", label: "Failed Login Alert", icon: "🚫", phase: 1 },
  { key: "login-notification", label: "Login Notification", icon: "🔐", phase: 2 },
  { key: "large-expense-alert", label: "Large Expense Alert", icon: "💸", phase: 2 },
  { key: "upcoming-reminder", label: "Upcoming Reminder", icon: "📅", phase: 2 },
  { key: "weekly-spending-summary", label: "Weekly Summary", icon: "📈", phase: 2 },
  { key: "recurring-batch-summary", label: "Recurring Batch Summary", icon: "🔄", phase: 2 },
  { key: "overspending-alert", label: "Overspending Alert", icon: "⚡", phase: 2 },
  { key: "savings-milestone", label: "Savings Milestone", icon: "🎉", phase: 2 },
  { key: "bulk-import-summary", label: "Bulk Import Summary", icon: "📥", phase: 2 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState({ status: "", type: "" });
  const [refreshing, setRefreshing] = useState(false);

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const tableBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    setUser(stored);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        axiosInstance.get("/api/admin/emails/settings"),
        axiosInstance.get(`/api/admin/emails?user=${user.id}&limit=50&page=1`),
      ]);
      setSettings(settingsRes.data.settings || {});
      setLogs(logsRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchData();
    else if (user && !user?.id) setLoading(false);
  }, [user?.id, fetchData]);

  const filteredLogs = logs.filter((log) => {
    if (logFilter.status && log.status !== logFilter.status) return false;
    if (logFilter.type && log.type !== logFilter.type) return false;
    return true;
  });

  const stats = {
    sent: logs.filter((l) => l.status === "sent").length,
    queued: logs.filter((l) => l.status === "queued").length,
    failed: logs.filter((l) => l.status === "failed").length,
    bounced: logs.filter((l) => l.status === "bounced").length,
    total: logs.length,
  };

  const enabledCount = ALL_TEMPLATES.filter(
    (t) => settings?.enabledTemplates?.[t.key] !== false
  ).length;

  const handleRetry = async (jobId) => {
    if (!user?.id) return;
    try {
      await axiosInstance.post(`/api/admin/emails?user=${user.id}`, { action: "retry", jobId });
      toast({ title: "Email queued for retry", status: "success", duration: 2000, isClosable: true, position: "top-right" });
      fetchData();
    } catch {
      toast({ title: "Retry failed", status: "error", duration: 2000, isClosable: true, position: "top-right" });
    }
  };

  const handleRetryAll = async () => {
    if (!user?.id) return;
    try {
      const r = await axiosInstance.post(`/api/admin/emails?user=${user.id}`, { action: "retry-all-failed" });
      toast({ title: r.data.message, status: "success", duration: 3000, isClosable: true, position: "top-right" });
      fetchData();
    } catch {
      toast({ title: "Retry all failed", status: "error", duration: 2000, isClosable: true, position: "top-right" });
    }
  };

  const StatusBadge = ({ status }) => {
    const colorMap = { sent: "green", queued: "blue", failed: "red", bounced: "orange" };
    return <Badge colorScheme={colorMap[status] || "gray"} borderRadius="full" px={2} fontSize="xs">{status}</Badge>;
  };

  const StatCard = ({ label, value, color, icon, helpText, arrow }) => (
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
      <Flex align="center" justify="space-between" mb={2}>
        <Text fontSize="sm" color={mutedText} fontWeight="500">{label}</Text>
        <Flex w={9} h={9} borderRadius="lg" bg={`${color}.50`} _dark={{ bg: `${color}.900` }} align="center" justify="center">
          <Icon as={icon} color={`${color}.500`} boxSize={4} />
        </Flex>
      </Flex>
      <Text fontSize="2xl" fontWeight="bold" color={`${color}.500`}>{value}</Text>
      {helpText && (
        <Text fontSize="xs" color={mutedText} mt={1}>
          {arrow && <StatArrow type={arrow} />}{helpText}
        </Text>
      )}
    </MotionBox>
  );

  if (loading) {
    return (
      <Layout>
        <CustomBox>
          <Stack spacing={6}>
            <Skeleton height="40px" width="300px" borderRadius="xl" />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {[...Array(4)].map((_, i) => <Skeleton key={i} height="120px" borderRadius="2xl" />)}
            </SimpleGrid>
            <Skeleton height="300px" borderRadius="2xl" />
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
                ? "Please log in to access the admin dashboard."
                : "You do not have permission to access this page. Only administrators can view the admin dashboard."}
            </Text>
          </Flex>
        </CustomBox>
      </Layout>
    );
  }

  return (
    <Layout>
      <CustomBox>
        <Stack spacing={8}>
          {/* Header */}
          <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" fontWeight="bold" mb={1}>Admin Dashboard</Heading>
              <Text fontSize="sm" color={mutedText}>System overview, email management, and delivery monitoring</Text>
            </Box>
            <Flex gap={3}>
              <Button
                leftIcon={<FiMail />}
                size="sm"
                colorScheme="teal"
                borderRadius="xl"
                onClick={() => router.push("/admin/emails")}
              >
                Email Settings
              </Button>
              <Button
                leftIcon={<FiRefreshCw />}
                size="sm"
                variant="outline"
                colorScheme="gray"
                borderRadius="xl"
                onClick={fetchData}
                isLoading={refreshing}
              >
                Refresh
              </Button>
            </Flex>
          </Flex>

          {/* ── Stats Overview ── */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
            <StatCard label="Total Sent" value={stats.sent} color="green" icon={FiCheckCircle} helpText="Successfully delivered" />
            <StatCard label="Queued" value={stats.queued} color="blue" icon={FiClock} helpText="Awaiting delivery" />
            <StatCard label="Failed" value={stats.failed} color="red" icon={FiAlertTriangle} helpText={stats.failed > 0 ? `${stats.failed} need attention` : "All clear"} />
            <StatCard label="Templates Active" value={`${enabledCount}/${ALL_TEMPLATES.length}`} color="purple" icon={FiToggleRight} helpText="Email templates enabled" />
          </SimpleGrid>

          {/* ── Template Status Overview ── */}
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            bg={bgCard}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="2xl"
            p={6}
            boxShadow="sm"
          >
            <Flex align="center" justify="space-between" mb={4}>
              <Flex align="center" gap={2}>
                <Icon as={FiShield} color="teal.500" />
                <Text fontWeight="700">Template Status</Text>
              </Flex>
              <Badge colorScheme="teal" borderRadius="full" px={3}>
                {enabledCount} / {ALL_TEMPLATES.length} active
              </Badge>
            </Flex>
            <Progress
              value={(enabledCount / ALL_TEMPLATES.length) * 100}
              colorScheme="teal"
              borderRadius="full"
              size="sm"
              mb={4}
            />
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={2}>
              {ALL_TEMPLATES.map((tpl) => {
                const isEnabled = settings?.enabledTemplates?.[tpl.key] !== false;
                return (
                  <Flex key={tpl.key} align="center" gap={2} p={2} borderRadius="lg" bg={isEnabled ? "green.50" : "red.50"} _dark={{ bg: isEnabled ? "green.900" : "red.900" }}>
                    <Text fontSize="16px">{tpl.icon}</Text>
                    <Text fontSize="xs" fontWeight="500" flex={1} isTruncated>{tpl.label}</Text>
                    <Box w={2} h={2} borderRadius="full" bg={isEnabled ? "green.400" : "red.400"} />
                  </Flex>
                );
              })}
            </SimpleGrid>
          </MotionBox>

          {/* ── Recent Delivery Logs ── */}
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            bg={bgCard}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="2xl"
            p={6}
            boxShadow="sm"
          >
            <Stack spacing={4}>
              <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
                <Flex align="center" gap={2}>
                  <Icon as={FiPaperclip} color="teal.500" />
                  <Text fontWeight="700">Recent Delivery Logs</Text>
                  <Badge colorScheme="teal" borderRadius="full" fontSize="10px">{stats.total} total</Badge>
                </Flex>
                <Flex gap={2} align="center" flexWrap="wrap">
                  <Select
                    placeholder="All statuses"
                    value={logFilter.status}
                    onChange={(e) => setLogFilter((p) => ({ ...p, status: e.target.value }))}
                    size="sm"
                    borderRadius="xl"
                    w="140px"
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
                    w="170px"
                  >
                    {ALL_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </Select>
                  <Button size="sm" leftIcon={<FiAlertTriangle />} onClick={handleRetryAll} colorScheme="red" variant="outline" borderRadius="xl">
                    Retry All Failed
                  </Button>
                </Flex>
              </Flex>

              {filteredLogs.length === 0 ? (
                <Alert status="info" borderRadius="xl">
                  <AlertIcon />No delivery logs found matching your filters.
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
                      {filteredLogs.map((log) => (
                        <Tr key={log._id} _hover={{ bg: tableBg }}>
                          <Td>
                            <Badge variant="subtle" colorScheme="teal" borderRadius="md" fontSize="10px">{log.type}</Badge>
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

              <Flex justify="flex-end">
                <Button
                  size="sm"
                  rightIcon={<FiMail />}
                  colorScheme="teal"
                  variant="ghost"
                  borderRadius="xl"
                  onClick={() => router.push("/admin/emails")}
                >
                  View Full Email Management
                </Button>
              </Flex>
            </Stack>
          </MotionBox>
        </Stack>
      </CustomBox>
    </Layout>
  );
}
