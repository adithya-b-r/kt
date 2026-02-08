'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

type Sentiment = 'Proud' | 'Emotional' | 'Neutral' | 'Confused' | 'Frustrated';

const sentiments: { value: Sentiment; label: string; emoji: string }[] = [
  { value: 'Proud', label: 'Proud', emoji: '🦚' },
  { value: 'Emotional', label: 'Emotional', emoji: '🥹' },
  { value: 'Neutral', label: 'Neutral', emoji: '😐' },
  { value: 'Confused', label: 'Confused', emoji: '🤔' },
  { value: 'Frustrated', label: 'Frustrated', emoji: '😤' },
];

const DEV_MODE = false; // Set to true to see timer logs in console

export function FeedbackModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const pathname = usePathname();
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    if (!user) return; // Don't track if not logged in

    // Check if we already have a start time in session storage
    const storedStartTime = sessionStorage.getItem('feedback_start_time');

    if (storedStartTime) {
      if (!timerStarted) setTimerStarted(true);
    } else if (pathname?.startsWith('/tree') && !hasSubmitted) {
      // First time visiting tree in this session
      sessionStorage.setItem('feedback_start_time', Date.now().toString());
      setTimerStarted(true);
    }
  }, [pathname, hasSubmitted, timerStarted, user]);

  useEffect(() => {
    if (hasSubmitted || open || !user) return;

    const interval = setInterval(() => {
      const storedStartTime = sessionStorage.getItem('feedback_start_time');
      if (storedStartTime) {
        const elapsed = Date.now() - parseInt(storedStartTime, 10);

        // Check if 2 minutes (120000ms) have passed
        if (elapsed >= 120000) {
          setOpen(true);
          sessionStorage.removeItem('feedback_start_time');
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [hasSubmitted, open, user]);

  const handleSubmit = async () => {
    if (!sentiment) {
      toast.error("Please select how you feel.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentiment, message }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      toast.success("Thank you for your feedback!");
      setHasSubmitted(true);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DEBUGGING: Using raw HTML to verify visibility
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4 relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold mb-2 text-center">Your experience matters</h2>
        <p className="text-center text-gray-600 mb-6">
          How did building this family tree make you feel?
        </p>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {sentiments.map((s) => (
            <button
              key={s.value}
              onClick={() => setSentiment(s.value)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 w-20 h-20",
                sentiment === s.value
                  ? "border-[#1b7c7c] bg-[#1b7c7c]/5 ring-2 ring-[#1b7c7c] ring-offset-2"
                  : "border-slate-200 hover:border-[#1b7c7c]/50 hover:bg-slate-50"
              )}
            >
              <span className="text-2xl mb-1">{s.emoji}</span>
              <span className={cn(
                "text-[10px] font-medium",
                sentiment === s.value ? "text-[#1b7c7c]" : "text-slate-600"
              )}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any additional thoughts? (Optional)"
            className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b7c7c]"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!sentiment || isSubmitting}
            className="bg-[#1b7c7c] hover:bg-[#156161] text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
