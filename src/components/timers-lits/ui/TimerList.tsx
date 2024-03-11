import { FC } from 'react'
import { useStore } from '../../store/store'
import { Timer } from '../../timer/ui/Timer'

export const TimersList: FC = () => {
    const all = useStore((s) => s.allTimers)

    return (
        <div className='grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4'>
            {
                all.map((item) => <Timer timerId={item.title} key={item.title} />)
            }
        </div>
    )
}