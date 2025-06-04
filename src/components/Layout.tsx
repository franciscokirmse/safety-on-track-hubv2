import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/hooks/useGamification';
import GamificationBadge from './GamificationBadge';
import { 
  Shield, 
  Home, 
  GraduationCap, 
  Award, 
  CheckSquare, 
  BookOpen, 
  Play, 
  BarChart3,
  AlertTriangle,
  LogOut,
  User,
  Settings,
  Trophy
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface UserMetadata {
  user_type?: 'admin' | 'student' | string;
  [key: string]: any;
}

interface AppUser {
  email?: string;
  user_metadata?: UserMetadata;
  [key: string]: any;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const { gamificationData } = useGamification();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Cursos', href: '/courses', icon: GraduationCap },
    { name: 'Certificados', href: '/certificates', icon: Award },
    { name: 'Checklists', href: '/checklists', icon: CheckSquare },
    { name: 'Biblioteca', href: '/library', icon: BookOpen },
    { name: 'Vídeos Curtos', href: '/short-videos', icon: Play },
    { name: 'Incidentes', href: '/incidents', icon: AlertTriangle },
    { name: 'Gamificação', href: '/gamification', icon: Trophy },
  ];

  // Add reports for non-student users only
  const userType = (user as AppUser)?.user_metadata?.user_type;
  if (userType === 'admin') {
    navigation.push({ name: 'Relatórios', href: '/reports', icon: BarChart3 });
    navigation.push({ name: 'Admin', href: '/admin', icon: Settings });
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071a3f' }}>
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-gray-800 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold" style={{ color: '#f2f2f2' }}>Safety On Demand</span>
            </div>
            
            {/* Gamification Display */}
            <div className="mx-4 mt-4 p-3 bg-gray-700 rounded-lg">
              <GamificationBadge 
                points={gamificationData.points}
                level={gamificationData.level}
                badges={gamificationData.badges}
              />
            </div>
            
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={`${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium" style={{ color: '#f2f2f2' }}>
                    {user?.email}
                  </p>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-gray-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="ml-2 text-lg font-bold" style={{ color: '#f2f2f2' }}>Safety On Demand</span>
              </div>
              <div className="flex items-center space-x-3">
                <GamificationBadge 
                  points={gamificationData.points}
                  level={gamificationData.level}
                  badges={gamificationData.badges}
                />
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none" style={{ backgroundColor: '#f2f2f2' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
