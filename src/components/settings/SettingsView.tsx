import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Settings, User, Sliders, Save, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const isMythic = theme === 'gow';

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    biography: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        fullName: profile.full_name || '',
        biography: profile.biography || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        username: formData.username,
        full_name: formData.fullName,
        biography: formData.biography,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
      
      // Update auth metadata if needed (optional)
      await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      });
      
    } catch (err) {
      console.error('Failed to update profile settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 transition-colors duration-300" style={{ background: 'var(--theme-bg-canvas, #070505)' }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <div className={cn(
               "flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl border relative overflow-hidden transition-all duration-300",
               isMythic ? "shadow-xl" : "shadow-md"
             )}
             style={{
               background: 'var(--theme-surface-card, #0E0606)',
               borderColor: 'var(--theme-border-default, #3D1C1C)'
             }}>
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-colors duration-300"
                 style={{
                   background: 'var(--theme-bg-subtle)',
                   borderColor: 'var(--theme-accent-secondary)',
                 }}>
              <Settings className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--theme-accent-secondary)' }} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-widest uppercase drop-shadow-md transition-colors duration-300 gamified-shaky-title"
                  style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}>
                System Settings
              </h1>
              <p className="text-sm font-medium opacity-80 transition-colors duration-300" style={{ color: 'var(--theme-text-muted, #A89898)' }}>
                Configure your account preferences and integrations.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="rounded-3xl border p-6 sm:p-8 shadow-lg flex flex-col gap-6"
             style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
          <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--theme-border-subtle)' }}>
            <User className="w-5 h-5" style={{ color: 'var(--theme-accent-cyan)' }} />
            <h2 className="text-lg font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
              Profile Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Display Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                style={{ 
                  background: 'var(--theme-bg-subtle)', 
                  borderColor: 'var(--theme-border-subtle)',
                  color: 'var(--theme-text-primary)'
                }}
                placeholder="E.g. Alex Morgan"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                style={{ 
                  background: 'var(--theme-bg-subtle)', 
                  borderColor: 'var(--theme-border-subtle)',
                  color: 'var(--theme-text-primary)'
                }}
                placeholder="E.g. alex_dev"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Biography</label>
              <textarea
                rows={4}
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-colors resize-none"
                style={{ 
                  background: 'var(--theme-bg-subtle)', 
                  borderColor: 'var(--theme-border-subtle)',
                  color: 'var(--theme-text-primary)'
                }}
                placeholder="Tell us about your coding journey..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              style={{
                background: 'var(--theme-accent-secondary)',
                color: '#000',
              }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
