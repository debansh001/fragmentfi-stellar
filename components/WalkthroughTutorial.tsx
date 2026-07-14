"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TUTORIAL_STEPS = [
  {
    title: "Welcome to FragmentFi! 🎉",
    description: "You've successfully connected your wallet. FragmentFi is the easiest way to earn high-yield APY on the Stellar network while maintaining 100% self-custody.",
    icon: "✨"
  },
  {
    title: "Step 1: Deposit Assets",
    description: "To start earning yield, deposit your native XLM or USDC into the secure smart contract. In return, you will instantly mint FRAG tokens.",
    icon: "💰"
  },
  {
    title: "Step 2: Watch Your Yield Grow",
    description: "Your deposited assets are actively deployed. The Treasury pool generates real yield, which is automatically distributed to all FRAG token holders.",
    icon: "📈"
  },
  {
    title: "Step 3: Claim Your Rewards",
    description: "Whenever you're ready, simply hit the 'Claim Yield' button on your dashboard to securely transfer your earned rewards directly into your wallet.",
    icon: "🎁"
  }
];

export default function WalkthroughTutorial() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Only show if they haven't completed it yet
    const hasCompleted = localStorage.getItem('hasCompletedWalkthrough');
    if (!hasCompleted) {
      setIsVisible(true);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem('hasCompletedWalkthrough', 'true');
    setIsVisible(false);
    // Drive them into a new transaction once their authentication is done
    router.push('/deposit');
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const skipTutorial = () => {
    completeTutorial();
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={skipTutorial}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Skip Tutorial
          </button>
          
          <button 
            onClick={nextStep}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all hover:scale-105"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? "Make a Deposit!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
