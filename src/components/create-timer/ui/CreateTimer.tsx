import { FC, useState } from 'react'
import { DefaultModalProps, openModal } from '../../modal'
import { store } from '../../store/store'

const createModal: FC<DefaultModalProps<{ name: string }>> = ({ proceed, close }) => {
    const [input, setInput] = useState("")

    return (
        <div className='bg-slate-900 p-6 rounded-lg text-white shadow-lg shadow-slate-900 border border-slate-800 w-full max-w-[540px]'>
            <h3 className='text-lg mb-4'>
                Добавить новый таймер
            </h3>
            <div>
                Название
            </div>
            <input
                className='bg-transparent w-full border border-slate-300 focus:outline-none px-3 py-2 mb-8 rounded'
                value={input}
                onChange={(e) => {
                    setInput(e.target.value ?? "")
                }}
            />
            <div className='flex gap-4 justify-end'>
                <button onClick={() => proceed({ name: input })}>
                    Создать
                </button>
                <button onClick={() => close()}>
                    Отмена
                </button>
            </div>
        </div>
    )
}

export const CrateTimer: FC = ({ }) => {

    return (
        <button
            className='py-1 px-2 hover:bg-slate-800 rounded transition-colors'
            onClick={() => {
                openModal(createModal).then(
                    ({ name }) => {
                        store.createTimer({ title: name })
                        return
                    }
                ).catch(() => { })
            }}>
            New
        </button>
    )
}