import { useLocalData } from "@/components/Providers";

import { ILocalData } from "@/app/types";

type Props = {
  dailyFocusSessionsTarget: number;
  longRestInterval: number;
  dailyFocusSessionsCurrent?: number;
  showResetAlways?: Boolean;
};

const DailySessionTargetIndicator = ({
  dailyFocusSessionsTarget,
  longRestInterval,
  dailyFocusSessionsCurrent = 0,
  showResetAlways = false,
}: Props) => {
  const { storageValues, setStorageValues } = useLocalData();

  const resetDailySessions = () => {
    const updatedStorageValues: ILocalData = {
      ...storageValues,
      dailyFocusSessionsCurrent: 0,
      focusSessions: 0,
    };
    setStorageValues(updatedStorageValues);
  };

  const indicator = [];

  for (let i = 0; i < dailyFocusSessionsTarget; i++) {
    if (i < dailyFocusSessionsCurrent) {
      indicator.push(
        <div
          key={i}
          className="bg-green-500 rounded-full h-3 w-3 border-2 border-black"
        ></div>
      );
    } else {
      indicator.push(
        <div
          key={i}
          className="bg-white rounded-full h-3 w-3 border-2 border-black"
        ></div>
      );
    }

    if (
      (i + 1) % longRestInterval === 0 &&
      i !== dailyFocusSessionsTarget - 1
    ) {
      indicator.push(
        <div
          key={i + dailyFocusSessionsTarget}
          className="bg-yellow-500 rounded-full h-3 w-3 border-2 border-black"
        ></div>
      );
    }
  }

  const showResetButton =
    showResetAlways || dailyFocusSessionsCurrent >= dailyFocusSessionsTarget;

  return (
    <div className="flex gap-4 items-center">
      <div className="flex gap-1">{indicator}</div>
      <div>
        {showResetButton && (
          <button
            className="outline outline-1 outline-stone-400 rounded-full px-3 py-1 text-stone-400 text-sm hover:bg-stone-200 hover:text-stone-500 whitespace-nowrap"
            onClick={resetDailySessions}
          >
            Reset Daily Sessions
          </button>
        )}
      </div>
    </div>
  );
};

export default DailySessionTargetIndicator;
