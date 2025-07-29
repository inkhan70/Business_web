
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import Link from "next/link";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; 

export default function AppearancePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pagePath = searchParams.get('page') || '/';
  const wallpaperKey = `wallpaper_${pagePath}`;

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const existingWallpaper = localStorage.getItem(wallpaperKey);
    if (existingWallpaper) {
      setPreviewImage(existingWallpaper);
    }
  }, [wallpaperKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
            title: "Image Too Large",
            description: `Please select an image smaller than 4 MB.`,
            variant: "destructive"
        });
        setPreviewImage(null);
        setSelectedFile(null);
        e.target.value = "";
        return;
      }

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
    
    try {
        localStorage.setItem(wallpaperKey, previewImage);
        toast({
          title: "Wallpaper Updated",
          description: `The background for ${pagePath} has been set.`,
        });
    } catch (error) {
        toast({
            title: "Failed to Save Wallpaper",
            description: "The image might be too large for browser storage. Please try a smaller image.",
            variant: "destructive"
        });
        console.error(error);
    }
  };

  const handleRemoveWallpaper = () => {
    localStorage.removeItem(wallpaperKey);
    setPreviewImage(null);
    setSelectedFile(null);
    const fileInput = document.getElementById('wallpaper-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
    toast({
        title: "Wallpaper Removed",
        description: `The background for ${pagePath} has been removed.`
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
            Set a custom background for the <code className="bg-muted px-2 py-1 rounded-md">{pagePath}</code> page.
             <br />
             Go back to the page: <Link href={pagePath} className="text-primary underline">Go to {pagePath}</Link>
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
