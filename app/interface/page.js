'use client'
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Avatar, IconButton, TextField, Button, Switch, CssBaseline, ThemeProvider, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import useMediaQuery from '@mui/material/useMediaQuery';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useUser } from "@auth0/nextjs-auth0/client";
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  AppBar, 
  Toolbar, 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import { keyframes } from '@mui/system';
import "../CustomButton.css";
import CustomButton from '../CustomButton'; // Make sure the import path is correct

const fallAnimation = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(100vh);
  }
`;

const DynamicRing = ({ size, thickness, rgbColor, value, animationDuration }) => {
  return (
    <Box sx={{ 
      position: 'relative', 
      display: 'inline-flex', 
      m: 1,
      animation: `${fallAnimation} ${animationDuration}s linear infinite`,
    }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{
          color: rgbColor,
          opacity: '75%',
        }}
      />
    </Box>
  );
};

const generateRandomPosition = (max) => {
  return Math.floor(Math.random() * max);
};

export default function Home() {
    const [currentURL, setCurrentURL] = useState('');
    const { user, error, isLoading } = useUser();

    useEffect(() => {
        setCurrentURL(window.location.href);
    }, []);

    const [messages, setMessages] = useState([
      {
        role: 'assistant',
        content: `Hey there! What's on your mind today?`
      }
    ])
    const [message, setMessage ] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [darkMode, setDarkMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userId, setUserId] = useState(Math.random().toString(36).substr(2, 9)); // Add this line
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [selectedAvatar, setSelectedAvatar] = useState('alloy');

    const sendMessage = async (e) => {
      if (!message.trim()) return; 

      setMessage('')
      setMessages((messages)=>[
        ...messages,
        { role: 'user', content: message },
        { role: 'assistant', content: '' },
      ])
      setIsChatLoading(true)

      try {
        console.log("")
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'URL': currentURL,
          },
          body: JSON.stringify({
            user_id: user ? user.sub : 'anonymous',
            data: [...messages, { role: 'user', content: message }],
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          setMessages((messages)=>{
            let lastMessage = messages[messages.length - 1]
            let otherMessages = messages.slice(0, messages.length - 1)
            return [
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + chunk,
              },
            ]
          })           
        }
      } catch (error) {
        console.error('Error:', error)
        setMessages((messages) => [
          ...messages,
          { 
            role: 'assistant', 
            content: "I'm sorry, but I encountered an error. Please try again later." 
          },
        ])
      } finally {
        setIsChatLoading(false)
      }
    }

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    }

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  
    useEffect(() => {
      scrollToBottom()
    }, [messages])

    const synthesizeSpeech = async (text) => {
      try {
        console.log('Synthesizing speech for:', text);
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, voice: selectedVoice }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const audioBlob = await response.blob();
        console.log('Received audio blob:', audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onerror = (e) => console.error('Audio playback error:', e);
        audio.onplay = () => console.log('Audio started playing');
        audio.onended = () => console.log('Audio finished playing');
        await audio.play();
      } catch (error) {
        console.error('Error synthesizing speech:', error);
      }
    };

    const renderMessage = (message) => (
      <Box>
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
        {message.role === 'assistant' && (
          <IconButton size="small" onClick={() => synthesizeSpeech(message.content)}>
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );

    const startListening = async () => {
      setIsListening(true);
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript;
          setMessage(speechResult);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    };
  // end chat store the conversation to pinecone
    const endChat = async () => {
      console.log("End Chat clicked");
      if (isChatLoading || isLoading) {
        console.log("Loading in progress, can't end chat");
        return;
      }
      if (error) {
        console.error('Error loading user:', error);
        return;
      }
      if (!user) {
        console.log('User not authenticated, ending chat anyway');
        // You might want to handle this case differently
      }

      const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      try {
        const response = await fetch('/api/uploadChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'URL': currentURL,
          },
          body: JSON.stringify({
            user_id: user ? user.sub : 'anonymous',
            chat_history: chatHistory,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to upload chat history');
        }

        const result = await response.json();
        alert(result.message);

        // Reset the chat
        setMessages([
          {
            role: 'assistant',
            content: `Hey there! What's on your mind today?`
          }
        ]);
      } catch (error) {
        console.error('Error ending chat:', error);
        alert('Failed to save chat history. Please try again.');
      }
    };
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const router = useRouter();

    const handleLogout = () => {
        // Implement logout logic here
        // For example, clear local storage, reset state, etc.
        router.push('/'); // Redirect to page.js
    };

    const generateRandomColor = () => {
      return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
    };

    const generateRandomSize = () => {
      return Math.floor(Math.random() * (80 - 20 + 1)) + 20; // Random size between 20 and 80
    };

    const generateRings = (count) => {
      const rings = [];
      const drawerWidth = 380;

      for (let i = 0; i < count; i++) {
        const ring = {
          size: generateRandomSize(),
          color: generateRandomColor(),
          value: Math.floor(Math.random() * 101), // Random value between 0 and 100
          left: generateRandomPosition(drawerWidth),
          animationDuration: Math.random() * 10 + 5, // Random duration between 5 and 15 seconds
        };

        rings.push(ring);
      }
      return rings;
    };

    const rings = generateRings(20); // Generate 20 rings

    return (
      <Box sx={{ 
        display: 'flex', 
        height: '100vh',
        background: 'linear-gradient(to bottom right, #e6f7ff, #b3e0ff)', // Light blue gradient
      }}>
        <CssBaseline />
      
        {/* Sidebar */}
        <Box sx={{ 
          position: 'fixed', 
          left: 50, 
          top: 50, 
          bottom: 50, 
          width: 380,
          zIndex: 1200,
          boxShadow: 6,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
        }}>
          <Drawer
            variant="permanent"
            sx={{
              width: '100%',
              height: '100%',
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 380,
                boxSizing: 'border-box',
                position: 'static',
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'transparent', // Make drawer background transparent
              },
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Dynamic Rings */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, #f5e6d3, #e6d0b3)', // Light beige gradient top to bottom
              }}>
                {rings.map((ring, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      left: ring.left,
                      top: -ring.size, // Start above the container
                    }}
                  >
                    <DynamicRing
                      size={ring.size}
                      thickness={Math.min(8, ring.size / 6)}
                      rgbColor={ring.color}
                      value={100}
                      animationDuration={ring.animationDuration}
                    />
                  </Box>
                ))}
              </Box>

              {/* Foreground content */}
              <Box sx={{ 
                position: 'relative', 
                zIndex: 1, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    p: 2,
                    ml: 2,
                    fontFamily: "'Yatra One', cursive",
                    fontSize: '2.5rem',
                    color: '#4a4a4a',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  VentAThought
                </Typography>

                {/* Updated avatars section */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  my: 4,
                  backgroundColor: 'linear-gradient(to bottom, #f5e6d3, #e6d0b3)', // Semi-transparent white background
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton 
                      onClick={() => { 
                        setSelectedVoice('alloy'); 
                        setSelectedAvatar('alloy');
                      }} 
                      sx={{ 
                        '&:hover': { boxShadow: 3 },
                        boxShadow: selectedAvatar === 'alloy' ? 3 : 0,
                        backgroundColor: 'white', // Add solid background
                      }}
                    >
                      <Avatar sx={{ width: 110, height: 110}} src="/images/man.png" />
                    </IconButton>
                    <IconButton 
                      onClick={() => { 
                        setSelectedVoice('nova'); 
                        setSelectedAvatar('nova');
                      }} 
                      sx={{ 
                        '&:hover': { boxShadow: 3 },
                        boxShadow: selectedAvatar === 'nova' ? 3 : 0,
                        backgroundColor: 'white', // Add solid background
                      }}
                    >
                      <Avatar sx={{ width: 110, height: 110 }} src="/images/woman.png" />
                    </IconButton>
                  </Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      mt: 2, 
                      fontWeight: 'bold',
                      fontFamily: "'Yatra One', cursive",
                      fontSize: '2rem',
                      color: '#4a4a4a',
                    }}
                  >
                    Hey, Venta!
                  </Typography>
                </Box>
              
                {/* Theme toggle and logout */}
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: 'white', // Add solid background
                  marginTop: 'auto', // Push to bottom
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                    <Typography variant="body2">
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </Typography>
                  </Box>
                  <IconButton onClick={handleLogout} color="inherit">
                    <LogoutIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Drawer>
        </Box>

        {/* Main content area */}
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: 3, 
          pl: '430px', 
          display: 'flex', 
          flexDirection: 'column', 
          mt: '50px',
          mx: '200px',
          mb: '25px',
          height: 'calc(100vh - 100px)', // Adjust to match drawer height
        }}>
          <Paper sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            height: '100%', // Fill the entire height
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(10px)', 
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)', // Add shadow
          }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {messages.map((message, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  mb: 2,
                  justifyContent: message.role === "user" ? 'flex-end' : 'flex-start'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2,
                    flexDirection: message.role === "user" ? 'row-reverse' : 'row'
                  }}>
                    {message.role === "assistant" ? (
                      <Avatar sx={{ width: 60, height: 60 }} src={selectedAvatar === 'alloy' ? "/images/man.png" : "/images/woman.png"} />
                    ) : (
                      <Avatar sx={{ width: 60, height: 60 }}>
                        <PersonIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                    )}
                    <Box sx={{
                      maxWidth: '70%',
                      backgroundColor: message.role === "user" ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: 2,
                      p: 2,
                    }}>
                      {renderMessage(message)}
                    </Box>
                  </Box>
                </Box>
              ))}
              {isChatLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
              <Box component="form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color="primary"
                  onClick={startListening}
                  disabled={isListening}
                  sx={{ mr: 2 }}
                >
                  <MicIcon />
                </IconButton>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  variant="outlined"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mr: 5, flexGrow: 1, width: '75%' }} // Reduced width and right margin
                />
                <CustomButton
                  id="transitionButton"  
                  label="SEND" 
                  onClick={sendMessage} 
                  style={{ marginLeft: '-20px' }} // Moved button more to the left
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={endChat}
                  disabled={isChatLoading || isLoading}
                  sx={{ width: '60%' }}
                >
                  End Chat
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
}