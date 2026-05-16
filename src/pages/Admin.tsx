import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, getCountFromServer, where, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/auth';
import { Shield, Trash2, Video, Users, MessageSquare, Search, UserPlus } from 'lucide-react';

export function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, videos: 0, chats: 0 });
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminSearch, setAdminSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getCountFromServer(collection(db, 'users'));
      const videosSnap = await getCountFromServer(collection(db, 'videos'));
      const chatsSnap = await getCountFromServer(collection(db, 'chats'));
      
      setStats({
        users: usersSnap.data().count,
        videos: videosSnap.data().count,
        chats: chatsSnap.data().count,
      });

      const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(10));
      const vidsSnap = await getDocs(q);
      setRecentVideos(vidsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      // Fails silently if not admin, or we can handle it
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteDoc(doc(db, 'videos', videoId));
      setRecentVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `videos/${videoId}`);
    }
  };

  const handleSearchUser = async () => {
    if (!adminSearch.trim()) return;
    setSearchError('');
    setSearchResult(null);
    try {
      const q = query(collection(db, 'users'), where('username', '==', adminSearch.trim()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        setSearchError('User not found.');
      } else {
        const found = snap.docs[0];
        setSearchResult({ id: found.id, ...found.data() });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
    }
  };

  const handleAddAdmin = async () => {
    if (!searchResult) return;
    try {
      await setDoc(doc(db, 'admins', searchResult.id), {
        grantedAt: serverTimestamp()
      });
      alert(`User ${searchResult.username} is now an admin!`);
      setSearchResult(null);
      setAdminSearch('');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `admins/${searchResult.id}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-stone-950 no-scrollbar pb-20">
      <div className="sticky top-0 bg-stone-950/80 backdrop-blur-md px-6 py-4 z-10 border-b border-stone-800 flex items-center gap-3">
        <Shield className="text-emerald-500" size={24} />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {loading ? (
          <div className="text-center text-emerald-500 py-10">Loading admin data...</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center">
                <Users size={24} className="text-stone-400 mb-2" />
                <span className="text-2xl font-bold text-stone-100">{stats.users}</span>
                <span className="text-sm text-stone-500">Users</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center">
                <Video size={24} className="text-emerald-500 mb-2" />
                <span className="text-2xl font-bold text-stone-100">{stats.videos}</span>
                <span className="text-sm text-stone-500">Videos</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center">
                <MessageSquare size={24} className="text-stone-400 mb-2" />
                <span className="text-2xl font-bold text-stone-100">{stats.chats}</span>
                <span className="text-sm text-stone-500">Chats</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Grant Admin Access</h2>
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <input
                       type="text"
                       value={adminSearch}
                       onChange={(e) => setAdminSearch(e.target.value)}
                       placeholder="Search username to make admin..."
                       className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                     />
                     <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                   </div>
                   <button 
                     onClick={handleSearchUser}
                     className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl font-medium transition-colors"
                   >
                     Search
                   </button>
                 </div>
                 {searchError && <p className="text-red-400 text-sm mt-3 px-1">{searchError}</p>}
                 {searchResult && (
                   <div className="mt-4 p-4 border border-emerald-900/50 bg-emerald-950/20 rounded-xl flex items-center justify-between">
                     <div>
                       <p className="font-bold text-stone-100 text-lg">{searchResult.username}</p>
                       <p className="text-xs text-stone-400">ID: {searchResult.id}</p>
                     </div>
                     <button
                       onClick={handleAddAdmin}
                       className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                     >
                       <UserPlus size={18} />
                       Make Admin
                     </button>
                   </div>
                 )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Recent Content</h2>
              {recentVideos.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-500">
                  No videos found.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentVideos.map(video => (
                    <div key={video.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-16 h-24 bg-stone-800 rounded-lg overflow-hidden shrink-0">
                         {/* Display video thumbnail if available or video tag */}
                         <video src={video.videoUrl} className="w-full h-full object-cover" muted playsInline />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-100 text-sm truncate">{video.userId}</p>
                        <p className="text-xs text-stone-400 line-clamp-2 mt-1">{video.description || 'No description'}</p>
                        <p className="text-[10px] text-stone-500 mt-2">ID: {video.id}</p>
                      </div>
                      <button 
                        onClick={() => deleteVideo(video.id)}
                        className="w-10 h-10 flex items-center justify-center bg-stone-800 hover:bg-red-900/50 hover:text-red-500 rounded-full text-stone-400 transition-colors shrink-0"
                        title="Delete Video"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
