import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Video, Mic, MicOff, VideoOff, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Live() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setError(err.message || 'Error accessing camera');
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setHasVideo(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setHasAudio(audioTrack.enabled);
      }
    }
  };

  const handleEndLive = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  return (
    <div className="h-full overflow-hidden bg-stone-950 flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={handleEndLive} className="w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          LIVE
        </div>
        <button className="w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="flex-1 bg-black relative flex justify-center items-center">
        {error ? (
          <div className="text-stone-400 p-8 text-center bg-stone-900 rounded-2xl mx-4">
            <Video size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-semibold text-stone-200">Camera Error</p>
            <p className="text-sm mt-2">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-stone-800 hover:bg-stone-700 rounded-full text-white">
              Go Back
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="flex justify-center items-center gap-6">
          <button 
            onClick={toggleAudio}
            className={`w-14 h-14 flex items-center justify-center rounded-full text-white backdrop-blur-md transition-all ${hasAudio ? 'bg-stone-800/80 hover:bg-stone-700' : 'bg-red-500/80 hover:bg-red-600'}`}
          >
            {hasAudio ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button 
            onClick={handleEndLive}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all font-bold"
          >
            END
          </button>
          <button 
            onClick={toggleVideo}
            className={`w-14 h-14 flex items-center justify-center rounded-full text-white backdrop-blur-md transition-all ${hasVideo ? 'bg-stone-800/80 hover:bg-stone-700' : 'bg-red-500/80 hover:bg-red-600'}`}
          >
            {hasVideo ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}
