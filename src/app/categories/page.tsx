import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';

const categories = [
  { name: 'Food', icon: UtensilsCrossed, href: '/products?category=food' },
  { name: 'Drinks', icon: GlassWater, href: '/products?category=drinks' },
  { name: 'Electronics', icon: Laptop, href: '/products?category=electronics' },
  { name: 'Medicine', icon: Pill, href: '/products?category=medicine' },
  { name: 'Shoes', icon: Footprints, href: '/products?category=shoes' },
  { name: 'Fabrics', icon: Scissors, href: '/products?category=fabrics' },
  { name: 'Jewelry', icon: Gem, href: '/products?category=jewelry' },
  { name: 'Hardware', icon: Building, href: '/products?category=hardware'},
  { name: 'Other', icon: MoreHorizontal, href: '/products?category=other' },
];

export default function CategoriesPage() {
  // In a real app, this would be determined by user authentication
  const isAdmin = true;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          Browse by Category
        </h1>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground mt-4">
          Find exactly what you're looking for by exploring our business categories.
        </p>
      </div>
      
      {isAdmin && (
        <div className="flex justify-end space-x-2 mb-8">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
            </Button>
            <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Category
            </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <Link href={category.href} key={category.name}>
            <Card className="group text-center hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 ease-in-out">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <category.icon className="h-12 w-12 mb-4 text-primary group-hover:text-accent transition-colors" />
                <h3 className="text-lg font-bold font-headline">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
