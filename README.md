# Metropolitan Police Stop & Search Dashboard

## Overview

This interactive web application analyzes Metropolitan Police stop and search data using the UK Police Data API. Built as a solution for the **ADSP (Applied Data Science Partners) Software Engineering Interview Task**, it provides comprehensive visualizations, statistical analysis, and trend insights to understand how stop and search policies have changed over time.

## Interview Task Requirements

This project fulfills all requirements specified in the ADSP interview brief:

### Core Requirements Completed

- **Programmatic Data Fetching**: Fetches all historical stop and search data from the UK Police Data API for the Metropolitan Police Service
- **Data Processing**: Comprehensive data cleaning, validation, and formatting
- **Next.js Web Application**: Responsive, user-friendly interface built with Next.js 15 and React 19
- **Interactive Visualizations**: Dynamic charts, graphs, and maps using ApexCharts and Leaflet
- **Filtering & Pagination**: Advanced filtering, sorting, and pagination functionality
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support and keyboard navigation
- **Performance Optimization**: Client-side caching, lazy loading, and code splitting
- **Error Handling**: Robust error handling with retry logic and user-friendly messages
- **Docker Deployment**: Complete containerization with production-ready configuration
- **Documentation**: Comprehensive setup, deployment, and usage instructions

### Additional Features Implemented

- **TypeScript**: Full type safety throughout the application
- **Material-UI Integration**: Professional UI components with dark/light theme support
- **Real-time Data**: Direct integration with UK Police Data API
- **Multi-layer Caching**: Browser cache, server-side cache, and API response caching
- **Map Clustering**: Intelligent marker clustering for improved map performance
- **Comprehensive Testing**: Cypress E2E tests with API mocking
- **SEO Optimization**: Meta tags and semantic HTML structure

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Material-UI (MUI) with custom theme
- **Charts**: ApexCharts for data visualizations
- **Maps**: React Leaflet for geographic data
- **Icons**: Tabler Icons

### Backend
- **API Routes**: Next.js API routes for data fetching
- **Data Source**: UK Police Data API (https://data.police.uk/api)
- **Caching**: In-memory caching with TTL

### Development & Deployment
- **Language**: TypeScript
- **Testing**: Cypress for E2E testing
- **Containerization**: Docker with multi-stage builds
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/dmaeoka/adsp
   cd adsp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Cypress E2E tests


## Features

### Dashboard Analytics
- **Real-time Statistics**: Total searches, search types, outcomes, and data periods
- **Demographic Analysis**: Age, gender, and ethnicity distributions
- **Search Type Breakdown**: Visual analysis of different search categories
- **Outcome Analysis**: Comprehensive outcome tracking and trends

### Interactive Visualizations
- **Donut Charts**: Gender, age, and search type distributions
- **Bar Charts**: Search outcomes and trend analysis
- **Interactive Map**: Geographic visualization with clustering and popups
- **Data Tables**: Sortable, filterable, and paginated record views

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Advanced Filtering**: Multi-criteria filtering with real-time updates
- **Search Functionality**: Text search across all record fields
- **Accessibility**: Full keyboard navigation and screen reader support

## Internal API Routes

### GET `/api/police-data`
Fetches stop and search data for a specific month and police force.

**Parameters:**
- `date` (required): Date in YYYY-MM format
- `force` (optional): Police force ID (defaults to 'metropolitan')

**Example:**
```bash
curl "http://localhost:3000/api/police-data?date=2024-01&force=metropolitan"
```

**Response:**
```json
{
  "data": [...],
  "month": "2024-01",
  "total": 1250,
  "fetched_at": "2024-01-15T10:30:00.000Z"
}
```

## External API Integration

- **Source**: UK Police Data API (https://data.police.uk/api)
- **Authentication**: No authentication required
- **Rate Limiting**: Handled automatically with exponential backoff
- **Data Coverage**: Historical data varies by police force (typically 2-3 years)

### Application Structure
```
├── src/app/                    # Next.js app directory
│   ├── [force]/               # Dynamic route for police forces
│   ├── api/                   # API routes
│   ├── components/            # React components
│   └── contexts/              # React context providers
├── cypress/                   # E2E tests
└── public/                    # Static assets
```

### Data Flow
```
UK Police API → Internal API Route → Client Cache → React Components
                     ↓
                Error Handling & Validation
                     ↓
                Response Caching & Rate Limiting
```

### Performance Optimizations

1. **Client-side Caching**: API responses cached for 5 minutes
2. **Server-side Caching**: Internal cache with configurable TTL
3. **Code Splitting**: Dynamic imports for chart components
4. **Lazy Loading**: Components loaded on demand
5. **Image Optimization**: Next.js automatic optimization
6. **Bundle Analysis**: Webpack bundle optimization

## Accessibility Features

- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Automatic adaptation for visual impairments
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Clear focus indicators and logical tab order

## Security & Error Handling

### Security Measures
- **Input Validation**: All API inputs validated and sanitized
- **CORS Configuration**: Proper cross-origin resource sharing
- **No Sensitive Data**: Public API with no authentication required
- **Rate Limiting**: API rate limiting with exponential backoff

### Error Handling
- **API Failures**: Graceful degradation with retry logic
- **Network Issues**: Offline detection and user feedback
- **Data Validation**: Client and server-side validation
- **User Feedback**: Clear error messages and recovery options

## Testing

### E2E Testing with Cypress

```bash
# Run all tests
npm run test:e2e

# Run specific test suites
npx cypress run --spec "cypress/e2e/dashboard.cy.ts"
npx cypress run --spec "cypress/e2e/api.cy.ts"
```

### Test Coverage
- Dashboard loading and rendering
- API endpoint functionality
- User interactions and filtering
- Error handling scenarios
- Performance benchmarks
- Accessibility compliance

## Known Limitations

1. **Data Availability**: Historical data varies by police force
2. **API Rate Limits**: External API has rate limitations (handled automatically)
3. **Location Accuracy**: Addresses are anonymized for privacy
4. **Real-time Data**: Data is historical, updated monthly
5. **Browser Support**: Optimized for modern browsers (Chrome, Firefox, Safari, Edge)

## Development

### Project Structure
- **Components**: Modular, reusable React components
- **Contexts**: Global state management with React Context
- **API Routes**: Server-side API endpoints
- **Types**: TypeScript type definitions
- **Utils**: Helper functions and services

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and best practices
- **Prettier**: Code formatting
- **Cypress**: End-to-end testing

## Interview Task Compliance

This implementation demonstrates:

1. **Full-stack Development**: Next.js with API routes and React frontend
2. **Data Engineering**: API integration, data processing, and caching
3. **Modern Web Practices**: TypeScript, responsive design, accessibility
4. **DevOps**: Docker containerization and deployment configurations
5. **Testing**: Comprehensive E2E testing with Cypress
6. **Documentation**: Detailed README and inline code documentation

## Future Enhancements

- **Advanced Analytics**: Machine learning insights and predictive modeling
- **Real-time Updates**: WebSocket integration for live data
- **User Accounts**: Saved filters and custom dashboards
- **Data Export**: CSV/PDF export functionality
- **Geographic Analysis**: Heat maps and geographic trend analysis

## Support

This application was built for the ADSP Software Engineering Interview Task. The implementation showcases modern web development practices, comprehensive data visualization, and production-ready deployment strategies.

For technical questions about the implementation, please refer to the inline code documentation and comments throughout the codebase.

---
