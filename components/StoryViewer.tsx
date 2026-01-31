"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Volume2, VolumeX } from "lucide-react";
import { getImageUrl } from "../lib/images";

interface Story {
    _id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: string;
}

interface Creator {
    _id: string;
    displayName: string;
    user: {
        avatarUrl?: string;
        username: string;
    };
    stories: Story[];
}

interface StoryViewerProps {
    creators: Creator[]; // List of creators with stories
    initialCreatorIndex: number;
    onClose: () => void;
}

export default function StoryViewer({ creators, initialCreatorIndex, onClose }: StoryViewerProps) {
    const [currentCreatorIndex, setCurrentCreatorIndex] = useState(initialCreatorIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Derived state
    const currentCreator = creators[currentCreatorIndex];
    const currentStory = currentCreator.stories[currentStoryIndex];
    const videoRef = useRef<HTMLVideoElement>(null);

    // Reset story index when changing creator
    const handleNextCreator = () => {
        if (currentCreatorIndex < creators.length - 1) {
            setCurrentCreatorIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
            setProgress(0);
        } else {
            onClose(); // End of all stories
        }
    };

    const handlePrevCreator = () => {
        if (currentCreatorIndex > 0) {
            setCurrentCreatorIndex(prev => prev - 1);
            setCurrentStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handleNextStory = () => {
        if (currentStoryIndex < currentCreator.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
        } else {
            handleNextCreator();
        }
    };

    const handlePrevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        } else {
            handlePrevCreator();
        }
    };

    // Auto-advance logic
    useEffect(() => {
        if (isPaused) return;

        const duration = currentStory.mediaType === 'video' ? (videoRef.current?.duration || 15) * 1000 : 5000; // 5s for image, video duration for video
        const interval = 50; // Update every 50ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    handleNextStory();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentStoryIndex, currentCreatorIndex, isPaused, currentStory.mediaType]);

    // Handle video end
    const onVideoEnded = () => {
        handleNextStory();
    };

    // Reset progress on story change
    useEffect(() => {
        setProgress(0);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
        }
    }, [currentStory, currentCreator]);

    if (!currentCreator || !currentStory) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Desktop: Close on click outside (max-width wrapper) */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm hidden md:block" onClick={onClose} />

            {/* Viewer Container */}
            <div className="relative w-full h-full md:w-[400px] md:h-[85vh] md:rounded-2xl overflow-hidden bg-black shadow-2xl">

                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
                    {currentCreator.stories.map((_, index) => (
                        <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: index < currentStoryIndex ? '100%' :
                                        index === currentStoryIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header Info */}
                <div className="absolute top-4 left-0 right-0 z-20 px-3 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden relative">
                            <Image
                                src={getImageUrl(currentCreator.user.avatarUrl || "/default-avatar.png")}
                                alt={currentCreator.displayName}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="text-white text-sm font-semibold drop-shadow-md">
                            {currentCreator.displayName}
                            <span className="text-white/60 font-normal ml-2 text-xs">
                                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* <button onClick={() => setIsPaused(!isPaused)} className="text-white/80 hover:text-white">
                            <MoreHorizontal size={20} />
                        </button> */}
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tap Areas for Navigation */}
                <div className="absolute inset-0 z-10 flex">
                    <div
                        className="w-1/3 h-full"
                        onClick={handlePrevStory}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                        onMouseDown={() => setIsPaused(true)}
                        onMouseUp={() => setIsPaused(false)}
                    />
                    <div
                        className="w-2/3 h-full"
                        onClick={handleNextStory}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                        onMouseDown={() => setIsPaused(true)}
                        onMouseUp={() => setIsPaused(false)}
                    />
                </div>

                {/* Media Display */}
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                    {currentStory.mediaType === 'video' ? (
                        <video
                            ref={videoRef}
                            src={getImageUrl(currentStory.mediaUrl)}
                            className="w-full h-full object-contain"
                            playsInline
                            autoPlay
                            muted={isMuted} // Start muted sometimes required by browsers, but we try standard
                            onEnded={onVideoEnded}
                            onLoadedMetadata={(e) => {
                                // optional: adjust duration state if needed, but handled in effect
                            }}
                        />
                    ) : (
                        <Image
                            src={getImageUrl(currentStory.mediaUrl || "/default-avatar.png")}
                            alt="Story"
                            fill
                            className="object-contain"
                            priority
                        />
                    )}
                </div>

                {/* Mute Toggle (Video Only) */}
                {currentStory.mediaType === 'video' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className="absolute bottom-20 right-4 z-30 p-2 bg-black/50 rounded-full text-white/80 backdrop-blur-md"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                )}

                {/* Footer / Reply (Visual Interaction) */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
                    {/* <input
                        type="text"
                        placeholder="ส่งข้อความ..."
                        className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white placeholder:text-white/50 backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                    /> */}
                    {/* <button className="text-white hover:scale-110 transition">
                        <Heart size={28} />
                    </button> */}
                    {/* <button className="text-white hover:scale-110 transition">
                        <Volume2 size={28} className="opacity-0" />
                    </button> */}
                </div>

            </div>
        </div>
    );
}
