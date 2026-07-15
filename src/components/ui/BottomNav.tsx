import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

const TABS = [
  { path: '/home',     icon: '🏠', label: 'Home' },
  { path: '/program',  icon: '📋', label: 'Program' },
  { path: '/library',  icon: '📚', label: 'Library' },
  { path: '/progress', icon: '📈', label: 'Progress' },
  { path: '/settings', icon: '⚙️',  label: 'Settings' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/workout')) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[#161b22] border-t border-white/10">
      <div className="flex justify-around items-center h-16 max-w-sm mx-auto">
        {TABS.map(t => (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
              location.pathname === t.path ? 'text-[#00d4aa]' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
