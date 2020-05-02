import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { WeatherService } from './weather.service';
import { GraphComponent, GraphData } from './graph/graph.component';
import { BrowserModule, By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs/internal/Observable';
import { IWeatherResponse } from './weatherresponse';
import { of } from 'rxjs';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                GraphComponent
            ],
            imports: [
                BrowserModule,
                BrowserAnimationsModule,
                HttpClientModule,
                MaterialModule
            ],
            providers: [
                {
                    provide: WeatherService,
                    useClass: WeatherServiceMock
                },
                MatPaginator,
                MatSort
            ]
        }).compileComponents();
    }));

    beforeEach((done) => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        component.graphComponent = new GraphComponentMock();
        component.ngOnInit();
        fixture.autoDetectChanges();
        fixture.whenRenderingDone().then(done);
    });

    /**
     * App run success checker
     */
    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    /**
     * Data source is populated
     */
    it('should populate datasource', () => {
        expect(component.dataSource).not.toBeNull();
    })

    /**
     * Pagination unit test cases
     * 1 - 5 out of 13 - initial value
     * 6 - 10 out of 13 - updated value after next page button is clicked
     * 
     * verifying that next page button is working by comparing the page labels.
     * 6 - 1 == 10 - 5
     * 
     */
    it('navigate to next page and verify the paginator range labels before and after', () => {
        //record the label
        let rangeLabelBeforeChange = fixture.debugElement.query(By.css('.mat-paginator-range-label')).nativeNode.innerText;
        let numbersBeforeChange = rangeLabelBeforeChange.match(/\d+/g).map(Number);
        
        //go to next page
        var nextIconButton = fixture.debugElement.queryAll(By.css('.mat-icon-button'))[1];
        nextIconButton.nativeElement.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        
        //record the label
        let rangeLabelAfterChange = fixture.debugElement.query(By.css('.mat-paginator-range-label')).nativeNode.innerText;
        let numbersAfterChange = rangeLabelAfterChange.match(/\d+/g).map(Number);

        // compare the labels
        expect(
            numbersBeforeChange.length == 3 &&
            numbersAfterChange.length == 3 &&
            numbersAfterChange[0] - numbersBeforeChange[0] == numbersAfterChange[1] - numbersBeforeChange[1] && 
            numbersAfterChange[2] == numbersBeforeChange[2]).toBeTrue();       
    })

    /**
     * Same approach but checking the it for previous button.
     * go to next page, note the label, navigate to previous page, note the label
     * and the difference should be equal
     * 
     */
    it('navigate to previous page and verify the paginator range labels before and after', () => {
        
        // go to next page, record the label
        var nextIconButton = fixture.debugElement.queryAll(By.css('.mat-icon-button'))[1];
        nextIconButton.nativeElement.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();

        let rangeLabelBeforeChange = fixture.debugElement.query(By.css('.mat-paginator-range-label')).nativeNode.innerText;
        let numbersBeforeChange = rangeLabelBeforeChange.match(/\d+/g).map(Number);
        
        // go to previous page, record the label 
        var previousButton = fixture.debugElement.queryAll(By.css('.mat-icon-button'))[0];
        previousButton.nativeElement.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        
        let rangeLabelAfterChange = fixture.debugElement.query(By.css('.mat-paginator-range-label')).nativeNode.innerText;
        let numbersAfterChange = rangeLabelAfterChange.match(/\d+/g).map(Number);

        //compare
        expect(
            numbersBeforeChange.length == 3 &&
            numbersAfterChange.length == 3 &&
            numbersAfterChange[0] - numbersBeforeChange[0] == numbersAfterChange[1] - numbersBeforeChange[1] && 
            numbersAfterChange[2] == numbersBeforeChange[2]).toBeTrue();       
    })
    
    /**
     * get the page range options from the list in html and make sure they are the same as the defined values
     * 
     */
    it('verify the page range options', () => {
        var pageRangeTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
        pageRangeTrigger.nativeElement.click();
        fixture.detectChanges();

        var currentPageRangeOptions = []
        fixture.debugElement.queryAll(By.css('.mat-option-text')).forEach(element => {
            currentPageRangeOptions.push(parseInt(element.nativeElement.innerText.trim()));
        });

        var providedPageRangeOptions = component.dataSource.paginator.pageSizeOptions;
        expect(currentPageRangeOptions).toEqual(providedPageRangeOptions);
    });

    /**
     * Making sure the range list works.
     * a - b of x, increase the page range one step and the label will be a - c of x
     * now b == pageRangeOptions[0],
     * and c == pageRangeOptions[1]
     * 
     * 
     * 1 - 5 of 13, 1 - 10 of 13
     * 
     * b = 5 and c = 10 here. 
     * page range options defined here are [5, 10, 20]
     * 
     */
    it('verify configurable pagination by comparing the range values before and after changing the items per page value', () => {
        let initialRangeLabel = fixture.debugElement.query(By.css('.mat-paginator-range-label')).nativeElement.innerText.trim();
        let initialLabelValues = initialRangeLabel.match(/\d+/g).map(Number);
        
        var pageRangeTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
        pageRangeTrigger.nativeElement.click();
        fixture.detectChanges();
        fixture.debugElement.queryAll(By.css('.mat-option-text'))[1].nativeElement.click();
        fixture.detectChanges();

        let updatedRangeLabel = fixture.debugElement.query(By.css('.mat-paginator-range-label')).nativeElement.innerText.trim();
        let updatedLabelValues = updatedRangeLabel.match(/\d+/g).map(Number);

        expect(component.dataSource.paginator.pageSizeOptions[0] == initialLabelValues[1] && 
            component.dataSource.paginator.pageSizeOptions[1] == updatedLabelValues[1]
            ).toBeTruthy();
    });

    /**
    * Filtering test case, since while testing we will be working with custom data. I used a unique city that exists in the dataset 
    * for filter unit testing
    * 
    */
   it('city filter should filter out 1 city', () => {
        var searchElement = fixture.debugElement.query(By.css('#inpSearch'));
        searchElement.nativeElement.value = 'cambridge';
        searchElement.nativeElement.dispatchEvent(new KeyboardEvent('keyup', {'key':'Enter'}));

        expect(component.dataSource.filteredData.length).toEqual(1);
        searchElement.nativeElement.value = '';
    })

    it('city filter should not filter anything', () => {
        var searchElement = fixture.debugElement.query(By.css('#inpSearch'));
        searchElement.nativeElement.value = 'RANDOM_CITY_VALUE_THAT_DOES_NOT_EXIST';
        searchElement.nativeElement.dispatchEvent(new KeyboardEvent('keyup', {'key':'Enter'}));

        expect(component.dataSource.filteredData.length).toEqual(0);
        searchElement.nativeElement.value = '';
    })

});

class WeatherServiceMock {
    getWeather(ids: Array<string>): Observable<IWeatherResponse> {
        return of({
            cnt: 13,
            list: [
                {
                    "coord": {
                        "lon": -3.18,
                        "lat": 51.48
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135655,
                        "sunset": 1588188734
                    },
                    "weather": [
                        {
                            "id": 803,
                            "main": "Clouds",
                            "description": "broken clouds",
                            "icon": "04d"
                        }
                    ],
                    "main": {
                        "temp": 12.56,
                        "feels_like": 5.93,
                        "temp_min": 11.67,
                        "temp_max": 13.33,
                        "pressure": 999,
                        "humidity": 81
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 9.3,
                        "deg": 260
                    },
                    "clouds": {
                        "all": 75
                    },
                    "dt": 1588169375,
                    "id": 2653822,
                    "name": "Cardiff"
                },
                {
                    "coord": {
                        "lon": 0.12,
                        "lat": 52.2
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588134732,
                        "sunset": 1588188073
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 11.79,
                        "feels_like": 7.91,
                        "temp_min": 11.67,
                        "temp_max": 12,
                        "pressure": 1000,
                        "humidity": 81
                    },
                    "visibility": 9000,
                    "wind": {
                        "speed": 5.1,
                        "deg": 160
                    },
                    "clouds": {
                        "all": 40
                    },
                    "dt": 1588169375,
                    "id": 2653941,
                    "name": "Cambridge"
                },
                {
                    "coord": {
                        "lon": -0.13,
                        "lat": 51.51
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588134919,
                        "sunset": 1588188006
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 11.71,
                        "feels_like": 7.81,
                        "temp_min": 11.67,
                        "temp_max": 12,
                        "pressure": 1000,
                        "humidity": 81
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 5.1,
                        "deg": 170
                    },
                    "clouds": {
                        "all": 75
                    },
                    "dt": 1588169376,
                    "id": 2643743,
                    "name": "London"
                },
                {
                    "coord": {
                        "lon": -2.36,
                        "lat": 51.38
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135476,
                        "sunset": 1588188519
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04d"
                        }
                    ],
                    "main": {
                        "temp": 12.67,
                        "feels_like": 9.71,
                        "temp_min": 12.22,
                        "temp_max": 13.33,
                        "pressure": 998,
                        "humidity": 67
                    },
                    "wind": {
                        "speed": 3.13,
                        "deg": 266
                    },
                    "clouds": {
                        "all": 100
                    },
                    "dt": 1588169374,
                    "id": 2656173,
                    "name": "Bath"
                },
                {
                    "coord": {
                        "lon": -1,
                        "lat": 52.67
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588134912,
                        "sunset": 1588188431
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 9.75,
                        "feels_like": 4.98,
                        "temp_min": 9.44,
                        "temp_max": 10,
                        "pressure": 998,
                        "humidity": 81
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 5.7,
                        "deg": 110
                    },
                    "clouds": {
                        "all": 75
                    },
                    "dt": 1588169505,
                    "id": 2644667,
                    "name": "Leicestershire"
                },
                {
                    "coord": {
                        "lon": -1.26,
                        "lat": 51.75
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135146,
                        "sunset": 1588188321
                    },
                    "weather": [
                        {
                            "id": 501,
                            "main": "Rain",
                            "description": "moderate rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 11.78,
                        "feels_like": 7.05,
                        "temp_min": 11.67,
                        "temp_max": 12,
                        "pressure": 998,
                        "humidity": 87
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 6.7,
                        "deg": 150
                    },
                    "clouds": {
                        "all": 75
                    },
                    "dt": 1588169376,
                    "id": 2640729,
                    "name": "Oxford"
                },
                {
                    "coord": {
                        "lon": -2.24,
                        "lat": 53.48
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135051,
                        "sunset": 1588188887
                    },
                    "weather": [
                        {
                            "id": 501,
                            "main": "Rain",
                            "description": "moderate rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 8.51,
                        "feels_like": 6.22,
                        "temp_min": 7.78,
                        "temp_max": 8.89,
                        "pressure": 997,
                        "humidity": 87
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 2.1,
                        "deg": 100
                    },
                    "clouds": {
                        "all": 100
                    },
                    "dt": 1588169376,
                    "id": 2643123,
                    "name": "Manchester"
                },
                {
                    "coord": {
                        "lon": -1.51,
                        "lat": 52.41
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135083,
                        "sunset": 1588188504
                    },
                    "weather": [
                        {
                            "id": 501,
                            "main": "Rain",
                            "description": "moderate rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 10.86,
                        "feels_like": 7.27,
                        "temp_min": 10,
                        "temp_max": 11.67,
                        "pressure": 997,
                        "humidity": 93
                    },
                    "visibility": 3700,
                    "wind": {
                        "speed": 5.1,
                        "deg": 120
                    },
                    "clouds": {
                        "all": 90
                    },
                    "dt": 1588169375,
                    "id": 2652221,
                    "name": "Coventry"
                },
                {
                    "coord": {
                        "lon": -3.53,
                        "lat": 50.72
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135873,
                        "sunset": 1588188683
                    },
                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02d"
                        }
                    ],
                    "main": {
                        "temp": 13.95,
                        "feels_like": 9.21,
                        "temp_min": 12.22,
                        "temp_max": 15,
                        "pressure": 999,
                        "humidity": 54
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 5.1,
                        "deg": 230
                    },
                    "clouds": {
                        "all": 20
                    },
                    "dt": 1588169375,
                    "id": 2649808,
                    "name": "Exeter"
                },
                {
                    "coord": {
                        "lon": -3.94,
                        "lat": 51.62
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135812,
                        "sunset": 1588188942
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04d"
                        }
                    ],
                    "main": {
                        "temp": 12.59,
                        "feels_like": 8.14,
                        "temp_min": 12,
                        "temp_max": 13.33,
                        "pressure": 998,
                        "humidity": 81
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 6.2,
                        "deg": 210
                    },
                    "clouds": {
                        "all": 100
                    },
                    "dt": 1588169377,
                    "id": 2636432,
                    "name": "Swansea"
                },
                {
                    "coord": {
                        "lon": -1.48,
                        "lat": 52.92
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588134979,
                        "sunset": 1588188594
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 9.87,
                        "feels_like": 5.13,
                        "temp_min": 8.89,
                        "temp_max": 10.56,
                        "pressure": 998,
                        "humidity": 81
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 5.7,
                        "deg": 110
                    },
                    "clouds": {
                        "all": 75
                    },
                    "dt": 1588169375,
                    "id": 2651347,
                    "name": "Derby"
                },
                {
                    "coord": {
                        "lon": -2.92,
                        "lat": 53.42
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135226,
                        "sunset": 1588189038
                    },
                    "weather": [
                        {
                            "id": 501,
                            "main": "Rain",
                            "description": "moderate rain",
                            "icon": "10d"
                        }
                    ],
                    "main": {
                        "temp": 10.72,
                        "feels_like": 4.67,
                        "temp_min": 9,
                        "temp_max": 11.67,
                        "pressure": 996,
                        "humidity": 87
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 8.2,
                        "deg": 110
                    },
                    "clouds": {
                        "all": 75
                    },
                    "dt": 1588169677,
                    "id": 3333167,
                    "name": "City and Borough of Liverpool"
                },
                {
                    "coord": {
                        "lon": -1.32,
                        "lat": 51.07
                    },
                    "sys": {
                        "country": "GB",
                        "timezone": 3600,
                        "sunrise": 1588135282,
                        "sunset": 1588188214
                    },
                    "weather": [
                        {
                            "id": 803,
                            "main": "Clouds",
                            "description": "broken clouds",
                            "icon": "04d"
                        }
                    ],
                    "main": {
                        "temp": 12.93,
                        "feels_like": 7.97,
                        "temp_min": 12.78,
                        "temp_max": 13.33,
                        "pressure": 1000,
                        "humidity": 76
                    },
                    "visibility": 10000,
                    "wind": {
                        "speed": 6.7,
                        "deg": 210
                    },
                    "clouds": {
                        "all": 75
                    },
                    "dt": 1588169377,
                    "id": 2633858,
                    "name": "Winchester"
                }
            ]
        });
    }
}

class GraphComponentMock extends GraphComponent {
    loadGraph(graphData: Array<GraphData>) {}
}