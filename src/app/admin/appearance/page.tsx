
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
import { ImageIcon, Upload, Trash2 } from "lucide-react";

export default function AppearancePage() {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile || !previewImage) {
        toast({
            title: "No Image Selected",
            description: "Please select an image file to upload.",
            variant: "destructive"
        });
        return;
    }
    
    localStorage.setItem("app_wallpaper", previewImage);

    toast({
      title: "Wallpaper Updated",
      description: "The background image has been successfully set. It may take a refresh to see the changes everywhere.",
    });
  };

  const handleRemoveWallpaper = () => {
    localStorage.removeItem("app_wallpaper");
    setPreviewImage(null);
    setSelectedFile(null);
    const fileInput = document.getElementById('wallpaper-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
    toast({
        title: "Wallpaper Removed",
        description: "The background image has been removed."
    });
  }

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
                <Button type="button" variant="destructive" onClick={handleRemoveWallpaper}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
                <h3 className="text-sm font-medium">Preview:</h3>
                <div className="mt-2 aspect-video w-full max-w-md rounded-md border border-dashed flex items-center justify-center bg-cover bg-center" style={{backgroundImage: `url(${previewImage})`}}>
                    {!previewImage && <div className="text-center text-muted-foreground p-4"><ImageIcon className="mx-auto h-8 w-8 mb-2" /><p>Select an image to see a preview</p></div>}
                </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
