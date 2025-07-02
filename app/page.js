'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileSidebar from '@/components/profile-sidebar';
import Header from '@/components/header';
import PostComposer from '@/components/post-composer';

export default function Home() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const fileInputRef = useRef(null);

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

	const handleFileUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0] || null);
	};

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
						<div className="space-y-0">
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
											} p-3 sm:p-4`}
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
											</div>
										</div>
								  ))}
						</div>
					</section>
				</article>
			</main>
		</>
	);
}
