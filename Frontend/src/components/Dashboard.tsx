import {Avatar, AvatarFallback, Header} from "@heroui/react";
import {useAuth} from "../hooks/useAuth.ts";
import {ThemeToggle} from "./ThemeToggloe.tsx";
import TaskList from "./TaskList.tsx";

export default function Dashboard() {
    const {user} = useAuth();
    return (<div className="relative flex justify-center w-svw h-svh select-none">
        <Header className='fixed flex bg-background z-50 h-24 flex-row items-center justify-around top-0 p-4'>
            <Avatar>
                <AvatarFallback>{user?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <ThemeToggle/>
        </Header>
        <TaskList/>
    </div>)
}