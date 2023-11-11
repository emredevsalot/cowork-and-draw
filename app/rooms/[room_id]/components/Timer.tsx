"use client";
import React, { useEffect, useState } from "react";
import { format, differenceInMilliseconds } from "date-fns";
import { useLocalData } from "@/components/Providers";
import { ILocalData } from "@/app/types";
import Button from "@/components/Button";

const Timer = () => {
  const { storageValues, setStorageValues, storageValuesLoaded } =
    useLocalData();

  const [timeLeft, setTimeLeft] = useState(
    storageValues?.timerMinutesRemaining * 60 * 1000
  );

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
      setTimeLeft(storageValues.timerMinutesTotal * 60 * 1000);

      const updatedStorageValues: ILocalData = {
        ...storageValues,
        timerStarted: false,
        availablePixelAmount:
          storageValues.availablePixelAmount == null
            ? 0
            : storageValues.availablePixelAmount + 1,
        timerMinutesRemaining: storageValues.timerMinutesTotal,
      };
      setStorageValues(updatedStorageValues);
    }
  };

  // Update the timer every second if it's started
  useEffect(() => {
    if (storageValues?.timerStarted) {
      const timerInterval = setInterval(updateTimer, 1000);
      return () => clearInterval(timerInterval); // Cleanup on unmount
    }
  }, [storageValues?.timerStarted]);

  const handleTimerStart = () => {
    const currentTime = new Date().getTime();

    const updatedStorageValues: ILocalData = {
      ...storageValues,
      timerStarted: true,
      timerStartedAt: currentTime,
      // timerMinutesTotal: 0.16, // FOR TESTING PURPOSES
    };
    setStorageValues(updatedStorageValues);
  };

  const handleTimerStop = () => {
    const updatedStorageValues: ILocalData = {
      ...storageValues,
      timerStarted: false,
      timerMinutesRemaining: timeLeft / 60000,
    };
    setStorageValues(updatedStorageValues);
  };

  const handleTimerReset = () => {
    const updatedStorageValues: ILocalData = {
      ...storageValues,
      timerStarted: false,
      timerMinutesRemaining: storageValues.timerMinutesTotal,
    };
    setTimeLeft(storageValues.timerMinutesTotal * 60 * 1000);
    setStorageValues(updatedStorageValues);
  };

  const formatTime = (timeLeft: number) => {
    const date = new Date(0);
    date.setMilliseconds(timeLeft);
    return format(date, "mm:ss");
  };

  if (!storageValuesLoaded) {
    return <div className=" flex justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="text-8xl">{formatTime(timeLeft)}</div>
      <div className="flex gap-4">
        {storageValues?.timerStarted ? (
          <Button onClick={handleTimerStop}>Stop</Button>
        ) : (
          <Button onClick={handleTimerStart}>Start</Button>
        )}
        <Button onClick={handleTimerReset}>Reset</Button>
      </div>
    </div>
  );
};

export default Timer;
