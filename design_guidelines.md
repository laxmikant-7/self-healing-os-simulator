# Self-Healing OS Simulator - Design Guidelines

## Design Approach
**System Dashboard Approach** - Inspired by modern dev tools and system monitors (Linear's clarity + Vercel's glassmorphism + Terminal aesthetics). This is a technical dashboard prioritizing real-time data visibility and system status clarity.

## Core Design Principles
- **Glassmorphism aesthetic** throughout with frosted glass cards
- **Real-time visual feedback** - animations indicate system state changes
- **Color-coded health status** - immediate visual understanding of system health
- **Technical yet accessible** - professional monitoring interface with smooth interactions

## Typography
- **Primary Font**: 'Inter' or 'SF Pro Display' for clean, technical readability
- **Monospace Font**: 'JetBrains Mono' or 'Fira Code' for PIDs, file paths, and logs
- **Hierarchy**:
  - Title (Navbar): text-xl font-bold
  - Section Headers: text-lg font-semibold
  - Data Labels: text-sm font-medium
  - Metrics/Values: text-2xl font-bold (for gauges)
  - Logs/Processes: text-sm font-mono

## Layout System
- **Spacing Units**: Use Tailwind spacing of 2, 4, 6, 8, 12, 16, 24
- **Grid**: Dashboard uses CSS Grid with responsive columns (1 col mobile, 2-3 cols desktop)
- **Card Padding**: p-6 for all glassmorphism cards
- **Section Gaps**: gap-6 between cards, gap-4 within components

## Component Library

### Navbar
- Full-width sticky header with glassmorphism backdrop
- Left: "Self-Healing OS Simulator" title with pulse dot indicator
- Right: Action buttons (Inject Fault, Heal System, Refresh) with glass effect
- Height: h-16 with backdrop-blur-lg

### System Health Section
- Dual gauge layout (CPU and Memory side-by-side)
- Circular progress indicators with animated arcs
- Percentage display in center of each gauge
- Health status badge (Healthy/Warning/Critical) with appropriate colors
- Smooth value transitions using Framer Motion

### Process Table
- Glassmorphism card container
- Table headers: PID | Name | Memory | CPU | Heartbeat | Status
- Rows with alternating subtle opacity for readability
- **Status Indicators**:
  - Healthy: Green dot with gentle pulse
  - Warning: Yellow/orange dot with medium pulse
  - Critical/Crashed: Red dot with strong pulse animation
- Monospace font for PID and numerical values
- Hover effect: slight elevation and brightness increase

### File Manager
- List view with file name, size, checksum status
- **Corruption Indicator**: Red blinking icon animation for corrupted files
- Repair button appears inline for corrupted files
- File type icons with subtle animations on hover

### Logs Viewer
- Scrollable container with max-height
- Each log entry as a card with timestamp (monospace), event type, and description
- Color-coded log types:
  - Info: Blue accent
  - Warning: Orange accent
  - Error/Fault: Red accent
  - Success/Heal: Green accent
- Auto-scroll to newest entries
- Fade-in animation for new log entries
- Timestamp format: HH:MM:SS in muted text

### Action Buttons
- Glass effect background with backdrop-blur
- Primary actions: Inject Fault (red/orange accent), Heal System (green accent)
- Hover: Slight scale (scale-105) and brightness increase
- Active state: Scale down slightly (scale-95)
- Icon + text combination where appropriate

## Animation Specifications

### Page Load
- Stagger fade-in for all dashboard cards (delay: 0.1s increments)
- Slide-up animation (20px) combined with fade

### Real-time Updates
- Smooth number transitions for metrics (duration: 0.3s)
- Color transitions for status changes (duration: 0.4s)
- Pulse animations on fault detection:
  - Red glow pulse (1s duration, infinite loop)
  - Scale between 1 and 1.05

### Interactions
- Button hover: scale-105 + brightness increase (duration: 0.2s)
- Card hover: subtle elevation increase with shadow (duration: 0.3s)
- Table row hover: background opacity change (duration: 0.2s)

### Fault Indicators
- Red pulse effect: box-shadow glow animating opacity 0.4 to 1
- Blink animation for corrupted files: opacity cycling 0.3 to 1 (0.8s duration)

## Visual Styling

### Glassmorphism Cards
- Background: rgba with low opacity (bg-white/10 for dark mode feel)
- Backdrop filter: blur(12px)
- Border: 1px solid rgba(255,255,255,0.18)
- Shadow: Soft shadow for depth
- Border radius: rounded-lg (8px)

### Health Gauges
- Circular SVG progress rings
- Animated stroke-dashoffset for smooth value changes
- Gradient fills based on health:
  - 0-50%: Red to orange gradient
  - 51-75%: Orange to yellow gradient
  - 76-100%: Yellow to green gradient

### Status Color System
- **Healthy**: Emerald-500 (green)
- **Warning**: Amber-500 (orange/yellow)
- **Critical**: Red-500
- **Info**: Blue-500
- **Success**: Green-600

## Responsive Behavior
- Desktop (lg+): 3-column grid for main dashboard sections
- Tablet (md): 2-column grid
- Mobile: Single column stack
- Navbar buttons: Collapse to icons only on mobile
- Tables: Horizontal scroll on small screens

## Images
No hero images required - this is a technical dashboard application. All visuals are data-driven UI elements (gauges, charts, tables, status indicators).