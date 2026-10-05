"use client";

import {
  Box,
  Stack,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  Link,
  Button,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  FiTrendingDown,
  FiTrendingUp,
  FiTag,
  FiTarget,
  FiRepeat,
  FiBarChart2,
  FiUploadCloud,
  FiDownload,
  FiMail,
  FiShield,
  FiSun,
  FiSmartphone,
  FiDollarSign,
  FiKey,
} from "react-icons/fi";

const groups = [
  {
    id: "tracking",
    short: "Tracking",
    title: "Tracking what you spend and earn",
    blurb:
      "The core of the app: capture transactions accurately enough that you trust the totals later.",
    items: [
      {
        title: "Expense tracking",
        text: "Record an expense with a title, amount, date, and category, plus an optional note and payment method. Search across your history from anywhere in the app.",
        icon: FiTrendingDown,
        color: "red",
      },
      {
        title: "Income tracking",
        text: "Log income against the source it came from, so salary, freelance work, and other streams stay separate but total together.",
        icon: FiTrendingUp,
        color: "green",
      },
      {
        title: "Categories with limits",
        text: "Group spending into categories you define, give any category its own budget, and watch progress against it as the month fills up.",
        icon: FiTag,
        color: "blue",
      },
      {
        title: "Recurring entries",
        text: "Mark rent, subscriptions, or regular pay as recurring on a daily, weekly, monthly, or yearly cycle, then filter either list down to recurring entries only.",
        icon: FiRepeat,
        color: "purple",
      },
    ],
  },
  {
    id: "budgeting",
    short: "Budgeting",
    title: "Budgeting that reflects the day you are on",
    blurb:
      "A monthly figure on its own tells you very little. SpendWise turns it into what is genuinely available today.",
    items: [
      {
        title: "Daily and monthly budgets",
        text: "Set a monthly allowance and SpendWise derives your daily base from it, working out days in the month correctly for February and leap years.",
        icon: FiTarget,
        color: "teal",
      },
      {
        title: "Carry-forward that adds up",
        text: "Unspent budget from earlier days rolls into today, and overspending reduces it. The dashboard shows your base budget, carry-forward, and what is left today separately, so the number is never a mystery.",
        icon: FiDollarSign,
        color: "orange",
      },
      {
        title: "A clean slate each month",
        text: "Months are independent. A new month starts from its own configured budget instead of inheriting the previous month's balance, and you can look back at any earlier month.",
        icon: FiBarChart2,
        color: "cyan",
      },
    ],
  },
  {
    id: "insight",
    short: "Reports",
    title: "Reports and charts",
    blurb:
      "The same records, arranged so a pattern is visible instead of inferred.",
    items: [
      {
        title: "Monthly and category reports",
        text: "Break spending down by month and by category, see totals against budgets, and identify your largest and smallest entries so outliers stand out.",
        icon: FiBarChart2,
        color: "purple",
      },
      {
        title: "Trend over time",
        text: "Follow how income and spending have moved across periods rather than judging a single month in isolation.",
        icon: FiTrendingUp,
        color: "green",
      },
    ],
  },
  {
    id: "data",
    short: "Import & export",
    title: "Getting data in and out",
    blurb:
      "Your records should never be trapped in one tool. They come in from a file, and they leave as a file.",
    items: [
      {
        title: "CSV import",
        text: "Bring in a .csv of past transactions. Columns are title, amount, expenseDate, and category, matched by category name against categories you already have, with a downloadable sample file to follow.",
        icon: FiUploadCloud,
        color: "blue",
      },
      {
        title: "CSV and JSON export",
        text: "Export expenses and income in either format. Exports are generated in your browser and downloaded straight to your device, which also makes them a convenient backup.",
        icon: FiDownload,
        color: "teal",
      },
      {
        title: "Files stay on your device",
        text: "Import and export are handled in the browser. The spreadsheet you import is never uploaded, and an export never passes through the server on its way to you.",
        icon: FiShield,
        color: "green",
      },
    ],
  },
  {
    id: "account",
    short: "Account & alerts",
    title: "Account, alerts, and comfort",
    blurb:
      "Small things that make the app pleasant to use daily and straightforward to keep secure.",
    items: [
      {
        title: "Email notifications you control",
        text: "Eleven notification types, including budget warnings, overspending alerts, large-expense flags, weekly summaries, and reminders for recurring entries. Switch each one on or off and tune the thresholds.",
        icon: FiMail,
        color: "pink",
      },
      {
        title: "Verified accounts and recovery",
        text: "Passwords are hashed with bcrypt, verification and reset tokens are stored hashed with their own expiry, and repeated failed sign-ins trigger a temporary lockout.",
        icon: FiKey,
        color: "red",
      },
      {
        title: "Display that suits you",
        text: "Choose your currency, pick from seven date formats, set rows per page, and switch between light and dark themes. Preferences are remembered.",
        icon: FiSun,
        color: "yellow",
      },
      {
        title: "Works on any screen",
        text: "The layout adapts from phone to desktop, so checking a figure on the way out of a shop is as easy as sitting at a desk.",
        icon: FiSmartphone,
        color: "teal",
      },
    ],
  },
];

export default function FeaturesPageContent() {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const chipBg = useColorModeValue("teal.50", "whiteAlpha.100");

  return (
    <Stack spacing={16}>
      <Box as="header" textAlign="center">
        <Badge colorScheme="teal" variant="subtle" mb={4} px={3} py={1} rounded="full">
          Features
        </Badge>
        <Heading
          as="h1"
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="bold"
          color={headingColor}
          lineHeight="1.2"
        >
          Everything SpendWise does, in one place
        </Heading>
        <Text
          mt={4}
          fontSize={{ base: "md", md: "lg" }}
          lineHeight="tall"
          color={mutedColor}
          maxW="3xl"
          mx="auto"
        >
          SpendWise is built around one idea: your budget should tell you what you
          can spend today, not just what you spent last month. Here is the full
          picture, including where it deliberately stops.
        </Text>
      </Box>

      <Box as="nav" aria-label="Feature categories">
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={3}>
          {groups.map((group) => (
            <Link
              key={group.id}
              as={NextLink}
              href={`#${group.id}`}
              fontSize="sm"
              fontWeight="medium"
              color="teal.700"
              bg={chipBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="lg"
              px={4}
              py={3}
              _hover={{ borderColor: "teal.400" }}
            >
              {group.short}
            </Link>
          ))}
        </SimpleGrid>
      </Box>

      {groups.map((group) => (
        <Box as="section" key={group.id} id={group.id} scrollMarginTop="6rem">
          <Heading as="h2" size="lg" mb={2} color={headingColor}>
            {group.title}
          </Heading>
          <Text color={mutedColor} mb={8} maxW="3xl" lineHeight="tall">
            {group.blurb}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {group.items.map((item) => (
              <Box
                key={item.title}
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                p={{ base: 5, md: 6 }}
              >
                <Flex align="center" gap={3} mb={3}>
                  <Flex
                    w={10}
                    h={10}
                    align="center"
                    justify="center"
                    rounded="lg"
                    bg={`${item.color}.50`}
                  >
                    <Icon as={item.icon} color={`${item.color}.500`} w={5} h={5} />
                  </Flex>
                  <Heading as="h3" size="sm" color={headingColor}>
                    {item.title}
                  </Heading>
                </Flex>
                <Text color={mutedColor} fontSize="sm" lineHeight="tall">
                  {item.text}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ))}

      <Box bg={sectionBg} borderRadius="2xl" p={{ base: 8, md: 12 }}>
        <Heading as="h2" size="md" mb={3} color={headingColor}>
          What SpendWise does not do
        </Heading>
        <Text color={mutedColor} mb={6} maxW="3xl" lineHeight="tall">
          Being clear about the edges is as useful as listing the features. There
          are no bank connections, no advertising or analytics, and no AI analysis
          of your finances. Everything you see is calculated from records you
          entered.
        </Text>
        <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
          <Button as={NextLink} href="/auth?tab=signup" colorScheme="teal" rounded="full">
            Create an account
          </Button>
          <Button as={NextLink} href="/faq" variant="outline" colorScheme="teal" rounded="full">
            Read the FAQ
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
