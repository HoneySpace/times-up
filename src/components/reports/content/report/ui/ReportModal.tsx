import { FC } from "react";
import { DefaultModalProps } from "../../../../modal";
import { DayInfo } from "../../day-info";

export const createReportModal = (date: Date) => {
  const ReportModal: FC<DefaultModalProps> = ({ proceed }) => {
    return (
      <div className="bg-slate-900 p-6 rounded-lg text-white shadow-lg shadow-slate-900 border border-slate-800 w-full max-w-[540px]">
        <DayInfo date={date} />
        <button
          onClick={() => {
            proceed();
          }}
        >
          Закрыть
        </button>
      </div>
    );
  };

  return ReportModal;
};
