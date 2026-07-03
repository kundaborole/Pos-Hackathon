"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "../actions";
import { Loader2 } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await loginAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success && result.role) {
      // Role redirects
      if (result.role === "admin") {
        router.push("/dashboard");
      } else if (result.role === "kitchen") {
        router.push("/kitchen");
      } else {
        router.push("/floor");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <Card className="w-full max-w-md shadow-lg border-border-warm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary-forest text-white rounded-lg flex items-center justify-center mb-4">
            <span className="font-bold text-xl">CH</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary-forest">Staff Login</CardTitle>
          <p className="text-sm text-text-secondary mt-1">Sign in to access your workspace</p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4 pt-4">
            {error && (
              <div className="p-3 text-sm text-coral bg-coral/10 rounded-md border border-coral/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text-primary">Email Address</label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="staff@cafehub.com" 
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="••••••••" 
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
