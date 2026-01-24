'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || "Login Failed");
    } else {
      toast.success("Welcome back!");
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F2E9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to KutumbaTree
        </Link>

        <Card className="border-2 shadow-lg" style={{ borderColor: '#d4c5cb' }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription> 
              Sign in to continue your heritage journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="mt-1 focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="mt-1 pr-10 focus-visible:outline-none focus-visible:ring-0 ring-transparent focus-visible:border-orange-900"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="hover:opacity-80 transition-opacity" style={{ color: '#64303A' }}>
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#64303A' }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full border hover:bg-teal-600 hover:text-white" style={{ borderColor: '#d4c5cb' }}>
                <Mail className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>

              <Button className="w-full border hover:bg-teal-600 hover:text-white" style={{ borderColor: '#d4c5cb' }}>
                <Phone className="h-4 w-4 mr-2" />
                Continue with Phone OTP
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#64303A' }}>
                Sign up for free
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;