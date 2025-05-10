import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  MessageSquare,
  Database,
  AlertCircle,
  Terminal,
  LogOut,
  Menu,
  X,
  UserPlus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { messages } from '@/services/mockData';

interface DeveloperLayoutProps {
  children: React.ReactNode;
}

const DeveloperLayout: React.FC<DeveloperLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/developer/login');
  };

  // Count unread messages
  const unreadCount = messages.filter(msg => !msg.read && msg.senderRole === 'admin').length;

  const navItems = [
    { 
      path: '/developer', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      path: '/developer/create-admin', 
      label: 'Create Admin', 
      icon: <UserPlus size={18} /> 
    },
    { 
      path: '/developer/system', 
      label: 'System Status', 
      icon: <Terminal size={18} /> 
    },
    { 
      path: '/developer/database', 
      label: 'Database', 
      icon: <Database size={18} /> 
    },
    { 
      path: '/developer/logs', 
      label: 'System Logs', 
      icon: <AlertCircle size={18} /> 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/developer" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">
              PrintSpark <span className="text-sm font-normal text-gray-500">Developer</span>
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 text-gray-600" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  location.pathname === item.path
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary hover:border-primary-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Messages Button with Badge */}
            <Link
              to="/developer/messages"
              className={`flex items-center space-x-1 py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-150 relative ${
                location.pathname === '/developer/messages'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-primary hover:border-primary-200'
              }`}
            >
              <MessageSquare size={18} />
              <span>Messages</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {unreadCount}
                </Badge>
              )}
            </Link>

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="flex items-center space-x-1 text-gray-600 hover:text-primary hover:bg-primary-100"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      </header>
      
      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="font-bold text-xl text-primary">
                PrintSpark <span className="text-sm font-normal text-gray-500">Developer</span>
              </span>
            </div>
            <nav className="px-2 py-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors duration-150 ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary'
                      : 'text-gray-600 hover:bg-primary-100 hover:text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                to="/developer/messages"
                className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors duration-150 ${
                  location.pathname === '/developer/messages'
                    ? 'bg-primary-100 text-primary'
                    : 'text-gray-600 hover:bg-primary-100 hover:text-primary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare size={18} />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-3 w-full text-left rounded-md text-gray-600 hover:bg-primary-100 hover:text-primary"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 PrintSpark Studio Developer Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DeveloperLayout; 