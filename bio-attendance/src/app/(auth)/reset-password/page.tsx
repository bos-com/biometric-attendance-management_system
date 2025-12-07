"use client"

import Link from "next/link"
import Image from "next/image"
import { type FormEvent, useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAction, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Lock, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  CheckCircle2, 
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  XCircle
} from "lucide-react"

const ResetPasswordContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Validate the token on page load
  const tokenValidation = useQuery(api.lecturers.validateResetToken, 
    token ? { token } : "skip"
  )

  const resetPasswordWithToken = useAction(api.lecturers.resetPasswordWithToken)

  // Password strength checks
  const passwordChecks = {
    length: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!isPasswordStrong) {
      setError("Please ensure your password meets all requirements")
      return
    }

    if (!passwordsMatch) {
      setError("Passwords do not match")
      return
    }

    setSubmitting(true)

    try {
      const result = await resetPasswordWithToken({ 
        token, 
        newPassword: password 
      })

      if (!result.success) {
        setError(result.message || "Failed to reset password")
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Redirect to sign in after successful reset
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/signin")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  // Show success message FIRST (before token validation check)
  // This prevents the "token used" error from showing after successful reset
  if (success) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful!</CardTitle>
            <CardDescription className="mt-2">
              Your password has been reset successfully. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Alert className="border-blue-200 bg-blue-50">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Redirecting you to sign in page in 3 seconds...
              </AlertDescription>
            </Alert>

            <Link href="/signin" className="block pt-2">
              <Button className="w-full">
                Sign In Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Show loading state while validating token
  if (tokenValidation === undefined) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Show error if token is invalid or expired
  if (!tokenValidation?.valid) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-red-50 via-white to-orange-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
            <CardDescription className="mt-2">
              {tokenValidation?.message || "This password reset link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Password reset links expire after 30 minutes for security reasons.
              </AlertDescription>
            </Alert>

            <div className="pt-4 space-y-3">
              <Link href="/forgot-password" className="block">
                <Button className="w-full">
                  Request a New Reset Link
                </Button>
              </Link>
              
              <Link href="/signin" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen w-full">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Image src="/logo.png" width={500} height={500} alt="logo" />
            </div>
            <span className="text-2xl font-bold">Bugema University</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Create a new
              <br />
              password
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          <div className="p-6 bg-primary-foreground/10 rounded-xl">
            <h3 className="font-semibold mb-3">Password tips</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                Use at least 8 characters with a mix of letters, numbers, and symbols
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                Avoid using personal information like your name or birthday
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                Don't reuse passwords from other accounts
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          Need help? Contact support@bugema.edu
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Bugema University</span>
            </div>
            <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it's strong and unique.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Password requirements:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-2 ${passwordChecks.length ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.length ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.hasUppercase ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.hasUppercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.hasLowercase ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.hasLowercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.hasNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      One number
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`text-xs flex items-center gap-1.5 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={submitting || !isPasswordStrong || !passwordsMatch} 
                className="w-full h-11 text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <Link 
                href="/signin" 
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

export default ResetPasswordPage
