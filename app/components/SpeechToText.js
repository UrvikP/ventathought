'use client';

import { useState, useEffect } from 'react';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
    }
  }, []);

  const startListening = async () => {
    setError(null);
    setIsListening(true);
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        console.log('Speech result:', speechResult);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognition.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError(`Error starting speech recognition: ${error.message}`);
      setIsListening(false);
    }
  };

  return (
    <div>
      <h1>Speech to Text</h1>
      <button onClick={startListening} disabled={isListening}>
        {isListening ? 'Listening...' : 'Start Listening'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Transcript: {transcript}</p>
    </div>
  );
};

export default SpeechToText;