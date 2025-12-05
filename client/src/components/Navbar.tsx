import { motion } from "framer-motion";
import { 
  RefreshCw, 
  Zap, 
  Shield, 
  Moon, 
  Sun, 
  Activity,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

interface NavbarProps {
  onInjectFault: () => void;
  onHealSystem: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isHealing: boolean;
  isInjecting: boolean;
}

export function Navbar({
  onInjectFault,
  onHealSystem,
  onRefresh,
  isRefreshing,
  isHealing,
  isInjecting,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-navbar h-16 px-4 md:px-6"
    >
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Terminal className="w-6 h-6 text-primary" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-status-healthy rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight">
              Self-Healing OS
            </h1>
            <span className="text-xs text-muted-foreground hidden sm:block">
              System Simulator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="destructive"
              size="sm"
              onClick={onInjectFault}
              disabled={isInjecting}
              className="gap-2"
              data-testid="button-inject-fault"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Inject Fault</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="default"
              size="sm"
              onClick={onHealSystem}
              disabled={isHealing}
              className="gap-2 bg-status-success hover:bg-status-success/90 text-white"
              data-testid="button-heal-system"
            >
              {isHealing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-4 h-4" />
                </motion.div>
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Heal System</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </Button>
          </motion.div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === "dark" ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </motion.div>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
