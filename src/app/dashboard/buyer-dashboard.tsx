"use client";

import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from '@/firebase';
import { doc, runTransaction } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Wallet, Gem } from "lucide-react";

export function BuyerDashboard() {
    const { userProfile, user } = useAuth();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isConverting, setIsConverting] = useState(false);
    const conversionRate = 0.010;

    const handleConvertCoins = async () => {
        if (!user || !userProfile || !userProfile.ghostCoins || userProfile.ghostCoins <= 0) {
            toast({ title: "No coins to convert.", variant: "destructive" });
            return;
        }

        setIsConverting(true);
        const userDocRef = doc(firestore, "users", user.uid);

        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) {
                    throw "Document does not exist!";
                }

                const currentCoins = userDoc.data().ghostCoins || 0;
                if (currentCoins === 0) {
                    toast({ title: "You have no Ghost Coins to convert." });
                    return;
                }
                
                const valueToAdd = currentCoins * conversionRate;
                const newBalance = (userDoc.data().balance || 0) + valueToAdd;

                transaction.update(userDocRef, {
                    ghostCoins: 0,
                    balance: newBalance
                });
            });

            toast({
                title: "Conversion Successful!",
                description: `${userProfile.ghostCoins} Ghost Coins have been converted to $${(userProfile.ghostCoins * conversionRate).toFixed(2)}.`
            });
        } catch (e) {
            console.error("Conversion failed: ", e);
            toast({ title: "Conversion Failed", description: "There was an error converting your coins.", variant: "destructive" });
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-headline">Buyer Dashboard</h1>
                <p className="text-muted-foreground">An overview of your account and rewards.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${userProfile?.balance?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">Available for your next purchase.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ghost Coins</CardTitle>
                        <Gem className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userProfile?.ghostCoins || 0}</div>
                        <p className="text-xs text-muted-foreground">Est. Value: <span className="font-semibold">${((userProfile?.ghostCoins || 0) * conversionRate).toFixed(2)}</span></p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Convert Your Ghost Coins</CardTitle>
                    <CardDescription>Turn your earned Ghost Coins into account credit. 1 Ghost Coin = ${conversionRate.toFixed(3)}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">You have <strong className="text-primary">{userProfile?.ghostCoins || 0}</strong> Ghost Coins ready to be converted.</p>
                    <Button onClick={handleConvertCoins} disabled={isConverting || !userProfile?.ghostCoins || userProfile.ghostCoins <= 0}>
                        {isConverting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Convert to Credit
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
