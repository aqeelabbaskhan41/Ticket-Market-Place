'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FaTimes, FaBuilding, FaPhone, FaUniversity,
  FaCreditCard, FaUser, FaStore, FaExclamationTriangle,
  FaInfoCircle, FaChevronRight
} from 'react-icons/fa';

// Defined outside BecomeSellerModal so React sees a stable component reference
// across renders. Defining it inside would cause React to unmount/remount the
// input on every render (losing focus after each keystroke).
const Field = ({ id, label, icon, type = 'text', placeholder = '', required = false, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm text-blue-200 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm pointer-events-none">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-sm outline-none"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default function BecomeSellerModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Portal needs document to be available (client only)
  useEffect(() => {
    setMounted(true);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/roles/request-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(5, 10, 25, 0.85)' }}
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(99, 179, 237, 0.2)',
          maxHeight: '90vh',
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full flex-shrink-0" style={{ background: 'linear-gradient(90deg, #3b82f6, #818cf8, #a855f7)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.4)' }}>
              <FaStore className="text-blue-300 text-base" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Become a Seller</h2>
              <p className="text-xs text-blue-400">Submit your details for admin review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-400 hover:text-white transition"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <FaInfoCircle className="text-blue-400 mt-0.5 shrink-0 text-sm" />
            <p className="text-blue-300 text-xs leading-relaxed">
              Once approved by admin, you can switch between buyer and seller mode anytime from your dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <FaExclamationTriangle className="text-red-400 mt-0.5 shrink-0 text-sm" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Business fields */}
          <div className="space-y-3">
            <Field id="businessName" label="Business Name" icon={<FaBuilding />} placeholder="Your business or brand name" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
            <Field id="phone" label="Contact Phone" icon={<FaPhone />} type="tel" placeholder="Business phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          {/* Bank details divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-blue-400 uppercase tracking-widest font-semibold whitespace-nowrap">
              Bank Details <span className="normal-case tracking-normal font-normal text-blue-500/60">(optional)</span>
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <div className="space-y-3">
            <Field id="bankName" label="Bank Name" icon={<FaUniversity />} placeholder="e.g. Chase, Wells Fargo" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
            <Field id="accountNumber" label="Account Number" icon={<FaCreditCard />} placeholder="Your bank account number" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />
            <Field id="accountHolder" label="Account Holder Name" icon={<FaUser />} placeholder="Name on the account" value={formData.accountHolder} onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-blue-300 font-medium hover:text-white transition text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                Submit Request
                <FaChevronRight className="text-xs" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
