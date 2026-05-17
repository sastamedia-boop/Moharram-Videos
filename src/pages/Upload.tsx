import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Upload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file || !user) return;
    setLoading(true);

    try {
      const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(p);
        },
        (error) => {
          console.error(error);
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const videoRef = doc(collection(db, 'videos'));
          
          await setDoc(videoRef, {
            userId: user.uid,
            videoUrl: downloadURL,
            mediaType: file.type.startsWith('image/') ? 'image' : 'video',
            description,
            createdAt: serverTimestamp(),
          });
          
          navigate('/');
        }
      );
    } catch (e) {
      setLoading(false);
      handleFirestoreError(e, OperationType.CREATE, 'videos');
    }
  };

  return (
    <div className="h-full bg-stone-950 overflow-y-auto no-scrollbar pb-24">
      <div className="sticky top-0 bg-stone-950/80 backdrop-blur-md px-6 py-4 z-10 border-b border-stone-800">
        <h1 className="text-xl font-bold">Upload Media</h1>
      </div>

      <div className="p-6">
        {!file ? (
          <label className="w-full aspect-[9/16] max-h-96 border-2 border-dashed border-stone-800 rounded-2xl flex flex-col items-center justify-center text-stone-500 cursor-pointer hover:border-emerald-500/50 hover:bg-stone-900/50 transition-colors">
            <UploadCloud size={48} className="mb-4" />
            <span className="font-medium">Select Video or Photo</span>
            <input 
              type="file" 
              accept="video/*,image/*" 
              className="hidden" 
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="relative w-full aspect-[9/16] max-h-[60vh] bg-black rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center">
              {file.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  className="w-full h-full object-contain" 
                  alt="Preview"
                />
              ) : (
                <video 
                  src={URL.createObjectURL(file)} 
                  className="w-full h-full object-contain" 
                  controls 
                />
              )}
              <button 
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs"
              >
                Remove
              </button>
            </div>

            <div>
              <label className="text-sm text-stone-400 block mb-2">Description</label>
              <textarea 
                rows={3}
                placeholder="Write something nice..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button 
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-bold py-4 rounded-xl flex items-center justify-center relative overflow-hidden"
            >
              {loading ? `Uploading... ${progress}%` : 'Post Media'}
              {loading && (
                <div 
                  className="absolute left-0 bottom-0 top-0 bg-emerald-700 -z-10 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
