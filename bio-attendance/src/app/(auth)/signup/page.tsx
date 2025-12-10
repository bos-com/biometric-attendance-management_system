"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useState } from "react"
import  useCreateLecturer  from "@/hooks/useLecturer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Lock, AlertCircle, Loader2, GraduationCap, CheckCircle2, BookOpen, AlertTriangle, Check } from "lucide-react"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const SignupPage = () => {
  const router = useRouter()
  const { createLecturer} = useCreateLecturer()
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    staffId: "",
    password: "",
    confirmPassword: "",
  })
  const [selectedProgramId, setSelectedProgramId] = useState<Id<"programs"> | null>(null)
  const [selectedCourseUnits, setSelectedCourseUnits] = useState<Id<"course_units">[]>([])
  const [error, setError] = useState<string | null>(null)
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Fetch programs and course units
  const programs = useQuery(api.programs.getAllPrograms)
  const courseUnitsWithLecturer = useQuery(
    api.programs.getCourseUnitsWithLecturerInfo,
    selectedProgramId ? { programId: selectedProgramId } : {}
  )

  // Update conflict warnings when course units selection changes
  useEffect(() => {
    if (courseUnitsWithLecturer) {
      const warnings = courseUnitsWithLecturer
        .filter(unit => selectedCourseUnits.includes(unit._id) && unit.isAssigned)
        .map(unit => `"${unit.name}" is currently assigned to ${unit.assignedLecturerName}`)
      setConflictWarnings(warnings)
    }
  }, [selectedCourseUnits, courseUnitsWithLecturer])

  const handleCourseUnitToggle = (unitId: Id<"course_units">) => {
    setSelectedCourseUnits(prev => 
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!formState.staffId.trim()) {
      setError("Staff ID is required")
      return
    }

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
        staffId: formState.staffId.trim(),
        password: formState.password,
        courseUnitIds: selectedCourseUnits.length > 0 ? selectedCourseUnits : undefined,
      }).then((res) => {
        if (!res.success) {
                throw new Error(res.message)
        }
        router.push("/admin/sessions")
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
    <main className="flex h-screen w-full md:my-0    ">
      <div className="flex mx-auto  h-full flex-col md:flex-row w-full  ">
       {/* Left Panel - Branding */}
      <div className="hidden items-center lg:flex lg:w-1/2  bg-primary flex-col justify-between md:p-12 text-primary-foreground">
        <div className="flex items-center" >
          <div className="flex items-center gap-3">
            <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-primary-foreground/10">
            <Image src="/logo.png" width={500} height={500} alt="logo"  />
              {/* <GraduationCap className="h-7 w-7" /> */}
            </div>
          </div>
        </div>

        <div className="space-y-1">
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
         <p className="text-center text-sm text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="font-medium text-white hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-white hover:underline">
                  Privacy Policy
                </Link>
              </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2  items-center justify-center bg-background py-6">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm py-2 ">
          <CardHeader className="space-y-1 pb-1">
            <div className="flex lg:hidden items-center gap-2 mb-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Image src="/logo.png" width={500} height={500} alt="logo"  />
                {/* <GraduationCap className="h-5 w-5 text-primary-foreground" /> */}
              </div>
              <span className="text-xl text-red-500 font-bold">Bugema University</span>
            </div>
            <CardTitle className="text-2xl items-center font-bold">Create your account</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-1">
              {error && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
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

              <div className="space-y-1">
                <Label htmlFor="staffId">Staff ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="staffId"
                    type="text"
                    required
                    placeholder="BUG/STAFF/1234"
                    value={formState.staffId}
                    onChange={(event) => setFormState((prev) => ({ ...prev, staffId: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
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

              {/* Program Selection */}
              <div className="space-y-1">
                <Label htmlFor="program">Program (Optional)</Label>
                <Select
                  value={selectedProgramId || ""}
                  onValueChange={(value) => {
                    setSelectedProgramId(value ? (value as Id<"programs">) : null)
                    setSelectedCourseUnits([]) // Reset course units when program changes
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a program to filter course units" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs?.map((program) => (
                      <SelectItem key={program._id} value={program._id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Units Selection */}
              <div className="space-y-1">
                <Label>Course Units You Teach (Optional)</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-1">
                  {courseUnitsWithLecturer && courseUnitsWithLecturer.length > 0 ? (
                    courseUnitsWithLecturer.map((unit) => (
                      <div
                        key={unit._id}
                        className={`flex items-start space-x-2 p-2 rounded-md ${
                          unit.isAssigned ? "bg-amber-50 border border-amber-200" : "hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox
                          id={unit._id}
                          checked={selectedCourseUnits.includes(unit._id)}
                          onCheckedChange={() => handleCourseUnitToggle(unit._id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={unit._id}
                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                          >
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            {unit.code} - {unit.name}
                          </label>
                          {unit.isAssigned && (
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              Currently assigned to {unit.assignedLecturerName}
                            </p>
                          )}
                          {!unit.isAssigned && (
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                              <Check className="h-3 w-3" />
                              Currently assigned to no one
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      {selectedProgramId ? "No course units found for this program" : "Select a program to view course units"}
                    </p>
                  )}
                </div>
                {selectedCourseUnits.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCourseUnits.length} course unit(s) selected
                  </p>
                )}
              </div>

              {/* Conflict Warnings */}
              {conflictWarnings.length > 0 && (
                <Alert className="border-amber-500/50 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <p className="font-medium mb-1">Warning: Some course units are already assigned</p>
                    <ul className="list-disc list-inside text-sm">
                      {conflictWarnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2">
                      Proceeding will reassign these course units to you.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
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

              <div className="space-y-1">
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
