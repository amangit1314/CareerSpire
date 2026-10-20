"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Video, Square, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLatest } from "@/hooks/useLatest";
import { VIDEO_RECORDER_CONTENT } from "@/config/content";

export interface VideoRecorderHandle {
  startRecording: () => void;
  stopRecording: () => void;
}

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number; // in seconds
  minDuration?: number; // minimum seconds before allowing stop (default 60)
  className?: string;
  autoStart?: boolean;
}

export const VideoRecorder = forwardRef<
  VideoRecorderHandle,
  VideoRecorderProps
>(
  (
    {
      onRecordingComplete,
      maxDuration = 300, // 5 minutes default
      minDuration = 60, // 1 minute minimum before allowing stop
      className,
      autoStart = false,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // initStream is a stable ref-free async fn; wrapped in useCallback ([])
    // purely so it can be listed in the mount-effect's deps below without
    // giving that effect a new identity to chase on every render.
    const initStream = useCallback(async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        // Start recording directly off the just-acquired stream instead of
        // a separate effect reactively watching `stream` state (which
        // hasn't committed yet at this point anyway). Causally direct:
        // "stream ready + autoStart on" starts recording exactly once,
        // with no watcher effect needed.
        if (autoStartRef.current) {
          startRecordingRef.current(mediaStream);
        }
      } catch (err) {
        setError(VIDEO_RECORDER_CONTENT.STREAM_ERROR);
        console.error("Stream init error:", err);
      }
    }, []);

    // Plain useRef+effect here, not useLatest: both are read inside
    // startRecording's memoized onstop closure, and the custom-hook
    // wrapper hides ref-stability from react-hooks/preserve-manual-
    // memoization, causing it to falsely flag startRecording's useCallback
    // as unsafe to memoize.
    const onRecordingCompleteRef = useRef(onRecordingComplete);
    const autoStartRef = useRef(autoStart);
    useEffect(() => {
      onRecordingCompleteRef.current = onRecordingComplete;
      autoStartRef.current = autoStart;
    }, [onRecordingComplete, autoStart]);

    // Read inside initStream's memoized body below (same reasoning as
    // onRecordingCompleteRef/autoStartRef above): plain ref, not useLatest.
    const startRecordingRef = useRef<
      (mediaStream?: MediaStream | null) => void
    >(() => {});

    const durationRef = useLatest(duration);
    const minDurationRef = useLatest(minDuration);
    // Mirrors `stream` for the mount-effect's cleanup below — that effect
    // must run only once ([] deps, so it doesn't re-acquire the camera on
    // every stream change), so its cleanup can't close over `stream`
    // directly (it would always see the null value from mount time).
    const streamRef = useLatest(stream);

    // Accepts an explicit stream so it can be called from initStream's
    // success path with the just-acquired MediaStream, before `stream`
    // state has committed. Falls back to `stream` state for the normal
    // manual "Record" button path.
    const startRecording = useCallback(
      (mediaStream: MediaStream | null = stream) => {
        if (!mediaStream) return;

        chunksRef.current = [];
        setRecordedBlob(null);
        setDuration(0);

        const mimeTypes = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
          "video/mp4",
        ];

        const supportedType = mimeTypes.find((type) =>
          MediaRecorder.isTypeSupported(type),
        );

        if (!supportedType) {
          setError(VIDEO_RECORDER_CONTENT.NO_SUPPORTED_FORMAT);
          return;
        }

        const mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: supportedType,
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          setRecordedBlob(blob);

          // Auto submit if autoStart is true
          if (autoStartRef.current) {
            onRecordingCompleteRef.current(blob);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // Collect data every second
        setIsRecording(true);
        setIsPaused(false);
      },
      [stream],
    );

    useEffect(() => {
      startRecordingRef.current = startRecording;
    }, [startRecording]);

    const stopRecording = useCallback(() => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setIsPaused(false);
      }
    }, [isRecording]);

    // Acquire the camera/mic stream once on mount. Deliberately `[initStream]`
    // only (not `stream`) — this must not re-run when the stream itself
    // changes, or it would re-request getUserMedia in a loop. Cleanup reads
    // streamRef (not `stream`) so it stops the *current* tracks on unmount
    // instead of the always-null value captured at mount time.
    useEffect(() => {
      // initStream is async; its setState calls happen after an `await`,
      // not synchronously in this effect body. The rule can't see across
      // that boundary and flags the call site itself as a false positive.

      initStream();
      return () => {
        // streamRef is a plain data-holder ref (via useLatest), not a DOM
        // ref — reading .current here is the intended behavior (stop
        // whatever the *current* stream is), not a stale-DOM-node risk.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        streamRef.current?.getTracks().forEach((track) => track.stop());
      };
    }, [initStream, streamRef]);

    // Duration timer — auto-stops recording once maxDuration is hit.
    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isRecording && !isPaused) {
        interval = setInterval(() => {
          setDuration((d) => {
            if (d >= maxDuration) {
              stopRecording();
              return d;
            }
            return d + 1;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isRecording, isPaused, maxDuration, stopRecording]);

    // Expose imperative controls to the parent (e.g. video mock session
    // page). No deps array: re-runs every render so the closure always
    // sees the latest startRecording/stopRecording identities.
    useImperativeHandle(ref, () => ({
      startRecording,
      stopRecording: () => {
        // Allow stop from parent only after minimum duration
        if (durationRef.current >= minDurationRef.current) {
          stopRecording();
        }
      },
    }));

    const togglePause = useCallback(() => {
      if (!mediaRecorderRef.current) return;

      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }, [isPaused]);

    const resetRecording = useCallback(() => {
      setRecordedBlob(null);
      setDuration(0);
      setIsRecording(false);
      setIsPaused(false);
      chunksRef.current = [];

      // Re-attach live stream to video
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    const submitRecording = useCallback(() => {
      if (recordedBlob) {
        onRecordingComplete(recordedBlob);
      }
    }, [recordedBlob, onRecordingComplete]);

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progressPercentage = (duration / maxDuration) * 100;
    const hasReachedMinDuration = duration >= minDuration;

    if (error) {
      return (
        <div
          className={cn(
            "flex items-center justify-center p-8 text-center",
            className,
          )}
        >
          <div className="space-y-4">
            <Video className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button onClick={initStream} variant="outline">
              {VIDEO_RECORDER_CONTENT.RETRY}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("space-y-4", className)}>
        {/* Video Preview */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border">
          <video
            ref={videoRef}
            autoPlay={!recordedBlob}
            muted={!recordedBlob}
            controls={!!recordedBlob}
            playsInline
            className="w-full h-full object-cover -scale-x-100"
            src={recordedBlob ? URL.createObjectURL(recordedBlob) : undefined}
          />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <motion.div
                animate={{ opacity: isPaused ? 0.5 : [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-red-500"
              />
              <span className="text-white text-sm font-medium drop-shadow-lg">
                {isPaused
                  ? VIDEO_RECORDER_CONTENT.PAUSED
                  : VIDEO_RECORDER_CONTENT.REC}
              </span>
            </div>
          )}

          {/* Duration display */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-black/50 text-white text-sm font-mono">
              {formatTime(duration)} / {formatTime(maxDuration)}
            </span>
          </div>

          {/* Progress bar */}
          {isRecording && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <motion.div
                className={cn(
                  "h-full",
                  progressPercentage > 90 ? "bg-red-500" : "bg-primary",
                )}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording && !recordedBlob && (
            <Button
              onClick={() => startRecording()}
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Video className="h-5 w-5" />
              {VIDEO_RECORDER_CONTENT.START_RECORDING}
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={togglePause}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {isPaused ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
                {isPaused
                  ? VIDEO_RECORDER_CONTENT.RESUME
                  : VIDEO_RECORDER_CONTENT.PAUSE}
              </Button>
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="gap-2"
                disabled={!hasReachedMinDuration}
              >
                <Square className="h-5 w-5" />
                {hasReachedMinDuration
                  ? VIDEO_RECORDER_CONTENT.STOP
                  : `${VIDEO_RECORDER_CONTENT.MIN_DURATION_PREFIX} ${formatTime(minDuration - duration)}`}
              </Button>
            </>
          )}

          {recordedBlob && (
            <>
              <Button
                onClick={resetRecording}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                {VIDEO_RECORDER_CONTENT.RE_RECORD}
              </Button>
              <Button
                onClick={submitRecording}
                size="lg"
                className="gap-2 shadow-lg shadow-primary/20"
              >
                {VIDEO_RECORDER_CONTENT.SUBMIT_RECORDING}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  },
);

VideoRecorder.displayName = "VideoRecorder";
