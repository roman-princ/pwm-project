import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  title = 'Erasmus Events - Las Palmas';
  subtitle = '';
  heading = 'About us';
  description = '';

  constructor(private readonly dataService: DataService) {}

  async ngOnInit(): Promise<void> {
    const content = await this.dataService.getPageContent('about');
    this.title = content['aboutTitle'] ?? this.title;
    this.subtitle = content['aboutSubtitle'] ?? this.subtitle;
    this.heading = content['aboutHeading'] ?? this.heading;
    this.description = content['aboutDescription'] ?? this.description;
  }
}
