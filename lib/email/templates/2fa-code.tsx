import { Body, Container, Head, Hr, Html, Section, Text } from "@react-email/components";

import * as React from "react";

interface TwoFactorEmailProps {
  email: string;
  code: string;
}

export function TwoFactorEmail({ email, code }: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Password Manager</Text>
          </Section>
          <Section style={content}>
            <Text style={title}>Two-Factor Authentication</Text>
            <Text style={paragraph}>Your verification code is:</Text>
            <Section style={codeContainer}>
              <Text style={codeText}>{code}</Text>
            </Section>
            <Text style={paragraph}>
              Enter this code in the app to complete your sign-in. This code will expire in 10
              minutes.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              If you didn't request this code, please secure your account immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const header = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "30px",
  textAlign: "center" as const,
  borderRadius: "8px 8px 0 0",
};

const headerText = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "30px",
};

const title = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "600",
  color: "#333333",
  margin: "0 0 20px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#666666",
  margin: "0 0 16px",
};

const codeContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "2px solid #667eea",
};

const codeText = {
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "8px",
  color: "#667eea",
  fontFamily: "monospace",
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "#999999",
  margin: "0",
};
