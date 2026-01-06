import { useState, useRef, useEffect, useCallback } from 'react';
import styles from '../styles/Chatbot.module.css';
import type { StudentProfile, FeatureWeights, SimilarityResult, School } from '../types';
import { getTopSimilarSchools } from '../utils/similarity';
import { getDefaultFeatureWeights } from '../utils/validation';

interface Message {
  id: number;
  type: 'bot' | 'user';
  text: string;
  options?: QuickReply[];
  results?: SimilarityResult[];
}

interface QuickReply {
  label: string;
  value: string;
}

type ConversationStep =
  | 'greeting'
  | 'sat_score'
  | 'act_score'
  | 'graduation_rate'
  | 'tuition'
  | 'location'
  | 'school_size'
  | 'school_type'
  | 'priorities'
  | 'searching'
  | 'results'
  | 'follow_up';

const STEP_CONFIG: Record<ConversationStep, {
  message: string;
  options?: QuickReply[];
  field?: keyof StudentProfile;
  parseInput?: (input: string) => number | null;
}> = {
  greeting: {
    message: "Hi! I'm here to help you find your perfect college match. Let's start with a few questions about what you're looking for.",
    options: [
      { label: "Let's go!", value: 'start' },
      { label: "Tell me more", value: 'more_info' }
    ]
  },
  sat_score: {
    message: "What's your target SAT score? (or the average SAT of schools you're interested in)",
    options: [
      { label: '1400+ (Highly selective)', value: '1450' },
      { label: '1200-1400 (Selective)', value: '1300' },
      { label: '1000-1200 (Moderate)', value: '1100' },
      { label: 'Below 1000', value: '950' }
    ],
    field: 'avg_sat',
    parseInput: (input) => {
      const num = parseInt(input.replace(/[^0-9]/g, ''));
      return num >= 400 && num <= 1600 ? num : null;
    }
  },
  act_score: {
    message: "What about ACT score?",
    options: [
      { label: '30+ (Top tier)', value: '32' },
      { label: '25-30 (Strong)', value: '27' },
      { label: '20-25 (Average)', value: '22' },
      { label: 'Below 20', value: '18' }
    ],
    field: 'avg_act',
    parseInput: (input) => {
      const num = parseInt(input.replace(/[^0-9]/g, ''));
      return num >= 1 && num <= 36 ? num : null;
    }
  },
  graduation_rate: {
    message: "How important is graduation rate to you?",
    options: [
      { label: '90%+ (Very high)', value: '92' },
      { label: '75-90% (Good)', value: '82' },
      { label: '60-75% (Moderate)', value: '67' },
      { label: "Doesn't matter much", value: '50' }
    ],
    field: 'graduation_rate',
    parseInput: (input) => {
      const num = parseInt(input.replace(/[^0-9]/g, ''));
      return num >= 0 && num <= 100 ? num : null;
    }
  },
  tuition: {
    message: "What's your budget for tuition per year?",
    options: [
      { label: 'Under $15k (Budget-friendly)', value: '12000' },
      { label: '$15k-$30k (Moderate)', value: '22000' },
      { label: '$30k-$50k (Higher end)', value: '40000' },
      { label: '$50k+ (Premium)', value: '55000' }
    ],
    field: 'tuition_cost',
    parseInput: (input) => {
      const num = parseInt(input.replace(/[^0-9]/g, ''));
      return num >= 0 && num <= 100000 ? num : null;
    }
  },
  location: {
    message: "Do you have a preferred region? (This affects the location matching)",
    options: [
      { label: 'Northeast (Boston, NYC)', value: 'northeast' },
      { label: 'West Coast (CA, WA)', value: 'west' },
      { label: 'Midwest (Chicago, etc)', value: 'midwest' },
      { label: 'South (TX, FL, etc)', value: 'south' },
      { label: 'No preference', value: 'none' }
    ]
  },
  school_size: {
    message: "What size school do you prefer?",
    options: [
      { label: 'Large (20,000+)', value: '30000' },
      { label: 'Medium (10,000-20,000)', value: '15000' },
      { label: 'Small (under 10,000)', value: '5000' }
    ],
    field: 'student_population',
    parseInput: (input) => {
      const lower = input.toLowerCase();
      if (lower.includes('large') || lower.includes('big')) return 30000;
      if (lower.includes('small') || lower.includes('little')) return 5000;
      if (lower.includes('medium') || lower.includes('mid')) return 15000;
      const num = parseInt(input.replace(/[^0-9]/g, ''));
      return num >= 100 && num <= 100000 ? num : null;
    }
  },
  school_type: {
    message: "Public or private institution?",
    options: [
      { label: 'Public (usually cheaper)', value: 'public' },
      { label: 'Private (often smaller classes)', value: 'private' },
      { label: 'No preference', value: 'none' }
    ]
  },
  priorities: {
    message: "Last question! What matters most to you? (This will weight the results)",
    options: [
      { label: 'Academic excellence', value: 'academics' },
      { label: 'Affordability', value: 'cost' },
      { label: 'High graduation rate', value: 'graduation' },
      { label: 'Balance of everything', value: 'balance' }
    ]
  },
  searching: {
    message: "Perfect! Let me find the best matches for you..."
  },
  results: {
    message: "Here are your top college matches!"
  },
  follow_up: {
    message: "Would you like to refine your search?",
    options: [
      { label: 'Start over', value: 'restart' },
      { label: 'Adjust preferences', value: 'adjust' },
      { label: "I'm done, thanks!", value: 'done' }
    ]
  }
};

// Region coordinates for location matching
const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  northeast: { lat: 42.3601, lng: -71.0589 }, // Boston
  west: { lat: 34.0522, lng: -118.2437 }, // LA
  midwest: { lat: 41.8781, lng: -87.6298 }, // Chicago
  south: { lat: 29.7604, lng: -95.3698 }, // Houston
};

interface ChatbotProps {
  onResultsFound?: (results: SimilarityResult[]) => void;
}

export default function Chatbot({ onResultsFound }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState<ConversationStep>('greeting');
  const [profile, setProfile] = useState<Partial<StudentProfile>>({});
  const [weights, setWeights] = useState<FeatureWeights>(getDefaultFeatureWeights());
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  // Load schools data on mount
  useEffect(() => {
    fetch('/data/schools.json')
      .then(res => res.json())
      .then(data => setSchools(data))
      .catch(err => console.error('Error loading schools:', err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = useCallback((type: 'bot' | 'user', text: string, options?: QuickReply[], results?: SimilarityResult[]) => {
    const id = ++messageIdRef.current;
    setMessages(prev => [...prev, { id, type, text, options, results }]);
    return id;
  }, []);

  const simulateTyping = useCallback(async (callback: () => void) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    setIsTyping(false);
    callback();
  }, []);

  const processStep = useCallback(async (step: ConversationStep) => {
    const config = STEP_CONFIG[step];

    if (step === 'searching') {
      addMessage('bot', config.message);

      // Build complete profile with valid defaults (must pass API validation)
      const completeProfile: StudentProfile = {
        avg_sat: profile.avg_sat ?? 1200,
        avg_act: profile.avg_act ?? 25,
        graduation_rate: profile.graduation_rate ?? 75,
        acceptance_rate: profile.acceptance_rate ?? 50,
        student_faculty_ratio: profile.student_faculty_ratio ?? 15,
        tuition_cost: profile.tuition_cost ?? 30000,
        avg_aid: profile.avg_aid ?? 10000,
        student_population: profile.student_population ?? 15000,
        international_percentage: profile.international_percentage ?? 8,
        latitude: profile.latitude ?? null,
        longitude: profile.longitude ?? null,
        ranking: profile.ranking ?? 150
      };

      console.log('Searching with profile:', completeProfile);

      // Use local computation (no API validation needed)
      if (schools.length === 0) {
        addMessage('bot', "Still loading school data, please try again in a moment!");
        setCurrentStep('greeting');
        return;
      }

      try {
        const results = getTopSimilarSchools(completeProfile, schools, 5, weights);

        simulateTyping(() => {
          addMessage('bot', "Here are your top college matches! Click on any school name to visit their website.", undefined, results);
          onResultsFound?.(results);

          setTimeout(() => {
            simulateTyping(() => {
              setCurrentStep('follow_up');
              const followUpConfig = STEP_CONFIG['follow_up'];
              addMessage('bot', followUpConfig.message, followUpConfig.options);
            });
          }, 1000);
        });
      } catch (error: any) {
        console.error('Chatbot search error:', error);
        addMessage('bot', `Sorry, I had trouble finding matches. Let's try again!`);
        setCurrentStep('greeting');
      }
      return;
    }

    addMessage('bot', config.message, config.options);
  }, [addMessage, profile, weights, simulateTyping, onResultsFound]);

  // Start conversation when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      processStep('greeting');
    }
  }, [isOpen, messages.length, processStep]);

  const getNextStep = (current: ConversationStep): ConversationStep => {
    const steps: ConversationStep[] = [
      'greeting', 'sat_score', 'act_score', 'graduation_rate',
      'tuition', 'location', 'school_size', 'school_type',
      'priorities', 'searching'
    ];
    const currentIndex = steps.indexOf(current);
    return steps[currentIndex + 1] || 'searching';
  };

  const handleUserInput = useCallback((input: string, isQuickReply = false) => {
    addMessage('user', input);

    const config = STEP_CONFIG[currentStep];

    // Handle special cases
    if (currentStep === 'greeting') {
      if (input.toLowerCase().includes('more')) {
        simulateTyping(() => {
          addMessage('bot', "I'll ask you about your preferences for things like test scores, budget, school size, and location. Based on your answers, I'll find colleges that match your profile using data from over 1,100 real US colleges!", [
            { label: "Sounds good!", value: 'start' }
          ]);
        });
        return;
      }
      simulateTyping(() => {
        setCurrentStep('sat_score');
        processStep('sat_score');
      });
      return;
    }

    if (currentStep === 'follow_up') {
      if (input.toLowerCase().includes('restart') || input.toLowerCase().includes('start over')) {
        setProfile({});
        setWeights(getDefaultFeatureWeights());
        setMessages([]);
        messageIdRef.current = 0;
        setCurrentStep('greeting');
        setTimeout(() => processStep('greeting'), 100);
        return;
      }
      if (input.toLowerCase().includes('done') || input.toLowerCase().includes('thanks')) {
        simulateTyping(() => {
          addMessage('bot', "Great! Good luck with your college search! Feel free to come back anytime. 🎓");
        });
        return;
      }
      // Adjust preferences - restart but keep some data
      simulateTyping(() => {
        setCurrentStep('sat_score');
        processStep('sat_score');
      });
      return;
    }

    // Parse input for profile fields
    if (config.field && config.parseInput) {
      const value = isQuickReply ? parseInt(input) : config.parseInput(input);
      if (value !== null) {
        setProfile(prev => ({ ...prev, [config.field!]: value }));
      }
    }

    // Handle location specially
    if (currentStep === 'location' && input !== 'none') {
      const region = input.toLowerCase();
      const coords = REGION_COORDS[region];
      if (coords) {
        setProfile(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
        setWeights(prev => ({ ...prev, latitude: 3, longitude: 3 }));
      }
    }

    // Handle priorities for weighting
    if (currentStep === 'priorities') {
      const priority = input.toLowerCase();
      if (priority.includes('academic')) {
        setWeights(prev => ({ ...prev, avg_sat: 3, avg_act: 3, graduation_rate: 2, ranking: 3 }));
      } else if (priority.includes('cost') || priority.includes('afford')) {
        setWeights(prev => ({ ...prev, tuition_cost: 3, avg_aid: 3 }));
      } else if (priority.includes('graduation')) {
        setWeights(prev => ({ ...prev, graduation_rate: 4 }));
      }
    }

    // Move to next step
    simulateTyping(() => {
      const nextStep = getNextStep(currentStep);
      setCurrentStep(nextStep);
      processStep(nextStep);
    });
  }, [currentStep, addMessage, simulateTyping, processStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    handleUserInput(inputValue.trim());
    setInputValue('');
  };

  const handleQuickReply = (value: string, label: string) => {
    if (isTyping) return;
    handleUserInput(label, true);
  };

  return (
    <div className={styles.chatbotContainer}>
      {!isOpen ? (
        <button className={styles.chatButton} onClick={() => setIsOpen(true)}>
          <span className={styles.chatIcon}>💬</span>
          <span className={styles.chatLabel}>Find My College</span>
        </button>
      ) : (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>College Finder Assistant</span>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map(message => (
              <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
                <div className={styles.messageContent}>
                  {message.text}
                </div>

                {message.results && (
                  <div className={styles.resultsContainer}>
                    {message.results.map((result, idx) => (
                      <div key={result.school.school_id} className={styles.resultCard}>
                        <div className={styles.resultRank}>#{idx + 1}</div>
                        <div className={styles.resultInfo}>
                          <a
                            href={result.school.website?.startsWith('http') ? result.school.website : `https://${result.school.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.schoolLink}
                          >
                            {result.school.school_name}
                          </a>
                          <span className={styles.resultLocation}>
                            {result.school.city}, {result.school.state}
                          </span>
                          <span className={styles.resultScore}>
                            {(result.score * 100).toFixed(0)}% match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.options && (
                  <div className={styles.quickReplies}>
                    {message.options.map(option => (
                      <button
                        key={option.value}
                        className={styles.quickReply}
                        onClick={() => handleQuickReply(option.value, option.label)}
                        disabled={isTyping}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputContainer} onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              className={styles.input}
              disabled={isTyping}
            />
            <button type="submit" className={styles.sendButton} disabled={isTyping || !inputValue.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
