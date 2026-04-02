'use client';

import { useState } from 'react';

export default function CreateRolePage() {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: roleName.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setRoleName('');
        setTimeout(() => {
          window.location.href = '/admin/roles';
        }, 1000);
      } else {
        setError(data.message || 'Failed to create role');
      }
    } catch (error) {
      setError('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Tạo mới role</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Role created successfully! Redirecting...</div>}

      <div className="form-horizontal">
        <h4>Tạo mới role.</h4>
        <hr />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="col-md-2 control-label">Role name</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="col-md-offset-2 col-md-10">
              <button type="submit" className="btn btn-default" disabled={loading}>
                {loading ? 'Creating...' : 'Tạo Role'}
              </button>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => window.location.href = '/admin/roles'}
                style={{ marginLeft: '10px' }}
              >
                Thôi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}