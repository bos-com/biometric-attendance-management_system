"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import useLecturer from "@/hooks/useLecturer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, AlertCircle, Loader2, GraduationCap, CheckCircle2 } from "lucide-react"

const SigninPage = () => {
  const router = useRouter()
  const { authLecturer } = useLecturer()
  const [formState, setFormState] = useState({ email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setError(null)
      setSubmitting(true)
      const result = await authLecturer(formState.email.trim(), formState.password)
      if (!result?.success) {
        setError(result?.message || "Invalid credentials")
        setSubmitting(false)
        return
      }
      router.push("/admin/sessions")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setSubmitting(false)
    }
  }

  const features = [
    "Track student attendance in real-time",
    "Generate detailed attendance reports",
    "Manage multiple classes effortlessly",
    "Secure and reliable platform",
  ]

  return (
    <main className="flex min-h-screen w-full">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <div>
          <div className="flex items-center gap-3">
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
              <GraduationCap className="h-7 w-7" />
            </div> */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                            <Image src="/logo.png" width={500} height={500} alt="logo"  />
                            {/* <GraduationCap className="h-5 w-5 text-primary-foreground" /> */}
                          </div>
            <span className="text-2xl font-bold">Bugema University</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Welcome back,
              <br />
              educator
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Sign in to continue managing your classroom attendance with ease.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-primary-foreground/90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-foreground/60">Trusted by 10,000+ educators worldwide</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ClassRoom</span>
            </div>
            <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
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
                    placeholder="john.smith@university.edu"
                    value={formState.email}
                    onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={formState.password}
                    onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-base">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                New to the platform?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default SigninPage
