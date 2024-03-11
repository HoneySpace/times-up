import moment, { Duration } from "moment"
import { FC, useState, useEffect } from "react"
import { DefaultModalProps } from "../../../../modal"
import { Timer, store, TimerId, TimerEntryTypes } from "../../../../store/store"
import { formateDuration } from "../../../../timer/ui/Timer"

type Entry = {
    title: Timer["title"]
    duration: Duration
}

export const createReportModal = (date: Date) => {
    const ReportModal: FC<DefaultModalProps> = ({ proceed }) => {
        const [entries, setEntries] = useState<Entry[]>([])

        useEffect(() => {
            store.getTimeEntriesAt(date).then((marks) => {
                const timerToDuration = new Map<TimerId, number>()
                const timerToStart = new Map<TimerId, Date>()

                marks.forEach((mark) => {
                    let duration = timerToDuration.get(mark.timer)
                    if (typeof duration === "undefined") {
                        timerToDuration.set(mark.timer, 0)
                        duration = 0
                    }

                    if (mark.type === TimerEntryTypes.start) {
                        timerToStart.set(mark.timer, mark.value)
                        return
                    }

                    let start = timerToStart.get(mark.timer)

                    if (!start) {
                        start = moment(mark.value).startOf("D").toDate()
                    }

                    const diff = mark.value.getTime() - start.getTime()

                    timerToDuration.set(mark.timer, duration + diff)
                })

                console.log({ timerToDuration })
                setEntries(Array.from(timerToDuration.entries()).map(([title, duration]) => ({ title, duration: moment.duration(duration) })))
            })



        }, [])

        return (
            <div className='bg-slate-900 p-6 rounded-lg text-white shadow-lg shadow-slate-900 border border-slate-800 w-full max-w-[540px]'>
                {entries.map((entry) => (
                    <div>
                        <div>
                            {entry.title}
                        </div>
                        <div>
                            {formateDuration(entry.duration)}
                        </div>
                    </div>
                ))}
                <button onClick={() => { proceed() }}>
                    Закрыть
                </button>
            </div>
        )
    }

    return ReportModal
}
