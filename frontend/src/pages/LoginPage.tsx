import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    const success = login(email, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError(
        'Please enter your email and password.'
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">
        
        <div className="auth-logo">
    Retain
  </div>

        <div className="auth-header">
          <h1>Welcome Back</h1>

          <p>
            Sign in to your Retain account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
          >
            Sign In
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup">
            Create one
          </Link>
        </p>

      </div>

    </div>
  );
}

export default LoginPage;