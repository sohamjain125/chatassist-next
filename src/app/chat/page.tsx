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

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  responseCard?: ImageResponseCard;
};

export default function Chatbot() {
  const searchParams = useSearchParams();
  const initialMessage = searchParams?.get('message') ?? null;
  const searchId = searchParams?.get('searchId');
  const fromHistory = searchParams?.get('fromHistory') === 'true';
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(`${searchId}-${Date.now()}`);
  const { toast } = useToast();

  // Load chat history only if coming from history page
  useEffect(() => {
    if (fromHistory && searchId) {
      loadChatHistory();
    } else {
      // Start fresh session with welcome message
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
  }, [searchId, initialMessage, fromHistory]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/history?searchId=${searchId}`);
      const data = await response.json();
      
      if (data.success) {
        const loadedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
        
        // Update sessionId to match the loaded chat session
        if (data.sessionId) {
          sessionId.current = data.sessionId;
        }
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

  const saveChat = async (newMessages: MessageType[]) => {
    if (!searchId) {
      console.log('No searchId available, chat will not be saved');
      return;
    }

    try {
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchId,
          sessionId: sessionId.current,
          messages: newMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }))
        }),
      });
      
      const data = await response.json();
      console.log('Save chat response:', data);
      
      if (data.success && data.sessionId) {
        sessionId.current = data.sessionId;
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

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      const response = await sendMessageToLex(value, sessionId.current);
      
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
      if (searchId) {
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
    
    if (!input.trim()) return;
    
    const message = input;
    setInput("");
    
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);
    
    try {
      // Send message to Lex
      const response = await sendMessageToLex(message, sessionId.current);
      
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
      if (searchId) {
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

  return (
    <div className="space-y-6">
      <Card className="border-0 h shadow-lg mt-2">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary-foreground">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            Property Assistant
          </CardTitle>
          <CardDescription>Ask questions about properties, real estate, or using this application</CardDescription>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="h-[calc(100vh-20rem)] overflow-y-auto p-6">
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
              <div ref={messagesEndRef} />
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
