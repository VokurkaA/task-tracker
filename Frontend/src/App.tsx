import {useState} from "react";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import {useAuth} from "./hooks/useAuth";

function App() {
    const {user} = useAuth();
    const [activeScreen, setActiveScreen] = useState<"SignIn" | "SignUp">("SignIn");

    if (user) {
        return <div>hello</div>;
    }

    return activeScreen === "SignUp" ? (<SignUp setActiveScreen={setActiveScreen}/>) : (
        <SignIn setActiveScreen={setActiveScreen}/>);
}

export default App;
