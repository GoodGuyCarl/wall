import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function PostComposer() {
	const [content, setContent] = useState('');
	const maxLength = 280;
	const remainingChars = maxLength - content.length;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim()) return;
		try {
			const { error } = await supabase.from('posts').insert({
				user_id: crypto.randomUUID(),
				body: content,
			});
			if (error) {
				console.error('Error inserting post:', error);
			} else {
			}
		} catch (error) {
			console.error('Error inserting post:', error);
		} finally {
			setContent('');
		}
	};

	return (
		<div className="bg-white border border-gray-300 rounded mb-4 p-3 sm:p-4">
			<form onSubmit={handleSubmit} className="space-y-3">
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="What's on your mind?"
					className="resize-none border-gray-300 focus:border-[#3b5998] focus:ring-[#3b5998] text-sm"
					rows={3}
					maxLength={maxLength}
				/>
				<div className="flex justify-between">
					<p
						className={`text-foreground/80 text-sm ${
							remainingChars < 20 ? 'text-red-500' : ''
						}`}
					>
						{remainingChars} characters remaining
					</p>
					<Button
						type="submit"
						disabled={!content.trim()}
						className="bg-[#3b5998] hover:bg-[#2d4373] disabled:bg-gray-400 text-sm px-4 py-2"
					>
						Share
					</Button>
				</div>
			</form>
		</div>
	);
}
