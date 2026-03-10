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

export default function FeedPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const router = useRouter();

    const fetchListings = useCallback(async (isLoadMore = false, currentSearch = '') => {
        try {
            const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('listings')
                .select('*', { count: 'exact' })
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
            setError(err.message || 'Failed to fetch listings');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [page]);

    useEffect(() => {
        async function initializeData() {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setCurrentUser(session.user);
                const { data: savedData } = await supabase
                    .from('saved_listings')
                    .select('listing_id')
                    .eq('user_id', session.user.id);

                if (savedData) {
                    setSavedListingIds(new Set(savedData.map(s => s.listing_id)));
                }
            }

            fetchListings(false, searchTerm);
        }

        initializeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            fetchListings(false, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, fetchListings]);

    const handleRequireAuth = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Explore Experiences</h1>
                        <p className="mt-2 text-base md:text-lg text-gray-600">Discover handpicked local journeys from creators around the world.</p>
                    </div>
                    <Link
                        href="/create"
                        className="w-full md:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition duration-150 ease-in-out shadow-sm shadow-blue-600/20"
                    >
                        Create Listing
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-8 max-w-lg relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                        <p className="font-medium">Error loading experiences</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
                                <div className="h-56 bg-gray-200 w-full" />
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
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            {searchTerm ? "No results matching your search criteria." : "There are currently no travel listings available. Be the first to create one!"}
                        </p>
                        {!searchTerm && (
                            <Link
                                href="/create"
                                className="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition duration-150 ease-in-out shadow-sm shadow-blue-600/20"
                            >
                                Create the first listing
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
                                    initialIsSaved={savedListingIds.has(listing.id)}
                                    onRequireAuth={handleRequireAuth}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-12 text-center">
                                <button
                                    onClick={() => { setLoadingMore(true); fetchListings(true, searchTerm); }}
                                    disabled={loadingMore}
                                    className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-8 rounded-xl transition duration-150 ease-in-out shadow-sm border border-gray-200 disabled:opacity-50 inline-flex items-center"
                                >
                                    {loadingMore ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </>
                                    ) : 'Load More Experiences'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
