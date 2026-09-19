import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Mail, Lock, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { login, authLoading } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("aditi.sharma@nith.ac.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
            <Compass size={24} strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Smart Internship Tracker</h1>
          <p className="mt-1 text-sm text-muted">Skill-matched recommendations, in one place.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-surface p-6 shadow-[0_4px_24px_-4px_rgba(18,33,59,0.06)]"
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-alert/30 bg-alert-soft px-3.5 py-2.5 text-sm text-alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Email</label>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 focus-within:border-brand">
            <Mail size={16} className="text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Password</label>
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 focus-within:border-brand">
            <Lock size={16} className="text-muted" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {authLoading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
