'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  const [prevPath, setPrevPath] = useState<string | null>(null);

  // Initialize previous path tracking
  useEffect(() => {
    if (pathname) {
      setPrevPath(pathname);
    }
  }, []);

  // Monitor path changes to detect "exit" from tree
  useEffect(() => {
    if (!pathname || !user) return;

    // Check if we are navigating AWAY from tree (users act of "exiting")
    // Condition: Previous path was /tree..., Current path is NOT /tree...
    const isExitingTree = prevPath?.startsWith('/tree') && !pathname.startsWith('/tree');

    if (isExitingTree) {
      const lastPromptDate = localStorage.getItem('feedback_last_prompt_date');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Rules:
      // 1. Not already open or submitted in this session (handled by state)
      // 2. User has NOT been prompted in the last 24 hours
      let shouldShow = false;

      if (!open && !hasSubmitted) {
        if (!lastPromptDate) {
          shouldShow = true;
        } else {
          const lastPromptTime = parseInt(lastPromptDate, 10);
          if (now - lastPromptTime > oneDay) {
            shouldShow = true;
          }
        }
      }

      if (shouldShow) {
        setOpen(true);
        localStorage.setItem('feedback_last_prompt_date', now.toString());
      }
    }

    // Update prevPath for next change
    setPrevPath(pathname);
  }, [pathname, user, open, hasSubmitted, prevPath]);

  // Remove the old timer logic entirely
  // (The previous timer useEffect is replaced by this navigation effect)

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
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Your experience matters</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            How did building this family tree make you feel?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 justify-center mb-6 mt-4">
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
      </DialogContent>
    </Dialog>
  );
}
