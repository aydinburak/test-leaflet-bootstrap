import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { WidgetsComponent } from "../widgets/widgets.component";
import { NgClass, NgFor, NgIf } from '@angular/common';
import { DataService, MapData } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wrapper',
  imports: [MapComponent, WidgetsComponent, NgFor, FormsModule],
  templateUrl: './wrapper.component.html',
  styleUrl: './wrapper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrapperComponent implements OnInit {

  searchQuery: string = '';
  selectedCardIndex: number = -1;
  mapData?: MapData[];

  constructor(private dataService: DataService) { }


  ngOnInit(): void {
    this.mapData = this.dataService.mapData;

    this.dataService.selectedIndex$.subscribe(i => {
      this.selectedCardIndex = i;
      this.onClickedCard(i);
    })
  }

  onClickedCard(i: number) {
    this.selectedCardIndex = i;
  }

  get filteredData() {
    return this.searchQuery !== '' ? this.mapData?.filter(i => {
      i.title?.toLowerCase().includes(this.searchQuery.toLowerCase())
    }) : this.mapData;
  }

}
