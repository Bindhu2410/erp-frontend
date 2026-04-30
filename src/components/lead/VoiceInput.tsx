import React, { useState, useRef, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  FaMicrophoneLines,
  FaStop,
  FaPause,
  FaPlay,
  FaVolumeHigh,
  FaVolumeXmark,
  FaAlignLeft,
} from "react-icons/fa6";
import api from "../../services/api";

interface VoiceInputProps {
  onClose: () => void;
  onSuccess: () => void;
}

type RecordingState = "idle" | "recording" | "paused";

interface SavedSegment {
  id: number;
  text: string;
  duration: string;
  audioUrl?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onClose, onSuccess }) => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState<string>("00:00");
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [editableText, setEditableText] = useState<string>("");
  const [playingSegmentId, setPlayingSegmentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef<number>(0);
  // bestTranscriptRef always holds the richest text available:
  // finalized transcript + any current interim words
  const bestTranscriptRef = useRef<string>("");
  const recordingStateRef = useRef<RecordingState>("idle");
  const wasListeningRef = useRef<boolean>(false);
  const segmentCountRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementsRef = useRef<{ [id: number]: HTMLAudioElement }>({});

  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Always keep the best available text in a ref (final words + any interim words)
  useEffect(() => {
    const combined = interimTranscript
      ? `${transcript} ${interimTranscript}`.trim()
      : transcript.trim();
    if (combined) bestTranscriptRef.current = combined;
  }, [transcript, interimTranscript]);

  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  // Handle browser auto-stop (silence timeout) — treat it as a pause
  useEffect(() => {
    if (
      wasListeningRef.current &&
      !listening &&
      recordingStateRef.current === "recording"
    ) {
      stopTimer();
      setRecordingState("paused");
    }
    wasListeningRef.current = listening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  const startTimer = () => {
    if (intervalRef.current) return; // already running
    intervalRef.current = setInterval(() => {
      secondsRef.current += 1;
      const minutes = Math.floor(secondsRef.current / 60)
        .toString()
        .padStart(2, "0");
      const secs = (secondsRef.current % 60).toString().padStart(2, "0");
      setRecordingTime(`${minutes}:${secs}`);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  /** Start a brand-new recording session */
  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start(100);

      // Clear accumulated text before starting fresh
      bestTranscriptRef.current = "";
      resetTranscript();
      setRecordingTime("00:00");
      secondsRef.current = 0;
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
      startTimer();
      setRecordingState("recording");
    } catch {
      alert(
        "Microphone access was denied. Please allow microphone permission and try again.",
      );
    }
  };

  /** Pause — freeze mic, timer and MediaRecorder */
  const handlePause = () => {
    SpeechRecognition.stopListening();
    stopTimer();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    setRecordingState("paused");
  };

  /** Resume — resume mic, timer and MediaRecorder (keep accumulated text) */
  const handleResume = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    // Do NOT resetTranscript here — library appends to existing transcript on resume
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    startTimer();
    setRecordingState("recording");
  };

  /** Stop, save audio blob + transcript as a segment */
  const handleStop = () => {
    // Capture BEFORE stopping anything — grab the best text we have right now
    // (combines finalized transcript + any in-flight interim words)
    const textAtStop = bestTranscriptRef.current.trim();
    const segId = segmentCountRef.current + 1;
    segmentCountRef.current = segId;
    const duration = recordingTime;

    SpeechRecognition.stopListening();
    stopTimer();

    const saveSegment = (audioUrl?: string) => {
      setSavedSegments((prev) => [
        ...prev,
        { id: segId, text: textAtStop, duration, audioUrl },
      ]);
    };

    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        saveSegment(URL.createObjectURL(blob));
        stopStream();
      };
      mr.stop();
    } else {
      saveSegment();
    }

    // Reset speech recognition state for next session
    bestTranscriptRef.current = "";
    resetTranscript();
    setRecordingTime("00:00");
    secondsRef.current = 0;
    setRecordingState("idle");
  };

  /** Play / stop audio playback for a segment */
  const handlePlayback = (seg: SavedSegment) => {
    if (!seg.audioUrl) return;

    // If this segment is playing, stop it
    if (playingSegmentId === seg.id) {
      audioElementsRef.current[seg.id]?.pause();
      audioElementsRef.current[seg.id].currentTime = 0;
      setPlayingSegmentId(null);
      return;
    }

    // Stop any other playing segment
    if (
      playingSegmentId !== null &&
      audioElementsRef.current[playingSegmentId]
    ) {
      audioElementsRef.current[playingSegmentId].pause();
      audioElementsRef.current[playingSegmentId].currentTime = 0;
    }

    const audio = new Audio(seg.audioUrl);
    audioElementsRef.current[seg.id] = audio;
    audio.onended = () => setPlayingSegmentId(null);
    audio.play();
    setPlayingSegmentId(seg.id);
  };

  /** Append a single segment's text into the transcript textarea */
  const handleConvertSegment = (seg: SavedSegment) => {
    setEditableText((prev) =>
      prev.trim() ? `${prev.trim()} ${seg.text}` : seg.text,
    );
  };

  /** Combine ALL saved segments into the textarea */
  const handleConvertAll = () => {
    const combined = savedSegments.map((s) => s.text).join(" ");
    setEditableText(combined);
  };

  const handleRemoveSegment = (id: number) => {
    if (playingSegmentId === id) {
      audioElementsRef.current[id]?.pause();
      setPlayingSegmentId(null);
    }
    setSavedSegments((prev) => {
      const seg = prev.find((s) => s.id === id);
      if (seg?.audioUrl) URL.revokeObjectURL(seg.audioUrl);
      return prev.filter((s) => s.id !== id);
    });
  };

  /**
   * Parse natural speech transcript into lead fields using keyword anchors.
   * Handles speech-recognition quirks:
   *   - "at" → "@" in email  (e.g. "apollo at gmail dot com")
   *   - "dot" → "."  in email
   *   - spaces inside mobile / pincode digit groups are removed
   *
   * Spoken example:
   *   "hospital name Apollo Hospital contact name Nive
   *    contact mobile number 9843201860 pin code 641001
   *    email address apollohospital at gmail dot com comment new lead created"
   */
  const parseTranscript = (text: string) => {
    const lower = text.toLowerCase();

    // Ordered keyword anchors — first match wins for each field
    const anchors: { key: string; patterns: string[] }[] = [
      {
        key: "customerName",
        patterns: ["hospital clinic name", "hospital name", "clinic name"],
      },
      { key: "contactName", patterns: ["contact name"] },
      {
        key: "contactMobileNo",
        patterns: [
          "contact mobile number",
          "contact mobile no",
          "mobile number",
          "mobile no",
        ],
      },
      { key: "pincode", patterns: ["pin code", "pincode"] },
      { key: "email", patterns: ["email address", "email"] },
      { key: "comments", patterns: ["comments", "comment"] },
    ];

    // Find the position (and keyword length) for every matched anchor
    const found: { key: string; start: number; valueStart: number }[] = [];
    for (const anchor of anchors) {
      for (const pattern of anchor.patterns) {
        const idx = lower.indexOf(pattern);
        if (idx !== -1) {
          found.push({
            key: anchor.key,
            start: idx,
            valueStart: idx + pattern.length,
          });
          break;
        }
      }
    }

    // Sort anchors by their position in the text
    found.sort((a, b) => a.start - b.start);

    const result: Record<string, string> = {
      customerName: "",
      contactName: "",
      contactMobileNo: "",
      pincode: "",
      email: "",
      comments: "",
    };

    for (let i = 0; i < found.length; i++) {
      const start = found[i].valueStart;
      const end = i + 1 < found.length ? found[i + 1].start : text.length;
      let value = text.slice(start, end).trim();

      switch (found[i].key) {
        case "contactMobileNo":
          // Remove spaces / non-digit chars that speech recognition inserts
          value = value.replace(/\D/g, "");
          break;
        case "pincode":
          value = value.replace(/\D/g, "");
          break;
        case "email":
          // "apollo hospital at gmail dot com" → "apollohospital@gmail.com"
          value = value
            .replace(/\s+at\s+/gi, "@")
            .replace(/\s+dot\s+/gi, ".")
            .replace(/\s+/g, "");
          break;
        default:
          break;
      }

      result[found[i].key] = value;
    }

    return result;
  };

  const handleSubmit = async () => {
    SpeechRecognition.stopListening();
    stopTimer();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const parsed = parseTranscript(editableText);
      const now = new Date().toISOString();
      const userId = parseInt(localStorage.getItem("userId") || "0", 10);

      const payload = {
        userCreated: userId,
        dateCreated: now,
        userUpdated: userId,
        dateUpdated: now,
        id: 0,
        customerName: parsed.customerName,
        contactName: parsed.contactName,
        contactMobileNo: parsed.contactMobileNo,
        pincode: parsed.pincode,
        email: parsed.email,
        comments: parsed.comments,
        // required non-null fields with defaults
        leadSource: "",
        referralSourceName: "",
        hospitalOfReferral: "",
        departmentOfReferral: "",
        socialMedia: "",
        eventName: "",
        leadId: "",
        status: "New",
        score: "",
        isActive: true,
        leadType: "Voice",
        salutation: "",
        landLineNo: "",
        fax: "",
        doorNo: "",
        street: "",
        landmark: "",
        website: "",
        territory: "",
        area: "",
        city: "",
        district: "",
        state: "",
        assignedTo: 0,
      };

      await fetch(`${api.getBaseUrl("main")}SalesLead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) {
          const msg = await res.text().catch(() => res.statusText);
          throw new Error(msg || `Request failed (${res.status})`);
        }
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(
        err?.message || "Failed to create lead. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    const audioElements = audioElementsRef;
    return () => {
      SpeechRecognition.stopListening();
      if (intervalRef.current) clearInterval(intervalRef.current);
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
      stopStream();
      Object.values(audioElements.current).forEach((a) => a.pause());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
          <p className="text-red-500 font-medium mb-4">
            Your browser does not support speech recognition. Please use Google
            Chrome or Microsoft Edge.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff8657]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isActive = recordingState === "recording";
  const isPaused = recordingState === "paused";
  const isIdle = recordingState === "idle";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-[10000] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Voice Input</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Waveform Visualizer */}
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-6 px-4 mb-4">
          <div className="w-72 h-14 flex justify-center items-center mb-4">
            {isActive ? (
              <div className="flex space-x-1 items-end">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-waveform w-1 bg-[#FF6B35]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
              </div>
            ) : isPaused ? (
              <div className="flex space-x-1 items-end">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-1 bg-yellow-400 mx-0.5"
                    style={{ height: `${8 + (index % 5) * 6}px` }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-2 items-end">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <div key={index} className="w-1 h-1 bg-gray-300 mx-0.5" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  Press record to start
                </span>
              </div>
            )}
          </div>

          {/* Timer & Status */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-semibold text-gray-700 w-16 text-center">
              {recordingTime}
            </span>
            {isActive && (
              <span className="text-xs text-red-500 font-medium animate-pulse">
                ● Recording
              </span>
            )}
            {isPaused && (
              <span className="text-xs text-yellow-500 font-medium">
                ⏸ Paused
              </span>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {/* Record (idle only) */}
            {isIdle && (
              <button
                onClick={handleRecord}
                className="w-12 h-12 rounded-full flex justify-center items-center bg-[#FF6B35] hover:bg-[#ff8657] text-white transition-colors"
                title="Start recording"
              >
                <FaMicrophoneLines className="text-xl" />
              </button>
            )}

            {/* Pause (recording only) */}
            {isActive && (
              <button
                onClick={handlePause}
                className="w-12 h-12 rounded-full flex justify-center items-center bg-yellow-400 hover:bg-yellow-500 text-white transition-colors"
                title="Pause"
              >
                <FaPause className="text-xl" />
              </button>
            )}

            {/* Resume/Play (paused only) */}
            {isPaused && (
              <button
                onClick={handleResume}
                className="w-12 h-12 rounded-full flex justify-center items-center bg-[#FF6B35] hover:bg-[#ff8657] text-white transition-colors"
                title="Resume recording"
              >
                <FaPlay className="text-xl" />
              </button>
            )}

            {/* Stop & Save (recording or paused) */}
            {(isActive || isPaused) && (
              <button
                onClick={handleStop}
                className="w-12 h-12 rounded-full flex justify-center items-center bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Stop & Save"
              >
                <FaStop className="text-xl" />
              </button>
            )}
          </div>

          {/* Live interim indicator */}
          {isActive && interimTranscript && (
            <p className="text-xs text-gray-400 italic mt-3 truncate w-full text-center px-2">
              {interimTranscript}
            </p>
          )}
        </div>
        {/* Format hint */}
        <div className="mt-3 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg px-3 py-2.5">
          <p className="text-xs font-bold text-amber-700 mb-1">📋 Note</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Please speak clearly and include the following details in order:{" "}
            <span className="font-semibold text-gray-700">
              Hospital / Clinic Name
            </span>
            , <span className="font-semibold text-gray-700">Contact Name</span>,{" "}
            <span className="font-semibold text-gray-700">
              Contact Mobile Number
            </span>
            , <span className="font-semibold text-gray-700">Pincode</span>,{" "}
            <span className="font-semibold text-gray-700">Email Address</span>,
            and <span className="font-semibold text-gray-700">Comments</span>.
          </p>
        </div>
        <br />
        {/* Saved Segments */}
        {savedSegments.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Saved Recordings ({savedSegments.length})
              </span>
              <button
                onClick={handleConvertAll}
                className="px-3 py-1 bg-[#FF6B35] text-white text-xs rounded-lg hover:bg-[#ff8657] transition-colors"
              >
                Convert All to Text
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savedSegments.map((seg, idx) => (
                <div
                  key={seg.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {seg.duration}
                    </span>
                    {/* Playback button */}
                    {seg.audioUrl && (
                      <button
                        onClick={() => handlePlayback(seg)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          playingSegmentId === seg.id
                            ? "bg-red-100 text-red-500 hover:bg-red-200"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        }`}
                        title={
                          playingSegmentId === seg.id
                            ? "Stop playback"
                            : "Play recording"
                        }
                      >
                        {playingSegmentId === seg.id ? (
                          <>
                            <FaVolumeXmark className="text-xs" /> Stop
                          </>
                        ) : (
                          <>
                            <FaVolumeHigh className="text-xs" /> Play
                          </>
                        )}
                      </button>
                    )}
                    {/* Per-segment convert */}
                    <button
                      onClick={() => handleConvertSegment(seg)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium transition-colors ml-auto"
                      title="Add to transcript"
                    >
                      <FaAlignLeft className="text-xs" /> Convert
                    </button>
                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveSegment(seg.id)}
                      className="text-gray-300 hover:text-red-400 text-sm leading-none shrink-0"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {seg.text || (
                      <span className="italic text-gray-400">
                        No transcript
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript Textarea */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">
              Transcript
            </label>
            {editableText && (
              <button
                onClick={() => setEditableText("")}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            placeholder="Click 'Convert to Text' after saving your recordings..."
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35] resize-none text-sm"
          />
        </div>

        {/* Action Buttons */}
        {submitError && (
          <p className="text-xs text-red-500 text-right mb-1">{submitError}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!editableText.trim() || submitting}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#ff8657] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {submitting ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
