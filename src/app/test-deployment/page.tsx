"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TestDeploymentPage() {
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setTimestamp(new Date().toUTCString());
  }, []);

  return (
    <div className="container flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/50 p-3 rounded-full w-fit">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-headline mt-4">Deployment Successful!</CardTitle>
          <CardDescription>
            Your application has been published correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page was rendered at:
          </p>
          <p className="font-mono text-sm my-2 p-2 bg-muted rounded-md">
            {timestamp || "Loading timestamp..."}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            If you can see this message, it confirms that the connection between your GitHub repository and Firebase App Hosting is working perfectly.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
