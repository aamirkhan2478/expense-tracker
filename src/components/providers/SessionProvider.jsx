"use client";
import { SessionProvider as Provider } from "next-auth/react";
import React from "react";

const SessionProvider = ({ children }) => {
  return <Provider refetchInterval={5 * 60}>{children}</Provider>;
};

export default SessionProvider;
