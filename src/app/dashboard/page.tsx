
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Camera, Trash2, Edit, Loader2 } from "lucide-react";
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import images from '@/app/lib/placeholder-images.json';

interface Variety {
    id: string;
    name: string;
    price: number;
    image?: string;
    dataAiHint?: string;
}

interface Product {
    id: string;
    name: string; // This is now the Brand/Product Line name
    status: "Active" | "Archived" | "Low Stock" | "Out of Stock";
    inventory: number;
    category?: string;
    userId?: string;
    varieties: Variety[];
}

const sampleProducts: Omit<Product, 'id' | 'userId'>[] = [
    { 
        name: 'Organic Fuji Apples', 
        status: 'Active', 
        inventory: 150, 
        category: 'Food',
        varieties: [
            { id: 'v1', name: 'Single Apple', price: 0.50, image: images.products.apple, dataAiHint: 'apple fruit' },
            { id: 'v2', name: 'Bag of Apples (5 lb)', price: 2.99, image: images.products.apple, dataAiHint: 'apples bag' },
        ]
    },
    { 
        name: 'Artisan Sourdough', 
        status: 'Active', 
        inventory: 80, 
        category: 'Food', 
        varieties: [
            { id: 'v3', name: 'Classic White Loaf', price: 5.50, image: images.products.bread, dataAiHint: 'bread loaf' },
            { id: 'v4', name: 'Whole Wheat Loaf', price: 6.00, image: images.products.bread, dataAiHint: 'brown bread' },
        ]
    },
];


export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { t } = useLanguage();
    const { user } = useAuth();

    useEffect(() => {
        const fetchProducts = () => {
            if (!user) {
                setLoading(false);
                return;
            };
            setLoading(true);
            try {
                const storedProductsRaw = localStorage.getItem('products');
                let allProducts = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];
                
                if (allProducts.length === 0) {
                    // Seed local storage if it's empty
                    const productsToSeed = sampleProducts.map(prod => ({
                        ...prod,
                        id: `prod_${Math.random().toString(36).substr(2, 9)}`,
                        userId: user.uid,
                    }));
                    localStorage.setItem('products', JSON.stringify(productsToSeed));
                    allProducts = productsToSeed;
                }
                
                const userProducts = allProducts.filter((p: Product) => p.userId === user.uid);
                setProducts(userProducts);

            } catch (error: any) {
                console.error("Error fetching products from localStorage:", error);
                toast({
                    title: "Error",
                    description: "Could not fetch products from local storage.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [toast, user]);

    const handleDelete = async (productId: string, productName: string) => {
        try {
            const storedProductsRaw = localStorage.getItem('products');
            let allProducts = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];
            const updatedProducts = allProducts.filter((p: Product) => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            
            setProducts(products.filter(p => p.id !== productId));
            toast({
                title: "Product Deleted",
                description: `"${productName}" has been removed.`,
            });
        } catch (error: any) {
            console.error("Error deleting product from localStorage: ", error);
            toast({
                title: "Error",
                description: "Could not delete the product.",
                variant: "destructive",
            });
        }
    };


  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold font-headline">Manage Products</h1>
                <p className="text-muted-foreground">here you can add or delete products pictures and information for your business</p>
            </div>
            <div className="flex space-x-2">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/camera">
                        <Camera className="mr-2 h-4 w-4" /> Live Camera
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/dashboard/products">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>
        </div>

        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                            <TableHead>Product / Brand</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Inventory</TableHead>
                            <TableHead className="hidden md:table-cell">Varieties</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <p className="font-semibold mb-2">No products found.</p>
                                    <p className="text-muted-foreground mb-4">Get started by adding your first product.</p>
                                    <Button asChild size="sm">
                                        <Link href="/dashboard/products">
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="40"
                                            src={product.varieties?.[0]?.image || images.products.dashboard_product}
                                            width="40"
                                            data-ai-hint={product.varieties?.[0]?.dataAiHint || "product image"}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/dashboard/products/${product.id}`} className="hover:underline">
                                            {product.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={product.status === 'Active' ? 'default' : product.status === 'Low Stock' ? 'secondary' : 'destructive'} 
                                            className={product.status === 'Active' ? 'bg-green-100 text-green-800' : product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{product.inventory}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.varieties?.length || 0}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/products?edit=${product.id}`}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem 
                                                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                                                            onSelect={(e) => e.preventDefault()}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the product "{product.name}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                className="bg-destructive hover:bg-destructive/90"
                                                                onClick={() => handleDelete(product.id, product.name)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
