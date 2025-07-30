"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LayoutDashboard, Settings, MessageSquare, Bell, UserCircle, Image as ImageIconLucide } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sidebarNavItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Products",
        href: "/dashboard/products",
        icon: ShoppingBag,
    },
    {
        title: "Images",
        href: "/dashboard/images",
        icon: ImageIconLucide,
    },
    {
        title: "Orders",
        href: "/dashboard/orders",
        icon: Bell,
        badge: "3"
    },
    {
        title: "Chat",
        href: "/dashboard/chat",
        icon: MessageSquare,
        badge: "1"
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="container mx-auto my-8">
            <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
                <aside className="hidden lg:flex flex-col space-y-6 p-4 bg-secondary/50 rounded-lg">
                   <div className="flex items-center space-x-3 p-2">
                       <UserCircle className="w-10 h-10 text-muted-foreground" />
                       <div>
                           <p className="font-semibold text-sm">City Grocers</p>
                           <p className="text-xs text-muted-foreground">Distributor</p>
                       </div>
                   </div>
                    <nav className="flex flex-col space-y-1">
                        {sidebarNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-background",
                                    (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))
                                        ? "bg-background text-primary-foreground shadow-sm"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                                {item.badge && <Badge variant="destructive" className="ml-auto">{item.badge}</Badge>}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="bg-background rounded-lg shadow-sm border p-6 min-h-[60vh]">
                    {children}
                </main>
            </div>
        </div>
    );
}
