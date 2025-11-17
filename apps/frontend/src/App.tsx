import { Route, Switch } from "wouter";
import AdminDashboard from "./pages/AdminDashboard";
import HierarchyDashboard from "./pages/HierarchyDashboard";
import TeacherTerms from "./pages/teacher/TeacherTerms";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherSubjects from "./pages/teacher/TeacherSubjects";
import TeacherTools from "./pages/teacher/TeacherTools";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentReportCard from "./pages/student/StudentReportCard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentPedacoins from "./pages/student/StudentPedacoins";
import StudentChat from "./pages/student/StudentChat";
import SecretaryDashboard from "./pages/secretary/SecretaryDashboard";
import SecretaryStudents from "./pages/secretary/SecretaryStudents";
import SecretaryClasses from "./pages/secretary/SecretaryClasses";
import SecretarySubjects from "./pages/secretary/SecretarySubjects";
import SecretaryEnrollments from "./pages/secretary/SecretaryEnrollments";
import SecretaryCalendar from "./pages/secretary/SecretaryCalendar";
import SecretaryDocuments from "./pages/secretary/SecretaryDocuments";
import SecretaryCommunication from "./pages/secretary/SecretaryCommunication";
import TreasuryDashboard from "./pages/treasury/TreasuryDashboard";
import TreasuryTuition from "./pages/treasury/TreasuryTuition";
import TreasuryInvoices from "./pages/treasury/TreasuryInvoices";
import TreasuryCashflow from "./pages/treasury/TreasuryCashflow";
import TreasuryReports from "./pages/treasury/TreasuryReports";
import EdSecretaryDashboard from "./pages/edu/EdSecretaryDashboard";
import EdSecretaryReports from "./pages/edu/EdSecretaryReports";
import EdSecretarySchools from "./pages/edu/EdSecretarySchools";
import EdSecretaryPlanning from "./pages/edu/EdSecretaryPlanning";
import DesignReview from "./pages/DesignReview";
import TestSupabase from "./pages/TestSupabase";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HierarchyDashboard} />
      <Route path="/review" component={DesignReview} />
      <Route path="/test-supabase" component={TestSupabase} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/teacher" component={TeacherTerms} />
      <Route path="/teacher/:termId/classes" component={TeacherClasses} />
      <Route path="/teacher/:termId/classes/:classId/subjects" component={TeacherSubjects} />
      <Route path="/teacher/:termId/classes/:classId/subjects/:subjectId" component={TeacherTools} />
      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/report-card" component={StudentReportCard} />
      <Route path="/student/attendance" component={StudentAttendance} />
      <Route path="/student/assignments" component={StudentAssignments} />
      <Route path="/student/pedacoins" component={StudentPedacoins} />
      <Route path="/student/chat" component={StudentChat} />
      <Route path="/secretary" component={SecretaryDashboard} />
      <Route path="/secretary/students" component={SecretaryStudents} />
      <Route path="/secretary/classes" component={SecretaryClasses} />
      <Route path="/secretary/subjects" component={SecretarySubjects} />
      <Route path="/secretary/enrollments" component={SecretaryEnrollments} />
      <Route path="/secretary/calendar" component={SecretaryCalendar} />
      <Route path="/secretary/documents" component={SecretaryDocuments} />
      <Route path="/secretary/communication" component={SecretaryCommunication} />
      <Route path="/treasury" component={TreasuryDashboard} />
      <Route path="/treasury/tuition" component={TreasuryTuition} />
      <Route path="/treasury/invoices" component={TreasuryInvoices} />
      <Route path="/treasury/cashflow" component={TreasuryCashflow} />
      <Route path="/treasury/reports" component={TreasuryReports} />
      <Route path="/education-secretary" component={EdSecretaryDashboard} />
      <Route path="/education-secretary/reports" component={EdSecretaryReports} />
      <Route path="/education-secretary/schools" component={EdSecretarySchools} />
      <Route path="/education-secretary/planning" component={EdSecretaryPlanning} />
      <Route> <AdminDashboard /> </Route>
    </Switch>
  );
}