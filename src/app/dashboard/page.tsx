
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Camera, Trash2, Edit } from "lucide-react";
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

interface Product {
    id: string;
    name: string;
    image?: string;
    dataAiHint?: string;
    status: "Active" | "Archived" | "Low Stock" | "Out of Stock";
    price: number;
    inventory: number;
    varieties?: number;
}


export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsCollection = collection(db, 'products');
                const q = query(productsCollection, orderBy('name'));
                const productSnapshot = await getDocs(q);
                const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(productList);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast({
                    title: "Error",
                    description: "Could not fetch products from the database.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [toast]);

    const handleDelete = async (productId: string, productName: string) => {
        try {
            await deleteDoc(doc(db, "products", productId));
            setProducts(products.filter(p => p.id !== productId));
            toast({
                title: "Product Deleted",
                description: `"${productName}" has been removed.`,
            });
        } catch (error) {
            console.error("Error deleting product: ", error);
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
                                <TableCell colSpan={7} className="text-center">Loading products...</TableCell>
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
