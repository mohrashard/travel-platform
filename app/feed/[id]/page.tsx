"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
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
    user_id: string;
}

export default function ListingDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchListingData() {
            try {
                const [listingResponse, sessionResponse] = await Promise.all([
                    supabase.from('listings').select('*').eq('id', id).single(),
                    supabase.auth.getSession(),
                ]);

                if (listingResponse.error) throw listingResponse.error;

                setListing(listingResponse.data as Listing);

                if (sessionResponse.data.session) {
                    const user = sessionResponse.data.session.user;
                    setCurrentUser(user);

                    // Check if saved
                    const { data: savedData } = await supabase
                        .from('saved_listings')
                        .select('id')
                        .match({ user_id: user.id, listing_id: id })
                        .single();

                    if (savedData) setIsSaved(true);
                }
            } catch (err: any) {
                if (err.code !== 'PGRST116') { // Ignore row not found for saved_listings match
                    setError(err.message || 'Failed to fetch listing details');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchListingData();
    }, [id]);

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this listing? This action cannot be undone.");
        if (confirmed) {
            try {
                const { error } = await supabase.from('listings').delete().eq('id', id);
                if (error) throw error;
                router.push('/feed');
            } catch (err: any) {
                alert(err.message || "Failed to delete listing.");
            }
        }
    };

    const toggleSave = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        setIsSaving(true);
        try {
            if (isSaved) {
                await supabase
                    .from('saved_listings')
                    .delete()
                    .match({ user_id: currentUser.id, listing_id: id });
                setIsSaved(false);
            } else {
                await supabase
                    .from('saved_listings')
                    .insert([{ user_id: currentUser.id, listing_id: id }]);
                setIsSaved(true);
            }
        } catch (err) {
            console.error("Error toggling save:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center pt-16 relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[30%] left-[30%] w-[20%] h-[20%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen animate-pulse" />
                </div>
                <div className="flex flex-col items-center relative z-10">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                    <p className="mt-6 text-neutral-400 font-medium tracking-wide">Loading experience...</p>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center px-4 pt-16 relative overflow-hidden selection:bg-indigo-500/30">
                <div className="bg-white/[0.03] backdrop-blur-xl p-10 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.05)] text-center max-w-lg w-full border border-white/10 relative z-10">
                    <div className="w-16 h-16 mx-auto bg-red-500/10 flex items-center justify-center rounded-2xl mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Experience Not Found</h2>
                    <p className="text-neutral-400 mb-8 max-w-xs mx-auto">{error || "We couldn't find the listing you're looking for. It may have been removed."}</p>
                    <Link href="/feed" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] w-full">
                        <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                            <div className="relative h-full w-8 bg-white/20" />
                        </div>
                        <span className="relative z-10">Return to Feed</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] pb-20 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Navigation Spacer */}
            <div className="h-24"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
                {/* Breadcrumb / Actions */}
                <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <Link href="/feed" className="inline-flex items-center text-sm font-medium text-neutral-400 hover:text-cyan-400 transition-colors group w-max">
                        <span className="bg-white/5 border border-white/10 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 p-2 rounded-full mr-3 transition-colors">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </span>
                        Back to Feed
                    </Link>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                        {/* Like Button */}
                        <button
                            onClick={toggleSave}
                            disabled={isSaving}
                            className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-all border ${isSaved ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10 hover:text-white'}`}
                        >
                            <svg
                                className={`w-5 h-5 mr-2 transition-colors duration-200 ${isSaved ? 'text-fuchsia-400 fill-current' : 'text-neutral-400'}`}
                                fill={isSaved ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isSaved ? 1.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {isSaved ? "Saved" : "Save"}
                        </button>

                        {currentUser && currentUser.id === listing.user_id && (
                            <>
                                <Link href={`/edit/${listing.id}`} className="px-5 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-colors text-center">
                                    Edit
                                </Link>
                                <button onClick={handleDelete} className="px-5 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors">
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                    {/* Left Side: Image container */}
                    <div className="lg:w-[60%] w-full">
                        <div className="relative aspect-[4/3] lg:aspect-square w-full rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 group">
                            <div className="absolute inset-0 bg-black/20 z-10 transition-opacity duration-500 group-hover:opacity-0" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={listing.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80'}
                                alt={listing.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Right Side: Content container */}
                    <div className="lg:w-[40%] w-full flex flex-col pt-2 lg:pt-6">

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md w-fit mb-6 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">{listing.location}</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 tracking-tight leading-[1.15] mb-8">
                            {listing.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-white/10 py-6 mb-8 gap-4 bg-white/[0.02] -mx-4 px-4 sm:mx-0 sm:px-6 rounded-2xl">
                            <div className="flex items-center group/avatar">
                                <div className="relative mr-4 shrink-0">
                                    <div className="absolute inset-0 bg-fuchsia-500 rounded-full blur-[8px] opacity-40 group-hover/avatar:opacity-80 transition-opacity" />
                                    <div className="relative h-14 w-14 rounded-full border border-white/20 bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                                        {listing.creator_name ? listing.creator_name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-400 mb-0.5">Experience hosted by</p>
                                    <p className="text-lg font-bold text-white group-hover/avatar:text-cyan-300 transition-colors">{listing.creator_name || 'Anonymous'}</p>
                                </div>
                            </div>

                            <div className="text-left sm:text-right">
                                <p className="text-sm font-medium text-neutral-400 mb-0.5">Price</p>
                                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tight flex items-baseline justify-start sm:justify-end">
                                    <span className="text-2xl mr-1 text-cyan-400 opacity-90">$</span>
                                    {listing.price || 0}
                                </p>
                            </div>
                        </div>

                        <div className="flex-grow pb-10">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-cyan-400 rounded-full inline-block shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                                About this experience
                            </h3>
                            <div className="text-neutral-300 leading-relaxed whitespace-pre-line text-[1.05rem] bg-white/[0.03] p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                                {listing.full_description}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 sticky bottom-6 z-20 bg-[#030712]/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                            <button className="group relative w-full inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                                    <div className="relative h-full w-8 bg-white/20" />
                                </div>
                                <span className="relative z-10 flex items-center text-lg">
                                    Book Experience
                                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
