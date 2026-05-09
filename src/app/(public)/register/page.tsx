'use client';

import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister, useVerifyRegistrationEmail } from '@/lib/hooks/use-auth';
import { authApi } from '@/lib/api/endpoints/auth';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, Clock, FileText, Upload, X, Mail } from 'lucide-react';
import { FaceScanner } from '@/components/face/FaceScanner';
import { preloadFaceModels } from '@/lib/face/preload';
import { getApiErrorMessage } from '@/lib/api/get-api-error-message';

interface DocFile {
  file: File;
  preview: string;
}

function DocUpload({
  label,
  hint,
  value,
  onChange,
  required,
}: {
  label: string;
  hint: string;
  value: DocFile | null;
  onChange: (f: DocFile | null) => void;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange({ file, preview: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label className="text-gray-700 font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <p className="text-xs text-gray-500">{hint}</p>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {value ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-blue-300">
          <img src={value.preview} alt={label} className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => { onChange(null); if (ref.current) ref.current.value = ''; }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full h-32 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center gap-2 text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Upload className="h-8 w-8" />
          <span className="text-sm font-medium">Click to upload</span>
        </button>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const registerMutation = useRegister();
  const verifyMutation = useVerifyRegistrationEmail();
  const [registrationStep, setRegistrationStep] = useState<'form' | 'verify' | 'sellerDone'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendHint, setResendHint] = useState<string | null>(null);
  const [passportMain, setPassportMain] = useState<DocFile | null>(null);
  const [passportReg, setPassportReg] = useState<DocFile | null>(null);
  const [selfie, setSelfie] = useState<DocFile | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [faceDescriptors, setFaceDescriptors] = useState<number[][] | null>(null);
  const [faceError, setFaceError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { role: 'customer' },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    preloadFaceModels().catch(() => {});
  }, []);

  useEffect(() => {
    setFaceDescriptors(null);
    setFaceError(null);
  }, [selectedRole]);

  useEffect(() => {
    const d = registerMutation.data;
    if (registerMutation.isSuccess && d?.requiresEmailVerification && registrationStep === 'form') {
      setPendingEmail(d.user.email);
      setVerificationCode('');
      setRegistrationStep('verify');
    }
  }, [registerMutation.isSuccess, registerMutation.data, registrationStep]);

  useEffect(() => {
    const d = verifyMutation.data;
    if (
      verifyMutation.isSuccess &&
      d &&
      (!d.tokens.accessToken || !d.tokens.refreshToken)
    ) {
      setRegistrationStep('sellerDone');
    }
  }, [verifyMutation.isSuccess, verifyMutation.data]);

  if (registrationStep === 'sellerDone') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 px-4 py-12">
        <Card className="w-full max-w-md shadow-2xl border-4 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-8">
            <div className="flex justify-center mb-4"><Clock className="h-16 w-16" /></div>
            <CardTitle className="text-3xl font-bold">Registration Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-100">
              <p className="text-blue-800 text-lg font-medium">
                Your seller registration request has been submitted successfully!
              </p>
            </div>
            <p className="text-gray-600">
              An admin will review your documents and approve your account shortly.
            </p>
            <Link href="/login" className="block">
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700">Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (registrationStep === 'verify') {
    const onVerifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const digits = verificationCode.replace(/\D/g, '').slice(0, 6);
      if (digits.length !== 6) return;
      verifyMutation.mutate({ email: pendingEmail, code: digits });
    };

    const handleResend = async () => {
      setResending(true);
      setResendHint(null);
      try {
        await authApi.resendRegistrationCode(pendingEmail);
        setResendHint('If this address is correct, check your inbox for a new code.');
      } catch {
        setResendHint('Could not resend. Try again in a moment.');
      } finally {
        setResending(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 px-4 py-12">
        <div className="w-full max-w-lg mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-orange-600 hover:bg-orange-100 font-bold gap-2 min-h-[48px]">
              ← Back to Home
            </Button>
          </Link>
        </div>

        <Card className="w-full max-w-lg shadow-2xl border-4 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white">
            <div className="flex justify-center mb-2"><Mail className="h-12 w-12" /></div>
            <CardTitle className="text-3xl text-center">Verify your email</CardTitle>
            <p className="text-center text-orange-100 mt-2">Step 2 of 2 — enter the 6-digit code we sent you</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onVerifySubmit} className="space-y-4">
              <p className="text-sm text-gray-600 text-center break-all">
                Code sent to <span className="font-semibold text-gray-800">{pendingEmail}</span>
              </p>
              <div>
                <Label htmlFor="code" className="text-gray-700 font-semibold">Verification code *</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(ev) => setVerificationCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 h-14 text-center text-2xl tracking-[0.5em] border-2 border-orange-300 focus:border-orange-500 font-mono"
                />
              </div>

              {verifyMutation.isError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">
                    {getApiErrorMessage(verifyMutation.error, 'Verification failed. Check the code and try again.')}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg"
                disabled={verifyMutation.isPending || verificationCode.replace(/\D/g, '').length !== 6}
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Confirm email'}
              </Button>

              <div className="flex flex-col items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={resending}
                  onClick={() => void handleResend()}
                >
                  {resending ? 'Sending...' : 'Resend code'}
                </Button>
                {resendHint && <p className="text-xs text-gray-600 text-center">{resendHint}</p>}
              </div>

              <div className="text-center pt-4 border-t-2 border-orange-200">
                <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold underline text-sm">
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: RegisterFormData) => {
    if (!faceDescriptors || faceDescriptors.length < 3) {
      setFaceError('Verify your face: capture three samples below using your camera.');
      return;
    }
    setFaceError(null);

    if (selectedRole === 'seller') {
      if (!passportMain || !passportReg || !selfie) {
        setDocError('Please upload all required documents: passport (2 pages) and selfie.');
        return;
      }
    }
    setDocError(null);
    registerMutation.mutate({
      ...data,
      faceDescriptors,
      passportMain: passportMain?.file,
      passportRegistration: passportReg?.file,
      selfie: selfie?.file,
    } as any);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 px-4 py-12">
      <div className="w-full max-w-lg mb-6">
        <Link href="/">
          <Button variant="ghost" className="text-orange-600 hover:bg-orange-100 font-bold gap-2 min-h-[48px]">
            ← Back to Home
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-4 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white">
          <div className="flex justify-center mb-2"><UserPlus className="h-12 w-12" /></div>
          <CardTitle className="text-3xl text-center">Create Account</CardTitle>
          <p className="text-center text-orange-100 mt-2">Join us to start ordering!</p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['customer', 'seller'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue('role', role)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role
                      ? role === 'customer'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md scale-105'
                        : 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                    selectedRole === role
                      ? role === 'customer' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <span className="font-bold capitalize">{role}</span>
                  <input type="radio" value={role} {...registerField('role')} className="hidden" />
                </button>
              ))}
            </div>

            {/* Basic fields */}
            <div>
              <Label htmlFor="name" className="text-gray-700 font-semibold">Name *</Label>
              <Input id="name" {...registerField('name')} placeholder="John Doe"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">Email *</Label>
              <Input id="email" type="email" {...registerField('email')} placeholder="you@example.com"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold">Password *</Label>
              <Input id="password" type="password" {...registerField('password')} placeholder="••••••••"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500" />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" {...registerField('confirmPassword')} placeholder="••••••••"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500" />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone (Optional)</Label>
              <Input id="phone" type="tel" {...registerField('phone')} placeholder="+1 (555) 123-4567"
                className="mt-1 h-12 border-2 border-orange-300 focus:border-orange-500" />
            </div>

            {/* Face verification — required for all new accounts */}
            <div className="mt-6 space-y-3 border-t-2 border-orange-200 pt-5">
              <div className="flex items-center gap-2 text-orange-800">
                <UserPlus className="h-5 w-5" />
                <h3 className="font-bold text-base">Face verification *</h3>
              </div>
              <p className="text-xs text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                Capture three samples (look at the camera, tap Capture each time). This enables signing in with your face on the login page. Uses your browser only — demo-grade security.
              </p>
              {faceError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{faceError}</p>
                </div>
              )}
              <FaceScanner
                key={selectedRole}
                sampleTarget={3}
                disabled={registerMutation.isPending}
                onComplete={(samples) => {
                  setFaceDescriptors(samples);
                  setFaceError(null);
                }}
              />
              {faceDescriptors && faceDescriptors.length >= 3 && (
                <p className="text-sm font-medium text-green-700 text-center">
                  ✓ Face samples captured — you can submit the form.
                </p>
              )}
            </div>

            {/* Seller documents */}
            {selectedRole === 'seller' && (
              <div className="mt-6 space-y-5 border-t-2 border-blue-100 pt-5">
                <div className="flex items-center gap-2 text-blue-700">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-bold text-base">Identity Verification Documents</h3>
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  To register as a seller, you must upload your passport (2 pages) and a selfie. These documents will be reviewed by an admin before your account is approved.
                </p>

                <DocUpload
                  label="Passport — Main Page"
                  hint="Photo of the main page with your photo and personal data"
                  value={passportMain}
                  onChange={setPassportMain}
                  required
                />
                <DocUpload
                  label="Passport — Registration Page"
                  hint="Photo of the page with your registration/address"
                  value={passportReg}
                  onChange={setPassportReg}
                  required
                />
                <DocUpload
                  label="Selfie with Passport"
                  hint="A photo of you holding your passport open to the main page"
                  value={selfie}
                  onChange={setSelfie}
                  required
                />

                {docError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{docError}</p>
                  </div>
                )}
              </div>
            )}

            {registerMutation.isError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 text-center">
                  {getApiErrorMessage(registerMutation.error, 'Registration failed. Please try again.')}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
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
