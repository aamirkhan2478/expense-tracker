"use client";

import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Flex,
  Icon,
  Stack,
  Badge,
  Kbd,
  useColorModeValue,
  useDisclosure,
  Skeleton,
} from "@chakra-ui/react";
import { FiSearch, FiTrendingUp, FiTrendingDown, FiArrowRight } from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useSettings, formatMoney } from "@/hooks/useSettings";
import dateFormat from "@/utils/dateFormat";
import Image from "next/image";

const GlobalSearch = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();
  const { settings } = useSettings();

  const bg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.800");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const selectedBg = useColorModeValue("teal.50", "teal.900");
  const selectedBorder = useColorModeValue("teal.200", "teal.700");

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpen, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const user =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("user") || "{}")
            : {};
        const response = await axiosInstance.get(
          `/api/search?user=${user.id || ""}&q=${encodeURIComponent(query.trim())}`
        );
        setResults(response.data?.results || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (item) => {
      onClose();
      if (item.type === "income") {
        router.push("/income");
      } else {
        router.push("/expense");
      }
    },
    [onClose, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = results[selectedIndex];
        if (item) {
          handleSelect(item);
        }
      }
    },
    [results, selectedIndex, handleSelect]
  );

  return (
    <>
      {/* Search trigger button */}
      <Flex
        align="center"
        gap={2}
        px={3}
        py={2}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        bg={useColorModeValue("gray.50", "gray.800")}
        cursor="pointer"
        onClick={onOpen}
        _hover={{ borderColor: "teal.300", bg: useColorModeValue("gray.100", "gray.700") }}
        transition="all 0.2s"
        w={{ base: "full", md: "240px" }}
      >
        <Icon as={FiSearch} color={mutedText} boxSize={4} />
        <Text fontSize="sm" color={mutedText} flex={1}>
          Search transactions...
        </Text>
        <Kbd fontSize="10px" bg={useColorModeValue("white", "gray.700")} borderRadius="md">
          ⌘K
        </Kbd>
      </Flex>

      {/* Command Palette Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          bg={bg}
          borderRadius="2xl"
          boxShadow="2xl"
          mx={4}
          mt={{ base: 4, md: "10vh" }}
          mb={0}
          overflow="hidden"
        >
          <Box p={0}>
            {/* Search Input */}
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" pl={4}>
                <Icon as={FiSearch} color={mutedText} boxSize={5} />
              </InputLeftElement>
              <Input
                ref={inputRef}
                placeholder="Search by title, amount, or date..."
                borderRadius="2xl 2xl 0 0"
                border="none"
                borderBottom="1px solid"
                borderBottomColor={borderColor}
                focusBorderColor="transparent"
                fontSize="md"
                pl={12}
                pr={4}
                py={6}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                _placeholder={{ color: mutedText }}
              />
            </InputGroup>

            {/* Results Area */}
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
                  <Text color={mutedText} fontSize="sm">
                    No transactions found for &quot;{query}&quot;
                  </Text>
                  <Text fontSize="xs" color={mutedText} mt={1}>
                    Try searching by title, amount, or date
                  </Text>
                </Box>
              )}

              {!isLoading && !query.trim() && (
                <Box p={8} textAlign="center">
                  <Text color={mutedText} fontSize="sm">
                    Type to search across all transactions
                  </Text>
                  <Text fontSize="xs" color={mutedText} mt={1}>
                    Search by title, amount, or date
                  </Text>
                </Box>
              )}

              {!isLoading && results.length > 0 && (
                <Stack spacing={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={mutedText}
                    px={2}
                    py={1}
                  >
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </Text>
                  {results.map((item, index) => (
                    <Flex
                      key={`${item.type}-${item._id}`}
                      align="center"
                      gap={3}
                      px={3}
                      py={2.5}
                      borderRadius="xl"
                      cursor="pointer"
                      bg={index === selectedIndex ? selectedBg : "transparent"}
                      border="1px solid"
                      borderColor={index === selectedIndex ? selectedBorder : "transparent"}
                      _hover={{ bg: hoverBg }}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* Icon */}
                      <Flex
                        w={9}
                        h={9}
                        borderRadius="lg"
                        bg={item.type === "income" ? "green.50" : "red.50"}
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        {item.type === "income" ? (
                          <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                        ) : item.category?.icon ? (
                          <Image
                            src={item.category.icon}
                            alt={item.category.name}
                            width={18}
                            height={18}
                          />
                        ) : (
                          <Icon as={FiTrendingDown} color="red.500" boxSize={4} />
                        )}
                      </Flex>

                      {/* Content */}
                      <Flex flex={1} align="center" gap={3} minW={0}>
                        <Stack spacing={0} flex={1} minW={0}>
                          <Flex align="center" gap={2}>
                            <Text fontWeight="semibold" fontSize="sm" isTruncated>
                              {item.title}
                            </Text>
                            {item.isRecurring && (
                              <Badge
                                colorScheme={item.type === "income" ? "green" : "red"}
                                variant="subtle"
                                fontSize="9px"
                                borderRadius="full"
                              >
                                {item.recurringFrequency}
                              </Badge>
                            )}
                          </Flex>
                          <Text fontSize="xs" color={mutedText} isTruncated>
                            {item.subTitle} · {dateFormat(item.date)}
                          </Text>
                        </Stack>

                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          color={item.type === "income" ? "green.500" : "red.500"}
                          flexShrink={0}
                        >
                          {item.type === "income" ? "+" : "-"}
                          {formatMoney(item.amount, settings)}
                        </Text>
                      </Flex>

                      {index === selectedIndex && (
                        <Icon as={FiArrowRight} color="teal.500" boxSize={4} flexShrink={0} />
                      )}
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Footer hints */}
            <Flex
              px={4}
              py={2}
              borderTop="1px solid"
              borderTopColor={borderColor}
              gap={4}
              fontSize="xs"
              color={mutedText}
            >
              <Flex align="center" gap={1}>
                <Kbd fontSize="10px">↑</Kbd>
                <Kbd fontSize="10px">↓</Kbd>
                <Text>Navigate</Text>
              </Flex>
              <Flex align="center" gap={1}>
                <Kbd fontSize="10px">↵</Kbd>
                <Text>Select</Text>
              </Flex>
              <Flex align="center" gap={1}>
                <Kbd fontSize="10px">esc</Kbd>
                <Text>Close</Text>
              </Flex>
            </Flex>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GlobalSearch;
