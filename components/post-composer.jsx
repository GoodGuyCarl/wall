import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, ImageIcon, Upload } from 'lucide-react';

export default function PostComposer() {
	const [content, setContent] = useState('');
	const [selectedImage, setSelectedImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadCount, setUploadCount] = useState(0);
	const [lastUploadTime, setLastUploadTime] = useState(0);

	const now = Date.now();
	if (now - lastUploadTime < 10000) {
		alert('Please wait before uploading another image');
		return;
	}

	const maxLength = 280;
	const remainingChars = maxLength - content.length;

	const handleImageSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				alert('Please select an image file');
				return;
			}

			// Validate file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				alert('Image size must be less than 5MB');
				return;
			}

			setSelectedImage(file);

			// Create preview URL
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
		// Reset file input
		const fileInput = document.getElementById('image-upload');
		if (fileInput) fileInput.value = '';
	};

	const uploadImage = async (file) => {
		const fileExt = file.name.split('.').pop();
		const fileName = `${crypto.randomUUID()}.${fileExt}`;
		const filePath = `post-images/${fileName}`;

		const { data, error } = await supabase.storage
			.from('wall-photos') // Make sure this bucket exists in your Supabase project
			.upload(filePath, file);

		if (error) {
			throw error;
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from('wall-photos').getPublicUrl(filePath);

		return publicUrl;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim() && !selectedImage) return;

		setIsUploading(true);

		try {
			let imageUrl = null;

			// Upload image if selected
			if (selectedImage) {
				imageUrl = await uploadImage(selectedImage);
			}

			// Insert post with optional image URL
			const { error } = await supabase.from('posts').insert({
				user_id: crypto.randomUUID(),
				body: content,
				image_url: imageUrl, // Add this column to your posts table
			});

			if (error) {
				console.error('Error inserting post:', error);
				alert('Failed to create post. Please try again.');
			} else {
				// Reset form
				setContent('');
				removeImage();
			}
		} catch (error) {
			console.error('Error creating post:', error);
			alert('Failed to create post. Please try again.');
		} finally {
			setIsUploading(false);
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

				{/* Image Preview */}
				{imagePreview && (
					<div className="relative">
						<img
							src={imagePreview}
							alt="Preview"
							className="max-h-64 w-full object-cover rounded-lg border"
						/>
						<button
							type="button"
							onClick={removeImage}
							className="absolute cursor-pointer top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
						>
							<X size={16} />
						</button>
					</div>
				)}

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Image Upload Button */}
						<label
							htmlFor="image-upload"
							className="flex items-center gap-1 pr-1.5 py-1 text-sm text-gray-600 hover:text-[#3b5998] cursor-pointer transition-colors"
						>
							<ImageIcon size={18} />
							Upload a photo
						</label>
						<input
							id="image-upload"
							type="file"
							accept="image/*"
							onChange={handleImageSelect}
							className="hidden"
						/>

						<p
							className={`text-foreground/80 text-sm ${
								remainingChars < 20 ? 'text-red-500' : ''
							}`}
						>
							{remainingChars} characters remaining
						</p>
					</div>

					<Button
						type="submit"
						disabled={(!content.trim() && !selectedImage) || isUploading}
						className="bg-[#3b5998] hover:bg-[#2d4373] disabled:bg-gray-400 text-sm px-4 py-2 flex items-center gap-2"
					>
						{isUploading && <Upload size={16} className="animate-spin" />}
						{isUploading ? 'Sharing...' : 'Share'}
					</Button>
				</div>
			</form>
		</div>
	);
}
