
import React from 'react';
import { ExerciseType } from '../types';

// Helper components for building templates
const TemplateBox: React.FC<{ className?: string, children?: React.ReactNode }> = ({ className = '', children }) => (
    <div className={`bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 ${className}`}>{children}</div>
);

const TemplateChip: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-slate-200 h-6 w-16 rounded-full ${className}`}></div>
);

const TemplateTextLine: React.FC<{ width?: string }> = ({ width = 'w-full' }) => (
    <div className={`bg-slate-200 h-3 rounded-full ${width}`}></div>
);

// The main template component
const ExerciseTemplate: React.FC<{ type: ExerciseType; index: number }> = ({ type, index }) => {
    const renderTemplate = () => {
        switch (type) {
            case ExerciseType.FITB:
            case ExerciseType.CollocationGapFill:
            case ExerciseType.PhrasalVerbGapFill:
                return (
                    <div className="space-y-4">
                         <TemplateTextLine width="w-2/3" />
                        <div className="flex items-center space-x-3">
                            <TemplateTextLine width="w-1/3" />
                            <TemplateBox className="w-28 h-8 border-dashed border-2 border-slate-300 bg-slate-50" />
                            <TemplateTextLine width="w-1/3" />
                        </div>
                        <div className="flex space-x-3 pt-2">
                            <TemplateChip /> <TemplateChip /> <TemplateChip />
                        </div>
                    </div>
                );

            case ExerciseType.MultipleChoice:
            case ExerciseType.Prediction:
            case ExerciseType.RuleDiscovery:
            case ExerciseType.SpotTheDifference:
            case ExerciseType.PolitenessScenarios:
            case ExerciseType.InferringMeaning:
            case ExerciseType.CollocationOddOneOut:
                 return (
                    <div className="space-y-4">
                        <TemplateTextLine width="w-full" />
                        <TemplateTextLine width="w-3/4" />
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <TemplateBox className="h-12" /> <TemplateBox className="h-12" />
                            <TemplateBox className="h-12" /> <TemplateBox className="h-12" />
                        </div>
                    </div>
                );
            
            case ExerciseType.SentenceScramble:
                return (
                     <div className="space-y-5">
                        <div className="space-y-2">
                            <TemplateTextLine width="w-3/4" />
                        </div>
                        <TemplateBox className="h-24 w-full border-2" />
                        <div className="flex flex-wrap gap-3 py-1 justify-center">
                            <TemplateChip /><TemplateChip /><TemplateChip /><TemplateChip />
                            <TemplateChip /><TemplateChip /><TemplateChip />
                        </div>
                        <TemplateBox className="h-10 w-full bg-slate-300" />
                    </div>
                );

            case ExerciseType.Matching:
            case ExerciseType.FunctionMatching:
                 return (
                    <div className="grid grid-cols-2 gap-4">
                        <TemplateBox className="h-14" />
                        <TemplateBox className="h-14" />
                    </div>
                );

            case ExerciseType.StorySequencing:
                return <TemplateBox className="h-16 w-full border-l-4 border-slate-300" />;

            case ExerciseType.ClozeParagraph:
            case ExerciseType.DialogueCompletion:
                 return (
                    <div className="space-y-4 leading-loose">
                         <div className="flex items-center gap-3">
                            <TemplateTextLine width="w-1/4" /><TemplateBox className="w-24 h-8" /> <TemplateTextLine width="w-1/2" />
                        </div>
                         <div className="flex items-center gap-3">
                            <TemplateTextLine width="w-1/2" /><TemplateBox className="w-24 h-8" /> <TemplateTextLine width="w-1/4" />
                        </div>
                         <div className="flex items-center gap-3">
                            <TemplateTextLine width="w-1/3" /><TemplateBox className="w-24 h-8" /> <TemplateTextLine width="w-2/5" />
                        </div>
                    </div>
                );
            
            case ExerciseType.WordFormation:
            case ExerciseType.ErrorCorrection:
                return (
                    <div className="space-y-4">
                        <TemplateTextLine width="w-full" />
                        <TemplateTextLine width="w-2/3" />
                        <div className="flex gap-2 mt-4">
                             <TemplateBox className="h-10 w-full" />
                             <TemplateBox className="h-10 w-24 bg-slate-300" />
                        </div>
                    </div>
                );
            
            case ExerciseType.ReadingGist:
            case ExerciseType.ReadingDetail:
            case ExerciseType.DictoGloss:
            case ExerciseType.InformationTransfer:
            case ExerciseType.ListeningSpecificInfo:
                 return <div className="space-y-4"><TemplateBox className="h-32 w-full" /><div className="space-y-2 pt-2"><TemplateTextLine width="w-full" /><TemplateTextLine width="w-3/4" /></div></div>;
            
            case ExerciseType.RegisterSort:
                 return (
                    <div className="space-y-4">
                        <TemplateBox className="h-16 w-full border-2 border-slate-300 border-dashed flex flex-wrap gap-2 p-2 justify-center">
                             <TemplateChip /><TemplateChip /><TemplateChip />
                        </TemplateBox>
                         <div className="grid grid-cols-3 gap-3 h-28">
                            <TemplateBox className="border-2">Formal</TemplateBox>
                            <TemplateBox className="border-2">Neutral</TemplateBox>
                            <TemplateBox className="border-2">Informal</TemplateBox>
                         </div>
                    </div>
                 );

            case ExerciseType.PicturePrompt:
            case ExerciseType.MoralDilemma:
            case ExerciseType.FunctionalWriting:
            case ExerciseType.ProblemSolvingScenario:
            case ExerciseType.RolePlayScenario:
            case ExerciseType.StorytellingFromPrompts:
            case ExerciseType.JustifyYourOpinion:
            case ExerciseType.PictureComparison:
                 return <div className="space-y-3"><TemplateTextLine width="w-1/3" /><TemplateBox className="h-40 w-full" /></div>;

            default:
                return <div className="flex items-center space-x-3"><div className="w-6 h-6 bg-slate-200 rounded-full"></div><TemplateTextLine width="w-3/4" /></div>;
        }
    };
    
    return (
        <div className="flex items-start space-x-4 p-4 border-b border-slate-100 last:border-b-0">
            <span className="text-sm font-bold text-slate-300 mt-1 select-none">{index + 1}.</span>
            <div className="flex-grow">{renderTemplate()}</div>
        </div>
    );
};

export default ExerciseTemplate;
