
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, Globe, Users, Target } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    avatar: "https://picsum.photos/seed/alex/100/100",
    dataAiHint: "man portrait",
  },
  {
    name: "Maria Garcia",
    role: "Head of Product",
    avatar: "https://picsum.photos/seed/maria/100/100",
     dataAiHint: "woman portrait",
  },
  {
    name: "Chen Wei",
    role: "Lead Engineer",
    avatar: "https://picsum.photos/seed/chen/100/100",
     dataAiHint: "man smiling",
  },
  {
    name: "Fatima Al-Fassi",
    role: "Head of Marketing",
    avatar: "https://picsum.photos/seed/fatima/100/100",
    dataAiHint: "woman smiling",
  },
];


export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        
        {/* --- Hero Section --- */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="flex flex-col items-start text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold font-headline leading-tight tracking-tighter text-primary">
                Empowering Local Commerce, Globally.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground my-8">
                business_web was founded on a simple, powerful idea: to break down barriers in local commerce. We believe that every producer, distributor, and shopkeeper deserves the tools to thrive in the digital age. Our platform is more than just a marketplace; it's a community built to foster growth, connection, and opportunity.
              </p>
            </div>
            <div className="hidden md:block">
               <Image 
                src={"https://picsum.photos/seed/abouthero/600/400"}
                alt="A bustling marketplace"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
                data-ai-hint="bustling marketplace"
              />
            </div>
        </div>

        {/* --- Mission and Vision --- */}
        <div className="grid md:grid-cols-2 gap-8 text-center max-w-4xl mx-auto mb-24">
          <Card className="bg-secondary/50">
            <CardHeader>
              <Target className="h-10 w-10 mx-auto text-primary mb-2" />
              <CardTitle className="font-headline text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">To provide a seamless, intuitive, and free platform that connects every layer of the local supply chain, from the producer's hands to the customer's home.</p>
            </CardContent>
          </Card>
           <Card className="bg-secondary/50">
            <CardHeader>
              <Globe className="h-10 w-10 mx-auto text-primary mb-2" />
              <CardTitle className="font-headline text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">A world where local economies are robust and self-sustaining, powered by technology that supports community growth and equitable trade for all.</p>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-24" />

        {/* --- Our Story Section --- */}
        <div className="max-w-3xl mx-auto text-center mb-24">
             <h2 className="text-3xl font-bold font-headline mb-4">Our Story</h2>
             <p className="text-muted-foreground leading-relaxed">
                It all started with a simple observation: local businesses are the heart of our communities, yet many struggle to compete in an increasingly digital world. We saw dedicated producers with amazing products but limited reach, and distributors working hard to connect the dots but facing logistical hurdles. We knew there had to be a better way. business_web was born from this challenge—a commitment to building a digital infrastructure that works for everyone, not just the giants of e-commerce. From a small team with a big idea, we've grown into a platform serving thousands, driven by the success stories of the businesses we support.
             </p>
        </div>
        
        {/* --- Meet the Team Section --- */}
        <div className="text-center">
            <h2 className="text-3xl font-bold font-headline mb-4">Meet the Team</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mb-12">We are a passionate group of innovators, thinkers, and builders dedicated to your success.</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                    <div key={member.name} className="flex flex-col items-center">
                        <Avatar className="w-24 h-24 mb-4">
                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-primary">{member.role}</p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
