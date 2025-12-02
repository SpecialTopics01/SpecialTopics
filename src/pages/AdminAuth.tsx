import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
export function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    team: '',
    password: '',
    confirmPassword: ''
  });
  const {
    signIn,
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        navigate('/admin/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp(formData.email, formData.password, formData.fullName, 'admin', formData.team);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  return <AuthLayout title={isLogin ? 'Admin Login' : 'Admin Registration'} subtitle={isLogin ? 'Access your dashboard' : 'Join your emergency team'} userType="admin">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && <>
            <Input label="Full Name" type="text" value={formData.fullName} onChange={e => setFormData({
          ...formData,
          fullName: e.target.value
        })} required fullWidth />

            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Team
              </label>
              <select id="team" value={formData.team} onChange={e => setFormData({
            ...formData,
            team: e.target.value
          })} required className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select your team</option>
                <option value="police">Police</option>
                <option value="fire">Fire Department</option>
                <option value="rescue">Rescue Team</option>
              </select>
            </div>
          </>}

        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({
        ...formData,
        email: e.target.value
      })} required fullWidth />

        <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({
        ...formData,
        password: e.target.value
      })} required fullWidth />

        {!isLogin && <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => setFormData({
        ...formData,
        confirmPassword: e.target.value
      })} required fullWidth />}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>}

        <Button type="submit" variant="primary" fullWidth disabled={loading} size="lg">
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link to="/" className="text-gray-600 hover:text-gray-700 text-sm">
          Are you a citizen? Click here
        </Link>
      </div>
    </AuthLayout>;
}