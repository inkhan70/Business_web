
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';

const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  status: z.enum(["Active", "Archived", "Low Stock", "Out of Stock"]),
  inventory: z.coerce.number().min(0, "Inventory must be a positive number."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

function ProductForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const editId = searchParams.get('edit');

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            status: "Active",
            inventory: 0,
        },
        mode: "onChange",
    });

    useEffect(() => {
        const fetchProduct = async () => {
            if (editId) {
                const docRef = doc(db, "products", editId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    form.reset(docSnap.data() as ProductFormValues);
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

    async function onSubmit(data: ProductFormValues) {
        try {
            if (editId) {
                // Update existing product
                const productRef = doc(db, "products", editId);
                await updateDoc(productRef, data);
                 toast({
                    title: "Product Updated",
                    description: `The product "${data.name}" has been successfully saved.`,
                });
            } else {
                // Add new product
                await addDoc(collection(db, "products"), data);
                 toast({
                    title: "Product Created",
                    description: `The product "${data.name}" has been successfully added.`,
                });
            }
            router.push('/dashboard');
            router.refresh(); // To see the changes on dashboard page
        } catch (error) {
            console.error("Error saving product: ", error);
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
                            <div className="md:col-span-1 space-y-4">
                                <Label>Product Image</Label>
                                <Card className="border-dashed">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-48">
                                         <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                                         <p className="text-sm text-muted-foreground mb-2">Drag & drop or click to upload</p>
                                         <Button type="button" variant="outline" size="sm">Select Image</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                             <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <ProductForm />
            </Suspense>
        </div>
    )
}
