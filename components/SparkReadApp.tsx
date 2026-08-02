"use client";

import { useEffect, useReducer, useState } from "react";
import {
  GUESS_QS,
  QUESTIONS,
  SIGNS,
  applyWeights,
  buildInviteMessage,
  buildShareText,
  computeSoloResult,
  createEmptyScoreState,
  decodeInvitePayload,
  type InvitePayload,
  type QuestionOption,
  type ScoreState,
  type Sign,
  type SoloResultData,
} from "@/lib/engine";
import { copyText } from "@/lib/clipboard";
import { saveOrShareResultCard } from "@/lib/resultCard";
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
import { InviteRecap } from "./screens/InviteRecap";
import { InviteReveal } from "./screens/InviteReveal";

type Screen =
  | "landing"
  | "signs-you"
  | "step1"
  | "signs-them"
  | "step2"
  | "quiz"
  | "ignite"
  | "result"
  | "guess"
  | "sealed"
  | "invite-recap"
  | "invite-reveal";

interface AppState {
  screen: Screen;
  userSign: Sign | null;
  partnerSign: Sign | null;
  qi: number;
  quizAnswers: (QuestionOption | null)[];
  soloResult: SoloResultData | null;
  gi: number;
  guessAnswers: (number | null)[];
  invite: InvitePayload | null;
  recapGi: number;
  recapAnswers: (number | null)[];
}

type Action =
  | { type: "START" }
  | { type: "BACK_TO_LANDING" }
  | { type: "PICK_USER"; sign: Sign }
  | { type: "GO_PARTNER_PICK" }
  | { type: "PICK_PARTNER"; sign: Sign }
  | { type: "START_QUIZ" }
  | { type: "ANSWER_QUESTION"; option: QuestionOption }
  | { type: "BACK_QUESTION" }
  | { type: "IGNITE_DONE" }
  | { type: "RESTART" }
  | { type: "START_GUESS" }
  | { type: "ANSWER_GUESS"; index: number }
  | { type: "BACK_GUESS" }
  | { type: "BACK_TO_RESULT" }
  | { type: "LOAD_INVITE"; invite: InvitePayload }
  | { type: "ANSWER_RECAP"; index: number }
  | { type: "BACK_RECAP" }
  | { type: "CONTINUE_FROM_REVEAL" }
  | { type: "RESTORE"; state: Partial<AppState> };

const STORAGE_KEY = "ignite-progress";

function initialState(): AppState {
  return {
    screen: "landing",
    userSign: null,
    partnerSign: null,
    qi: 0,
    quizAnswers: new Array(QUESTIONS.length).fill(null),
    soloResult: null,
    gi: 0,
    guessAnswers: new Array(GUESS_QS.length).fill(null),
    invite: null,
    recapGi: 0,
    recapAnswers: new Array(GUESS_QS.length).fill(null),
  };
}

function computeScoreState(answers: (QuestionOption | null)[]): ScoreState {
  return answers.reduce<ScoreState>((acc, opt) => (opt ? applyWeights(acc, opt.weights) : acc), createEmptyScoreState());
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
      return { ...state, qi: 0, quizAnswers: new Array(QUESTIONS.length).fill(null), screen: "quiz" };
    case "ANSWER_QUESTION": {
      const nextAnswers = [...state.quizAnswers];
      nextAnswers[state.qi] = action.option;
      const nextQi = state.qi + 1;
      return {
        ...state,
        quizAnswers: nextAnswers,
        qi: nextQi,
        screen: nextQi < QUESTIONS.length ? "quiz" : "ignite",
      };
    }
    case "BACK_QUESTION":
      return { ...state, qi: Math.max(0, state.qi - 1) };
    case "IGNITE_DONE": {
      if (!state.userSign || !state.partnerSign) return state;
      const S = computeScoreState(state.quizAnswers);
      const sigAnswers = state.quizAnswers.filter((o): o is QuestionOption => !!o?.cb).map((o) => o.cb as string);
      const soloResult = computeSoloResult(state.userSign, state.partnerSign, S, sigAnswers);
      return { ...state, soloResult, screen: "result" };
    }
    case "RESTART":
      return { ...initialState() };
    case "START_GUESS":
      return { ...state, gi: 0, guessAnswers: new Array(GUESS_QS.length).fill(null), screen: "guess" };
    case "ANSWER_GUESS": {
      const nextGuesses = [...state.guessAnswers];
      nextGuesses[state.gi] = action.index;
      const nextGi = state.gi + 1;
      return { ...state, guessAnswers: nextGuesses, gi: nextGi, screen: nextGi < GUESS_QS.length ? "guess" : "sealed" };
    }
    case "BACK_GUESS":
      return { ...state, gi: Math.max(0, state.gi - 1) };
    case "BACK_TO_RESULT":
      return { ...state, screen: "result" };
    case "LOAD_INVITE":
      return { ...state, invite: action.invite, screen: "invite-recap" };
    case "ANSWER_RECAP": {
      const nextRecap = [...state.recapAnswers];
      nextRecap[state.recapGi] = action.index;
      const nextGi = state.recapGi + 1;
      return {
        ...state,
        recapAnswers: nextRecap,
        recapGi: nextGi,
        screen: nextGi < GUESS_QS.length ? "invite-recap" : "invite-reveal",
      };
    }
    case "BACK_RECAP":
      return { ...state, recapGi: Math.max(0, state.recapGi - 1) };
    case "CONTINUE_FROM_REVEAL": {
      if (!state.invite) return { ...state, screen: "signs-you" };
      const senderSign = SIGNS.find((s) => s.n === state.invite!.u) ?? null;
      return { ...state, partnerSign: senderSign, screen: "signs-you" };
    }
    case "RESTORE":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

export function SparkReadApp() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const [copySheet, setCopySheet] = useState<{ visible: boolean; text: string }>({ visible: false, text: "" });

  // Runs once after mount (client-only) so the very first render always matches SSR output.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("invite");
    if (raw) {
      const decoded = decodeInvitePayload(raw);
      if (decoded) {
        dispatch({ type: "LOAD_INVITE", invite: decoded });
        return;
      }
    }
    try {
      const savedRaw = window.localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw) as Partial<AppState>;
        if (saved?.screen && saved.screen !== "landing") {
          dispatch({ type: "RESTORE", state: saved });
        }
      }
    } catch {
      // corrupt/unavailable storage — ignore, start fresh
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persists progress so an accidental refresh mid-flow doesn't lose it.
  useEffect(() => {
    try {
      if (state.screen === "landing") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // storage full/unavailable — ignore
    }
  }, [state]);

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

  async function handleSaveImage() {
    if (!state.userSign || !state.partnerSign || !state.soloResult) return;
    track("save_image");
    const outcome = await saveOrShareResultCard({
      userSign: state.userSign,
      partnerSign: state.partnerSign,
      result: state.soloResult,
    });
    if (outcome === "shared") showToast("Shared ✨");
    else if (outcome === "downloaded") showToast("Image saved — check your downloads ✨");
    else showToast("Couldn't generate the image — try again");
  }

  async function handleCopyInvite() {
    if (!state.userSign || !state.partnerSign || !state.soloResult) return;
    track("invite_copy");
    const guesses = state.guessAnswers.map((g) => g ?? 0);
    const { message } = buildInviteMessage(
      state.userSign,
      state.partnerSign,
      guesses,
      state.soloResult.score,
      window.location.origin
    );
    await handleCopy(message, "Invite copied — send it to them ✨");
  }

  return (
    <div className="relative z-[1] mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 py-sp-3 md:min-h-[640px] md:max-h-[85dvh] md:max-w-[560px] md:overflow-y-auto md:rounded md:border md:border-line md:bg-[rgba(43,24,48,.45)] md:px-8 md:py-8 md:shadow-[0_30px_90px_rgba(0,0,0,.5)] lg:max-w-[600px]">
      {state.screen === "landing" && <Landing onStart={() => dispatch({ type: "START" })} />}

      {state.screen === "invite-recap" && state.invite && (
        <InviteRecap
          gi={state.recapGi}
          senderName={state.invite.u}
          onAnswer={(index) => dispatch({ type: "ANSWER_RECAP", index })}
          onBack={() => dispatch({ type: "BACK_RECAP" })}
        />
      )}

      {state.screen === "invite-reveal" && state.invite && (
        <InviteReveal
          senderName={state.invite.u}
          guesses={state.invite.g}
          answers={state.recapAnswers}
          onContinue={() => dispatch({ type: "CONTINUE_FROM_REVEAL" })}
        />
      )}

      {state.screen === "signs-you" && (
        <SignPicker
          variant="you"
          onBack={() => dispatch({ type: "BACK_TO_LANDING" })}
          onPick={(sign) => dispatch({ type: "PICK_USER", sign })}
        />
      )}

      {state.screen === "step1" && state.userSign && (
        <Interstitial
          variant="step1"
          sign={state.userSign}
          ctaLabel={state.invite ? "Continue — let's see how you compare" : undefined}
          onContinue={() => {
            if (state.partnerSign) {
              dispatch({ type: "PICK_PARTNER", sign: state.partnerSign });
            } else {
              dispatch({ type: "GO_PARTNER_PICK" });
            }
          }}
        />
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
            track("quiz_question_answered", { question_index: state.qi });
            dispatch({ type: "ANSWER_QUESTION", option });
            if (isLast) track("quiz_complete");
          }}
          onExit={() => dispatch({ type: "BACK_TO_LANDING" })}
          onBackQuestion={() => dispatch({ type: "BACK_QUESTION" })}
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
          onSaveImage={handleSaveImage}
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
          onBackQuestion={() => dispatch({ type: "BACK_GUESS" })}
        />
      )}

      {state.screen === "sealed" && <Sealed onCopyInvite={handleCopyInvite} onBack={() => dispatch({ type: "BACK_TO_RESULT" })} />}

      <Toast message={toast.message} visible={toast.visible} />
      <CopySheet visible={copySheet.visible} text={copySheet.text} onDone={() => setCopySheet({ visible: false, text: "" })} />
    </div>
  );
}
