import {useState} from "react";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import {useAuth} from "./hooks/useAuth";
import Dashboard from "./components/Dashboard.tsx";

function App() {
    const {user} = useAuth();
    const [activeScreen, setActiveScreen] = useState<"SignIn" | "SignUp">("SignIn");

    if (user) {
        return <Dashboard/>;
    }

    return activeScreen === "SignUp" ? (<SignUp setActiveScreen={setActiveScreen}/>) : (
        <SignIn setActiveScreen={setActiveScreen}/>);
}

export default App;
