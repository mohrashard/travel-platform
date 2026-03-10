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
        <Link href={`/feed/${listing.id}`} className="group flex flex-col bg-white/[0.03] rounded-3xl overflow-hidden border border-white/[0.05] backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)] cursor-pointer relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative h-64 w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={listing.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10" />

                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#030712]/60 backdrop-blur-md text-white text-sm font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <span className="text-cyan-400">$</span>{listing.price || 0}
                </div>

                {/* Like Button */}
                <button
                    onClick={toggleSave}
                    disabled={isSaving}
                    className={`absolute top-4 left-4 z-20 p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 ${isSaved
                        ? 'bg-fuchsia-500/20 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                        : 'bg-[#030712]/50 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                >
                    <svg
                        className={`w-5 h-5 transition-all duration-300 ${isSaved
                            ? 'text-fuchsia-400 fill-current scale-110'
                            : 'text-neutral-300 group-hover:text-white'
                            }`}
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isSaved ? 1.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col flex-grow p-6 relative z-20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md w-fit mb-4">
                    <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">{listing.location}</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {listing.title}
                </h3>

                <p className="text-neutral-400 text-sm mb-8 line-clamp-2 flex-grow font-light leading-relaxed">
                    {listing.short_description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.05]">
                    <div className="flex items-center group/avatar cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-fuchsia-500 rounded-full blur-[8px] opacity-40 group-hover/avatar:opacity-80 transition-opacity" />
                            <div className="relative h-9 w-9 rounded-full border border-white/20 bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold mr-3 shadow-inner">
                                {listing.creator_name ? listing.creator_name.charAt(0).toUpperCase() : 'N'}
                            </div>
                        </div>
                        <span className="text-sm font-medium text-neutral-300 group-hover/avatar:text-white transition-colors">{listing.creator_name || 'Creator'}</span>
                    </div>
                    <span className="text-xs text-neutral-500 font-medium bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        {formatDate(listing.created_at)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
