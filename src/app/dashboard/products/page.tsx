
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Upload, Loader2, Trash2, Library, PlusCircle, Camera, Sparkles, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import images from '@/app/lib/placeholder-images.json';
import { v4 as uuidv4 } from 'uuid';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { generateDescription } from '@/ai/flows/generate-description-flow';
import type { Category } from '@/app/admin/categories/page';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const varietySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variety name is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  image: z.string().optional(),
  dataAiHint: z.string().optional(),
  // Add a field to hold the raw file or the existing URL
  imageFile: z.any().optional(),
});

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  status: z.enum(["Active", "Archived", "Low Stock", "Out of Stock"]),
  inventory: z.coerce.number().min(0, "Inventory must be a positive number."),
  userId: z.string().optional(),
  varieties: z.array(varietySchema).min(1, "At least one product variety is required."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ImageAsset {
    id: string;
    src: string;
    alt: string;
}

interface ProductForLibrary {
    id: string;
    name: string;
    category: string;
    varieties: {
        image?: string;
        name: string;
    }[];
}

interface CategoriesDoc {
    list: Category[];
}

// Helper function to check if a string is a data URL
const isDataURL = (s: string) => s.startsWith('data:image');

export default function ProductForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, userProfile } = useAuth();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const firestore = useFirestore();
    const storage = getStorage();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageLibrary, setImageLibrary] = useState<ImageAsset[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState<{open: boolean, fieldIndex: number | null}>({open: false, fieldIndex: null});
    const [appCategories, setAppCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(!!editId);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            description: "",
            status: "Active",
            inventory: 0,
            category: "",
            varieties: [{ id: `var_${Date.now()}`, name: '', price: 0, image: '', dataAiHint: '' }],
        },
        mode: "onChange",
    });

    const { control, getValues, setValue, watch, reset } = form;
    const currentCategory = watch('category');
    const currentProductName = watch('name');

    const { fields, append, remove } = useFieldArray({
        control,
        name: "varieties"
    });

    // Fetch categories from Firestore
    const categoriesDocRef = useMemoFirebase(() => doc(firestore, 'app_config', 'categories'), [firestore]);
    const { data: categoriesDoc } = useDoc<CategoriesDoc>(categoriesDocRef);

    useEffect(() => {
        if (categoriesDoc && categoriesDoc.list) {
            setAppCategories(categoriesDoc.list);
        }
    }, [categoriesDoc]);


    // Fetch products for image library based on category
    const productsForLibraryQuery = useMemoFirebase(() => 
        currentCategory ? query(collection(firestore, 'products'), where('category', '==', currentCategory)) : null,
        [firestore, currentCategory]
    );
    const { data: categoryProducts } = useCollection<ProductForLibrary>(productsForLibraryQuery);
    
    useEffect(() => {
        if (userProfile?.category && !getValues('category')) {
            setValue('category', userProfile.category);
        }
    }, [userProfile, getValues, setValue]);
    
    useEffect(() => {
        const capturedImage = sessionStorage.getItem('capturedImageData');
        const targetIndex = sessionStorage.getItem('capturedImageTargetIndex');

        if (capturedImage && targetIndex !== null) {
            const index = parseInt(targetIndex, 10);
            setValue(`varieties.${index}.imageFile`, capturedImage, { shouldValidate: true });
            setValue(`varieties.${index}.image`, capturedImage, { shouldValidate: true });
            
            sessionStorage.removeItem('capturedImageData');
            sessionStorage.removeItem('capturedImageTargetIndex');

            toast({
                title: 'Image Applied',
                description: 'The image captured from your camera has been added to the variety.'
            });
        }
    }, [setValue, toast]);

    useEffect(() => {
        if (editId) {
            setIsLoading(true);
            const fetchProduct = async () => {
                const productDocRef = doc(firestore, 'products', editId);
                const docSnap = await getDoc(productDocRef);
                if (docSnap.exists()) {
                    const productData = docSnap.data() as ProductFormValues;
                    reset(productData);
                } else {
                    toast({ title: "Error", description: "Product not found.", variant: "destructive" });
                    router.push('/dashboard');
                }
                setIsLoading(false);
            };
            fetchProduct();
        }
    }, [editId, firestore, reset, router, toast]);

    useEffect(() => {
        if (categoryProducts) {
            const uniqueImages = new Map<string, ImageAsset>();
            categoryProducts.forEach(product => {
                product.varieties?.forEach(variety => {
                    if (variety.image && !uniqueImages.has(variety.image)) {
                        uniqueImages.set(variety.image, {
                            id: variety.image,
                            src: variety.image,
                            alt: variety.name || product.name,
                        });
                    }
                });
            });
            setImageLibrary(Array.from(uniqueImages.values()));
        } else {
            setImageLibrary([]);
        }
    }, [categoryProducts]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, fieldIndex: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "Image Too Large",
                    description: "Please select an image smaller than 5MB.",
                    variant: "destructive"
                });
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setValue(`varieties.${fieldIndex}.imageFile`, dataUrl, { shouldValidate: true });
                setValue(`varieties.${fieldIndex}.image`, dataUrl, { shouldValidate: true });
                toast({
                    title: "Image Preview Ready",
                    description: "Image will be uploaded when you save the product.",
                });
            };
            reader.onerror = () => {
                toast({
                    title: "Read Error",
                    description: "Could not read the selected image file.",
                    variant: "destructive"
                });
            }
            reader.readAsDataURL(file);
        }
    };
    
    const removeVarietyImage = (fieldIndex: number) => {
        const currentImage = getValues(`varieties.${fieldIndex}.image`);
        // If it's a firebase storage URL, plan to delete it on submit
        if (currentImage && currentImage.includes('firebasestorage.googleapis.com')) {
             setValue(`varieties.${fieldIndex}.imageFile`, 'DELETE');
        } else {
             setValue(`varieties.${fieldIndex}.imageFile`, undefined);
        }
        setValue(`varieties.${fieldIndex}.image`, ""); 
    }

    const selectImageFromLibrary = (image: ImageAsset) => {
        if (isLibraryOpen.fieldIndex !== null) {
            setValue(`varieties.${isLibraryOpen.fieldIndex}.image`, image.src);
            setValue(`varieties.${isLibraryOpen.fieldIndex}.imageFile`, undefined); // No new file to upload
            setIsLibraryOpen({open: false, fieldIndex: null});
        }
    }
    
    const handleGenerateDescription = async () => {
        const productName = getValues('name');
        const category = getValues('category');

        if (!productName || !category) {
            toast({
                title: "Missing Information",
                description: "Please provide a Product Name and Category first.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateDescription({ productName, category });
            if (result.description) {
                setValue('description', result.description, { shouldValidate: true });
                toast({
                    title: "Description Generated!",
                    description: "The AI-powered description has been added.",
                });
            }
        } catch (error) {
            console.error("Error generating description:", error);
            toast({
                title: "Generation Failed",
                description: "Could not generate a description at this time.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    async function onSubmit(data: ProductFormValues) {
        if (!user || !userProfile) {
            toast({ title: "Not Authenticated", description: "You must be logged in to save a product.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const productId = editId || uuidv4();

        try {
            // Process image uploads
            const updatedVarieties = await Promise.all(data.varieties.map(async (variety) => {
                const newVariety = { ...variety };

                if (newVariety.imageFile) {
                    if(isDataURL(newVariety.imageFile)) {
                        // New image to upload
                        const storageRef = ref(storage, `images/${user.uid}/${productId}/${newVariety.id}`);
                        const snapshot = await uploadString(storageRef, newVariety.imageFile, 'data_url');
                        newVariety.image = await getDownloadURL(snapshot.ref);
                    } else if (newVariety.imageFile === 'DELETE' && variety.image && variety.image.includes('firebasestorage')) {
                        // Image marked for deletion
                        try {
                           const imageRef = ref(storage, variety.image);
                           await deleteObject(imageRef);
                        } catch (error: any) {
                            if (error.code !== 'storage/object-not-found') {
                                console.warn("Could not delete old image, it may have already been removed:", error);
                            }
                        }
                        newVariety.image = "";
                    }
                }
                
                delete newVariety.imageFile; // Clean up the temporary field
                return newVariety;
            }));

            const finalData = { ...data, varieties: updatedVarieties, id: productId, userId: user.uid };

            const productRef = doc(firestore, "products", productId);

            if (editId) {
                await updateDoc(productRef, finalData);
                toast({ title: "Product Updated", description: `The product "${data.name}" has been saved.` });
            } else {
                await setDoc(productRef, finalData);
                toast({ title: "Product Created", description: `The product "${data.name}" has been added.` });
            }

            if (!userProfile.category && data.category) {
                 const userDocRef = doc(firestore, 'users', user.uid);
                 await updateDoc(userDocRef, { category: data.category });
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            console.error("Error saving product: ", error);
            toast({
                title: "Error Saving Product",
                description: error.message || "Could not save the product.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const isCategoryFixed = !!userProfile?.category;
    const isProMember = userProfile?.membershipTier === 'pro';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                     <p className="text-muted-foreground">Manage your product information and all its varieties.</p>
                </div>
            </div>
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
                             <div className="grid md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Product Name / Brand</FormLabel>
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
                                        {isCategoryFixed ? (
                                            <>
                                                <FormControl>
                                                    <Input readOnly disabled {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    This is your primary business category.
                                                </FormDescription>
                                            </>
                                        ) : (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category for this product" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {appCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Description</FormLabel>
                                            <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating || !currentProductName || !currentCategory}>
                                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                Generate with AI
                                            </Button>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide a detailed description of the product brand..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="inventory"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Total Inventory</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-lg font-medium mb-4">Product Varieties</h3>
                                <div className="space-y-6">
                                    {fields.map((field, index) => (
                                        <Card key={field.id} className="p-4 bg-muted/50 relative">
                                            <CardContent className="p-0">
                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <div className="md:col-span-2 space-y-4">
                                                         <FormField
                                                            control={form.control}
                                                            name={`varieties.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Variety Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="e.g., Classic White" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`varieties.${index}.price`}
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
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Variety Image</Label>
                                                        <Card className="border-dashed aspect-square">
                                                            <CardContent className="p-0 flex flex-col items-center justify-center text-center h-full relative">
                                                                {getValues(`varieties.${index}.image`) ? (
                                                                    <>
                                                                        <Image src={getValues(`varieties.${index}.image`)!} alt="Product preview" fill={true} className="object-cover rounded-md" />
                                                                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeVarietyImage(index)}>
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                     <div className="p-2 text-muted-foreground text-xs">No image</div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                        <div className='grid grid-cols-3 gap-2 w-full'>
                                                            <Label htmlFor={`image-upload-${index}`} className='w-full'>
                                                                <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                                                                    <span>
                                                                        <Upload className="h-4 w-4" />
                                                                    </span>
                                                                </Button>
                                                                <Input id={`image-upload-${index}`} type="file" className="sr-only" onChange={(e) => handleImageChange(e, index)} accept="image/*" disabled={isSubmitting}/>
                                                            </Label>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-full">
                                                                            <Button type="button" variant="outline" size="sm" className="w-full" asChild disabled={!isProMember}>
                                                                                <Link href={`/dashboard/camera?from=product-form&varietyIndex=${index}`}>
                                                                                    <Camera className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    {!isProMember && (
                                                                        <TooltipContent>
                                                                            <p className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Pro Feature: Upgrade to unlock.</p>
                                                                        </TooltipContent>
                                                                    )}
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                              <Dialog open={isLibraryOpen.open && isLibraryOpen.fieldIndex === index} onOpenChange={(open) => setIsLibraryOpen({open, fieldIndex: open ? index : null })}>
                                                                <DialogTrigger asChild>
                                                                    <Button type="button" variant="outline" size="sm" className="w-full" disabled={!currentCategory}>
                                                                        <Library className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-4xl">
                                                                    <DialogHeader>
                                                                    <DialogTitle>Browse Image Library ({currentCategory || "No Category Selected"})</DialogTitle>
                                                                    </DialogHeader>
                                                                    <ScrollArea className="h-[60vh]">
                                                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                                                                            {imageLibrary.length > 0 ? imageLibrary.map(image => (
                                                                                <Card key={image.id} className="cursor-pointer hover:border-primary" onClick={() => selectImageFromLibrary(image)}>
                                                                                    <CardContent className="p-0">
                                                                                        <Image src={image.src} alt={image.alt} width={200} height={200} className="aspect-square object-cover rounded-md" />
                                                                                    </CardContent>
                                                                                </Card>
                                                                            )) : <p>No images found for this category. Select a category to see shared images.</p>}
                                                                        </div>
                                                                    </ScrollArea>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            {fields.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </Card>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ id: `var_${Date.now()}`, name: '', price: 0, image: '', dataAiHint: '' })}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Another Variety
                                    </Button>
                                    {form.formState.errors.varieties && (
                                        <p className="text-sm font-medium text-destructive">{form.formState.errors.varieties.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-8">
                                 <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? 'Saving...' : editId ? 'Save Changes' : 'Create Product'}
                                 </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

    