# Bills Tracker - AI-Powered Utility Bill Management

A modern web application that uses AI to automatically parse and track your energy and gas bills. Upload your bills, let Claude AI extract the key information, review and confirm the data, then automatically update your yearly statistics.

## Features

### 📊 Dashboard

- **Yearly Overview**: See your total costs and consumption for the current year
- **Quick Stats**: Energy usage (kW), Gas usage (m³), and total spending
- **Year Navigation**: Easily switch between years to view historical data
- **Breakdown Details**: Detailed statistics for energy and gas separately

### 📤 Bill Upload & AI Parsing

- **Smart Upload**: Drag & drop or click to upload bill PDFs or images (JPG/PNG)
- **AI Extraction**: Claude 3.5 Sonnet automatically extracts:
  - Bill type (energy or gas)
  - Billing period
  - Total cost
  - Consumption amount
  - Confidence score
- **Review & Confirm**: Review extracted data before saving
- **Edit Capabilities**: Manually adjust any values if needed

### 📋 Bills Management

- **View All Bills**: Browse all uploaded and confirmed bills
- **Filtering**: Filter by status, year, and bill type
- **Quick Actions**: Confirm pending bills or delete incorrect entries
- **Bill Details**: View notes and extraction confidence

### 💾 Database Integration

- **Automatic Updates**: Yearly statistics automatically update when bills are confirmed
- **Data Persistence**: SQLite database for local storage
- **Transaction Support**: Ensures data consistency

## Tech Stack

- **Frontend**: Vue 3, Nuxt 4, Tailwind CSS
- **Backend**: Nuxt Server Routes (Nitro)
- **AI**: Anthropic Claude 3.5 Sonnet via Vercel AI SDK
- **Database**: Prisma ORM + SQLite
- **Language**: TypeScript

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### 1. Clone and Install

```bash
# Navigate to the project directory
cd bills-tracker

# Install dependencies (using npm, yarn, or bun)
npm install
# or
bun install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your Anthropic API key
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL="file:./dev.db"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create the database schema
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Upload a Bill

1. Click "Upload New Bill" on the dashboard or navigate to `/upload`
2. Drag and drop your bill image/PDF or click to select a file
3. The AI will automatically extract information from the bill
4. Review the extracted data and make any necessary corrections
5. Click "Confirm & Save" to save the bill and update yearly statistics

### View Dashboard

1. The home page shows your yearly summary
2. Use the year selector to view different years
3. See breakdown of energy and gas costs and consumption

### Manage Bills

1. Navigate to the "Bills" section to see all bills
2. Filter by status (pending/confirmed), year, or type
3. Confirm pending bills or delete incorrect entries
4. View bill notes and confidence scores

## API Endpoints

### Bills Management

- `POST /api/bills/parse` - Parse a bill image with AI
- `POST /api/bills/[id]/confirm` - Confirm a parsed bill
- `DELETE /api/bills/[id]` - Delete a bill
- `GET /api/bills` - Get bills (query params: status, year)

### Statistics

- `GET /api/stats` - Get yearly statistics (query param: year)

## Database Schema

### Bill Model

- `id`: Unique identifier
- `billType`: 'energy' or 'gas'
- `period`: Billing period (e.g., "January 2024")
- `cost`: Total cost in currency units
- `consumption`: Amount consumed
- `unit`: 'kW' or 'm³'
- `confirmed`: Boolean status
- `year` & `month`: For efficient querying
- `notes`: Optional notes from AI or user

### YearlyStats Model

- `year`: Year identifier (unique)
- `energyTotalCost`, `energyTotalConsumed`, `energyBillCount`: Energy statistics
- `gasTotalCost`, `gasTotalConsumed`, `gasBillCount`: Gas statistics
- `combinedTotalCost`: Total cost for the year

## File Structure

```
bills-tracker/
├── app/
│   ├── pages/
│   │   ├── index.vue          # Dashboard
│   │   ├── upload.vue         # Bill upload page
│   │   └── bills.vue          # Bills list page
│   ├── components/            # Vue components
│   ├── server/
│   │   ├── api/
│   │   │   ├── bills/         # Bill-related endpoints
│   │   │   └── stats.get.ts   # Statistics endpoint
│   │   └── utils/
│   │       ├── ai.ts          # AI parsing logic
│   │       └── db.ts          # Database utilities
│   └── app.vue                # Root component
├── prisma/
│   └── schema.prisma          # Database schema
└── nuxt.config.ts             # Nuxt configuration
```

## Important Notes

### API Key Security

⚠️ **Never commit your `.env.local` file or expose API keys in the code.**

The API key should only be used on the backend server. The frontend makes requests to the server, which then uses the API key securely.

### File Size Limits

- Maximum file size: 10 MB
- Supported formats: PDF, JPG, PNG

### AI Confidence

The application displays a confidence score (0-1) for each parsed bill. Always review bills with low confidence scores before confirming.

### Data Privacy

All data is stored locally in the SQLite database. No bill data is sent to external services except through the Anthropic API for parsing.

## Troubleshooting

### "Failed to parse bill" error

1. Check that your bill image is clear and readable
2. Ensure the file format is supported (PDF, JPG, PNG)
3. Verify your Anthropic API key is correct
4. Check your API quota and rate limits

### Database errors

1. Ensure `DATABASE_URL` is correctly set in `.env.local`
2. Run `npx prisma migrate dev` to fix schema issues
3. Check file permissions in the project directory

### Build errors

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Rebuild Prisma: `npx prisma generate`
3. Check Node.js version: `node --version` (should be 18+)

## Development

### Run Tests

```bash
npm run test
```

### Build for Production

```bash
npm run build
npm run preview
```

### Database Management

```bash
# Open Prisma Studio to view/edit data
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Check the Anthropic API documentation
4. Open an issue in the repository

---

**Happy bill tracking! 📊💰**
