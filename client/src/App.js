// Giao diện Register & Login tích hợp - Copy đè vào src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
    const [portfolio, setPortfolio] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('nexus_token'));
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        const endpoint = isRegister ? 'register' : 'login';
        try {
            const res = await axios.post(`http://localhost:5000/api/v2/${endpoint}`, { email, password });
            if (isRegister) {
                alert("Account Created! Login now.");
                setIsRegister(false);
            } else {
                localStorage.setItem('nexus_token', res.data.token);
                setToken(res.data.token);
                window.location.reload();
            }
        } catch (err) { alert("Auth Failed. Check your Node.js server!"); }
    };

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:5000/api/v2/portfolio', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setPortfolio(res.data))
                .catch(() => { localStorage.removeItem('nexus_token'); setToken(null); });
        }
    }, [token]);

    if (!token) {
        return (
            <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f8fafc' }}>
                <form onSubmit={handleAuth} style={{ background: '#1e293b', padding: '40px', borderRadius: '15px', width: '350px' }}>
                    <h2 style={{ textAlign: 'center', color: '#38bdf8' }}>{isRegister ? 'JOIN NEXUS' : 'NEXUS LOGIN'}</h2>
                    <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} style={inputStyle} required />
                    <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={inputStyle} required />
                    <button type="submit" style={btnStyle}>{isRegister ? 'REGISTER' : 'LOGIN'}</button>
                    <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', textAlign: 'center', marginTop: '15px', color: '#38bdf8' }}>
                        {isRegister ? 'Already an Orchestrator? Login' : 'New? Create Account'}
                    </p>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
                <h1>NEXUS <span style={{ color: '#38bdf8' }}>ORCHESTRATOR</span></h1>
                <button onClick={() => { localStorage.removeItem('nexus_token'); window.location.reload(); }} style={logoutBtn}>LOGOUT</button>
            </header>
            {portfolio && (
                <div style={{ marginTop: '40px' }}>
                    <div style={aiBox}>🤖 AI INSIGHT: {portfolio.ai_advice || "Market looks bullish. Keep building."}</div>
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={portfolio.data}>
                            <XAxis dataKey="sector" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="current_yield" fill="#38bdf8" name="Current (%)" />
                            <Line type="monotone" dataKey="ai_predicted_yield" stroke="#f472b6" name="AI Predicted (%)" strokeWidth={4} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' };
const logoutBtn = { padding: '0 20px', borderRadius: '8px', border: '1px solid #f87171', color: '#f87171', background: 'transparent', cursor: 'pointer' };
const aiBox = { background: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f472b6', marginBottom: '20px', fontStyle: 'italic' };

export default App;