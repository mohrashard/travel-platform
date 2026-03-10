"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Listing {
    id: string;
    created_at: string;
    title: string;
    location: string;
    image_url: string;
    short_description: string;
    full_description: string;
    creator_name: string;
    price: number;
}

export default function ListingDetail() {
    const params = useParams();
    const id = params?.id as string;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchListing() {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    throw error;
                }

                setListing(data as Listing);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch listing details');
            } finally {
                setLoading(false);
            }
        }

        fetchListing();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium tracking-wide">Loading experience...</p>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pt-16">
                <div className="bg-white p-10 rounded-3xl shadow-lg text-center max-w-lg w-full border border-gray-100">
                    <svg className="mx-auto h-16 w-16 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Experience Not Found</h2>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">{error || "We couldn't find the listing you're looking for. It may have been removed."}</p>
                    <Link href="/feed" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition duration-150 inline-block w-full shadow-lg shadow-blue-500/30">
                        Return to Feed
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Navigation Spacer */}
            <div className="h-16"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Breadcrumb / Back button */}
                <div className="mb-8">
                    <Link href="/feed" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors group">
                        <span className="bg-gray-100 group-hover:bg-blue-50 p-2 rounded-full mr-3 transition-colors">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </span>
                        Back to Feed
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                    {/* Left Side: Image container (60% width on Desktop) */}
                    <div className="lg:w-[60%] w-full">
                        <div className="relative aspect-[4/3] lg:aspect-square w-full rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={listing.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80'}
                                alt={listing.title}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Right Side: Content container (40% width on Desktop) */}
                    <div className="lg:w-[40%] w-full flex flex-col pt-2 lg:pt-6">

                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm border border-blue-100 w-max">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {listing.location}
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.15]">
                            {listing.title}
                        </h1>

                        <div className="flex items-center justify-between border-y border-gray-100 py-6 mb-8">
                            <div className="flex items-center">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md border-2 border-white">
                                    {listing.creator_name ? listing.creator_name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-0.5">Experience hosted by</p>
                                    <p className="text-lg font-bold text-gray-900">{listing.creator_name || 'Anonymous'}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500 mb-0.5">Price</p>
                                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                    ${listing.price || 0}
                                </p>
                            </div>
                        </div>

                        <div className="prose prose-blue max-w-none flex-grow pb-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 px-1 border-l-4 border-blue-500 pl-3">About this experience</h3>
                            <p className="text-gray-600 leading-loose whitespace-pre-line text-[1.05rem] bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                {listing.full_description}
                            </p>
                        </div>

                        <div className="mt-auto pt-6 sticky bottom-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-xl">
                            <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-gray-900/20 transform hover:-translate-y-1 text-lg flex items-center justify-center group overflow-hidden relative">
                                <span className="relative z-10 flex items-center">
                                    Book Experience
                                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
