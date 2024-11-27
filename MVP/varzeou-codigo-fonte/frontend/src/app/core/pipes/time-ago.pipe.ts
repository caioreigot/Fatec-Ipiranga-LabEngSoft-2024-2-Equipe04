import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: false /* Configuração para recalcular em cada mudança */
})
export class TimeAgoPipe implements PipeTransform {
  transform(dateString: string): string {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Alguns segundos atrás";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minuto${minutes > 1 ? "s" : ""} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hora${hours > 1 ? "s" : ""} atrás`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dia${days > 1 ? "s" : ""} atrás`;
    }
  }
}