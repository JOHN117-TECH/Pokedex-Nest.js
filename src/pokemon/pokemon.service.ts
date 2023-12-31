import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService

  ) {

    this.defaultLimit = configService.get<number>('defaultLimit');

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (err) {
      this.handleExceptions(err);
    }
  }

  async findAll(PaginationDto: PaginationDto) {

    const { limit = this.defaultLimit, offset = 0, search = "" } = PaginationDto;
    let pokemon: Pokemon;

    if (search.length >= 1) {
      if (!isNaN(+search)) {
        const pokemons = await this.pokemonModel.find({ no: search }).exec();
        return pokemons;
      } else {
        if (isValidObjectId(search)) {
          pokemon = await this.pokemonModel.findById(search);
          return pokemon;
        } else {
          const regex = new RegExp(search, 'i'); // 'i' hace que la búsqueda sea insensible a mayúsculas y minúsculas
          const pokemons = await this.pokemonModel.find({ name: { $regex: regex } }).exec();
          return pokemons;

        }
      }
    }

    return this.pokemonModel.find().limit(limit).skip(offset).sort({ no: 1 });

  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    //MongooID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    //Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(id);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto)
    } catch (err) {
      this.handleExceptions(err);
    }
    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {

    /*  const pokemon = await this.findOne(id);
     await pokemon.deleteOne(); */

    const result = await this.pokemonModel.deleteOne({ _id: id });

    if (result.deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`);

    return;

  }

  private handleExceptions(err: any) {
    if (err.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(err.keyValue)}`)
    }
    console.log(err)
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);

  }
}
