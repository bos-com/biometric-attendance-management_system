"use client"

import Link from "next/link"
import Image from "next/image"
import { type FormEvent, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  CheckCircle2, 
  ArrowLeft,
  Send 
} from "lucide-react"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const createPasswordResetToken = useMutation(api.lecturers.createPasswordResetToken)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      // Create the reset token in the database
      const result = await createPasswordResetToken({ email: email.trim() })

      if (!result.success) {
        setError(result.message || "Failed to process request")
        setSubmitting(false)
        return
      }

      // If we got a token back, send the email via our API route
      if (result.token && result.lecturerEmail) {
        const emailResponse = await fetch("/api/send-reset-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: result.lecturerEmail,
            name: result.lecturerName,
            resetToken: result.token,
          }),
        })

        const emailResult = await emailResponse.json()

        if (!emailResult.success) {
          console.error("Email sending failed:", emailResult.message)
          // Still show success to user for security (don't reveal if email exists)
        }
      }

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="mt-2">
              If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                The link will expire in 30 minutes. Please check your spam folder if you don't see the email.
              </AlertDescription>
            </Alert>

            <div className="pt-4 space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
              >
                Try a different email
              </Button>
              
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
              Forgot your
              <br />
              password?
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              No worries! Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="p-6 bg-primary-foreground/10 rounded-xl">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ol className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-bold">1</span>
                Enter your registered email address
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-bold">2</span>
                We'll send you a password reset link
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-bold">3</span>
                Click the link and create a new password
              </li>
            </ol>
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
              Enter your email address and we'll send you a link to reset your password.
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
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="john.smith@bugema.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-base">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reset Link
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

export default ForgotPasswordPage
