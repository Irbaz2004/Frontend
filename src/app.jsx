// App.jsx
import React from 'react';
import { AuthProvider } from './app/context/AuthContext';
import AppRoutes from './routes';

function App() {
    return (
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
    );
}

export default App;