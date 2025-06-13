'use client';

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { sendMessageToLex } from "@/services/lexService";
import { useToast } from "@/hooks/use-toast";
import { ImageResponseCard } from "@aws-sdk/client-lex-runtime-v2";
import { decodeSearchId } from '@/lib/hash';

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  responseCard?: ImageResponseCard;
};

export default function Chatbot() {
  const searchParams = useSearchParams();
  const initialMessage = searchParams?.get('message');
  const hash = searchParams?.get('h');
  const sessionId = searchParams?.get('s');
  // const fromHistory = searchParams?.get('fromHistory') === 'true';
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSessionId = useRef<string>(sessionId || `${hash}-${Date.now()}`);
  const { toast } = useToast();
  const [sessionExists, setSessionExists] = useState(!!sessionId);

  // Load chat history or start fresh session
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        if (!hash) {
          throw new Error('No search ID provided');
        }

        const searchId = decodeSearchId(hash);
        const response = await fetch(`/api/chat/history?h=${hash}`);
        const data = await response.json();
        
        if (data.success && data.sessions?.length > 0) {
          // Find the most recent active session
          const activeSession = data.sessions.find((session: any) => session.Status === 'active');
          if (activeSession) {
            // Redirect to the active session
            const newUrl = `/chat?h=${hash}&s=${activeSession.LexSessionId}`;
            window.history.replaceState({}, '', newUrl);
            currentSessionId.current = activeSession.LexSessionId;
            setSessionExists(true);
            loadChatSession(activeSession.LexSessionId);
            return;
          }
        }
        // If no active session found, only set sessionExists if sessionId is present
        setSessionExists(!!sessionId);
        // For new chat, show welcome message only
        if (!sessionId) {
          const welcomeMessage: MessageType = {
            id: "welcome",
            content: "Hello! I'm your property assistant. Ask me anything about real estate, property values, or how to use the Address Explorer Hub.",
            sender: "bot",
            timestamp: new Date()
          };
          if (initialMessage) {
            const propertyMessage: MessageType = {
              id: "property-info",
              content: initialMessage,
              sender: "user",
              timestamp: new Date()
            };
            setMessages([propertyMessage, welcomeMessage]);
          } else {
            setMessages([welcomeMessage]);
          }
        }
      } catch (error) {
        console.error('Error checking active session:', error);
        toast({
          title: "Error",
          description: "Failed to load chat session",
          variant: "destructive",
        });
      }
    };

    if (hash) {
      checkActiveSession();
    }
  }, [hash, initialMessage, sessionId, toast]);

  const loadChatSession = async (sessionId: string) => {
    try {
      if (!hash) {
        throw new Error('No search ID provided');
      }
      const response = await fetch(`/api/chat/history?h=${hash}&s=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        const loadedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
        currentSessionId.current = sessionId;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const handleEndChat = async () => {
    try {
      const response = await fetch('/api/chat/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId.current
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        window.history.back();
      } else {
        toast({
          title: "Error",
          description: "Failed to end chat session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: "Error",
        description: "Failed to end chat session",
        variant: "destructive",
      });
    }
  };

  const saveChat = async (newMessages: MessageType[]) => {
    if (!hash) {
      console.log('No searchId available, chat will not be saved');
      return;
    }

    try {
      const searchId = decodeSearchId(hash);
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchId,
          sessionId: currentSessionId.current,
          messages: newMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }))
        }),
      });
      
      const data = await response.json();
      console.log('Save chat response:', data);
      
      if (data.success && data.sessionId) {
        currentSessionId.current = data.sessionId;
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Only scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleButtonClick = async (value: string) => {
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: value,
      sender: "user",
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);
    
    try {
      // Send message to Lex
      const response = await sendMessageToLex(value, currentSessionId.current);
      
      const botMessage: MessageType = {
        id: Date.now().toString(),
        content: response.message,
        sender: "bot",
        timestamp: new Date(),
        responseCard: response.responseCard
      };
      
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      
      // Save chat after both messages are added
      if (hash) {
        await saveChat(updatedMessages);
      }
    } catch (error) {
      console.error("Error communicating with Lex:", error);
      toast({
        title: "Error",
        description: "Failed to get response from the assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendMessageToLex(input, currentSessionId.current);
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "bot",
        timestamp: new Date(),
        responseCard: response.responseCard
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 h shadow-lg mt-2">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary-foreground">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              Property Assistant
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEndChat}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              End Chat
            </Button>
          </CardTitle>
          <CardDescription>Ask questions about properties, real estate, or using this application</CardDescription>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="h-[calc(100vh-20rem)] overflow-y-auto p-6" style={{ scrollBehavior: 'smooth' }}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.sender === "bot" && (
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-secondary text-secondary-foreground">AI</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="font-medium">Property Assistant</div>
                          <div className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    {message.responseCard && (
                      <div className="mt-4">
                        <div className="font-medium mb-2">{message.responseCard.title}</div>
                        <div className="flex flex-wrap gap-2">
                          {message.responseCard.buttons?.map((button, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleButtonClick(button.value || '')}
                              disabled={isTyping}
                            >
                              {button.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {message.sender === "user" && (
                      <div className="text-xs text-right mt-1 text-primary-foreground/70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form className="flex w-full gap-2" onSubmit={handleSendMessage}>
            <Input
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={isTyping}
              autoFocus
            />
            <Button type="submit" disabled={isTyping || !input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m22 2-7 20-4-9-9-4Z"></path>
                <path d="M22 2 11 13"></path>
              </svg>
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
