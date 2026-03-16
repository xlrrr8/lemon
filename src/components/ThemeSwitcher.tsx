import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import { Moon } from "lucide-react";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const isAlternative = theme === "charcoal" || theme === "darker";

    return (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-sm skeuo-panel">
            <Moon className="w-4 h-4 text-muted-foreground" />
            <Switch
                checked={isAlternative}
                onCheckedChange={(checked) => setTheme(checked ? "charcoal" : "standard")}
                className="data-[state=checked]:bg-orange-500"
            />
        </div>
    );
}
