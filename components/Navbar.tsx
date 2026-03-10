"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [session, setSession] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsMobileMenuOpen(false);
        router.push('/login');
    };

    return (
        <nav className="fixed w-full z-50 bg-[#030712]/60 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="group flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400">
                                Lynkerr
                            </span>
                        </Link>

                        <div className="hidden md:flex ml-12 items-center space-x-8">
                            <Link href="/feed" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors relative group">
                                Experiences
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                            </Link>
                            {session && (
                                <>
                                    <Link href="/my-listings" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors relative group">
                                        My Listings
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full" />
                                    </Link>
                                    <Link href="/saved" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors relative group">
                                        Saved
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fuchsia-500 transition-all duration-300 group-hover:w-full" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center space-x-5">
                            {session ? (
                                <>
                                    <Link
                                        href="/create"
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
                                    >
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Listing
                                    </Link>
                                    <div className="h-6 w-px bg-white/10 mx-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-neutral-300 hover:text-white transition-colors px-2"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#030712]/95 backdrop-blur-2xl border-b border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-6 py-8 space-y-6">
                        <div className="space-y-4">
                            <Link
                                href="/feed"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-lg font-medium text-neutral-300 hover:text-white transition-colors"
                            >
                                Experiences
                            </Link>
                            {session && (
                                <>
                                    <Link
                                        href="/my-listings"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-lg font-medium text-neutral-300 hover:text-white transition-colors"
                                    >
                                        My Listings
                                    </Link>
                                    <Link
                                        href="/saved"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-lg font-medium text-neutral-300 hover:text-white transition-colors"
                                    >
                                        Saved Experiences
                                    </Link>
                                    <Link
                                        href="/create"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-4 text-base font-bold rounded-2xl text-white bg-white/5 border border-white/10 shadow-lg"
                                    >
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create New Listing
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            {session ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-4 text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full py-4 text-center text-lg font-medium text-neutral-300 hover:text-white"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full py-4 text-center text-lg font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>

    );
}
