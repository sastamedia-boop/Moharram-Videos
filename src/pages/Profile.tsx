import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { auth, db, handleFirestoreError, OperationType, storage } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, collection, getCountFromServer } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Camera, LogOut, Settings, Shield, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Profile() {
  const { user, profile, signOut, updateProfile: updateLocalProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [facebook, setFacebook] = useState(profile?.socialLinks?.facebook || '');
  const [instagram, setInstagram] = useState(profile?.socialLinks?.instagram || '');
  const [twitter, setTwitter] = useState(profile?.socialLinks?.twitter || '');
  const [whatsapp, setWhatsapp] = useState(profile?.socialLinks?.whatsapp || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const followersSnap = await getCountFromServer(collection(db, 'users', user.uid, 'followers'));
        setFollowerCount(followersSnap.data().count);
        
        const followingSnap = await getCountFromServer(collection(db, 'users', user.uid, 'following'));
        setFollowingCount(followingSnap.data().count);
      } catch (e) {
        console.error("Failed to fetch counts", e);
      }
    };
    
    fetchCounts();
  }, [user]);

  // Note: Standard image upload is mocked or limited when the user isn't fully set up.
  // We will build standard logic for image upload if needed.

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let finalPhotoUrl = profile?.photoUrl || null;

      if (avatarFile) {
        const storageRef = ref(storage, `users/${user.uid}/profile_${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, avatarFile);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            () => resolve(uploadTask.snapshot)
          );
        });

        finalPhotoUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      const socialLinks = { facebook, instagram, twitter, whatsapp };
      await updateDoc(doc(db, 'users', user.uid), {
        username,
        bio,
        socialLinks,
        ...(finalPhotoUrl ? { photoUrl: finalPhotoUrl } : {}),
        updatedAt: serverTimestamp(),
      });
      updateLocalProfile({ username, bio, socialLinks, photoUrl: finalPhotoUrl || undefined });
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-stone-950 no-scrollbar">
      <div className="sticky top-0 bg-stone-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-stone-800">
        <h1 className="text-xl font-bold">Profile</h1>
        <button onClick={signOut} className="text-stone-400 hover:text-stone-200">
          <LogOut size={20} />
        </button>
      </div>

      <div className="px-6 py-8 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-emerald-600">
            {(avatarPreview || profile?.photoUrl) ? (
              <img src={avatarPreview || profile?.photoUrl} alt={profile?.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-stone-500">{profile?.username?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {editing && (
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-500 transition-colors border border-stone-950">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
            </label>
          )}
        </div>

        {editing ? (
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs text-stone-500 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-stone-100"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 ml-1">Bio</label>
              <textarea 
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-stone-100 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 ml-1">Facebook URL</label>
              <input 
                type="text" 
                value={facebook}
                onChange={e => setFacebook(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-stone-100"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 ml-1">Instagram URL</label>
              <input 
                type="text" 
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-stone-100"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 ml-1">Twitter URL</label>
              <input 
                type="text" 
                value={twitter}
                onChange={e => setTwitter(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-stone-100"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 ml-1">WhatsApp Phone/Link</label>
              <input 
                type="text" 
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-stone-100"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditing(false)}
                className="flex-1 bg-stone-800 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-emerald-600 py-3 rounded-xl font-medium"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-stone-100">{profile?.username}</h2>
            <div className="flex items-center gap-6 mt-3 mb-2">
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg text-emerald-500">{followerCount}</span>
                <span className="text-xs text-stone-400 font-medium">Followers</span>
              </div>
              <div className="w-px h-8 bg-stone-800"></div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg text-stone-100">{followingCount}</span>
                <span className="text-xs text-stone-400 font-medium">Following</span>
              </div>
            </div>
            <p className="text-stone-400 mt-2 text-center text-sm px-4">{profile?.bio || 'No bio yet.'}</p>
            
            {(profile?.socialLinks?.facebook || profile?.socialLinks?.instagram || profile?.socialLinks?.twitter || profile?.socialLinks?.whatsapp) && (
              <div className="flex gap-4 mt-6 justify-center">
                {profile.socialLinks.facebook && (
                  <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#1877F2] transition-colors">
                    <Facebook size={24} />
                  </a>
                )}
                {profile.socialLinks.instagram && (
                  <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#E4405F] transition-colors">
                    <Instagram size={24} />
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#1DA1F2] transition-colors">
                    <Twitter size={24} />
                  </a>
                )}
                {profile.socialLinks.whatsapp && (
                  <a href={profile.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#25D366] transition-colors">
                    <MessageCircle size={24} />
                  </a>
                )}
              </div>
            )}
            
            <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
              <button 
                onClick={() => setEditing(true)}
                className="w-full bg-stone-900 border border-stone-800 text-stone-100 font-medium py-2 text-sm rounded-xl"
              >
                Edit Profile
              </button>
              
              <Link 
                to="/admin"
                className="w-full bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 font-medium py-2 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-emerald-900/40 text-sm"
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
