# 🍹 Bar Crawl Ultimate

A real-time collaborative bar crawl checklist app built with React and Vite.

## Features

✅ **Real-time Synchronization** - BroadcastChannel API for instant room-based sync (no login required)

✅ **Multi-person Tracking** - Track visits for multiple people across all bars

✅ **GPS Check-in** - Geolocation verification with proximity detection

✅ **Route Mapping** - Google Maps integration to visualize the crawl route

✅ **User Experience**
- Sound effects for interactions
- Vibration feedback
- Dark/Light theme toggle
- Confetti celebration when crawl is complete
- Persistent state via localStorage

✅ **Collaboration** - Share room link via URL hash for real-time group tracking

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── App.jsx           # Main app component
│   ├── index.jsx         # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies & scripts
```

## Usage

1. Open the app in a browser
2. Share the current URL with friends (same link = same room)
3. Mark bars as visited by clicking checkboxes
4. GPS check-in for physical proximity verification
5. View route on Google Maps
6. Celebrate when the crawl is complete!

## Architecture

### Rooms (No Login)
- Room ID derived from URL hash
- Default room if no hash provided
- Share link to sync with others in same room

### Real-time Sync
- Uses BroadcastChannel API for same-origin sync
- Broadcasts state updates when checkboxes change
- Fallback localStorage for persistence

### Geolocation
- Haversine formula for distance calculation
- 200m proximity threshold for check-in
- Browser geolocation API

## Browser Support

- Chrome/Edge 75+
- Firefox 79+
- Safari 15+
- Mobile browsers with geolocation support

## License

MIT
