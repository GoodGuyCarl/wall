'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileSidebar from '@/components/profile-sidebar';
import Header from '@/components/header';
import PostComposer from '@/components/post-composer';
import { X } from 'lucide-react';

export default function Home() {
	const [selectedImage, setSelectedImage] = useState(null);
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchPosts = async () => {
		try {
			setIsLoading(true);
			const { data, error } = await supabase
				.from('posts')
				.select('*')
				.order('created_at', { ascending: false });
			if (error) {
				console.error('Error fetching posts:', error);
			} else {
				setPosts(data || []);
			}
		} catch (error) {
			console.error('Error fetching posts:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const openImageModal = (imageUrl) => {
		setSelectedImage(imageUrl);
	};

	const closeImageModal = () => {
		setSelectedImage(null);
	};

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				closeImageModal();
			}
		};

		if (selectedImage) {
			document.addEventListener('keydown', handleKeyDown);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = 'unset';
		};
	}, [selectedImage]);

	useEffect(() => {
		fetchPosts();
		const channel = supabase
			.channel('posts')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'posts' },
				(payload) => {
					setPosts((current) => [payload.new, ...current]);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	const formatTimeAgo = (date) => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return 'now';
		}

		const diffInMinutes = Math.floor(diffInSeconds / 60);
		if (diffInMinutes < 60) {
			return `${diffInMinutes}m ago`;
		}

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		}

		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) {
			return `${diffInDays}d ago`;
		}

		const diffInWeeks = Math.floor(diffInDays / 7);
		if (diffInWeeks < 4) {
			return `${diffInWeeks}w ago`;
		}

		const diffInMonths = Math.floor(diffInDays / 30);
		return `${diffInMonths}mo ago`;
	};

	return (
		<>
			<main className="min-h-screen bg-background">
				<Header />
				<article className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 p-4">
					<section className="lg:hidden">
						<ProfileSidebar />
					</section>
					<section className="hidden lg:block">
						<ProfileSidebar />
					</section>
					<section className="flex-1 min-w-0">
						<PostComposer />
						<div className="space-y-0 border rounded">
							{isLoading
								? Array.from({ length: 5 }).map((_, index) => (
										<div
											key={index}
											className="bg-white border-b border-border p-3 sm:p-4"
										>
											<div className="mb-3">
												<div className="flex justify-between items-center gap-2 mb-2">
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-3 w-16" />
												</div>
												<div className="space-y-2">
													<Skeleton className="h-3 w-full" />
													<Skeleton className="h-3 w-3/4" />
													<Skeleton className="h-3 w-1/2" />
												</div>
											</div>
										</div>
								  ))
								: posts?.map((post, index) => (
										<div
											key={post.id}
											className={`bg-white ${
												index !== posts.length - 1
													? 'border-b border-border'
													: ''
											} p-3 sm:p-4 ${index === 0 ? 'rounded-t' : ''} ${
												index === posts.length - 1 ? 'rounded-b' : ''
											}`}
										>
											<div className="mb-3">
												<div className="flex justify-between items-center gap-2 mb-2">
													<span className="text-base">Carl Sanguyo</span>
													<span className="text-foreground/80 text-sm">
														{formatTimeAgo(new Date(post.created_at))}
													</span>
												</div>
												<div className="text-sm text-gray-800 leading-relaxed">
													{post.body}
												</div>
												<div className="mt-2">
													{post.image_url && (
														<div className="mt-3">
															<img
																src={post.image_url}
																alt="Post image"
																className="max-w-full h-auto max-h-80 border cursor-pointer hover:opacity-95 transition-opacity"
																onClick={() =>
																	openImageModal(post.image_url)
																}
															/>
														</div>
													)}
												</div>
											</div>
										</div>
								  ))}
						</div>
					</section>
				</article>
			</main>
			{selectedImage && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					onClick={closeImageModal}
				>
					<div className="relative max-w-full max-h-full">
						<button
							onClick={closeImageModal}
							className="fixed cursor-pointer top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
						>
							<X size={24} />
						</button>
						<img
							src={selectedImage}
							alt="Full size image"
							className="max-w-full max-h-full object-contain"
							onClick={(e) => e.stopPropagation()}
						/>
					</div>
				</div>
			)}
		</>
	);
}
