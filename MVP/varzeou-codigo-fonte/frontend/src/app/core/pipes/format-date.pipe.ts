import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    const date = new Date(value);

    // Extrai horas e minutos
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Extrai dia, mês e ano
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês começa do zero
    const year = date.getFullYear();

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
