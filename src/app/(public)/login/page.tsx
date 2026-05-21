'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin, useFaceLogin } from '@/lib/hooks/use-auth';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { FaceScanner } from '@/components/face/FaceScanner';
import { cn } from '@/lib/utils/cn';
import { preloadFaceModels } from '@/lib/face/preload';
function apiErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) return '';
  const ax = error as { response?: { data?: { message?: string | string[] } } };
  const m = ax.response?.data?.message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join(' ');
  return '';
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const login = useLogin(redirectParam ?? undefined);
  const faceLogin = useFaceLogin(redirectParam ?? undefined);
  const [mode, setMode] = useState<'face' | 'email'>('face');

  useEffect(() => {
    preloadFaceModels().catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
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
            <LogIn className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl text-center">Welcome Back</CardTitle>
          <p className="text-center text-orange-100 mt-2">Login to your account</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex rounded-xl border-2 border-orange-200 bg-orange-50/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => setMode('face')}
              className={cn(
                'flex-1 rounded-lg py-3 text-sm font-bold transition-all min-h-[48px]',
                mode === 'face'
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-100/80',
              )}
            >
              Face
            </button>
            <button
              type="button"
              onClick={() => setMode('email')}
              className={cn(
                'flex-1 rounded-lg py-3 text-sm font-bold transition-all min-h-[48px]',
                mode === 'email'
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-100/80',
              )}
            >
              Email & password
            </button>
          </div>

          {mode === 'face' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Look at the camera and tap <strong>Capture</strong> once. Email is not required if you completed face
                verification at registration.
              </p>
              {faceLogin.isError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">
                    {apiErrorMessage(faceLogin.error) ||
                      'Face sign-in failed. Try again, register with face verification first, or use email & password.'}
                  </p>
                </div>
              )}
              <FaceScanner
                sampleTarget={1}
                disabled={faceLogin.isPending}
                onComplete={(descriptors) => {
                  faceLogin.mutate({ descriptor: descriptors[0] });
                }}
              />
              {faceLogin.isPending && (
                <p className="text-center text-sm text-orange-600 font-medium">Signing you in…</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-semibold">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-semibold">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {login.isError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">Invalid email or password</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg"
                disabled={login.isPending}
              >
                {login.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          )}

          <div className="text-center pt-6 mt-2 border-t-2 border-orange-200">
            <p className="text-gray-700">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-orange-600 hover:text-orange-700 font-semibold underline">
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
