
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { useFirestore } from "@/firebase";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Location } from "@/components/Location";
import { doc, updateDoc } from "firebase/firestore";

const profileFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters."),
  address: z.string().min(10, "Full address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export default function SettingsPage() {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            businessName: "",
            address: "",
            city: "",
            state: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        if(userProfile) {
            form.reset({
                businessName: userProfile.businessName,
                address: userProfile.address,
                city: userProfile.city,
                state: userProfile.state,
            });
        }
    }, [userProfile, form]);


    const onSubmit = async (data: ProfileFormValues) => {
        if (!user || !userProfile) {
            toast({ title: "Not Authenticated", description: "You must be logged in to update your profile.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, data);
            toast({
                title: "Profile Updated",
                description: "Your business information has been successfully updated.",
            });
            // Optional: You might not need to reload if the context updates automatically
            // window.location.reload();
           
        } catch (error) {
            console.error("Error updating profile in Firestore: ", error);
            toast({
                title: "Update Failed",
                description: "There was a problem saving your changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const capitalizeFirstLetter = (string: string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account and business details.</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>Update your public business information here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                             <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Business Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <Label>Email</Label>
                                    <Input value={userProfile?.email || ""} disabled />
                                     <FormDescription className="mt-2">
                                        Your email address cannot be changed.
                                    </FormDescription>
                                </div>
                                 <div>
                                    <Label>Primary Category</Label>
                                    <Input value={userProfile?.category ? capitalizeFirstLetter(userProfile.category) : ""} disabled />
                                     <FormDescription className="mt-2">
                                        Your business category cannot be changed.
                                    </FormDescription>
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Input value={userProfile?.role ? capitalizeFirstLetter(userProfile.role) : ""} disabled />
                                     <FormDescription className="mt-2">
                                        Your business role cannot be changed.
                                    </FormDescription>
                                </div>
                             </div>
                            
                            <Location />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
