import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <Card className="w-full max-w-md shadow-lg border-border-warm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary-forest text-white rounded-lg flex items-center justify-center mb-4">
            <span className="font-bold text-xl">CH</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary-forest">Staff Login</CardTitle>
          <p className="text-sm text-text-secondary mt-1">Enter your PIN to access the system</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium text-text-primary">Access PIN</label>
              <Input 
                id="pin" 
                type="password" 
                placeholder="••••" 
                maxLength={4}
                className="text-center tracking-[0.5em] text-lg font-bold"
              />
            </div>
            <Button className="w-full" type="button">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border-warm pt-4">
          <Link href="/signup" className="text-sm text-primary-green hover:text-primary-hover font-medium">
            Register new restaurant
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
