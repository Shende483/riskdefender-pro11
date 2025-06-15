// schemas/rule.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true  })
export class Rule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  key: string;

  @Prop({
    required: true,
    enum: ['boolean', 'number', 'time', 'timerange', 'enum'],
  })
  type: string;

  @Prop({
    type: [String],
    required: function (this: Rule) {
      return this.type === 'enum';
    },
  })
  options?: string[];
}


export const RuleSchema = SchemaFactory.createForClass(Rule);
export type RuleDocument = Rule & Document;
