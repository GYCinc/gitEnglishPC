
import React, { useState, useEffect, useRef } from 'react';
import { 
    ExerciseType, IFITBExercise, ICollocationExercise, IPhrasalVerbGapFillExercise, 
    IWordFormationExercise, IMultipleChoiceExercise, IPredictionExercise, IRuleDiscoveryExercise, 
    ISpotTheDifferenceExercise, IPolitenessScenariosExercise, IInferringMeaningExercise, 
    ISentenceScrambleExercise, IClozeParagraphExercise, IDialogueCompletionExercise, 
    IMatchingExercise, IFunctionMatchingExercise, IErrorCorrectionExercise, 
    IStorySequencingExercise, IReadingGistExercise, IReadingDetailExercise, 
    IPicturePromptExercise, IMoralDilemmaExercise, IFunctionalWritingExercise, 
    IProblemSolvingScenarioExercise, IRolePlayScenarioExercise, IStorytellingFromPromptsExercise, 
    IJustifyYourOpinionExercise, IPictureComparisonExercise, IDictoGlossExercise, 
    ICollocationOddOneOutExercise, IInformationTransferExercise, IListeningSpecificInfoExercise, 
    IRegisterSortExercise 
} from '../types';
import { checkAnswerWithAI } from '../services/geminiService';
import { LoadingIcon, SpeakerWaveIcon, SparklesIcon } from './icons';

// --- HELPER & GENERIC COMPONENTS ---
const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

export const Chip: React.FC<{
  text: string;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLSpanElement>) => void;
  draggable?: boolean;
  disabled?: boolean;
  className?: string;
  chipColors: { bg: string; text: string; border: string; };
}> = ({ text, onClick, onDragStart, draggable, disabled, className = '', chipColors }) => (
    <span
        draggable={draggable && !disabled}
        onDragStart={onDragStart}
        onClick={onClick}
        className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all shadow-sm ${chipColors.border} ${chipColors.bg} ${chipColors.text} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : draggable ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md' : 'cursor-pointer hover:brightness-95 hover:-translate-y-0.5'}`}
    >
        {text}
    </span>
);

export const FeedbackSection: React.FC<{ 
    onCheck: () => void; 
    feedback: string | null; 
    loading: boolean;
    hasInput: boolean;
}> = ({ onCheck, feedback, loading, hasInput }) => {
    return (
        <div className="mt-6 pt-4 border-t border-dashed border-slate-300">
            {!feedback && (
                <div className="flex justify-end">
                    <button 
                        onClick={onCheck} 
                        disabled={loading || !hasInput} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:shadow-lg active:scale-95 
                        ${!hasInput ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110'}`}
                    >
                        {loading ? <LoadingIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                        {loading ? 'Checking...' : 'Check with AI'}
                    </button>
                </div>
            )}
            {feedback && (
                <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h5 className="font-bold text-indigo-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <SparklesIcon className="w-4 h-4 text-indigo-600"/> Genie Feedback
                    </h5>
                    <p className="whitespace-pre-wrap text-indigo-900 text-sm leading-relaxed font-medium">{feedback}</p>
                    <div className="flex justify-end mt-2">
                        <button onClick={onCheck} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 underline">
                            Check Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- EXERCISES ---

export const InteractiveFITB: React.FC<{ exercise: IFITBExercise | ICollocationExercise | IPhrasalVerbGapFillExercise; colors: any; }> = ({ exercise, colors }) => {
    const [droppedWord, setDroppedWord] = useState<string | null>(null);
    const [status, setStatus] = useState<'correct' | 'incorrect' | 'neutral'>('neutral');

    const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
        e.preventDefault();
        const word = e.dataTransfer.getData('text/plain');
        setDroppedWord(word);
        setStatus(word === exercise.answer ? 'correct' : 'incorrect');
    };
    
    const statusClasses = {
        correct: 'bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200',
        incorrect: 'bg-red-100 border-red-500 text-red-800 ring-2 ring-red-200',
        neutral: `${colors.chip.bg} ${colors.chip.border}`,
    };

    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            {'collocation' in exercise && <p className="text-sm italic opacity-70 mb-2 font-playful">Collocation: {exercise.collocation}</p>}
            {'phrasalVerb' in exercise && <p className="text-sm italic opacity-70 mb-2 font-playful">Phrasal Verb: {exercise.phrasalVerb}</p>}
            <p className={`leading-loose`}>
                {exercise.question.split('[BLANK]')[0]}
                <span onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className={`inline-flex items-center justify-center min-w-[100px] h-8 mx-1 px-2 border-b-2 border-dashed rounded-lg text-center align-baseline transition-all ${statusClasses[status]}`}>
                    {droppedWord || <span className="opacity-30 text-xs">drop here</span>}
                </span>
                {exercise.question.split('[BLANK]')[1]}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
                {exercise.wordBank.map(word => (
                   <Chip key={word} text={word} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', word)} chipColors={colors.chip} />
                ))}
            </div>
        </div>
    );
};

export const InteractiveWordFormation: React.FC<{ exercise: IWordFormationExercise; colors: any; }> = ({ exercise, colors }) => {
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Word Formation', exercise, userInput);
        setFeedback(result);
        setLoading(false);
    };
    
    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <p className="mb-2 font-bold text-sm uppercase tracking-wide opacity-70">Task</p>
            <p className={`mb-3 leading-relaxed`}>
                {exercise.question.replace('[BLANK]', '______')} <span className="font-bold italic text-lg ml-2 font-playful">({exercise.rootWord})</span>
            </p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        setFeedback(null);
                    }}
                    className={`flex-grow p-2 rounded-xl border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none transition-all font-bold`}
                    placeholder="Type correct form..."
                />
            </div>
            <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={userInput.length > 0} 
            />
        </div>
    );
};

export const InteractiveMCQ: React.FC<{ exercise: IMultipleChoiceExercise | IPredictionExercise | IRuleDiscoveryExercise | ISpotTheDifferenceExercise | IPolitenessScenariosExercise | IInferringMeaningExercise; colors: any; }> = ({ exercise, colors }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleClick = (option: string) => {
        if (isAnswered) return;
        setSelected(option);
        setIsAnswered(true);
    };

    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            {'sentences' in exercise && (
                <div className={`mb-4 p-3 rounded-xl bg-white/50 border-2 ${colors.chip.border} italic space-y-1`}>
                    {exercise.sentences.map((s, i) => <p key={i}>"{s}"</p>)}
                </div>
            )}
            {'sentenceA' in exercise && (
                 <div className="mb-4 space-y-2 p-3 rounded-xl bg-white/50 border-2 border-dashed border-slate-300">
                    <p><span className="font-bold mr-2 bg-slate-200 rounded px-1">A</span> {exercise.sentenceA}</p>
                    <p><span className="font-bold mr-2 bg-slate-200 rounded px-1">B</span> {exercise.sentenceB}</p>
                </div>
            )}
            {'scenario' in exercise && (
                <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="italic font-medium">{exercise.scenario}</p>
                </div>
            )}
             {'dialogue' in exercise && (
                <div className={`mb-4 p-3 rounded-xl border-l-4 ${colors.border} bg-slate-50`}>
                    <p className="whitespace-pre-wrap font-playful text-lg">{exercise.dialogue}</p>
                </div>
            )}
            <p className={`font-bold text-lg mb-3`}>
                {'question' in exercise ? exercise.question : ('storyStart' in exercise ? exercise.storyStart : '')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exercise.options.map(option => {
                    const isCorrect = option === exercise.correctAnswer;
                    const isSelected = option === selected;
                    let buttonClass = `${colors.chip.bg} ${colors.chip.text} border-2 ${colors.chip.border} hover:-translate-y-0.5 hover:shadow-md`;

                    if (isAnswered) {
                        if (isCorrect) buttonClass = 'bg-green-500 text-white border-green-600 shadow-inner';
                        else if (isSelected) buttonClass = 'bg-red-500 text-white border-red-600';
                        else buttonClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                    }
                    return (
                        <button key={option} onClick={() => handleClick(option)} disabled={isAnswered} className={`p-3 rounded-xl text-sm font-bold text-left transition-all duration-200 ${buttonClass}`}>
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export interface ScrambledWord {
  id: number;
  word: string;
}

export const InteractiveSentenceScramble: React.FC<{ exercise: ISentenceScrambleExercise; colors: any; }> = ({ exercise, colors }) => {
    const [solution, setSolution] = useState<ScrambledWord[]>([]);
    const [bank, setBank] = useState<ScrambledWord[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initialWords = exercise.scrambledWords.map((word, index) => ({ word, id: index }));
        setBank(initialWords);
        setSolution([]);
        setFeedback(null);
    }, [exercise]);

    const addToSolution = (wordToAdd: ScrambledWord) => {
        setSolution(prev => [...prev, wordToAdd]);
        setBank(prev => prev.filter(w => w.id !== wordToAdd.id));
        setFeedback(null);
    };

    const removeFromSolution = (wordToRemove: ScrambledWord) => {
        setSolution(prev => prev.filter(w => w.id !== wordToRemove.id));
        setBank(prev => [...prev, wordToRemove]);
        setFeedback(null);
    };

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Sentence Scramble', exercise, solution.map(w => w.word).join(' '));
        setFeedback(result);
        setLoading(false);
    };

    const statusClasses = {
        neutral: `border-dashed border-slate-300 bg-slate-50`,
    };

    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <p className="mb-2 font-bold opacity-70 text-sm uppercase">Build the sentence</p>
            <div className={`min-h-[4rem] p-3 rounded-2xl border-4 flex flex-wrap gap-2 items-center transition-colors mb-4 ${statusClasses.neutral}`}>
                {solution.length === 0 && <span className="text-slate-400 italic text-sm w-full text-center">Click words below...</span>}
                {solution.map((word) => (
                    <Chip key={word.id} text={word.word} onClick={() => removeFromSolution(word)} chipColors={colors.chip} />
                ))}
            </div>
            <div className="mb-4 flex flex-wrap gap-2 justify-center">
                {bank.map((word) => (
                    <Chip key={word.id} text={word.word} onClick={() => addToSolution(word)} chipColors={colors.chip} />
                ))}
            </div>
            <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={solution.length > 0} 
            />
        </div>
    );
};

export const InteractiveClozeOrDialogue: React.FC<{ exercise: IClozeParagraphExercise | IDialogueCompletionExercise; colors: any; }> = ({ exercise, colors }) => {
    const text = 'paragraph' in exercise ? exercise.paragraph : exercise.dialogue;
    const textParts = text.split('[BLANK]');
    
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Cloze/Dialogue', exercise, answers);
        setFeedback(result);
        setLoading(false);
    };

    const handleChange = (index: number, value: string) => {
        setAnswers(prev => ({ ...prev, [index]: value }));
        setFeedback(null);
    };
    
    return (
        <div className={`text-base leading-loose font-casual ${colors.textOnLight}`}>
            {textParts.map((part, index) => (
                <React.Fragment key={index}>
                    {part.split(/(\\n)/g).map((line, lineIndex) => 
                      line === '\n' ? <br key={lineIndex} /> : <span key={lineIndex}>{line}</span>
                    )}
                    {index < textParts.length - 1 && (
                        <select 
                            value={answers[index] || ''}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className={`mx-1 px-2 py-1 rounded-lg border-2 ${colors.chip.border} ${colors.chip.bg} ${colors.chip.text} text-sm font-bold align-middle focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none cursor-pointer`}
                        >
                            <option value="">...</option>
                            {exercise.wordBank.map(word => <option key={word} value={word}>{word}</option>)}
                        </select>
                    )}
                </React.Fragment>
            ))}
            <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={Object.keys(answers).length > 0} 
            />
        </div>
    );
};

export const InteractiveMatching: React.FC<{ exercise: IMatchingExercise | IFunctionMatchingExercise; colors: any; }> = ({ exercise, colors }) => {
    type MatchInfo = { answerIndex: number; isCorrect: boolean };
    const [shuffledAnswers, setShuffledAnswers] = useState(() => shuffleArray(exercise.answers));
    const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
    const [matches, setMatches] = useState<Record<number, MatchInfo>>({});

    const handleSelectPrompt = (promptIndex: number) => {
        if (matches[promptIndex]) return;
        setSelectedPrompt(promptIndex);
    };
    
    const handleSelectAnswer = (answerIndex: number) => {
        if (selectedPrompt === null || Object.values(matches).some(m => (m as MatchInfo).answerIndex === answerIndex)) {
            return;
        }

        const isCorrect = exercise.answers[selectedPrompt] === shuffledAnswers[answerIndex];
        setMatches(prev => ({ ...prev, [selectedPrompt]: { answerIndex, isCorrect } }));
        setSelectedPrompt(null);
    };

    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <p className="mb-3 font-bold text-sm opacity-70 uppercase">Connect the pairs</p>
            <div className="flex gap-4 md:gap-8">
                <div className="flex-1 space-y-2">
                    {exercise.prompts.map((prompt, promptIndex) => {
                        const match = matches[promptIndex];
                        const isSelected = selectedPrompt === promptIndex;
                        
                        let buttonClass = `bg-white border-2 ${colors.chip.border} ${colors.chip.text}`;
                        if (match) {
                            buttonClass = match.isCorrect 
                                ? 'bg-green-100 text-green-800 border-green-500' 
                                : 'bg-red-100 text-red-800 border-red-500';
                        } else if (isSelected) {
                            const selectedBg = colors.textOnLight.replace('text-', 'bg-');
                            buttonClass = `${selectedBg} text-white border-transparent scale-105 shadow-md`;
                        }
                        
                        return <button key={promptIndex} onClick={() => handleSelectPrompt(promptIndex)} disabled={!!match} className={`w-full p-3 rounded-xl text-sm font-medium text-left transition-all ${buttonClass}`}>{prompt}</button>
                    })}
                </div>
                <div className="flex-1 space-y-2">
                    {shuffledAnswers.map((answer, answerIndex) => {
                        const matchEntry = Object.entries(matches).find(([, value]) => (value as MatchInfo).answerIndex === answerIndex);
                        const isMatched = !!matchEntry;
                        
                        let buttonClass = `bg-white border-2 ${colors.chip.border} ${colors.chip.text}`;
                        if (isMatched) {
                            const match = matchEntry[1] as MatchInfo;
                            buttonClass = match.isCorrect 
                               ? 'bg-green-100 text-green-800 border-green-500' 
                               : 'bg-red-100 text-red-800 border-red-500';
                        }
                        
                        return <button key={answerIndex} onClick={() => handleSelectAnswer(answerIndex)} disabled={isMatched} className={`w-full p-3 rounded-xl text-sm font-medium text-left transition-all ${buttonClass}`}>{answer}</button>
                    })}
                </div>
            </div>
        </div>
    );
};


export const InteractiveErrorCorrection: React.FC<{ exercise: IErrorCorrectionExercise; colors: any; }> = ({ exercise, colors }) => {
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Error Correction', exercise, userInput);
        setFeedback(result);
        setLoading(false);
    };

    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <p className="mb-2 font-playful text-lg text-red-500/80">Incorrect:</p>
            <div className="mb-4 p-3 bg-red-50 rounded-xl border-l-4 border-red-300 italic">"{exercise.incorrectSentence}"</div>
            <p className="mb-2 font-playful text-lg text-green-600/80">Correct:</p>
            <input
                type="text"
                value={userInput}
                onChange={(e) => {
                    setUserInput(e.target.value);
                    setFeedback(null);
                }}
                className={`w-full p-3 rounded-xl border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none transition-all font-medium`}
                placeholder="Type corrected sentence..."
            />
             <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={userInput.length > 0} 
            />
        </div>
    );
};

export const InteractiveStorySequencing: React.FC<{ exercise: IStorySequencingExercise; colors: any; }> = ({ exercise, colors }) => {
    const [parts, setParts] = useState(() => shuffleArray(exercise.storyParts));
    const [status, setStatus] = useState<'correct' | 'incorrect' | 'neutral'>('neutral');
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        dragItem.current = index;
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const newParts = [...parts];
            const draggedItemContent = newParts.splice(dragItem.current, 1)[0];
            newParts.splice(dragOverItem.current, 0, draggedItemContent);
            setParts(newParts);
        }
        dragItem.current = null;
        dragOverItem.current = null;
        setStatus('neutral');
    };

    const checkAnswer = () => {
        const isCorrect = parts.join('') === exercise.storyParts.join('');
        setStatus(isCorrect ? 'correct' : 'incorrect');
    };

     const statusClasses = {
        correct: 'border-green-500 bg-green-50',
        incorrect: 'border-red-500 bg-red-50',
        neutral: 'border-transparent',
    };

    const buttonBg = colors.textOnLight.replace('text-', 'bg-');

    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <h4 className="font-playful text-xl mb-2">{exercise.title}</h4>
            <ul className={`space-y-2 border-4 border-dashed p-2 rounded-2xl transition-colors ${statusClasses[status]}`}>
                {parts.map((part, i) => (
                    <li
                        key={i}
                        draggable
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragEnter={(e) => handleDragEnter(e, i)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`p-3 rounded-xl cursor-grab active:cursor-grabbing bg-white border-2 ${colors.chip.border} shadow-sm hover:shadow-md transition-all`}
                    >
                       <span className="font-bold mr-2 text-slate-400">{i+1}.</span> {part}
                    </li>
                ))}
            </ul>
             <button onClick={checkAnswer} className={`w-full mt-3 p-2.5 rounded-xl font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 ${buttonBg}`}>Check Order</button>
        </div>
    );
};

export const InteractiveReadingGist: React.FC<{ exercise: IReadingGistExercise; colors: any; }> = ({ exercise, colors }) => (
    <div className={`text-base font-casual ${colors.textOnLight}`}>
        <h4 className="font-playful text-2xl mb-1">{exercise.title}</h4>
        <div className={`p-4 rounded-2xl bg-white border-2 ${colors.chip.border} mb-6 shadow-inner leading-relaxed whitespace-pre-wrap`}>
            {exercise.text}
        </div>
        <InteractiveMCQ exercise={{...exercise}} colors={colors} />
    </div>
);

export const InteractiveReadingDetail: React.FC<{ exercise: IReadingDetailExercise; colors: any; }> = ({ exercise, colors }) => {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Reading for Detail', exercise, answers);
        setFeedback(result);
        setLoading(false);
    };

    const inputStyle = `w-full p-2 rounded-xl border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none transition-all`;
    
    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <h4 className="font-playful text-2xl mb-2">{exercise.title}</h4>
            <div className={`p-4 rounded-2xl bg-white border-2 ${colors.chip.border} mb-6 shadow-inner leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar-light`}>
                {exercise.text}
            </div>
            <div className="space-y-4">
                {exercise.questions.map((q, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl">
                        <label className="block text-sm font-bold mb-2">{q.question}</label>
                        <input 
                            type="text" 
                            className={inputStyle} 
                            placeholder="Answer here..." 
                            value={answers[i] || ''}
                            onChange={(e) => {
                                setAnswers(prev => ({...prev, [i]: e.target.value}));
                                setFeedback(null);
                            }}
                        />
                    </div>
                ))}
            </div>
            <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={Object.keys(answers).length > 0}
            />
        </div>
    );
};

export const InteractivePicturePrompt: React.FC<{ exercise: IPicturePromptExercise; colors: any; }> = ({ exercise, colors }) => {
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
      setLoading(true);
      const result = await checkAnswerWithAI('Picture Prompt Questions', exercise, response);
      setFeedback(result);
      setLoading(false);
  };

  const textareaStyle = `w-full p-3 rounded-xl border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none transition-all`;
  
  return (
    <div className={`text-base font-casual ${colors.textOnLight}`}>
      <h4 className="font-playful text-xl mb-2">{exercise.title}</h4>
      <div className="bg-black/5 p-2 rounded-2xl border-2 border-dashed border-slate-300 mb-4">
          <img src={exercise.imageUrl} alt={exercise.prompt} className="w-full h-auto rounded-xl object-contain shadow-sm" />
      </div>
      <label className="font-bold mb-2 block text-sm uppercase opacity-70">Your Questions</label>
      <textarea
        rows={3}
        className={textareaStyle}
        placeholder="Write 3-5 questions about the scene..."
        value={response}
        onChange={(e) => {
            setResponse(e.target.value);
            setFeedback(null);
        }}
      />
      <FeedbackSection 
        onCheck={handleCheck} 
        feedback={feedback} 
        loading={loading} 
        hasInput={response.length > 5}
      />
    </div>
  );
};


export const InteractiveOpenResponseTask: React.FC<{ exercise: IMoralDilemmaExercise | IFunctionalWritingExercise | IProblemSolvingScenarioExercise | IRolePlayScenarioExercise | IStorytellingFromPromptsExercise | IJustifyYourOpinionExercise | IPictureComparisonExercise; colors: any; }> = ({ exercise, colors }) => {
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  let promptContent: React.ReactNode | string = '';
  let instruction = '';
  let exType = 'Writing Task';

  if ('dilemma' in exercise) { // MoralDilemma
      promptContent = exercise.dilemma;
      instruction = 'What would you do? Explain.';
      exType = 'Moral Dilemma';
  } else if ('scenario' in exercise && 'task' in exercise) { // FunctionalWriting
      promptContent = exercise.scenario;
      instruction = exercise.task;
      exType = 'Functional Writing';
  } else if ('scenario' in exercise) { // ProblemSolvingScenario
      promptContent = (exercise as IProblemSolvingScenarioExercise).scenario;
      instruction = 'Your Solution:';
      exType = 'Problem Solving';
  } else if ('situation' in exercise) { // RolePlayScenario
      promptContent = `You are: ${exercise.character}.\nSituation: ${exercise.situation}`;
      instruction = exercise.task;
      exType = 'Role Play';
  } else if ('prompts' in exercise) { // Storytelling
      promptContent = `Includes: ${exercise.prompts.map(p => `"${p}"`).join(', ')}`;
      instruction = exercise.task;
      exType = 'Storytelling';
  } else if ('statement' in exercise) { // JustifyOpinion
      promptContent = `"${exercise.statement}"`;
      instruction = exercise.task;
      exType = 'Justify Opinion';
  } else if ('promptA' in exercise) { // PictureComparison
      promptContent = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-2 rounded-lg border"><strong>A:</strong> {exercise.promptA}</div>
            <div className="bg-white p-2 rounded-lg border"><strong>B:</strong> {exercise.promptB}</div>
        </div>
      );
      instruction = exercise.task;
      exType = 'Picture Comparison';
  }
  
  const handleCheck = async () => {
      setLoading(true);
      const result = await checkAnswerWithAI(exType, exercise, response);
      setFeedback(result);
      setLoading(false);
  };

  const textareaStyle = `w-full p-3 rounded-xl border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none transition-all font-casual`;

  return (
    <div className={`text-base font-casual ${colors.textOnLight}`}>
      <h4 className="font-playful text-xl mb-3">{exercise.title}</h4>
      <div className="mb-4 p-4 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-100">
          {typeof promptContent === 'string' ? <p className="italic text-lg">{promptContent}</p> : promptContent}
      </div>
      <label className="font-bold mb-2 block text-sm uppercase opacity-70">{instruction}</label>
      <textarea
        rows={5}
        className={textareaStyle}
        placeholder="Type your response here..."
        value={response}
        onChange={(e) => {
            setResponse(e.target.value);
            setFeedback(null);
        }}
      />
      <FeedbackSection 
        onCheck={handleCheck} 
        feedback={feedback} 
        loading={loading} 
        hasInput={response.length > 10}
      />
    </div>
  );
};

export const InteractiveDictoGloss: React.FC<{ exercise: IDictoGlossExercise; colors: any; }> = ({ exercise, colors }) => {
    const [showText, setShowText] = useState(true);
    const [response, setResponse] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Dicto-Gloss', exercise, response);
        setFeedback(result);
        setLoading(false);
    };

    const buttonBg = colors.textOnLight.replace('text-', 'bg-');
    const textareaStyle = `mt-4 w-full p-3 rounded-xl border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none transition-all`;
    
    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <h4 className="font-playful text-xl mb-2">{exercise.title}</h4>
            <div className={`p-3 rounded-2xl transition-all duration-300 ${colors.chip.bg} border-2 ${colors.chip.border}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase opacity-60">Source Text</span>
                    <button onClick={() => setShowText(!showText)} className={`px-3 py-1 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 ${buttonBg}`}>
                        {showText ? 'Hide' : 'Show'}
                    </button>
                </div>
                {showText ? (
                    <p className="text-lg italic p-3 bg-white/80 rounded-xl shadow-sm font-playful leading-relaxed">{exercise.text}</p>
                ) : (
                    <div className="h-24 flex items-center justify-center italic opacity-50 bg-black/5 rounded-xl">Text Hidden</div>
                )}
            </div>
            <textarea
                rows={4}
                className={textareaStyle}
                placeholder="Reconstruct the text here from memory..."
                value={response}
                onChange={(e) => {
                    setResponse(e.target.value);
                    setFeedback(null);
                }}
            />
             <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={response.length > 10}
            />
        </div>
    );
};

export const InteractiveCollocationOddOneOut: React.FC<{ exercise: ICollocationOddOneOutExercise; colors: any; }> = ({ exercise, colors }) => {
    const customExercise = {
        question: `Which word does NOT belong with "${exercise.keyword}"?`,
        ...exercise
    };
    return <InteractiveMCQ exercise={customExercise} colors={colors} />;
};

export const InteractiveInformationTransfer: React.FC<{ exercise: IInformationTransferExercise; colors: any; }> = ({ exercise, colors }) => {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Information Transfer', exercise, answers);
        setFeedback(result);
        setLoading(false);
    };

    const inputStyle = `w-full p-2 rounded-lg border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none`;
    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <h4 className="font-playful text-xl mb-2">{exercise.title}</h4>
            <p className={`text-sm p-3 rounded-xl bg-white border border-slate-200 mb-4 whitespace-pre-wrap shadow-sm`}>{exercise.text}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exercise.formFields.map((field, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold uppercase mb-1 opacity-70">{field}</label>
                        <input 
                            type="text" 
                            className={inputStyle}
                            value={answers[i] || ''}
                            onChange={(e) => {
                                setAnswers(prev => ({...prev, [i]: e.target.value}));
                                setFeedback(null);
                            }}
                        />
                    </div>
                ))}
            </div>
            <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={Object.keys(answers).length > 0}
            />
        </div>
    );
};

export const InteractiveListening: React.FC<{ exercise: IListeningSpecificInfoExercise; colors: any; }> = ({ exercise, colors }) => {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        const result = await checkAnswerWithAI('Listening for Specific Info', exercise, answers);
        setFeedback(result);
        setLoading(false);
    };

    const inputStyle = `w-full p-2 rounded-xl border-2 ${colors.chip.border} bg-white focus:ring-2 focus:${colors.border.replace('border-','ring-')} outline-none`;
    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <h4 className="font-playful text-xl mb-2">{exercise.title}</h4>
            <div className="mb-6 p-4 rounded-2xl bg-slate-800 text-slate-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><SpeakerWaveIcon className="w-24 h-24" /></div>
                <p className="font-bold text-xs uppercase text-slate-400 mb-2">Transcript</p>
                <p className="italic text-lg font-playful leading-relaxed">"{exercise.audioText}"</p>
            </div>
            <div className="space-y-4">
                {exercise.questions.map((q, i) => (
                    <div key={i}>
                        <label className="block text-sm font-bold mb-2">{q.question}</label>
                        <input 
                            type="text" 
                            className={inputStyle} 
                            placeholder="Answer..." 
                            value={answers[i] || ''}
                            onChange={(e) => {
                                setAnswers(prev => ({...prev, [i]: e.target.value}));
                                setFeedback(null);
                            }}
                        />
                    </div>
                ))}
            </div>
            <FeedbackSection 
                onCheck={handleCheck} 
                feedback={feedback} 
                loading={loading} 
                hasInput={Object.keys(answers).length > 0}
            />
        </div>
    );
};

export const InteractiveRegisterSort: React.FC<{ exercise: IRegisterSortExercise; colors: any; }> = ({ exercise, colors }) => {
    const [unclassified, setUnclassified] = useState(() => shuffleArray(exercise.phrases));
    const [classified, setClassified] = useState<Record<string, string[]>>(() => 
        exercise.categories.reduce((acc, cat) => ({...acc, [cat]: []}), {})
    );

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, category: string) => {
        e.preventDefault();
        const phrase = e.dataTransfer.getData('text/plain');
        
        let newClassified = { ...classified };
        for(const cat in newClassified) {
            newClassified[cat] = newClassified[cat].filter(p => p !== phrase);
        }
        newClassified[category] = [...newClassified[category], phrase];
        setClassified(newClassified);
        setUnclassified(prev => prev.filter(p => p !== phrase));
    };

    const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, phrase: string) => {
        e.dataTransfer.setData('text/plain', phrase);
    };

    return (
        <div className={`text-base font-casual ${colors.textOnLight}`}>
            <h4 className="font-playful text-xl mb-2">{exercise.title}</h4>
            
            {unclassified.length > 0 && (
                 <div className="p-3 border-2 border-dashed border-slate-300 rounded-2xl mb-4 bg-slate-50">
                    <h5 className="font-bold text-xs uppercase text-slate-400 mb-2">Bank</h5>
                    <div className="flex flex-wrap gap-2">
                        {unclassified.map(phrase => (
                            <Chip key={phrase} text={phrase} draggable onDragStart={(e) => handleDragStart(e, phrase)} chipColors={colors.chip} />
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {exercise.categories.map(category => (
                    <div key={category} 
                         onDrop={(e) => handleDrop(e, category)} 
                         onDragOver={(e) => e.preventDefault()} 
                         className={`p-3 rounded-2xl min-h-[120px] ${colors.chip.bg} border-2 ${colors.chip.border} transition-colors hover:bg-white`}
                    >
                        <h5 className={`font-black text-center text-sm uppercase mb-3 tracking-wider ${colors.chip.text}`}>{category}</h5>
                        <div className="space-y-2 flex flex-col items-start">
                            {classified[category].map(phrase => (
                                <Chip key={phrase} text={phrase} draggable onDragStart={(e) => handleDragStart(e, phrase)} chipColors={colors.chip} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
