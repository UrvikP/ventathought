'use client'

import SpeechToText from '../components/SpeechToText';

export default function Home() {
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Speech to Text Demo</h1>
            <p>Click the "Start Listening" button and speak into your microphone. Your speech will be converted to text.</p>
            <SpeechToText />
        </div>
    );
}
