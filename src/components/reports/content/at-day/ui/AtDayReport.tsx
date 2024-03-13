import React, { useState } from "react";
import {
  DefaultModalProps,
  ModalContainer,
  openModal,
} from "../../../../modal";
import { createReportModal } from "../../report";

const SelectModal: React.FC<DefaultModalProps<Date>> = ({ proceed }) => {
  const [value, setValue] = useState<Date>(new Date());

  return (
    <ModalContainer>
      <h3 className="text-xl mb-4">Выберете дату</h3>
      <input
        className="bg-transparent border border-white w-full py-3 px-2 focus:outline-none rounded mb-4"
        type="date"
        onChange={(e) => {
          setValue(new Date(e.target.value));
        }}
      />
      <div className="flex justify-end">
        <button
          onClick={() => {
            proceed(value);
          }}
        >
          Продолжить
        </button>
      </div>
    </ModalContainer>
  );
};

export const AtDayReport: React.FC = () => {
  return (
    <button
      onClick={() => {
        openModal(SelectModal)
          .then((date) => {
            openModal(createReportModal(date));
          })
          .catch(() => {});
      }}
    >
      Report
    </button>
  );
};
