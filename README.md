# FitTracker

A comprehensive fitness tracking web application built with Vue.js that helps you monitor your fitness progress, body measurements, and exercise performance.

## Features

- **Body Measurements Tracking**
  - Record weight, body measurements, and body composition data
  - Support for manual input and OCR scanning of bioimpedance reports
  - Track body fat percentage, muscle mass, bone mass, and water weight

- **Exercise Progress Tracking**
  - Log exercises with weights and reps
  - Calculate one-rep maximum (1RM)
  - View progress charts for each exercise

- **Analytics**
  - Visualize progress with interactive charts
  - Filter data by time periods
  - Track changes in body composition

- **Calculations**
  - TDEE (Total Daily Energy Expenditure) calculator
  - Water intake recommendations
  - One-rep maximum predictions

- **Privacy-First**
  - All data stored locally in your browser
  - No cloud storage or data sharing
  - Complete control over your fitness data

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (v7 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fittracker.git
   cd fittracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Pinia for state management
- Vue Router for navigation
- Chart.js for data visualization
- Tesseract.js for OCR processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chart.js for the charting library
- Tesseract.js for OCR capabilities
- Material Design Icons for the icon set
