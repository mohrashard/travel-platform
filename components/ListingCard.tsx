"use client";

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

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

interface ListingCardProps {
    listing: Listing;
    currentUser: any;
    initialIsSaved: boolean;
    onRequireAuth: () => void;
}

export default function ListingCard({ listing, currentUser, initialIsSaved, onRequireAuth }: ListingCardProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isSaving, setIsSaving] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const toggleSave = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the link
        if (!currentUser) {
            onRequireAuth();
            return;
        }

        setIsSaving(true);
        try {
            if (isSaved) {
                // Delete
                await supabase
                    .from('saved_listings')
                    .delete()
                    .match({ user_id: currentUser.id, listing_id: listing.id });
                setIsSaved(false);
            } else {
                // Insert
                await supabase
                    .from('saved_listings')
                    .insert([{ user_id: currentUser.id, listing_id: listing.id }]);
                setIsSaved(true);
            }
        } catch (err) {
            console.error("Error toggling save:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Link href={`/feed/${listing.id}`} className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer">
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

                {/* Like Button */}
                <button
                    onClick={toggleSave}
                    disabled={isSaving}
                    className="absolute top-4 left-4 p-2 rounded-full bg-white/70 backdrop-blur-md hover:bg-white transition-colors duration-200 shadow-sm"
                >
                    <svg
                        className={`w-5 h-5 transition-colors duration-200 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-600'}`}
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col flex-grow p-5 md:p-6">
                <div className="flex items-center text-sm font-medium text-blue-600 mb-2">
                    <svg className="w-4 h-4 mr-1 pb-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    );
}
