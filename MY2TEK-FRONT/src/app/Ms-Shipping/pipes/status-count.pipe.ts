import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusCount', standalone: false })
export class StatusCountPipe implements PipeTransform {
  transform(shipments: any[], status: string): number {
    if (!shipments) return 0;
    return shipments.filter(s => s.status === status).length;
  }
}
