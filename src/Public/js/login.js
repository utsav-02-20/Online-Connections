const { useMemo, useState } = React;

function LoginPage() {
  const isRegisterRoute = window.location.pathname === "/register";
  const [mode, setMode] = useState(isRegisterRoute ? "signup" : "login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    remember: false,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const copy = useMemo(() => {
    return mode === "signup"
      ? {
          eyebrow: "Create Account",
          title: "Join now.",
          intro: "Create your user, save it in MongoDB, and open your custom username route.",
          action: "Sign Up",
          alternateText: "Already have an account?",
          alternateHref: "/login",
          alternateLabel: "Log in",
          endpoint: "/api/auth/register"
        }
      : {
          eyebrow: "Secure Access",
          title: "Welcome back.",
          intro: "Sign in with your username or email to continue to your custom page.",
          action: "Log In",
          alternateText: "Need an account?",
          alternateHref: "/register",
          alternateLabel: "Sign up",
          endpoint: "/api/auth/login"
        };
  }, [mode]);

  const onChange = ({ target }) => {
    const { name, type, checked, value } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    if ((mode === "signup" && !payload.username) || !payload.email || !payload.password) {
      setStatus(mode === "signup" ? "Enter username, email and password." : "Enter username/email and password.");
      return;
    }

    setLoading(true);
    setStatus(mode === "signup" ? "Creating your account..." : "Signing you in...");

    try {
      const response = await fetch(copy.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          mode === "signup"
            ? payload
            : {
                email: payload.email,
                username: payload.email,
                password: payload.password
              }
        )
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      const user = data.user || {};
      const username = user.username || payload.username;

      localStorage.setItem("auth_user", JSON.stringify(user));
      setStatus(mode === "signup" ? "Signup successful." : "Login successful.");

      if (username) {
        window.location.href = `/${username}/page_routes`;
      }
    } catch (error) {
      setStatus(error.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="intro">{copy.intro}</p>
        </div>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          {mode === "signup" ? (
            <label className="field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                placeholder="yourname"
                autoComplete="username"
                value={form.username}
                onChange={onChange}
                required
              />
            </label>
          ) : null}

          <label className="field">
            <span>{mode === "signup" ? "Email" : "Username or Email"}</span>
            <input
              type={mode === "signup" ? "email" : "text"}
              name="email"
              placeholder={mode === "signup" ? "you@example.com" : "yourname or you@example.com"}
              autoComplete={mode === "signup" ? "email" : "username"}
              value={form.email}
              onChange={onChange}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              required
            />
          </label>

          <div className="form-row">
            <label className="remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="link switch-btn"
              onClick={() => {
                const nextMode = mode === "login" ? "signup" : "login";
                setMode(nextMode);
                setStatus("");
                window.history.replaceState({}, "", nextMode === "signup" ? "/register" : "/login");
              }}
            >
              {copy.alternateLabel}
            </button>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Please wait..." : copy.action}
          </button>
          <p className="status" aria-live="polite">{status}</p>
          <p className="switch-copy">
            {copy.alternateText} <a href={copy.alternateHref} className="link">{copy.alternateLabel}</a>
          </p>
        </form>
      </section>

      <aside className="visual-panel">
        <div className="glass-card">
          <p className="card-label">Custom Username Route</p>
          <h2>Fast, focused, secure.</h2>
          <p>
            Sign up or log in, then land on a route like /username/page_routes.
          </p>
        </div>
      </aside>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LoginPage />);
