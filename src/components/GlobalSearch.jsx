"use client";

import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Flex,
  Icon,
  Stack,
  Badge,
  Kbd,
  useColorModeValue,
  useDisclosure,
  Skeleton,
  IconButton,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiX,
  FiTag,
  FiGrid,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useSettings, formatMoney } from "@/hooks/useSettings";
import { useHighlight } from "@/hooks/useHighlight";
import dateFormat from "@/utils/dateFormat";
import Image from "next/image";

// ─── helpers ──────────────────────────────────────────────────────

const HighlightedText = ({ text, highlight }) => {
  if (!text || !highlight) return <>{text}</>;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text as="span" key={i} bg="yellow.200" color="black" fontWeight="bold" borderRadius="2px" px="1px">
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text as="span" key={i}>{part}</Text>;
      })}
    </>
  );
};

const ModuleIcon = ({ module }) => {
  const icons = { Income: FiTrendingUp, Expense: FiTrendingDown, Category: FiGrid };
  const colors = { Income: "green.500", Expense: "red.500", Category: "blue.500" };
  return <Icon as={icons[module] || FiTag} color={colors[module] || "gray.500"} boxSize={4} />;
};

// Simple throttle utility
function useThrottledCallback(callback, delay) {
  const lastCall = useRef(0);
  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}

// ─── component ────────────────────────────────────────────────────

const GlobalSearch = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [groups, setGroups] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debounceTimer = useRef(null);
  const router = useRouter();
  const { settings } = useSettings();
  const { setHighlightId } = useHighlight();

  const bg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.800");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const selectedBg = useColorModeValue("teal.50", "teal.900");
  const selectedBorder = useColorModeValue("teal.200", "teal.700");
  const groupHeaderBg = useColorModeValue("gray.50", "gray.800");

  // ── open/close shortcuts ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : onOpen();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setGroups({});
      setSelectedIndex(0);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    }
  }, [isOpen]);

  // ── debounced search with AbortController ──────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setGroups({});
      setSelectedIndex(0);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      try {
        const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
        const response = await axiosInstance.get(
          `/api/search?user=${user.id || ""}&q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        const data = response.data;
        setResults(data?.results || []);
        setGroups(data?.groups || {});
        setSelectedIndex(0);
      } catch (err) {
        if (err.name === "AbortError" || err.code === "ERR_CANCELED") return;
        console.error("Search error:", err);
        setResults([]);
        setGroups({});
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // ── navigation ─────────────────────────────────────────────────
  const handleSelect = useCallback(
    (item) => {
      onClose();
      if (item._id) {
        setHighlightId(item._id);
      }
      // Build URL with page and highlight params
      // ALWAYS include page so the destination can jump directly to it
      const params = new URLSearchParams();
      const pageNum = typeof item.page === "number" ? item.page : 1;
      params.set("page", String(pageNum));
      params.set("highlight", item._id);
      const url = `${item.route}?${params.toString()}`;
      console.log("[GlobalSearch] Navigating to:", url, "item:", item.title, "page:", pageNum);
      router.push(url);
    },
    [onClose, router, setHighlightId]
  );

  // ── throttled keyboard navigation ──────────────────────────────
  const throttledSetIndex = useThrottledCallback(
    (setter) => setter(),
    80
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        throttledSetIndex(() =>
          setSelectedIndex((prev) => (prev + 1) % results.length)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        throttledSetIndex(() =>
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = results[selectedIndex];
        if (item) handleSelect(item);
      }
    },
    [results, selectedIndex, handleSelect, throttledSetIndex]
  );

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setGroups({});
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const groupOrder = ["Income", "Expense", "Category"];
  const groupLabels = { Income: "Incomes", Expense: "Expenses", Category: "Categories" };

  return (
    <>
      {/* Trigger */}
      <Flex
        align="center" gap={2} px={3} py={2} borderRadius="lg" border="1px solid"
        borderColor={borderColor} bg={useColorModeValue("gray.50", "gray.800")}
        cursor="pointer" onClick={onOpen}
        _hover={{ borderColor: "teal.300", bg: useColorModeValue("gray.100", "gray.700") }}
        transition="all 0.2s" w={{ base: "full", md: "220px" }}
      >
        <Icon as={FiSearch} color={mutedText} boxSize={4} />
        <Text fontSize="sm" color={mutedText} flex={1}>Search transactions...</Text>
        <Kbd fontSize="10px" bg={useColorModeValue("white", "gray.700")} borderRadius="md">⌘K</Kbd>
      </Flex>

      {/* Command Palette */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={bg} borderRadius="2xl" boxShadow="2xl" mx={4} mt={{ base: 4, md: "10vh" }} mb={0} overflow="hidden">
          <Box p={0}>
            {/* Input */}
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" pl={4}>
                <Icon as={FiSearch} color={mutedText} boxSize={5} />
              </InputLeftElement>
              <Input
                ref={inputRef}
                placeholder="Search by title, amount, date, or category..."
                borderRadius="2xl 2xl 0 0" border="none" borderBottom="1px solid" borderBottomColor={borderColor}
                focusBorderColor="transparent" fontSize="md" pl={12} pr={12} py={6}
                value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                _placeholder={{ color: mutedText }}
              />
              {query && (
                <InputRightElement pr={4}>
                  <IconButton icon={<FiX />} size="sm" variant="ghost" colorScheme="gray" borderRadius="full"
                    aria-label="Clear search" onClick={handleClear} />
                </InputRightElement>
              )}
            </InputGroup>

            {/* Results */}
            <Box maxH="60vh" overflowY="auto" p={2}>
              {isLoading && (
                <Stack spacing={2} p={2}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="56px" borderRadius="xl" />
                  ))}
                </Stack>
              )}

              {!isLoading && query.trim() && results.length === 0 && (
                <Box p={8} textAlign="center">
                  <Icon as={FiSearch} boxSize={8} color="gray.300" mb={3} />
                  <Text color={mutedText} fontSize="sm" fontWeight="medium">No results found</Text>
                  <Text fontSize="xs" color={mutedText} mt={1}>Try searching with a different term</Text>
                </Box>
              )}

              {!isLoading && !query.trim() && (
                <Box p={8} textAlign="center">
                  <Icon as={FiSearch} boxSize={8} color="gray.300" mb={3} />
                  <Text color={mutedText} fontSize="sm" fontWeight="medium">Search across all your data</Text>
                  <Text fontSize="xs" color={mutedText} mt={1}>Find incomes, expenses, and categories instantly</Text>
                </Box>
              )}

              {!isLoading && results.length > 0 && (
                <Stack spacing={1}>
                  {groupOrder.map((module) => {
                    const moduleResults = groups[module];
                    if (!moduleResults || moduleResults.length === 0) return null;

                    return (
                      <Box key={module}>
                        {/* Group header */}
                        <Flex align="center" gap={2} px={3} py={1.5} bg={groupHeaderBg} borderRadius="lg" mb={1}>
                          <ModuleIcon module={module} />
                          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
                            {groupLabels[module]}
                          </Text>
                          <Badge size="sm" variant="subtle" borderRadius="full" fontSize="10px">{moduleResults.length}</Badge>
                        </Flex>

                        {/* Items */}
                        {moduleResults.map((item) => {
                          const globalIndex = results.findIndex((r) => r._id === item._id && r.module === item.module);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <Flex
                              key={`${item.module}-${item._id}`}
                              align="center" gap={3} px={3} py={2.5} borderRadius="xl" cursor="pointer"
                              bg={isSelected ? selectedBg : "transparent"}
                              border="1px solid" borderColor={isSelected ? selectedBorder : "transparent"}
                              _hover={{ bg: isSelected ? selectedBg : hoverBg }}
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              {/* Icon */}
                              <Flex w={9} h={9} borderRadius="lg"
                                bg={item.type === "income" ? "green.50" : item.type === "expense" ? "red.50" : "blue.50"}
                                align="center" justify="center" flexShrink={0}>
                                {item.type === "income" ? (
                                  <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                                ) : item.type === "expense" && item.category?.icon ? (
                                  <Image src={item.category.icon} alt={item.category.name} width={18} height={18} />
                                ) : item.type === "category" ? (
                                  <Icon as={FiGrid} color="blue.500" boxSize={4} />
                                ) : (
                                  <Icon as={FiTrendingDown} color="red.500" boxSize={4} />
                                )}
                              </Flex>

                              {/* Content */}
                              <Flex flex={1} align="center" gap={3} minW={0}>
                                <Stack spacing={0} flex={1} minW={0}>
                                  <Flex align="center" gap={2}>
                                    <Text fontWeight="semibold" fontSize="sm" isTruncated>
                                      <HighlightedText text={item.titleHighlighted || item.title} highlight={query} />
                                    </Text>
                                    {item.isRecurring && (
                                      <Badge colorScheme={item.type === "income" ? "green" : "red"} variant="subtle" fontSize="9px" borderRadius="full">
                                        {item.recurringFrequency}
                                      </Badge>
                                    )}
                                  </Flex>
                                  <Text fontSize="xs" color={mutedText} isTruncated>
                                    {item.type === "category" ? (
                                      <><Icon as={FiDollarSign} boxSize={2.5} display="inline" mr={0.5} />{item.subTitle}</>
                                    ) : (
                                      <>
                                        <HighlightedText text={item.subTitleHighlighted || item.subTitle} highlight={query} />
                                        {" · "}<Icon as={FiCalendar} boxSize={2.5} display="inline" mr={0.5} />
                                        {dateFormat(item.date)}
                                      </>
                                    )}
                                  </Text>
                                </Stack>

                                {item.type !== "category" && (
                                  <Text fontWeight="bold" fontSize="sm" color={item.type === "income" ? "green.500" : "red.500"} flexShrink={0}>
                                    {item.type === "income" ? "+" : "-"}{formatMoney(item.amount, settings)}
                                  </Text>
                                )}
                              </Flex>

                              {isSelected && <Icon as={FiArrowRight} color="teal.500" boxSize={4} flexShrink={0} />}
                            </Flex>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Footer */}
            <Flex px={4} py={2} borderTop="1px solid" borderTopColor={borderColor} gap={4} fontSize="xs" color={mutedText}
              justify="space-between" align="center">
              <Flex gap={4}>
                <Flex align="center" gap={1}><Kbd fontSize="10px">↑</Kbd><Kbd fontSize="10px">↓</Kbd><Text>Navigate</Text></Flex>
                <Flex align="center" gap={1}><Kbd fontSize="10px">↵</Kbd><Text>Select</Text></Flex>
                <Flex align="center" gap={1}><Kbd fontSize="10px">esc</Kbd><Text>Close</Text></Flex>
              </Flex>
              {results.length > 0 && (
                <Text fontSize="xs" color={mutedText}>{results.length} result{results.length !== 1 ? "s" : ""}</Text>
              )}
            </Flex>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GlobalSearch;
