
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Location } from "@/components/Location";

const formSchema = z.object({
  emailOrPhone: z.string().min(1, { message: "Email or phone number is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  businessName: z.string().min(2, { message: "Business name is required." }),
  role: z.enum(["company", "wholesaler", "distributor", "shopkeeper"], {
    required_error: "You need to select a business role.",
  }),
  address: z.string().min(10, { message: "Full address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  country: z.string().min(2, { message: "Country is required." }),
  zip: z.string().min(5, { message: "Zip code is required." }),
});

export default function SignUpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            emailOrPhone: "",
            password: "",
            businessName: "",
            address: "",
            city: "",
            state: "",
            country: "",
            zip: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({
          title: t('toast.signup_success'),
          description: t('toast.signup_success_desc'),
        });
        router.push("/dashboard");
    }

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t('signup.title')}</CardTitle>
          <CardDescription>
            {t('signup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="emailOrPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('signup.email_phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('signup.email_phone_placeholder')} {...field} />
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
                      <FormLabel>{t('signup.password')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('signup.business_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('signup.business_name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('signup.role')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('signup.role_placeholder')} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="company">{t('signup.role_company')}</SelectItem>
                                <SelectItem value="wholesaler">{t('signup.role_wholesaler')}</SelectItem>
                                <SelectItem value="distributor">{t('signup.role_distributor')}</SelectItem>
                                <SelectItem value="shopkeeper">{t('signup.role_shopkeeper')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              
                <Location />
              <Button type="submit" className="w-full">{t('signup.create_account')}</Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            {t('signup.have_account')}{" "}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              {t('home.sign_in')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
