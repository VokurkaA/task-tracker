import {Avatar, Dropdown, Separator} from "@heroui/react";
import {useAuth} from "../hooks/useAuth.ts";
import {ThemeToggle} from "./ThemeToggloe.tsx";
import TaskList from "./TaskList.tsx";
import {Icon} from "@iconify/react";

export default function Dashboard() {
    const {user, logout} = useAuth();

    // Simple level calculation
    const level = user?.xp ? Math.floor(user.xp / 100) + 1 : 1;
    const progress = user?.xp ? user.xp % 100 : 0;

    return (<div className="min-h-screen flex flex-col bg-default-50">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-background px-6">
                <div className="flex items-center gap-2 text-primary">
                    <Icon icon="gravity-ui:list-check" className="size-6"/>
                    <span className="text-lg font-bold">TaskTracker</span>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle/>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <Avatar className="cursor-pointer" size="sm">
                                <Avatar.Fallback className="bg-primary text-primary-foreground font-bold">
                                    {user?.username.substring(0, 2).toUpperCase()}
                                </Avatar.Fallback>
                            </Avatar>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom right">
                            <Dropdown.Menu aria-label="User Actions">
                                <Dropdown.Section>
                                    <Dropdown.Item id="profile" textValue="Profile">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{user?.username}</span>
                                            <span className="text-xs text-default-500">{user?.email}</span>
                                        </div>
                                    </Dropdown.Item>
                                </Dropdown.Section>

                                <Separator/>

                                <Dropdown.Section>
                                    <Dropdown.Item id="stats" textValue="Stats">
                                        <div className="flex flex-col gap-2 py-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-warning">Level {level}</span>
                                                <span className="text-default-500">{user?.xp} XP</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-default-100">
                                                <div
                                                    className="h-full bg-warning"
                                                    style={{width: `${progress}%`}}
                                                />
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                </Dropdown.Section>

                                <Separator/>

                                <Dropdown.Item
                                    id="logout"
                                    textValue="Sign Out"
                                    onAction={logout}
                                    className="text-danger"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon icon="gravity-ui:arrow-right-from-square"/>
                                        <span>Sign Out</span>
                                    </div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="mx-auto max-w-4xl">
                    <TaskList/>
                </div>
            </main>
        </div>);
}