import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/dashboard';
import Login from '@/pages/Auth/login';
import NotFound from '@/pages/NotFound';
import MapPage from '@/pages/Cartes/map-page';
import ListPoints from '@/pages/Points/list-points';
import ListIncidents from '@/pages/Points/list-incidents';
import ListMarqueurs from '@/pages/Marqueurs/list-marqueurs';
import ListSections from '@/pages/Sections/list-sections';
import ListUsers from '@/pages/Auth/list-users';
import  ProfilePage from '@/pages/Auth/profile';
import SettingsPage from '@/pages/settings';
import PrivateRoute from '@/pages/Auth/PrivateRoute';
import { AddPoint } from './pages/Points/add-point';
import EditPoint from './pages/Points/edit-point';
import ViewPoint from './pages/Points/view-point';
import AddSection from './pages/Sections/add-section';
import ViewSection from './pages/Sections/view-section';
import EditSection from './pages/Sections/edit-section';
import AddMarqueur from './pages/Marqueurs/add-marqueur';
import ViewMarqueur from './pages/Marqueurs/view-marqueur';
import EditMarqueur from './pages/Marqueurs/edit-marqueur';
import { useParams } from 'react-router-dom';

function EditSectionWrapper() {
  const { id } = useParams<{ id: string }>();
  return <EditSection id={id!} onSuccess={() => window.location.href = '/dashboard/sections'} />;
}

function AppRouter() {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
         {/* Routes protégée pour le dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout/></PrivateRoute>}>
                <Route path="/dashboard/map" element={<MapPage />} />
                { /* Routes pour les points */}
                <Route path="/dashboard/points" element={<ListPoints />} />
                 <Route path="/dashboard/add-point" element={<AddPoint />} />
                <Route path="/dashboard/point/view/:id" element={<ViewPoint />} />
                <Route path="/dashboard/point/edit/:id" element={<EditPoint />} />
                <Route path="/dashboard/incidents" element={<ListIncidents />} />
                  { /* Routes pour les utilisateurs */}
                <Route path="/dashboard/users" element={<ListUsers />} />
                <Route path="/dashboard/user/view/:id" element={<ProfilePage/>} />
                <Route path="/dashboard/settings" element={<SettingsPage />} />
                <Route index element={<Navigate to="/dashboard/map" />} />
                { /* Routes pour les sections */}
          <Route path="/dashboard/sections" element={<ListSections />} />
          <Route path="/dashboard/add-section" element={<AddSection onSuccess={() => window.location.href = '/dashboard/sections'} />} />
          <Route path="/dashboard/section/view/:id" element={<ViewSection />} />
          <Route path="/dashboard/section/edit/:id" element={<EditSectionWrapper />} />
           { /* Routes pour les marqueurs */}
          <Route path="/dashboard/marqueurs" element={<ListMarqueurs />} />
          <Route path="/dashboard/add-marqueur" element={<AddMarqueur onSuccess={() => window.location.href = '/dashboard/marqueurs'} />} />
          <Route path="/dashboard/marqueur/view/:id" element={<ViewMarqueur />} />
          <Route path="/dashboard/marqueur/edit/:id" element={<EditMarqueur id={''} onSuccess={function (): void {
            throw new Error('Function not implemented.');
          } } />} />
            </Route>
        </Routes>
    </Router>
  );
}
export default AppRouter;