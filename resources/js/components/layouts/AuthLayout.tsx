import { Outlet } from 'react-router-dom'
import { motion } from 'motion/react'

// Shapes flutuantes animadas (estilo HeroGeometric / Design.txt)
function FloatingShape({
    delay = 0, width = 400, height = 100, rotate = 0,
    gradient = 'from-white/[0.08]', className = '',
}: {
    delay?: number; width?: number; height?: number
    rotate?: number; gradient?: string; className?: string
}) {
    return (
        <motion.div
            className={`absolute pointer-events-none ${className}`}
            initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
            animate={{ opacity: 1, y: 0, rotate }}
            transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
        >
            <motion.div
                animate={{ y: [0, 18, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width, height }}
                className="relative"
            >
                <div className={[
                    'absolute inset-0 rounded-full',
                    'bg-gradient-to-r to-transparent',
                    gradient,
                    'backdrop-blur-[2px] border border-white/[0.12]',
                    'shadow-[0_8px_32px_0_rgba(255,255,255,0.06)]',
                    'after:absolute after:inset-0 after:rounded-full',
                    'after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]',
                ].join(' ')} />
            </motion.div>
        </motion.div>
    )
}

export default function AuthLayout() {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden"
             style={{ background: 'linear-gradient(135deg, rgb(92 233 213) 0%, rgb(229 96 38) 50%, rgb(36 181 130) 100%)' }}>

            {/* Dot grid sutil */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
                 style={{
                     backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                     backgroundSize: '28px 28px',
                 }} />

            {/* Shapes flutuantes — brancas translúcidas sobre o gradiente colorido */}
            <FloatingShape delay={0.2} width={620} height={145} rotate={12}
                gradient="from-white/[0.20]" className="left-[-8%] top-[18%]" />
            <FloatingShape delay={0.45} width={500} height={120} rotate={-14}
                gradient="from-white/[0.15]" className="right-[-5%] top-[65%]" />
            <FloatingShape delay={0.35} width={300} height={80} rotate={-22}
                gradient="from-white/[0.14]" className="left-[6%] bottom-[8%]" />
            <FloatingShape delay={0.6} width={200} height={58} rotate={20}
                gradient="from-white/[0.12]" className="right-[18%] top-[8%]" />
            <FloatingShape delay={0.7} width={140} height={40} rotate={-28}
                gradient="from-white/[0.10]" className="left-[28%] top-[6%]" />

            {/* Card de login */}
            <Outlet />
        </div>
    )
}
