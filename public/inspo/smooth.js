import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const customStyles = {
  body: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    backgroundColor: '#F8F9FC',
    WebkitFontSmoothing: 'antialiased',
  },
  superCard: {
    borderRadius: '2.5rem',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  depthShadowPurple: {
    boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.4), 0 10px 20px -5px rgba(139, 92, 246, 0.2), inset 0 2px 4px rgba(255,255,255,0.3)',
  },
  depthShadowOrange: {
    boxShadow: '0 20px 40px -10px rgba(249, 115, 22, 0.3), 0 10px 20px -5px rgba(249, 115, 22, 0.15), inset 0 2px 4px rgba(255,255,255,0.3)',
  },
  depthShadowBlue: {
    boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.3), 0 10px 20px -5px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255,255,255,0.3)',
  },
  navIslandShadow: {
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)',
  },
};

const DayCard = ({ day, date, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[96px] rounded-[2rem] cursor-pointer transition-all ${
      isActive
        ? 'bg-[#1A1A1A] shadow-xl transform scale-105'
        : 'bg-white border border-gray-100 shadow-sm opacity-60'
    }`}
  >
    <span className={`text-xs font-bold mb-1 ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
      {day}
    </span>
    <span className={`text-2xl font-black ${isActive ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: '-0.04em' }}>
      {date}
    </span>
    {isActive && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>}
  </div>
);

const HomePage = () => {
  const [activeDay, setActiveDay] = useState('Mon');
  const [waterPercentage, setWaterPercentage] = useState(50);

  const days = [
    { day: 'Mon', date: 24 },
    { day: 'Tue', date: 25 },
    { day: 'Wed', date: 26 },
    { day: 'Thu', date: 27 },
    { day: 'Fri', date: 28 },
  ];

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .super-card:active {
        transform: scale(0.96);
      }

      .tight-text {
        letter-spacing: -0.04em;
      }
    `;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  return (
    <div className="bg-[#F8F9FC] text-[#1A1A1A] min-h-screen w-full overflow-hidden flex flex-col relative selection:bg-purple-200 selection:text-purple-900" style={customStyles.body}>
      <header className="px-6 pt-12 pb-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-200 to-pink-200 p-1 shadow-lg ring-4 ring-white">
            <img src="https://i.pravatar.cc/150?img=44" alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 tight-text uppercase tracking-wide">Good Morning</p>
            <h1 className="text-2xl font-extrabold tight-text text-gray-900">Marcus T.</h1>
          </div>
        </div>
        <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-transform text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-32 px-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-4 mb-4">
          {days.map((item) => (
            <DayCard
              key={item.day}
              day={item.day}
              date={item.date}
              isActive={activeDay === item.day}
              onClick={() => setActiveDay(item.day)}
            />
          ))}
        </div>

        <div className="relative w-full h-[320px] bg-[#8B5CF6] overflow-hidden mb-8 p-8 flex flex-col justify-between" style={{ ...customStyles.superCard, ...customStyles.depthShadowPurple }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A78BFA] rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#7C3AED] rounded-full blur-2xl opacity-50 -ml-10 -mb-10"></div>

          <div className="absolute top-1/2 right-[-20px] -translate-y-1/2 w-40 h-40">
            <div className="w-24 h-24 bg-[#FFD600] rounded-full absolute top-0 right-10 z-10" style={{ boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.2), 10px 10px 20px rgba(0,0,0,0.2)' }}></div>
            <div className="w-32 h-32 bg-[#C084FC] rounded-[2rem] absolute top-10 right-0 rotate-12 z-0" style={{ boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.2), 10px 10px 20px rgba(0,0,0,0.2)' }}></div>
          </div>

          <div className="relative z-10">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-wider mb-4 border border-white/10">DAILY GOAL</span>
            <h2 className="text-5xl font-black text-white tight-text leading-[0.9] mb-2 drop-shadow-sm">
              Mindful<br />Reset
            </h2>
            <p className="text-purple-100 text-sm font-medium w-2/3 leading-relaxed opacity-90">Complete your 15 minute breathing exercise before 10:00 AM.</p>
          </div>

          <div className="flex -space-x-3 relative z-10 mt-4">
            <img className="w-10 h-10 rounded-full border-2 border-[#8B5CF6]" src="https://i.pravatar.cc/150?img=32" alt="" />
            <img className="w-10 h-10 rounded-full border-2 border-[#8B5CF6]" src="https://i.pravatar.cc/150?img=12" alt="" />
            <img className="w-10 h-10 rounded-full border-2 border-[#8B5CF6]" src="https://i.pravatar.cc/150?img=5" alt="" />
            <div className="w-10 h-10 rounded-full border-2 border-[#8B5CF6] bg-white flex items-center justify-center text-[10px] font-bold text-purple-600">+8k</div>
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-gray-900 tight-text mb-6">Your Routine</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#3B82F6] p-6 relative overflow-hidden h-[280px] flex flex-col justify-between" style={{ ...customStyles.superCard, ...customStyles.depthShadowBlue }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#60A5FA] rounded-full blur-2xl opacity-40 -mr-8 -mt-8"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-white tight-text leading-none">
                Water<br />Intake
              </h4>
              <p className="text-blue-100 text-xs font-bold mt-2 opacity-80">1,250 / 2,500ml</p>
            </div>

            <div className="relative z-10">
              <div className="w-full h-24 bg-white/10 rounded-[1.5rem] mt-4 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full bg-blue-300/40 transition-all duration-500" style={{ height: `${waterPercentage}%` }}></div>
                <div className="absolute bottom-2 left-4 text-white font-bold text-lg">{waterPercentage}%</div>
              </div>
            </div>
          </div>

          <div className="bg-[#FF9F1C] p-6 relative overflow-hidden h-[280px] flex flex-col justify-between" style={{ ...customStyles.superCard, ...customStyles.depthShadowOrange }}>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFB703] rounded-full blur-2xl opacity-40 -ml-8 -mb-8"></div>

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold tracking-wider mb-3">MEDIUM</span>
              <h4 className="text-2xl font-black text-white tight-text leading-none">
                Sleep<br />Cycle
              </h4>
            </div>

            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white tight-text">7.5</span>
                <span className="text-orange-100 font-bold mb-1.5">hrs</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div className="text-xs text-orange-50 font-medium leading-tight">
                  Quality<br /><span className="text-white font-bold">Excellent</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white p-5 flex items-center gap-5 border border-gray-100" style={{ ...customStyles.superCard, boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)' }}>
            <div className="w-20 h-20 rounded-[1.5rem] bg-pink-100 flex-shrink-0 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover opacity-90 mix-blend-multiply" alt="" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 tight-text">Evening Wind Down</h4>
              <p className="text-gray-400 text-sm font-medium mt-1">Trainer: Sarah K.</p>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">15 min</span>
                <span className="px-3 py-1 bg-pink-50 rounded-lg text-xs font-bold text-pink-600">Relax</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8"></div>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-[#111111] h-20 rounded-[2.5rem] flex items-center justify-between px-2 z-50" style={customStyles.navIslandShadow}>
        <Link to="/" className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-lg transform transition-transform hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </Link>

        <Link to="/explore" className="w-16 h-16 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </Link>

        <Link to="/stats" className="w-16 h-16 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </Link>

        <Link to="/profile" className="w-16 h-16 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </nav>
    </div>
  );
};

const ExplorePage = () => (
  <div className="bg-[#F8F9FC] min-h-screen w-full flex items-center justify-center" style={customStyles.body}>
    <div className="text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Explore</h1>
      <p className="text-gray-500">Discover new wellness activities</p>
    </div>
  </div>
);

const StatsPage = () => (
  <div className="bg-[#F8F9FC] min-h-screen w-full flex items-center justify-center" style={customStyles.body}>
    <div className="text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Statistics</h1>
      <p className="text-gray-500">Track your wellness progress</p>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="bg-[#F8F9FC] min-h-screen w-full flex items-center justify-center" style={customStyles.body}>
    <div className="text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Profile</h1>
      <p className="text-gray-500">Manage your account settings</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;