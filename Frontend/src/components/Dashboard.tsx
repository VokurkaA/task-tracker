import {Avatar, AvatarFallback, Button, Header, Surface} from "@heroui/react";
import {useAuth} from "../hooks/useAuth.ts";
import {ThemeToggle} from "./ThemeToggloe.tsx";
import TaskList from "./TaskList.tsx";
import {useEffect, useRef, useState} from "react";
import {Icon} from "@iconify/react";

export default function Dashboard() {
    const {user, logout} = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Simple level calculation based on XP (e.g., 100 XP per level)
    const level = user?.xp ? Math.floor(user.xp / 100) + 1 : 1;
    const progress = user?.xp ? user.xp % 100 : 0;

    return (<div className="relative flex justify-center w-svw h-svh select-none bg-default-50">
            <Header
                className='fixed flex bg-background/80 backdrop-blur-md z-50 h-20 flex-row items-center justify-between top-0 left-0 right-0 px-8 border-b border-default-100'>

                {/* Logo / Title */}
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Icon icon="gravity-ui:list-check" className="text-2xl"/>
                    <span>TaskTracker</span>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle/>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="outline-none focus:ring-2 ring-primary rounded-full transition-transform active:scale-95"
                        >
                            <Avatar size="md" className="cursor-pointer hover:opacity-80 transition-opacity">
                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                    {user?.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </button>

                        {isMenuOpen && (<Surface
                                className="absolute right-0 mt-3 w-64 p-4 rounded-xl shadow-xl border border-default-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-3 pb-3 border-b border-default-100">
                                    <Avatar size="sm">
                                        <AvatarFallback>{user?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-bold truncate">{user?.username}</span>
                                        <span className="text-xs text-default-500 truncate">{user?.email}</span>
                                    </div>
                                </div>

                                {/* Gamification Stats */}
                                <div className="bg-default-100 p-3 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-warning">Level {level}</span>
                                        <span className="text-default-500">{user?.xp} XP</span>
                                    </div>
                                    <div className="h-2 w-full bg-default-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-warning transition-all duration-500"
                                            style={{width: `${progress}%`}}
                                        />
                                    </div>
                                    <p className="text-xs text-default-400 text-center">{100 - progress} XP to next
                                        level</p>
                                </div>

                                <Button
                                    variant="danger-soft"
                                    className="w-full justify-start"
                                    onPress={logout}
                                >
                                    <Icon icon="gravity-ui:arrow-right-from-square"/>
                                    Sign Out
                                </Button>
                            </Surface>)}
                    </div>
                </div>
            </Header>

            <div className="pt-24 pb-10 px-4 w-full max-w-4xl h-full overflow-y-auto">
                <TaskList/>
            </div>
        </div>)
}
