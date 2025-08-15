
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy, addDoc } from 'firebase/firestore';
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

interface Product {
    id: string;
    name: string;
    image?: string;
    dataAiHint?: string;
    status: "Active" | "Archived" | "Low Stock" | "Out of Stock";
    price: number;
    inventory: number;
    varieties?: number;
    category?: string;
    userId?: string;
}

const sampleProducts: Omit<Product, 'id' | 'userId'>[] = [
    { name: 'Organic Fuji Apples', status: 'Active', price: 2.99, inventory: 150, category: 'Food', dataAiHint: 'apple fruit' },
    { name: 'Artisan Sourdough Bread', status: 'Active', price: 5.50, inventory: 80, category: 'Food', dataAiHint: 'bread loaf' },
    { name: 'Cage-Free Brown Eggs', status: 'Low Stock', price: 6.00, inventory: 24, category: 'Food', dataAiHint: 'egg carton' },
    { name: 'Unsweetened Almond Milk', status: 'Active', price: 4.25, inventory: 100, category: 'Drinks', dataAiHint: 'milk carton' },
    { name: 'Running Shoes', status: 'Out of Stock', price: 120.00, inventory: 0, category: 'Shoes', dataAiHint: 'running shoes' },
];


export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { t } = useLanguage();
    const { user } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) {
                setLoading(false);
                return;
            };
            setLoading(true);
            try {
                const productsCollection = collection(db, 'products');
                const q = query(productsCollection, orderBy('name'));
                const productSnapshot = await getDocs(q);
                
                if (productSnapshot.empty) {
                    // Seed the database if it's empty
                    for (const prod of sampleProducts) {
                        await addDoc(productsCollection, { ...prod, userId: user.uid });
                    }
                    // Refetch after seeding
                    const newSnapshot = await getDocs(q);
                    const productList = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                    setProducts(productList);
                } else {
                    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                    setProducts(productList);
                }

            } catch (error: any) {
                console.error("Error fetching products:", error);
                let description = "Could not fetch products from the database.";
                if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                    description = "You do not have permission to view products. Please check your Firestore security rules."
                }
                toast({
                    title: "Error",
                    description: description,
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
            await deleteDoc(doc(db, "products", productId));
            setProducts(products.filter(p => p.id !== productId));
            toast({
                title: "Product Deleted",
                description: `"${productName}" has been removed.`,
            });
        } catch (error: any) {
            console.error("Error deleting product: ", error);
            let description = "Could not delete the product.";
            if (error.code === 'permission-denied') {
                description = "You do not have permission to delete this product. Please check your Firestore security rules.";
            }
            toast({
                title: "Error",
                description: description,
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
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
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
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
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
                                            src={product.image || "https://placehold.co/40x40.png"}
                                            width="40"
                                            data-ai-hint={product.dataAiHint || "product image"}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={product.status === 'Active' ? 'default' : product.status === 'Low Stock' ? 'secondary' : 'destructive'} 
                                            className={product.status === 'Active' ? 'bg-green-100 text-green-800' : product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.inventory}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.varieties || 1}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t('item_detail.select_variety')}</DropdownMenuLabel>
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
                                                            onSelect={(e) => e.preventDefault()} // Prevents dropdown from closing
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t('categories.are_you_sure')}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the product "{product.name}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t('categories.cancel')}</AlertDialogCancel>
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
