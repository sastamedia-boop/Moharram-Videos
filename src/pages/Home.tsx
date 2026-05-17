import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Search, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

import { LogoSmall } from '../components/Logo';

export function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const vids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(vids);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-stone-950 no-scrollbar">
      <div className="sticky top-0 bg-stone-950/80 backdrop-blur-md px-6 py-4 z-10 border-b border-stone-800 flex justify-between items-center">
        <LogoSmall />
        <div className="flex items-center gap-2">
          <Link to="/live" className="w-10 h-10 flex items-center justify-center bg-stone-900 hover:bg-stone-800 rounded-full text-stone-300 transition-colors" title="Go Live">
            <Video size={20} />
          </Link>
          <Link to="/search" className="w-10 h-10 flex items-center justify-center bg-stone-900 hover:bg-stone-800 rounded-full text-stone-300 transition-colors" title="Search">
            <Search size={20} />
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
           <div className="text-center text-emerald-500 py-10">Loading...</div>
        ) : videos.map((video) => (
          <div key={video.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-colors">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-stone-800 rounded-full shrink-0 mt-0.5"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-100 text-sm">{video.userId.substring(0,8)}</p>
                  {video.createdAt && (
                    <p className="text-xs text-stone-400">{formatDistanceToNow(video.createdAt.toDate())} ago</p>
                  )}
                  {video.description && (
                    <p className="text-sm text-stone-200 mt-2 line-clamp-2 break-words">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full aspect-[9/16] max-h-[60vh] bg-black flex items-center justify-center">
               {video.mediaType === 'image' ? (
                 <img src={video.videoUrl} className="w-full h-full object-contain" alt="Post" />
               ) : (
                 <video src={video.videoUrl} className="w-full h-full object-contain" controls preload="metadata" />
               )}
            </div>

            <div className="p-4">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-stone-400 hover:text-emerald-500 transition-colors">
                  <Heart size={20} />
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button className="flex items-center gap-1.5 text-stone-400 hover:text-emerald-500 transition-colors">
                  <MessageCircle size={20} />
                  <span className="text-sm font-medium">Comment</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
