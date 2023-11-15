"use client";
import React, { useCallback, useEffect, useState } from "react";
import { format, differenceInMilliseconds } from "date-fns";
import { useLocalData } from "@/components/Providers";
import { ILocalData, TimerOption } from "@/app/types";
import Button from "@/components/Button";

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
    updatedStorageValues.availablePixelAmount++;
    updatedStorageValues.timerStartedAt = currentTime;
    updatedStorageValues.timerStarted = updatedStorageValues.autoStartNext;
    updatedStorageValues.focusSessions = 0; // Reset focus sessions after long rest
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
    updatedStorageValues.availablePixelAmount++;
    updatedStorageValues.timerStartedAt = currentTime;
    updatedStorageValues.timerStarted = updatedStorageValues.autoStartNext;
    updatedStorageValues.focusSessions = updatedFocusSessions;
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
    let animationFrameId: number;
    const updateTimer = () => {
      const elapsedTime = differenceInMilliseconds(
        new Date(),
        storageValues.timerStartedAt
      );
      const remainingTime =
        storageValues.timerMinutesRemaining * 60 * 1000 - elapsedTime;

      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
        animationFrameId = requestAnimationFrame(updateTimer);
      } else {
        handleTimerTransition();
      }
    };

    if (storageValues?.timerStarted) {
      animationFrameId = requestAnimationFrame(updateTimer);
      return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    }
  }, [storageValues?.timerStarted, storageValues?.selectedTimer]);

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
    const date = new Date(0);
    date.setMilliseconds(timeLeft);
    return format(date, "mm:ss");
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

const Timer = () => {
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
        <Button onClick={() => handleTimerReset(selectedTimer)}>Reset</Button>
      </div>
    </div>
  );
};

export default Timer;
