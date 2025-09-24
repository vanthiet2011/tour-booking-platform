import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <Plane className="h-8 w-8" />
            WanderWise
          </Link>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to continue your travel journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link
                  href="/register"
                  className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
