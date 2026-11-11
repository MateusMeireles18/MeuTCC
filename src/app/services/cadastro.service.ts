import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

export interface ItemCadastro {
  nome: string;
  quantidade: number;
  preco: number;
}

export interface Cadastro {
  id?: string;
  moto: string;
  itens: ItemCadastro[];
}

export interface BudgetApiDto {
  id?: string;
  title: string;
  description?: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CadastroService {
  private get apiUrl(): string {
    return environment.apiUrl;
  }

  constructor(private http: HttpClient) {}

  listar(): Observable<Cadastro[]> {
    return this.http.get<BudgetApiDto[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.toCadastro(dto)))
    );
  }

  obter(id: string): Observable<Cadastro> {
    return this.http.get<BudgetApiDto>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.toCadastro(dto))
    );
  }

  adicionar(cadastro: Cadastro): Observable<Cadastro> {
    const payload = this.toApiDto(cadastro);
    return this.http.post<BudgetApiDto>(this.apiUrl, payload).pipe(
      map(dto => this.toCadastro(dto))
    );
  }

  atualizar(id: string, cadastro: Cadastro): Observable<void> {
    cadastro.id = id;
    const payload = this.toApiDto(cadastro);
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toCadastro(dto: BudgetApiDto): Cadastro {
    let itens: ItemCadastro[] = [];
    if (dto.description) {
      try {
        const parsed = JSON.parse(dto.description);
        if (Array.isArray(parsed)) {
          itens = parsed;
        }
      } catch {
        itens = [{ nome: dto.description, quantidade: 1, preco: dto.amount }];
      }
    }
    if (itens.length === 0) {
      itens = [{ nome: dto.title, quantidade: 1, preco: dto.amount }];
    }

    return {
      id: dto.id,
      moto: dto.title,
      itens
    };
  }

  private toApiDto(cadastro: Cadastro): BudgetApiDto {
    const totalAmount = cadastro.itens?.reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0) || 0;
    return {
      id: cadastro.id,
      title: cadastro.moto?.trim() || 'Sem Moto',
      description: JSON.stringify(cadastro.itens || []),
      amount: totalAmount
    };
  }
}