'use client'

import { useEffect, useRef, useState } from 'react';

const SpeechToText = () => {
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US'; // Set your desired language

        recognitionRef.current.addEventListener('result', (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscript(currentTranscript);

            if (event.results[0].isFinal) {
                console.log('Final Transcript: ', currentTranscript);
            }
        });

        recognitionRef.current.addEventListener('end', recognitionRef.current.start); // Restart recognition
    }, []);

    const startListening = () => {
        setTranscript(''); // Clear previous transcript
        recognitionRef.current.start();
    };

    return (
        <div>
            <h1>AI Agent Friend</h1>
            <button onClick={startListening}>Start Listening</button>
            <p>{transcript}</p>
        </div>
    );
};

export default SpeechToText;
