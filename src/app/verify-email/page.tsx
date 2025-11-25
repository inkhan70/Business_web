
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, Suspense } from "react";
import { Loader2, MailCheck, MailWarning, ArrowLeft } from "lucide-react";
import { useAuth as useFirebaseAuth } from "@/firebase";
import { sendEmailVerification, Auth, User } from "firebase/auth";

function VerifyEmailContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useFirebaseAuth();

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
        // This is a bit of a workaround since we don't have the user object directly.
        // We can't *guarantee* a verification email is sent if the user isn't logged in,
        // but for a user who *just* signed up, this is a very unlikely edge case.
        // A more robust solution might involve a backend function.
        
        // A conceptual example of how it would work if we could create a dummy user object
        // This will likely not work as creating a User object is not public API.
        // But it shows the intent. For now, we will rely on user being "known" to firebase temporarily
        // after signup.
        
        if (auth.currentUser) {
             await sendEmailVerification(auth.currentUser);
             toast({
                title: "Verification Email Sent",
                description: "A new verification link has been sent to your email address.",
             });
        } else {
            // This is the more likely scenario if the user closed the tab and came back.
            toast({
                title: "Could Not Send Email",
                description: "Please try signing in again to receive a new verification link.",
                variant: "destructive",
            });
        }

    } catch (error: any) {
      toast({
        title: "Error Sending Verification",
        description: "Could not send a new verification email. Please try again later.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline mt-4">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <span className="font-bold text-foreground">{email || "your email address"}</span>. Please click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <p className="text-sm text-muted-foreground">
            Once you've verified your email, you can sign in to your account.
          </p>
          <Button asChild className="w-full">
            <Link href="/signin">
              Go to Sign In
            </Link>
          </Button>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">Didn't receive the email?</p>
            <Button variant="link" onClick={handleResendVerification} disabled={isLoading} className="font-medium text-primary">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend verification link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
