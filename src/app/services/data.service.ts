import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type Battery = 'empty' | 'mid' | 'full';
export type Title = 'Çalışma Odası' | 'Salon' | 'Yatak Odası' | 'Mutfak' | '1 nolu kapı';

export class MapData {
  lat?: number;
  lng?: number;
  date?: Date;
  battery?: Battery;
  temp?: number;
  hum?: number;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  isSelected = new Subject<boolean>();
  selectedPin: MapData = {};

  selectedIndexSubject = new Subject<any>();
  mapData: MapData[] = [];

  constructor() { }

  setIsSelected(is: boolean) {
    this.isSelected.next(is);
  }
  getIsSelected() {
    return this.isSelected.asObservable();
  }

  setSelectedPin(pin: MapData) {
    this.selectedPin = pin;
  }
  getSelectedPin(): MapData {
    return this.selectedPin;
  }

  setSelectedIndex(i: any) {
    this.selectedIndexSubject.next(i);
  }

  get selectedIndex$() {
    return this.selectedIndexSubject.asObservable();
  }

  updateData(data: MapData, index: number) {
    this.mapData[index] = data;
    console.log(this.mapData);
  }

  getMapData() {
    return this.mapData;
  }

  generateData() {
    const locationLimit = {
      minLat: 37.0,
      maxLat: 40.0,
      minLng: 30.0,
      maxLng: 40.0
    };

    const randomBetween = (min: number, max: number): number =>
      Math.random() * (max - min) + min;

    const randomBattery = (): Battery => {
      const batteries: Battery[] = ['empty', 'mid', 'full'];
      return batteries[Math.floor(Math.random() * batteries.length)];
    };

    const randomTitle = (): Title => {
      const titles: Title[] = ['Çalışma Odası', 'Salon', 'Yatak Odası', 'Mutfak', '1 nolu kapı'];
      return titles[Math.floor(Math.random() * titles.length)];
    };

    const randomDate = (): Date => {
      const now = new Date();
      const past24Hours = now.getTime() - 24 * 60 * 60 * 1000;
      return new Date(randomBetween(past24Hours, now.getTime()));
    };

    for (let i = 0; i < 8; i++) {
      this.mapData.push({
        lat: randomBetween(locationLimit.minLat, locationLimit.maxLat),
        lng: randomBetween(locationLimit.minLng, locationLimit.maxLng),
        date: randomDate(),
        battery: randomBattery(),
        temp: Math.round(randomBetween(-5, 40)),
        hum: Math.round(randomBetween(0, 100)),
        title: randomTitle()
      });
    }
  }

}
