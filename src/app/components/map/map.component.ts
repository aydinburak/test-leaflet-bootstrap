import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges, type OnInit } from '@angular/core';
import { Battery, DataService, MapData } from '../../services/data.service';
import { Marker } from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnChanges {

  @Input() selectedIndex: number = -1;
  mapData: MapData[] = [];
  private map: any;
  centerOfMap = [39.896600, 32.775087];
  private pinIcon: any;
  private batteryIcons: { [key in Battery]: any } = {} as any;
  markers: Marker[] = [];

  openPopupIndex: number = -1;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private dataService: DataService) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedIndex'] && this.selectedIndex >= 0) {
      this.focusOnMarker(this.selectedIndex);
    }
  }


  async ngOnInit(): Promise<void> {
    this.mapData = this.dataService.mapData;
    console.log(this.mapData);

    if (isPlatformBrowser(this.platformId)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(link);

      const L = await import('leaflet');
      this.loadIcons(L);
      this.initMap(L);

    }


    this.dataService.getIsSelected().subscribe(res => {
      this.updateMapOnCardClick(res);
    })
  }

  updateMapOnCardClick(isSelected: boolean) {
    console.log(isSelected);
    console.log(this.openPopupIndex);

    if (isSelected && this.openPopupIndex === -1) {
      const marker = this.markers[this.selectedIndex];
      if (marker) {
        this.openPopupIndex = this.selectedIndex;
        marker.openPopup();
      }
    } else if (isSelected && this.openPopupIndex !== -1 && this.openPopupIndex !== this.selectedIndex) {
      if (this.markers[this.openPopupIndex]) {
        this.markers[this.openPopupIndex].closePopup();
      }
      this.openPopupIndex = this.selectedIndex;
      const newMarker = this.markers[this.selectedIndex];
      if (newMarker) {
        newMarker.openPopup();
      }
    } else if (!isSelected && this.openPopupIndex !== -1) {
      const marker = this.markers[this.openPopupIndex];
      if (marker) {
        marker.closePopup();
        this.openPopupIndex = -1;
      }
    }
  }

  focusOnMarker(index: number): void {
    this.openPopupIndex = index;
    const marker = this.markers[index];
    if (marker) {
      this.map?.setView(marker.getLatLng(), 8, { animate: true });
      marker.openPopup();
    }
  }

  private loadIcons(L: any): void {
    this.pinIcon = L.icon({
      iconUrl: 'pin.svg',
      iconSize: [64, 64],
      iconAnchor: [16, 32],
    });

    this.batteryIcons.empty = 'battery-empty.svg';
    this.batteryIcons.mid = 'battery-mid.svg';
    this.batteryIcons.full = 'battery-full.svg';
  }

  private initMap(L: any): void {
    this.map = L.map('map').setView(this.centerOfMap, 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.mapData.forEach((element, index) => {
      const marker = L.marker([element.lat, element.lng], { icon: this.pinIcon }).addTo(this.map);
      this.markers.push(marker);

      marker.options.data = element;

      marker.bindPopup(this.createPopupContent(marker, element, index, L), {
        offset: [-135, 210],
        closeButton: false,
        minWidth: 300
      });

      marker.on('click', (event: any) => {
        this.openPopupIndex = index;
        this.handlePinClick(event, marker, element, index, L);
      });

      marker.on('popupclose', () => {
        this.openPopupIndex = -1;
      })
    });
  }


  handlePinClick(event: any, marker: any, selectedPinData: MapData, index: number, L: any) {
    this.dataService.setSelectedIndex(index);
  }


  private createPopupContent(marker: any, data: MapData, index: number, L: any): HTMLElement {
    const popupContent = document.createElement('div');

    popupContent.innerHTML = `
      <div id="popup-${index}" class="card border-0">
        <div class="card-body p-0">
          <div class="d-flex justify-content-between align-items-center">
            <div>
                <h5 class="card-title">Nem ve Sıcaklık Sensörü</h5>
                <h6 class="card-subtitle mb-2 text-muted">${data.title}</h6>
            </div>
          </div>
  

            <div class="d-flex flex-column gap-2 mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div id="temp-info-${index}" class="d-flex flex-row gap-3">
                  <img src="temp.svg" alt="Temperature" width="24" height="31" />
                  <div class="fs-5">
                    ${data.temp} °C
                  </div>
                </div>
                <button class="btn text-primary w-auto" style="background-color: #F2F9FF; min-width: 150px" id="temp-btn-${index}">
                  <b>Sıcaklık</b> Ayarla
                </button>
              </div>
            </div>
  
            <div id="hum-info-${index}" class="d-flex flex-column gap-2 mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex flex-row gap-3">
                  <img src="hum.svg" alt="Humidity" width="24" height="26" />
                  <div class="fs-5">${data.hum} %</div>
                </div>
                <button class="btn text-primary w-auto" style="background-color: #F2F9FF; min-width: 150px" id="hum-btn-${index}"><b>Nem</b> Ayarla</button>
              </div>
            </div>

        </div>
      </div>
    `;

    popupContent.querySelector(`#temp-btn-${index}`)?.addEventListener('click', (event) => {
      event.stopPropagation();

      const popup = popupContent.querySelector(`#popup-${index}`) as HTMLElement;
      if (popup) {
        popup.innerHTML = `
            <div class="card-body p-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">Sıcaklık Ayarla</h5>
                  <h6 class="card-subtitle mb-2 text-muted">${data.title}</h6>
                </div>
              </div>
  
              <div class="d-flex justify-content-around align-items-center">
                <div class="h6">Mevcut</div>
                <div class="h6">Yeni</div>
              </div>
              

            <div class="d-flex flex-column gap-2 mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div id="temp-info-${index}" class="d-flex flex-row gap-3">
                  <img src="temp.svg" alt="Temperature" width="24" height="31" />
                  <div class="fs-5">
                    ${data.temp} °C
                  </div>
                </div>
                <input class="form-control w-50" type="number" id="new-temp-${index}" value="${data.temp}">
              </div>
            </div>
  
            <div class="d-flex justify-content-between align-items-center">
              <button id="cancel-temp-${index}" class="btn bg-white text-primary border border-primary" style=" width: 120px;">İptal Et</button>
              <button id="confirm-temp-${index}" class="btn text-white" style="background-color: #007DFC; width: 120px;">Güncelle</button>
          </div>

        </div>
        `;


        popupContent.querySelector(`#cancel-temp-${index}`)?.addEventListener('click', (event) => {
          event.stopPropagation();
          this.updatePopup(marker, data, index, L);
        });

        popupContent.querySelector(`#confirm-temp-${index}`)?.addEventListener('click', (event) => {
          event.stopPropagation();
          const newTempInput = popupContent.querySelector(`#new-temp-${index}`) as HTMLInputElement;
          if (newTempInput) {
            this.dataService.updateData(data, index);
            data.temp = parseFloat(newTempInput.value) || data.temp;
            this.updatePopup(marker, data, index, L);
          }
        });
      }
    });

    popupContent.querySelector(`#hum-btn-${index}`)?.addEventListener('click', (event) => {
      event.stopPropagation();

      const popup = popupContent.querySelector(`#popup-${index}`) as HTMLElement;
      if (popup) {
        popup.innerHTML = `
            <div class="card-body p-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="card-title">Nem Ayarla</h5>
                  <h6 class="card-subtitle mb-2 text-muted">${data.title}</h6>
                </div>
              </div>
  
              <div class="d-flex justify-content-around align-items-center">
                <div class="h6">Mevcut</div>
                <div class="h6">Yeni</div>
              </div>
              

            <div class="d-flex flex-column gap-2 mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div id="hum-info-${index}" class="d-flex flex-row gap-3">
                  <img src="hum.svg" alt="Humidity" width="24" height="31" />
                  <div class="fs-5">
                    ${data.hum} %
                  </div>
                </div>
                <input class="form-control w-50" type="number" id="new-hum-${index}" value="${data.hum}">
              </div>
            </div>
  
            <div class="d-flex justify-content-between align-items-center">
              <button id="cancel-hum-${index}" class="btn bg-white text-primary border border-primary" style=" width: 120px;">İptal Et</button>
              <button id="confirm-hum-${index}" class="btn text-white" style="background-color: #007DFC; width: 120px;">Güncelle</button>
          </div>

        </div>
        `;
        popupContent.querySelector(`#cancel-hum-${index}`)?.addEventListener('click', (event) => {
          event.stopPropagation();
          this.updatePopup(marker, data, index, L);
        });

        popupContent.querySelector(`#confirm-hum-${index}`)?.addEventListener('click', (event) => {
          event.stopPropagation();
          const newHumInput = popupContent.querySelector(`#new-hum-${index}`) as HTMLInputElement;
          if (newHumInput) {
            this.dataService.updateData(data, index);
            data.hum = Math.min(Math.max(parseFloat(newHumInput.value), 0), 100) || data.hum; // Update with new value (bounded 0-100)
            this.updatePopup(marker, data, index, L);
          }
        });
      }
    });

    return popupContent;
  }


  changeTemp(index: number, L: any): void {
    console.log("change temp tıklandı");
    this.mapData[index].temp = (this.mapData[index].temp ?? 0) + 1;
    this.updatePopup(this.markers[index], this.mapData[index], index, L);
  }

  changeHum(index: number, L: any): void {
    this.mapData[index].hum = Math.min((this.mapData[index].hum ?? 0) + 5, 100);
    this.updatePopup(this.markers[index], this.mapData[index], index, L);
  }


  private updatePopup(marker: any, data: MapData, index: number, L: any): void {
    marker.setPopupContent(this.createPopupContent(marker, data, index, L));
  }

}
