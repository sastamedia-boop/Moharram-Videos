import React, { useEffect, useState, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../lib/auth';
import { Heart, MessageCircle, Share2, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useIntersection, useTimeoutFn } from 'react-use';

export function Videos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(10));
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

  if (loading) {
     return <div className="h-full flex items-center justify-center text-emerald-500">Loading videos...</div>;
  }

  return (
    <div className="h-full bg-black overflow-y-auto snap-y snap-mandatory no-scrollbar text-white relative">
      {videos.map((vid) => (
        <VideoReel key={vid.id} video={vid} />
      ))}
      {videos.length === 0 && (
         <div className="h-full flex items-center justify-center text-stone-500">No videos yet</div>
      )}
    </div>
  );
}

function VideoReel({ video }: { video: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intersection = useIntersection(ref, { root: null, rootMargin: '0px', threshold: 0.8 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);

  const [, , resetControlsTimer] = useTimeoutFn(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, 3000);

  useEffect(() => {
    if (intersection && intersection.intersectionRatio > 0.8) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowControls(false);
      }
    }
  }, [intersection]);
  
  const handleVideoTap = () => {
    setShowControls(prev => !prev);
    resetControlsTimer();
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
    resetControlsTimer();
  };
  
  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    resetControlsTimer();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setProgress(time);
    resetControlsTimer();
  };

  return (
    <div ref={ref} className="h-full w-full relative snap-start snap-always bg-stone-900 flex justify-center items-center overflow-hidden">
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoTap}
        onTimeUpdate={() => {
          if (videoRef.current) setProgress(videoRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
      />
      
      {/* Custom Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-none flex flex-col justify-center items-center gap-4 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button 
          onClick={handlePlayPause}
          className="w-16 h-16 bg-emerald-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-emerald-500 hover:scale-105 transition-all outline-none"
        >
           {isPlaying ? <Pause size={32} className="fill-current" /> : <Play size={32} className="ml-1 fill-current" />}
        </button>
      </div>

      {/* Progress Bar & Volume inside bottom overlays */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col pointer-events-none z-10">
        
        {/* Controls Ribbon */}
        <div className={`flex items-center gap-3 mb-4 pointer-events-auto transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <button 
            onClick={handlePlayPause}
            className="text-white hover:text-emerald-500 transition-colors"
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
          </button>
          
          <input 
            type="range" 
            min={0}
            max={duration || 1}
            step="0.01"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          
          <button 
            onClick={handleMuteToggle}
            className="text-white hover:text-emerald-500 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
        
        <div className="flex items-end justify-between w-full">
          {/* User Info */}
          <div className="flex-1 pr-12 pointer-events-auto text-shadow-sm">
            <h3 className="font-bold text-[15px] mb-2">{video.userId.substring(0,8)}...</h3>
            <p className="text-sm font-normal text-white/90 line-clamp-2 leading-tight drop-shadow-md">
              {video.description}
            </p>
            
            <div className="flex items-center gap-2 mt-3 text-xs font-medium bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-stone-800">
              <Music size={12} className="text-emerald-400" />
              <span className="marquee">Original Audio - Islamic</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-6 pointer-events-auto mb-2">
            <div className="relative">
               <div className="w-12 h-12 bg-white rounded-full p-0.5 mb-2">
                 <div className="w-full h-full bg-stone-300 rounded-full overflow-hidden"></div>
               </div>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-black">
                 <span className="text-xs font-bold leading-none">+</span>
               </div>
            </div>
            <ActionButton icon={<Heart size={26} className="text-white fill-white" />} count="1.2k" />
            <ActionButton icon={<MessageCircle size={26} className="text-white fill-white" />} count="34" />
            <ActionButton icon={<Share2 size={26} className="text-white" />} count="Share" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, count }: { icon: React.ReactNode, count: string }) {
  return (
    <div className="flex flex-col items-center gap-1 active:scale-95 transition-transform drop-shadow-md">
      <div className="bg-black/20 p-2.5 rounded-full backdrop-blur-sm">
         {icon}
      </div>
      <span className="text-[11px] font-semibold text-white/90">{count}</span>
    </div>
  );
}
