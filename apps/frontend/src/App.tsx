import { Route, Switch } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import SecretaryLessonPlans from "./pages/secretary/SecretaryLessonPlans";
import DesignReview from "./pages/DesignReview";
import TestSupabase from "./pages/TestSupabase";
import LoginPage from "./pages/LoginPage";
import { isAuthenticated, getAuthUser } from "./lib/authLocal";

// Componente para rota raiz que redireciona baseado em autenticação
function RootRoute() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const isAuth = isAuthenticated();
    
    if (!isAuth) {
      // Não autenticado - redirecionar para login
      setLocation('/login');
    } else {
      // Autenticado - redirecionar para dashboard baseado no role
      const user = getAuthUser();
      const roleRoutes: Record<string, string> = {
        Admin: '/admin',
        Teacher: '/teacher',
        Student: '/student',
        Secretary: '/secretary',
        Treasury: '/treasury',
        EducationSecretary: '/education-secretary',
      };
      const redirectTo = roleRoutes[user?.role || ''] || '/admin';
      setLocation(redirectTo);
    }
  }, [setLocation]);
  
  // Mostrar loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-slate-600">Carregando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Switch>
        {/* Rotas públicas */}
        <Route path="/login" component={LoginPage} />
        <Route path="/test-supabase" component={TestSupabase} />
        
        {/* Rota raiz: redireciona baseado em autenticação */}
        <Route path="/">
          <RootRoute />
        </Route>
        
        <Route path="/review">
          <ProtectedRoute>
            <DesignReview />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin">
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/teacher">
          <ProtectedRoute requiredRole="Teacher">
            <TeacherTerms />
          </ProtectedRoute>
        </Route>
        
        <Route path="/teacher/:termId/classes">
          <ProtectedRoute requiredRole="Teacher">
            <TeacherClasses />
          </ProtectedRoute>
        </Route>
        
        <Route path="/teacher/:termId/classes/:classId/subjects">
          <ProtectedRoute requiredRole="Teacher">
            <TeacherSubjects />
          </ProtectedRoute>
        </Route>
        
        <Route path="/teacher/:termId/classes/:classId/subjects/:subjectId">
          <ProtectedRoute requiredRole="Teacher">
            <TeacherTools />
          </ProtectedRoute>
        </Route>
        
        <Route path="/student">
          <ProtectedRoute requiredRole="Student">
            <StudentDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/student/report-card">
          <ProtectedRoute requiredRole="Student">
            <StudentReportCard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/student/attendance">
          <ProtectedRoute requiredRole="Student">
            <StudentAttendance />
          </ProtectedRoute>
        </Route>
        
        <Route path="/student/assignments">
          <ProtectedRoute requiredRole="Student">
            <StudentAssignments />
          </ProtectedRoute>
        </Route>
        
        <Route path="/student/pedacoins">
          <ProtectedRoute requiredRole="Student">
            <StudentPedacoins />
          </ProtectedRoute>
        </Route>
        
        <Route path="/student/chat">
          <ProtectedRoute requiredRole="Student">
            <StudentChat />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/students">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryStudents />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/classes">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryClasses />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/subjects">
          <ProtectedRoute requiredRole="Secretary">
            <SecretarySubjects />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/enrollments">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryEnrollments />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/calendar">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryCalendar />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/documents">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryDocuments />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/communication">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryCommunication />
          </ProtectedRoute>
        </Route>
        
        <Route path="/secretary/lesson-plans">
          <ProtectedRoute requiredRole="Secretary">
            <SecretaryLessonPlans />
          </ProtectedRoute>
        </Route>
        
        <Route path="/treasury">
          <ProtectedRoute requiredRole="Treasury">
            <TreasuryDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/treasury/tuition">
          <ProtectedRoute requiredRole="Treasury">
            <TreasuryTuition />
          </ProtectedRoute>
        </Route>
        
        <Route path="/treasury/invoices">
          <ProtectedRoute requiredRole="Treasury">
            <TreasuryInvoices />
          </ProtectedRoute>
        </Route>
        
        <Route path="/treasury/cashflow">
          <ProtectedRoute requiredRole="Treasury">
            <TreasuryCashflow />
          </ProtectedRoute>
        </Route>
        
        <Route path="/treasury/reports">
          <ProtectedRoute requiredRole="Treasury">
            <TreasuryReports />
          </ProtectedRoute>
        </Route>
        
        <Route path="/education-secretary">
          <ProtectedRoute requiredRole="EducationSecretary">
            <EdSecretaryDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/education-secretary/reports">
          <ProtectedRoute requiredRole="EducationSecretary">
            <EdSecretaryReports />
          </ProtectedRoute>
        </Route>
        
        <Route path="/education-secretary/schools">
          <ProtectedRoute requiredRole="EducationSecretary">
            <EdSecretarySchools />
          </ProtectedRoute>
        </Route>
        
        <Route path="/education-secretary/planning">
          <ProtectedRoute requiredRole="EducationSecretary">
            <EdSecretaryPlanning />
          </ProtectedRoute>
        </Route>
        
        {/* Rota padrão */}
        <Route>
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
      </Switch>
    </ErrorBoundary>
  );
}