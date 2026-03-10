"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';

export default function EditListing() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // Keep existing if not updated
    const [imageFile, setImageFile] = useState<File | null>(null); // Only if user uploads new image
    const [shortDescription, setShortDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [price, setPrice] = useState('');

    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    useEffect(() => {
        const fetchSessionAndListing = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }

                if (!id) return;

                const { data: listing, error: listingError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (listingError) throw listingError;

                // Verify ownership
                if (listing.user_id !== session.user.id) {
                    router.push('/feed'); // Redirect if not owner
                    return;
                }

                // Populate state
                setTitle(listing.title);
                setLocation(listing.location);
                setImageUrl(listing.image_url);
                setShortDescription(listing.short_description);
                setFullDescription(listing.full_description);
                setPrice(listing.price.toString());

            } catch (err: any) {
                setError(err.message || 'Error fetching listing details');
            } finally {
                setLoading(false);
            }
        };

        fetchSessionAndListing();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const numericPrice = parseFloat(price);

            if (isNaN(numericPrice)) {
                throw new Error('Price must be a valid number');
            }

            let finalImageUrl = imageUrl;

            // Only upload a new image if they selected one
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${id}-${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('listing-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('listing-images')
                    .getPublicUrl(fileName);

                finalImageUrl = publicUrlData.publicUrl;
            }

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    title,
                    location,
                    image_url: finalImageUrl,
                    short_description: shortDescription,
                    full_description: fullDescription,
                    price: numericPrice,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            router.push(`/feed/${id}`);
        } catch (err: any) {
            setError(err.message || 'Error updating listing');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen animate-pulse" />
                    <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen animate-pulse" />
                </div>
                <div className="flex flex-col items-center relative z-10">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                    <p className="mt-6 text-neutral-400 font-medium tracking-wide">Verifying access & loading details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Editor Mode</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 tracking-tight leading-tight">
                        Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Experience</span>
                    </h1>
                    <p className="mt-3 text-lg md:text-xl text-neutral-400 font-light max-w-2xl">
                        Update your listing details for travelers.
                    </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.05)] border border-white/10 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
                        {error && (
                            <div className="p-5 bg-red-900/20 border border-red-500/30 text-red-400 rounded-2xl backdrop-blur-md flex items-start gap-4">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-white mb-1">Error Updating Experience</p>
                                    <p className="text-sm opacity-90">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-neutral-600"
                                    placeholder="e.g. Kyoto Hidden Temples Tour"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Location</label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-neutral-600"
                                    placeholder="e.g. Kyoto, Japan"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Update Cover Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 transition-all focus:outline-none file:cursor-pointer p-1.5 bg-white/5 border border-white/10 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Price ($)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-neutral-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-neutral-600"
                                        placeholder="45.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Short Description</label>
                            <input
                                type="text"
                                required
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                maxLength={150}
                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-neutral-600"
                                placeholder="A brief catchy summary (max 150 chars)"
                            />
                            <p className="mt-2 text-xs text-neutral-500 flex justify-end">
                                {shortDescription.length}/150
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Full Description</label>
                            <textarea
                                required
                                value={fullDescription}
                                onChange={(e) => setFullDescription(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-neutral-600 resize-none"
                                placeholder="Describe the full itinerary, what's included, and what travelers should expect during this amazing experience."
                            />
                        </div>

                        <div className="pt-8 flex items-center justify-end space-x-4 border-t border-white/10 mt-8">
                            <Link
                                href={`/feed/${id}`}
                                className="px-6 py-3 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-75 disabled:hover:scale-100 disabled:hover:shadow-none"
                            >
                                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                                    <div className="relative h-full w-8 bg-white/20" />
                                </div>
                                <span className="relative z-10 flex items-center gap-2">
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 h-4 w-4 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            Save Changes
                                            <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
