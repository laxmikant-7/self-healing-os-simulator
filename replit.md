# Self-Healing OS Simulator

## Overview

A real-time web application that simulates an operating system with self-healing capabilities. The dashboard monitors system processes, file integrity, CPU/memory usage, and automatically detects and repairs faults. Built with a modern glassmorphism design aesthetic, it provides real-time visual feedback on system health with animations indicating state changes.

The application simulates OS-level operations including process management, file system monitoring, fault detection, and automated healing mechanisms, all displayed through an interactive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as the build tool and development server
- TailwindCSS for styling with custom design system
- Framer Motion for animations and transitions
- Wouter for client-side routing
- TanStack Query (React Query) for server state management

**Design System:**
- Glassmorphism aesthetic throughout with frosted glass cards
- Custom color system with HSL-based theming supporting light and dark modes
- Shadcn/ui component library (New York style variant) for consistent UI components
- Real-time visual feedback with color-coded health statuses (green/healthy, yellow/warning, red/critical)
- Responsive grid layout adapting from 1 column (mobile) to 2-3 columns (desktop)

**Component Architecture:**
- Dashboard serves as the main page orchestrating all components
- Isolated UI components for specific concerns:
  - `SystemHealth`: Circular gauge visualizations for CPU and memory metrics
  - `ProcessTable`: Tabular display of running processes with status indicators
  - `FileManager`: File system integrity monitoring with repair capabilities
  - `Logs`: Real-time event log display with type-based filtering
  - `Navbar`: Global navigation and action controls
- All components use Framer Motion for smooth state transitions and pulse animations

**State Management:**
- React Query for server state with 3-second polling interval
- Local React state for UI-specific concerns
- Custom theme context provider for dark/light mode switching

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js web framework
- TypeScript for type safety
- In-memory storage simulation (no actual database in current implementation)
- Drizzle ORM configured for PostgreSQL (schema defined but not actively used)

**API Design:**
RESTful endpoints following a resource-based pattern:
- `GET /api/state` - Retrieves complete system state (processes, files, logs, health metrics)
- `GET /api/processes` - Fetches all process information
- `POST /api/processes/update` - Updates specific process attributes
- `POST /api/detectFaults` - Injects random faults into the system (crashes processes, corrupts files)
- `POST /api/healFaults` - Triggers automated healing procedures for all faults
- `GET /api/files` - Fetches all system files with corruption status
- `POST /api/files/repair` - Repairs a specific corrupted file by ID
- `GET /api/health` - Retrieves system health metrics
- `POST /api/logs/add` - Adds a new log entry
- `GET /api/logs` - Retrieves all log entries

**Data Models:**
- Process: PID, name, memory usage, CPU usage, heartbeat timestamp, status
- SystemFile: ID, name, path, size, checksum, corruption flag, last modified
- LogEntry: ID, timestamp, type (info/warning/error/success), event, description
- SystemHealth: CPU percentage, memory percentage, overall status
- Fault: Type (process crash, file corruption, resource spike), affected resource details

**Business Logic:**
- Simulated process monitoring with random fault injection
- File integrity checking via checksum validation
- Automated healing logic that restarts crashed processes and repairs corrupted files
- Health metric calculation based on resource usage thresholds
- Event logging for all system state changes

### Build and Deployment

**Build Process:**
- Custom build script using esbuild for server bundling
- Vite for client bundling with optimized production builds
- Selective dependency bundling to reduce cold start times
- Server code bundled to single CommonJS file
- Client code output to `dist/public` directory

**Development Workflow:**
- Vite dev server with HMR for client development
- Express middleware mode integrating Vite during development
- TypeScript compilation checking without emit
- Drizzle Kit for database schema management

**Production Configuration:**
- Static file serving from built client directory
- Fallback to index.html for SPA routing
- Environment-based configuration (NODE_ENV)

## External Dependencies

### UI Component Libraries
- **Radix UI**: Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Shadcn/ui**: Pre-built component library built on Radix UI with Tailwind styling
- **Framer Motion**: Animation library for smooth transitions and gesture handling
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack Query (React Query)**: Server state management with automatic caching, refetching, and background updates
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for runtime type checking
- **Drizzle ORM**: TypeScript ORM configured for PostgreSQL (schema defined, database integration pending)

### Styling and Theming
- **TailwindCSS**: Utility-first CSS framework
- **Autoprefixer**: PostCSS plugin for vendor prefixing
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional className utilities

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Build tool and dev server
- **esbuild**: JavaScript bundler for server code
- **tsx**: TypeScript execution for Node.js

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit integration features
- **@replit/vite-plugin-dev-banner**: Development environment banner

### Database (Configured but Not Active)
- **PostgreSQL**: Relational database (schema defined via Drizzle, awaiting provisioning)
- **connect-pg-simple**: PostgreSQL session store for Express
- Database connection configured via `DATABASE_URL` environment variable

### Session Management (Available)
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL-backed session store (pending database provisioning)

### Additional Backend Dependencies
- **CORS**: Cross-origin resource sharing middleware
- **Nanoid**: Unique ID generation
- **date-fns**: Date/time manipulation utilities