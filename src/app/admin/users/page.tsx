
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, Users } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

interface User {
    uid: string;
    email: string;
    role: string;
    businessName?: string;
    fullName?: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        try {
            const storedUsersRaw = localStorage.getItem('users');
            if (storedUsersRaw) {
                setUsers(JSON.parse(storedUsersRaw));
            }
        } catch (error) {
            console.error("Error fetching users from localStorage:", error);
            toast({
                title: "Error Loading Users",
                description: "Could not load user data from local storage.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    const handleDeleteUser = async (uid: string, name: string) => {
        try {
            const updatedUsers = users.filter(user => user.uid !== uid);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            setUsers(updatedUsers);
            toast({
                title: "User Deleted",
                description: `The account for "${name}" has been removed.`,
            });
        } catch (error) {
             toast({
                title: "Error Deleting User",
                description: "Could not remove the user.",
                variant: "destructive",
            });
            console.error("Error deleting user: ", error);
        }
    };
    
    const handleRoleChange = (uid: string, newRole: string) => {
        try {
            const updatedUsers = users.map(user => {
                if (user.uid === uid) {
                    return { ...user, role: newRole };
                }
                return user;
            });
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            setUsers(updatedUsers);
            toast({
                title: "Role Updated",
                description: `The user's role has been changed to ${newRole}.`,
            });
        } catch(error) {
            toast({
                title: "Error Updating Role",
                description: "Could not update the user's role.",
                variant: "destructive"
            });
        }
    };

    const capitalizeFirstLetter = (string: string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline">User Management</h1>
        <p className="text-muted-foreground">
          View, manage, and remove user accounts from the database.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users in the application.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name / Business</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : users && users.length > 0 ? (
                        users.map(user => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.businessName || user.fullName || "N/A"}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Select value={user.role} onValueChange={(newRole) => handleRoleChange(user.uid, newRole)}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="buyer">Buyer</SelectItem>
                                            <SelectItem value="company">Company</SelectItem>
                                            <SelectItem value="wholesaler">Wholesaler</SelectItem>
                                            <SelectItem value="distributor">Distributor</SelectItem>
                                            <SelectItem value="shopkeeper">Shopkeeper</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the account for <strong>{user.businessName || user.fullName}</strong>. This action cannot be undone.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                className="bg-destructive hover:bg-destructive/90"
                                                onClick={() => handleDeleteUser(user.uid, user.businessName || user.fullName || "user")}>
                                                Delete Account
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                <Users className="mx-auto h-10 w-10 mb-2"/>
                                No users found in local storage.
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
