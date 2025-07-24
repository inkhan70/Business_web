import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";

const products = [
  {
    id: "prod_1",
    name: "Organic Apples",
    image: "https://placehold.co/40x40.png",
    dataAiHint: "apple fruit",
    status: "Active",
    price: "$2.99/lb",
    inventory: 200,
    varieties: 3,
  },
  {
    id: "prod_2",
    name: "Whole Wheat Bread",
    image: "https://placehold.co/40x40.png",
    dataAiHint: "bread loaf",
    status: "Active",
    price: "$4.50",
    inventory: 150,
    varieties: 2,
  },
  {
    id: "prod_3",
    name: "Free-Range Eggs",
    image: "https://placehold.co/40x40.png",
    dataAiHint: "egg carton",
    status: "Low Stock",
    price: "$5.00/dozen",
    inventory: 20,
    varieties: 1,
  },
    {
    id: "prod_4",
    name: "Almond Milk",
    image: "https://placehold.co/40x40.png",
    dataAiHint: "milk carton",
    status: "Out of Stock",
    price: "$3.75",
    inventory: 0,
    varieties: 1,
  },
];


export default function DashboardPage() {
  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold font-headline">Manage Products</h1>
                <p className="text-muted-foreground">Add, edit, or remove products from your inventory.</p>
            </div>
            <div className="flex space-x-2">
                <Button variant="outline">
                    <Camera className="mr-2 h-4 w-4" /> Live Camera
                </Button>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
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
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="40"
                                        src={product.image}
                                        width="40"
                                        data-ai-hint={product.dataAiHint}
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
                                <TableCell>{product.price}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.inventory}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.varieties}</TableCell>
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
                                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
