"use client"

import Image from "next/image"
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react"
import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { embedImage } from "../Embeddings/embedImage"
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Camera,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Award as IdCard,
} from "lucide-react"

const StudentRegistrationPage = () => {
  const classes = useQuery(api.classes.list, {})
  const registerStudent = useMutation(api.students.registerWithFace)
  const generateUploadUrl = useAction(api.uploads.generateUploadUrl)

  const [studentId, setStudentId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [program, setProgram] = useState("")
  const [gender, setGender] = useState("")
  const [courseUnitInput, setCourseUnitInput] = useState("")
  const [courseUnits, setCourseUnits] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<Id<"classes">[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage">[] | null>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<{ status: "idle" | "success" | "error"; message?: string }>({
    status: "idle",
  })

  const classOptions = useMemo<Doc<"classes">[]>(() => classes ?? [], [classes])

  const handleAddCourseUnit = () => {
    const trimmed = courseUnitInput.trim()
    if (!trimmed || courseUnits.includes(trimmed)) return
    setCourseUnits((prev) => [...prev, trimmed])
    setCourseUnitInput("")
  }

  const removeCourseUnit = (unit: string) => {
    setCourseUnits((prev) => prev.filter((item) => item !== unit))
  }

  const toggleClassSelection = (classId: Id<"classes">) => {
    setSelectedClasses((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]))
  }

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
  }

  const {start} = embedImage();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let file: File | null = null
    if (photoPreview) {
      const response = await fetch(photoPreview)
      const blob = await response.blob()
      file = new File([blob], "photo.jpg", { type: blob.type })
    }
    const photoembeddings = file && await start(file).then((res) => {
        console.log("Embeddings generated:", res?.descriptor);
        const descriptor = res?.descriptor;
      return Array.isArray(descriptor?.[0]) 
        ? (descriptor as number[][])[0]
           : (descriptor as number[] | undefined);
    })

    try {
      setUploadingPhoto(true)
      const uploadUrl = await generateUploadUrl()
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file?.type || "application/octet-stream" },
        body: file,
      })
      if (!response.ok) {
        throw new Error("Upload failed")
      }
      const { storageId } = await response.json()
      setPhotoStorageId([storageId as Id<"_storage">])
    } catch (err) {
      console.error(err)
      setSubmitState({ status: "error", message: "Photo upload failed" })
    } finally {
      setUploadingPhoto(false)
    }

    try {
      setSubmitState({ status: "idle" })
      setIsSubmitting(true)
      await registerStudent({
        studentId: studentId.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        program: program.trim() || undefined,
        gender: gender || undefined,
        courseUnits,
        classIds: selectedClasses,
        photoDataUrl: undefined,
        photoStorageId: photoStorageId ?? undefined,
        photoEmbeddings:photoembeddings??undefined,
      }).then((res) => {
        if (!res.success) {
                  console.error(res.message)
                  setSubmitState({ status: "error", message: res.message?? "Unable to save student" })
                    setTimeout(()=>{
                        setSubmitState({ status: "idle",})
                    },5000)
                    return;
        }
      })
      setSubmitState({ status: "success", message: "Student profile saved successfully!" })
      setStudentId("")
      setFirstName("")
      setMiddleName("")
      setLastName("")
      setEmail("")
      setProgram("")
      setGender("")
      setCourseUnits([])
      setSelectedClasses([])
      setPhotoPreview(null)
      setPhotoStorageId(null)
    } catch (err) {
      console.error(err)
    } finally {
        setTimeout(()=>{
         setSubmitState({ status: "idle" })
     },5000)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="h-full overflow-y-auto items-center bg-linear-to-br from-green-100 via-white to-blue-100 p-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Registration</h1>
          <p className="mt-2 text-muted-foreground">
            Collect biodata, course units, and profile photo for student enrollment
          </p>
        </div>

        {/* Status Alerts */}
        {submitState.status === "success" && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{submitState.message}</AlertDescription>
          </Alert>
        )}
        {submitState.status === "error" && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{submitState.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Basic details about the student</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    Student ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}
                    required
                    placeholder="e.g. STU-2024-001"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    Program
                  </Label>
                  <Input
                    id="program"
                    value={program}
                    onChange={(event) => setProgram(event.target.value)}
                    placeholder="e.g. BSc Computer Science"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    placeholder="Enter first name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={middleName}
                    onChange={(event) => setMiddleName(event.target.value)}
                    placeholder="Enter middle name (optional)"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    placeholder="Enter last name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="student@university.edu"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 sm:max-w-xs">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Units */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Course Units</CardTitle>
                  <CardDescription>Add course units the student is enrolled in</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Input
                  value={courseUnitInput}
                  onChange={(event) => setCourseUnitInput(event.target.value)}
                  placeholder="e.g. CSC2104"
                  className="h-11 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCourseUnit()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCourseUnit}
                  className="h-11 gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Unit
                </Button>
              </div>

              {courseUnits.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {courseUnits.map((unit) => (
                    <span
                      key={unit}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                    >
                      {unit}
                      <button
                        type="button"
                        onClick={() => removeCourseUnit(unit)}
                        className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Assignment */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Class Assignment</CardTitle>
                  <CardDescription>Select classes to enroll the student</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {classOptions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 py-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No classes have been created yet.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {classOptions.map((klass) => (
                    <label
                      key={klass._id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                        selectedClasses.includes(klass._id)
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30 hover:bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        checked={selectedClasses.includes(klass._id)}
                        onCheckedChange={() => toggleClassSelection(klass._id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-foreground">{klass.code}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{klass.title}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Camera className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Student Photo</CardTitle>
                  <CardDescription>Upload a clear photo for identification</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <label
                  htmlFor="photo-upload"
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-8 transition-colors hover:border-primary/50 hover:bg-muted/40 sm:flex-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">Click to upload photo</p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple={true}
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {(photoPreview || uploadingPhoto) && (
                  <div className="relative">
                    {uploadingPhoto ? (
                      <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                        <div className="text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                          <p className="mt-2 text-xs text-muted-foreground">Uploading...</p>
                        </div>
                      </div>
                    ) : photoPreview ? (
                      <div className="relative">
                        <Image
                          src={photoPreview || "/placeholder.svg"}
                          alt="Student preview"
                          width={160}
                          height={160}
                          unoptimized
                          className="h-40 w-40 rounded-xl object-cover shadow-md"
                        />
                        {photoStorageId && (
                          <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={uploadingPhoto || isSubmitting}
              className="h-12 min-w-[200px] gap-2 text-base font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Save Student Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default StudentRegistrationPage
