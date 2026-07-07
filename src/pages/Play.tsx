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
