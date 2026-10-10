import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Volume2, CheckCircle2, AlertCircle, RefreshCw, VideoOff, MicOff } from 'lucide-react';

export default function WebcamPreview({ onPermissionsGranted }) {
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedAudioId, setSelectedAudioId] = useState('');

  const [camStatus, setCamStatus] = useState('pending'); // 'pending' | 'granted' | 'denied'
  const [micStatus, setMicStatus] = useState('pending');
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [errorMsg, setErrorMsg] = useState('');
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);

  const initMediaDevices = async (videoDeviceId = null, audioDeviceId = null) => {
    setErrorMsg('');
    try {
      // Stop any existing tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } : true,
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setCamStatus('granted');
      setMicStatus('granted');
      if (onPermissionsGranted) onPermissionsGranted(true);

      // Enumerate available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);

      // Setup Web Audio API for live mic meter
      setupAudioMeter(mediaStream);

    } catch (err) {
      console.error('Media devices access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCamStatus('denied');
        setMicStatus('denied');
        setErrorMsg('Camera and Microphone permissions were denied. Please enable them in your browser site settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera or microphone found on this device. Please connect a device to proceed.');
      } else {
        setErrorMsg(`Unable to access media devices: ${err.message || 'Check connection'}`);
      }
      if (onPermissionsGranted) onPermissionsGranted(false);
    }
  };

  const setupAudioMeter = (mediaStream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      } else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const audioTracks = mediaStream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) return;

      const source = ctx.createMediaStreamSource(mediaStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Scale to 0-100 percentage
        const level = Math.min(100, Math.round((average / 128) * 100 * 1.5));
        setAudioLevel(level);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(updateMeter);
    } catch (e) {
      console.warn('Web Audio meter initialization failed:', e);
    }
  };

  useEffect(() => {
    initMediaDevices();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleDeviceChange = (vidId, audId) => {
    setSelectedVideoId(vidId);
    setSelectedAudioId(audId);
    initMediaDevices(vidId, audId);
  };

  const testSpeaker = () => {
    try {
      setIsTestingSpeaker(true);
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 tone
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);

      setTimeout(() => {
        setIsTestingSpeaker(false);
      }, 900);
    } catch (e) {
      setIsTestingSpeaker(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#171717] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 shadow-sm space-y-5">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
          Device & Hardware Verification
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Verify your camera and microphone clarity before proceeding into the assessment room.
        </p>
      </div>

      {/* Video Preview Frame */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-950 aspect-video flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-inner">
        {camStatus === 'granted' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400 space-y-3">
            <VideoOff className="w-12 h-12 text-neutral-500 animate-pulse" />
            <p className="text-sm font-medium text-neutral-300">
              Camera preview not active
            </p>
            <p className="text-xs text-neutral-400 max-w-sm">
              Please click "Allow" on the browser permission prompt to enable webcam feed.
            </p>
          </div>
        )}

        {/* Live Status Overlay in Video Frame */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
            camStatus === 'granted' 
              ? 'bg-emerald-500/80 text-white' 
              : 'bg-red-500/80 text-white'
          }`}>
            <span className={`w-2 h-2 rounded-full ${camStatus === 'granted' ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
            {camStatus === 'granted' ? 'Camera Live' : 'Camera Disconnected'}
          </span>
        </div>

        {/* Live Audio Level Meter in Frame */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
          <Mic className={`w-4 h-4 shrink-0 ${audioLevel > 5 ? 'text-emerald-400' : 'text-neutral-400'}`} />
          <div className="flex-1 h-2 bg-neutral-700/80 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                audioLevel > 60 ? 'bg-amber-400' : audioLevel > 20 ? 'bg-emerald-400' : 'bg-sky-400'
              }`}
              style={{ width: `${Math.max(5, audioLevel)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-neutral-300 w-10 text-right">
            {audioLevel}%
          </span>
        </div>
      </div>

      {/* Error / Alert Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div className="space-y-1">
            <p className="font-semibold">Hardware Access Warning</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Device Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Webcam Source
          </label>
          <select
            value={selectedVideoId}
            onChange={(e) => handleDeviceChange(e.target.value, selectedAudioId)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {videoDevices.length > 0 ? (
              videoDevices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))
            ) : (
              <option value="">Default Camera</option>
            )}
          </select>
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Microphone Source
          </label>
          <select
            value={selectedAudioId}
            onChange={(e) => handleDeviceChange(selectedVideoId, e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {audioDevices.length > 0 ? (
              audioDevices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Microphone ${i + 1}`}
                </option>
              ))
            ) : (
              <option value="">Default Microphone</option>
            )}
          </select>
        </div>
      </div>

      {/* Hardware verification action buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => initMediaDevices(selectedVideoId, selectedAudioId)}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Hardware</span>
        </button>

        <button
          onClick={testSpeaker}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold transition-all ${
            isTestingSpeaker
              ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 border-sky-300'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isTestingSpeaker ? 'Playing Tone...' : 'Test Speaker'}</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {camStatus === 'granted' && micStatus === 'granted' ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Hardware Ready
            </span>
          ) : (
            <span className="text-xs text-amber-500 font-medium">
              Awaiting Verification
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
