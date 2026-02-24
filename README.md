# 🎯 Free Financial Calculators by Uva Kondisetty

A comprehensive web-based financial planning platform featuring SEPP 72(t) calculator, 401k projector, SIP/SWP calculators, lumpsum investment calculator, retirement planner, mortgage/EMI calculator, expense tracker, and live financial data. Multi-currency support (USD/INR) for US and Indian markets.

![Platform Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Key Features

### 💰 Investment & Retirement Calculators
- **SEPP 72(t) Calculator** - Early retirement withdrawal planning
- **401k Projector** - Retirement account growth projections
- **SIP Calculator** - Systematic Investment Plan with step-up
- **SWP Calculator** - Systematic Withdrawal Plan with tax planning
- **Lumpsum Calculator** - One-time investment growth analysis
- **Retirement Planner** - Goal-based retirement planning

### 🏠 Mortgage & Budget Tools
- **Mortgage Calculator (US)** - Home loan with PMI, taxes, insurance
- **EMI Calculator (India)** - Home loan amortization schedule
- **Expense Tracker** - Monthly budget and savings calculator

### 📊 Live Financial Data
- **Metals Prices** - Gold, Silver, Platinum, Palladium (USA & India)
- **Currency Rates** - Live USD to INR exchange rates
- **Tax Brackets** - USA & India income tax slabs
- **Mortgage Rates** - Current home loan interest rates
- **Federal Reserve** - Interest rate predictions and calendar

## ✨ Features

### 📊 SEPP Calculator (72(t) Withdrawal Planner)
- **Three IRS-approved methods**: RMD, Amortization, and Annuitization
- **Up to 21-year projections** with detailed year-by-year analysis
- **Tax impact calculations** and net income projections
- **Comprehensive comparison** with intelligent recommendations
- **Interactive info modals** explaining each method and formula
- **Professional-grade calculations** using IRS life expectancy tables

### 💰 401k Projector
- **Dynamic contribution optimization** maximizing annual limits ($23,500)
- **Automatic employer matching** calculations (up to 6%)
- **Multi-account tracking** (401k and 401a)
- **Salary growth projections** with annual increases
- **Bonus contribution handling** with 50% allocation optimization
- **Colorful analytics dashboard** with key insights and projections
- **Interactive help system** with detailed explanations

### 📊 Multi-Currency Investment Planning Tools
- **SIP Calculator** with step-up options and frequency selection (Monthly/Quarterly/Half-yearly/Yearly)
- **SWP Calculator** with tax planning and active trading mode
- **Lumpsum Calculator** with compound growth analysis
- **Retirement Planner** with advanced goal-based planning
  - **Accurate required savings calculation** using iterative binary search algorithm
  - **Pre-retirement and post-retirement goal tracking** with inflation adjustment
  - **Year-by-year cash flow analysis** showing portfolio growth and withdrawals
  - **Money depletion detection** with age-specific warnings
  - **Tax-aware calculations** on all withdrawals (expenses + goals)
  - **One-time and recurring goals** with customizable timelines and annual increases
  - **Living expenses tracking** with automatic retirement phase adjustment
  - **Intelligent surplus/shortfall display** showing exactly what you need to save
  - **Life expectancy calculations** with conservative post-retirement return rates
- **Monthly Expenses Calculator** with income tracking, expense management, and budget analysis
  - Monthly income tracking
  - 10 default expense categories with clickable emoji icons
  - Add/remove expenses dynamically
  - Real-time budget summary with savings rate calculation
  - Copy-to-clipboard for easy data transfer to other calculators
  - Mobile-optimized card-based layout
- **Multi-currency support** - USD ($) and Indian Rupee (₹) with intelligent formatting
- **Currency-specific defaults** and tax rates for US and Indian markets
- **Number-to-words conversion** supporting both Western and Indian numbering systems
- **Year-wise detailed projections** and cash flow analysis
- **Mobile-optimized interface** with responsive design

### 🔗 Live Financial Data Hub
- **USA & India metals pricing** (Gold, Silver, Platinum, Palladium)
- **Live USD to INR conversion** rates from trusted sources
- **Paycheck calculator** with tax withholdings and 401k deductions
- **Current mortgage rates** and terms from Bankrate
- **USA & India tax brackets** and slabs (2024 rates)
- **Federal Reserve rate calendar** and predictions (CME FedWatch)
- **Professional data sources** (Trading Economics, RIA Money Transfer)

### 🧮 Floating Calculator Widget
- **Always-available calculator** with drag-and-drop functionality
- **Minimize/maximize controls** with mobile-optimized touch support
- **Keyboard shortcuts support** with full numeric keypad
- **Copy/paste functionality** for seamless data entry
- **Persistent across all tabs** for continuous access
- **ESC key to close** and intelligent focus management

### 🎨 User Experience
- **Responsive design** - works on desktop, tablet, and mobile
- **Dark/Light themes** with smooth transitions and system preference detection
- **Professional UI** with gradient effects and hover animations
- **Fixed header/footer** for constant navigation access
- **Contextual help** with detailed calculation explanations
- **Real-time calculations** as you adjust parameters
- **Copy-to-clipboard** functionality for easy data export

## 🚀 Quick Start

### Docker Compose Deployment (Recommended)
```bash
# Clone the repository
git clone https://github.com/uvagopisrinivas/401k.git
cd 401k

# Deploy with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access at**: `http://your-server:6021`

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd retirement-planning-tools

# Install dependencies
npm install

# Build CSS from LESS
npm run build:css

# Serve locally (use any static server)
python -m http.server 8000
# or
npx serve .
```

Access at: `http://localhost:8000`

## 📁 Project Structure

```
retirement-planning-tools/
├── 📄 index.html              # Main application entry point
├── 📁 src/
│   ├── 📁 SEPP/               # SEPP Calculator module
│   │   ├── sepp_widget.html   # SEPP UI components
│   │   └── sepp_calculator.js # SEPP calculation logic
│   ├── 📁 401K/               # 401k Projector module
│   │   ├── 401k_widget.html   # 401k UI components
│   │   └── 401k_calculator.js # 401k calculation logic
│   ├── 📁 calculators/        # Multi-Currency Investment Planning Tools
│   │   ├── calculators_widget.html # Investment planning UI
│   │   ├── main_calculators.js     # Multi-currency utilities
│   │   └── 📁 widgets/             # Individual calculator widgets
│   │       ├── sip_calculator.js   # SIP calculations
│   │       ├── swp_calculator.js   # SWP calculations
│   │       ├── lumpsum_calculator.js # Lumpsum calculations
│   │       └── retirement_calculator.js # Retirement planning
│   ├── 📁 expenses/          # Monthly Expenses Calculator
│   │   ├── expenses_widget.html    # Expenses UI (integrated in calculators)
│   │   └── expenses_calculator.js  # Budget tracking logic
│   ├── 📁 links/             # Live financial data links
│   │   └── links_widget.html # External data sources
│   └── 📁 styles/            # Styling system
│       └── consolidated.css  # Compiled CSS
├── 🐳 Dockerfile            # Container configuration
├── 🐳 docker-compose.yml    # Docker Compose deployment
├── ⚙️ default.conf          # Nginx configuration
└── 📁 .github/workflows/    # GitHub Actions CI/CD
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: LESS preprocessor with CSS custom properties
- **Icons**: Font Awesome 6.4.0
- **Server**: Nginx (Alpine Linux)
- **Container**: Docker with Docker Compose
- **CI/CD**: GitHub Actions with automatic image builds
- **Updates**: Watchtower for automatic deployments

## 📊 Calculation Methods & Features

### SEPP Methods (IRS Section 72(t))

1. **Method 1 - RMD (Variable)**
   - Formula: `Annual Payment = Account Balance ÷ Life Expectancy Factor`
   - Variable payments based on account performance
   - Most conservative approach
   - Recalculated annually

2. **Method 2 - Amortization (Fixed)**
   - Formula: `PMT = PV × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]`
   - Fixed payments like a mortgage
   - Moderate withdrawal approach
   - Consistent income stream

3. **Method 3 - Annuitization (Fixed)**
   - Formula: `Annual Payment = Account Balance ÷ Present Value Factor`
   - Highest fixed payments
   - Most aggressive approach
   - Maximum early retirement income

### 401k Calculations

- **Dynamic Contribution %**: `(23,500 - Bonus Contribution) ÷ Salary`
- **Employer Match**: `min(Employee Contribution, 6% of Salary)`
- **Bonus Handling**: `10% of Salary × 50% to 401k`
- **401a Contribution**: `4% of Salary (fixed)`
- **Annual Growth**: Compound interest with salary increases

### Multi-Currency Investment Planning Calculations

- **SIP (Systematic Investment Plan)**: Monthly/Quarterly/Half-yearly/Yearly investments with step-up options
- **SWP (Systematic Withdrawal Plan)**: Regular withdrawals with tax planning and active trading modes  
- **Lumpsum**: One-time investment with compound growth analysis
- **Retirement Planning**: Goal-based planning with inflation adjustment and life expectancy calculations
- **Monthly Expenses**: Income tracking with multiple frequencies, expense categorization, and budget analysis
  - Income conversion: Bi-weekly (×26÷12) and Weekly (×52÷12) to monthly
  - Expense tracking: 10 default categories with customizable amounts
  - Budget metrics: Total expenses, remaining savings, and savings rate percentage
  - Currency-aware defaults: Different expense amounts for USD vs INR
- **Multi-Currency**: Calculations in both USD ($) and Indian Rupees (₹) with proper formatting
- **Currency-Specific Defaults**: Appropriate default values and tax rates for US and Indian markets
- **Number Systems**: Western (Trillion, Billion, Million) and Indian (Crore, Lac, Thousand) numbering

### Live Financial Data Sources

- **Metals Pricing**: Trading Economics, GoodReturns (India)
- **Currency Rates**: RIA Money Transfer (USD/INR)
- **Tax Information**: Fidelity (USA), Income Tax India
- **Mortgage Rates**: Bankrate
- **Federal Rates**: CME Group FedWatch Tool
- **Paycheck Calculator**: SmartAsset

## 🌐 Deployment

### Docker Compose Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/uvagopisrinivas/401k.git
   cd 401k
   ```

2. **Configure environment** (optional):
   ```bash
   # Create .env file for custom settings
   echo "DOMAIN=your-domain.com" > .env
   ```

3. **Deploy with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Verify deployment**:
   ```bash
   docker-compose ps
   docker-compose logs -f retirement-tools
   ```

5. **Access your application**:
   - Local: `http://localhost:6021`
   - Network: `http://your-server-ip:6021`

### GitHub Actions CI/CD

The included workflow automatically:
- ✅ Builds Docker images on every push
- ✅ Pushes to GitHub Container Registry
- ✅ Supports multi-architecture (AMD64/ARM64)
- ✅ Watchtower pulls updates within 1 hour

### Manual Docker Run
```bash
docker run -d \
  --name retirement-tools \
  -p 6021:80 \
  ghcr.io/your-username/your-repo-name:latest
```

## 🔧 Configuration

### Docker Compose Variables
```yaml
environment:
  - TZ=America/New_York
  - NGINX_HOST=${DOMAIN:-retirement.local}
  - NGINX_PORT=80
```

You can create a `.env` file to customize:
```env
DOMAIN=your-domain.com
TZ=Your/Timezone
```

### Nginx Customization
Edit `default.conf` for:
- Custom security headers
- Gzip compression settings
- Cache control policies
- SSL/TLS configuration

## 📈 Performance & Features

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: < 500KB total (including all assets)
- **Load Time**: < 2 seconds on 3G networks
- **Memory Usage**: < 50MB container footprint
- **Mobile Optimized**: Responsive design with touch-friendly controls
- **Multi-Currency**: USD ($) and Indian Rupee (₹) support with intelligent formatting
- **Currency-Aware Defaults**: Appropriate values and tax rates for different markets
- **Dual Number Systems**: Western and Indian numbering with proper number-to-words conversion
- **Copy-to-Clipboard**: Easy data export functionality
- **Floating Calculator**: Always-available draggable calculator widget
- **Theme Support**: Dark/Light modes with system preference detection
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🔒 Security Features

- **Content Security Policy** headers
- **XSS Protection** enabled
- **MIME type sniffing** disabled
- **Frame options** configured
- **HTTPS ready** with SSL support
- **Fixed header/footer** for consistent navigation

## 🧪 Testing

```bash
# Health check
curl http://localhost:6021/

# Container logs
docker logs retirement-tools

# Portainer stack logs
# View in Portainer UI under Stacks > retirement-tools > Logs
```

## 🔄 Updates

### Automatic Updates (Recommended)
- **Push to GitHub** → GitHub Actions builds new image
- **Watchtower detects** new image within 1 hour
- **Automatically pulls** and restarts container
- **Zero downtime** deployment

### Manual Updates
```bash
# Pull latest image and restart
docker-compose pull
docker-compose up -d

# View logs
docker-compose logs -f retirement-tools

# Stop services
docker-compose down
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is for educational and planning purposes only. It provides estimates based on user inputs and should not be considered as financial advice. The calculations are based on:

- **SEPP**: Current IRS regulations and life expectancy tables
- **401k**: Standard contribution limits and employer matching assumptions
- **Indian Investments**: Market assumptions and standard tax rates
- **Live Data**: Third-party sources that may have delays or inaccuracies

Always consult with qualified financial advisors, tax professionals, and estate planning attorneys before making retirement planning decisions. Market conditions, tax laws, and regulations may change, affecting the accuracy of projections.

## 🎯 Roadmap

- [ ] User accounts and saved calculations
- [ ] PDF report generation with charts
- [ ] Monte Carlo simulations for risk analysis
- [ ] Social Security integration (USA)
- [ ] EPF/PPF calculators (India)
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] Advanced tax optimization strategies
- [ ] Multi-language support (Hindi, Spanish)
- [ ] Real-time market data integration
- [ ] Portfolio rebalancing calculators
- [ ] Estate planning tools

---

**Built with ❤️ for comprehensive financial planning**

*Ready to deploy? Run `docker-compose up -d` and start planning your financial future with professional-grade tools!*