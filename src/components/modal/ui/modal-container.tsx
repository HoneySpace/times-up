import React from "react";

export const ModalContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="bg-slate-900 p-6 rounded-lg text-white shadow-lg shadow-slate-900 border border-slate-800 w-full max-w-[540px]">
      {children}
    </div>
  );
};
