'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/lib/hooks/use-auth';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, CheckCircle2, Clock } from 'lucide-react';

export default function RegisterPage() {
  const register = useRegister();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      role: 'customer',
    },
  });

  const selectedRole = watch('role');

  if (register.isSuccess && !register.data?.tokens.accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 px-4 py-12">
        <Card className="w-full max-w-md shadow-2xl border-4 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-8">
            <div className="flex justify-center mb-4">
              <Clock className="h-16 w-16" />
            </div>
            <CardTitle className="text-3xl font-bold">Registration Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-100">
              <p className="text-blue-800 text-lg font-medium">
                Your seller registration request has been submitted successfully!
              </p>
            </div>
            <p className="text-gray-600">
              A superadmin will review your request shortly. You will be able to log in once your account is approved.
            </p>
            <Link href="/login" className="block">
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: RegisterFormData) => {
    register.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 px-4 py-12">
      <div className="w-full max-w-md mb-6">
        <Link href="/">
          <Button variant="ghost" className="text-orange-600 hover:bg-orange-100 font-bold gap-2 min-h-[48px]">
            ← Back to Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-4 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white">
          <div className="flex justify-center mb-2">
            <UserPlus className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl text-center">Create Account</CardTitle>
          <p className="text-center text-orange-100 mt-2">Join us to start ordering!</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setValue('role', 'customer')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedRole === 'customer'
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md scale-105'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200'
                  }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${selectedRole === 'customer' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                  <UserPlus className="h-6 w-6" />
                </div>
                <span className="font-bold">Customer</span>
                <input type="radio" value="customer" {...registerField('role')} className="hidden" />
              </button>

              <button
                type="button"
                onClick={() => setValue('role', 'seller')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedRole === 'seller'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200'
                  }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${selectedRole === 'seller' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                  <UserPlus className="h-6 w-6" />
                </div>
                <span className="font-bold">Seller</span>
                <input type="radio" value="seller" {...registerField('role')} className="hidden" />
              </button>
            </div>

            <div>
              <Label htmlFor="name" className="text-gray-700 font-semibold">Name *</Label>
              <Input
                id="name"
                type="text"
                {...registerField('name')}
                placeholder="John Doe"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">Email *</Label>
              <Input
                id="email"
                type="email"
                {...registerField('email')}
                placeholder="you@example.com"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold">Password *</Label>
              <Input
                id="password"
                type="password"
                {...registerField('password')}
                placeholder="••••••••"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerField('confirmPassword')}
                placeholder="••••••••"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                {...registerField('phone')}
                placeholder="+1 (555) 123-4567"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {register.isError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 text-center">
                  Registration failed. Please try again.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg"
              disabled={register.isPending}
            >
              {register.isPending ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center pt-4 border-t-2 border-orange-200">
              <p className="text-gray-700">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
