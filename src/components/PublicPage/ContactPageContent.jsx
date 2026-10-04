"use client";

import {
  Stack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Link,
  Icon,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FiMail, FiMessageCircle, FiAlertTriangle, FiHelpCircle, FiShield } from "react-icons/fi";
import { PageHeader, Section, Card } from "@/components/PublicPage/ContentBlocks";
import { SITE } from "@/constants/site";

const selfServe = [
  {
    title: "Locked out or need a new password",
    text: "Use the Forgot Password link on the sign-in page. Reset links are valid for one hour and can only be used once.",
    icon: FiHelpCircle,
    href: "/forgot-password",
    cta: "Reset your password",
  },
  {
    title: "Verification email never arrived",
    text: "Links expire after 24 hours. You can request a fresh one, and check your spam folder before assuming it was lost.",
    icon: FiMail,
    href: "/resend-verification",
    cta: "Resend verification",
  },
  {
    title: "Account locked after failed attempts",
    text: "Five failed sign-ins lock an account for 30 minutes. Wait it out and try again with the correct password.",
    icon: FiShield,
    href: "/auth",
    cta: "Go to sign in",
  },
];

export default function ContactPageContent() {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Stack spacing={12}>
      <PageHeader
        eyebrow="Contact"
        title="Getting in touch"
        intro="Most questions are answered faster in the FAQ or the Help guides. If you still need a person, the routes below are the ones that actually work."
      />

      <Section title="Email" id="email">
        <Card>
          <Stack spacing={4}>
            <Icon as={FiMail} color="teal.500" w={6} h={6} />
            <Heading as="h3" size="md" color={headingColor}>
              {SITE.supportEmail}
            </Heading>
            <Text color={mutedColor} lineHeight="tall" maxW="2xl">
              This is the support address for this instance, and it is the route to
              use for account questions, privacy and data requests, deletion
              requests, and anything about the service itself.
            </Text>
            <Box>
              <Button
                as="a"
                href={`mailto:${SITE.supportEmail}`}
                colorScheme="teal"
                rounded="full"
                leftIcon={<FiMail />}
              >
                Write an email
              </Button>
            </Box>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall">
              There is no guaranteed response time, and messages are read in the
              order they arrive. If your message is urgent — you suspect someone has
              accessed your account, or you need a data request fulfilled — say so
              in the subject line.
            </Text>
          </Stack>
        </Card>
      </Section>

      <Section
        title="What to include in your message"
        id="what-to-include"
        blurb="A little context turns a slow exchange into a one-message answer."
      >
        <Card>
          <Stack spacing={3} fontSize="sm" color={mutedColor} lineHeight="tall">
            <Text>Your account email address, so we can find the right record.</Text>
            <Text>The page or feature involved, and what you expected to happen.</Text>
            <Text>What actually happened, including any error message you saw.</Text>
            <Text>
              Whether the problem blocks you completely or the app still works.
            </Text>
          </Stack>
          <Box mt={5}>
            <Text fontSize="sm" color={headingColor} fontWeight="semibold">
              Please do not send
            </Text>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall" mt={1}>
              Your password, verification or reset links, or full copies of your
              financial records. We will never ask for them, and anyone who does is
              not us.
            </Text>
          </Box>
        </Card>
      </Section>

      <Section title="Fix it yourself first" id="self-serve">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          {selfServe.map((item) => (
            <Card key={item.title}>
              <Icon as={item.icon} color="teal.500" w={5} h={5} mb={3} />
              <Heading as="h3" size="sm" mb={2} color={headingColor}>
                {item.title}
              </Heading>
              <Text fontSize="sm" color={mutedColor} lineHeight="tall" mb={4}>
                {item.text}
              </Text>
              <Link as={NextLink} href={item.href} color="teal.600" fontSize="sm" fontWeight="medium">
                {item.cta} →
              </Link>
            </Card>
          ))}
        </SimpleGrid>
      </Section>

      <Section title="Before you write" id="before-you-write">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <Card>
            <Icon as={FiMessageCircle} color="teal.500" w={5} h={5} mb={3} />
            <Heading as="h3" size="sm" mb={2} color={headingColor}>
              FAQ
            </Heading>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall" mb={4}>
              Budgets, recurring entries, CSV import and export, currencies, and
              account security are covered in detail.
            </Text>
            <Link as={NextLink} href="/faq" color="teal.600" fontSize="sm" fontWeight="medium">
              Read the FAQ →
            </Link>
          </Card>
          <Card>
            <Icon as={FiHelpCircle} color="teal.500" w={5} h={5} mb={3} />
            <Heading as="h3" size="sm" mb={2} color={headingColor}>
              Help guides
            </Heading>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall" mb={4}>
              Step-by-step walkthroughs for common tasks, from first sign-up to
              monthly reporting.
            </Text>
            <Link as={NextLink} href="/help" color="teal.600" fontSize="sm" fontWeight="medium">
              Visit Help →
            </Link>
          </Card>
        </SimpleGrid>
      </Section>

      <Section title="Reporting a security problem" id="security">
        <Card>
          <Stack spacing={3}>
            <Icon as={FiAlertTriangle} color="orange.500" w={6} h={6} />
            <Heading as="h3" size="md" color={headingColor}>
              Found a vulnerability?
            </Heading>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall">
              Please email {SITE.supportEmail} with a description of the issue, the
              steps needed to reproduce it, and the impact you believe it has. Give
              the operator reasonable time to fix an issue before disclosing it
              publicly, and avoid testing against accounts or data that are not
              yours.
            </Text>
            <Text fontSize="sm" color={mutedColor} lineHeight="tall">
              Reporting a problem does not create any obligation on the operator to
              maintain a formal disclosure programme, so please set expectations
              accordingly.
            </Text>
          </Stack>
        </Card>
      </Section>
    </Stack>
  );
}
