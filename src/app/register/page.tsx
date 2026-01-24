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
import { Mail, Phone, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (phone) {
      const sanitizedPhone = phone.replace(/[\s()-]/g, '');
      const digitsOnly = sanitizedPhone.replace(/^\+/, '');
      const isIndian = /^\+?91\d{10}$/.test(sanitizedPhone);
      const isUaeMobile = /^\+?9715\d{8}$/.test(sanitizedPhone);
      const isUaeLandline = /^\+?971[2-9]\d{7}$/.test(sanitizedPhone);
      const withinLength = digitsOnly.length >= 11 && digitsOnly.length <= 12;

      if (!withinLength || !(isIndian || isUaeMobile || isUaeLandline)) {
        toast.error("Use Indian (+91XXXXXXXXXX) or UAE (+9715XXXXXXXX/+9712XXXXXXX) numbers only");
        return;
      }
    }

    setLoading(true);
    const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName });

    if (error) {
      toast.error(error.message || "Registration Failed");
    } else {
      toast.success("Success! Please check your email to verify your account");
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
            <CardTitle className="text-2xl font-bold" style={{ color: '#64303A' }}>Start Your Heritage Journey</CardTitle>
            <CardDescription>
              Create your free account to build your family tree
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      className="mt-1 focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      maxLength={50}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      className="mt-1 focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      maxLength={50}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
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
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +919876543210 or +971501234567"
                    className="mt-1 focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={16}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
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

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="rounded mt-1 border-orange-900 focus:ring-orange-900"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                  />
                  <div className="text-xs text-gray-600">
                    <span className="text-red-600">* </span>I agree to the Terms of Service and Privacy Policy
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#64303A' }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Free Account'}
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
                Sign up with Google
              </Button>

              <Button className="w-full border hover:bg-teal-600 hover:text-white" style={{ borderColor: '#d4c5cb' }}>
                <Phone className="h-4 w-4 mr-2" />
                Sign up with Phone OTP
              </Button>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: '#f5e6e9' }}>
              <h4 className="font-medium text-sm mb-2" style={{ color: '#64303A' }}>Free Account Includes:</h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3" style={{ color: '#64303A' }} />
                  25 family members
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3" style={{ color: '#64303A' }} />
                  Text-only profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3" style={{ color: '#64303A' }} />
                  3 searches per month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3" style={{ color: '#64303A' }} />
                  Cultural features
                </li>
              </ul>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#64303A' }}>
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;