# BCATS User Manual
## Bugema University Biometric Class Attendance Tracking System

**Version 1.0**  
**Last Updated: December 2025**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Getting Started](#3-getting-started)
   - 3.1 [Creating an Account](#31-creating-an-account)
   - 3.2 [Logging In](#32-logging-in)
   - 3.3 [Forgot Password](#33-forgot-password)
4. [Dashboard Overview](#4-dashboard-overview)
5. [Managing Students](#5-managing-students)
   - 5.1 [Registering New Students](#51-registering-new-students)
   - 5.2 [Viewing Student List](#52-viewing-student-list)
   - 5.3 [Managing Face Embeddings](#53-managing-face-embeddings)
6. [Managing Sessions](#6-managing-sessions)
   - 6.1 [Creating a Session](#61-creating-a-session)
   - 6.2 [Starting a Session](#62-starting-a-session)
   - 6.3 [Closing a Session](#63-closing-a-session)
   - 6.4 [Editing Sessions](#64-editing-sessions)
   - 6.5 [Deleting Sessions](#65-deleting-sessions)
7. [Taking Attendance](#7-taking-attendance)
   - 7.1 [Face Recognition Attendance](#71-face-recognition-attendance)
   - 7.2 [Understanding Attendance Status](#72-understanding-attendance-status)
8. [Viewing Reports](#8-viewing-reports)
   - 8.1 [Session Reports](#81-session-reports)
   - 8.2 [Course Unit Statistics](#82-course-unit-statistics)
9. [Profile Management](#9-profile-management)
10. [Troubleshooting](#10-troubleshooting)
11. [FAQs](#11-faqs)

---

## 1. Introduction

Welcome to **BCATS** (Bugema University Biometric Class Attendance Tracking System). This system uses advanced facial recognition technology to automate student attendance tracking, making the process faster, more accurate, and fraud-resistant.

### Key Features:
- ✅ **Biometric Face Recognition** - Automatically identify students using facial features
- ✅ **Real-time Attendance** - Instant attendance marking during live sessions
- ✅ **Session Management** - Create, schedule, and manage class sessions
- ✅ **Comprehensive Reports** - View detailed attendance statistics and trends
- ✅ **Multi-photo Support** - Register students with multiple face photos for better accuracy
- ✅ **Course Unit Management** - Organize sessions by course units

---

## 2. System Requirements

### Browser Requirements:
| Browser | Minimum Version |
|---------|-----------------|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Microsoft Edge | 90+ |
| Safari | 14+ |

### Hardware Requirements:
- **Camera**: Built-in or external webcam with at least 720p resolution
- **Internet**: Stable internet connection (minimum 2 Mbps)
- **Display**: Minimum 1280x720 screen resolution

### Permissions Required:
- Camera access (for face recognition)
- JavaScript enabled

---

## 3. Getting Started

### 3.1 Creating an Account

To create a new lecturer account:

1. Navigate to the BCATS homepage
2. Click on **"Create your account"** or **"Sign up"**
3. Fill in the registration form:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Full Name** | Your complete name with title | Dr. John Smith |
   | **Staff ID** | Your university staff ID | BUG/STAFF/1234 |
   | **Work Email** | Your official university email | john.smith@bugemauniv.ac.ug |
   | **Program** | Select your department's program (optional) | Bachelor of Computer Science |
   | **Course Units** | Select course units you teach (optional) | CS101, CS202 |
   | **Password** | Create a strong password (min 6 characters) | ******** |
   | **Confirm Password** | Re-enter your password | ******** |

4. Click **"Create account"**
5. You will be redirected to the dashboard upon successful registration

> ⚠️ **Note**: If a course unit is already assigned to another lecturer, you will see a warning message. Proceeding will reassign that course unit to you.

---

### 3.2 Logging In

1. Go to the BCATS login page
2. Enter your **Work Email**
3. Enter your **Password**
4. Click **"Sign in"**

![Login Process](images/login-placeholder.png)

---

### 3.3 Forgot Password

If you forgot your password:

1. Click **"Forgot password?"** on the login page
2. Enter your registered email address
3. Click **"Send Reset Link"**
4. Check your email for the password reset link
5. Click the link in the email (valid for 1 hour)
6. Enter your new password
7. Click **"Reset Password"**

> ✅ You will receive a success message once your password is reset. You can now log in with your new password.

---

## 4. Dashboard Overview

After logging in, you will see the main dashboard with the following sections:

### Dashboard Layout:

```
┌─────────────────────────────────────────────────────────────┐
│  BCATS Logo    │  Dashboard  Sessions  Students  Profile    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Total   │  │ Total   │  │ Average │  │ Live    │        │
│  │Sessions │  │Students │  │Attend.  │  │Sessions │        │
│  │   12    │  │   156   │  │  87%    │  │    2    │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sessions List                                       │   │
│  │  [All] [Scheduled] [Live] [Closed]                  │   │
│  │                                                      │   │
│  │  Session 1 - CS101 - Room A101 - 9:00 AM           │   │
│  │  Session 2 - CS202 - Room B205 - 11:00 AM          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Menu:

| Menu Item | Description |
|-----------|-------------|
| **Dashboard** | Overview with statistics and quick access |
| **Sessions** | Manage attendance sessions |
| **Students** | View and register students |
| **Attendance** | View attendance records and reports |
| **Profile** | Manage your account settings |

---

## 5. Managing Students

### 5.1 Registering New Students

To register a new student with facial recognition:

1. Navigate to **Students** → **Add New Student**
2. Fill in the student information:

   **Personal Information:**
   | Field | Required | Description |
   |-------|----------|-------------|
   | Student ID | ✅ Yes | Unique student ID (e.g., BUG/BCS/2023/001) |
   | First Name | ✅ Yes | Student's first name |
   | Middle Name | ❌ No | Student's middle name (optional) |
   | Last Name | ✅ Yes | Student's last name |
   | Gender | ❌ No | Male/Female |
   | Email | ✅ Yes | Student's email address |
   | Program | ✅ Yes | Select from available programs |
   | Course Units | ✅ Yes | Enter course codes the student is enrolled in |

3. **Upload Face Photos** (for biometric registration):
   - Click **"Upload Photos"** or drag and drop images
   - Upload **up to 5 photos** for better recognition accuracy
   - Tips for good photos:
     - ✅ Clear, well-lit face
     - ✅ Different angles (front, slight left, slight right)
     - ✅ No sunglasses or face coverings
     - ✅ Neutral expression
     - ❌ Avoid blurry or dark images

4. Click **"Register Student"**

> 💡 **Tip**: Multiple photos improve recognition accuracy. We recommend uploading at least 3 photos from different angles.

---

### 5.2 Viewing Student List

1. Navigate to **Students** from the main menu
2. View the list of all registered students
3. Use the **Search** bar to find specific students
4. Filter students by:
   - Program
   - Course Unit
   - Registration Date

**Student List Columns:**
| Column | Description |
|--------|-------------|
| Photo | Student's profile photo |
| Student ID | Unique identifier |
| Name | Full name |
| Program | Enrolled program |
| Course Units | Number of enrolled courses |
| Actions | View, Edit, Delete options |

---

### 5.3 Managing Face Embeddings

Face embeddings are the biometric data used for recognition. To update a student's face data:

1. Go to **Students** → Select a student
2. Click **"Manage Embeddings"** or **"Update Photos"**
3. Add new photos or remove existing ones
4. Click **"Update Embeddings"**

> ⚠️ **Important**: After updating photos, the system will recalculate the facial embeddings. This may take a few moments.

---

## 6. Managing Sessions

### 6.1 Creating a Session

1. Navigate to **Sessions**
2. Click **"+ Create Session"** button
3. Fill in the session details:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Session Title** | Descriptive name | "Week 5 - Database Design" |
   | **Course Unit** | Select from your course units | CS201 - Database Systems |
   | **Date & Start Time** | When the session begins | Dec 9, 2025, 9:00 AM |
   | **Date & End Time** | When the session ends | Dec 9, 2025, 11:00 AM |
   | **Location** | Room or venue | Room A101, Block B |
   | **Description** | Additional notes (optional) | "Covering ER Diagrams" |

4. **Optional Settings:**
   - ☑️ **Auto Start**: Session starts automatically at scheduled time
   - ☑️ **Auto Close**: Session closes automatically at end time

5. Click **"Create Session"**

---

### 6.2 Starting a Session

When it's time to take attendance:

**Method 1: Manual Start**
1. Go to **Sessions**
2. Find the scheduled session
3. Click the **▶ Start** button
4. The session status changes to **🟢 Live**

**Method 2: Automatic Start**
- If you enabled "Auto Start" when creating the session, it will automatically start at the scheduled time

> 📌 **Note**: Only **Live** sessions can receive attendance records.

---

### 6.3 Closing a Session

After the class ends:

1. Go to **Sessions**
2. Find the live session
3. Click the **⏹ End Session** button
4. The session status changes to **⚫ Closed**

> ⚠️ **Important**: Once a session is closed, no more attendance can be marked.

---

### 6.4 Editing Sessions

To modify a session (only for scheduled sessions):

1. Go to **Sessions**
2. Click the **⋮** (three dots) menu on the session card
3. Select **"Edit"**
4. Modify the necessary fields
5. Click **"Save Changes"**

---

### 6.5 Deleting Sessions

To delete a session:

1. Go to **Sessions**
2. Click the **⋮** menu on the session card
3. Select **"Delete"**
4. Confirm the deletion in the dialog

> ⚠️ **Warning**: Deleting a session will also delete all associated attendance records. This action cannot be undone.

---

## 7. Taking Attendance

### 7.1 Face Recognition Attendance

BCATS uses real-time facial recognition to mark attendance:

**Step-by-Step Process:**

1. **Start the Session** (if not already live)

2. **Open the Camera Widget**
   - A floating camera widget appears on the screen
   - Or click **"Take Attendance"** → **"Use Camera"**

3. **Position Students in Front of Camera**
   - Students should stand 1-2 feet from the camera
   - Ensure good lighting (natural light works best)
   - Face should be clearly visible

4. **Automatic Recognition**
   - The system detects faces automatically
   - Matched students are displayed with their names
   - Attendance is marked instantly

5. **Verification**
   - A green checkmark ✅ indicates successful recognition
   - The student's name and status appear on screen
   - Confidence score shows match accuracy

**Recognition Process:**
```
Student approaches camera
        ↓
Face detected by system
        ↓
Face embedding extracted
        ↓
Compared with registered students
        ↓
Match found? → Mark Present ✅
        ↓
No match? → Display "Unknown Face"
```

---

### 7.2 Understanding Attendance Status

| Status | Icon | Description | Criteria |
|--------|------|-------------|----------|
| **Present** | 🟢 | Student attended on time | Marked within first 15 minutes of session |
| **Late** | 🟡 | Student arrived late | Marked after 15-minute grace period |
| **Absent** | 🔴 | Student did not attend | Not marked by session end |

**Grace Period:**
- The system uses a **15-minute grace period** from the session start time
- Students marked within this period are marked **"Present"**
- Students marked after this period are marked **"Late"**

---

## 8. Viewing Reports

### 8.1 Session Reports

To view attendance for a specific session:

1. Go to **Sessions**
2. Click on a session to open details
3. View the **Attendance List** showing:
   - Student name
   - Student ID
   - Status (Present/Late/Absent)
   - Time marked
   - Confidence score

**Export Options:**
- 📄 Download as PDF
- 📊 Export to Excel/CSV

---

### 8.2 Course Unit Statistics

View aggregate statistics for your course units:

1. Go to **Sessions** or **Attendance**
2. View the **Course Unit Cards** at the top showing:
   - Course code and name
   - Average attendance rate
   - Color-coded indicators:
     - 🟢 Green: 80%+ attendance
     - 🟡 Yellow: 60-79% attendance
     - 🔴 Red: Below 60% attendance

**Statistics Include:**
| Metric | Description |
|--------|-------------|
| Total Sessions | Number of sessions conducted |
| Average Attendance | Percentage of students attending |
| Present Count | Total present across all sessions |
| Late Count | Total late arrivals |
| Absent Count | Total absences |

---

## 9. Profile Management

### Accessing Your Profile

1. Click on **Profile** in the navigation menu
2. Or click your name/avatar in the top-right corner

### Profile Information

You can view and edit:
- Full Name
- Email Address
- Staff ID
- Profile Photo
- Password

### Changing Password

1. Go to **Profile**
2. Click **"Change Password"**
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click **"Update Password"**

### Logging Out

1. Click on your profile avatar
2. Select **"Log Out"**
3. You will be redirected to the login page

---

## 10. Troubleshooting

### Common Issues and Solutions

#### Camera Not Working

| Problem | Solution |
|---------|----------|
| Camera permission denied | Go to browser settings → Site Settings → Camera → Allow |
| Camera shows black screen | Close other apps using the camera, then refresh |
| Camera not detected | Check if camera is properly connected, try a different browser |

#### Face Recognition Issues

| Problem | Solution |
|---------|----------|
| Face not detected | Ensure good lighting, face the camera directly |
| Wrong student recognized | Update student photos with clearer images |
| "Unknown Face" showing | Student may not be registered, check student database |
| Low confidence score | Add more photos for the student |

#### Session Issues

| Problem | Solution |
|---------|----------|
| Cannot start session | Check if you're logged in as the session creator |
| Session not showing | Refresh the page, check filters |
| Cannot mark attendance | Ensure session is in "Live" status |

#### Login Issues

| Problem | Solution |
|---------|----------|
| Forgot password | Use "Forgot Password" link to reset |
| Account locked | Contact system administrator |
| Invalid credentials | Double-check email and password |

---

## 11. FAQs

### General Questions

**Q: How accurate is the facial recognition?**
> A: The system achieves 95%+ accuracy with good quality photos and proper lighting. Accuracy improves with multiple registered photos per student.

**Q: Can students mark attendance for each other?**
> A: No. The biometric facial recognition ensures that only the actual student can be marked present, preventing proxy attendance.

**Q: How many photos should I upload for each student?**
> A: We recommend 3-5 photos from different angles for optimal recognition accuracy.

---

### Session Questions

**Q: Can I edit a session after it has started?**
> A: No. Sessions can only be edited while in "Scheduled" status. Once a session is live or closed, it cannot be modified.

**Q: What happens if I forget to close a session?**
> A: If auto-close is enabled, the session closes automatically. Otherwise, you can manually close it at any time.

**Q: Can multiple sessions be live at the same time?**
> A: Yes. You can have multiple live sessions for different course units simultaneously.

---

### Attendance Questions

**Q: What is the grace period for being marked "Present" vs "Late"?**
> A: Students have a 15-minute grace period from the session start time. Anyone marked within this period is "Present"; after that, they're marked "Late".

**Q: Can I manually change an attendance status?**
> A: Currently, attendance is marked automatically through facial recognition. Contact your administrator for manual adjustments.

**Q: Can a student's attendance be marked multiple times?**
> A: No. Once a student is marked for a session, they cannot be marked again for the same session.

---

### Technical Questions

**Q: Which browsers are supported?**
> A: Chrome, Firefox, Edge, and Safari (latest versions). Chrome is recommended for best performance.

**Q: Does the system work offline?**
> A: No. An active internet connection is required for the system to function.

**Q: Is student data secure?**
> A: Yes. All data is encrypted in transit and at rest. Facial embeddings are stored securely and cannot be reverse-engineered to recreate face images.

---

## Quick Reference Card

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Create new session |
| `Ctrl + S` | Save current form |
| `Esc` | Close modal/dialog |
| `Enter` | Confirm action |

### Status Icons Reference

| Icon | Meaning |
|------|---------|
| 🟢 | Live session / Present |
| 🟡 | Late attendance |
| 🔴 | Absent / Error |
| 📅 | Scheduled |
| ⚫ | Closed |
| 🔄 | Loading/Processing |
| ✅ | Success |
| ⚠️ | Warning |
| ❌ | Error/Failed |

---

## Contact & Support

For technical support or inquiries:

- **Email**: support@bugemauniv.ac.ug
- **IT Help Desk**: Extension 1234
- **Office Hours**: Monday - Friday, 8:00 AM - 5:00 PM

---

**© 2025 Bugema University. All Rights Reserved.**

*BCATS - Biometric Class Attendance Tracking System*

