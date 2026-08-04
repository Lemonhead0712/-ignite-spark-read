"use client";

import { useEffect, useReducer, useState } from "react";
import {
  GUESS_ROUND_SIZE,
  QUESTIONS,
  QUICK_QUESTION_INDICES,
  SIGNS,
  applyWeights,
  buildInviteMessage,
  buildShareText,
  computeSoloResult,
  createEmptyScoreState,
  decodeInvitePayload,
  type InvitePayload,
  type Question,
  type QuestionOption,
  type ScoreState,
  type Sign,
  type SoloResultData,
} from "@/lib/engine";
import { copyText } from "@/lib/clipboard";
import { saveOrShareResultCard } from "@/lib/resultCard";
import { loadMostRecentPair, loadPair, savePair, type PairRecord } from "@/lib/pairs";
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
import { GuessHub } from "./screens/GuessHub";
import { Sealed } from "./screens/Sealed";
import { InviteRecap } from "./screens/InviteRecap";
import { InviteReveal } from "./screens/InviteReveal";

const QUICK_QUESTIONS: Question[] = QUICK_QUESTION_INDICES.map((i) => QUESTIONS[i]);

type QuizMode = "full" | "quick";

function activeQuestions(mode: QuizMode): Question[] {
  return mode === "quick" ? QUICK_QUESTIONS : QUESTIONS;
}

function generatePairingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `pair-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type Screen =
  | "landing"
  | "signs-you"
  | "step1"
  | "signs-them"
  | "step2"
  | "quiz"
  | "ignite"
  | "result"
  | "guess-hub"
  | "guess"
  | "sealed"
  | "invite-recap"
  | "invite-reveal";

// Where "back"/"sealed" navigation returns to — the Result screen for a
// pairing's first-ever read, or the Guess Hub once a pairing is established
// and the survey is no longer part of the repeat loop.
type HomeScreen = "result" | "guess-hub";

interface AppState {
  screen: Screen;
  userSign: Sign | null;
  partnerSign: Sign | null;
  quizMode: QuizMode;
  qi: number;
  quizAnswers: (QuestionOption | null)[];
  soloResult: SoloResultData | null;
  homeScreen: HomeScreen;
  pairingId: string | null;
  gi: number;
  guessAnswers: (number | null)[];
  guessRound: number;
  invite: InvitePayload | null;
  recapGi: number;
  recapAnswers: (number | null)[];
}

type Action =
  | { type: "START"; mode: QuizMode }
  | { type: "BACK_TO_LANDING" }
  | { type: "PICK_USER"; sign: Sign }
  | { type: "GO_PARTNER_PICK" }
  | { type: "BACK_TO_STEP1" }
  | { type: "PICK_PARTNER"; sign: Sign }
  | { type: "START_QUIZ" }
  | { type: "ANSWER_QUESTION"; option: QuestionOption }
  | { type: "BACK_QUESTION" }
  | { type: "IGNITE_DONE"; pairingId: string }
  | { type: "RESTART" }
  | { type: "START_GUESS" }
  | { type: "ANSWER_GUESS"; index: number }
  | { type: "BACK_GUESS" }
  | { type: "BACK_HOME" }
  | { type: "LOAD_INVITE"; invite: InvitePayload }
  | { type: "ANSWER_RECAP"; index: number }
  | { type: "BACK_RECAP" }
  | { type: "CONTINUE_FROM_REVEAL"; pair: PairRecord | null }
  | { type: "RESTORE"; state: Partial<AppState> };

const STORAGE_KEY = "ignite-progress";

function initialState(): AppState {
  return {
    screen: "landing",
    userSign: null,
    partnerSign: null,
    quizMode: "full",
    qi: 0,
    quizAnswers: new Array(QUESTIONS.length).fill(null),
    soloResult: null,
    homeScreen: "result",
    pairingId: null,
    gi: 0,
    guessAnswers: new Array(GUESS_ROUND_SIZE).fill(null),
    guessRound: 0,
    invite: null,
    recapGi: 0,
    recapAnswers: new Array(GUESS_ROUND_SIZE).fill(null),
  };
}

function computeScoreState(answers: (QuestionOption | null)[]): ScoreState {
  return answers.reduce<ScoreState>((acc, opt) => (opt ? applyWeights(acc, opt.weights) : acc), createEmptyScoreState());
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "START":
      return { ...state, quizMode: action.mode, screen: "signs-you" };
    case "BACK_TO_LANDING":
      return { ...initialState() };
    case "PICK_USER":
      return { ...state, userSign: action.sign, screen: "step1" };
    case "GO_PARTNER_PICK":
      return { ...state, screen: "signs-them" };
    case "BACK_TO_STEP1":
      return { ...state, screen: "step1" };
    case "PICK_PARTNER":
      return { ...state, partnerSign: action.sign, screen: "step2" };
    case "START_QUIZ":
      return { ...state, qi: 0, quizAnswers: new Array(activeQuestions(state.quizMode).length).fill(null), screen: "quiz" };
    case "ANSWER_QUESTION": {
      const nextAnswers = [...state.quizAnswers];
      nextAnswers[state.qi] = action.option;
      const nextQi = state.qi + 1;
      return {
        ...state,
        quizAnswers: nextAnswers,
        qi: nextQi,
        screen: nextQi < activeQuestions(state.quizMode).length ? "quiz" : "ignite",
      };
    }
    case "BACK_QUESTION":
      return { ...state, qi: Math.max(0, state.qi - 1) };
    case "IGNITE_DONE": {
      if (!state.userSign || !state.partnerSign) return state;
      const S = computeScoreState(state.quizAnswers);
      const sigAnswers = state.quizAnswers.filter((o): o is QuestionOption => !!o?.cb).map((o) => o.cb as string);
      const soloResult = computeSoloResult(state.userSign, state.partnerSign, S, sigAnswers);
      return {
        ...state,
        soloResult,
        pairingId: action.pairingId,
        // A fresh pairing (no invite context) always starts at round 0. Arriving
        // via an invite means the sender already used `invite.r` for their guess —
        // this side's first guess round must be the *next* one, not round 0 again.
        guessRound: state.invite ? (state.invite.r ?? -1) + 1 : 0,
        homeScreen: "result",
        screen: "result",
      };
    }
    case "RESTART":
      return { ...initialState() };
    case "START_GUESS":
      return { ...state, gi: 0, guessAnswers: new Array(GUESS_ROUND_SIZE).fill(null), screen: "guess" };
    case "ANSWER_GUESS": {
      const nextGuesses = [...state.guessAnswers];
      nextGuesses[state.gi] = action.index;
      const nextGi = state.gi + 1;
      return { ...state, guessAnswers: nextGuesses, gi: nextGi, screen: nextGi < GUESS_ROUND_SIZE ? "guess" : "sealed" };
    }
    case "BACK_GUESS":
      return { ...state, gi: Math.max(0, state.gi - 1) };
    case "BACK_HOME":
      return { ...state, screen: state.homeScreen };
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
        screen: nextGi < GUESS_ROUND_SIZE ? "invite-recap" : "invite-reveal",
      };
    }
    case "BACK_RECAP":
      return { ...state, recapGi: Math.max(0, state.recapGi - 1) };
    case "CONTINUE_FROM_REVEAL": {
      if (!state.invite) return { ...state, screen: "signs-you" };
      if (action.pair) {
        return {
          ...state,
          userSign: action.pair.userSign,
          partnerSign: action.pair.partnerSign,
          soloResult: action.pair.soloResult,
          pairingId: action.pair.pairingId,
          guessRound: (state.invite.r ?? -1) + 1,
          homeScreen: "guess-hub",
          screen: "guess-hub",
        };
      }
      // First-time recipients arrived via someone else's invite, not their own
      // intent — lower the friction with the quick 5-question read so they
      // reach the actual game faster. Their own Landing choice is unaffected.
      const senderSign = SIGNS.find((s) => s.n === state.invite!.u) ?? null;
      return { ...state, partnerSign: senderSign, quizMode: "quick", screen: "signs-you" };
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
  const [pendingResume, setPendingResume] = useState<Partial<AppState> | null>(null);
  const [pendingPair, setPendingPair] = useState<PairRecord | null>(null);

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
          setPendingResume(saved);
          return;
        }
      }
    } catch {
      // corrupt/unavailable storage — ignore, start fresh
    }
    const pair = loadMostRecentPair();
    if (pair) setPendingPair(pair);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persists progress so an accidental refresh mid-flow doesn't lose it. Holds off
  // clearing storage while a resume prompt is pending, so the choice stays available.
  useEffect(() => {
    try {
      if (state.screen === "landing") {
        if (!pendingResume) window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // storage full/unavailable — ignore
    }
  }, [state, pendingResume]);

  // Keeps this pairing's local "memory" (sign, read, round) in sync so a
  // returning exchange with the same person can skip straight to the Guess Hub.
  useEffect(() => {
    if (state.pairingId && state.userSign && state.partnerSign && state.soloResult) {
      savePair({
        pairingId: state.pairingId,
        userSign: state.userSign,
        partnerSign: state.partnerSign,
        soloResult: state.soloResult,
        guessRound: state.guessRound,
      });
    }
  }, [state.pairingId, state.userSign, state.partnerSign, state.soloResult, state.guessRound]);

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

  async function handleShareApp() {
    track("share_app_tap");
    const shareText = "Know what they want, without asking. Two minutes, zero mercy.";
    const url = window.location.origin;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Ignite — Spark Read", text: shareText, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard copy
      }
    }
    await handleCopy(`${shareText} ${url}`, "Link copied — share it anywhere ✨");
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
    if (!state.userSign || !state.partnerSign || !state.soloResult || !state.pairingId) return;
    track("invite_copy");
    const guesses = state.guessAnswers.map((g) => g ?? 0);
    const { message } = buildInviteMessage(
      state.userSign,
      state.partnerSign,
      guesses,
      state.soloResult.score,
      state.guessRound,
      state.pairingId,
      window.location.origin
    );
    await handleCopy(message, "Invite copied — send it to them ✨");
  }

  const backLabel = state.homeScreen === "guess-hub" ? "← Back to game" : "← Back to results";

  return (
    <div className="relative z-[1] mx-auto flex min-h-dvh w-full max-w-app flex-col pl-[max(20px,env(safe-area-inset-left))] pr-[max(20px,env(safe-area-inset-right))] pt-[max(22px,env(safe-area-inset-top))] pb-[max(22px,env(safe-area-inset-bottom))] md:min-h-[640px] md:max-h-[85dvh] md:max-w-[560px] md:overflow-y-auto md:rounded md:border md:border-line md:bg-[rgba(43,24,48,.45)] md:px-8 md:py-8 md:shadow-[0_30px_90px_rgba(0,0,0,.5)] lg:max-w-[600px]">
      {state.screen === "landing" && (
        <Landing
          onStart={() => dispatch({ type: "START", mode: "full" })}
          onQuickStart={() => dispatch({ type: "START", mode: "quick" })}
          onShareApp={handleShareApp}
          resume={
            pendingResume
              ? {
                  onResume: () => {
                    dispatch({ type: "RESTORE", state: pendingResume });
                    setPendingResume(null);
                  },
                  onDiscard: () => {
                    setPendingResume(null);
                    dispatch({ type: "START", mode: "full" });
                  },
                }
              : undefined
          }
          continueGame={
            pendingPair
              ? {
                  partnerName: pendingPair.partnerSign.n,
                  onContinue: () => {
                    dispatch({
                      type: "RESTORE",
                      state: {
                        userSign: pendingPair.userSign,
                        partnerSign: pendingPair.partnerSign,
                        soloResult: pendingPair.soloResult,
                        pairingId: pendingPair.pairingId,
                        guessRound: pendingPair.guessRound,
                        homeScreen: "guess-hub",
                        screen: "guess-hub",
                      },
                    });
                    setPendingPair(null);
                  },
                }
              : undefined
          }
        />
      )}

      {state.screen === "invite-recap" && state.invite && (
        <InviteRecap
          round={state.invite.r}
          gi={state.recapGi}
          senderName={state.invite.u}
          onAnswer={(index) => dispatch({ type: "ANSWER_RECAP", index })}
          onExit={() => dispatch({ type: "BACK_TO_LANDING" })}
          onBackQuestion={() => dispatch({ type: "BACK_RECAP" })}
        />
      )}

      {state.screen === "invite-reveal" && state.invite && (
        <InviteReveal
          round={state.invite.r}
          senderName={state.invite.u}
          guesses={state.invite.g}
          answers={state.recapAnswers}
          isReturningPair={!!(state.invite.pid && loadPair(state.invite.pid))}
          onContinue={() => {
            const pair = state.invite?.pid ? loadPair(state.invite.pid) : null;
            dispatch({ type: "CONTINUE_FROM_REVEAL", pair });
          }}
          onExit={() => dispatch({ type: "BACK_TO_LANDING" })}
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
          onBack={() => dispatch({ type: "START", mode: state.quizMode })}
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
          onBack={() => dispatch({ type: "BACK_TO_STEP1" })}
          onPick={(sign) => dispatch({ type: "PICK_PARTNER", sign })}
        />
      )}

      {state.screen === "step2" && state.partnerSign && state.userSign && (
        <Interstitial
          variant="step2"
          sign={state.partnerSign}
          userElement={state.userSign.el}
          onBack={() => dispatch(state.invite ? { type: "BACK_TO_STEP1" } : { type: "GO_PARTNER_PICK" })}
          onContinue={() => {
            track("quiz_start");
            dispatch({ type: "START_QUIZ" });
          }}
        />
      )}

      {state.screen === "quiz" && (
        <Quiz
          questions={activeQuestions(state.quizMode)}
          qi={state.qi}
          onAnswer={(option) => {
            const isLast = state.qi + 1 >= activeQuestions(state.quizMode).length;
            track("quiz_question_answered", { question_index: state.qi, quiz_mode: state.quizMode });
            dispatch({ type: "ANSWER_QUESTION", option });
            if (isLast) track("quiz_complete", { quiz_mode: state.quizMode });
          }}
          onExit={() => dispatch({ type: "BACK_TO_LANDING" })}
          onBackQuestion={() => dispatch({ type: "BACK_QUESTION" })}
        />
      )}

      {state.screen === "ignite" && state.userSign && state.partnerSign && (
        <Ignition
          userSign={state.userSign}
          partnerSign={state.partnerSign}
          onComplete={() => {
            const pairingId = state.pairingId ?? state.invite?.pid ?? generatePairingId();
            dispatch({ type: "IGNITE_DONE", pairingId });
          }}
        />
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

      {state.screen === "guess-hub" && state.userSign && state.partnerSign && state.soloResult && (
        <GuessHub
          userSign={state.userSign}
          partnerSign={state.partnerSign}
          result={state.soloResult}
          round={state.guessRound}
          onPlayRound={() => {
            track("guess_start", { guess_round: state.guessRound });
            dispatch({ type: "START_GUESS" });
          }}
          onExit={() => dispatch({ type: "BACK_TO_LANDING" })}
        />
      )}

      {state.screen === "guess" && (
        <GuessMode
          round={state.guessRound}
          gi={state.gi}
          partnerName={state.partnerSign?.n ?? "they"}
          backLabel={backLabel}
          onAnswer={(index) => {
            const isLast = state.gi + 1 >= GUESS_ROUND_SIZE;
            dispatch({ type: "ANSWER_GUESS", index });
            if (isLast) track("guess_sealed", { guess_round: state.guessRound });
          }}
          onBack={() => dispatch({ type: "BACK_HOME" })}
          onBackQuestion={() => dispatch({ type: "BACK_GUESS" })}
        />
      )}

      {state.screen === "sealed" && (
        <Sealed
          onCopyInvite={handleCopyInvite}
          onBack={() => dispatch({ type: "BACK_HOME" })}
          backLabel={state.homeScreen === "guess-hub" ? "Back to game" : "Back to my read"}
        />
      )}

      <Toast message={toast.message} visible={toast.visible} />
      <CopySheet visible={copySheet.visible} text={copySheet.text} onDone={() => setCopySheet({ visible: false, text: "" })} />
    </div>
  );
}
