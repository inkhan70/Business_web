
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
import { ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";


const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function AppearancePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const storage = getStorage();

  const pagePath = searchParams.get('page') || '/';
  // Use a URL-safe document ID
  const docId = encodeURIComponent(pagePath);
  const appearanceDocRef = doc(firestore, "appearance", docId);
  const storagePath = `appearance/${docId}/wallpaper.png`;
  const storageRef = ref(storage, storagePath);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExistingWallpaper = async () => {
      try {
        const docSnap = await getDoc(appearanceDocRef);
        if (docSnap.exists()) {
          setPreviewImage(docSnap.data().url);
        }
      } catch (error) {
        console.error("Error fetching wallpaper:", error);
        toast({ title: "Error", description: "Could not load existing wallpaper.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingWallpaper();
  }, [appearanceDocRef, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
            title: "Image Too Large",
            description: `Please select an image smaller than 10 MB.`,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile || !previewImage) {
        toast({
            title: "No Image Selected",
            description: "Please select an image file to upload.",
            variant: "destructive"
        });
        return;
    }
    if (!user) {
        toast({ title: "Not Authenticated", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);
    try {
        const snapshot = await uploadString(storageRef, previewImage, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);

        await setDoc(appearanceDocRef, {
            url: downloadURL,
            path: pagePath,
            setBy: user.uid,
            updatedAt: new Date().toISOString()
        });

        setPreviewImage(downloadURL);
        setSelectedFile(null);

        toast({
          title: "Wallpaper Updated",
          description: `The background for ${pagePath} has been set for all users.`,
        });
    } catch (error) {
        toast({
            title: "Failed to Save Wallpaper",
            description: "An error occurred while uploading the image.",
            variant: "destructive"
        });
        console.error("Error saving wallpaper:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRemoveWallpaper = async () => {
    setIsSubmitting(true);
    try {
        await deleteDoc(appearanceDocRef);
        await deleteObject(storageRef);

        setPreviewImage(null);
        setSelectedFile(null);
        const fileInput = document.getElementById('wallpaper-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
        toast({
            title: "Wallpaper Removed",
            description: `The background for ${pagePath} has been removed for all users.`
        });
    } catch (error: any) {
         if (error.code === 'storage/object-not-found') {
            // If storage object doesn't exist, but doc does, still delete doc.
            await deleteDoc(appearanceDocRef).catch(console.error);
            setPreviewImage(null);
            toast({ title: "Wallpaper Removed" });
         } else {
            toast({
                title: "Error Removing Wallpaper",
                description: "Could not remove the wallpaper. It may have already been deleted.",
                variant: "destructive"
            });
            console.error("Error removing wallpaper:", error);
         }
    } finally {
        setIsSubmitting(false);
    }
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
            Set a global background for the <code className="bg-muted px-2 py-1 rounded-md">{pagePath}</code> page.
             <br />
             Go back to the page: <Link href={pagePath} className="text-primary underline">Go to {pagePath}</Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="wallpaper-upload">Upload Background Image (Max 10MB)</Label>
              <div className="flex items-center space-x-2 mt-2">
                 <div className="flex-grow">
                    <Input id="wallpaper-upload" type="file" accept="image/*" onChange={handleFileChange} className="w-full" disabled={isSubmitting} />
                    {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
                 </div>
                <Button type="submit" disabled={isSubmitting || !selectedFile}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                    Save
                </Button>
                <Button type="button" variant="destructive" onClick={handleRemoveWallpaper} disabled={isSubmitting || !previewImage}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                    Remove
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
                <h3 className="text-sm font-medium">Preview:</h3>
                <div className="mt-2 aspect-video w-full max-w-md rounded-md border border-dashed flex items-center justify-center bg-cover bg-center" style={{backgroundImage: `url(${previewImage})`}}>
                    {isLoading && <Loader2 className="h-6 w-6 animate-spin"/>}
                    {!isLoading && !previewImage && <div className="text-center text-muted-foreground p-4"><ImageIcon className="mx-auto h-8 w-8 mb-2" /><p>Select an image to see a preview</p></div>}
                </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
