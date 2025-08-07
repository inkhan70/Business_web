
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Please enter your password." }),
  rememberMe: z.boolean().default(false).optional(),
});

export default function SignInPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            if (user.emailVerified) {
                toast({
                    title: t('toast.signin_success'),
                    description: t('toast.signin_success_desc'),
                });
                router.push("/dashboard");
            } else {
                 toast({
                    title: "Email Not Verified",
                    description: "Please check your inbox and verify your email address to continue.",
                    variant: "destructive",
                });
                 // Optional: allow resending verification email
            }
        } catch (error: any) {
             let description = "An unexpected error occurred. Please try again.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "Invalid email or password. Please try again.";
            }
            toast({
                title: "Sign In Failed",
                description: description,
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <div className="container flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t('signin.title')}</CardTitle>
          <CardDescription>
            {t('signin.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.email_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('signup.email_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>{t('signin.password')}</FormLabel>
                        <Link href="#" className="text-sm font-medium text-primary hover:underline">
                            {t('signin.forgot_password')}
                        </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('signin.remember_me')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('signin.button')}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            {t('signin.no_account')}{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {t('home.sign_up')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
