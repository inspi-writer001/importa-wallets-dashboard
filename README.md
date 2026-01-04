# tNGN Dashboard

A production-ready Next.js 15 dashboard application for monitoring the tNGN ERC20 Smart Contract. Built with TypeScript, Tailwind CSS, and modern Web3 libraries.

## Features

- Real-time blockchain event monitoring
- MetaTransfer execution tracking
- Fee collection analytics
- Interactive charts and visualizations
- Light/Dark theme support
- Responsive design with flat UI (no gradients)
- Advanced filtering and pagination

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **State Management**: @tanstack/react-query v5
- **Styling**: Tailwind CSS
- **Theme**: next-themes (Light/Dark mode)
- **Blockchain**: viem, wagmi
- **Charts**: recharts
- **Paradigm**: Functional Programming

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── providers.tsx       # React Query & Theme providers
│   ├── Header.tsx          # Dashboard header
│   ├── StatusIndicator.tsx # RPC connection status
│   ├── ThemeToggle.tsx     # Light/Dark mode toggle
│   ├── SummaryCards.tsx    # Metrics summary cards
│   ├── VolumeChart.tsx     # Area chart for volume
│   ├── TransferTypeChart.tsx # Pie chart for transfer types
│   ├── FeeBreakdownChart.tsx # Bar chart for fees
│   └── TransactionsTable.tsx # Data grid with filters
├── hooks/
│   ├── useWallets.ts       # Fetch tracked wallets from API
│   ├── useContractEvents.ts # Fetch blockchain events
│   └── useRpcStatus.ts     # Check RPC connection
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── abi.ts              # Smart contract ABI
│   ├── constants.ts        # App constants
│   └── utils.ts            # Utility functions
├── .env.local.example      # Environment variables template
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
└── package.json            # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_RPC_URL=https://rpc.ankr.com/eth
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PROXY_ADDRESS=0x...
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Key Components

### Custom Hooks

#### `useWallets`
Fetches the list of tracked wallet addresses from the API endpoint. Uses React Query for caching and automatic refetching.

#### `useContractEvents`
Queries blockchain for contract events (MetaTransferExecuted, FeesCollected, TokensBurned) using viem's `getLogs`. Filters events to only include transactions involving tracked wallets.

#### `useRpcStatus`
Monitors RPC connection status with periodic health checks.

### Dashboard Sections

1. **Summary Cards**: Displays key metrics
   - Total Active Wallets
   - MetaTransfers (24h)
   - Total Volume Processed
   - Total Fees Burned

2. **Charts**:
   - **Volume Chart**: Area chart showing transaction volume over time
   - **Transfer Type Chart**: Pie chart showing distribution of Importa Internal vs External transfers
   - **Fee Breakdown Chart**: Bar chart showing PSB, Importa, and FG fees

3. **Transactions Table**: Detailed view of MetaTransferExecuted events with:
   - Filtering by amount range
   - Pagination
   - Sortable columns

## Design System

The application uses a flat design system with solid colors only (no gradients):

### Light Mode
- Background: `#FFFFFF`
- Surface: `#F5F5F5`
- Border: `#E0E0E0`
- Primary: `#2563EB`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

### Dark Mode
- Background: `#0A0A0A`
- Surface: `#1A1A1A`
- Border: `#2A2A2A`
- Primary: `#3B82F6`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

## Smart Contract Events

The dashboard monitors these events from the tNGN contract:

### MetaTransferExecuted
```solidity
event MetaTransferExecuted(
    address indexed from,
    address indexed to,
    uint256 amount,
    bool isPlatformTransfer,
    address indexed relayer,
    uint256 nonce
)
```

### FeesCollected
```solidity
event FeesCollected(
    address indexed from,
    address indexed to,
    uint256 amount,
    uint256 psbFee,
    uint256 importaFee,
    uint256 fgFee,
    uint8 transferType
)
```

### TokensBurned
```solidity
event TokensBurned(
    address indexed from,
    uint256 amount,
    address indexed burner,
    BurnMetadata metadata
)
```

## API Integration

Wallet addresses are fetched from:
```
https://importa-pay-payments-x72y4.ondigitalocean.app/api/wallets/fetch-personal-users
```

Expected response format:
```json
{
  "response": ["0x...", "0x...", ...]
}
```

## Performance Optimizations

- React Query caching with 30s stale time
- Memoized calculations for metrics and charts
- Pagination for large data sets
- Efficient event filtering on the client side
- Tree-shakable viem for minimal bundle size

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
