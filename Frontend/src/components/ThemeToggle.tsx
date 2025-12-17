import {Switch} from "@heroui/react";
import {useTheme} from "next-themes";
import {Icon} from "@iconify/react";

export function ThemeToggle() {
    const {theme, setTheme} = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (<Switch defaultSelected={theme === 'dark'} onChange={toggleTheme} size="lg">
        {({isSelected}) => (<>
            <Switch.Control>
                <Switch.Thumb>
                    <Switch.Icon>
                        <Icon icon={isSelected ? "gravity-ui:moon" : "gravity-ui:sun"}/>
                    </Switch.Icon>
                </Switch.Thumb>
            </Switch.Control>
        </>)}
    </Switch>);
}