import { useEffect, useState } from "react"

export function useCountDown(targetDate: number, enabled: boolean = true) {
  const countDownDate = new Date(targetDate).getTime()

  const [countDown, setCountDown] = useState(countDownDate - new Date().getTime())

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (enabled) {
      interval = setInterval(() => {
        setCountDown(countDownDate - new Date().getTime())
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [countDownDate, enabled])

  return getReturnValues(countDown)
}

const getReturnValues = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: days + hours + minutes + seconds <= 0 };
};