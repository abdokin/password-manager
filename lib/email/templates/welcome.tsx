import { Body, Button, Container, Head, Hr, Html, Section, Text } from "@react-email/components";

import * as React from "react";

interface WelcomeEmailProps {
  email: string;
}

export function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Password Manager</Text>
          </Section>
          <Section style={content}>
            <Text style={title}>Welcome to Password Manager!</Text>
            <Text style={paragraph}>
              Thank you for signing up. Your account has been created successfully.
            </Text>
            <Text style={paragraph}>
              We recommend setting up two-factor authentication (2FA) to enhance your account
              security. You can do this in your account settings.
            </Text>
            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/settings`}
              >
                Go to Settings
              </Button>
            </Section>
            <Hr style={hr} />
            <Text style={footer}>
              If you didn&apos;t create this account, please contact support immediately.
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#667eea",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
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
