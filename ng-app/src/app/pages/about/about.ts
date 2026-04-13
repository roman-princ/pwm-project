import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private readonly dataService = inject(DataService);
  protected readonly page$ = this.dataService.getPageContent('about');
}
