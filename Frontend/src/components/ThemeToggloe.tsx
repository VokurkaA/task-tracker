
import {Label, Switch} from "@heroui/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = ()=>{
      setTheme(theme === "dark" ? "light" : "dark")
    }

  return (
      <Switch isSelected={theme === 'dark'} onChange={toggleTheme}>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label className="text-sm">{theme} theme</Label>
      </Switch>
  );
}