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
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl skeuo-btn flex items-center justify-center text-foreground hover:text-primary transition-all">
                    <Moon className="h-[1.2rem] w-[1.2rem] text-muted-foreground hover:text-primary transition-colors" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 skeuo-panel rounded-2xl p-2 shadow-2xl border border-white/10 backdrop-blur-xl">
                <DropdownMenuItem
                    onSelect={() => setTheme("standard")}
                    className={`cursor-pointer rounded-xl text-sm font-semibold py-2 px-3 transition-colors ${theme === "standard" ? "bg-primary/20 text-primary font-bold" : "hover:bg-muted/50"}`}
                >
                    Standard Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => setTheme("charcoal")}
                    className={`cursor-pointer rounded-xl text-sm font-semibold py-2 px-3 transition-colors ${theme === "charcoal" ? "bg-primary/20 text-primary font-bold" : "hover:bg-muted/50"}`}
                >
                    Charcoal
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => setTheme("batman")}
                    className={`cursor-pointer rounded-xl text-sm font-semibold py-2 px-3 transition-colors ${theme === "batman" ? "bg-primary/20 text-primary font-bold" : "hover:bg-muted/50"}`}
                >
                    Batman
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
