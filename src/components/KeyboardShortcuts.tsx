import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['↑', '↓', '←', '→'], description: 'Move between cells' },
    { keys: ['Tab'], description: 'Move to next cell' },
    { keys: ['Shift', 'Tab'], description: 'Move to previous cell' },
  ]},
  { category: 'Numbers', items: [
    { keys: ['1-9'], description: 'Enter a number' },
    { keys: ['0', 'Backspace', 'Delete'], description: 'Clear cell' },
  ]},
  { category: 'Actions', items: [
    { keys: ['N'], description: 'Toggle notes mode' },
    { keys: ['H'], description: 'Get a hint' },
    { keys: ['Ctrl/⌘', 'Z'], description: 'Undo last move' },
    { keys: ['Ctrl/⌘', 'Shift', 'Z'], description: 'Redo move' },
    { keys: ['P'], description: 'Pause/Resume game' },
  ]},
];

const KeyboardShortcuts = ({ onClose }: KeyboardShortcutsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Keyboard className="w-6 h-6 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.description}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {item.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 rounded bg-background border border-border text-foreground font-mono text-sm min-w-[28px] text-center shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            💡 Pro tip: Use notes mode to mark possible numbers in cells
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default KeyboardShortcuts;
