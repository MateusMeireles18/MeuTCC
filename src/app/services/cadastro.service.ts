import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type TipoItem = 'peca' | 'servico';
export type StatusOrcamento = 'Pendente' | 'Aprovado' | 'Concluido';

export interface ItemCadastro {
  nome: string;
  quantidade: number;
  preco: number;
  tipo?: TipoItem;
}

export interface Cadastro {
  id?: string;
  moto: string;
  placa?: string;
  cliente?: string;
  telefone?: string;
  status?: StatusOrcamento;
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

interface BudgetMetadata {
  placa?: string;
  cliente?: string;
  telefone?: string;
  status?: StatusOrcamento;
  itens: ItemCadastro[];
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
    let placa = '';
    let cliente = '';
    let telefone = '';
    let status: StatusOrcamento = 'Pendente';

    if (dto.description) {
      try {
        const parsed = JSON.parse(dto.description);
        if (Array.isArray(parsed)) {
          itens = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          placa = parsed.placa || '';
          cliente = parsed.cliente || '';
          telefone = parsed.telefone || '';
          status = parsed.status || 'Pendente';
          itens = Array.isArray(parsed.itens) ? parsed.itens : [];
        }
      } catch {
        itens = [{ nome: dto.description, quantidade: 1, preco: dto.amount, tipo: 'peca' }];
      }
    }

    if (itens.length === 0) {
      itens = [{ nome: dto.title, quantidade: 1, preco: dto.amount, tipo: 'peca' }];
    }

    itens = itens.map(i => ({
      nome: i.nome || '',
      quantidade: i.quantidade ?? 1,
      preco: i.preco ?? 0,
      tipo: i.tipo === 'servico' ? 'servico' : 'peca'
    }));

    return {
      id: dto.id,
      moto: dto.title,
      placa,
      cliente,
      telefone,
      status,
      itens
    };
  }

  private toApiDto(cadastro: Cadastro): BudgetApiDto {
    const totalAmount = cadastro.itens?.reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0) || 0;
    const metadata: BudgetMetadata = {
      placa: cadastro.placa?.trim() || '',
      cliente: cadastro.cliente?.trim() || '',
      telefone: cadastro.telefone?.trim() || '',
      status: cadastro.status || 'Pendente',
      itens: cadastro.itens || []
    };

    return {
      id: cadastro.id,
      title: cadastro.moto?.trim() || 'Sem Moto',
      description: JSON.stringify(metadata),
      amount: totalAmount
    };
  }
}
