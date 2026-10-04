"use client";

import { Stack, Heading, Text, SimpleGrid, Link, Button, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";
import { PageHeader, Blocks, Section, Card } from "@/components/PublicPage/ContentBlocks";

const guides = [
  {
    id: "first-steps",
    title: "Set up your account",
    blurb: "Get from the sign-up form to a usable dashboard.",
    blocks: [
      {
        type: "ol",
        items: [
          "Open the sign-up form and enter your name, email address, and a password of at least 8 characters.",
          "Tick the agreement box. It is required before the form will submit.",
          "Confirm your email address using the link sent to you. It is valid for 24 hours.",
          "Sign in, then open Settings to choose your currency, date format, and how many rows each list shows.",
        ],
      },
      {
        type: "note",
        text: "If the verification email has not arrived, check your spam folder and use the resend option from the sign-in page. A fresh link replaces the old one.",
      },
    ],
  },
  {
    id: "first-transaction",
    title: "Record your first transactions",
    blurb: "Getting a clean base of data is what makes the reports useful.",
    blocks: [
      {
        type: "ol",
        items: [
          "Start with Categories. Create the handful you actually intend to use rather than a long list you will abandon.",
          "Open Expenses and add each outgoing payment with a title, amount, date, and category.",
          "Open Income and add what came in, recording the source so salary and other streams stay distinguishable.",
          "Add a note or payment method where it will save you guessing later.",
        ],
      },
      {
        type: "p",
        text: "A month or two of history is what makes the reports meaningful. The trend views need more than one period before they say anything useful.",
      },
    ],
  },
  {
    id: "budgets",
    title: "Set and understand budgets",
    blurb: "How the daily figure and carry-forward actually work.",
    blocks: [
      {
        type: "ol",
        items: [
          "Decide on a monthly allowance that reflects the whole month, not a single week.",
          "Set it for the month you want. Each month is independent, so a new month starts from its own configured figure rather than inheriting the previous balance.",
          "Review the dashboard summary each day. It separates your base budget, carry-forward from earlier days, and what is genuinely available today.",
        ],
      },
      {
        type: "ul",
        items: [
          "Underspending early pushes money into the following days, so available amounts can be higher than your base budget.",
          "Overspending reduces carry-forward, and it can go negative. The dashboard shows the shortfall rather than hiding it.",
          "Months of different lengths are handled correctly, including February in a leap year.",
          "Category budgets are separate from the monthly figure and are set on the Categories page.",
        ],
      },
    ],
  },
  {
    id: "recurring",
    title: "Track recurring entries",
    blurb: "Rent, subscriptions, and regular pay.",
    blocks: [
      {
        type: "ol",
        items: [
          "Create the entry as you normally would.",
          "Mark it as recurring and choose a frequency: daily, weekly, monthly, or yearly.",
          "Use the recurring filter at the top of the Expenses or Income list to see only recurring entries.",
        ],
      },
      {
        type: "note",
        text: "The frequency field is only required for entries you mark as recurring, so leaving it blank on ordinary one-off entries is correct.",
      },
    ],
  },
  {
    id: "import",
    title: "Import a CSV",
    blurb: "Bringing in a spreadsheet you already have.",
    blocks: [
      {
        type: "ol",
        items: [
          "Open the Expenses page and use the import control, which accepts .csv files.",
          "Download the sample file first if you are unsure about the expected columns.",
          "Your file needs four columns: title, amount, expenseDate, and category.",
          "Category names are matched against categories that already exist in your account. Create any missing categories first, or those rows will be reported as unmatched.",
          "Import, then check the summary message for how many rows succeeded, failed, or were duplicates.",
        ],
      },
      {
        type: "note",
        text: "The file is read in your browser. Only the resulting transaction records are sent to the app, so the original file is never uploaded or stored.",
      },
    ],
  },
  {
    id: "export",
    title: "Export and back up",
    blurb: "Getting your records out, and keeping them safe.",
    blocks: [
      {
        type: "ul",
        items: [
          "Use the export controls on the Expenses and Income pages to download your records as CSV or JSON.",
          "Exports are generated in your browser and saved directly to your device.",
          "Exports happen when you ask for them. They are not an automatic or scheduled backup.",
          "Treat exports as your own backup and keep a copy somewhere you control, because the app is not a backup service.",
        ],
      },
      {
        type: "p",
        text: "If you need to remove your data entirely, there is no in-app deletion button. Contact the operator using the address on the Contact page and ask for deletion.",
      },
    ],
  },
  {
    id: "notifications",
    title: "Email notifications",
    blurb: "Getting alerts without drowning in them.",
    blocks: [
      {
        type: "ul",
        items: [
          "Open Settings to see every notification type, including budget warnings, overspending alerts, large-expense flags, weekly summaries, recurring summaries, savings milestones, login notices, and import summaries.",
          "Each type has its own switch, so you can silence the noisy ones without losing the rest.",
          "Tune the thresholds that drive large-expense and spending alerts, and choose how many days ahead recurring reminders arrive.",
          "Verification and password-reset emails are always sent regardless of these switches, because they are required for account access.",
        ],
      },
      {
        type: "note",
        text: "Delivery depends on your mail provider and filters. If nothing arrives, check spam first, then confirm with the operator that email is configured correctly on the instance.",
      },
    ],
  },
  {
    id: "reports",
    title: "Read the reports",
    blurb: "Turning history into a decision.",
    blocks: [
      {
        type: "ul",
        items: [
          "Use the monthly view to compare spending against income over successive months rather than judging one month in isolation.",
          "Use the category breakdown to see which categories are absorbing the budget, and compare that against the limits you set.",
          "Pay attention to the highest and lowest entries. An outlier is usually where a mistake or a subscription you forgot about is hiding.",
          "Treat projections as estimates. They extrapolate from incomplete information and are not forecasts.",
        ],
      },
    ],
  },
];

export default function HelpPageContent() {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const chipBg = useColorModeValue("teal.50", "whiteAlpha.100");

  return (
    <Stack spacing={12}>
      <PageHeader
        eyebrow="Help"
        title="Guides for the things people actually do"
        intro="Short walkthroughs for common tasks, written against the current behaviour of the application. If a step here does not match what you see, tell us and we will correct it."
      />

      <BoxNav guides={guides} chipBg={chipBg} />

      {guides.map((guide) => (
        <Section key={guide.id} id={guide.id} title={guide.title} blurb={guide.blurb}>
          <Blocks blocks={guide.blocks} />
        </Section>
      ))}

      <Section title="Still stuck?" id="still-stuck">
        <Card>
          <Heading as="h3" size="sm" mb={2} color={headingColor}>
            Two more places to look
          </Heading>
          <Text fontSize="sm" color={mutedColor} lineHeight="tall" mb={4}>
            The FAQ covers individual questions in more depth, and the contact page
            explains how to reach a person, including what to include so you get a
            useful answer first time.
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
            <Button as={NextLink} href="/faq" variant="outline" colorScheme="teal" rounded="full">
              Read the FAQ
            </Button>
            <Button as={NextLink} href="/contact" colorScheme="teal" rounded="full">
              Contact support
            </Button>
          </SimpleGrid>
        </Card>
      </Section>
    </Stack>
  );
}

function BoxNav({ guides, chipBg }) {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={3}>
      {guides.map((guide) => (
        <Link
          key={guide.id}
          as={NextLink}
          href={`#${guide.id}`}
          fontSize="sm"
          fontWeight="medium"
          color="teal.700"
          bg={chipBg}
          px={4}
          py={3}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
          _hover={{ borderColor: "teal.400" }}
        >
          {guide.title}
        </Link>
      ))}
    </SimpleGrid>
  );
}
