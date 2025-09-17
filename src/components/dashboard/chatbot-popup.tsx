'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, Send, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const predefinedQA: { [key: string]: string } = {
  'what is the purpose of this dashboard?':
    'This dashboard allows admins to review, approve, reject, and manage all expense submissions from every club. You can also track spending and get AI-powered insights.',
  'how are expense priorities determined?':
    'The AI Priority Queue uses a model to analyze the description and amount of pending expenses, flagging the most urgent or relevant ones for your immediate attention.',
  'what are the different user roles?':
    'There are three roles: Students can submit expenses for their clubs. Representatives can manage their club\'s expenses and members. Admins have full oversight and can approve or reject any expense.',
  'how do I handle a representative request?':
    'Go to the "Approvals" page from the sidebar. There you will see a list of pending requests from students to become club representatives. You can approve or reject them there.',
  'can I export a report of expenses?':
    'Yes. In the "All Expenses" table, use the filters to select the data you need, then click the "View Report" button. From the report dialog, you can download the data as a CSV file.',
  'what are the clubs': 'The current clubs are Book Club and Coding Club.',
  'what club has spent the most money':
    'Based on current data, the Coding Club has spent the most money.',
};

export function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I'm here to help. Ask me a question about this dashboard.",
    },
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // Use `querySelector` to get the underlying viewport element from Radix
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    const answer =
      predefinedQA[input.trim().toLowerCase()] ||
      "I'm sorry, I can only answer predefined questions. Please try asking about the dashboard's purpose, user roles, or how to export reports.";
    
    setInput('');

    setTimeout(() => {
      const botMessage: Message = { sender: 'bot', text: answer };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000); // 1-second delay
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg z-50"
        >
          <Bot className="h-8 w-8" />
          <span className="sr-only">Open Chatbot</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[400px] h-[500px] flex flex-col p-0"
        sideOffset={16}
      >
        <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <h3 className="font-semibold text-lg">ReimburseAI Assistant</h3>
        </div>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.sender === 'bot' ? '' : 'justify-end'
                }`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                    message.sender === 'bot'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
