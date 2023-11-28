"use client";
import React, { useEffect, useRef, useState } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { useLocalData } from "@/components/Providers";
import Button from "@/components/Button";
import Input from "@/components/Input";

import DailySessionTargetIndicator from "./DailySessionTargetIndicator";

import { ILocalData } from "@/app/types";

type Props = {
  roomId: string;
};
const SettingsModal = ({ roomId }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalRef = useRef<null | HTMLDialogElement>(null);
  const showSettings = searchParams.get("showSettings");

  // Check if setting values are changed, to enable "Save Settings" button
  const [settingValuesChanged, setSettingValuesChanged] = useState(false);

  const { storageValues, setStorageValues, storageValuesLoaded } =
    useLocalData();

  // Settings states
  const [focusDuration, setFocusDuration] = useState(
    storageValues?.focusDuration
  );
  const [restDuration, setRestDuration] = useState(storageValues?.restDuration);
  const [longRestDuration, setLongRestDuration] = useState(
    storageValues?.longRestDuration
  );
  const [longRestInterval, setLongRestInterval] = useState(
    storageValues?.longRestInterval
  );
  const [autoStartNext, setAutoStartNext] = useState(
    storageValues?.autoStartNext
  );
  const [dailyFocusSessionsTarget, setDailyFocusSessionsTarget] = useState(
    storageValues?.dailyFocusSessionsTarget
  );

  // Tracks changes in setting values to enable 'Save Settings' button if any value has changed
  useEffect(() => {
    const settingsValues = [
      focusDuration,
      restDuration,
      longRestDuration,
      longRestInterval,
      autoStartNext,
      dailyFocusSessionsTarget,
    ];

    const originalValues = [
      storageValues?.focusDuration,
      storageValues?.restDuration,
      storageValues?.longRestDuration,
      storageValues?.longRestInterval,
      storageValues?.autoStartNext,
      storageValues?.dailyFocusSessionsTarget,
    ];

    // Check if any setting value has changed
    const hasChanged = settingsValues.some(
      (value, index) => value !== originalValues[index]
    );

    setSettingValuesChanged(hasChanged);
  }, [
    focusDuration,
    restDuration,
    longRestDuration,
    longRestInterval,
    autoStartNext,
    dailyFocusSessionsTarget,
    storageValues,
  ]);

  // Manages modal visibility, margin according to scrollbar,
  // and scrolling behavior based on 'showSettings' flag
  useEffect(() => {
    const body = document.body;

    // Check if scrollbar is present
    const hasVerticalScrollbar =
      document.documentElement.scrollHeight > window.innerHeight;

    if (showSettings === "y") {
      modalRef.current?.showModal();
      if (hasVerticalScrollbar) {
        // Adjust right padding only if scrollbar is present
        body.style.paddingRight = `${
          window.innerWidth - document.documentElement.clientWidth
        }px`;
      }
      body.style.overflow = "hidden";
    } else {
      modalRef.current?.close();
      body.style.paddingRight = "0px";
      body.style.overflow = "auto";
    }
    return () => {
      // Re-enable scrolling when the component unmounts (cleanup)
      body.style.paddingRight = "0px";
      body.style.overflow = "auto";
    };
  }, [showSettings]);

  const closeModal = () => {
    modalRef.current?.close();
    router.push(`/rooms/${roomId}`);
  };

  // Save updated settings to storage,
  // stop the timer, switch to "focusTimer" and close the modal
  const handleSave = () => {
    const updatedStorageValues: ILocalData = {
      ...storageValues,
      focusSessions: 0,
      selectedTimer: "focusTimer",
      timerStarted: false,
      focusDuration: focusDuration,
      timerMinutesRemaining: focusDuration,
      restDuration: restDuration,
      longRestDuration: longRestDuration,
      longRestInterval: longRestInterval,
      autoStartNext: autoStartNext,
      dailyFocusSessionsTarget: dailyFocusSessionsTarget,
    };
    setStorageValues(updatedStorageValues);
    closeModal();
  };

  // Close the modal when clicking outside the modal area
  const wrapperClose: React.MouseEventHandler<HTMLDialogElement> = (e) => {
    const target = e.target as HTMLDivElement;
    if (target.id === "modalWrapper") {
      closeModal();
    }
  };

  const modal: JSX.Element | null =
    showSettings === "y" && storageValuesLoaded ? (
      <dialog
        ref={modalRef}
        id="modalWrapper"
        className="fixed top-50 left-50 -translate-x-50 -translate-y-50 z-10  rounded-xl backdrop:bg-gray-800/50"
        onClick={wrapperClose}
      >
        <div className="w-[500px] max-w-full flex flex-col">
          <div className="flex flex-row justify-between items-center mb-4 py-2 px-5 bg-gray-200">
            <p className="text-2xl">Settings</p>
            <Button className="place-self-end" onClick={closeModal}>
              X
            </Button>
          </div>
          <div className=" flex flex-col gap-4 px-5 pb-6">
            <div>
              <label htmlFor="focusDuration">Focus Duration (m)</label>
              <Input
                placeholder="Focus Duration"
                type="number"
                id="focusDuration"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
              />
              <label>
                (Earn 1 pixel for each 25 minutes of pomodoro)
                <br />
                (Current: {Math.floor(focusDuration / 25)} pixel
                {Math.floor(focusDuration / 25) !== 1 && "s"} per pomodoro)
              </label>
            </div>
            <div>
              <label htmlFor="restDuration">Rest Duration (m)</label>
              <Input
                placeholder="Rest Duration"
                type="number"
                id="restDuration"
                value={restDuration}
                onChange={(e) => setRestDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="longRestDuration">Long Rest Duration (m)</label>
              <Input
                placeholder="Long Rest Duration"
                type="number"
                id="longRestDuration"
                value={longRestDuration}
                onChange={(e) => setLongRestDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="longRestInterval">Long Rest Interval</label>
              <Input
                placeholder="Long Rest Interval"
                type="number"
                id="longRestInterval"
                value={longRestInterval}
                onChange={(e) => setLongRestInterval(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="dailyFocusSessionsTarget">
                Daily Focus Session Target
              </label>
              <Input
                placeholder="Daily Focus Session Target"
                type="number"
                id="dailyFocusSessionsTarget"
                value={dailyFocusSessionsTarget}
                onChange={(e) => {
                  // Ensure the value is at least 1 or more
                  const newValue = Number(e.target.value);
                  const validatedValue = newValue >= 1 ? newValue : 1;
                  setDailyFocusSessionsTarget(validatedValue);
                }}
              />
              <DailySessionTargetIndicator
                dailyFocusSessionsTarget={dailyFocusSessionsTarget}
                longRestInterval={longRestInterval}
                showResetAlways={true}
              />
            </div>
            <div className="flex items-center">
              <input
                placeholder="Automatically start next timer"
                className="w-5 h-5 mr-2"
                id="autoStartNext"
                type="checkbox"
                checked={autoStartNext}
                onChange={(e) => setAutoStartNext(!autoStartNext)}
              />
              <label htmlFor="autoStartNext">
                Automatically start next timer
              </label>
            </div>
            <p>Saving will reset your focus sessions and the timer.</p>
            <div className="flex flex-row justify-end mt-2">
              <Button disabled={!settingValuesChanged} onClick={handleSave}>
                Save settings
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    ) : null;

  return modal;
};

export default SettingsModal;
