
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
import { ImageIcon, Upload } from "lucide-react";

export default function AppearancePage() {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
        toast({
            title: "No Image Selected",
            description: "Please select an image file to upload.",
            variant: "destructive"
        });
        return;
    }
    
    // In a real application, you would upload the 'selectedFile' to a storage service
    // (like Firebase Storage) and save the resulting URL.
    console.log("Uploading file:", selectedFile.name);

    toast({
      title: "Wallpaper Updated",
      description: "The background image has been successfully set.",
    });
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="wallpaper-upload">Upload Background Image</Label>
              <div className="flex items-center space-x-2 mt-2">
                 <div className="flex-grow">
                    <Input id="wallpaper-upload" type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
                    {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
                 </div>
                <Button type="submit">
                    <Upload className="mr-2 h-4 w-4"/>
                    Save
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
                <h3 className="text-sm font-medium">Preview:</h3>
                <div className="mt-2 aspect-video w-full max-w-md rounded-md border border-dashed flex items-center justify-center" style={{backgroundImage: `url(${previewImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    {!previewImage && <div className="text-center text-muted-foreground p-4"><ImageIcon className="mx-auto h-8 w-8 mb-2" /><p>Select an image to see a preview</p></div>}
                </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
