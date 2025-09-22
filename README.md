# Mangawii Game Indexer

A modern, responsive game indexer built with React, featuring a beautiful UI/UX design with Arabic language support.

## 🎮 Features

- **Modern React Architecture**: Built with React 18 and Vite for fast development
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes with smooth animations
- **Advanced Search**: Real-time search with instant filtering
- **Game Selection**: Multi-select games with visual feedback
- **Smart Pricing**: Automatic price calculation based on total size
- **Export Options**: Copy to clipboard or send via WhatsApp
- **Arabic RTL Support**: Full right-to-left language support
- **Smooth Animations**: Framer Motion for delightful interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Mangawii-Game-Indexer-Cursor-Design
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📦 Build for Production

```bash
npm run build
```

## 🌐 Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Deploy:
```bash
npm run deploy
```

The site will be available at: `https://yourusername.github.io/Mangawii-Game-Indexer-Cursor-Design/`

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: Arabic (RTL) support
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Site header with theme toggle
│   ├── SearchBar.jsx  # Search functionality
│   ├── GameList.jsx   # Games display with selection
│   ├── SummaryBar.jsx # Bottom summary bar
│   ├── LoadingSpinner.jsx # Loading animation
│   └── SummaryModal.jsx  # Order summary modal
├── data/
│   └── games.js        # Game data and loading logic
├── App.jsx            # Main application component
├── main.jsx           # React entry point
└── index.css          # Global styles and Tailwind
```

## 🎨 Design Features

- **Glass Morphism**: Modern glassmorphism effects
- **Gradient Backgrounds**: Beautiful color gradients
- **Smooth Transitions**: 200ms transitions for all interactions
- **Responsive Grid**: Adaptive layout for all screen sizes
- **Custom Scrollbars**: Styled scrollbars for better UX
- **Loading States**: Elegant loading animations
- **Hover Effects**: Subtle hover animations throughout

## 🔧 Configuration

### Tailwind CSS
Custom color palette and animations defined in `tailwind.config.js`

### Vite Configuration
Optimized for GitHub Pages deployment in `vite.config.js`

### Game Data
Games are loaded from JSON files in the `/JSON` directory or fallback to static data in `src/data/games.js`

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🌙 Dark Mode

Automatic dark mode detection with manual toggle. Theme preference is maintained across sessions.

## 🎯 Performance Optimizations

- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Optimized assets
- **Bundle Analysis**: Built-in Vite analyzer
- **Lazy Loading**: Component-level lazy loading

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

Made with ❤️ using React and Tailwind CSS



