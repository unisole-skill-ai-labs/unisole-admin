import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/auth-slice";
import { ShieldCheck, Phone, KeyRound, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const isAuthenticated = useSelector((s: any) => s.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("+919876543210");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      if (data.dummyOtp) {
        setDevOtp(data.dummyOtp);
        setOtp(data.dummyOtp);
      }
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      if (data.user?.role !== "ADMIN") {
        throw new Error("Access denied. Admin account required.");
      }

      dispatch(setCredentials({ token: data.token, user: data.user }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass-card">
        <div className="login-brand">
          <div className="login-icon-badge">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h1>Unisole Admin panel</h1>
          <p className="subtitle">Secure administrative console</p>
        </div>

        {error && (
          <div className="alert-error">
            <span>{error}</span>
          </div>
        )}

        {devOtp && step === "otp" && (
          <div className="dev-otp-banner" onClick={() => setOtp(devOtp)}>
            <KeyRound size={16} />
            <span>Dev OTP: <strong>{devOtp}</strong> (Click to auto-fill)</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  required
                  autoFocus
                />
              </div>
              <small className="help-text">Default seeded admin: +919876543210</small>
            </div>

            <button type="submit" className="btn-primary-large" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" /> Sending OTP...
                </>
              ) : (
                <>
                  Send OTP <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="otp">Verification Code</label>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setStep("phone")}
                >
                  <ArrowLeft size={14} /> Change Number
                </button>
              </div>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <small className="help-text">Sent to {phone}</small>
            </div>

            <button type="submit" className="btn-primary-large" disabled={loading || !otp}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" /> Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleSendOtp}
              disabled={loading}
            >
              Resend Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
