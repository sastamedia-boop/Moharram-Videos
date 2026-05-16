import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FollowButton } from '../components/FollowButton';

export function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use a simple custom debounce or useEffect timeout
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        // Simple prefix search using >= and <= with \uf8ff
        const q = query(
          collection(db, 'users'),
          where('username', '>=', debouncedTerm),
          where('username', '<=', debouncedTerm + '\uf8ff'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(results);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedTerm]);

  return (
    <div className="h-full overflow-y-auto bg-stone-950 no-scrollbar flex flex-col">
      <div className="sticky top-0 bg-stone-950/80 backdrop-blur-md px-4 py-4 z-10 border-b border-stone-800 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-stone-200 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-stone-900 border border-stone-800 rounded-full pl-10 pr-4 py-2 text-stone-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            autoFocus
          />
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
        </div>
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="text-center text-emerald-500 py-10">Searching...</div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-stone-900 rounded-2xl border border-stone-800">
                <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center overflow-hidden border border-emerald-900 border-opacity-50">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-stone-500">{user.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-100 truncate">{user.username}</h3>
                  {user.bio && <p className="text-xs text-stone-400 truncate mt-0.5">{user.bio}</p>}
                </div>
                <FollowButton targetUserId={user.id} />
              </div>
            ))}
          </div>
        ) : debouncedTerm ? (
          <div className="text-center text-stone-500 py-10">No users found for "{debouncedTerm}"</div>
        ) : (
          <div className="text-center text-stone-500 py-10 mt-10">
            <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium text-stone-300">Find people</p>
            <p className="text-sm mt-1">Search for users by their username</p>
          </div>
        )}
      </div>
    </div>
  );
}
