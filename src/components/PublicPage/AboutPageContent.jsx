"use client";

import { Stack, Heading, Text, Button, SimpleGrid, Link, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";
import { PageHeader, Blocks, Section, Card } from "@/components/PublicPage/ContentBlocks";
import { SITE } from "@/constants/site";

const whatItIs = [
  {
    type: "p",
    text: "SpendWise is a personal finance tracker you can run yourself. You record what you earn and what you spend, sort it into categories, set budgets, and get charts that show where your money actually went. It is built for people who want a clear answer to one question: can I afford this, and what did I spend already?",
  },
  {
    type: "p",
    text: "The application is deliberately unglamorous. It does one job thoroughly: it keeps an accurate record of your own numbers and turns them into something you can act on. Everything it shows is calculated from transactions you entered, which means you always know where a figure came from.",
  },
];

const whoFor = [
  {
    type: "ul",
    items: [
      "People who want to see where their spending goes without building a spreadsheet from scratch every month.",
      "Anyone who has been caught out by a surprise expense and wants an allowance that adapts to how the month is actually going.",
      "Households or freelancers who juggle several income sources and need a single combined view.",
      "People who prefer to hold their own financial records on infrastructure they control, rather than in someone else's SaaS dashboard.",
    ],
  },
];

const whatItIsNot = [
  {
    type: "ul",
    items: [
      "It is not a bank. It never holds, safeguards, or moves money, and it does not connect to bank accounts or card networks.",
      "It is not an investment, insurance, tax, or accounting product, and it does not give financial advice.",
      "It is a record-keeping tool, not a money manager. It shows you what you entered and helps you plan from it; it cannot move, hold, or reconcile funds on your behalf.",
      "It is not an analytics service. Your finances are not used for advertising, profiling, or AI training.",
    ],
  },
];

const why = [
  {
    type: "p",
    text: "Most budgeting tools tell you how much you spent in a month that has already finished. That is interesting, but it is not useful in the moment you are deciding whether to spend. SpendWise's daily budget works differently: it divides your monthly allowance by the real length of the month, adds back whatever you did not spend on earlier days, and subtracts what you overspent. The result updates as you use the app, so the number reflects today.",
  },
  {
    type: "p",
    text: "The second principle is honesty about scope. A budget tool that cannot see your bank can only be as good as your record-keeping, and pretending otherwise would be misleading. So SpendWise stays on the side of telling you the truth: here is what you told us, here is what it adds up to, and here is what it cannot verify.",
  },
];

export default function AboutPageContent() {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Stack spacing={12}>
      <PageHeader
        eyebrow="About"
        title="A quieter way to keep track of your money"
        intro={`SpendWise is a self-hosted expense and budget tracker. It exists for people who would rather understand their own numbers than be sold a picture of them.`}
      />

      <Section title="What SpendWise is" id="what-it-is">
        <Blocks blocks={whatItIs} />
      </Section>

      <Section title="Who it is for" id="who-it-is-for" blurb="SpendWise suits a particular kind of user more than others.">
        <Blocks blocks={whoFor} />
      </Section>

      <Section
        title="Why it works the way it does"
        id="why"
        blurb="Two decisions shape almost everything else in the application."
      >
        <Blocks blocks={why} />
      </Section>

      <Section title="What it is not" id="what-it-is-not">
        <Blocks blocks={whatItIsNot} />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={6}>
          <Card>
            <Heading as="h3" size="sm" mb={2} color={headingColor}>
              Your data stays yours
            </Heading>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall">
              Because the software is self-hosted, the data lives wherever you or
              your instance operator chose to put it. Imports and exports happen in
              your browser, so files do not pass through the server. The{" "}
              <Link as={NextLink} href="/privacy" color="teal.600" fontWeight="medium">
                Privacy Policy
              </Link>{" "}
              sets out exactly what is collected.
            </Text>
          </Card>
          <Card>
            <Heading as="h3" size="sm" mb={2} color={headingColor}>
              Security you can inspect
            </Heading>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall">
              Passwords are hashed with bcrypt, one-time tokens are stored hashed
              with their own expiry, sign-in is rate limited, and repeated failures
              lock an account temporarily. The{" "}
              <Link as={NextLink} href="/terms" color="teal.600" fontWeight="medium">
                Terms of Service
              </Link>{" "}
              describe your responsibilities and our limits.
            </Text>
          </Card>
        </SimpleGrid>
      </Section>

      <Section title="Who runs this instance" id="operator">
        <Blocks
          blocks={[
            {
              type: "p",
              text: `SpendWise is open, self-hosted software, so the party responsible for running the instance you are using is its operator. Questions about this page, or about an instance in particular, can go to ${SITE.supportEmail}.`,
            },
          ]}
        />
      </Section>

      <Card p={{ base: 6, md: 8 }}>
        <Heading as="h2" size="md" mb={2} color={headingColor}>
          See it for yourself
        </Heading>
        <Text color={mutedColor} mb={5} maxW="2xl" lineHeight="tall">
          Creating an account takes a name, an email address, and a password. The{" "}
          <Link as={NextLink} href="/features" color="teal.600" fontWeight="medium">
            features page
          </Link>{" "}
          covers what you get, and the{" "}
          <Link as={NextLink} href="/faq" color="teal.600" fontWeight="medium">
            FAQ
          </Link>{" "}
          answers the questions people ask most.
        </Text>
        <Button as={NextLink} href="/auth?tab=signup" colorScheme="teal" rounded="full">
          Create an account
        </Button>
      </Card>
    </Stack>
  );
}
