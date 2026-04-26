import { SearchIcon, PanelLeft } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { assets } from '../assets/assets'
import { UserButton } from '@clerk/clerk-react'

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <div className="w-full app-panel border-b px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
                        <input
                            type="text"
                            placeholder="Search projects, tasks..."
                            className="app-input pl-8 pr-4 py-2 w-full text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center app-panel app-card rounded-lg transition hover:scale-105 active:scale-95">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>

                    {/* User Button */}
                    <UserButton />
                                    </div>
            </div>
        </div>
    )
}

export default Navbar
