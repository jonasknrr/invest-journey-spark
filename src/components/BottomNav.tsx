import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineSchool, MdOutlineDashboard, MdOutlineEmojiEvents } from 'react-icons/md';

const navItems = [
  { label: 'Learn', icon: MdOutlineSchool, path: '/learn' },
  { label: 'Invest', icon: MdOutlineDashboard, path: '/dashboard' },
  { label: 'Leaderboard', icon: MdOutlineEmojiEvents, path: '/leaderboard' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      style={{
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 20px -4px hsl(220 50% 15% / 0.06)',
      }}
    >
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-4 py-1 transition-colors"
            >
              <Icon
                size={24}
                style={{ color: isActive ? '#EF9F27' : 'hsl(220 20% 46%)' }}
              />
              <span
                className="text-xs font-semibold"
                style={{
                  color: isActive ? '#EF9F27' : 'hsl(220, 20%, 46%)',
                  fontSize: 11,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
