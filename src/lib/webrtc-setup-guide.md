# Cross-Platform WebRTC Setup Guide

## TURN Server Setup (Required for Production)

Since you're on Windows and sudo is disabled, here are your TURN server options:

### Option 1: Free Cloud TURN Service (Recommended for Development/Testing)
1. **OpenRelay (Metered)**: https://www.metered.ca/tools/openrelay/
   - Free tier: 50GB/month
   - Get your credentials and add to `.env`:
   ```env
   REACT_APP_TURN_USERNAME=your-openrelay-username
   REACT_APP_TURN_PASSWORD=your-openrelay-password
   REACT_APP_TURN_URL=stun:openrelay.metered.ca:443
   ```

2. **Twilio TURN**: https://www.twilio.com/docs/stun-turn
   - Paid service ($0.004/minute)
   - Enterprise-grade reliability

### Option 2: Windows TURN Server Setup
If you need a self-hosted solution:

1. **Install Node.js TURN Server**:
```bash
npm install -g @openvidu/openvidu-turn
openvidu-turn --help
```

2. **Run TURN Server**:
```bash
openvidu-turn --port 3478 --realm yourdomain.com --cli-username user --cli-password pass
```

3. **Update your WebRTC config** with local TURN server.

### Option 3: Docker TURN Server (If Docker is available)
```bash
# Pull and run Coturn in Docker
docker run -d --network=host instrumentisto/coturn
```

## Testing Cross-Platform Video Calling

### 1. Local Testing
- Open your app in multiple browser tabs/windows
- Test calls between different tabs (simulates different devices)

### 2. Device Testing
- Desktop browser ↔ Mobile browser (same WiFi)
- Different network conditions (WiFi ↔ Cellular)

### 3. Debug Tools
- Browser DevTools (F12) → Console
- Check WebRTC connection logs
- Monitor network requests to Supabase

## Mobile App Development

### React Native Setup
```bash
npx react-native init BukAlertMobile
cd BukAlertMobile
npm install react-native-webrtc @supabase/supabase-js
```

### Flutter Setup
```bash
flutter create buk_alert_mobile
cd buk_alert_mobile
flutter pub add flutter_webrtc supabase
```

Both can reuse your existing WebRTC logic and Supabase signaling!
