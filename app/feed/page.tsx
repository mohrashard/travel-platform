"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';

interface Listing {
    id: string;
    created_at: string;
    title: string;
    location: string;
    image_url: string;
    short_description: string;
    creator_name: string;
    price: number;
}

export default function FeedPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchListings() {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setListings(data as Listing[]);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch listings');
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Explore Experiences</h1>
                        <p className="mt-2 text-lg text-gray-600">Discover handpicked local journeys from creators around the world.</p>
                    </div>
                    <Link
                        href="/create"
                        className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition duration-150 ease-in-out shadow-sm shadow-blue-600/20"
                    >
                        Create Listing
                    </Link>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                        <p className="font-medium">Error loading experiences</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
                                <div className="h-48 bg-gray-200 w-full" />
                                <div className="p-6">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                                    <div className="h-16 bg-gray-200 rounded w-full mb-4" />
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm shadow-gray-200/50">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No experiences found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">There are currently no travel listings available. Be the first to create one!</p>
                        <Link
                            href="/create"
                            className="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition duration-150 ease-in-out shadow-sm shadow-blue-600/20"
                        >
                            Create the first listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((listing) => (
                            <Link href={`/feed/${listing.id}`} key={listing.id} className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer">
                                <div className="relative h-56 w-full overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={listing.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
                                        alt={listing.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                                        ${listing.price || 0}
                                    </div>
                                </div>

                                <div className="flex flex-col flex-grow p-6">
                                    <div className="flex items-center text-sm font-medium text-blue-600 mb-2">
                                        <svg className="w-4 h-4 mr-1 pb-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {listing.location}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {listing.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-grow">
                                        {listing.short_description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                                                {listing.creator_name ? listing.creator_name.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{listing.creator_name || 'Anonymous'}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {formatDate(listing.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
