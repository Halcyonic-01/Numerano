import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 1,
      text: "👋 Hi! I'm TeamBot, your AI assistant for Numerano. I can help you with:\n\n• Team registration process\n• Platform features\n• Technical support\n• Team management\n• Document uploads\n\nWhat would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message and loading indicator
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: "Thinking...",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const { data } = await api.post('/chat', { message: inputMessage });
      
      // Remove loading message and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const botMessage: Message = {
          id: Date.now() + 2,
          text: data.reply,
          sender: "bot",
          timestamp: new Date(),
        };
        return [...filtered, botMessage];
      });
    } catch (error: any) {
      // Remove loading message and show error
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage: Message = {
          id: Date.now() + 2,
          text: "Sorry, I'm experiencing some technical difficulties. Please try again or contact support if the issue persists.",
          sender: "bot",
          timestamp: new Date(),
        };
        return [...filtered, errorMessage];
      });
      
      toast({
        title: "Chat Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "How do I register my team?",
    "What documents do I need?",
    "How does team verification work?",
    "What's the maximum team size?",
    "How do I add team members?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-50",
          "bg-gradient-to-br from-primary to-accent text-primary-foreground",
          "hover:scale-110 hover:shadow-glow",
          "flex items-center justify-center"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[600px] glass-card rounded-2xl shadow-xl z-50 flex flex-col animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">TeamBot AI</h3>
                <p className="text-xs text-muted-foreground">Numerano Assistant • Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap",
                    message.sender === "user"
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about Numerano..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-br from-primary to-accent"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
