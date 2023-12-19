import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/pokemon-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) { }

  /* private readonly axios: AxiosInstance = axios; */

  async executeSeed() {

    await this.pokemonModel.deleteMany();// Delete * from pokemon;
    /* const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10')*/
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=20')

    /* 1. forma de insertar multiples registros simultaneamente */
    const pokemonToInsert: { name: string, no: number }[] = []

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      /* Esto lo hace es insertar en la DB uno por uno   */
      /*  const pokemon = await this.pokemonModel.create({ name, no }) */
      pokemonToInsert.push({ name, no })
    })

    await this.pokemonModel.insertMany(pokemonToInsert)

    return "Seed Executed";
  }
}
