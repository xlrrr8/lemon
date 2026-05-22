import { useTheme } from "@/components/theme-provider";
import { Moon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-border backdrop-blur-sm skeuo-panel">
                    <Moon className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-border bg-card skeuo-panel shadow-xl">
                <DropdownMenuItem
                    onSelect={() => setTheme("standard")}
                    className={`cursor-pointer ${theme === "standard" ? "bg-accent text-accent-foreground" : ""}`}
                >
                    Standard Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => setTheme("charcoal")}
                    className={`cursor-pointer ${theme === "charcoal" ? "bg-accent text-accent-foreground" : ""}`}
                >
                    Charcoal
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => setTheme("batman")}
                    className={`cursor-pointer ${theme === "batman" ? "bg-accent text-accent-foreground" : ""}`}
                >
                    Batman
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
