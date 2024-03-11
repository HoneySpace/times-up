import { FC } from 'react'
import { openModal } from '../../../../modal'
import { createReportModal } from '../../report'

export const TimeReportToday: FC = () => {

    return (
        <button onClick={() => {
            openModal(createReportModal(new Date()))
        }}>
            Today
        </button>
    )
}