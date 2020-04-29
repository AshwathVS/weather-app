import { Component, OnInit, Input } from '@angular/core';
import { Chart } from 'chart.js';

export interface GraphData {
  city_name: string,
  temp: number
}

const backgroundColor = [
  'rgba(255, 99, 132, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(255, 206, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(255, 159, 64, 0.2)',
  'rgba(255, 99, 132, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(255, 206, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(255, 159, 64, 0.2)',
  'rgba(255, 99, 132, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(255, 206, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(255, 159, 64, 0.2)'
]

const borderColor = [
  'rgba(255,99,132,1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(255,99,132,1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(255,99,132,1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)'
]

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  // @Input() public parentData;

  chart: [];

  constructor() {}

  ngOnInit(): void {}

  loadGraph(graphData: Array<GraphData>) {
    if(graphData) {
      
      var median = this.calcmedian(graphData.map(a => a.temp)).toPrecision(4);

      this.chart = new Chart('canvas', {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Temperature in cities',
                data:  graphData.map(a => a.temp),
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
            }, 
            {
                label: 'Median - ' + median,
                type: 'line',
                data: graphData.map(a => median),
                fill: false,
                pointRadius: 0,
                borderColor: 'rgba(0, 0, 0, 0.7)',
                borderWidth: 1,
                pointHoverRadius: 0
            }],
            labels: graphData.map(a => a.city_name)
        }
    });
    }
  }

  calcmedian(values: number[]) : number {
    values.sort(function(a, b) {
      return a - b;
    });
    var mid = values.length / 2;
    return mid % 1 ? values[mid - 0.5] : (values[mid - 1] + values[mid]) / 2;
  }

}
