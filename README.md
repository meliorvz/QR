# PWA-QR-App

A Progressive Web App that generates QR codes using a terminal-style interface. 
It supports:

- **Multiple templates**: Free text, Contact vCard (with advanced collapsible fields), WiFi, Phone, SMS, and Email  
- **Color** selection for the QR code  
- **Copy** & **download** the generated QR code  
- Mobile-friendly layout  
- Offline caching with a service worker  

## Usage

1. **Install** dependencies:
   ```bash
   npm install
   ```

2. **Start** dev server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser
4. Choose [mode] to toggle among templates and fill in relevant fields
5. Pick color using the color picker on the right
6. Copy or download the resulting QR code

## Production Build

```bash
npm run build
```

Then deploy the build/ directory to a static host.

## Notes
- For advanced vCard usage, see buildVCard() in App.js – you can add further fields if desired.
- The service worker uses a simple caching strategy for offline usage. 