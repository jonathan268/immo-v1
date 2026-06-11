'use client';

import { useAuth } from '@/lib/auth';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import { PageMeta } from '@/lib/seo';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      await usersApi.updateProfile({ full_name: fullName, phone: phone || undefined });
      setProfileSuccess(true);
      await refreshUser();
    } catch (err: any) {
      setProfileError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordSaving(true);
    try {
      await usersApi.changePassword({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <PageMeta title="Tableau de Bord" description="Gérez votre profil, vos annonces immobilières et vos demandes depuis votre tableau de bord Immo." />
      <div className="max-w-2xl space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary-800">Mon Profil</h1>
        <p className="text-primary-500 mt-1">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[var(--glass-border)]">
            <div>
              <p className="text-sm text-primary-500">Nom complet</p>
              <p className="font-medium text-primary-800">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-primary-500">Email</p>
              <p className="font-medium text-primary-800">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-primary-500">Téléphone</p>
              <p className="font-medium text-primary-800">{user.phone || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-primary-500">Rôle</p>
              <Badge variant={statusBadge(user.role)}>{user.role}</Badge>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-primary-500">Membre depuis</p>
              <p className="font-medium text-primary-800">{memberSince}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h2 className="font-heading font-semibold text-primary-800 text-lg">Modifier le profil</h2>
            {profileError && (
              <div className="p-3 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 text-sm text-red-700">{profileError}</div>
            )}
            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-400/15 backdrop-blur-sm border border-emerald-400/20 text-sm text-emerald-700">Profil mis à jour avec succès</div>
            )}
            <Input label="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button type="submit" loading={profileSaving}>Enregistrer</Button>
          </form>
        </div>
      </Card>

      <Card title="Changer le mot de passe">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 text-sm text-red-700">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-400/15 backdrop-blur-sm border border-emerald-400/20 text-sm text-emerald-700">Mot de passe changé avec succès</div>
          )}
          <Input label="Mot de passe actuel" type="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="Nouveau mot de passe" type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirmer le mot de passe" type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" loading={passwordSaving}>Changer le mot de passe</Button>
        </form>
      </Card>
    </div>
    </>
  );
}
