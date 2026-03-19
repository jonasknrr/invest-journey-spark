

## Plan: Leaderboard Page + Navigation

### 1. Create `src/pages/Leaderboard.tsx`
New page with:
- **Header**: sticky white bar with ← back button, centered "Leaderboard" title, empty right div
- **Data**: Combine `demoFriends` array + real user (from localStorage name, `useProgressStore` XP, streak 7, color #059669), sort by XP desc
- **Podium**: Top 3 displayed as podium blocks (2nd left, 1st center taller, 3rd right). Each has avatar circle with initial, name, XP, colored podium block with rank number. Crown emoji on #1. Green border on user's podium.
- **List (rank 4+)**: Scrollable cards with rank, avatar, name, streak pill, XP. User entry gets green border + bg + "You" badge.
- **Add Friend**: Card at bottom with text input + Send button. On send: show "✓ Friend request sent to [name]!" for 2s.
- **Animation**: framer-motion fade-in (opacity 0→1, y 20→0)
- Background: `#FAF7F2`, numbers formatted with `toLocaleString()`

### 2. Modify `src/App.tsx`
- Import Leaderboard
- Add `<Route path="/leaderboard" element={<Leaderboard />} />`

### 3. Modify `src/pages/LearningPath.tsx` (line ~136)
- Add 🏆 button after XP badge in header that navigates to `/leaderboard`

No other files changed.

