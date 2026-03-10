"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { useRouter } from 'next/navigation';

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

const ITEMS_PER_PAGE = 6;

export default function SavedListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
    const [savedIdSet, setSavedIdSet] = useState<Set<string>>(new Set());
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const router = useRouter();

    const fetchListings = useCallback(async (idsToFetch: string[], isLoadMore = false, currentSearch = '') => {
        if (!idsToFetch || idsToFetch.length === 0) {
            setListings([]);
            setHasMore(false);
            setLoading(false);
            setLoadingMore(false);
            return;
        }

        try {
            const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('listings')
                .select('*', { count: 'exact' })
                .in('id', idsToFetch)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (currentSearch) {
                query = query.or(`title.ilike.%${currentSearch}%,location.ilike.%${currentSearch}%`);
            }

            const { data, count, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            if (isLoadMore) {
                setListings((prev) => [...prev, ...(data as Listing[])]);
                setPage(page + 1);
            } else {
                setListings(data as Listing[]);
                setPage(0);
            }

            setHasMore(count !== null && from + ITEMS_PER_PAGE < count);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch saved listings');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [page]);

    useEffect(() => {
        async function initializeData() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const user = session.user;
            setCurrentUser(user);

            const { data: savedData, error: savedError } = await supabase
                .from('saved_listings')
                .select('listing_id')
                .eq('user_id', user.id);

            if (savedError) {
                console.error("Error fetching saved list:", savedError);
            }

            const ids = savedData ? savedData.map(s => s.listing_id) : [];
            setSavedListingIds(ids);
            setSavedIdSet(new Set(ids));

            fetchListings(ids, false, searchTerm);
        }

        initializeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced search
    useEffect(() => {
        if (!currentUser) return;
        const timer = setTimeout(() => {
            setLoading(true);
            fetchListings(savedListingIds, false, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, fetchListings, currentUser, savedListingIds]);

    const handleRequireAuth = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#030712] pt-28 pb-12 px-4 md:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[150px] mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 mb-4 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
                            <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">Your Collection</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 tracking-tight leading-tight">
                            Saved <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">Experiences</span>
                        </h1>
                        <p className="mt-3 text-lg md:text-xl text-neutral-400 font-light max-w-2xl">
                            All your favorite journeys stored in one place.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10 max-w-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl focus-within:ring-2 focus-within:ring-fuchsia-500/50 focus-within:bg-white/10 transition-all">
                        <div className="pl-5 pr-2 py-4 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-neutral-400 group-focus-within:text-fuchsia-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search your saved experiences..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-2 pr-6 py-4 bg-transparent text-white placeholder-neutral-500 outline-none font-medium"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="pr-5 text-neutral-500 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-10 p-5 bg-red-900/20 border border-red-500/30 text-red-400 rounded-2xl backdrop-blur-md flex items-start gap-4">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-white mb-1">Error Loading Saved Experiences</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-sm relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent animate-pulse" />
                                <div className="h-64 bg-white/5 w-full animate-pulse" />
                                <div className="p-6">
                                    <div className="flex gap-2 mb-4">
                                        <div className="h-5 bg-white/10 rounded-full w-24 animate-pulse" />
                                    </div>
                                    <div className="h-7 bg-white/10 rounded-lg w-3/4 mb-4 animate-pulse" />
                                    <div className="space-y-2 mb-6">
                                        <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                                        <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                                    </div>
                                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
                                            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                                        </div>
                                        <div className="h-4 bg-white/10 rounded w-16 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <svg className="h-10 w-10 text-neutral-500 group-hover:text-fuchsia-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="relative z-10 text-2xl font-bold text-white mb-3">No Saved Experiences</h3>
                        <p className="relative z-10 text-neutral-400 max-w-md mx-auto mb-8 text-lg font-light">
                            {searchTerm ? "No saved experiences match your search." : "You haven't saved any experiences yet. Browse the feed to find your next adventure!"}
                        </p>
                        {!searchTerm && (
                            <Link
                                href="/feed"
                                className="relative z-10 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Explore Feed
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {listings.map((listing: any) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    currentUser={currentUser}
                                    initialIsSaved={savedIdSet.has(listing.id)}
                                    onRequireAuth={handleRequireAuth}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-16 text-center">
                                <button
                                    onClick={() => { setLoadingMore(true); fetchListings(savedListingIds, true, searchTerm); }}
                                    disabled={loadingMore}
                                    className="group relative inline-flex h-12 flex-col items-center justify-center overflow-hidden rounded-xl bg-transparent px-8 font-medium text-neutral-300 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/5 hover:border-white/20 hover:text-white disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10 inline-flex items-center gap-2">
                                        {loadingMore ? (
                                            <>
                                                <svg className="animate-spin -ml-1 h-4 w-4 text-fuchsia-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                Load More
                                                <svg className="w-4 h-4 text-neutral-500 group-hover:text-fuchsia-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
