import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

const categories = [
  { value: 'student', label: 'Student' },
  { value: 'working_professional', label: 'Working Professional' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'general_user', label: 'General User' },
];
const ageGroups = ['under_18', '18_25', '26_40', '41_60', '60_plus'];
const experienceLevels = ['beginner', 'basic', 'intermediate', 'advanced'];

export default function Onboarding() {
  const [userCategory, setUserCategory] = useState('general_user');
  const [ageGroup, setAgeGroup] = useState('26_40');
  const [digitalExperienceLevel, setDigitalExperienceLevel] = useState('basic');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/onboarding', {
        userCategory, ageGroup, digitalExperienceLevel, preferredLanguage: 'en',
      });
      setUser(data.user);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-surface shadow-sm border border-border rounded-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">Tell us a bit about you</h2>
        <p className="text-textMuted text-sm">This helps us personalize your training. It only takes a moment.</p>

        <div>
          <label className="block mb-2 text-sm text-textMuted">I am a...</label>
          <select value={userCategory} onChange={(e) => setUserCategory(e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5">
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm text-textMuted">Age group</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5">
            {ageGroups.map((a) => <option key={a} value={a}>{a.replace('_', '-')}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm text-textMuted">Digital experience level</label>
          <select value={digitalExperienceLevel} onChange={(e) => setDigitalExperienceLevel(e.target.value)}
            className="w-full bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5">
            {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <button disabled={loading} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Saving...' : 'Continue to Dashboard'}
        </button>
      </form>
    </div>
  );
}
