import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();

  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    const success = signup(
      name,
      email,
      password
    );

    if (success) {
      navigate('/dashboard');
    } else {
      setError(
        'Please complete all fields.'
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
          <h1>Create Account</h1>

          <p>
            Start managing your expenses with Retain.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </div>

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
              placeholder="Create a password"
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
            Create Account
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>

      </div>

    </div>
  );
}

export default SignupPage;