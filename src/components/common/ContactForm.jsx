import React, { useState } from 'react';
import { api } from '../../services/api.js';

export default function ContactForm() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult('');

    const formEl = event.target;
    const name = formEl.elements['name']?.value || '';
    const email = formEl.elements['email']?.value || '';
    const message = formEl.elements['message']?.value || '';

    try {
      // Submit through server backend for guaranteed database storage + Web3Forms dispatch
      const result = await api.submitContactForm({ name, email, message });
      if (result?.success) {
        setResult('Your message has been received. Our team will be in touch shortly.');
        formEl.reset();
      } else {
        setResult(result?.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('[ContactForm] Submission error:', err);
      setResult('Unable to send your message right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto text-xs font-sans">
      <div>
        <label className="block font-semibold text-neutral-700 mb-1">Name</label>
        <input
          type="text"
          name="name"
          required
          placeholder="Your name"
          className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
        />
      </div>
      <div>
        <label className="block font-semibold text-neutral-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="your.email@example.com"
          className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
        />
      </div>
      <div>
        <label className="block font-semibold text-neutral-700 mb-1">Message</label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Your message..."
          className="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white text-neutral-900 resize-y"
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Sending....' : 'Submit Form'}
      </button>
      {result && (
        <p className={`text-center font-medium ${result.includes('Successfully') ? 'text-emerald-700' : 'text-neutral-600'}`}>
          {result}
        </p>
      )}
    </form>
  );
}
