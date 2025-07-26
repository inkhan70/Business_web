
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon } from "lucide-react";

export default function AppearancePage() {
  const { toast } = useToast();
  const [backgroundImage, setBackgroundImage] = useState("https://placehold.co/1920x1080.png");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Wallpaper Updated",
      description: "The background image has been successfully set.",
    });
    // In a real application, you would save this URL to a database.
    console.log("New background image URL:", backgroundImage);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline">Appearance</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your application.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Page Wallpaper</CardTitle>
          <CardDescription>
            Set a custom background image for the main pages. This will not affect dashboard pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="wallpaper-url">Background Image URL</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="wallpaper-url"
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={backgroundImage}
                  onChange={(e) => setBackgroundImage(e.target.value)}
                />
                <Button type="submit">Save</Button>
              </div>
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-medium">Current Preview:</h3>
                <div className="mt-2 aspect-video w-full max-w-md rounded-md border border-dashed flex items-center justify-center" style={{backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    {!backgroundImage && <div className="text-center text-muted-foreground"><ImageIcon className="mx-auto h-8 w-8" /><p>No image set</p></div>}
                </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
