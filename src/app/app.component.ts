import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { WrapperComponent } from './components/wrapper/wrapper.component';
import { MapComponent } from './components/map/map.component';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, WrapperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private dataService: DataService) {}
  
  ngOnInit(): void {
    this.dataService.generateData();
  }
  
}
