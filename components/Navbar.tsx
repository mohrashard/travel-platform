"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [session, setSession] = useState<any>(null);
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
        router.push('/login');
    };

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Lynkerr Travel
                        </Link>
                        <Link href="/feed" className="ml-8 hidden sm:block text-gray-500 hover:text-blue-600 font-medium transition duration-150">
                            Experiences
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {session ? (
                            <>
                                <Link
                                    href="/create"
                                    className="hidden sm:inline-flex text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition duration-150 ease-in-out"
                                >
                                    Create Listing
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-xl transition duration-150 ease-in-out shadow-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition duration-150 ease-in-out"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition duration-150 ease-in-out shadow-sm shadow-blue-600/20"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
