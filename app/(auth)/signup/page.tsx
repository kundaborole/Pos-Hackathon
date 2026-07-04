"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupOwnerAction } from "../actions";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await signupOwnerAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4 py-12">
      <Card className="w-full max-w-lg shadow-lg border-border-warm">
        <CardHeader className="text-center pb-4 flex flex-col items-center">
          <img src="/images/logo.png" alt="Cafe Hub Logo" className="h-16 w-16 mb-4 rounded-xl shadow-sm" />
          <CardTitle className="text-2xl font-bold text-primary-forest">Register Restaurant</CardTitle>
          <p className="text-sm text-text-secondary mt-1">Set up your Cafe Hub workspace</p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-coral bg-coral/10 rounded-md border border-coral/20">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-text-primary">First Name</label>
                <Input id="firstName" name="firstName" placeholder="Jane" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-text-primary">Last Name</label>
                <Input id="lastName" name="lastName" placeholder="Doe" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="restaurantName" className="text-sm font-medium text-text-primary">Restaurant Name</label>
              <Input id="restaurantName" name="restaurantName" placeholder="The Cozy Cafe" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text-primary">Business Email</label>
              <Input id="email" name="email" type="email" placeholder="hello@cozycafe.com" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
            </div>

            <Button className="w-full mt-6" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
