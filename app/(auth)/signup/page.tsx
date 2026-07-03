import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4 py-12">
      <Card className="w-full max-w-lg shadow-lg border-border-warm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-primary-forest">Register Restaurant</CardTitle>
          <p className="text-sm text-text-secondary mt-1">Set up your Cafe Hub workspace</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-text-primary">First Name</label>
                <Input id="firstName" placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-text-primary">Last Name</label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="restaurantName" className="text-sm font-medium text-text-primary">Restaurant Name</label>
              <Input id="restaurantName" placeholder="The Cozy Cafe" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text-primary">Business Email</label>
              <Input id="email" type="email" placeholder="hello@cozycafe.com" />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>

            <Button className="w-full mt-6" type="button">
              Create Workspace
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border-warm pt-4">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/staff-login" className="text-primary-green hover:text-primary-hover font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
