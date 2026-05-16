import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Chats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="h-full overflow-y-auto bg-stone-950 no-scrollbar">
      <div className="sticky top-0 bg-stone-950/80 backdrop-blur-md px-6 py-4 z-10 border-b border-stone-800 flex justify-between items-center">
        <h1 className="text-xl font-bold">Messages</h1>
        <Link to="/search" className="w-10 h-10 flex items-center justify-center bg-stone-900 hover:bg-stone-800 rounded-full text-stone-300 transition-colors">
          <Search size={20} />
        </Link>
      </div>

      <div className="p-4">
        {loading ? (
             <div className="text-center text-emerald-500 py-10">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="text-center text-stone-500 py-10 mt-10">
            <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <p className="font-medium text-stone-300">No messages yet</p>
            <p className="text-sm mt-1">When you connect with people, you'll see your chats here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map(chat => {
              const otherUserId = chat.participants.find((p: string) => p !== user?.uid) || 'Unknown';
              return (
                <div key={chat.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-900 transition-colors cursor-pointer border border-transparent hover:border-stone-800">
                  <div className="w-14 h-14 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-500 font-bold border border-emerald-800/50">
                    {otherUserId.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-stone-100 truncate">{otherUserId.substring(0,8)}...</h3>
                    <p className="text-sm text-stone-400 truncate mt-0.5">{chat.lastMessage || 'Sent a message'}</p>
                  </div>
                  {chat.updatedAt && (
                    <span className="text-xs text-stone-500 whitespace-nowrap self-start mt-1">
                      {formatDistanceToNow(chat.updatedAt.toDate())}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
