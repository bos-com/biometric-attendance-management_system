# BCATS System Diagrams

## 1. Entity Relationship Diagram (ERD)

### Mermaid ERD Syntax (for draw.io, GitHub, VS Code Preview)

```mermaid
erDiagram
    LECTURERS {
        id _id PK
        string fullName
        string email UK
        string role
        string passwordHash
        string staffId
    }
    
    PROGRAMS {
        id _id PK
        string program_code UK
        string name
        string description
        number createdAt
    }
    
    COURSE_UNITS {
        id _id PK
        string code UK
        string name
        string semester
        id programId FK
        id lecturerId FK
        number hours_per_session
    }
    
    STUDENTS {
        id _id PK
        string studentId UK
        string firstName
        string middleName
        string lastName
        string gender
        string program
        array courseUnits
        string email
        array photoDataUrl
        array photoStorageId
        array photoEmbeddings
        number createdAt
    }
    
    FACE_EMBEDDINGS {
        id _id PK
        id studentId FK
        array descriptor
        string version
        array studentImages
        number updatedAt
    }
    
    ATTENDANCE_SESSIONS {
        id _id PK
        string sessionId UK
        string courseUnitCode FK
        id lecturerId FK
        string sessionTitle
        string description
        number startsAt
        number endsAt
        string location
        enum status
        string notes
        boolean autoStart
        boolean autoClose
    }
    
    ATTENDANCE_RECORDS {
        id _id PK
        string courseUnitCode FK
        id sessionId FK
        id studentId FK
        number confidence
        enum status
    }
    
    LECTURER_SESSIONS {
        id _id PK
        id lecturerId FK
        string token UK
        number expiresAt
        number createdAt
    }
    
    PASSWORD_RESET_TOKENS {
        id _id PK
        id lecturerId FK
        string token UK
        number expiresAt
        number createdAt
        boolean used
    }

    LECTURERS ||--o{ COURSE_UNITS : "teaches"
    LECTURERS ||--o{ ATTENDANCE_SESSIONS : "conducts"
    LECTURERS ||--o{ LECTURER_SESSIONS : "has"
    LECTURERS ||--o{ PASSWORD_RESET_TOKENS : "requests"
    
    PROGRAMS ||--o{ COURSE_UNITS : "contains"
    
    STUDENTS ||--o| FACE_EMBEDDINGS : "has"
    STUDENTS ||--o{ ATTENDANCE_RECORDS : "has"
    
    ATTENDANCE_SESSIONS ||--o{ ATTENDANCE_RECORDS : "contains"
    COURSE_UNITS ||--o{ ATTENDANCE_SESSIONS : "has"
```

### PlantUML ERD Syntax (for StarUML, PlantUML tools)

```plantuml
@startuml BCATS_ERD

!define Table(name,desc) entity name as "desc" << (T,#FFAAAA) >>
!define PK(name) <u><b>name</b></u>
!define FK(name) <i>name</i>

skinparam linetype ortho
skinparam shadowing false

Table(lecturers, "LECTURERS") {
  PK(_id) : ObjectId
  --
  fullName : String
  email : String <<unique>>
  role : String
  passwordHash : String
  staffId : String
}

Table(programs, "PROGRAMS") {
  PK(_id) : ObjectId
  --
  program_code : String <<unique>>
  name : String
  description : String
  createdAt : Number
}

Table(course_units, "COURSE_UNITS") {
  PK(_id) : ObjectId
  --
  code : String <<unique>>
  name : String
  semester : String
  FK(programId) : ObjectId
  FK(lecturerId) : ObjectId
  hours_per_session : Number
}

Table(students, "STUDENTS") {
  PK(_id) : ObjectId
  --
  studentId : String <<unique>>
  firstName : String
  middleName : String
  lastName : String
  gender : String
  program : String
  courseUnits : Array<String>
  email : String
  photoDataUrl : Array<String>
  photoStorageId : Array<ObjectId>
  photoEmbeddings : Array<Float64>
  createdAt : Number
}

Table(face_embeddings, "FACE_EMBEDDINGS") {
  PK(_id) : ObjectId
  --
  FK(studentId) : ObjectId
  descriptor : Array<Float64>
  version : String
  studentImages : Array<ObjectId>
  updatedAt : Number
}

Table(attendance_sessions, "ATTENDANCE_SESSIONS") {
  PK(_id) : ObjectId
  --
  sessionId : String <<unique>>
  courseUnitCode : String
  FK(lecturerId) : ObjectId
  sessionTitle : String
  description : String
  startsAt : Number
  endsAt : Number
  location : String
  status : Enum(scheduled|live|closed)
  notes : String
  autoStart : Boolean
  autoClose : Boolean
}

Table(attendance_records, "ATTENDANCE_RECORDS") {
  PK(_id) : ObjectId
  --
  courseUnitCode : String
  FK(sessionId) : ObjectId
  FK(studentId) : ObjectId
  confidence : Number
  status : Enum(present|absent|late)
}

Table(lecturer_sessions, "LECTURER_SESSIONS") {
  PK(_id) : ObjectId
  --
  FK(lecturerId) : ObjectId
  token : String <<unique>>
  expiresAt : Number
  createdAt : Number
}

Table(password_reset_tokens, "PASSWORD_RESET_TOKENS") {
  PK(_id) : ObjectId
  --
  FK(lecturerId) : ObjectId
  token : String <<unique>>
  expiresAt : Number
  createdAt : Number
  used : Boolean
}

' Relationships
lecturers ||--o{ course_units : "teaches"
lecturers ||--o{ attendance_sessions : "conducts"
lecturers ||--o{ lecturer_sessions : "has"
lecturers ||--o{ password_reset_tokens : "requests"

programs ||--o{ course_units : "contains"

students ||--o| face_embeddings : "has"
students ||--o{ attendance_records : "has"

attendance_sessions ||--o{ attendance_records : "contains"
course_units ||--o{ attendance_sessions : "for"

@enduml
```

---

## 2. Class Diagram

### Mermaid Class Diagram Syntax

```mermaid
classDiagram
    direction TB
    
    %% Domain Models
    class Student {
        +String _id
        +String studentId
        +String firstName
        +String middleName
        +String lastName
        +String gender
        +String program
        +String[] courseUnits
        +String email
        +String[] photoDataUrl
        +String[] photoStorageId
        +Float64[] photoEmbeddings
        +Number createdAt
    }
    
    class Lecturer {
        +String _id
        +String fullName
        +String email
        +String role
        +String passwordHash
        +String staffId
        +authenticate(email, password) Response
        +createSession() LecturerSession
        +resetPassword(token, newPassword) Boolean
    }
    
    class Program {
        +String _id
        +String program_code
        +String name
        +String description
        +Number createdAt
    }
    
    class CourseUnit {
        +String _id
        +String code
        +String name
        +String semester
        +String programId
        +String lecturerId
        +Number hours_per_session
    }
    
    class AttendanceSession {
        +String _id
        +String sessionId
        +String courseUnitCode
        +String lecturerId
        +String sessionTitle
        +String description
        +Number startsAt
        +Number endsAt
        +String location
        +SessionStatus status
        +String notes
        +Boolean autoStart
        +Boolean autoClose
        +start() void
        +close() void
        +getAttendanceRecords() AttendanceRecord[]
    }
    
    class AttendanceRecord {
        +String _id
        +String courseUnitCode
        +String sessionId
        +String studentId
        +Number confidence
        +AttendanceStatus status
        +markPresent() void
        +markLate() void
        +markAbsent() void
    }
    
    class FaceEmbedding {
        +String _id
        +String studentId
        +Float64[] descriptor
        +String version
        +String[] studentImages
        +Number updatedAt
        +match(descriptor) Boolean
    }
    
    class LecturerSession {
        +String _id
        +String lecturerId
        +String token
        +Number expiresAt
        +Number createdAt
        +isValid() Boolean
        +invalidate() void
    }
    
    class PasswordResetToken {
        +String _id
        +String lecturerId
        +String token
        +Number expiresAt
        +Number createdAt
        +Boolean used
        +isValid() Boolean
        +markUsed() void
    }
    
    %% Enums
    class SessionStatus {
        <<enumeration>>
        scheduled
        live
        closed
    }
    
    class AttendanceStatus {
        <<enumeration>>
        present
        absent
        late
    }
    
    %% Service/Hook Classes
    class AttendanceService {
        +markAttendance(sessionId, studentId, confidence) AttendanceRecord
        +getAttendanceBySession(sessionId) AttendanceRecord[]
        +getStudentAttendance(studentId) AttendanceRecord[]
        +calculateAttendanceStats(courseUnitCode) Stats
    }
    
    class FaceRecognitionService {
        +detectFace(image) FaceDetection
        +extractEmbedding(face) Float64[]
        +matchStudent(embedding) Student
        +storeFaceEmbedding(studentId, descriptor) FaceEmbedding
    }
    
    class AuthenticationService {
        +login(email, password) Response
        +logout(token) void
        +validateSession(token) Boolean
        +sendPasswordResetEmail(email) void
        +resetPassword(token, newPassword) Boolean
    }
    
    class SessionService {
        +createSession(data) AttendanceSession
        +updateSession(sessionId, data) AttendanceSession
        +startSession(sessionId) void
        +closeSession(sessionId) void
        +getSessionsByLecturer(lecturerId) AttendanceSession[]
    }
    
    %% Relationships
    Lecturer "1" --o "*" CourseUnit : teaches
    Lecturer "1" --o "*" AttendanceSession : conducts
    Lecturer "1" --o "*" LecturerSession : has
    Lecturer "1" --o "*" PasswordResetToken : requests
    
    Program "1" --o "*" CourseUnit : contains
    
    Student "1" --o "0..1" FaceEmbedding : has
    Student "1" --o "*" AttendanceRecord : has
    
    AttendanceSession "1" --o "*" AttendanceRecord : contains
    CourseUnit "1" --o "*" AttendanceSession : has
    
    AttendanceSession --> SessionStatus : uses
    AttendanceRecord --> AttendanceStatus : uses
    
    AttendanceService ..> AttendanceRecord : manages
    AttendanceService ..> AttendanceSession : uses
    
    FaceRecognitionService ..> FaceEmbedding : manages
    FaceRecognitionService ..> Student : identifies
    
    AuthenticationService ..> Lecturer : authenticates
    AuthenticationService ..> LecturerSession : manages
    AuthenticationService ..> PasswordResetToken : manages
    
    SessionService ..> AttendanceSession : manages
```

### PlantUML Class Diagram Syntax

```plantuml
@startuml BCATS_Class_Diagram

skinparam classAttributeIconSize 0
skinparam linetype ortho
skinparam shadowing false
skinparam class {
    BackgroundColor White
    ArrowColor Black
    BorderColor Black
}

package "Domain Models" {
    
    class Student {
        - _id: String
        - studentId: String
        - firstName: String
        - middleName: String
        - lastName: String
        - gender: String
        - program: String
        - courseUnits: String[]
        - email: String
        - photoDataUrl: String[]
        - photoStorageId: String[]
        - photoEmbeddings: Float64[]
        - createdAt: Number
        --
        + getFullName(): String
        + getCourseUnits(): String[]
    }
    
    class Lecturer {
        - _id: String
        - fullName: String
        - email: String
        - role: String
        - passwordHash: String
        - staffId: String
        --
        + authenticate(email, password): Response
        + createSession(): LecturerSession
        + resetPassword(token, newPassword): Boolean
    }
    
    class Program {
        - _id: String
        - program_code: String
        - name: String
        - description: String
        - createdAt: Number
        --
        + getCourseUnits(): CourseUnit[]
    }
    
    class CourseUnit {
        - _id: String
        - code: String
        - name: String
        - semester: String
        - programId: String
        - lecturerId: String
        - hours_per_session: Number
        --
        + getProgram(): Program
        + getLecturer(): Lecturer
    }
    
    class AttendanceSession {
        - _id: String
        - sessionId: String
        - courseUnitCode: String
        - lecturerId: String
        - sessionTitle: String
        - description: String
        - startsAt: Number
        - endsAt: Number
        - location: String
        - status: SessionStatus
        - notes: String
        - autoStart: Boolean
        - autoClose: Boolean
        --
        + start(): void
        + close(): void
        + getAttendanceRecords(): AttendanceRecord[]
        + isLive(): Boolean
    }
    
    class AttendanceRecord {
        - _id: String
        - courseUnitCode: String
        - sessionId: String
        - studentId: String
        - confidence: Number
        - status: AttendanceStatus
        --
        + markPresent(): void
        + markLate(): void
        + markAbsent(): void
        + isOnTime(): Boolean
    }
    
    class FaceEmbedding {
        - _id: String
        - studentId: String
        - descriptor: Float64[]
        - version: String
        - studentImages: String[]
        - updatedAt: Number
        --
        + match(descriptor: Float64[]): Boolean
        + getStudent(): Student
    }
    
    class LecturerSession {
        - _id: String
        - lecturerId: String
        - token: String
        - expiresAt: Number
        - createdAt: Number
        --
        + isValid(): Boolean
        + invalidate(): void
        + getLecturer(): Lecturer
    }
    
    class PasswordResetToken {
        - _id: String
        - lecturerId: String
        - token: String
        - expiresAt: Number
        - createdAt: Number
        - used: Boolean
        --
        + isValid(): Boolean
        + markUsed(): void
    }
    
}

package "Enumerations" {
    
    enum SessionStatus {
        SCHEDULED
        LIVE
        CLOSED
    }
    
    enum AttendanceStatus {
        PRESENT
        ABSENT
        LATE
    }
    
}

package "Services" {
    
    class AttendanceService <<Service>> {
        + markAttendance(sessionId, studentId, confidence): AttendanceRecord
        + getAttendanceBySession(sessionId): AttendanceRecord[]
        + getStudentAttendance(studentId): AttendanceRecord[]
        + calculateAttendanceStats(courseUnitCode): Stats
        + getAttendancePercentage(studentId, courseCode): Number
    }
    
    class FaceRecognitionService <<Service>> {
        + detectFace(image: ImageData): FaceDetection
        + extractEmbedding(face: FaceData): Float64[]
        + matchStudent(embedding: Float64[]): Student
        + storeFaceEmbedding(studentId, descriptor): FaceEmbedding
        + compareEmbeddings(a, b): Number
    }
    
    class AuthenticationService <<Service>> {
        + login(email, password): Response
        + logout(token): void
        + validateSession(token): Boolean
        + sendPasswordResetEmail(email): void
        + resetPassword(token, newPassword): Boolean
        + hashPassword(password): String
    }
    
    class SessionService <<Service>> {
        + createSession(data): AttendanceSession
        + updateSession(sessionId, data): AttendanceSession
        + startSession(sessionId): void
        + closeSession(sessionId): void
        + getSessionsByLecturer(lecturerId): AttendanceSession[]
        + autoManageSessions(): void
    }
    
}

package "React Hooks" {
    
    class useLecturer <<Hook>> {
        + createLecturer(userData): Promise
        + authLecturer(email, password): Promise
    }
    
    class useMarkAttendance <<Hook>> {
        + markAttendance(data): Promise
    }
    
    class useCreateSession <<Hook>> {
        + createSession(data): Promise
    }
    
    class useCameraControl <<Hook>> {
        + startCamera(): void
        + stopCamera(): void
        + captureFrame(): ImageData
    }
    
    class useFaceRecognition <<Hook>> {
        + detectFaces(image): FaceDetection[]
        + matchStudent(embedding): Student
    }
    
}

' Domain Relationships
Lecturer "1" --o "*" CourseUnit : teaches
Lecturer "1" --o "*" AttendanceSession : conducts
Lecturer "1" --o "*" LecturerSession : authenticates via
Lecturer "1" --o "*" PasswordResetToken : requests

Program "1" --o "*" CourseUnit : contains

Student "1" --o "0..1" FaceEmbedding : has biometric
Student "1" --o "*" AttendanceRecord : has

AttendanceSession "1" --o "*" AttendanceRecord : contains
CourseUnit "1" --o "*" AttendanceSession : scheduled for

AttendanceSession --> SessionStatus
AttendanceRecord --> AttendanceStatus

' Service Dependencies
AttendanceService ..> AttendanceRecord : manages
AttendanceService ..> AttendanceSession : uses
AttendanceService ..> Student : references

FaceRecognitionService ..> FaceEmbedding : manages
FaceRecognitionService ..> Student : identifies

AuthenticationService ..> Lecturer : authenticates
AuthenticationService ..> LecturerSession : creates/validates
AuthenticationService ..> PasswordResetToken : creates/validates

SessionService ..> AttendanceSession : manages
SessionService ..> CourseUnit : references
SessionService ..> Lecturer : references

' Hook Dependencies
useLecturer ..> AuthenticationService : uses
useMarkAttendance ..> AttendanceService : uses
useCreateSession ..> SessionService : uses
useFaceRecognition ..> FaceRecognitionService : uses

@enduml
```

---

## 3. Draw.io (diagrams.net) XML Format

### ERD for Draw.io

Copy and import this XML into draw.io:

```xml
<mxfile host="app.diagrams.net">
  <diagram name="BCATS ERD" id="bcats-erd">
    <mxGraphModel dx="1422" dy="798" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- LECTURERS Table -->
        <mxCell id="lecturers" value="LECTURERS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="180" height="156" as="geometry" />
        </mxCell>
        <mxCell id="lecturers-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="lecturers">
          <mxGeometry y="26" width="180" height="26" as="geometry" />
        </mxCell>
        <mxCell id="lecturers-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="lecturers">
          <mxGeometry y="52" width="180" height="8" as="geometry" />
        </mxCell>
        <mxCell id="lecturers-fields" value="fullName: String&#xa;email: String &lt;&lt;unique&gt;&gt;&#xa;role: String&#xa;passwordHash: String&#xa;staffId: String" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="lecturers">
          <mxGeometry y="60" width="180" height="96" as="geometry" />
        </mxCell>
        
        <!-- PROGRAMS Table -->
        <mxCell id="programs" value="PROGRAMS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="280" y="40" width="180" height="130" as="geometry" />
        </mxCell>
        <mxCell id="programs-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="programs">
          <mxGeometry y="26" width="180" height="26" as="geometry" />
        </mxCell>
        <mxCell id="programs-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="programs">
          <mxGeometry y="52" width="180" height="8" as="geometry" />
        </mxCell>
        <mxCell id="programs-fields" value="program_code: String &lt;&lt;unique&gt;&gt;&#xa;name: String&#xa;description: String&#xa;createdAt: Number" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="programs">
          <mxGeometry y="60" width="180" height="70" as="geometry" />
        </mxCell>
        
        <!-- COURSE_UNITS Table -->
        <mxCell id="course_units" value="COURSE_UNITS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="160" y="220" width="200" height="170" as="geometry" />
        </mxCell>
        <mxCell id="course_units-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="course_units">
          <mxGeometry y="26" width="200" height="26" as="geometry" />
        </mxCell>
        <mxCell id="course_units-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="course_units">
          <mxGeometry y="52" width="200" height="8" as="geometry" />
        </mxCell>
        <mxCell id="course_units-fields" value="code: String &lt;&lt;unique&gt;&gt;&#xa;name: String&#xa;semester: String&#xa;FK  programId: ObjectId&#xa;FK  lecturerId: ObjectId&#xa;hours_per_session: Number" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="course_units">
          <mxGeometry y="60" width="200" height="110" as="geometry" />
        </mxCell>
        
        <!-- STUDENTS Table -->
        <mxCell id="students" value="STUDENTS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
          <mxGeometry x="520" y="40" width="200" height="260" as="geometry" />
        </mxCell>
        <mxCell id="students-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="students">
          <mxGeometry y="26" width="200" height="26" as="geometry" />
        </mxCell>
        <mxCell id="students-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="students">
          <mxGeometry y="52" width="200" height="8" as="geometry" />
        </mxCell>
        <mxCell id="students-fields" value="studentId: String &lt;&lt;unique&gt;&gt;&#xa;firstName: String&#xa;middleName: String&#xa;lastName: String&#xa;gender: String&#xa;program: String&#xa;courseUnits: Array&lt;String&gt;&#xa;email: String&#xa;photoDataUrl: Array&lt;String&gt;&#xa;photoStorageId: Array&lt;ObjectId&gt;&#xa;photoEmbeddings: Array&lt;Float64&gt;&#xa;createdAt: Number" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="students">
          <mxGeometry y="60" width="200" height="200" as="geometry" />
        </mxCell>
        
        <!-- FACE_EMBEDDINGS Table -->
        <mxCell id="face_embeddings" value="FACE_EMBEDDINGS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="780" y="40" width="200" height="156" as="geometry" />
        </mxCell>
        <mxCell id="face_embeddings-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="face_embeddings">
          <mxGeometry y="26" width="200" height="26" as="geometry" />
        </mxCell>
        <mxCell id="face_embeddings-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="face_embeddings">
          <mxGeometry y="52" width="200" height="8" as="geometry" />
        </mxCell>
        <mxCell id="face_embeddings-fields" value="FK  studentId: ObjectId&#xa;descriptor: Array&lt;Float64&gt;&#xa;version: String&#xa;studentImages: Array&lt;ObjectId&gt;&#xa;updatedAt: Number" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="face_embeddings">
          <mxGeometry y="60" width="200" height="96" as="geometry" />
        </mxCell>
        
        <!-- ATTENDANCE_SESSIONS Table -->
        <mxCell id="attendance_sessions" value="ATTENDANCE_SESSIONS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
          <mxGeometry x="420" y="340" width="220" height="280" as="geometry" />
        </mxCell>
        <mxCell id="attendance_sessions-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="attendance_sessions">
          <mxGeometry y="26" width="220" height="26" as="geometry" />
        </mxCell>
        <mxCell id="attendance_sessions-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="attendance_sessions">
          <mxGeometry y="52" width="220" height="8" as="geometry" />
        </mxCell>
        <mxCell id="attendance_sessions-fields" value="sessionId: String &lt;&lt;unique&gt;&gt;&#xa;courseUnitCode: String&#xa;FK  lecturerId: ObjectId&#xa;sessionTitle: String&#xa;description: String&#xa;startsAt: Number&#xa;endsAt: Number&#xa;location: String&#xa;status: Enum(scheduled|live|closed)&#xa;notes: String&#xa;autoStart: Boolean&#xa;autoClose: Boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="attendance_sessions">
          <mxGeometry y="60" width="220" height="220" as="geometry" />
        </mxCell>
        
        <!-- ATTENDANCE_RECORDS Table -->
        <mxCell id="attendance_records" value="ATTENDANCE_RECORDS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;" vertex="1" parent="1">
          <mxGeometry x="700" y="340" width="220" height="170" as="geometry" />
        </mxCell>
        <mxCell id="attendance_records-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="attendance_records">
          <mxGeometry y="26" width="220" height="26" as="geometry" />
        </mxCell>
        <mxCell id="attendance_records-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="attendance_records">
          <mxGeometry y="52" width="220" height="8" as="geometry" />
        </mxCell>
        <mxCell id="attendance_records-fields" value="courseUnitCode: String&#xa;FK  sessionId: ObjectId&#xa;FK  studentId: ObjectId&#xa;confidence: Number&#xa;status: Enum(present|absent|late)" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="attendance_records">
          <mxGeometry y="60" width="220" height="110" as="geometry" />
        </mxCell>
        
        <!-- LECTURER_SESSIONS Table -->
        <mxCell id="lecturer_sessions" value="LECTURER_SESSIONS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="40" y="240" width="180" height="130" as="geometry" />
        </mxCell>
        <mxCell id="lecturer_sessions-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="lecturer_sessions">
          <mxGeometry y="26" width="180" height="26" as="geometry" />
        </mxCell>
        <mxCell id="lecturer_sessions-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="lecturer_sessions">
          <mxGeometry y="52" width="180" height="8" as="geometry" />
        </mxCell>
        <mxCell id="lecturer_sessions-fields" value="FK  lecturerId: ObjectId&#xa;token: String &lt;&lt;unique&gt;&gt;&#xa;expiresAt: Number&#xa;createdAt: Number" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="lecturer_sessions">
          <mxGeometry y="60" width="180" height="70" as="geometry" />
        </mxCell>
        
        <!-- PASSWORD_RESET_TOKENS Table -->
        <mxCell id="password_reset_tokens" value="PASSWORD_RESET_TOKENS" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="40" y="400" width="200" height="156" as="geometry" />
        </mxCell>
        <mxCell id="password_reset_tokens-pk" value="PK  _id: ObjectId" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=4;" vertex="1" parent="password_reset_tokens">
          <mxGeometry y="26" width="200" height="26" as="geometry" />
        </mxCell>
        <mxCell id="password_reset_tokens-divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;" vertex="1" parent="password_reset_tokens">
          <mxGeometry y="52" width="200" height="8" as="geometry" />
        </mxCell>
        <mxCell id="password_reset_tokens-fields" value="FK  lecturerId: ObjectId&#xa;token: String &lt;&lt;unique&gt;&gt;&#xa;expiresAt: Number&#xa;createdAt: Number&#xa;used: Boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="password_reset_tokens">
          <mxGeometry y="60" width="200" height="96" as="geometry" />
        </mxCell>
        
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

## 4. Quick Reference - Relationships Summary

| Parent Entity | Relationship | Child Entity | Cardinality |
|--------------|--------------|--------------|-------------|
| Lecturers | teaches | Course_Units | 1:N |
| Lecturers | conducts | Attendance_Sessions | 1:N |
| Lecturers | has | Lecturer_Sessions | 1:N |
| Lecturers | requests | Password_Reset_Tokens | 1:N |
| Programs | contains | Course_Units | 1:N |
| Students | has | Face_Embeddings | 1:1 |
| Students | has | Attendance_Records | 1:N |
| Attendance_Sessions | contains | Attendance_Records | 1:N |
| Course_Units | has | Attendance_Sessions | 1:N |

---

## 5. How to Use These Diagrams

### Mermaid Diagrams
1. **VS Code**: Install "Mermaid Preview" extension, then view the .md file
2. **GitHub**: Directly renders Mermaid in README files
3. **draw.io**: File → Import → Paste the Mermaid code
4. **Online**: Use https://mermaid.live to render and export

### PlantUML Diagrams
1. **VS Code**: Install "PlantUML" extension
2. **Online**: Use https://www.plantuml.com/plantuml
3. **IntelliJ/StarUML**: Built-in PlantUML support
4. **Export**: Can export to PNG, SVG, PDF

### Draw.io XML
1. Open https://app.diagrams.net
2. File → Import From → Device
3. Save the XML content as a .drawio file and import
4. Or File → Import → Paste the XML directly

