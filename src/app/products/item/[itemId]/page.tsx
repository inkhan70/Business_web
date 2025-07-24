"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const product = {
  name: "Artisan Sourdough Bread",
  varieties: [
    { id: 'var1', name: 'Classic White Sourdough', price: 5.50, manufacturer: 'Golden Grains Bakery', image: 'https://placehold.co/500x500.png', dataAiHint: 'white bread' },
    { id: 'var2', name: 'Whole Wheat Sourdough', price: 6.00, manufacturer: 'Hearty Harvest Breads', image: 'https://placehold.co/500x500.png', dataAiHint: 'brown bread' },
    { id: 'var3', name: 'Rosemary & Olive Oil Sourdough', price: 6.50, manufacturer: 'Golden Grains Bakery', image: 'https://placehold.co/500x500.png', dataAiHint: 'herb bread' },
  ]
};

export default function ItemDetailPage({ params }: { params: { itemId: string } }) {
  const [selectedVariety, setSelectedVariety] = useState(product.varieties[0]);
  const [quantity, setQuantity] = useState(1);
  const [showAddress, setShowAddress] = useState(false);

  const totalCost = selectedVariety.price * quantity;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Image src={selectedVariety.image} alt={selectedVariety.name} width={500} height={500} className="rounded-xl shadow-lg object-cover w-full" data-ai-hint={selectedVariety.dataAiHint} />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {product.varieties.map(v => (
                 <button key={v.id} onClick={() => setSelectedVariety(v)}>
                    <Image src={v.image} alt={v.name} width={100} height={100} className={`rounded-md object-cover border-2 ${selectedVariety.id === v.id ? 'border-primary' : 'border-transparent'}`} data-ai-hint={v.dataAiHint} />
                 </button>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">{selectedVariety.name}</CardTitle>
              <CardDescription>by {selectedVariety.manufacturer}</CardDescription>
              <p className="text-2xl font-bold text-primary pt-2">${selectedVariety.price.toFixed(2)}</p>
            </CardHeader>
            <CardContent>
              <Label>Select Variety</Label>
              <RadioGroup value={selectedVariety.id} onValueChange={(id) => setSelectedVariety(product.varieties.find(v => v.id === id) || product.varieties[0])} className="mt-2">
                {product.varieties.map(v => (
                  <div key={v.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={v.id} id={v.id} />
                    <Label htmlFor={v.id} className="cursor-pointer">{v.name}</Label>
                  </div>
                ))}
              </RadioGroup>
              
              <Separator className="my-6" />

              <div className="flex items-center gap-8">
                  <div>
                    <Label>Quantity</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                      <Input type="number" value={quantity} readOnly className="w-16 text-center" />
                      <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                  </div>
              </div>

              <Separator className="my-6" />
              
              {!showAddress ? (
                <Button className="w-full" size="lg" onClick={() => setShowAddress(true)}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Proceed to Purchase
                </Button>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Delivery Information</h3>
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea id="address" placeholder="Enter your full delivery address..." />
                  <p className="text-sm text-muted-foreground">Transportation Cost: <span className="font-bold text-foreground">$5.00</span></p>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="manual-transport" />
                    <Label htmlFor="manual-transport" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I will transport the products manually.
                    </Label>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Confirm Order</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
