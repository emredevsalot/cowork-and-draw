"use client";
import React, { useCallback, useEffect, useState } from "react";
import { differenceInMilliseconds } from "date-fns";
import { useLocalData } from "@/components/Providers";
import { ILocalData, TimerOption } from "@/app/types";
import Button from "@/components/Button";
import SettingsModal from "./SettingsModal";
import DailySessionTargetIndicator from "./DailySessionTargetIndicator";

const useTimer = ({
  storageValues,
  setStorageValues,
}: {
  storageValues: ILocalData;
  setStorageValues: (storageValues: ILocalData) => void;
}) => {
  const timerOptions: TimerOption[] = [
    {
      id: "focusTimer",
      name: "Focus",
      duration: storageValues?.focusDuration,
    },
    {
      id: "restTimer",
      name: "Rest",
      duration: storageValues?.restDuration,
    },
    {
      id: "longRestTimer",
      name: "Long Rest",
      duration: storageValues?.longRestDuration,
    },
  ];

  const initialSelectedTimer = timerOptions.find(
    (option) => option.id === storageValues?.selectedTimer
  );

  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(
    initialSelectedTimer || timerOptions[0]
  );
  const [timeLeft, setTimeLeft] = useState<number>(
    storageValues?.timerMinutesRemaining * 60 * 1000 ||
      selectedTimer.duration * 60 * 1000
  );

  // Function to handle transition between timers
  const handleTimerTransition = () => {
    const currentTime = new Date().getTime();
    const updatedStorageValues: ILocalData = { ...storageValues };
    let nextTimer: TimerOption;

    if (selectedTimer.id === "focusTimer") {
      const focusSessions = updatedStorageValues.focusSessions || 0;
      const updatedFocusSessions = focusSessions + 1;

      if (updatedFocusSessions % updatedStorageValues.longRestInterval === 0) {
        nextTimer = handleTransitionToLongRest(
          updatedStorageValues,
          currentTime
        );
      } else {
        nextTimer = handleTransitionToRest(
          updatedStorageValues,
          updatedFocusSessions,
          currentTime
        );
      }
    } else {
      nextTimer = handleTransitionToFocus(updatedStorageValues, currentTime);
    }

    playSound();
    setTimeLeft(nextTimer.duration * 60 * 1000);
    setSelectedTimer(nextTimer);
    setStorageValues(updatedStorageValues);
  };

  const handleTransitionToLongRest = (
    updatedStorageValues: ILocalData,
    currentTime: number
  ) => {
    const nextTimer = timerOptions.find(
      (option) => option.id === "longRestTimer"
    )!;
    updatedStorageValues.selectedTimer = nextTimer.id;
    updatedStorageValues.timerMinutesRemaining = nextTimer.duration;
    updatedStorageValues.availablePixelAmount += Math.floor(
      updatedStorageValues.focusDuration / 25
    );
    updatedStorageValues.timerStartedAt = currentTime;
    updatedStorageValues.timerStarted = updatedStorageValues.autoStartNext;
    updatedStorageValues.focusSessions = 0; // Reset focus sessions after long rest
    updatedStorageValues.dailyFocusSessionsCurrent += 1;
    return nextTimer;
  };

  const handleTransitionToRest = (
    updatedStorageValues: ILocalData,
    updatedFocusSessions: number,
    currentTime: number
  ) => {
    const nextTimer = timerOptions.find((option) => option.id === "restTimer")!;
    updatedStorageValues.selectedTimer = nextTimer.id;
    updatedStorageValues.timerMinutesRemaining = nextTimer.duration;
    updatedStorageValues.availablePixelAmount += Math.floor(
      updatedStorageValues.focusDuration / 25
    );
    updatedStorageValues.timerStartedAt = currentTime;
    updatedStorageValues.timerStarted = updatedStorageValues.autoStartNext;
    updatedStorageValues.focusSessions = updatedFocusSessions;
    updatedStorageValues.dailyFocusSessionsCurrent += 1;
    return nextTimer;
  };

  const handleTransitionToFocus = (
    updatedStorageValues: ILocalData,
    currentTime: number
  ) => {
    const nextTimer = timerOptions.find(
      (option) => option.id === "focusTimer"
    )!;
    updatedStorageValues.selectedTimer = nextTimer.id;
    updatedStorageValues.timerMinutesRemaining = nextTimer.duration;
    updatedStorageValues.timerStartedAt = currentTime;
    updatedStorageValues.timerStarted = updatedStorageValues.autoStartNext;
    return nextTimer;
  };

  // Update the timer every second if it's started
  useEffect(() => {
    const updateTimer = () => {
      const elapsedTime = differenceInMilliseconds(
        new Date(),
        storageValues.timerStartedAt
      );
      const remainingTime =
        storageValues.timerMinutesRemaining * 60 * 1000 - elapsedTime;

      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
      } else {
        handleTimerTransition();
      }
    };

    if (storageValues?.timerStarted) {
      const timerInterval = setInterval(updateTimer, 1000);
      return () => clearInterval(timerInterval); // Cleanup on unmount
    }
  }, [storageValues?.timerStarted, storageValues?.selectedTimer]);

  // On settings change, switch to "focusTimer" and reset time
  useEffect(() => {
    setSelectedTimer(timerOptions[0]);
    setTimeLeft(storageValues?.timerMinutesRemaining * 60 * 1000);
  }, [
    storageValues?.focusDuration,
    storageValues?.restDuration,
    storageValues?.longRestDuration,
    storageValues?.longRestInterval,
    storageValues?.autoStartNext,
  ]);

  const handleTimerStart = useCallback(() => {
    const currentTime = new Date().getTime();

    const updatedStorageValues: ILocalData = {
      ...storageValues,
      timerStarted: true,
      timerStartedAt: currentTime,
    };
    setStorageValues(updatedStorageValues);
  }, [storageValues, setStorageValues]);

  const handleTimerStop = useCallback(() => {
    const updatedStorageValues: ILocalData = {
      ...storageValues,
      timerStarted: false,
      timerMinutesRemaining: timeLeft / 60000,
    };
    setStorageValues(updatedStorageValues);
  }, [storageValues, setStorageValues, timeLeft]);

  const handleTimerReset = (timerOption: TimerOption) => {
    setSelectedTimer(timerOption);

    const updatedStorageValues: ILocalData = {
      ...storageValues,
      timerStarted: false,
      timerMinutesRemaining: timerOption.duration,
      selectedTimer: timerOption.id,
    };
    setTimeLeft(timerOption.duration * 60 * 1000);
    setStorageValues(updatedStorageValues);
  };

  const formatTime = (timeLeft: number) => {
    // TODO: "date-fns" was not working as expected with 60+ minutes (adding 2 hours)
    // due to Time Zones, there may be a better way than the current way below
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    const formattedHours =
      hours > 0 ? `${hours.toString().padStart(2, "0")}:` : "";
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
  };

  const playSound = () => {
    const audioContext = new AudioContext();
    const request = new Request("/sounds/timer-end.mp3");
    fetch(request)
      .then((response) => response.arrayBuffer())
      .then((buffer) => audioContext.decodeAudioData(buffer))
      .then((decodedData) => {
        const source = audioContext.createBufferSource();
        source.buffer = decodedData;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.2;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.onended = () => {
          audioContext.close();
        };

        source.start();
      })
      .catch((err) => {
        console.error("Error fetching or decoding audio:", err);
        audioContext.close();
      });
  };

  return {
    timerOptions,
    selectedTimer,
    timeLeft,
    handleTimerStart,
    handleTimerStop,
    handleTimerReset,
    formatTime,
  };
};

const Timer = ({ roomId }: { roomId: string }) => {
  const { storageValues, setStorageValues, storageValuesLoaded } =
    useLocalData();

  const {
    timerOptions,
    selectedTimer,
    timeLeft,
    handleTimerStart,
    handleTimerStop,
    handleTimerReset,
    formatTime,
  } = useTimer({ storageValues, setStorageValues });

  if (!storageValuesLoaded) {
    return <div className=" flex justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <SettingsModal roomId={roomId} />

      <DailySessionTargetIndicator
        dailyFocusSessionsTarget={storageValues.dailyFocusSessionsTarget}
        longRestInterval={storageValues.longRestInterval}
        dailyFocusSessionsCurrent={storageValues.dailyFocusSessionsCurrent}
      />
      {/* Timer options */}
      <div className="flex gap-4">
        {timerOptions.map((option) => (
          <button
            key={option.id}
            className={`outline outline-1 outline-stone-400 rounded-full px-3 py-1 text-stone-400 text-sm hover:bg-stone-200 hover:text-stone-500 whitespace-nowrap ${
              option.name === selectedTimer?.name ? "bg-stone-200" : ""
            }`}
            onClick={() => handleTimerReset(option)}
          >
            {option.name}
          </button>
        ))}
      </div>
      {/* Timer */}
      <div className="text-8xl">{formatTime(timeLeft)}</div>
      {/* Buttons */}
      <div className="flex gap-4">
        {storageValues?.timerStarted ? (
          <Button onClick={handleTimerStop}>Stop</Button>
        ) : (
          <Button onClick={handleTimerStart}>Start</Button>
        )}
        <Button
          onClick={() =>
            handleTimerReset(
              timerOptions.find((option) => option.id === selectedTimer.id)!
            )
          }
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Timer;
