"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Camera,
  Mic,
  MicOff,
  VideoOff,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLatest } from "@/hooks/useLatest";
import { VIDEO_PREFLIGHT_CHECK_CONTENT } from "@/config/content";

interface VideoPreflightCheckProps {
  onReady: () => void;
  onCancel: () => void;
}

enum PermissionStatus {
  Pending = "pending",
  Granted = "granted",
  Denied = "denied",
  Error = "error",
}

export function VideoPreflightCheck({
  onReady,
  onCancel,
}: VideoPreflightCheckProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>(
    PermissionStatus.Pending,
  );
  const [micStatus, setMicStatus] = useState<PermissionStatus>(
    PermissionStatus.Pending,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Mirrors `stream` for the mount-effect's cleanup below — that effect
  // must run only once, so its cleanup can't close over `stream` directly
  // (it would always see the null value captured at mount time).
  const streamRef = useLatest(stream);

  // useCallback([]) so the mount-effect below can depend on it without
  // gaining a new identity (and re-requesting getUserMedia) every render.
  const checkPermissions = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      setStream(mediaStream);
      setCameraStatus(PermissionStatus.Granted);
      setMicStatus(PermissionStatus.Granted);

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Audio level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);
      microphone.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(100, avg * 2));
        requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();
    } catch (error: unknown) {
      console.error("Permission error:", error);

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setCameraStatus(PermissionStatus.Denied);
        setMicStatus(PermissionStatus.Denied);
      } else {
        setCameraStatus(PermissionStatus.Error);
        setMicStatus(PermissionStatus.Error);
      }
    }
  }, []);

  useEffect(() => {
    // checkPermissions is async; its setState calls happen after an
    // `await`, not synchronously in this effect body. The rule can't
    // see across that boundary and flags the call site itself as a
    // false positive.

    checkPermissions();
    return () => {
      // streamRef is a plain data-holder ref (via useLatest), not a DOM
      // ref — reading .current here is the intended behavior (stop
      // whatever the *current* stream is), not a stale-DOM-node risk.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [checkPermissions, streamRef]);

  const allReady =
    cameraStatus === PermissionStatus.Granted &&
    micStatus === PermissionStatus.Granted;

  const getStatusIcon = (status: PermissionStatus) => {
    switch (status) {
      case PermissionStatus.Pending:
        return (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        );
      case PermissionStatus.Granted:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case PermissionStatus.Denied:
      case PermissionStatus.Error:
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const handleStart = () => {
    if (allReady) {
      onReady();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-scroll overflow-hidden mx-4 glass border-primary/20">
        <div className="max-h-[80vh] overflow-y-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {VIDEO_PREFLIGHT_CHECK_CONTENT.TITLE}
            </CardTitle>
            <CardDescription>
              {VIDEO_PREFLIGHT_CHECK_CONTENT.DESCRIPTION}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Video Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border">
              {cameraStatus === PermissionStatus.Granted ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <VideoOff className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {cameraStatus === PermissionStatus.Pending
                        ? VIDEO_PREFLIGHT_CHECK_CONTENT.CAMERA_REQUESTING
                        : cameraStatus === PermissionStatus.Denied
                          ? VIDEO_PREFLIGHT_CHECK_CONTENT.CAMERA_DENIED
                          : VIDEO_PREFLIGHT_CHECK_CONTENT.CAMERA_UNAVAILABLE}
                    </p>
                  </div>
                </div>
              )}

              {/* Audio level indicator overlay */}
              {micStatus === PermissionStatus.Granted && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500"
                      animate={{ width: `${audioLevel}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-white/80 mt-1 text-center">
                    {VIDEO_PREFLIGHT_CHECK_CONTENT.MIC_LEVEL}
                  </p>
                </div>
              )}
            </div>

            {/* Permission Status */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                  cameraStatus === PermissionStatus.Granted
                    ? "border-green-500/50 bg-green-500/10"
                    : cameraStatus === PermissionStatus.Denied
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-border",
                )}
              >
                <Camera className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">
                    {VIDEO_PREFLIGHT_CHECK_CONTENT.CAMERA_LABEL}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cameraStatus === PermissionStatus.Granted
                      ? VIDEO_PREFLIGHT_CHECK_CONTENT.READY
                      : cameraStatus === PermissionStatus.Pending
                        ? VIDEO_PREFLIGHT_CHECK_CONTENT.CHECKING
                        : VIDEO_PREFLIGHT_CHECK_CONTENT.NOT_AVAILABLE}
                  </p>
                </div>
                {getStatusIcon(cameraStatus)}
              </div>

              <div
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                  micStatus === PermissionStatus.Granted
                    ? "border-green-500/50 bg-green-500/10"
                    : micStatus === PermissionStatus.Denied
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-border",
                )}
              >
                {micStatus === PermissionStatus.Granted ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {VIDEO_PREFLIGHT_CHECK_CONTENT.MICROPHONE_LABEL}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {micStatus === PermissionStatus.Granted
                      ? VIDEO_PREFLIGHT_CHECK_CONTENT.READY
                      : micStatus === PermissionStatus.Pending
                        ? VIDEO_PREFLIGHT_CHECK_CONTENT.CHECKING
                        : VIDEO_PREFLIGHT_CHECK_CONTENT.NOT_AVAILABLE}
                  </p>
                </div>
                {getStatusIcon(micStatus)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                {VIDEO_PREFLIGHT_CHECK_CONTENT.CANCEL}
              </Button>
              <Button
                onClick={handleStart}
                disabled={!allReady}
                className="flex-1 shadow-lg shadow-primary/20 dark:text-white"
              >
                {allReady
                  ? VIDEO_PREFLIGHT_CHECK_CONTENT.START_INTERVIEW
                  : VIDEO_PREFLIGHT_CHECK_CONTENT.WAITING_FOR_PERMISSIONS}
              </Button>
            </div>

            {/* Permission denied help */}
            <AnimatePresence>
              {(cameraStatus === PermissionStatus.Denied ||
                micStatus === PermissionStatus.Denied) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <p className="text-sm text-destructive font-medium mb-2">
                    {VIDEO_PREFLIGHT_CHECK_CONTENT.PERMISSION_REQUIRED}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {VIDEO_PREFLIGHT_CHECK_CONTENT.PERMISSION_HELP}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
