import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/auth';

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.uid === targetUserId) {
      setLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const followDoc = await getDoc(doc(db, 'users', user.uid, 'following', targetUserId));
        setIsFollowing(followDoc.exists());
      } catch (err) {
        console.error("Error checking follow status");
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [user, targetUserId]);

  const toggleFollow = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const followingRef = doc(db, 'users', user.uid, 'following', targetUserId);
      const followerRef = doc(db, 'users', targetUserId, 'followers', user.uid);
      
      if (isFollowing) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        setIsFollowing(false);
      } else {
        await setDoc(followingRef, {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        });
        await setDoc(followerRef, {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        });
        setIsFollowing(true);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/following/${targetUserId}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.uid === targetUserId) return null;

  return (
    <button 
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
        isFollowing 
          ? 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700' 
          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
      } ${loading ? 'opacity-50' : 'opacity-100'}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
