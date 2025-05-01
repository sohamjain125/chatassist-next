'use client';

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export default function Chatbot() {
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('message');
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial welcome message and property info if provided
  useEffect(() => {
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
  }, [initialMessage]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate bot response after delay
    setTimeout(() => {
      const responses = [
        "I can help you find information about property values in that area.",
        "Looking at recent sales data, properties in that neighborhood have increased in value by about 8% over the last year.",
        "The average price per square foot in that area is $275.",
        "That property was last sold in 2018 for $450,000.",
        "I'd recommend checking the property history tab for more detailed information about previous sales.",
        "Based on my analysis, that location has good investment potential due to upcoming development projects."
      ];
      
      const botMessage: MessageType = {
        id: Date.now().toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Property Assistant</h1>
        <p className="text-muted-foreground mt-2">Get answers to your property questions</p>
      </div>
      
      <Card className="border-0 shadow-lg">
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
        <CardContent className="p-0">
          <div className="h-[500px] overflow-y-auto p-6">
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
