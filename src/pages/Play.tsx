import { motion } from 'framer-motion';
import ChessBoard from '@/components/ChessBoard';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const Play = () => {
    const [searchParams] = useSearchParams();
    const initialTime = parseInt(searchParams.get('time') || '0', 10);
    const increment = parseInt(searchParams.get('inc') || '0', 10);
    const mode = searchParams.get('mode') || 'human';
    const level = parseInt(searchParams.get('level') || '5', 10);
    
    return (
        <div className="h-screen bg-background flex flex-col items-center justify-center pb-8 px-1 md:px-4 relative overflow-hidden transition-colors duration-300">
            {/* Elegant Vibe Sync Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, 50, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                        x: [0, -60, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-orange-600/20 blur-[130px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, 30, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-rose-500/10 blur-[100px]"
                />
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] transition-colors duration-300" />
            </div>

            <Link to="/" className="hidden md:flex absolute top-6 left-6 items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-50">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
            </Link>

            {/* Board + side panel */}
            <motion.div
                className="w-full flex justify-center relative z-10"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <ChessBoard key={`${initialTime}-${increment}-${mode}-${level}`} initialTime={initialTime} increment={increment} mode={mode} level={level} />
            </motion.div>
        </div>
    );
};

export default Play;
