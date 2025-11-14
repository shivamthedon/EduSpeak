import { useState, useCallback, useEffect, useRef } from 'react';

// FIX: Add helpers for decoding raw PCM audio from Gemini
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // FIX: Add refs for AudioContext to play Gemini audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const cleanup = useCallback(() => {
    // SpeechSynthesis cleanup
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    if (utteranceRef.current) {
      utteranceRef.current.onstart = null;
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current = null;
    }
    // AudioContext cleanup
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanup();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [cleanup]);
  
  // FIX: Update play function to handle both text for browser TTS and a base64 audio object for Gemini
  const play = useCallback(async (input: string | { base64: string }, onEnd?: () => void) => {
    cleanup();
    
    if (typeof input === 'object' && input.base64) {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      
      setIsPlaying(true);
      try {
        const audioBuffer = await decodeAudioData(decode(input.base64), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          setIsPlaying(false);
          sourceNodeRef.current = null;
          if (onEnd) onEnd();
        };
        source.start();
        sourceNodeRef.current = source;
      } catch (e) {
        console.error("Failed to play base64 audio", e);
        setIsPlaying(false);
      }
    } else if (typeof input === 'string') {
      const utterance = new SpeechSynthesisUtterance(input);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1.2;

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
        if (onEnd) onEnd();
      };
      
      utterance.onerror = (event) => {
          console.error("SpeechSynthesisUtterance.onerror", event);
          setIsPlaying(false);
          utteranceRef.current = null;
      }

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [cleanup]);


  return { play, isPlaying, cleanup };
}