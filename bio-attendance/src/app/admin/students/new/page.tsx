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
import useGetAllPrograms from "@/hooks/useGetAllPrograms";

const StudentRegistrationPage = () => {

  const registerStudent = useMutation(api.students.registerWithFace)
  const generateUploadUrl = useAction(api.uploads.generateUploadUrl)
  const { programs, loading: programsLoading } = useGetAllPrograms();

  const [studentId, setStudentId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [programId, setProgramId] = useState<Id<"programs"> | null>(null)
  const [gender, setGender] = useState("")
  const [courseUnits, setCourseUnits] = useState<string[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [photoStorageIds, setPhotoStorageIds] = useState<Id<"_storage">[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<{ status: "idle" | "success" | "error"; message?: string }>({
    status: "idle",
  })

  // Fetch course units for the selected program
  const courseUnitsForProgram = useQuery(
    api.programs.getCourseUnitsByProgram,
    programId ? { programId } : "skip"
  );

  // Get the selected program's name for saving
  const selectedProgram = programs?.find(p => p._id === programId);

  const MAX_PHOTOS = 5

  // Handle program change - clear selected course units when program changes
  const handleProgramChange = (newProgramId: string) => {
    setProgramId(newProgramId as Id<"programs">);
    setCourseUnits([]); // Clear course units when program changes
  };

  // Toggle course unit selection
  const toggleCourseUnit = (courseCode: string) => {
    setCourseUnits(prev => 
      prev.includes(courseCode)
        ? prev.filter(code => code !== courseCode)
        : [...prev, courseCode]
    );
  };

  const removeCourseUnit = (unit: string) => {
    setCourseUnits((prev) => prev.filter((item) => item !== unit))
  }

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Convert FileList to array and limit to remaining slots
    const newFiles = Array.from(files).slice(0, MAX_PHOTOS - selectedFiles.length)
    
    if (newFiles.length === 0) {
      setSubmitState({ status: "error", message: `Maximum ${MAX_PHOTOS} photos allowed` })
      return
    }

    // Add new files to existing selection
    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, MAX_PHOTOS))
    
    // Create previews for new files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setPhotoPreviews(prev => [...prev, ...newPreviews].slice(0, MAX_PHOTOS))
  }

  const removePhoto = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(photoPreviews[index])
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    setPhotoStorageIds(prev => prev.filter((_, i) => i !== index))
  }

  const {start} = embedImage();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    // Validate at least one photo
    if (selectedFiles.length === 0) {
      setSubmitState({ status: "error", message: "Please upload at least one photo" })
      setIsSubmitting(false)
      return
    }

    // Generate embeddings from the first photo
    const firstFile = selectedFiles[0]
    const photoembeddings = await start(firstFile).then((res) => {
      console.log("Embeddings generated:", res?.descriptor);
      const descriptor = res?.descriptor;
      return Array.isArray(descriptor?.[0]) 
        ? (descriptor as number[][])[0]
        : (descriptor as number[] | undefined);
    })

    let uploadedStorageIds: Id<"_storage">[] = []

    try {
      setUploadingPhoto(true)
      
      // Upload all selected photos
      const uploadPromises = selectedFiles.map(async (file) => {
        const uploadUrl = await generateUploadUrl()
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
        
        const { storageId } = await response.json()
        return storageId as Id<"_storage">
      })

      uploadedStorageIds = await Promise.all(uploadPromises)
      setPhotoStorageIds(uploadedStorageIds)
      console.log(`Successfully uploaded ${uploadedStorageIds.length} photos`)
    } catch (err) {
      console.error(err)
      setSubmitState({ status: "error", message: "Photo upload failed" })
      setIsSubmitting(false)
      return
    } finally {
      setUploadingPhoto(false)
    }

    try {
      setSubmitState({ status: "idle" })
      
      await registerStudent({
        studentId: studentId.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim() ,
        program: selectedProgram?.name ?? "",
        gender: gender || undefined,
        courseUnits,
        photoDataUrl: undefined,
        photoStorageId: uploadedStorageIds.length > 0 ? uploadedStorageIds : undefined,
        photoEmbeddings: photoembeddings ?? undefined,
      }).then((res) => {
        if (!res.success) {
                  console.error(res.message)
                  setSubmitState({ status: "error", message: res.message?? "Unable to save student" })
                    return;
        }
        setSubmitState({ status: "success", message: "Student profile saved successfully!" })
      setStudentId("")
      setFirstName("")
      setMiddleName("")
      setLastName("")
      setEmail("")
      setProgramId(null)
      setGender("")
      setCourseUnits([])
      setPhotoPreviews([])
      setSelectedFiles([])
      setPhotoStorageIds([])
      })
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
                    Program <span className="text-red-500">*</span>
                  </Label>
                    <Select value={programId ?? ""} onValueChange={handleProgramChange} >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs && programs.map((prog) => (
                        <SelectItem key={prog._id} value={prog._id}>{prog.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                  <CardDescription>
                    {programId 
                      ? "Select the course units the student is enrolled in"
                      : "Please select a program first to see available course units"
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!programId ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>Select a program to view available course units</span>
                </div>
              ) : courseUnitsForProgram === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading course units...</span>
                </div>
              ) : courseUnitsForProgram.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>No course units found for this program</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Course Units Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {courseUnitsForProgram.map((unit) => {
                      const isSelected = courseUnits.includes(unit.code);
                      return (
                        <div
                          key={unit._id}
                          role="button"
                          tabIndex={0}
                          className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                            isSelected ? "border-primary bg-primary/5" : "border-gray-200"
                          }`}
                          onClick={() => toggleCourseUnit(unit.code)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleCourseUnit(unit.code);
                            }
                          }}
                        >
                          {/* Custom checkbox visual */}
                          <div
                            className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input bg-transparent"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-foreground">
                              {unit.code}
                            </span>
                            <p className="text-xs text-muted-foreground truncate" title={unit.name}>
                              {unit.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {unit.semester}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Course Units Summary */}
                  {courseUnits.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Selected course units ({courseUnits.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {courseUnits.map((unit) => (
                          <span
                            key={unit}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                          >
                            {unit}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCourseUnit(unit);
                              }}
                              className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Camera className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Student Photos</CardTitle>
                    <CardDescription>Upload up to {MAX_PHOTOS} clear photos for better face recognition</CardDescription>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {photoPreviews.length}/{MAX_PHOTOS} photos
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Upload Area */}
                {photoPreviews.length < MAX_PHOTOS && (
                  <label
                    htmlFor="photo-upload"
                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-6 transition-colors hover:border-primary/50 hover:bg-muted/40"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      Click to upload photos ({MAX_PHOTOS - photoPreviews.length} remaining)
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB each • Select multiple files</p>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple={true}
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Photo Previews Grid */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={preview}
                          alt={`Student photo ${index + 1}`}
                          width={120}
                          height={120}
                          unoptimized
                          className="h-28 w-full rounded-lg object-cover shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                          {index + 1}
                        </div>
                        {index === 0 && (
                          <div className="absolute bottom-1 right-1 rounded bg-primary px-1.5 py-0.5 text-xs text-white">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadingPhoto && (
                  <div className="flex items-center justify-center gap-3 rounded-lg bg-blue-50 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading {selectedFiles.length} photo(s)...</p>
                  </div>
                )}

                {/* Helper Text */}
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Upload photos from different angles for better face recognition accuracy. 
                  The first photo will be used to generate face embeddings.
                </p>
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
