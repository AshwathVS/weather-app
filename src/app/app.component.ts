import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { WeatherService } from './weather.service';
import { IWeatherResponse } from './weatherresponse';
import { GraphComponent, GraphData } from './graph/graph.component';

class CityWeather {
  constructor(
  public id: number,
  public temperature: number,
  public feels_like: number,
  public max_temperature: number,
  public min_temperature: number,
  public humidity: number,
  public city_name: string,
  public country: string,
  public weather_description: string
  ) {}
}

const cityIds = ['2653822', '2653941', '2643743', '2656173', '2644667', '2640729',
        '2643123', '2652221', '2649808', '2636432', '2651347', '3333167',
        '2633858', '2654675', '2650225', '2650228', '2648579', '2644688'];
  

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  public weatherData : Array<CityWeather>;

  @ViewChild(GraphComponent) graphComponent : GraphComponent;

  /**
   * Table related variables
   */
  displayedColumns: string[] = ['id', 'city_name', 'country', 'temperature', 'feels_like', 'humidity', 'weather_description'];

  public dataSource : MatTableDataSource<any>;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.weatherService.getWeather(cityIds)
      .subscribe(data => {
        this.weatherData = this.extractCityWeather(data);
        this.dataSource = new MatTableDataSource(this.weatherData);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.graphComponent.loadGraph(this.getGraphData());
      }
    );
  }

  extractCityWeather(weatherResponse : IWeatherResponse) : Array<CityWeather> {
    let res = new Array<CityWeather>();
    var ctr = 1;
    weatherResponse.list.forEach(element => {
      res.push(new CityWeather(ctr++, element.main.temp, 
        element.main.feels_like, 
        element.main.temp_max,
        element.main.temp_min,
        element.main.humidity,
        element.name,
        element.sys.country,
        element.weather.map(a => a.main).join()));
    });
    return res;
  }

  applyFilter(filterText: string) {
    this.dataSource.filter=filterText.trim().toLowerCase();
  }

  getGraphData() : Array<GraphData> {
    return this.weatherData.map(a => ({city_name: a.city_name, temp: a.temperature}))
  }

}
