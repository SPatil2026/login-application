import { useState, useEffect } from 'react';

const API_BASE = "/api/auth";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [welcomeMsg, setWelcomeMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setWelcomeMsg(null);
    setFormData({ username: '', email: '', password: '' });
  };

  const fetchDashboard = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setWelcomeMsg(data.message);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchDashboard(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin
          ? { email: formData.email, password: formData.password }
          : formData
        )
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        fetchDashboard(data.token);
      } else {
        setErrorMsg(data.error || 'Something went wrong');
      }
    } catch {
      setErrorMsg('Cannot connect to server');
    }
  };

  // UI for Logged In User
  if (welcomeMsg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-md">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👋</div>
          <h2 className="text-2xl font-bold text-gray-800">{welcomeMsg}</h2>
          <p className="text-gray-500 mt-2 mb-8 text-sm">{welcomeMsg} are successfully authenticated.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // UI for Login/Register
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-2">{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
        <p className="text-gray-500 mb-8">{isLogin ? 'Enter your details to sign in.' : 'Create an account to get started.'}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}

          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform active:scale-[0.98]">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-semibold hover:text-blue-800 transition"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;