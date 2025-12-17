import {useState} from "react";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import {useAuth} from "./hooks/useAuth";
import Dashboard from "./components/Dashboard.tsx";
import {useTasks} from "./hooks/useTasks.ts";
import {Toaster} from "sonner";
import Loading from "./components/Skeleton.tsx";

function App() {
    const {user} = useAuth();
    const {isLoading} = useTasks()
    const [activeScreen, setActiveScreen] = useState<"SignIn" | "SignUp">("SignIn");

    if (isLoading) return <Loading/>

    return (<>
        <Toaster position="top-center"/>

        {user ? <Dashboard/> : (activeScreen === "SignUp" ? (<SignUp setActiveScreen={setActiveScreen}/>) : (
            <SignIn setActiveScreen={setActiveScreen}/>))}
    </>);
}

export default App;