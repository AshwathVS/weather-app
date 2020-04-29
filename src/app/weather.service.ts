import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IWeatherResponse } from './weatherresponse';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private static BASE_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/';

  constructor(private http: HttpClient) { }
  
  getWeather(ids: Array<string>) : Observable<IWeatherResponse> {
    return this.http.get<IWeatherResponse>(WeatherService.BASE_WEATHER_API_URL + 'group', {
      params: {
        id : ids.join(),
        appId: '194333f5b09188fbda8c4a3bbfea30b2',
        units: 'metric'
      }})
      .pipe(
        catchError(this.handleError<IWeatherResponse>('getWeather', null))
      );
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

}
