# Metropolitan Police Stop & Search Dashboard

## Overview

This is an interactive web application that analyzes Metropolitan Police stop and search data using the UK Police Data API. The dashboard provides comprehensive visualizations, demographic analysis, and trend insights to understand how stop and search policies have changed over time.

**Built for the ADSP (Applied Data Science Partners) Software Engineering Interview Task.**

## Features

### 🔍 **Data Analysis**

- **Real-time API Integration**: Fetches historical data from the UK Police Data API
- **Comprehensive Statistics**: Displays total searches, date ranges, search types, and outcomes
- **Demographic Analysis**: Age, gender, and ethnicity breakdowns
- **Temporal Trends**: Monthly and yearly trend analysis

### 📊 **Interactive Visualizations**

- **Dynamic Charts**: Bar charts, line charts, and trend visualizations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Filtering**: Filter by date range, search type, demographics, and more
- **Search Functionality**: Text search across locations, outcomes, and objects

### 🎨 **User Experience**

- **Modern UI**: Built with Tailwind CSS and Flowbite React components
- **Dark Mode Support**: Automatic theme switching based on system preference
- **Accessibility**: WCAG 2.1 compliant with screen reader support
- **Performance Optimized**: Client-side caching, lazy loading, and code splitting

### 🔧 **Technical Features**

- **Error Handling**: Robust error handling with user-friendly messages
- **Data Caching**: Client-side and server-side caching for improved performance
- **API Rate Limiting**: Intelligent handling of API limits with retry logic
- **Data Validation**: Comprehensive input validation and sanitization

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Flowbite React
- **Icons**: Lucide React
- **Deployment**: Docker, Docker Compose
- **API**: UK Police Data API (https://data.police.uk/api)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd adsp-police-dashboard
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

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Deployment

### Docker Deployment (Recommended)

1. **Build and run with Docker Compose**

    ```bash
    docker-compose up --build
    ```

2. **For production deployment**

    ```bash
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    ```

3. **Access the application**
    - Local: http://localhost:3000
    - Production: Configure your domain in docker-compose.yml

### Manual Deployment

1. **Build the application**

    ```bash
    npm run build
    ```

2. **Start the production server**
    ```bash
    npm start
    ```

### Cloud Deployment Options

#### Vercel (Recommended for Next.js)

```bash
npm install -g vercel
vercel --prod
```

#### Netlify

```bash
npm run build
# Deploy the .next folder
```

#### AWS EC2 / DigitalOcean

```bash
# Use the provided Dockerfile and docker-compose.yml
docker-compose up -d
```

#### Heroku

```bash
# Add Heroku remote
heroku create your-app-name
git push heroku main
```

## API Documentation

### Internal API Endpoints

#### GET `/api/police-data`

Fetches stop and search data for a specific month.

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

## Architecture & Performance

### Performance Optimizations

1. **Client-side Caching**: API responses cached in memory
2. **Code Splitting**: Dynamic imports for non-critical components
3. **Image Optimization**: Next.js automatic image optimization
4. **Bundle Analysis**: Webpack bundle optimization
5. **Lazy Loading**: Components loaded on demand

### Accessibility Features

1. **WCAG 2.1 Compliance**: Level AA standards
2. **Screen Reader Support**: Proper ARIA labels and roles
3. **Keyboard Navigation**: Full keyboard accessibility
4. **High Contrast Mode**: Automatic adaptation
5. **Reduced Motion**: Respects user preferences

### Error Handling

1. **API Failures**: Graceful degradation with retry logic
2. **Network Issues**: Offline detection and messaging
3. **Data Validation**: Client and server-side validation
4. **User Feedback**: Clear error messages and recovery options

## Data Sources & Limitations

### UK Police Data API

- **Source**: https://data.police.uk/api
- **Coverage**: England, Wales, and Northern Ireland
- **Update Frequency**: Monthly
- **Data Anonymization**: Locations are approximate for privacy
- **Historical Range**: Varies by police force (typically 2-3 years)

### Known Limitations

1. **Rate Limiting**: API has rate limits (handled automatically)
2. **Data Availability**: Not all months have data for all forces
3. **Location Accuracy**: Addresses are anonymized to nearest street
4. **Real-time Data**: Data is historical, not real-time

## Contributing

### Development Guidelines

1. **Code Style**: Follow Prettier and ESLint configurations
2. **TypeScript**: Maintain strict type safety
3. **Testing**: Add tests for new features
4. **Documentation**: Update README and code comments
5. **Accessibility**: Ensure new features are accessible

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
├── types/                 # TypeScript type definitions
├── public/                # Static assets
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Container build instructions
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## Security Considerations

1. **API Security**: No sensitive data exposed
2. **CORS Handling**: Proper cross-origin resource sharing
3. **Input Validation**: All user inputs validated
4. **Environment Variables**: Secure configuration management
5. **Dependencies**: Regular security updates

## Troubleshooting

### Common Issues

1. **API Rate Limiting**

    ```
    Error: Rate limit exceeded
    Solution: Wait a few minutes or implement exponential backoff
    ```

2. **CORS Issues in Development**

    ```
    Error: CORS policy error
    Solution: Use the internal API route (/api/police-data)
    ```

3. **Build Failures**

    ```
    Error: Module not found
    Solution: Clear .next directory and rebuild
    ```

4. **Docker Issues**
    ```
    Error: Port already in use
    Solution: Stop existing containers or change port mapping
    ```

### Performance Issues

1. **Slow API Responses**
    - Check network connectivity
    - Verify API endpoint availability
    - Consider using cached data during development

2. **Large Dataset Rendering**
    - Pagination is implemented for tables
    - Chart data is limited to top items
    - Consider increasing browser memory if needed

3. **Memory Usage**
    - Clear browser cache if experiencing issues
    - Monitor Network tab in DevTools for excessive requests

## Interview Task Requirements Checklist

### ✅ Core Requirements Met

- [x] **Programmatic Data Fetching**: Fetches all historical stop and search data from Metropolitan Police
- [x] **Data Cleaning & Processing**: Comprehensive data processing and validation
- [x] **Next.js Web Application**: Responsive, user-friendly interface built with Next.js and React
- [x] **Interactive Visualizations**: Charts, graphs, and interactive elements using custom components
- [x] **Filtering & Pagination**: Advanced filtering, sorting, and pagination functionality
- [x] **Accessibility**: WCAG guidelines compliance with screen reader support
- [x] **Performance Optimization**: Caching, lazy loading, and optimization techniques
- [x] **Error Handling**: Robust error handling and data validation
- [x] **Docker Deployment**: Complete Docker setup with production configuration
- [x] **Documentation**: Comprehensive setup and deployment instructions

### 🚀 Additional Features Implemented

- [x] **TypeScript**: Full type safety throughout the application
- [x] **Dark Mode**: Automatic theme switching
- [x] **Real-time API Integration**: Direct integration with UK Police Data API
- [x] **Advanced Caching**: Multi-layer caching strategy
- [x] **Responsive Design**: Mobile-first responsive design
- [x] **Progressive Enhancement**: Works without JavaScript for basic functionality
- [x] **SEO Optimization**: Meta tags, structured data, and semantic HTML
- [x] **Monitoring**: Health checks and performance monitoring

## Deployment Examples

### Quick Start with Docker

```bash
# Clone and start the application
git clone <repository-url>
cd adsp-police-dashboard
docker-compose up --build

# Access at http://localhost:3000
```

### Production Deployment on AWS

```bash
# 1. Launch EC2 instance with Docker
# 2. Clone repository
git clone <repository-url>
cd adsp-police-dashboard

# 3. Configure environment
cp .env.example .env.production
# Edit .env.production with your settings

# 4. Deploy with SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Configure domain and SSL certificate
# Update nginx.conf with your domain
# Add SSL certificates to ./ssl/ directory
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# The application will be available at your Vercel domain
```

## API Integration Details

### Data Flow Architecture

```
UK Police API → Internal API Route → Client-side Cache → React Components
                     ↓
                Error Handling & Validation
                     ↓
                Response Caching & Rate Limiting
```

### Rate Limiting Strategy

1. **Client-side Throttling**: Prevents excessive API calls
2. **Server-side Caching**: 5-minute cache for API responses
3. **Exponential Backoff**: Automatic retry with increasing delays
4. **Error Recovery**: Graceful handling of API failures

### Data Processing Pipeline

1. **Fetch**: Retrieve raw data from multiple API endpoints
2. **Validate**: Check data integrity and format
3. **Transform**: Process dates, extract boroughs, generate IDs
4. **Aggregate**: Generate statistics and trend data
5. **Cache**: Store processed data for quick access
6. **Render**: Display in interactive components

## Testing

### Manual Testing Checklist

- [ ] Data loads successfully from API
- [ ] Filters work correctly with multiple selections
- [ ] Charts render properly with responsive design
- [ ] Table pagination and sorting function
- [ ] Search functionality works across all fields
- [ ] Dark mode toggles correctly
- [ ] Mobile responsiveness on various screen sizes
- [ ] Accessibility features work with screen readers
- [ ] Error states display appropriate messages
- [ ] Loading states provide user feedback

### Performance Testing

```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/police-data?date=2024-01"

# Load testing with Apache Bench
ab -n 100 -c 10 http://localhost:3000/

# Browser performance testing
# Use Chrome DevTools Lighthouse audit
```

## Monitoring & Analytics

### Application Metrics

- API response times
- Error rates and types
- Cache hit/miss ratios
- User interaction patterns
- Performance metrics (Core Web Vitals)

### Logging

```javascript
// Example log output
[2024-01-15T10:30:00.000Z] INFO: API request for 2024-01 (cache miss)
[2024-01-15T10:30:02.500Z] INFO: Successfully fetched 1,250 records
[2024-01-15T10:30:02.501Z] INFO: Data cached for 2024-01
```

## Future Enhancements

### Potential Improvements

1. **Advanced Analytics**
    - Machine learning insights
    - Predictive modeling
    - Anomaly detection

2. **Enhanced Visualizations**
    - Geographic mapping with heat maps
    - 3D visualizations
    - Time-series forecasting

3. **User Features**
    - User accounts and saved filters
    - Custom dashboards
    - Data export in multiple formats

4. **Technical Improvements**
    - Real-time data updates
    - Advanced caching with Redis
    - Microservices architecture

## License

This project is created for the ADSP Software Engineering Interview Task.

## Contact & Support

For questions about this implementation:

- **Technical Documentation**: See inline code comments
- **Architecture Decisions**: Documented in commit messages
- **Performance Benchmarks**: Available in development logs

---

**Note**: This application is designed to demonstrate full-stack development capabilities, data engineering skills, and modern web development practices as part of the ADSP interview process.
