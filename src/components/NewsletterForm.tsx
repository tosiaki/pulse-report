'use client'; // Needs state and event handling

import React, { useState, FormEvent } from 'react';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('submitting');
        setMessage(null);

        // --- Mock API Call ---
        // In a real app, you would send the email to your backend/newsletter service here
        // Example: await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
        console.log('Subscribing email:', email);

        // Simulate network delay and response
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate success/error
        if (email && email.includes('@')) { // Simple validation for demo
            setStatus('success');
            setMessage('Thank you for subscribing!');
            setEmail(''); // Clear input on success
        } else {
            setStatus('error');
            setMessage('Please enter a valid email address.');
        }
        // --- End Mock API Call ---
    };

    return (
        <div className="mt-6 md:mt-0"> {/* Adjust margin for placement */}
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Stay Updated</h3>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                </label>
                <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:opacity-50"
                    placeholder="Enter your email"
                    disabled={status === 'submitting'}
                />
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex justify-center items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
            {/* Status Messages */}
            {message && (
                <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
