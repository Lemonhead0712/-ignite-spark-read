"use client";

import { useReducer, useState } from "react";
import {
  GUESS_QS,
  QUESTIONS,
  applyWeights,
  buildInviteMessage,
  buildShareText,
  computeSoloResult,
  createEmptyScoreState,
  type QuestionOption,
  type ScoreState,
  type Sign,
  type SoloResultData,
} from "@/lib/engine";
import { copyText } from "@/lib/clipboard";
import { track } from "@/lib/analytics";
import { CopySheet } from "./ui/CopySheet";
import { Toast } from "./ui/Toast";
import { Landing } from "./screens/Landing";
import { SignPicker } from "./screens/SignPicker";
import { Interstitial } from "./screens/Interstitial";
import { Quiz } from "./screens/Quiz";
import { Ignition } from "./screens/Ignition";
import { SoloResult } from "./screens/SoloResult";
import { GuessMode } from "./screens/GuessMode";
import { Sealed } from "./screens/Sealed";

type Screen = "landing" | "signs-you" | "step1" | "signs-them" | "step2" | "quiz" | "ignite" | "result" | "guess" | "sealed";

interface AppState {
  screen: Screen;
  userSign: Sign | null;
  partnerSign: Sign | null;
  qi: number;
  S: ScoreState;
  sigAnswers: string[];
  soloResult: SoloResultData | null;
  gi: number;
  guesses: number[];
}

type Action =
  | { type: "START" }
  | { type: "BACK_TO_LANDING" }
  | { type: "PICK_USER"; sign: Sign }
  | { type: "GO_PARTNER_PICK" }
  | { type: "PICK_PARTNER"; sign: Sign }
  | { type: "START_QUIZ" }
  | { type: "ANSWER_QUESTION"; option: QuestionOption }
  | { type: "IGNITE_DONE" }
  | { type: "RESTART" }
  | { type: "START_GUESS" }
  | { type: "ANSWER_GUESS"; index: number }
  | { type: "BACK_TO_RESULT" };

function initialState(): AppState {
  return {
    screen: "landing",
    userSign: null,
    partnerSign: null,
    qi: 0,
    S: createEmptyScoreState(),
    sigAnswers: [],
    soloResult: null,
    gi: 0,
    guesses: [],
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "START":
      return { ...state, screen: "signs-you" };
    case "BACK_TO_LANDING":
      return { ...initialState() };
    case "PICK_USER":
      return { ...state, userSign: action.sign, screen: "step1" };
    case "GO_PARTNER_PICK":
      return { ...state, screen: "signs-them" };
    case "PICK_PARTNER":
      return { ...state, partnerSign: action.sign, screen: "step2" };
    case "START_QUIZ":
      return { ...state, qi: 0, S: createEmptyScoreState(), sigAnswers: [], screen: "quiz" };
    case "ANSWER_QUESTION": {
      const nextS = applyWeights(state.S, action.option.weights);
      const nextSig = action.option.cb ? [...state.sigAnswers, action.option.cb] : state.sigAnswers;
      const nextQi = state.qi + 1;
      return {
        ...state,
        S: nextS,
        sigAnswers: nextSig,
        qi: nextQi,
        screen: nextQi < QUESTIONS.length ? "quiz" : "ignite",
      };
    }
    case "IGNITE_DONE": {
      if (!state.userSign || !state.partnerSign) return state;
      const soloResult = computeSoloResult(state.userSign, state.partnerSign, state.S, state.sigAnswers);
      return { ...state, soloResult, screen: "result" };
    }
    case "RESTART":
      return { ...initialState() };
    case "START_GUESS":
      return { ...state, gi: 0, guesses: [], screen: "guess" };
    case "ANSWER_GUESS": {
      const nextGuesses = [...state.guesses, action.index];
      const nextGi = state.gi + 1;
      return { ...state, guesses: nextGuesses, gi: nextGi, screen: nextGi < GUESS_QS.length ? "guess" : "sealed" };
    }
    case "BACK_TO_RESULT":
      return { ...state, screen: "result" };
    default:
      return state;
  }
}

export function SparkReadApp() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const [copySheet, setCopySheet] = useState<{ visible: boolean; text: string }>({ visible: false, text: "" });

  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2400);
  }

  async function handleCopy(text: string, okMessage: string) {
    const result = await copyText(text);
    if (result.status === "copied") {
      showToast(okMessage);
    } else {
      setCopySheet({ visible: true, text: result.text });
    }
  }

  async function handleShare() {
    if (!state.userSign || !state.partnerSign || !state.soloResult) return;
    track("share_tap");
    const text = buildShareText(state.userSign, state.partnerSign, state.soloResult, window.location.origin);
    await handleCopy(text, "Copied — paste it anywhere ✨");
  }

  async function handleCopyInvite() {
    if (!state.userSign || !state.partnerSign || !state.soloResult) return;
    track("invite_copy");
    const { message } = buildInviteMessage(
      state.userSign,
      state.partnerSign,
      state.guesses,
      state.soloResult.score,
      window.location.origin
    );
    await handleCopy(message, "Invite copied — send it to them ✨");
  }

  return (
    <div className="relative z-[1] mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 py-sp-3 md:min-h-[640px] md:max-h-[85dvh] md:max-w-[560px] md:overflow-y-auto md:rounded md:border md:border-line md:bg-[rgba(43,24,48,.45)] md:px-8 md:py-8 md:shadow-[0_30px_90px_rgba(0,0,0,.5)] lg:max-w-[600px]">
      {state.screen === "landing" && <Landing onStart={() => dispatch({ type: "START" })} />}

      {state.screen === "signs-you" && (
        <SignPicker
          variant="you"
          onBack={() => dispatch({ type: "BACK_TO_LANDING" })}
          onPick={(sign) => dispatch({ type: "PICK_USER", sign })}
        />
      )}

      {state.screen === "step1" && state.userSign && (
        <Interstitial variant="step1" sign={state.userSign} onContinue={() => dispatch({ type: "GO_PARTNER_PICK" })} />
      )}

      {state.screen === "signs-them" && (
        <SignPicker
          variant="them"
          onBack={() => dispatch({ type: "BACK_TO_LANDING" })}
          onPick={(sign) => dispatch({ type: "PICK_PARTNER", sign })}
        />
      )}

      {state.screen === "step2" && state.partnerSign && state.userSign && (
        <Interstitial
          variant="step2"
          sign={state.partnerSign}
          userElement={state.userSign.el}
          onContinue={() => {
            track("quiz_start");
            dispatch({ type: "START_QUIZ" });
          }}
        />
      )}

      {state.screen === "quiz" && (
        <Quiz
          qi={state.qi}
          onAnswer={(option) => {
            const isLast = state.qi + 1 >= QUESTIONS.length;
            dispatch({ type: "ANSWER_QUESTION", option });
            if (isLast) track("quiz_complete");
          }}
          onExit={() => dispatch({ type: "BACK_TO_LANDING" })}
        />
      )}

      {state.screen === "ignite" && state.userSign && state.partnerSign && (
        <Ignition userSign={state.userSign} partnerSign={state.partnerSign} onComplete={() => dispatch({ type: "IGNITE_DONE" })} />
      )}

      {state.screen === "result" && state.userSign && state.partnerSign && state.soloResult && (
        <SoloResult
          userSign={state.userSign}
          partnerSign={state.partnerSign}
          result={state.soloResult}
          onRetake={() => dispatch({ type: "RESTART" })}
          onShare={handleShare}
          onStartGuess={() => {
            track("guess_start");
            dispatch({ type: "START_GUESS" });
          }}
        />
      )}

      {state.screen === "guess" && (
        <GuessMode
          gi={state.gi}
          onAnswer={(index) => {
            const isLast = state.gi + 1 >= GUESS_QS.length;
            dispatch({ type: "ANSWER_GUESS", index });
            if (isLast) track("guess_sealed");
          }}
          onBack={() => dispatch({ type: "BACK_TO_RESULT" })}
        />
      )}

      {state.screen === "sealed" && <Sealed onCopyInvite={handleCopyInvite} onBack={() => dispatch({ type: "BACK_TO_RESULT" })} />}

      <Toast message={toast.message} visible={toast.visible} />
      <CopySheet visible={copySheet.visible} text={copySheet.text} onDone={() => setCopySheet({ visible: false, text: "" })} />
    </div>
  );
}
