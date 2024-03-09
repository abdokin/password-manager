"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPassword, deletePassword, editPassword } from "@/lib/actions";
import { useToast } from "./ui/use-toast";
import { useState } from "react";
import { Password } from "@/data/schema";


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
});

export function NewPassword() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger>
        <Button>New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new Password</DialogTitle>
        </DialogHeader>
        <PasswordForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

export function PasswordForm({ setOpen }: { setOpen?: (v: boolean) => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
    },
  });

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site </FormLabel>
              <FormControl>
                <Input placeholder="www.example.com" {...field} />
              </FormControl>
              <FormDescription>This is site of the password</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="john .." {...field} />
              </FormControl>
              <FormDescription>This is your username.</FormDescription>
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
                <Input placeholder="******" {...field} type="password" />
              </FormControl>
              <FormDescription>This is your password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export function EditPasswordForm({
  setOpen,
  values,
  id,
}: {
  setOpen?: (v: boolean) => void;
  values: Password;
  id: number;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...values },
  });

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site </FormLabel>
              <FormControl>
                <Input placeholder="www.example.com" {...field} />
              </FormControl>
              <FormDescription>This is site of the password</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="john .." {...field} />
              </FormControl>
              <FormDescription>This is your username.</FormDescription>
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
                <Input placeholder="******" {...field} type="password" />
              </FormControl>
              <FormDescription>This is your password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center">
          <Button type="submit">Edit</Button>
          <Button
            type="button"
            variant={"destructive"}
            onClick={() => deletePassword(id)}
          >
            Delete
          </Button>
        </div>
      </form>
    </Form>
  );
}
