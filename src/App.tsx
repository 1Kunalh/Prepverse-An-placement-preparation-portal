import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  TrendingUp,
  User,
  X,
} from 'lucide-react';

import { AppProvider, NavigationTab, useApp } from './context/AppContext.tsx';
import { AptitudePage } from './pages/AptitudePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { MockInterviewPage } from './pages/MockInterviewPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ProgressTrackerPage } from './pages/ProgressTrackerPage.tsx';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage.tsx';
import { StudyNotesPage } from './pages/StudyNotesPage.tsx';
import { TechnicalQuizPage } from './pages/TechnicalQuizPage.tsx';

const NAV_ITEMS: Array<{
  id: NavigationTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Your preparation overview',
    icon: LayoutDashboard,
  },
  {
    id: 'profile',
    label: 'Profile & Interests',
    description: 'Career preferences',
    icon: User,
  },
  {
    id: 'quiz',
    label: 'Technical Quiz',
    description: 'Test your technical skills',
    icon: Brain,
  },
  {
    id: 'aptitude',
    label: 'Aptitude Practice',
    description: 'Practice placement aptitude',
    icon: BookOpen,
  },
  {
    id: 'notes',
    label: 'Study Notes',
    description: 'Organize your preparation',
    icon: FileText,
  },
  {
    id: 'resume',
    label: 'AI Resume Analyzer',
    description: 'Improve your resume',
    icon: FileText,
  },
  {
    id: 'interview',
    label: 'AI Mock Interview',
    description: 'Practice real interviews',
    icon: MessageSquare,
  },
  {
    id: 'progress',
    label: 'Progress Tracker',
    description: 'Monitor your growth',
    icon: TrendingUp,
  },
];

/* =========================================================
   PREPVERSE BRAND
========================================================= */

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-indigo-400/25 blur-lg" />

        <div
          className="
            relative
            w-10 h-10
            rounded-2xl
            flex items-center justify-center
            bg-gradient-to-br
            from-indigo-600
            via-blue-600
            to-sky-500
            shadow-lg
            shadow-indigo-200
            border border-white
          "
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      <div>
        <div className="text-[19px] leading-none font-extrabold tracking-tight text-slate-900">
          Prep<span className="text-indigo-600">Verse</span>
        </div>

        <div className="mt-1 text-[8px] uppercase tracking-[0.18em] font-bold text-slate-400">
          Placement Preparation Portal
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ANIMATED LIGHT BACKGROUND
========================================================= */

function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#F6F8FC]">
      {/* Top blue glow */}
      <div
        className="
          absolute
          -top-48
          -right-40
          w-[600px]
          h-[600px]
          rounded-full
          bg-blue-200/30
          blur-[120px]
          animate-pulse
        "
      />

      {/* Bottom violet glow */}
      <div
        className="
          absolute
          -bottom-52
          -left-40
          w-[650px]
          h-[650px]
          rounded-full
          bg-indigo-200/25
          blur-[130px]
        "
      />

      {/* Small cyan glow */}
      <div
        className="
          absolute
          top-[35%]
          right-[25%]
          w-[300px]
          h-[300px]
          rounded-full
          bg-sky-100/40
          blur-[100px]
        "
      />

      {/* Very subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(#64748b 1px, transparent 1px),
            linear-gradient(90deg, #64748b 1px, transparent 1px)
          `,
          backgroundSize: '42px 42px',
        }}
      />
    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        w-full
        flex
        items-center
        gap-3
        px-3
        py-2.5
        rounded-xl
        text-left
        transition-all
        duration-300
        cursor-pointer
        ${
          active
            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }
      `}
    >
      {/* Active indicator */}
      <span
        className={`
          absolute
          left-0
          top-1/2
          -translate-y-1/2
          w-[3px]
          rounded-r-full
          bg-gradient-to-b
          from-indigo-600
          to-blue-500
          transition-all
          duration-300
          ${active ? 'h-7 opacity-100' : 'h-0 opacity-0'}
        `}
      />

      {/* Icon */}
      <div
        className={`
          w-9
          h-9
          rounded-xl
          flex
          items-center
          justify-center
          shrink-0
          transition-all
          duration-300
          ${
            active
              ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
          }
        `}
      >
        <Icon className="w-[17px] h-[17px]" />
      </div>

      {/* Text */}
      <div className="min-w-0">
        <div
          className={`
            text-[12px]
            font-semibold
            truncate
            ${active ? 'text-indigo-700' : 'text-slate-700'}
          `}
        >
          {item.label}
        </div>

        <div className="text-[9px] text-slate-400 truncate mt-0.5">
          {item.description}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight
        className={`
          ml-auto
          w-3.5
          h-3.5
          transition-all
          duration-300
          ${
            active
              ? 'opacity-100 text-indigo-500 translate-x-0'
              : 'opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0'
          }
        `}
      />
    </button>
  );
}

/* =========================================================
   USER CARD
========================================================= */

function UserCard({
  name,
  role,
  onClick,
}: {
  name: string;
  role: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        p-3
        rounded-2xl
        bg-gradient-to-br
        from-slate-50
        to-white
        border
        border-slate-200/70
        hover:border-indigo-200
        hover:shadow-md
        hover:shadow-indigo-100/50
        transition-all
        duration-300
        text-left
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            w-9
            h-9
            rounded-xl
            flex
            items-center
            justify-center
            bg-gradient-to-br
            from-indigo-600
            to-blue-500
            text-white
            text-sm
            font-bold
            shadow-md
            shadow-indigo-100
          "
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-800 truncate">
            {name}
          </div>

          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            {role}
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   MAIN WORKSPACE
========================================================= */

function AuthenticatedWorkspace() {
  const {
    user,
    profile,
    activeTab,
    setActiveTab,
    signOutAccount,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <LandingPage />;
  }

  const currentPage =
    NAV_ITEMS.find((item) => item.id === activeTab);

  const userName =
    profile?.name ||
    user.displayName ||
    user.email ||
    'Student';

  const targetRole =
    profile?.targetRole ||
    'Software Developer';

  const navigate = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden">
      <Background />

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          hidden
          lg:flex
          fixed
          inset-y-0
          left-0
          z-50
          w-[270px]
          flex-col
          bg-white/90
          backdrop-blur-2xl
          border-r
          border-slate-200/70
          shadow-[8px_0_30px_rgba(15,23,42,0.04)]
        "
      >
        {/* Brand */}
        <div className="h-[88px] px-6 flex items-center border-b border-slate-100">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="cursor-pointer"
          >
            <Brand />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <div className="px-3 mb-3">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Main Menu
            </div>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeTab === item.id}
                onClick={() => navigate(item.id)}
              />
            ))}
          </nav>
        </div>

        {/* User */}
        <div className="p-4 border-t border-slate-100">
          <UserCard
            name={userName}
            role={targetRole}
            onClick={() => navigate('profile')}
          />

          <button
            type="button"
            onClick={signOutAccount}
            className="
              mt-2
              w-full
              flex
              items-center
              gap-2.5
              px-3
              py-2.5
              rounded-xl
              text-[11px]
              font-semibold
              text-slate-400
              hover:text-red-500
              hover:bg-red-50
              transition-all
              duration-300
            "
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header
        className="
          lg:hidden
          fixed
          top-0
          left-0
          right-0
          z-50
          h-[68px]
          px-4
          flex
          items-center
          justify-between
          bg-white/90
          backdrop-blur-xl
          border-b
          border-slate-200/70
          shadow-sm
        "
      >
        <button
          type="button"
          onClick={() => navigate('dashboard')}
        >
          <Brand />
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            bg-slate-50
            border
            border-slate-200
            text-slate-600
            hover:bg-indigo-50
            hover:text-indigo-600
            transition-all
          "
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-[100]
            bg-slate-900/30
            backdrop-blur-sm
          "
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="
              absolute
              left-0
              top-0
              bottom-0
              w-[290px]
              max-w-[85vw]
              bg-white
              shadow-2xl
              animate-[slideIn_.25s_ease-out]
            "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-[88px] px-5 flex items-center justify-between border-b border-slate-100">
              <Brand />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 pt-6">
              <div className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Placement Hub
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    active={activeTab === item.id}
                    onClick={() => navigate(item.id)}
                  />
                ))}
              </nav>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
              <UserCard
                name={userName}
                role={targetRole}
                onClick={() => navigate('profile')}
              />

              <button
                type="button"
                onClick={signOutAccount}
                className="
                  mt-2
                  w-full
                  flex
                  items-center
                  gap-2.5
                  px-3
                  py-2.5
                  rounded-xl
                  text-[11px]
                  font-semibold
                  text-slate-400
                  hover:text-red-500
                  hover:bg-red-50
                "
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative z-10 lg:ml-[270px] min-h-screen">
        {/* Desktop Header */}
        <header
          className="
            hidden
            lg:flex
            h-[72px]
            sticky
            top-0
            z-40
            px-8
            items-center
            justify-between
            bg-white/80
            backdrop-blur-xl
            border-b
            border-slate-200/70
          "
        >
          {/* Page */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-sm shadow-indigo-300" />

              <span className="text-sm font-bold text-slate-800">
                {currentPage?.label || 'Dashboard'}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 mt-1 ml-4">
              Placement Preparation Portal
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('quiz')}
              className="
                px-3.5
                py-2
                rounded-xl
                text-[11px]
                font-semibold
                text-slate-600
                bg-white
                border
                border-slate-200
                hover:border-indigo-200
                hover:text-indigo-600
                hover:bg-indigo-50
                transition-all
                duration-300
              "
            >
              Technical Quiz
            </button>

            <button
              type="button"
              onClick={() => navigate('interview')}
              className="
                px-4
                py-2
                rounded-xl
                text-[11px]
                font-bold
                text-white
                bg-gradient-to-r
                from-indigo-600
                to-blue-600
                shadow-md
                shadow-indigo-200
                hover:shadow-lg
                hover:shadow-indigo-200
                hover:-translate-y-0.5
                transition-all
                duration-300
              "
            >
              AI Mock Interview
            </button>

            <div className="ml-2 pl-3 border-l border-slate-200">
              <button
                type="button"
                onClick={() => navigate('profile')}
                className="
                  flex
                  items-center
                  gap-2.5
                  px-2
                  py-1.5
                  rounded-xl
                  hover:bg-slate-50
                  transition-all
                "
              >
                <div
                  className="
                    w-8
                    h-8
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-gradient-to-br
                    from-indigo-600
                    to-blue-500
                    text-white
                    text-[10px]
                    font-bold
                  "
                >
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-700 max-w-[110px] truncate">
                    {userName}
                  </div>

                  <div className="text-[9px] text-slate-400">
                    {targetRole}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          className="
            min-h-[calc(100vh-72px)]
            pt-[84px]
            lg:pt-8
            px-4
            sm:px-6
            lg:px-8
            pb-10
          "
        >
          <div
            key={activeTab}
            className="
              max-w-[1380px]
              mx-auto
              animate-[pageEnter_.4s_ease-out]
            "
          >
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'quiz' && <TechnicalQuizPage />}
            {activeTab === 'aptitude' && <AptitudePage />}
            {activeTab === 'notes' && <StudyNotesPage />}
            {activeTab === 'resume' && <ResumeAnalyzerPage />}
            {activeTab === 'interview' && <MockInterviewPage />}
            {activeTab === 'progress' && <ProgressTrackerPage />}
          </div>
        </main>
      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   ROOT APP
========================================================= */

export default function App() {
  return (
    <AppProvider>
      <AuthenticatedWorkspace />
    </AppProvider>
  );
}
