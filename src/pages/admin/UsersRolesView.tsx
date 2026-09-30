import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const UsersRolesView: React.FC = () => {
  const { user } = useAdminAuth();
  if (!user) return null;
  return <section className="space-y-5">
    <div><h1 className="text-2xl font-bold text-[#24313A]">Your administrator account</h1>
      <p className="mt-1 text-sm text-[#65727B]">Your current authorized access to DailyCar Fleet Operations.</p></div>
    <div className="max-w-2xl rounded-xl border border-[#DCE2E6] bg-white p-6 space-y-5">
      <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-[#2F6F6D]" /><span className="font-semibold">Active administrator</span></div>
      <dl className="grid sm:grid-cols-2 gap-5 text-sm">
        <div><dt className="text-[#65727B]">Name</dt><dd className="mt-1 font-semibold">{user.name}</dd></div>
        <div><dt className="text-[#65727B]">Email</dt><dd className="mt-1 font-semibold break-all">{user.email}</dd></div>
        <div><dt className="text-[#65727B]">Role</dt><dd className="mt-1 font-semibold">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</dd></div>
      </dl>
      <p className="border-t pt-4 text-xs leading-6 text-[#65727B]">Contact the account owner to add an administrator, change access or deactivate an account.</p>
    </div>
  </section>;
};
