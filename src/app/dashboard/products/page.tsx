
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
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
import { ArrowLeft, Upload, Loader2, Trash2, Library, PlusCircle } from 'lucide-react';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const varietySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variety name is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  image: z.string().optional(),
  dataAiHint: z.string().optional(),
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
type Variety = z.infer<typeof varietySchema>;

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

    const [isUploading, setIsUploading] = useState(false);
    const [imageLibrary, setImageLibrary] = useState<ImageAsset[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState<{open: boolean, fieldIndex: number | null}>({open: false, fieldIndex: null});

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            description: "",
            status: "Active",
            inventory: 0,
            category: userProfile?.category || "",
            varieties: [{ id: `var_${Math.random().toString(36).substr(2, 9)}`, name: '', price: 0, image: '', dataAiHint: '' }],
        },
        mode: "onChange",
    });

    const { control, formState: { isSubmitting }, getValues, setValue } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "varieties"
    });
    
    useEffect(() => {
        if (userProfile?.category && !getValues('category')) {
            setValue('category', userProfile.category);
        }
    }, [userProfile, getValues, setValue]);

    useEffect(() => {
        const fetchProduct = () => {
            if (editId) {
                const storedProductsRaw = localStorage.getItem('products');
                if (storedProductsRaw) {
                    const products = JSON.parse(storedProductsRaw);
                    const productData = products.find((p: ProductFormValues) => p.id === editId);
                    if (productData) {
                        form.reset(productData);
                    } else {
                         toast({
                            title: "Error",
                            description: "Product not found in local storage.",
                            variant: "destructive",
                        });
                        router.push('/dashboard');
                    }
                }
            }
        };
        fetchProduct();
    }, [editId, form, router, toast]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, fieldIndex: number) => {
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
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setValue(`varieties.${fieldIndex}.image`, dataUrl, { shouldValidate: true });
                setIsUploading(false);
                toast({
                    title: "Image Ready",
                    description: "Image preview is ready to be saved with the product.",
                });
            };
            reader.onerror = () => {
                setIsUploading(false);
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
        setValue(`varieties.${fieldIndex}.image`, ""); 
    }

    const selectImageFromLibrary = (image: ImageAsset) => {
        if (isLibraryOpen.fieldIndex !== null) {
            setValue(`varieties.${isLibraryOpen.fieldIndex}.image`, image.src);
            setIsLibraryOpen({open: false, fieldIndex: null});
        }
    }

    async function onSubmit(data: ProductFormValues) {
        if (!user) {
            toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        try {
            const storedProductsRaw = localStorage.getItem('products');
            let products = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];

            if (editId) {
                const productIndex = products.findIndex((p: ProductFormValues) => p.id === editId);
                if (productIndex > -1) {
                    products[productIndex] = { ...products[productIndex], ...data, category: userProfile?.category || data.category };
                    toast({
                        title: "Product Updated",
                        description: `The product "${data.name}" has been successfully saved.`,
                    });
                }
            } else {
                const newProduct = { 
                    ...data, 
                    id: `prod_${Math.random().toString(36).substr(2, 9)}`,
                    userId: user.uid, 
                    category: userProfile?.category,
                };
                products.push(newProduct);
                toast({
                    title: "Product Created",
                    description: `The product "${data.name}" has been successfully added.`,
                });
            }
            localStorage.setItem('products', JSON.stringify(products));
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            console.error("Error saving product to localStorage: ", error);
            toast({
                title: "Error",
                description: "Could not save the product. Please try again.",
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
                                    <FormControl>
                                        <Input readOnly disabled value={userProfile?.category || 'N/A'} />
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
                                    <FormItem className="md:col-span-2">
                                    <FormLabel>Description</FormLabel>
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
                                                                    <Image src={getValues(`varieties.${index}.image`)!} alt="Product preview" layout="fill" className="object-cover rounded-md" />
                                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeVarietyImage(index)}>
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                 <div className="p-2 text-muted-foreground text-xs">No image</div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                    <Label htmlFor={`image-upload-${index}`} className='w-full'>
                                                         <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                                                            <span>
                                                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                                {isUploading ? "Uploading..." : "Upload New Image"}
                                                            </span>
                                                        </Button>
                                                        <Input id={`image-upload-${index}`} type="file" className="sr-only" onChange={(e) => handleImageChange(e, index)} accept="image/*" disabled={isUploading || isSubmitting}/>
                                                    </Label>
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
                                    onClick={() => append({ id: `var_${Math.random().toString(36).substr(2, 9)}`, name: '', price: 0, image: '', dataAiHint: '' })}
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
                             <Button type="submit" disabled={isUploading || isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                     <p className="text-muted-foreground">Manage your product information and all its varieties.</p>
                </div>
            </div>
             <Suspense fallback={<div>Loading form...</div>}>
                <ProductForm userProfile={userProfile} />
            </Suspense>
        </div>
    )
}

    