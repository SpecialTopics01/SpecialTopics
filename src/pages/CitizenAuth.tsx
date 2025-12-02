import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
export function CitizenAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
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
        navigate('/citizen/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp(formData.email, formData.password, formData.fullName, 'citizen');
        navigate('/citizen/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  return <AuthLayout title={isLogin ? 'Citizen Login' : 'Citizen Registration'} subtitle={isLogin ? 'Report emergencies quickly' : 'Create your account'} userType="citizen">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && <Input label="Full Name" type="text" value={formData.fullName} onChange={e => setFormData({
        ...formData,
        fullName: e.target.value
      })} required fullWidth />}

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

        <Button type="submit" variant="danger" fullWidth disabled={loading} size="lg">
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-red-600 hover:text-red-700 text-sm font-medium">
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link to="/admin" className="text-gray-600 hover:text-gray-700 text-sm">
          Are you an admin? Click here
        </Link>
      </div>
    </AuthLayout>;
}