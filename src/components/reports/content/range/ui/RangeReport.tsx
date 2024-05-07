import moment from "moment";
import React, { useState } from "react";
import {
  DefaultModalProps,
  ModalContainer,
  openModal,
} from "../../../../modal";
import { DayInfo } from "../../day-info";

const SelectModal: React.FC<DefaultModalProps<{ start: Date; end: Date }>> = ({
  proceed,
}) => {
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState(new Date());

  return (
    <ModalContainer>
      <h3 className="text-xl mb-4">Выберете дату</h3>
      <input
        className="bg-transparent border border-white w-full py-3 px-2 focus:outline-none rounded mb-4"
        type="date"
        onChange={(e) => {
          setStart(new Date(e.target.value));
        }}
      />
      <input
        className="bg-transparent border border-white w-full py-3 px-2 focus:outline-none rounded mb-4"
        type="date"
        onChange={(e) => {
          setEnd(new Date(e.target.value));
        }}
      />
      <div className="flex justify-end">
        <button
          onClick={() => {
            proceed({ start, end });
          }}
        >
          Продолжить
        </button>
      </div>
    </ModalContainer>
  );
};

const createDateRange = (start: Date, end: Date) => {
  if (start.getTime() >= end.getTime()) return [start];

  const days: Date[] = [];
  const current = moment(start);
  const momentEnd = moment(end);

  while (current.valueOf() < momentEnd.valueOf()) {
    days.push(current.toDate());
    current.add(1, "day");
  }

  return days;
};

const createRangeReportModal = ({ start, end }: { start: Date; end: Date }) => {
  const days: Date[] = createDateRange(start, end);

  const RangeModal: React.FC<DefaultModalProps> = ({ proceed }) => {
    return (
      <div className="bg-slate-900 p-6 rounded-lg text-white shadow-lg shadow-slate-900 border border-slate-800 w-full max-w-[540px]">
        <div className="max-h-[80vh] overflow-auto pr-4">
          {days.map((date) => (
            <DayInfo date={date} />
          ))}
        </div>
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

  return RangeModal;
};

export const RangeReport: React.FC = () => {
  return (
    <button
      onClick={() => {
        openModal(SelectModal)
          .then((range) => {
            openModal(createRangeReportModal(range));
          })
          .catch(() => {});
      }}
    >
      Range Report
    </button>
  );
};
