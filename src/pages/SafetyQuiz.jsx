import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Award, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Star } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What should you do if an unfamiliar person asks you to come to their vehicle for chocolate?",
    options: [
      "Go check what chocolate they have",
      "Say 'NO' loudly, step away, and immediately inform a trusted teacher or parent",
      "Keep it a secret and follow them",
      "Ask your friend to go instead"
    ],
    correct: 1,
    tip: "Remember: Never approach an unfamiliar car or accept gifts from strangers without parent permission!"
  },
  {
    id: 2,
    question: "When should you press the SOS Button on your KAVACH safety pendant?",
    options: [
      "When you feel lost, in danger, or need urgent help from parents",
      "Every time you finish your lunch",
      "Just for fun while playing tag",
      "When your homework is too difficult"
    ],
    correct: 0,
    tip: "The SOS button instantly alerts your parents and sends your exact live location for emergencies."
  },
  {
    id: 3,
    question: "What is a 'Safe Zone' on your school route?",
    options: [
      "An amusement park roller coaster",
      "A designated safe path/area (like your home, school, or bus stop) agreed with your family",
      "A dark alley with no street lights",
      "A busy highway median"
    ],
    correct: 1,
    tip: "Staying within agreed safe zones ensures your parents always know you are safe on your route."
  },
  {
    id: 4,
    question: "If you trip or take a bad fall on the road, what does your pendant's AI accelerometer do?",
    options: [
      "It plays loud music",
      "It shuts down immediately",
      "It senses the sudden high impact and alerts guardians with a Fall Detection beacon",
      "It changes color to purple"
    ],
    correct: 2,
    tip: "The smart motion sensor can detect falls even if you cannot reach the button yourself."
  },
  {
    id: 5,
    question: "What is the best way to remember emergency phone numbers?",
    options: [
      "Write them down on a scrap paper and throw it away",
      "Memorize at least two emergency numbers (Mom/Dad/Guardian) and keep them saved in your KAVACH directory",
      "Only rely on stranger phones",
      "Never share any contact information"
    ],
    correct: 1,
    tip: "Always know your parents' phone numbers by heart!"
  }
];

export default function SafetyQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentStep];

  const handleSelect = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === currentQ.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen w-full pt-[100px] pb-16 px-4 flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>CHILD SAFETY QUEST</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Fredoka']">
            Safety Champion Quiz
          </h1>
          <p className="text-xs text-gray-300">
            Learn essential rules to stay smart, safe, and connected every day!
          </p>
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-cyan-300">
                <span>Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</span>
                <span>Score: {score} ⭐️</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-5 rounded-2xl bg-white/10 border border-white/15">
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/15 text-white';
                if (selectedAnswer !== null) {
                  if (idx === currentQ.correct) {
                    btnStyle = 'bg-emerald-600/40 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                  } else if (idx === selectedAnswer) {
                    btnStyle = 'bg-red-600/40 border-red-400 text-red-200';
                  } else {
                    btnStyle = 'bg-white/5 border-white/5 text-gray-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleSelect(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedAnswer !== null && idx === currentQ.correct && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {selectedAnswer !== null && idx === selectedAnswer && idx !== currentQ.correct && (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Safety Tip on Answer */}
            {selectedAnswer !== null && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-xs text-cyan-200 space-y-1">
                <span className="font-bold block text-cyan-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  Safety Tip:
                </span>
                <p>{currentQ.tip}</p>
              </div>
            )}

            {/* Next Button */}
            {selectedAnswer !== null && (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_#00eaff] transition"
              >
                {currentStep === QUIZ_QUESTIONS.length - 1 ? 'See Results 🎉' : 'Next Question ➡️'}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 py-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.6)]">
              <Award className="w-10 h-10 text-yellow-300 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white font-['Fredoka']">
                {score >= 4 ? 'Certified Safety Champion! 🏆' : 'Great Effort! Keep Learning! 🌟'}
              </h2>
              <p className="text-sm text-gray-300">
                You scored <span className="font-bold text-cyan-400 text-lg">{score}</span> out of{' '}
                <span className="font-bold text-white text-lg">{QUIZ_QUESTIONS.length}</span> questions correctly!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="py-2.5 px-5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                Try Again
              </button>

              <button onClick={() => navigate('/dashboard')} className="btn-primary-glow text-xs py-2.5 px-5">
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Bottom Back Button */}
        {!isFinished && (
          <div className="pt-2 text-center">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary-glass text-xs py-2 px-4">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
