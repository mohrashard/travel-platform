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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Verifying access & loading details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold">Edit Experience</h1>
                        <p className="mt-2 text-blue-100">Update your listing details for travelers.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
                                <p className="font-medium text-sm">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Kyoto Hidden Temples Tour"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Kyoto, Japan"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Update Cover Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. 45.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                            <input
                                type="text"
                                required
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                maxLength={150}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="A brief catchy summary (max 150 chars)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                            <textarea
                                required
                                value={fullDescription}
                                onChange={(e) => setFullDescription(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                placeholder="Describe the full itinerary, what's included, and what travelers should expect during this amazing experience."
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-100 mt-8">
                            <Link
                                href={`/feed/${id}`}
                                className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 disabled:opacity-75 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {submitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving Changes...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
