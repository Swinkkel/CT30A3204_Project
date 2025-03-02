// useFetch component. Fetches data from given url.
import {useEffect, useState} from 'react'

const useFetch = (url: string) => {
    const [data, setData] = useState<unknown>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>("")
  
    useEffect(() => {
        const abortCtrl: AbortController = new AbortController()

        const fetchData = async () => {
            try {
                const response: Response = await fetch(url, {signal: abortCtrl.signal, method: "GET", credentials: "include"})
                if (!response.ok) {
                    throw new Error("Failed to fetch data!")
                }
                const data: unknown = await response.json()

                setData(data)
                setLoading(false)
                setError("")

            } catch (error: unknown) {
                if (error instanceof Error) {
                    if (error.name === "AbortError") {
                        console.log("Fetch aborted")
                    } else {
                        setError(error.message)
                        setLoading(false)
                    }
                }
            }
        }
        fetchData()
        return () => abortCtrl.abort()

    }, [url])
  
    return {data, loading, error}
}

export default useFetch;