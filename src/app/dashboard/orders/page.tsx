
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package,ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  buyerId: string;
  businessId: string;
  buyerName: string;
  items: any[];
  totalCost: number;
  orderDate: Timestamp;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  pickupCode: string;
}

export default function OrdersPage() {
  const { user, userProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const isBusiness = userProfile?.role && userProfile.role !== 'buyer';

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    const ordersCollection = collection(firestore, 'orders');
    const fieldPath = isBusiness ? 'businessId' : 'buyerId';
    return query(ordersCollection, where(fieldPath, '==', user.uid), orderBy('orderDate', 'desc'));
  }, [user, firestore, isBusiness]);

  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: 'The pickup code has been copied.',
      });
    }, (err) => {
      toast({
        title: 'Failed to Copy',
        description: 'Could not copy the code.',
        variant: 'destructive',
      });
    });
  };

  const pageTitle = isBusiness ? 'Incoming Orders' : 'My Purchase History';
  const pageDescription = isBusiness ? 'View and manage orders from your customers.' : 'Track your purchases and view pickup codes.';


  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline">{pageTitle}</h1>
        <p className="text-muted-foreground">
          {pageDescription}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A list of your recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>{isBusiness ? 'Customer' : 'Business'}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Pickup Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : orders && orders.length > 0 ? (
                orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium truncate" style={{maxWidth: '100px'}} title={order.id}>{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{isBusiness ? order.buyerName : 'Business Name'}</TableCell>
                    <TableCell>{order.orderDate?.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>${order.totalCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                            <span className="font-mono text-sm">{order.pickupCode}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(order.pickupCode)}>
                                <ClipboardCopy className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Package className="mx-auto h-10 w-10 mb-2" />
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
