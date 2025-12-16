import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";

import * as React from "react";

interface MagicLinkEmailProps {
  email: string;
  magicLink: string;
}

export function MagicLinkEmail({ email, magicLink }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Password Manager</Text>
          </Section>
          <Section style={content}>
            <Text style={title}>Sign in to your account</Text>
            <Text style={paragraph}>
              Click the button below to sign in to your Password Manager account. This link will
              expire in 24 hours.
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={magicLink}>
                Sign In
              </Button>
            </Section>
            <Text style={paragraph}>Or copy and paste this URL into your browser:</Text>
            <Text style={link}>{magicLink}</Text>
            <Hr style={hr} />
            <Text style={footer}>If you didn't request this email, you can safely ignore it.</Text>
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

const link = {
  fontSize: "14px",
  color: "#667eea",
  wordBreak: "break-all" as const,
  margin: "16px 0",
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
