"use client";

import {
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FolderTree,
  Key,
  Lock,
  Search,
  Shield,
  Upload,
  Zap,
} from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "All passwords encrypted with AES-256-GCM before storage. Your data is secure.",
    },
    {
      icon: Key,
      title: "Passwordless Login",
      description: "Secure email magic links - no passwords to remember or lose.",
    },
    {
      icon: Lock,
      title: "Two-Factor Authentication",
      description: "Optional TOTP-based 2FA for an extra layer of security.",
    },
    {
      icon: Zap,
      title: "Smart Password Generator",
      description:
        "Generate strong, unique passwords with customizable options and strength checking.",
    },
    {
      icon: Search,
      title: "Powerful Search",
      description: "Find passwords instantly with advanced search, filtering, and sorting.",
    },
    {
      icon: FolderTree,
      title: "Organize with Categories",
      description: "Group passwords by category with custom colors for easy organization.",
    },
    {
      icon: Download,
      title: "Import & Export",
      description: "Import from CSV/JSON or export your passwords anytime.",
    },
    {
      icon: Eye,
      title: "Password History",
      description: "Track password changes and restore previous versions when needed.",
    },
  ];

  const securityFeatures = [
    "AES-256-GCM encryption",
    "PBKDF2 key derivation",
    "Zero-knowledge architecture",
    "Secure session management",
    "Account lockout protection",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Password Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            <span>Secure • Private • Open Source</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Your Passwords,
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Perfectly Protected
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A modern, secure password manager with passwordless authentication, encryption, and all
            the features you need to stay safe online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features to manage your passwords securely and efficiently
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Security First</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Your passwords are encrypted with military-grade encryption before they ever leave
                your device. We use industry-standard security practices to keep your data safe.
              </p>
              <ul className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 blur-3xl rounded-full" />
              <div className="relative p-8 rounded-2xl border bg-card">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <div className="h-2 w-32 bg-primary/20 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-primary/10" />
                    <div className="h-8 w-8 rounded bg-primary/10" />
                    <div className="h-8 w-8 rounded bg-primary/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-2xl border bg-gradient-to-r from-primary/10 to-purple-600/10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Password Manager to keep their digital life secure.
              It&apos;s free, secure, and takes less than a minute to set up.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Password Manager</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Security
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Support
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Password Manager. Built with security in mind.</p>
        </div>
      </footer>
    </div>
  );
}
