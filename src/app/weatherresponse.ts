export interface IWeatherResponse {
    cnt: number,
    list: Array<IWeatherItem>
}

interface IWeatherItem {
    main : {
        temp: number,
        feels_like: number,
        temp_min: number,
        temp_max: number,
        pressure: number,
        humidity: number
    },
    name: string,
    sys: {
        country: string
    },
    weather: [
        {
            main: string
        }
    ]
}
