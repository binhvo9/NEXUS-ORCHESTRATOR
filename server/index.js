const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const jwt = require('jsonwebtoken'); // Token engine
const bcrypt = require('bcryptjs'); // Security hashing
const app = express();
const PORT = 5000;

// Security configuration
const SECRET_KEY = "NEXUS_PRIVATE_KEY_2026"; // Secret for signing JWT

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// 1. DATA & USER STORE (Simulation for Portfolio)
// ---------------------------------------------------------
const users = []; // In-memory user store for demo purposes

const mockAssets = [
    { name: "Global Commercial REIT", sector: "Property", value: 1000000, allocation: 40, current_yield: 8.5 },
    { name: "AI Infrastructure ETF", sector: "Tech", value: 750000, allocation: 30, current_yield: 12.0 },
    { name: "Digital Asset Reserve", sector: "Crypto", value: 500000, allocation: 20, current_yield: 15.0 },
    { name: "Private Equity Fund", sector: "PE", value: 250000, allocation: 10, current_yield: 10.0 }
];

// ---------------------------------------------------------
// 2. SECURITY MIDDLEWARE (The Gatekeeper)
// ---------------------------------------------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid or Expired Token" });
        req.user = user;
        next(); // Proceed to the protected route
    });
};

// ---------------------------------------------------------
// 3. AUTHENTICATION ROUTES (Register & Login)
// ---------------------------------------------------------

// Register: Encrypt password and store user
app.post('/api/v2/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({ email: req.body.email, password: hashedPassword });
        console.log(`👤 New User Registered: ${req.body.email}`);
        res.status(201).json({ message: "User Created" });
    } catch {
        res.status(500).send("Registration Failed");
    }
});

// Login: Verify password and issue JWT
app.post('/api/v2/login', async (req, res) => {
    const user = users.find(u => u.email === req.body.email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) return res.status(401).json({ message: "Wrong credentials" });

    const accessToken = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token: accessToken });
});

// ---------------------------------------------------------
// 4. CORE ENGINE (AI Integration)
// ---------------------------------------------------------
const runAI = () => {
    return new Promise((resolve) => {
        const py = spawn('python3', ['../ai-engine/predictor.py']);
        py.stdout.on('data', (data) => {
            try {
                resolve(JSON.parse(data.toString()));
            } catch (e) {
                // Professional Fallback Logic
                resolve({
                    "Property": { "predicted_yield": 12.5, "signal": "HOLD" },
                    "Tech": { "predicted_yield": 24.8, "signal": "BUY" },
                    "Crypto": { "predicted_yield": 38.2, "signal": "BUY" },
                    "PE": { "predicted_yield": 15.0, "signal": "HOLD" }
                });
            }
        });
    });
};

// ---------------------------------------------------------
// 5. PROTECTED PORTFOLIO ROUTE (Authorized Only)
// ---------------------------------------------------------
app.get('/api/v2/portfolio', authenticateToken, async (req, res) => {
    try {
        const aiData = await runAI();
        const enrichedData = mockAssets.map(asset => ({
            ...asset,
            ai_predicted_yield: aiData[asset.sector]?.predicted_yield || 10,
            signal: aiData[asset.sector]?.signal || "HOLD"
        }));

        res.json({
            status: "success",
            user: req.user.email,
            summary: { total_value: mockAssets.reduce((s, a) => s + a.value, 0) },
            data: enrichedData
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Internal Engine Failure" });
    }
});

app.listen(PORT, () => console.log(`🚀 NEXUS Fortified Server: http://localhost:${PORT}`));