import { useState } from 'react';
import { toast } from 'react-toastify';
import { useUploadImageMutation } from '@api/uploadApi'; // Assuming you have this mutation

const ImageUploadQuestion = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadImage, { isLoading }] = useUploadImageMutation();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImage(file);

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!image) {
      toast.error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('uploadType', 'question'); // Specify upload type

    try {
      const result = await uploadImage(formData).unwrap();
      
      if (result.success) {
        const imageUrl = result.data?.imageUrl || result.imageUrl;
        setUploadedImageUrl(imageUrl);
        toast.success('Image uploaded successfully!');
        
        // Copy to clipboard for easy use
        if (imageUrl) {
          navigator.clipboard.writeText(imageUrl).then(() => {
            toast.info('Image URL copied to clipboard');
          });
        }
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.data?.message || error.error || 'Upload failed');
    }
  };

  const clearImage = () => {
    setImage(null);
    setUploadedImageUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-gray-100">
        Upload Question Image
      </h2>

      {/* File Upload Area */}
      <div className="mb-6">
        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${previewUrl 
            ? 'border-primary dark:border-primary bg-primary/5 dark:bg-primary/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-900/30'
          }`}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative mx-auto max-w-xs">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-auto max-h-48 rounded-lg object-contain bg-gray-50 dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full 
                           bg-red-100 dark:bg-red-900/30 
                           text-red-600 dark:text-red-400
                           hover:bg-red-200 dark:hover:bg-red-900/50
                           transition-colors duration-200"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-text-secondary dark:text-gray-400">
                {image?.name} ({(image?.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          ) : (
            <div>
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Supports: JPG, PNG, GIF • Max: 5MB
              </p>
              <label className="inline-block cursor-pointer">
                <span className="px-4 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 
                               text-primary dark:text-primary
                               hover:bg-primary/20 dark:hover:bg-primary/30
                               transition-colors duration-200">
                  Browse Files
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!image || isLoading}
        className="w-full py-3 rounded-lg font-medium
                 bg-primary dark:bg-primary
                 text-white
                 hover:bg-primary-hover dark:hover:bg-primary-hover
                 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                 dark:focus:ring-offset-gray-800
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Image
          </>
        )}
      </button>

      {/* Uploaded Image Display */}
      {uploadedImageUrl && (
        <div className="mt-8 pt-6 border-t border-border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-gray-100">
            Upload Successful!
          </h3>
          
          {/* Image Preview */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Preview:
            </p>
            <div className="relative rounded-lg overflow-hidden border border-border dark:border-gray-700">
              <img 
                src={`http://localhost:5000${uploadedImageUrl}`} 
                alt="Uploaded" 
                className="w-full h-auto max-h-64 object-contain bg-gray-50 dark:bg-gray-900"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
                }}
              />
            </div>
          </div>

          {/* Image URL with Copy Functionality */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Image URL:
            </p>
            <div className="flex gap-2">
              <div className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-border dark:border-gray-700 overflow-x-auto">
                <code className="text-sm text-text-primary dark:text-gray-300 font-mono break-all">
                  {`http://localhost:5000${uploadedImageUrl}`}
                </code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`http://localhost:5000${uploadedImageUrl}`);
                  toast.success('URL copied to clipboard!');
                }}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                         text-text-secondary dark:text-gray-400
                         hover:bg-gray-300 dark:hover:bg-gray-600
                         transition-colors duration-200 flex items-center gap-1"
                title="Copy URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to use this image:
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
              <li>1. Copy the image URL above</li>
              <li>2. Use it in your question creation form</li>
              <li>3. Paste it in the &apos;Image URL &apos; field</li>
              <li>4. The image will be displayed with the question</li>
            </ul>
          </div>
        </div>
      )}

      {/* Image Requirements */}
      <div className="mt-6 pt-6 border-t border-border dark:border-gray-700">
        <h4 className="text-sm font-semibold mb-2 text-text-secondary dark:text-gray-400">
          Image Requirements:
        </h4>
        <ul className="text-xs text-text-secondary dark:text-gray-500 space-y-1">
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
            Maximum file size: 5MB
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
            Supported formats: JPG, PNG, GIF, SVG
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
            Recommended dimensions: 800x600px
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
            Keep images clear and relevant to questions
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadQuestion;

/*
import { useState } from 'react';
import axios from 'axios';

const ImageUploadQuestion = () => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImageUrl(response.data.imageUrl);
      console.log('Image URL response is now :', response.data.imageUrl); // Log the image URL
    

    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="mt-5 max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Question Image</h2>
      <input
        type="file"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />
      <button
        onClick={handleUpload}
        className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Upload Image
      </button>
      {imageUrl && (
        <div className="mt-4">
          <img src={`http://localhost:5000${imageUrl}`} alt="Uploaded" className="w-full h-auto rounded-lg" />
        
      
          {console.log('Image src:', `http://localhost:5000${imageUrl}`)} 
        </div>
      )}
    </div>
  );
};

export default ImageUploadQuestion;
*/