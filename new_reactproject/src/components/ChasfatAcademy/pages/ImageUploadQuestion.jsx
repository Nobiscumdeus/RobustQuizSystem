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
        
        {/*  <img src={imageUrl} alt="Uploaded" className="w-full h-auto rounded-lg" /> */}

          {console.log('Image src:', `http://localhost:5000${imageUrl}`)} {/* Log the image src */}

        </div>
      )}
    </div>
  );
};

export default ImageUploadQuestion;