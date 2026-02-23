import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

const VoiceRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        if (onRecordingComplete) {
          const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
          onRecordingComplete(audioFile);
        }
        
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        toast.success('✅ Recording saved');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.info('🎤 Recording started...');
    } catch (error) {
      toast.error('❌ Microphone access denied');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {isRecording ? '🔴' : '🎤'}
        </div>
        
        {isRecording && (
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#ef4444' }}>
            {formatTime(recordingTime)}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {!isRecording ? (
            <button onClick={startRecording} className="btn-neon">
              🎤 Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="btn-neon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              ⏹️ Stop Recording
            </button>
          )}
        </div>
        
        {audioURL && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>Preview:</p>
            <audio src={audioURL} controls style={{ width: '100%' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
