"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { z } from "zod";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn("email", {
        email: values.email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to send magic link",
        });
      } else if (result?.ok) {
        setEmailSent(true);
        toast({
          title: "Magic link sent!",
          description: `Check your email (${values.email}) for the sign-in link`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              We&apos;ve sent a magic link to <strong>{form.getValues("email")}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to sign in. The link will expire in 24 hours.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                form.reset();
              }}
              className="mt-4"
            >
              Use a different email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Password Manager</h1>
          <p className="mt-2 text-muted-foreground">Sign in with a magic link sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>We&apos;ll send you a magic link to sign in</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send magic link
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-muted-foreground">
          <p>No password needed! Just enter your email and we&apos;ll send you a secure sign-in link.</p>
        </div>
      </div>
    </div>
  );
}
