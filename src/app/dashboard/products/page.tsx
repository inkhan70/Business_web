
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, Trash2, Library } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, UserProfile } from '@/contexts/AuthContext';

const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  status: z.enum(["Active", "Archived", "Low Stock", "Out of Stock"]),
  inventory: z.coerce.number().min(0, "Inventory must be a positive number."),
  category: z.string().min(1, "Category is required."),
  image: z.string().optional(),
  dataAiHint: z.string().optional(),
  userId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ImageAsset {
    id: string;
    src: string;
    alt: string;
}

function ProductForm({ userProfile }: { userProfile: UserProfile | null }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const editId = searchParams.get('edit');

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageLibrary, setImageLibrary] = useState<ImageAsset[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            status: "Active",
            inventory: 0,
            category: userProfile?.category || "",
            image: "",
            dataAiHint: "",
        },
        mode: "onChange",
    });

    const { formState: { isSubmitting } } = form;
    
    useEffect(() => {
        if (userProfile?.category && !form.getValues('category')) {
            form.setValue('category', userProfile.category);
        }
    }, [userProfile, form]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (editId) {
                const docRef = doc(db, "products", editId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const productData = docSnap.data() as ProductFormValues;
                    form.reset(productData);
                    if (productData.image) {
                        setImagePreview(productData.image);
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "Product not found.",
                        variant: "destructive",
                    });
                    router.push('/dashboard');
                }
            }
        };
        fetchProduct();
    }, [editId, form, router, toast]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const capturesRef = ref(storage, 'captures');
                const productsRef = ref(storage, 'products');

                const [capturesList, productsList] = await Promise.all([
                    listAll(capturesRef),
                    listAll(productsRef)
                ]);

                const allItems = [...capturesList.items, ...productsList.items];

                const imagePromises = allItems.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return { id: itemRef.name, src: url, alt: itemRef.name };
                });
                
                const images = await Promise.all(imagePromises);
                setImageLibrary(images.reverse());
            } catch (error: any) {
                console.error("Error fetching images: ", error);
                let description = "Could not load image library.";
                 if (error.code === 'storage/unauthorized') {
                    description = "You do not have permission to view images. Please check your storage security rules.";
                }
                toast({ title: "Error fetching images", description, variant: "destructive" });
            }
        };
        if(isLibraryOpen) {
            fetchImages();
        }
    }, [isLibraryOpen, toast]);
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast({
                    title: "Image Too Large",
                    description: "Please select an image smaller than 10MB.",
                    variant: "destructive"
                });
                return;
            }
            setIsUploading(true);
            try {
                const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(storageRef);
                
                setImagePreview(imageUrl);
                form.setValue("image", imageUrl);
                
                toast({
                    title: "Image Uploaded",
                    description: "Your image is ready to be saved with the product.",
                });
            } catch (error) {
                 toast({
                    title: "Upload Failed",
                    description: "There was an issue uploading your image.",
                    variant: "destructive"
                });
            } finally {
                setIsUploading(false);
                const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                if(fileInput) fileInput.value = "";
            }
        }
    };
    
    const removeImage = () => {
        setImagePreview(null);
        form.setValue("image", ""); 
    }

    const selectImageFromLibrary = (image: ImageAsset) => {
        setImagePreview(image.src);
        form.setValue("image", image.src);
        setIsLibraryOpen(false);
    }

    async function onSubmit(data: ProductFormValues) {
        if (!user) {
            toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        try {
            const productData = { ...data, userId: user.uid, category: userProfile?.category || data.category };
            if (editId) {
                const productRef = doc(db, "products", editId);
                await updateDoc(productRef, productData);
                 toast({
                    title: "Product Updated",
                    description: `The product "${data.name}" has been successfully saved.`,
                });
            } else {
                await addDoc(collection(db, "products"), productData);
                 toast({
                    title: "Product Created",
                    description: `The product "${data.name}" has been successfully added.`,
                });
            }
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            console.error("Error saving product: ", error);
            let description = "Could not save the product. Please try again.";
            if (error.code === 'permission-denied') {
                description = "Permission denied. Your role may not be allowed to create products in this category. Please check your security rules.";
            }
            toast({
                title: "Error",
                description: description,
                variant: "destructive",
            });
        }
    }
    
    return (
         <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{editId ? 'Edit Product' : 'Add a New Product'}</CardTitle>
              <CardDescription>
                {editId ? 'Update the details for your existing product.' : 'Fill out the form to add a new item to your inventory.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                         <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Artisan Sourdough Bread" {...field} />
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
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input readOnly disabled {...field} />
                                        </FormControl>
                                         <FormDescription>
                                            This is your primary business category set during sign-up.
                                        </FormDescription>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide a detailed description of the product..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dataAiHint"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Image AI Hint</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., apple fruit" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            A short hint for AI to find a suitable image if none is uploaded (e.g. "bread loaf").
                                        </FormDescription>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Price ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="inventory"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Inventory</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select product status" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Archived">Archived</SelectItem>
                                                <SelectItem value="Low Stock">Low Stock</SelectItem>
                                                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            'Active' products are visible to customers. 'Archived' are hidden.
                                        </FormDescription>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <Label>Product Image</Label>
                                <Card className="border-dashed aspect-square">
                                    <CardContent className="p-0 flex flex-col items-center justify-center text-center h-full relative">
                                        {!imagePreview ? (
                                            <div className="p-4 text-muted-foreground">
                                                <p className='mb-4'>No image selected.</p>
                                                <p className='text-xs'>Upload an image or select one from the library.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Image src={imagePreview} alt="Product preview" fill className="object-cover rounded-md" />
                                                 <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeImage}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                                <div className='space-y-2'>
                                    <Label htmlFor='image-upload' className='w-full'>
                                         <Button type="button" variant="outline" className="w-full" asChild>
                                            <span>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload New Image
                                            </span>
                                        </Button>
                                        <Input id="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" disabled={isUploading || isSubmitting}/>
                                    </Label>
                                     <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline" className="w-full">
                                                <Library className="mr-2 h-4 w-4" />
                                                Select from Library
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl">
                                            <DialogHeader>
                                                <DialogTitle>Image Library</DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className="h-[60vh]">
                                                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                    {imageLibrary.map(image => (
                                                        <button key={image.id} type="button" className="focus:ring-2 ring-primary rounded-md overflow-hidden" onClick={() => selectImageFromLibrary(image)}>
                                                            <Image src={image.src} alt={image.alt} width={200} height={200} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                             <Button type="submit" disabled={isUploading || isSubmitting}>
                                {(isUploading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editId ? 'Save Changes' : 'Create Product'}
                             </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function AddEditProductPage() {
    const { userProfile } = useAuth();
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                     <h1 className="text-2xl font-bold font-headline">Product Details</h1>
                     <p className="text-muted-foreground">Manage your product information.</p>
                </div>
            </div>
             <Suspense fallback={<div>Loading form...</div>}>
                <ProductForm userProfile={userProfile} />
            </Suspense>
        </div>
    )
}

    