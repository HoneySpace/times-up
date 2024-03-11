import React from "react";
import { createRoot } from "react-dom/client";

export type DefaultModalProps<T = void, A extends NonNullable<unknown> = {}> = { proceed: (value: T) => void, close: () => void } & A

export function openModal<T>(Content: React.FC<DefaultModalProps<T>>) {
    const body = document.body

    const el = document.createElement("div")
    const root = createRoot(el)
    body.append(el)

    return new Promise<T>((resolve, reject) => {
        const unmount = () => {
            root.unmount()
            body.removeChild(el)
        }

        const proceed = (value: T) => {
            resolve(value)
            unmount()
        }

        const close = () => {
            unmount()
            reject()
        }
        const modal =
            <div
                className="z-10 w-screen h-screen grid place-items-center fixed top-0 left-0 p-6 bg-slate-950 bg-opacity-50"
                data-backdrop
                onClick={(e) => {
                    const attr = (e.target as HTMLElement).getAttribute("data-backdrop")
                    if (attr) {
                        close()
                    }
                }}>
                <Content proceed={proceed} close={close} />
            </div>

        root?.render(modal)
    })
}