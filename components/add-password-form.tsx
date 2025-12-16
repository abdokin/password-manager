"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Category, Password } from "@/data/tenant-schema";
import { createPassword, deletePassword, editPassword } from "@/lib/tenant-actions";

import { CategorySelector } from "./category-selector";
import { PasswordGenerator } from "./password-generator";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "password must be at least 2 characters.",
  }),
  name: z.string().min(2, {
    message: "site must be at least 2 characters.",
  }),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  categoryId: z.number().optional().nullable(),
  notes: z.string().optional(),
});

export function NewPassword({ categories = [] }: { categories?: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger>
        <Button>New Password</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add new Password</DialogTitle>
        </DialogHeader>
        <PasswordForm setOpen={setOpen} categories={categories} />
      </DialogContent>
    </Dialog>
  );
}

export function PasswordForm({
  setOpen,
  categories = [],
}: {
  setOpen?: (v: boolean) => void;
  categories?: Category[];
}) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      url: "",
      categoryId: null,
      notes: "",
    },
  });

  const handlePasswordGenerated = (password: string) => {
    form.setValue("password", password);
    setShowPassword(true);
  };

  const handleCopyPassword = async () => {
    const password = form.getValues("password");
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Password copied",
        description: "Password has been copied to clipboard",
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await createPassword(values);
    if (res.error) {
      toast({
        variant: "destructive",
        title: res.error,
      });
    } else {
      toast({
        title: res.message,
      });
      form.reset();
      setOpen && setOpen(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site/App Name</FormLabel>
              <FormControl>
                <Input placeholder="www.example.com" {...field} />
              </FormControl>
              <FormDescription>The name of the website or app</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://www.example.com" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>The website URL</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username/Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormDescription>Your username or email for this account</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter password or generate one"
                    {...field}
                    type={showPassword ? "text" : "password"}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                    disabled={!field.value}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>Enter your password or use the generator below</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
        </div>
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CategorySelector
                  value={field.value}
                  onValueChange={field.onChange}
                  categories={categories}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional notes about this password..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Any additional information</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Password
        </Button>
      </form>
    </Form>
  );
}

export function EditPasswordForm({
  setOpen,
  values,
  id,
  categories = [],
}: {
  setOpen?: (v: boolean) => void;
  values: Password;
  id: number;
  categories?: Category[];
}) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: values.name,
      username: values.username,
      password: "", // Don't show existing password
      url: values.url || "",
      categoryId: values.categoryId || null,
      notes: values.notes || "",
    },
  });

  const handlePasswordGenerated = (password: string) => {
    form.setValue("password", password);
    setShowPassword(true);
  };

  const handleCopyPassword = async () => {
    const password = form.getValues("password");
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Password copied",
        description: "Password has been copied to clipboard",
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await editPassword(id, values);
    if (res.error) {
      console.log("here");

      toast({
        variant: "destructive",
        title: res.error,
      });
    } else {
      toast({
        title: res.message,
      });
      form.reset();
      setOpen && setOpen(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site/App Name</FormLabel>
              <FormControl>
                <Input placeholder="www.example.com" {...field} />
              </FormControl>
              <FormDescription>The name of the website or app</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://www.example.com" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>The website URL</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username/Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormDescription>Your username or email for this account</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Leave empty to keep current password"
                    {...field}
                    type={showPassword ? "text" : "password"}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                    disabled={!field.value}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Leave empty to keep current password, or enter a new one
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
        </div>
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CategorySelector
                  value={field.value}
                  onValueChange={field.onChange}
                  categories={categories}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional notes about this password..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Any additional information</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center">
          <Button type="submit" className="flex-1">
            Update Password
          </Button>
          <Button type="button" variant={"destructive"} onClick={() => deletePassword(id)}>
            Delete
          </Button>
        </div>
      </form>
    </Form>
  );
}
