"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useState } from "react"
import  useCreateLecturer  from "@/hooks/useLecturer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Lock, AlertCircle, Loader2, GraduationCap, CheckCircle2 } from "lucide-react"

const SignupPage = () => {
  const router = useRouter()
  const { createLecturer} = useCreateLecturer()
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setError(null)
      setSubmitting(true)
      await createLecturer({
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        staffId: "",
        password: formState.password,
      }).then((res) => {
        if (!res.success) {
                throw new Error(res.message)
        }
        router.push("/attendance")
      });
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to create account")
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
    <main className="flex h-screen w-full md:my-0 md:p-12  ">
      <div className="flex mx-auto  h-full flex-col md:flex-row w-full  ">
       {/* Left Panel - Branding */}
      <div className="hidden items-center lg:flex lg:w-1/2 rounded-l-2xl bg-primary flex-col justify-between md:p-12 text-primary-foreground">
        <div className="flex items-center" >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">ClassRoom</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Bugema University Biometric 
              <br />
              Attendance Management
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Join thousands of educators who trust ClassRoom for seamless attendance tracking.
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
      <div className="flex w-full lg:w-1/2 rounded-r-2xl items-center justify-center bg-background ">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm  ">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ClassRoom</span>
            </div>
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
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
                <Label htmlFor="fullName">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    required
                    placeholder="Dr. John Smith"
                    value={formState.fullName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a strong password"
                    value={formState.password}
                    onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Re-enter your password"
                    value={formState.confirmPassword}
                    onChange={(event) => setFormState((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-base">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="font-medium text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>

            <div className=" pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signin" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div> 
      </div>
    </main>
  )
}

export default SignupPage
