
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Location } from "@/components/Location";
import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";


interface Category {
    id: string;
    name: string;
}

const formSchema = z.object({
  email: z.string().email({ message: "A valid email is required." }).min(1, { message: "Email is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["company", "wholesaler", "distributor", "shopkeeper", "buyer"], {
    required_error: "You need to select a role.",
  }),
  businessName: z.string().optional(),
  category: z.string().optional(),
  fullName: z.string().optional(),
  address: z.string().min(10, { message: "Full address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
}).superRefine((data, ctx) => {
    if (data.role !== 'buyer' && !data.businessName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Business name is required.",
            path: ["businessName"],
        });
    }
    if (data.role !== 'buyer' && !data.category) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Business category is required.",
            path: ["category"],
        });
    }
    if (data.role === 'buyer' && !data.fullName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Full name is required.",
            path: ["fullName"],
        });
    }
});

export default function SignUpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const auth = useAuth();
    const firestore = useFirestore();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            businessName: "",
            fullName: "",
            address: "",
            city: "",
            state: "",
        },
    });

    const selectedRole = form.watch("role");

    useEffect(() => {
        const fetchCategories = () => {
            const storedCategoriesRaw = localStorage.getItem('categories');
            if (storedCategoriesRaw) {
                setCategories(JSON.parse(storedCategoriesRaw));
            } else {
                const defaultCategories = [
                    { id: 'cat1', name: 'Food' }, { id: 'cat2', name: 'Drinks' },
                    { id: 'cat3', name: 'Electronics' }, { id: 'cat4', name: 'Health' },
                    { id: 'cat5', name: 'Shoes' }, { id: 'cat6', name: 'Beauty' },
                    { id: 'cat7', name: 'Jewelry' }, { id: 'cat8', name: 'Real Estate' },
                ];
                localStorage.setItem('categories', JSON.stringify(defaultCategories));
                setCategories(defaultCategories);
            }
        };
        fetchCategories();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            
            // The first user to ever sign up for the app is made an admin.
            // This is determined by checking if the creation time and last sign-in time are the same.
            // In a production app, this would be handled by a Cloud Function for greater security.
            const isFirstUser = user.metadata.creationTime === user.metadata.lastSignInTime;

            const newUserProfile = {
                uid: user.uid,
                email: values.email,
                role: values.role,
                businessName: values.businessName || null,
                fullName: values.fullName || null,
                category: values.category || null,
                address: values.address,
                city: values.city,
                state: values.state,
                createdAt: new Date().toISOString(),
                isAdmin: isFirstUser, 
                purchaseHistory: [],
                ghostCoins: 0,
            };
            
            await setDoc(doc(firestore, "users", user.uid), newUserProfile);
            
            await sendEmailVerification(user);

            toast({
              title: t('toast.signup_success'),
              description: t('toast.signup_success_desc_verification')
            });

            router.push("/signin");

        } catch (error: any) {
             let description = "An unexpected error occurred. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already registered. Please sign in or use a different email.";
            } else if (error.code === 'permission-denied') {
                 description = "You do not have permission to perform this action. Please contact support.";
            }
            toast({
                title: "Sign-up Failed",
                description: description,
                variant: "destructive",
            });
            console.error("Sign-up error:", error);
        } finally {
            setIsLoading(false);
        }
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
                                <SelectItem value="buyer">Buyer / Customer</SelectItem>
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

              <div className="grid md:grid-cols-2 gap-6">
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
                      <FormLabel>{t('signup.password')}</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                          >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedRole === 'buyer' ? (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your primary business category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
                <Location />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('signup.create_account')}
              </Button>
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
