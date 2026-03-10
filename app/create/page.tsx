"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';

export default function CreateListing() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [shortDescription, setShortDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [price, setPrice] = useState('');

    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };
        checkSession();
    }, [router]);

    const handleEnhance = async () => {
        if (!title && !shortDescription && !fullDescription) {
            setError("Please fill in at least one text field (Title, Short or Full Description) for the AI to enhance.");
            return;
        }

        setEnhancing(true);
        setError(null);

        try {
            const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    shortDescription,
                    fullDescription,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance text');
            }

            if (data.title) setTitle(data.title.trim());
            if (data.shortDescription) setShortDescription(data.shortDescription.trim());
            if (data.fullDescription) setFullDescription(data.fullDescription.trim());

        } catch (err: any) {
            setError(err.message || "An error occurred during AI enhancement.");
        } finally {
            setEnhancing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const user = session.user;
            const numericPrice = parseFloat(price);

            if (isNaN(numericPrice)) {
                throw new Error('Price must be a valid number');
            }

            if (!imageFile) {
                throw new Error('Please select an image to upload');
            }

            // Upload image to Supabase Storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('listing-images')
                .upload(fileName, imageFile);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('listing-images')
                .getPublicUrl(fileName);

            const imageUrl = publicUrlData.publicUrl;

            const { error: insertError } = await supabase.from('listings').insert([
                {
                    title,
                    location,
                    image_url: imageUrl,
                    short_description: shortDescription,
                    full_description: fullDescription,
                    price: numericPrice,
                    creator_name: user.user_metadata.display_name || user.email?.split('@')[0] || 'Anonymous',
                    user_id: user.id
                }
            ]);

            if (insertError) {
                throw insertError;
            }

            router.push('/feed');
        } catch (err: any) {
            setError(err.message || 'Error creating listing');
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
                    <p className="mt-6 text-neutral-400 font-medium tracking-wide">Verifying access...</p>
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
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Creator Mode</span>
                        </div>
                        <button
                            onClick={handleEnhance}
                            disabled={enhancing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 hover:from-indigo-500/20 hover:to-fuchsia-500/20 text-fuchsia-300 font-medium rounded-xl border border-fuchsia-500/30 transition-all shadow-[0_0_15px_rgba(217,70,239,0.15)] hover:shadow-[0_0_20px_rgba(217,70,239,0.3)] group disabled:opacity-50"
                        >
                            {enhancing ? (
                                <svg className="animate-spin h-5 w-5 text-fuchsia-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="group-hover:animate-pulse">✨</span>
                            )}
                            {enhancing ? "Enhancing..." : "Magic AI Rewrite"}
                        </button>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 tracking-tight leading-tight">
                        Publish an <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Experience</span>
                    </h1>
                    <p className="mt-3 text-lg md:text-xl text-neutral-400 font-light max-w-2xl">
                        Share your local expertise with travelers from all around the world.
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
                                    <p className="font-bold text-white mb-1">Error Creating Experience</p>
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
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Cover Image Upload</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
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
                                href="/feed"
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
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            Publish Experience
                                            <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
