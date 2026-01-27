import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple test to verify React is working
const TestApp = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: 'red', color: 'white', fontSize: '24px' }}>
            <h1>REACT IS WORKING! 🎉</h1>
            <p>If you see this, React is rendering correctly.</p>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TestApp />
    </React.StrictMode>
);
