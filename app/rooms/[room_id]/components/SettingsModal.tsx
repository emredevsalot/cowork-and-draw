"use client";
import React, { useEffect, useRef, useState } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { useLocalData } from "@/components/Providers";
import Button from "@/components/Button";
import Input from "@/components/Input";
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

  // Tracks changes in setting values to enable 'Save Settings' button if any value has changed
  useEffect(() => {
    const settingsValues = [
      focusDuration,
      restDuration,
      longRestDuration,
      longRestInterval,
      autoStartNext,
    ];

    const originalValues = [
      storageValues?.focusDuration,
      storageValues?.restDuration,
      storageValues?.longRestDuration,
      storageValues?.longRestInterval,
      storageValues?.autoStartNext,
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
          <div className="flex flex-row justify-between mb-4 py-2 px-5 bg-gray-200">
            <p className="text-2xl">Settings</p>
            <Button className="place-self-end" onClick={closeModal}>
              X
            </Button>
          </div>
          <div className=" flex flex-col gap-4 px-5 pb-6">
            <div>
              <label htmlFor="focusDuration">
                (Reveal 1 pixel for 25 minutes, 2 pixels for 50 minutes.) <br />{" "}
                <br />
                Focus Duration
              </label>
              <select
                id="focusDuration"
                className="w-full rounded-lg border border-gray-200 placeholder-gray-400 p-2 "
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
              >
                <option value="25">25 minutes</option>
                <option value="50">50 minutes</option>
              </select>
            </div>
            <div>
              <label htmlFor="restDuration">Rest Duration</label>
              <Input
                placeholder="Rest Duration"
                type="number"
                id="restDuration"
                value={restDuration}
                onChange={(e) => setRestDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="longRestDuration">Long Rest Duration</label>
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
