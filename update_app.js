import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add Gamepad2 to lucide-react imports
code = code.replace(/ ShoppingBag,/, " ShoppingBag,\n  Gamepad2,");

// 2. Add FunArcade to lazy imports
code = code.replace(/const RockShop = React.lazy\(\(\) => import\('\.\/components\/RockShop'\)\);/, "const RockShop = React.lazy(() => import('./components/RockShop'));\nconst FunArcade = React.lazy(() => import('./components/FunArcade'));");

// 3. Update activeTab state type
code = code.replace(/useState<'home' \| 'dashboard' \| 'leaderboard' \| 'hub' \| 'quiz' \| 'badges' \| 'rules' \| 'terms' \| 'seo' \| 'developer' \| 'family' \| 'learn' \| 'shop' \| 'creator'>/, 
                    "useState<'home' | 'dashboard' | 'leaderboard' | 'hub' | 'quiz' | 'badges' | 'rules' | 'terms' | 'seo' | 'developer' | 'family' | 'learn' | 'shop' | 'creator' | 'arcade'>");

// 4. Update navItems
code = code.replace(/\{ id: 'shop', label: '🔥 Rock Shop', icon: ShoppingBag \},/, 
                    "{ id: 'shop', label: '🔥 Rock Shop', icon: ShoppingBag },\n        { id: 'arcade', label: 'Fun Arcade 🕹️', icon: Gamepad2 },");

// 5. Render FunArcade
code = code.replace(/\{activeTab === 'shop' && <RockShop userId=\{authState.userId \|\| userDeviceId \|\| ''\} role=\{authState.role as any\} onNavigateToTab=\{setActiveTab\} \/>\}/, 
                    "{activeTab === 'shop' && <RockShop userId={authState.userId || userDeviceId || ''} role={authState.role as any} onNavigateToTab={setActiveTab} />}\n                  {activeTab === 'arcade' && <FunArcade stats={stats} onExit={() => setActiveTab('home')} />}");

fs.writeFileSync('src/App.tsx', code);
