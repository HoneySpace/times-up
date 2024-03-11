import { FC } from 'react'
import { useStore } from '../../store/store'

export const ActiveTimer: FC = () => {
    const active = useStore((s) => s.activeTimer)

    return (
        <div>{active ?? "Нет активного таймера"}</div>
    )
}