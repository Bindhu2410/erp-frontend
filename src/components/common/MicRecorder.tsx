import React, { useRef, useState } from "react";

const MicRecorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleStart = async () => {
    setAudioUrl(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <button
        type="button"
        onClick={recording ? handleStop : handleStart}
        style={{
          background: recording ? "#ef4444" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 50,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          marginBottom: 6,
          cursor: "pointer",
        }}
        aria-label={recording ? "Stop Recording" : "Start Recording"}
      >
        <span role="img" aria-label="mic">🎤</span>
      </button>
      {audioUrl && (
        <audio controls src={audioUrl} style={{ marginTop: 4, width: 180 }} />
      )}
      <span style={{ fontSize: 12, color: recording ? "#ef4444" : "#888" }}>
        {recording ? "Recording..." : "Record audio"}
      </span>
    </div>
  );
};

export default MicRecorder;
