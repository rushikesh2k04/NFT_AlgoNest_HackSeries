import React, { useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface NFTFormProps {
  onUploadComplete: (ipfsCID: string) => void;
}

const NFTForm: React.FC<NFTFormProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmN2IwY2NjMC03ZTNmLTQ2NzUtYWUyYS01MTU3YjhiYjMyMGMiLCJlbWFpbCI6InJ1c2hpa2VzaDkuMjAwNEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWE3YmU3MDkyYzc1MDBlZTkyMDkiLCJzY29wZWRLZXlTZWNyZXQiOiJhOTA3NDAwZDExYWI2ZTFmOGQ1NjlmZTgwYTFkYzZiMzJkZWU5YTk3ZGQwODUxMzBlMzZhMTRjMDViODNhZWNkIiwiZXhwIjoxNzc3ODUwNTUzfQ.DjmtmIocrDt_ydUJ_6imHL_0Ik4uxi1RRrX4MPwET1o';

  const uploadToIPFS = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: Infinity,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    return res.data.IpfsHash;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    setPdfName(file?.name || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!imageFile || !pdfFile) {
        throw new Error("Both image and PDF files are required");
      }

      const [imageCID, pdfCID] = await Promise.all([
        uploadToIPFS(imageFile),
        uploadToIPFS(pdfFile)
      ]);

      const metadata = {
        name: title,
        description,
        image: `ipfs://${imageCID}`,
        pdf: `ipfs://${pdfCID}`,
        properties: {
          file_type: "medical_record",
          created_at: new Date().toISOString(),
        }
      };

      const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFile = new File([blob], "metadata.json");

      const metadataCID = await uploadToIPFS(metadataFile);
      onUploadComplete(metadataCID);
      
      // Clear form
      setTitle('');
      setDescription('');
      setImageFile(null);
      setPdfFile(null);
      setImagePreview(null);
      setPdfName(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NFT Title
          </label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Medical Record Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
            placeholder="Detailed description of this medical record"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center ${imagePreview ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="mx-auto h-40 object-contain rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-0 right-0 bg-error-100 text-error-700 rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-error-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="image-upload" className="relative cursor-pointer text-primary-600 hover:text-primary-700">
                    <span>Upload an image</span>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </label>
                  <p>or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Record PDF
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center ${pdfName ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}>
            {pdfName ? (
              <div className="flex items-center justify-center space-x-2 py-6">
                <FileText className="h-8 w-8 text-accent-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{pdfName}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setPdfName(null);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-6">
                <FileText className="mx-auto h-10 w-10 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="pdf-upload" className="relative cursor-pointer text-primary-600 hover:text-primary-700">
                    <span>Upload a PDF</span>
                    <input
                      id="pdf-upload"
                      name="pdf"
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handlePdfChange}
                      required
                    />
                  </label>
                  <p>or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF format only, up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading || !title || !description || !imageFile || !pdfFile}
          className={`
            flex items-center px-4 py-2 rounded-md font-medium text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            transition-colors
            ${loading || !title || !description || !imageFile || !pdfFile
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
            }
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading to IPFS...
            </>
          ) : (
            'Upload to IPFS'
          )}
        </button>
      </div>
    </form>
  );
};

export default NFTForm;