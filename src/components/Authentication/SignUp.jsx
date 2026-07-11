"use client";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast,
  Checkbox,
  Flex,
  Icon,
  InputLeftElement,
  FormErrorMessage,
  Progress,
} from "@chakra-ui/react";
import React from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const MotionStack = motion(Stack);

const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
  return strength;
};

const strengthColor = (strength) => {
  if (strength <= 25) return "red";
  if (strength <= 50) return "orange";
  if (strength <= 75) return "yellow";
  return "green";
};

const strengthLabel = (strength) => {
  if (strength <= 25) return "Weak";
  if (strength <= 50) return "Fair";
  if (strength <= 75) return "Good";
  return "Strong";
};

const SignUp = ({ onRegisterSuccess, onSwitch }) => {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const blurHandler = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (fieldName) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "name":
        if (!values.name.trim()) {
          newErrors.name = "Name is required";
        } else if (values.name.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (values.name.trim().length > 50) {
          newErrors.name = "Name cannot exceed 50 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(values.name)) {
          newErrors.name = "Name can only contain letters, spaces, hyphens, and apostrophes";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        if (!values.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          newErrors.email = "Invalid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!values.password) {
          newErrors.password = "Password is required";
        } else if (values.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (values.password.length > 128) {
          newErrors.password = "Password cannot exceed 128 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(values.password)) {
          newErrors.password = "Password must contain uppercase, lowercase, number, and special character";
        } else {
          delete newErrors.password;
        }
        break;

      case "cpassword":
        if (!values.cpassword) {
          newErrors.cpassword = "Please confirm your password";
        } else if (values.cpassword !== values.password) {
          newErrors.cpassword = "Passwords do not match";
        } else {
          delete newErrors.cpassword;
        }
        break;

      case "agree":
        if (!values.agree) {
          newErrors.agree = "You must agree to the terms";
        } else {
          delete newErrors.agree;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[fieldName];
  };

  const validateAll = () => {
    const fields = ["name", "email", "password", "cpassword", "agree"];
    let isValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });
    return isValid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    setTouched({ name: true, email: true, password: true, cpassword: true, agree: true });

    if (!validateAll()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (result.success) {
        toast({
          title: result.data?.message || "Account created successfully",
          description: "Please check your email to verify your account.",
          status: "success",
          duration: 8000,
          isClosable: true,
        });

        if (onRegisterSuccess) {
          onRegisterSuccess();
        }

        // Redirect to dashboard or show verification message
        router.push("/dashboard");
      } else {
        toast({
          title: result.error || "Registration failed",
          status: "error",
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "An unexpected error occurred",
        status: "error",
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(values.password);
  const isFormValid =
    values.name &&
    values.email &&
    values.password &&
    values.cpassword &&
    values.agree &&
    Object.keys(errors).length === 0;

  return (
    <MotionStack
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      spacing={5}
      w="full"
      maxW="md"
      mx="auto"
    >
      <Box textAlign="center" mb={2}>
        <Text fontSize="2xl" fontWeight="bold" mb={1}>
          Create Account
        </Text>
        <Text fontSize="sm" color="gray.500">
          Get started with your free account today
        </Text>
      </Box>

      <Stack as="form" onSubmit={submitHandler} spacing={4}>
        <FormControl isInvalid={touched.name && !!errors.name}>
          <FormLabel fontSize="sm" fontWeight="medium">
            Full Name
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiUser} color="gray.400" />
            </InputLeftElement>
            <Input
              type="text"
              name="name"
              placeholder="John Doe"
              borderRadius="xl"
              focusBorderColor="teal.400"
              value={values.name}
              onChange={changeHandler}
              onBlur={blurHandler}
              autoComplete="name"
            />
          </InputGroup>
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={touched.email && !!errors.email}>
          <FormLabel fontSize="sm" fontWeight="medium">
            Email Address
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiMail} color="gray.400" />
            </InputLeftElement>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              borderRadius="xl"
              focusBorderColor="teal.400"
              value={values.email}
              onChange={changeHandler}
              onBlur={blurHandler}
              autoComplete="email"
            />
          </InputGroup>
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={touched.password && !!errors.password}>
          <FormLabel fontSize="sm" fontWeight="medium">
            Password
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiLock} color="gray.400" />
            </InputLeftElement>
            <Input
              type={show ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              borderRadius="xl"
              focusBorderColor="teal.400"
              value={values.password}
              onChange={changeHandler}
              onBlur={blurHandler}
              autoComplete="new-password"
            />
            <InputRightElement h="full" pr={1}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShow(!show)}
                tabIndex={-1}
                type="button"
              >
                <Icon as={show ? FiEyeOff : FiEye} color="gray.400" />
              </Button>
            </InputRightElement>
          </InputGroup>
          {values.password && (
            <Box mt={2}>
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="xs" color="gray.500">
                  Password strength
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={`${strengthColor(passwordStrength)}.500`}
                >
                  {strengthLabel(passwordStrength)}
                </Text>
              </Flex>
              <Progress
                value={passwordStrength}
                size="xs"
                colorScheme={strengthColor(passwordStrength)}
                borderRadius="full"
                bg="gray.100"
              />
            </Box>
          )}
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={touched.cpassword && !!errors.cpassword}>
          <FormLabel fontSize="sm" fontWeight="medium">
            Confirm Password
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiLock} color="gray.400" />
            </InputLeftElement>
            <Input
              type={show ? "text" : "password"}
              name="cpassword"
              placeholder="Confirm your password"
              borderRadius="xl"
              focusBorderColor="teal.400"
              value={values.cpassword}
              onChange={changeHandler}
              onBlur={blurHandler}
              autoComplete="new-password"
            />
          </InputGroup>
          <FormErrorMessage>{errors.cpassword}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={touched.agree && !!errors.agree}>
          <Checkbox
            name="agree"
            isChecked={values.agree}
            onChange={changeHandler}
            onBlur={blurHandler}
            colorScheme="teal"
            size="sm"
          >
            <Text fontSize="sm" color="gray.500">
              I agree to the{" "}
              <Text as="span" color="teal.500" fontWeight="medium">
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text as="span" color="teal.500" fontWeight="medium">
                Privacy Policy
              </Text>
            </Text>
          </Checkbox>
          <FormErrorMessage>{errors.agree}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          size="lg"
          borderRadius="xl"
          bg="teal.500"
          color="white"
          fontWeight="bold"
          _hover={{ bg: "teal.400", transform: "translateY(-1px)" }}
          _active={{ bg: "teal.600" }}
          transition="all 0.2s"
          isLoading={isSubmitting}
          isDisabled={!isFormValid || isSubmitting}
          boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
        >
          Create Account
        </Button>
      </Stack>

      <Flex align="center" gap={4} pt={2}>
        <Box flex={1} h="1px" bg="gray.200" />
        <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          or
        </Text>
        <Box flex={1} h="1px" bg="gray.200" />
      </Flex>

      <Text textAlign="center" fontSize="sm" color="gray.500">
        Already have an account?{" "}
        <Text
          as="span"
          color="teal.500"
          fontWeight="semibold"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={onSwitch}
        >
          Sign in instead
        </Text>
      </Text>
    </MotionStack>
  );
};

export default SignUp;
