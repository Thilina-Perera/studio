'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, User, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const predefinedQA: { [key: string]: string } = {
  'what is the purpose of this dashboard?':
    'This admin dashboard provides a centralized place to view, manage, and approve all club expenses. You can filter expenses, see AI-prioritized items, and get budget insights.',
  'how are expense priorities determined?':
    'The AI Priority Queue uses a model to analyze the description and amount of pending expenses, flagging the most urgent or relevant ones for your immediate attention.',
  'what are the different user roles?':
    "There are three roles: Students can submit expenses for their clubs. Representatives can manage their club's expenses and members. Admins have full oversight and can approve or reject any expense.",
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
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showMiniMessage, setShowMiniMessage] = useState(false);
  const [miniMessageClosed, setMiniMessageClosed] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (miniMessageClosed || isOpen) {
      return;
    }

    const interval = setInterval(() => {
      setShowMiniMessage(true);
      setTimeout(() => {
        setShowMiniMessage(false);
      }, 5000); // Hide after 5 seconds
    }, 15000); // Show every 15 seconds

    return () => clearInterval(interval);
  }, [isOpen, miniMessageClosed]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    const answer =
      predefinedQA[input.trim().toLowerCase()] ||
      "I'm sorry, I can only answer predefined questions. Please try asking about the dashboard's purpose, user roles, or how to export reports.";

    setInput('');

    setTimeout(() => {
      const botMessage: Message = { sender: 'bot', text: answer };
      setMessages(prev => [...prev, botMessage]);
    }, 1500); // 1.5-second delay
  };

  const handleCloseMiniMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowMiniMessage(false);
    setMiniMessageClosed(true);
  };

  return (
    <>
      <div
        className={`fixed bottom-10 right-28 z-50 transition-all duration-500 ease-in-out transform ${
          showMiniMessage && !isOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-5 pointer-events-none'
        }`}
      >
        <div className="bg-background p-3 rounded-lg shadow-lg flex items-start">
          <span>Having trouble? Ask me anything! ⚡</span>
          <button
            onClick={handleCloseMiniMessage}
            className="ml-4 -mt-1 -mr-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Popover
        open={isOpen}
        onOpenChange={open => {
          setIsOpen(open);
          if (open) {
            setShowMiniMessage(false);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg z-50"
            onClick={() => setShowMiniMessage(false)}
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
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">ReimburseAI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Ask questions about how to use the dashboard.
            </p>
          </div>
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 bg-background">
                      <AvatarFallback>
                        <Bot className="h-5 w-5 text-primary" />
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
                    <Avatar className="h-8 w-8 bg-background">
                      <AvatarFallback>
                        <User className="h-5 w-5 text-primary" />
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
                onChange={e => setInput(e.target.value)}
                placeholder="Type your question..."
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send 🚀</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
