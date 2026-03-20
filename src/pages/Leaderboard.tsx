import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiZap } from 'react-icons/fi';
import { FaMedal, FaCrown } from 'react-icons/fa';
import { MdAccountCircle } from 'react-icons/md';
import { useProgressStore } from '@/hooks/useProgressStore';
import BottomNav from '@/components/BottomNav';

const demoFriends = [
  { name: 'Lena', xp: 1840, streak: 5, color: '#6366F1' },
  { name: 'Max', xp: 1620, streak: 3, color: '#E24B4A' },
  { name: 'Sophie', xp: 980, streak: 2, color: '#D97706' },
  { name: 'Noah', xp: 540, streak: 1, color: '#7C3AED' },
];

interface RankedUser {
  name: string;
  xp: number;
  streak: number;
  color: string;
  isUser: boolean;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const { store } = useProgressStore();
  const [friendInput, setFriendInput] = useState('');
  const [added, setAdded] = useState(false);
  const [addedName, setAddedName] = useState('');

  const userName = localStorage.getItem('investify_name')?.trim() || 'You';
  const realUser: RankedUser = {
    name: userName,
    xp: store.totalXP,
    streak: 7,
    color: '#059669',
    isUser: true,
  };

  const ranked: RankedUser[] = [
    realUser,
    ...demoFriends.map(f => ({ ...f, isUser: false })),
  ].sort((a, b) => b.xp - a.xp);

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumConfig = [
    { height: 52, width: 72, bg: '#C0DD97', rank: 2, avatarSize: 48 },
    { height: 72, width: 80, bg: '#EF9F27', rank: 1, avatarSize: 60 },
    { height: 38, width: 64, bg: '#F5C4B3', rank: 3, avatarSize: 48 },
  ];

  const handleSend = () => {
    if (!friendInput.trim()) return;
    setAddedName(friendInput.trim());
    setAdded(true);
    setFriendInput('');
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      className="min-h-screen pb-28"
      style={{ backgroundColor: '#FAF7F2' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1">
          <FiChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Leaderboard</h1>
        <div className="w-8" />
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 pt-8 pb-4 px-4">
        {podiumOrder.map((user, i) => {
          const cfg = podiumConfig[i];
          if (!user || !cfg) return null;
          const isFirst = cfg.rank === 1;
          return (
            <div key={user.name} className="flex flex-col items-center">
              {isFirst && <FaCrown size={20} color="#EF9F27" />}
              <div
                className="rounded-full flex items-center justify-center mb-1 relative"
                style={{
                  width: cfg.avatarSize,
                  height: cfg.avatarSize,
                }}
              >
                <MdAccountCircle size={cfg.avatarSize} style={{ color: user.color }} />
              </div>
              <span className="text-xs font-bold text-foreground">{user.name}</span>
              <span className="text-muted-foreground" style={{ fontSize: 11 }}>
                {user.xp.toLocaleString()} XP
              </span>
              <div
                className="flex items-end justify-center mt-1"
                style={{
                  width: cfg.width,
                  height: cfg.height,
                  backgroundColor: cfg.bg,
                  borderRadius: '8px 8px 0 0',
                  border: user.isUser ? '2px solid #059669' : undefined,
                }}
              >
                <span className="font-bold text-white text-lg pb-1">{cfg.rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* List (rank 4+) */}
      <div className="px-4 flex flex-col gap-1.5">
        {rest.map((user, i) => {
          const rank = i + 4;
          return (
            <div
              key={user.name}
              className="flex items-center rounded-2xl px-3.5 py-2.5"
              style={{
                backgroundColor: user.isUser ? '#ECFDF5' : 'white',
                border: user.isUser ? '2px solid #059669' : '1px solid hsl(var(--border))',
              }}
            >
              <span className="font-bold text-muted-foreground text-sm" style={{ minWidth: 20 }}>
                {rank}
              </span>
              {rank <= 3 ? (
                <FaMedal size={20} className="mx-2" style={{ color: rank === 1 ? '#EAB308' : rank === 2 ? '#EF9F27' : '#B87333' }} />
              ) : (
                <FaMedal size={18} className="mx-2 text-muted-foreground/30" />
              )}
              <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
                <MdAccountCircle size={36} style={{ color: user.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                  {user.isUser && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#059669', fontSize: 10 }}>
                      You
                    </span>
                  )}
                </div>
                <span className="text-xs text-orange-500 flex items-center gap-1"><FiZap className="w-3 h-3" fill="currentColor" /> {user.streak} day streak</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{user.xp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>
          );
        })}

        {/* Add Friend */}
        <div className="bg-white border border-border rounded-2xl p-3.5 mt-2">
          <p className="font-bold text-foreground" style={{ fontSize: 13 }}>Add a friend</p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={friendInput}
              onChange={e => setFriendInput(e.target.value)}
              placeholder="Enter name..."
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ backgroundColor: '#059669' }}
            >
              Send
            </button>
          </div>
          {added && (
            <motion.p
              className="text-sm mt-2"
              style={{ color: '#059669' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ Friend request sent to {addedName}!
            </motion.p>
          )}
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default Leaderboard;
