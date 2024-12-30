import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataService, MapData } from '../../services/data.service';

@Component({
  selector: 'app-widgets',
  imports: [NgClass, NgIf, CommonModule],
  templateUrl: './widgets.component.html',
  styleUrl: './widgets.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetsComponent implements OnInit, OnChanges {

  data?: MapData;
  @Input() widgetData?: MapData;
  @Input() isSelected: boolean = false;
  @Output() cardClicked = new EventEmitter<any>();

  constructor(private dataService: DataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    
    
  }

  ngOnInit(): void {    
  }
  
  onCardClicked() {
    this.isSelected = !this.isSelected;
    this.dataService.setIsSelected(this.isSelected);
    this.cardClicked.emit();
  }
}
