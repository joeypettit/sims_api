import { createBrowserRouter, Navigate } from 'react-router-dom';
import NavBar from './nav/navbar';
import ErrorPage from './error-page';
import PanelWindow from '../components/panel-window';
import ProjectsPanel from '../routes/projects/projects-panel';
import ProjectDetails from '../routes/projects/project-details';
import EditProjectArea from '../routes/projects/edit-project-area';
import SettingsPanel from '../routes/settings/settings';
import EditAreaTemplate from '../routes/settings/edit-area-template';
import EditLineItem from '../routes/settings/edit-line-item';
import LoginPage from '../routes/login/login-page';
import UsersPanel from '../routes/users/users-panel';
import UserDetails from '../routes/users/user-details';
import ClientsPanel from "../routes/clients/clients-panel";
import ClientDetails from "../routes/clients/client-details";
import ChangePasswordPage from '../routes/change-password/change-password-page';
import ProfilePage from '../routes/profile/profile-page';
import ProtectedRoute from '../components/protected-route';
import MyProjectsPanel from "../routes/projects/my-projects";
import ProjectAreaSettings from '../routes/projects/project-area-settings';
import TemplateSettings from '../routes/settings/template-settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/projects" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/change-password',
    element: <ChangePasswordPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <NavBar />
      </ProtectedRoute>
    ),
    errorElement: <PanelWindow><ErrorPage /></PanelWindow>,
    children: [
      {
        path: 'my-projects',
        element: <PanelWindow><MyProjectsPanel /></PanelWindow>
      },
      {
        path: 'projects',
        element: <PanelWindow><ProjectsPanel /></PanelWindow>
      },
      {
        path: 'project/:id',
        element: <PanelWindow><ProjectDetails /></PanelWindow>
      },
      {
        path: 'project/:id/area/:areaId',
        element: <PanelWindow><EditProjectArea /></PanelWindow>
      },
      {
        path: 'project/:id/area/:areaId/settings',
        element: <PanelWindow><ProjectAreaSettings /></PanelWindow>
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <PanelWindow><UsersPanel /></PanelWindow>
          </ProtectedRoute>
        )
      },
      {
        path: 'users/:userId',
        element: <PanelWindow><UserDetails /></PanelWindow>
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <PanelWindow><SettingsPanel /></PanelWindow>
          </ProtectedRoute>
        )
      },
      {
        path: 'settings/edit-template/:templateId',
        element: <PanelWindow><EditAreaTemplate /></PanelWindow>
      },
      {
        path: 'settings/edit-template/:templateId/settings',
        element: <PanelWindow><TemplateSettings /></PanelWindow>
      },
      {
        path: 'edit-line-item/:lineItemId',
        element: <PanelWindow><EditLineItem /></PanelWindow>
      },
      {
        path: 'clients',
        element: <PanelWindow><ClientsPanel /></PanelWindow>
      },
      {
        path: 'clients/:clientId',
        element: <PanelWindow><ClientDetails /></PanelWindow>
      },
      {
        path: 'profile',
        element: <PanelWindow><ProfilePage /></PanelWindow>
      }
    ]
  }
]);
