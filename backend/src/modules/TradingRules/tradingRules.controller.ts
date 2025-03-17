import {
       Controller,
       Get,
       Post,
       Body,
       Param,
       Put,
       Delete,
     } from '@nestjs/common';
     import { TradingRulesService } from './tradingRules.service';
     import { CreateTradingRulesDto, UpdateTradingRulesDto } from './dto/tradingRules.dto';
     import { TradingRules } from './tradingRules.schema';
     
     @Controller('trading-rules') // Base route for all endpoints in this controller
     export class TradingRulesController {
       constructor(private readonly tradingRulesService: TradingRulesService) {}
     
       // Create new trading rules
       @Post()
       async create(@Body() createTradingRulesDto: CreateTradingRulesDto): Promise<TradingRules> {
         return this.tradingRulesService.create(createTradingRulesDto);
       }
     
       // Get all trading rules
       @Get()
       async findAll(): Promise<TradingRules[]> {
         return this.tradingRulesService.findAll();
       }
     
       // Get trading rules by ID
       @Get(':id')
       async findOne(@Param('id') id: string): Promise<TradingRules> {
         return this.tradingRulesService.findOne(id);
       }
     
       // Update trading rules by ID
       @Put(':id')
       async update(
         @Param('id') id: string,
         @Body() updateTradingRulesDto: UpdateTradingRulesDto,
       ): Promise<TradingRules> {
         return this.tradingRulesService.update(id, updateTradingRulesDto);
       }
     
       // Delete trading rules by ID
       @Delete(':id')
       async delete(@Param('id') id: string): Promise<TradingRules> {
         return this.tradingRulesService.delete(id);
       }
     }