# Vite + React (JSX) — vite-react-app

Minimal Vite + React starter (JavaScript/JSX).

Quick start (Windows PowerShell):

```powershell
cd "c:\Users\TEMP\3300 Rapid Prototype Development Final Project\vite-react-app"
npm install
npm run dev
```

- `dev`: starts Vite dev server
- `build`: builds for production
- `preview`: locally preview the production build

Optional VS Code extensions:
- ESLint
- Prettier

Notes:
- This project uses `@vitejs/plugin-react` — run `npm install` before starting.

UV → SPF feature:

- This app includes a small component that fetches the UV index for a given city and recommends an SPF value using OpenWeatherMap APIs.
- Get an API key by signing up at https://openweathermap.org/ and create an API key (free tier is fine).
- Create a `.env` file in the project root with the variable below (do not commit your real key):

```
VITE_OPENWEATHERMAP_API_KEY=your_api_key_here
```

Then run the dev server as shown above.

Geolocation & privacy:

- The app can use your browser's geolocation to fetch UV index for your current position. Your browser will ask for permission; if you deny permission the feature will not run.
- When you allow geolocation, the app sends your coordinates to OpenWeatherMap (their One Call API) to look up UV data. Coordinates are not stored by this project; they are sent only as part of the API request.
- If you prefer not to expose your coordinates to third-party services, run a small backend proxy that stores your API key server-side and forwards requests instead of calling the API directly from the browser.

Running the optional proxy server (recommended for hiding API keys):

1. Change to the `server` folder and install dependencies:

```powershell
cd server
npm install
```

2. Set your server API key (environment variable `OPENWEATHERMAP_API_KEY`). On Windows PowerShell you can run:

```powershell
$env:OPENWEATHERMAP_API_KEY = 'your_api_key_here'
npm start
```

The proxy listens on port 4000 by default and exposes two endpoints used by the frontend when available:
- `GET /api/geocode?q=City%2CCOUNTRY` — forwards to OpenWeatherMap Geocoding API
- `GET /api/onecall?lat=...&lon=...` — forwards to OpenWeatherMap One Call API (current uvi)

If you run the proxy, the frontend will try the `/api/*` endpoints first and automatically fall back to calling OpenWeatherMap directly if the proxy is not reachable.

How to run both (Windows PowerShell)

1. Install dependencies (root and server):

```powershell
cd "c:\Users\TEMP\3300 Rapid Prototype Development Final Project\vite-react-app\server"
npm install
cd ".."
npm install
```

2. Run both server and client together (two-step):

```powershell
cd "c:\Users\TEMP\3300 Rapid Prototype Development Final Project\vite-react-app"
npm run dev:all
```

Or run a single command that installs dependencies for both and starts them:

```powershell
cd "c:\Users\TEMP\3300 Rapid Prototype Development Final Project\vite-react-app"
npm run setup-and-dev
```
